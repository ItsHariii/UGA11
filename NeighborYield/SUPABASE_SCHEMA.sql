-- ============================================
-- NeighborYield Supabase Database Schema
-- ============================================
-- This schema supports a hybrid mesh/cloud food sharing app
-- with offline-first capabilities and peer-to-peer sync

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Stores user profile information
-- Note: Supabase Auth handles authentication, this extends the profile

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile Information
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  neighborhood TEXT,
  
  -- Mesh Network Identity
  user_identifier TEXT UNIQUE NOT NULL, -- e.g., "Neighbor-A3F9" for privacy
  
  -- Location (optional, for general area mapping)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy TEXT, -- 'neighborhood', 'city', 'region'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_user_identifier ON users(user_identifier);
CREATE INDEX idx_users_neighborhood ON users(neighborhood);
CREATE INDEX idx_users_last_seen ON users(last_seen_at);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (for community visibility)
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 2. SHARE_POSTS TABLE
-- ============================================
-- Stores food sharing posts (both cloud and synced from mesh)

CREATE TABLE share_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Author Information
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_identifier TEXT NOT NULL, -- For privacy in mesh network
  
  -- Post Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Risk/Priority System
  risk_tier TEXT NOT NULL CHECK (risk_tier IN ('high', 'medium', 'low')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Source tracking (cloud vs mesh-synced)
  source TEXT NOT NULL CHECK (source IN ('local', 'supabase')),
  
  -- Location (optional, approximate for privacy)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ,
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_share_posts_author ON share_posts(author_id);
CREATE INDEX idx_share_posts_risk_tier ON share_posts(risk_tier);
CREATE INDEX idx_share_posts_expires_at ON share_posts(expires_at);
CREATE INDEX idx_share_posts_created_at ON share_posts(created_at DESC);
CREATE INDEX idx_share_posts_active ON share_posts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_share_posts_location ON share_posts USING GIST (
  ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Row Level Security
ALTER TABLE share_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view active posts
CREATE POLICY "Anyone can view active posts"
  ON share_posts FOR SELECT
  USING (is_active = TRUE AND expires_at > NOW());

-- Users can create their own posts
CREATE POLICY "Users can create posts"
  ON share_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON share_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON share_posts FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 3. INTERESTS TABLE
-- ============================================
-- Tracks when users express interest in a post

CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Post reference
  post_id UUID NOT NULL REFERENCES share_posts(id) ON DELETE CASCADE,
  
  -- Interested user
  interested_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interested_user_identifier TEXT NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  
  -- Response details
  response_message TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Source tracking
  source TEXT NOT NULL CHECK (source IN ('local', 'supabase')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate interests
  UNIQUE(post_id, interested_user_id)
);

-- Indexes
CREATE INDEX idx_interests_post ON interests(post_id);
CREATE INDEX idx_interests_user ON interests(interested_user_id);
CREATE INDEX idx_interests_status ON interests(status);
CREATE INDEX idx_interests_created ON interests(created_at DESC);

-- Row Level Security
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- Users can view interests on their own posts
CREATE POLICY "Users can view interests on own posts"
  ON interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM share_posts
      WHERE share_posts.id = interests.post_id
      AND share_posts.author_id = auth.uid()
    )
    OR interested_user_id = auth.uid()
  );

-- Users can create interests
CREATE POLICY "Users can create interests"
  ON interests FOR INSERT
  WITH CHECK (auth.uid() = interested_user_id);

-- Post authors can update interest status (accept/decline)
CREATE POLICY "Post authors can update interests"
  ON interests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM share_posts
      WHERE share_posts.id = interests.post_id
      AND share_posts.author_id = auth.uid()
    )
  );

-- ============================================
-- 4. CONVERSATIONS TABLE
-- ============================================
-- Tracks conversations between two users about a specific post/interest
-- One conversation is created per interest

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
-- 5. MESSAGES TABLE
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
-- 6. PEER_ACTIVITY TABLE
-- ============================================
-- Tracks mesh network peer activity for analytics

CREATE TABLE peer_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Peer information
  endpoint_id TEXT NOT NULL,
  signal_strength INTEGER,
  
  -- Activity
  activity_type TEXT NOT NULL CHECK (activity_type IN ('discovered', 'heartbeat', 'disconnected')),
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_peer_activity_user ON peer_activity(user_id);
CREATE INDEX idx_peer_activity_created ON peer_activity(created_at DESC);

-- Row Level Security
ALTER TABLE peer_activity ENABLE ROW LEVEL SECURITY;

-- Users can only view their own peer activity
CREATE POLICY "Users can view own peer activity"
  ON peer_activity FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own peer activity
CREATE POLICY "Users can insert peer activity"
  ON peer_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_share_posts_updated_at
  BEFORE UPDATE ON share_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interests_updated_at
  BEFORE UPDATE ON interests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-expire old posts
CREATE OR REPLACE FUNCTION expire_old_posts()
RETURNS void AS $$
BEGIN
  UPDATE share_posts
  SET is_active = FALSE
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique user identifier
CREATE OR REPLACE FUNCTION generate_user_identifier()
RETURNS TEXT AS $$
DECLARE
  identifier TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate format: Neighbor-XXXX (4 random alphanumeric chars)
    identifier := 'Neighbor-' || upper(substring(md5(random()::text) from 1 for 4));
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM users WHERE user_identifier = identifier) INTO exists_check;
    
    -- If unique, return it
    IF NOT exists_check THEN
      RETURN identifier;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. REALTIME SUBSCRIPTIONS
-- ============================================
-- Enable realtime for tables that need live updates

ALTER PUBLICATION supabase_realtime ADD TABLE share_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE interests;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================
-- 8. STORAGE BUCKETS (Optional - for future images)
-- ============================================
-- For post images, user avatars, etc.

-- Run this in Supabase Dashboard > Storage:
-- CREATE BUCKET post_images (public: true)
-- CREATE BUCKET avatars (public: true)

-- ============================================
-- NOTES FOR IMPLEMENTATION
-- ============================================
-- 
-- 1. Supabase Auth Setup:
--    - Enable Email/Password authentication
--    - Configure email templates
--    - Set up password requirements
--
-- 2. Environment Variables (.env):
--    SUPABASE_URL=your-project-url
--    SUPABASE_ANON_KEY=your-anon-key
--
-- 3. Install Supabase Client:
--    npm install @supabase/supabase-js
--
-- 4. Scheduled Jobs (via Supabase Dashboard > Database > Cron):
--    - Run expire_old_posts() every 5 minutes
--    SELECT cron.schedule('expire-posts', '*/5 * * * *', 'SELECT expire_old_posts()');
--
-- 5. Indexes:
--    - Monitor query performance
--    - Add additional indexes as needed based on usage patterns
--
-- 6. Backup Strategy:
--    - Enable Point-in-Time Recovery (PITR)
--    - Set up regular backups
--
-- ============================================


-- ============================================
-- MESSAGING SYSTEM FUNCTIONS & TRIGGERS
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
-- MESSAGING REALTIME SUBSCRIPTIONS
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
-- messages table already added in section 7

-- ============================================
-- HELPER VIEWS FOR MESSAGING
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
