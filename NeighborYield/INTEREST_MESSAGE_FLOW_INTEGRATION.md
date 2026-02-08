# Interest Message Flow Integration Guide

This guide explains how to integrate the optional initial message flow when users express interest in posts.

## Overview

When a user expresses interest in a post:
1. The interest is created in the database
2. A conversation is automatically created via database trigger (Requirement 6.1 ✅)
3. The user is prompted if they want to send an initial message (Requirement 6.2 ✅)
4. If yes, navigate to ChatScreen with the conversation (Requirement 6.3 ✅)
5. If no, show success message and complete normally (Requirement 6.4 ✅)

## Implementation

### Option 1: Using the Helper Function (Recommended)

Replace your current `handleInterestPress` with the enhanced version:

```typescript
import { handleInterestWithMessage } from './utils/interestFlow';
import { expressInterest } from './services/interests.service';

// In your component
const handleInterestPress = useCallback(async (postId: string) => {
  if (!currentUser) {
    Alert.alert('Error', 'You must be logged in to express interest');
    return;
  }

  await handleInterestWithMessage(
    postId,
    currentUser.id,
    currentUser.userIdentifier,
    expressInterest,
    // Optional: Provide navigation callback when navigation is set up
    (conversationId, postTitle, otherUserIdentifier) => {
      navigation.navigate('Chat', {
        conversationId,
        postTitle,
        otherUserIdentifier,
      });
    }
  );
}, [currentUser, navigation]);
```

### Option 2: Manual Implementation

If you prefer more control, implement the flow manually:

```typescript
import { expressInterest } from './services/interests.service';
import { promptForInitialMessage } from './utils/interestFlow';

const handleInterestPress = useCallback(async (postId: string) => {
  if (!currentUser) {
    Alert.alert('Error', 'You must be logged in to express interest');
    return;
  }

  // Step 1: Express interest (creates conversation via trigger)
  const { interest, error } = await expressInterest(
    postId,
    currentUser.id,
    currentUser.userIdentifier
  );
  
  if (error) {
    Alert.alert('Error', 'Failed to express interest: ' + error.message);
    return;
  }

  // Step 2: Prompt for initial message
  const result = await promptForInitialMessage(currentUser.id, interest.id);
  
  // Step 3: Navigate to chat if user wants to message
  if (result.shouldSendMessage && result.conversationId) {
    navigation.navigate('Chat', {
      conversationId: result.conversationId,
      postTitle: result.postTitle,
      otherUserIdentifier: result.otherUserIdentifier,
    });
  } else {
    // Show success message if user skipped
    Alert.alert('Success', 'Your interest has been sent to the post author!');
  }
}, [currentUser, navigation]);
```

### Option 3: Without Navigation (Current State)

If navigation isn't set up yet, you can still use the prompt without navigation:

```typescript
import { expressInterest } from './services/interests.service';
import { promptForInitialMessage } from './utils/interestFlow';

const handleInterestPress = useCallback(async (postId: string) => {
  if (!currentUser) {
    Alert.alert('Error', 'You must be logged in to express interest');
    return;
  }

  const { interest, error } = await expressInterest(
    postId,
    currentUser.id,
    currentUser.userIdentifier
  );
  
  if (error) {
    Alert.alert('Error', 'Failed to express interest: ' + error.message);
    return;
  }

  // Prompt for message (will show success if user skips)
  const result = await promptForInitialMessage(currentUser.id, interest.id);
  
  if (result.shouldSendMessage) {
    Alert.alert(
      'Message Ready',
      'Navigation to chat will be available once navigation is set up. ' +
      `Conversation ID: ${result.conversationId}`
    );
  }
}, [currentUser]);
```

## Testing the Flow

### Test Conversation Auto-Creation

Run the test script to verify the database trigger works:

```bash
cd NeighborYield
node test-conversation-auto-creation.js
```

This verifies that expressing interest automatically creates a conversation (Requirement 6.1).

### Test Initial Message Prompt

1. Express interest in a post
2. You should see an alert: "Would you like to send a message to start the conversation?"
3. Choose "Skip" - should show success message
4. Choose "Send Message" - should navigate to chat (when navigation is set up)

## Requirements Satisfied

- ✅ **Requirement 6.1**: Conversation auto-creation via database trigger
- ✅ **Requirement 6.2**: Optional initial message prompt after expressing interest
- ✅ **Requirement 6.3**: Navigate to ChatScreen if user wants to send message
- ✅ **Requirement 6.4**: Complete normally if user skips message

## Next Steps

1. **Task 10**: Set up navigation to integrate ChatScreen and MessagesScreen
2. **Update App.tsx**: Replace current `handleInterestPress` with enhanced version
3. **Test end-to-end**: Express interest → Send message → Chat screen

## API Reference

### `promptForInitialMessage(userId, interestId)`

Prompts user if they want to send an initial message.

**Parameters:**
- `userId` (string): Current user's ID
- `interestId` (string): The interest that was just created

**Returns:** `Promise<InitialMessagePromptResult>`
```typescript
{
  shouldSendMessage: boolean;
  conversationId?: string;
  postTitle?: string;
  otherUserIdentifier?: string;
}
```

### `handleInterestWithMessage(postId, userId, userIdentifier, expressInterestFn, navigateToChat?)`

Complete interest expression flow with optional messaging.

**Parameters:**
- `postId` (string): ID of the post
- `userId` (string): Current user's ID
- `userIdentifier` (string): Current user's identifier
- `expressInterestFn` (function): Function to express interest
- `navigateToChat` (function, optional): Callback to navigate to chat

**Returns:** `Promise<void>`

## Notes

- The conversation is created automatically by the database trigger when interest is expressed
- The prompt appears after the interest is successfully created
- If navigation callback is not provided, the flow still works but won't navigate
- The user can always access the conversation later from the Messages tab
