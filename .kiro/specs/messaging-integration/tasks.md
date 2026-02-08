# Implementation Plan: Messaging Integration

## Overview

This implementation plan breaks down the messaging integration feature into discrete, incremental tasks. Each task builds on previous work and includes testing to validate functionality early. The implementation follows the existing service patterns and integrates seamlessly with the current Interest Flow.

## Tasks

- [x] 1. Set up messaging service foundation
  - Create `src/services/messaging.service.ts` file
  - Define TypeScript types (Conversation, Message, MessagingError)
  - Export type definitions for use in components
  - Set up imports for Supabase client
  - _Requirements: 5.1-5.9, 8.1, 8.2_

- [x] 2. Implement conversation fetching
  - [x] 2.1 Implement fetchConversations function
    - Query conversations table with joins to posts and interests tables
    - Calculate unread message counts using subquery
    - Determine "other user" for each conversation
    - Transform database rows to Conversation type
    - Handle errors and return appropriate error objects
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.1, 7.2, 7.3_
  
  - [ ]* 2.2 Write property test for conversation fetching
    - **Property 1: Conversation Fetching Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.2, 7.3**
  
  - [ ]* 2.3 Write property test for conversation sorting
    - **Property 2: Conversation Sorting**
    - **Validates: Requirements 1.7**
  
  - [ ]* 2.4 Write unit tests for conversation fetching
    - Test with empty conversation list
    - Test with multiple conversations
    - Test error handling
    - _Requirements: 1.8, 7.5_

- [x] 3. Implement message operations
  - [x] 3.1 Implement fetchMessages function
    - Query messages table for specific conversation
    - Order by created_at ascending
    - Transform database rows to Message type
    - Handle errors and return appropriate error objects
    - _Requirements: 2.1, 5.2, 7.4_
  
  - [x] 3.2 Implement sendMessage function
    - Insert message into messages table
    - Include all required fields (conversation_id, sender_id, sender_identifier, message_text)
    - Return created message
    - Handle errors and return appropriate error objects
    - _Requirements: 2.6, 5.3, 7.1_
  
  - [x] 3.3 Implement markMessagesAsRead function
    - Update is_read to true for unread messages in conversation
    - Only mark messages where sender != current user
    - Update read_at timestamp
    - Handle errors and return appropriate error objects
    - _Requirements: 3.1, 3.2, 5.4_
  
  - [ ]* 3.4 Write property test for message ordering
    - **Property 3: Message Chronological Ordering**
    - **Validates: Requirements 2.1, 7.4**
  
  - [ ]* 3.5 Write property test for message creation
    - **Property 4: Message Creation Completeness**
    - **Validates: Requirements 2.6, 7.1**
  
  - [ ]* 3.6 Write property test for mark as read
    - **Property 5: Mark as Read Updates Status**
    - **Property 6: Unread Count After Marking Read**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [ ]* 3.7 Write unit tests for message operations
    - Test sending message with empty text (should fail validation)
    - Test sending message with text over 1000 chars (should fail)
    - Test marking messages as read in empty conversation
    - Test error handling for all functions
    - _Requirements: 2.8, 7.5_

- [x] 4. Checkpoint - Ensure service layer tests pass
  - Run all service layer tests
  - Verify all functions work correctly
  - Ask the user if questions arise

- [x] 5. Implement real-time subscriptions
  - [x] 5.1 Implement subscribeToMessages function
    - Create Supabase Realtime channel for conversation
    - Listen for INSERT events on messages table
    - Filter by conversation_id
    - Transform payload to Message type
    - Invoke callback with new message
    - Return subscription object
    - _Requirements: 4.1, 5.5_
  
  - [x] 5.2 Implement subscribeToConversations function
    - Create Supabase Realtime channel for user's conversations
    - Listen for INSERT and UPDATE events on messages table
    - Filter by user participation
    - Invoke callback when updates occur
    - Return subscription object
    - _Requirements: 4.2, 4.3, 5.6_
  
  - [ ]* 5.3 Write property test for real-time message delivery
    - **Property 7: Real-time Message Delivery**
    - **Validates: Requirements 4.1**
  
  - [ ]* 5.4 Write property test for real-time conversation updates
    - **Property 8: Real-time Conversation Updates**
    - **Validates: Requirements 4.2, 4.3**
  
  - [ ]* 5.5 Write unit tests for subscriptions
    - Test subscription creation
    - Test callback invocation
    - Test unsubscribe cleanup
    - _Requirements: 4.1, 4.2_

