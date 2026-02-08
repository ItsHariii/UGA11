-- ============================================
-- MESSAGING SYSTEM MIGRATION
-- ============================================
-- This migration adds proper messaging support with conversations
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. DROP OLD MESSAGES TABLE (if exists)
-- ============================================
DROP TABLE IF EXISTS messages CASCADE;

-- ============================================
-- 2. CREATE CONVERSATIONS TABLE
-- ============================================
-- Tracks conversations between two users about a specific post/interest

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Related interest (one conversation per interest)
  interest_id UUID NOT NULL UNIQUE REFERENCES interests(id) ON DELETE CASCADE,
  
  -- Related post
  post_id UUID NOT NULL REFERENCES share_posts(id) ON DELETE CASCADE,
  
  -- Participants (the two users in the conversation)
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT unique_conversation UNIQUE(interest_id)
);

-- Indexes for performance
CREATE INDEX idx_conversations_interest ON conversations(interest_id);
CREATE INDEX idx_conversations_post ON conversations(post_id);
CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_updated ON conversations(last_message_at DESC);

-- Composite index for finding conversations by user
CREATE INDEX idx_conversations_by_user ON conversations(user1_id, user2_id);

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create conversations (when expressing interest)
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- 3. CREATE MESSAGES TABLE
-- ============================================
-- Stores individual messages within conversations

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conversation reference
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Sender information
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_identifier TEXT NOT NULL, -- For display (e.g., "Neighbor-A3F9")
  
  -- Message content
  message_text TEXT NOT NULL,
  
  -- Read status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT message_not_empty CHECK (char_length(trim(message_text)) > 0),
  CONSTRAINT message_max_length CHECK (char_length(message_text) <= 1000)
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = FALSE;

-- Composite index for conversation messages ordered by time
CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, created_at DESC);

-- Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

-- Users can mark messages as read in their conversations
CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update conversation's last_message_at when a message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to auto-create conversation when interest is created
CREATE OR REPLACE FUNCTION create_conversation_for_interest()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO post_author_id
  FROM share_posts
  WHERE id = NEW.post_id;
  
  -- Create conversation between interested user and post author
  INSERT INTO conversations (
    interest_id,
    post_id,
    user1_id,
    user2_id
  ) VALUES (
    NEW.id,
    NEW.post_id,
    NEW.interested_user_id,
    post_author_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create conversation when interest is created
CREATE TRIGGER create_conversation_on_interest
  AFTER INSERT ON interests
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_for_interest();

-- ============================================
-- 5. ENABLE REALTIME
-- ============================================
-- Enable realtime subscriptions for live messaging

ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================
-- 6. HELPER VIEWS (Optional)
-- ============================================

-- View to get conversation list with last message preview
CREATE OR REPLACE VIEW conversation_list AS
SELECT 
  c.id,
  c.interest_id,
  c.post_id,
  c.user1_id,
  c.user2_id,
  c.created_at,
  c.last_message_at,
  sp.title AS post_title,
  sp.author_identifier AS post_author_identifier,
  i.interested_user_identifier,
  i.status AS interest_status,
  (
    SELECT COUNT(*)
    FROM messages m
    WHERE m.conversation_id = c.id
    AND m.is_read = FALSE
    AND m.sender_id != auth.uid()
  ) AS unread_count,
  (
    SELECT m.message_text
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) AS last_message_text,
  (
    SELECT m.created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) AS last_message_time
FROM conversations c
JOIN share_posts sp ON c.post_id = sp.id
JOIN interests i ON c.interest_id = i.id
WHERE c.user1_id = auth.uid() OR c.user2_id = auth.uid()
ORDER BY c.last_message_at DESC;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- 
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify tables are created
-- 3. Test with sample data
-- 4. Update app code to use new messaging system
--
-- ============================================
