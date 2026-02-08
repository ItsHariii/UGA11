# Messaging System Setup Guide 💬

## Overview

The messaging system allows users to chat about food shares. When someone clicks "I'm Interested", a conversation is automatically created.

---

## Database Structure

### Tables Created

1. **`conversations`** - Tracks chat conversations
   - One conversation per interest
   - Links two users (interested user + post author)
   - Tracks last message time for sorting

2. **`messages`** - Stores individual messages
   - Belongs to a conversation
   - Has sender info and message text
   - Tracks read status
   - Max 1000 characters per message

### Automatic Features

✅ **Auto-create conversation** - When user expresses interest, conversation is created automatically  
✅ **Auto-update timestamps** - Last message time updates automatically  
✅ **Real-time sync** - Messages appear instantly via Supabase Realtime  
✅ **Read receipts** - Track which messages have been read  
✅ **Unread counts** - See how many unread messages in each conversation  

---

## Setup Instructions

### Step 1: Run the Migration

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project: `jmhqkbgygoxlvxokdajv`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `messaging-tables-migration.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 2: Verify Tables

Check that tables were created:

```sql
-- Run this in SQL Editor to verify
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages');
```

You should see both tables listed.

### Step 3: Test with Sample Data

```sql
-- This will happen automatically when users express interest
-- But you can test manually:

-- 1. Find an existing interest
SELECT id, post_id, interested_user_id 
FROM interests 
LIMIT 1;

-- 2. Check if conversation was created
SELECT * FROM conversations 
WHERE interest_id = '<interest-id-from-above>';

-- 3. Send a test message
INSERT INTO messages (
  conversation_id,
  sender_id,
  sender_identifier,
  message_text
) VALUES (
  '<conversation-id-from-above>',
  '<your-user-id>',
  'Neighbor-TEST',
  'Hello! Is this still available?'
);

-- 4. View messages
SELECT * FROM messages 
WHERE conversation_id = '<conversation-id>';
```

---

## How It Works

### Flow Diagram

```
User clicks "I'm Interested"
  ↓
Interest record created in database
  ↓
Trigger fires: create_conversation_for_interest()
  ↓
Conversation automatically created
  ↓
User can now send messages
  ↓
Messages appear in real-time for both users
```

### Example Data

**Conversations Table:**
```
id                  | interest_id | post_id | user1_id | user2_id | last_message_at
--------------------|-------------|---------|----------|----------|----------------
abc-123-def-456     | int-789     | post-1  | user-A   | user-B   | 2026-02-07 21:30
```

**Messages Table:**
```
id          | conversation_id | sender_id | sender_identifier | message_text           | created_at
------------|-----------------|-----------|-------------------|------------------------|------------
msg-1       | abc-123-def-456 | user-A    | Neighbor-A3F9     | "Is this available?"   | 21:30:00
msg-2       | abc-123-def-456 | user-B    | Neighbor-B7C2     | "Yes, come pick it up!"| 21:31:00
```

---

## Security (Row Level Security)

All tables have RLS enabled:

✅ Users can only view their own conversations  
✅ Users can only send messages in their conversations  
✅ Users can only mark messages as read in their conversations  
✅ No one can see other people's private chats  

---

## Real-time Subscriptions

The app will subscribe to:

1. **New conversations** - Know when someone is interested
2. **New messages** - Messages appear instantly
3. **Message updates** - See when messages are read

---

## Next Steps

After running the migration:

1. ✅ Tables are created
2. ✅ Triggers are set up
3. ✅ Real-time is enabled
4. 🔨 Build the UI components (message modal, chat screen, conversation list)
5. 🔨 Create messaging service functions
6. 🔨 Integrate with the app

---

## Troubleshooting

### "Table already exists" error
If you see this error, the tables might already exist. You can:
- Drop the old tables first (see migration script)
- Or skip to Step 2 to verify

### "Permission denied" error
Make sure you're logged into Supabase dashboard with the correct account.

### "Function already exists" error
This is fine - it means the function was already created. The migration will replace it.

### Test the trigger
```sql
-- Insert a test interest and check if conversation is created
INSERT INTO interests (post_id, interested_user_id, interested_user_identifier, source, status)
VALUES (
  '<existing-post-id>',
  '<your-user-id>',
  'Neighbor-TEST',
  'supabase',
  'pending'
);

-- Check if conversation was auto-created
SELECT * FROM conversations 
WHERE interest_id = (SELECT id FROM interests ORDER BY created_at DESC LIMIT 1);
```

---

## Database Schema Summary

```
users
  ↓
interests ←→ conversations ←→ messages
  ↓              ↓
share_posts      (auto-created)
```

**Relationships:**
- Each interest creates one conversation
- Each conversation has many messages
- Each message belongs to one conversation
- Each conversation links two users

---

## Ready to Build!

Once the migration is complete, you're ready to:
1. Create messaging UI components
2. Build the messaging service
3. Integrate with the interest flow

The database is all set up and ready to go! 🎉
