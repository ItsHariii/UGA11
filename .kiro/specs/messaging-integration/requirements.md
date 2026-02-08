# Requirements Document

## Introduction

This document specifies the requirements for integrating a real-time messaging system into the NeighborYield mobile application. The messaging system enables users to communicate about posts after expressing interest, leveraging existing Supabase infrastructure for data storage and real-time updates.

## Glossary

- **User**: An authenticated person using the NeighborYield application
- **Conversation**: A messaging thread between two users about a specific post
- **Message**: A text communication sent by one user to another within a conversation
- **Messaging_Service**: The service layer that handles all messaging operations and real-time subscriptions
- **Messages_Tab**: The main screen displaying all conversations for the logged-in user
- **Chat_Screen**: The screen displaying messages within a specific conversation
- **Interest_Flow**: The process where a user expresses interest in a post, creating a conversation
- **Supabase_Client**: The existing database and real-time connection client
- **Unread_Count**: The number of messages in a conversation that have not been marked as read
- **Sender_Identifier**: An anonymized identifier for the message sender (e.g., "Neighbor-A3F9")

## Requirements

### Requirement 1: Display Conversations List

**User Story:** As a user, I want to see all my conversations in the Messages tab, so that I can quickly access ongoing discussions about posts.

#### Acceptance Criteria

1. WHEN a user opens the Messages tab, THE Messages_Tab SHALL display all conversations where the user is a participant
2. WHEN displaying a conversation, THE Messages_Tab SHALL show the post title associated with that conversation
3. WHEN displaying a conversation, THE Messages_Tab SHALL show the other user's sender identifier
4. WHEN displaying a conversation, THE Messages_Tab SHALL show a preview of the last message text
5. WHEN displaying a conversation, THE Messages_Tab SHALL show the timestamp of the last message
6. WHEN a conversation has unread messages, THE Messages_Tab SHALL display an unread count badge
7. THE Messages_Tab SHALL sort conversations by most recent activity with newest first
8. WHEN no conversations exist, THE Messages_Tab SHALL display an empty state message

### Requirement 2: Display and Send Messages

**User Story:** As a user, I want to view and send messages in a conversation, so that I can communicate with other users about posts.

#### Acceptance Criteria

1. WHEN a user opens a conversation, THE Chat_Screen SHALL display all messages in chronological order
2. WHEN displaying a message, THE Chat_Screen SHALL show the sender identifier for each message
3. WHEN displaying a message, THE Chat_Screen SHALL show the timestamp for each message
4. THE Chat_Screen SHALL provide a message input field at the bottom of the screen
5. THE Chat_Screen SHALL provide a send button adjacent to the input field
6. WHEN a user types a message and presses send, THE Chat_Screen SHALL create a new message in the conversation
7. WHEN new messages are added, THE Chat_Screen SHALL automatically scroll to the latest message
8. WHEN a conversation has no messages, THE Chat_Screen SHALL display an empty state message

### Requirement 3: Mark Messages as Read

**User Story:** As a user, I want messages to be marked as read when I view them, so that I can track which conversations need my attention.

#### Acceptance Criteria

1. WHEN a user opens a conversation, THE Chat_Screen SHALL mark all unread messages in that conversation as read
2. WHEN messages are marked as read, THE Messaging_Service SHALL update the is_read field to true
3. WHEN messages are marked as read, THE Messages_Tab SHALL update the unread count badge to reflect the change

### Requirement 4: Real-time Message Updates

**User Story:** As a user, I want to see new messages instantly without refreshing, so that I can have fluid conversations.

#### Acceptance Criteria

1. WHEN a new message is sent to a conversation the user is viewing, THE Chat_Screen SHALL display the new message immediately
2. WHEN a new message is sent to any conversation the user participates in, THE Messages_Tab SHALL update the conversation list immediately
3. WHEN a new message arrives, THE Messages_Tab SHALL update the last message preview and timestamp
4. WHEN a new message arrives in a conversation the user is not viewing, THE Messages_Tab SHALL increment the unread count badge
5. THE Messaging_Service SHALL subscribe to real-time updates using Supabase Realtime
6. WHEN the user navigates away from the Chat_Screen, THE Messaging_Service SHALL maintain the real-time subscription for conversation list updates
7. WHEN the user closes the app, THE Messaging_Service SHALL unsubscribe from all real-time channels

### Requirement 5: Messaging Service Layer

**User Story:** As a developer, I want a service layer for messaging operations, so that the implementation is maintainable and follows existing patterns.

#### Acceptance Criteria

1. THE Messaging_Service SHALL provide a function to fetch all conversations for a user
2. THE Messaging_Service SHALL provide a function to fetch all messages for a conversation
3. THE Messaging_Service SHALL provide a function to send a new message
4. THE Messaging_Service SHALL provide a function to mark messages as read
5. THE Messaging_Service SHALL provide a function to subscribe to real-time message updates for a conversation
6. THE Messaging_Service SHALL provide a function to subscribe to real-time conversation list updates
7. THE Messaging_Service SHALL use the existing Supabase_Client from the codebase
8. THE Messaging_Service SHALL follow the same patterns as existing service files
9. THE Messaging_Service SHALL use TypeScript with proper type definitions

### Requirement 6: Integration with Interest Flow

**User Story:** As a user, I want to optionally send a message when expressing interest, so that I can immediately communicate my intent.

#### Acceptance Criteria

1. WHEN a user expresses interest in a post, THE Interest_Flow SHALL create a conversation if one does not exist
2. WHEN a conversation is created from interest, THE Interest_Flow SHALL optionally allow the user to send an initial message
3. WHEN a user sends an initial message during interest expression, THE Interest_Flow SHALL navigate to the Chat_Screen for that conversation
4. WHEN a user expresses interest without sending a message, THE Interest_Flow SHALL complete normally without navigation to Chat_Screen

### Requirement 7: Data Persistence and Retrieval

**User Story:** As a user, I want my messages to be stored reliably, so that I can access conversation history at any time.

#### Acceptance Criteria

1. WHEN a message is sent, THE Messaging_Service SHALL store it in the messages table with conversation_id, sender_id, sender_identifier, message_text, and created_at
2. WHEN fetching conversations, THE Messaging_Service SHALL join with posts table to retrieve post titles
3. WHEN fetching conversations, THE Messaging_Service SHALL calculate unread message counts for each conversation
4. WHEN fetching messages, THE Messaging_Service SHALL order them by created_at ascending
5. THE Messaging_Service SHALL handle database errors gracefully and return appropriate error messages

### Requirement 8: Type Safety and Code Quality

**User Story:** As a developer, I want proper TypeScript types for all messaging entities, so that the code is maintainable and type-safe.

#### Acceptance Criteria

1. THE Messaging_Service SHALL define a Conversation type with all required fields
2. THE Messaging_Service SHALL define a Message type with all required fields
3. THE Messaging_Service SHALL define proper return types for all service functions
4. THE Messaging_Service SHALL use existing theme system for styling
5. THE Messaging_Service SHALL follow existing component patterns for minimal, focused components