- [x] 6. Implement Messages Tab screen
  - [x] 6.1 Create MessagesScreen component
    - Create `src/screens/MessagesScreen.tsx` file
    - Set up component structure with state management
    - Implement loadConversations function
    - Implement conversation press handler
    - Add loading, error, and empty states
    - _Requirements: 1.1, 1.8_
  
  - [x] 6.2 Create ConversationListItem component
    - Create component to display single conversation
    - Show post title, other user identifier, last message preview
    - Show timestamp and unread count badge
    - Make touchable to navigate to chat
    - Apply theme styling
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 6.3 Integrate real-time updates in MessagesScreen
    - Subscribe to conversation updates on mount
    - Reload conversations when updates occur
    - Unsubscribe on unmount
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ]* 6.4 Write unit tests for MessagesScreen
    - Test rendering with empty conversations
    - Test rendering with multiple conversations
    - Test loading state
    - Test error state
    - Test navigation on conversation press
    - _Requirements: 1.1-1.8_

- [x] 7. Implement Chat screen
  - [x] 7.1 Create ChatScreen component
    - Create `src/screens/ChatScreen.tsx` file
    - Set up component structure with state management
    - Implement loadMessages function
    - Implement handleSend function
    - Add loading and empty states
    - Add message input field and send button
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.8_
  
  - [x] 7.2 Create MessageBubble component
    - Create component to display single message
    - Show sender identifier and timestamp
    - Style differently for own vs other messages
    - Apply theme styling
    - _Requirements: 2.2, 2.3_
  
  - [x] 7.3 Implement auto-scroll functionality
    - Add FlatList ref
    - Implement scrollToBottom function
    - Call on new messages and content size change
    - _Requirements: 2.7_
  
  - [x] 7.4 Implement mark as read on open
    - Call markMessagesAsRead when screen opens
    - Call markMessagesAsRead when new message arrives from other user
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 7.5 Integrate real-time updates in ChatScreen
    - Subscribe to message updates on mount
    - Add new messages to state when received
    - Auto-scroll to bottom on new messages
    - Unsubscribe on unmount
    - _Requirements: 4.1_
  
  - [ ]* 7.6 Write unit tests for ChatScreen
    - Test rendering with empty messages
    - Test rendering with multiple messages
    - Test sending message
    - Test message validation (empty, too long)
    - Test loading state
    - Test error handling
    - _Requirements: 2.1-2.8_

- [x] 8. Checkpoint - Ensure UI tests pass
  - Run all UI component tests
  - Verify screens render correctly
  - Ask the user if questions arise

- [x] 9. Integrate with Interest Flow
  - [x] 9.1 Verify conversation auto-creation
    - Test that expressing interest creates conversation via database trigger
    - Verify conversation is created with correct participants
    - _Requirements: 6.1_
  
  - [ ]* 9.2 Write property test for interest creates conversation
    - **Property 10: Interest Creates Conversation**
    - **Validates: Requirements 6.1**
  
  - [x] 9.3 Add optional initial message flow (optional enhancement)
    - Add prompt for initial message after expressing interest
    - Navigate to ChatScreen if user wants to send message
    - Complete interest flow normally if user skips message
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 10. Add navigation integration
  - [x] 10.1 Add Messages tab to navigation
    - Update navigation configuration to include MessagesScreen
    - Add Messages tab icon and label
    - Ensure proper navigation stack setup
    - _Requirements: 1.1_
  
  - [x] 10.2 Add Chat screen to navigation
    - Register ChatScreen in navigation stack
    - Set up route params (conversationId, postTitle, otherUserIdentifier)
    - Ensure back navigation works correctly
    - _Requirements: 2.1_
  
  - [x] 10.3 Test navigation flows
    - Test navigating from Messages tab to Chat screen
    - Test navigating from Interest Flow to Chat screen
    - Test back navigation
    - _Requirements: 1.1, 2.1, 6.3_

- [x] 11. Add error handling and validation
  - [x] 11.1 Add message text validation
    - Validate minimum length (1 character after trim)
    - Validate maximum length (1000 characters)
    - Show validation errors to user
    - Disable send button for invalid input
    - _Requirements: 2.6, 7.1_
  
  - [x] 11.2 Add error displays in UI
    - Show error messages in MessagesScreen
    - Show error toasts in ChatScreen
    - Add retry buttons where appropriate
    - _Requirements: 7.5_
  
  - [ ]* 11.3 Write property test for error handling
    - **Property 11: Error Handling Returns Error Objects**
    - **Validates: Requirements 7.5**

- [x] 12. Final checkpoint and integration testing
  - Run all tests (unit and property)
  - Test complete flow: express interest → view conversation → send message
  - Test real-time updates with multiple devices/users
  - Verify unread counts update correctly
  - Verify conversation list updates in real-time
  - Test error scenarios (network failures, invalid data)
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Real-time functionality is critical - test thoroughly
- Follow existing service patterns from posts.service.ts and interests.service.ts
- Use existing theme system for all styling
- Ensure proper cleanup of subscriptions to prevent memory leaks
