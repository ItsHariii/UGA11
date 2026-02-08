/**
 * Interest Flow Utilities
 * Helper functions for the interest expression flow with optional messaging
 * 
 * Requirements: 6.2, 6.3, 6.4
 */

import { Alert } from 'react-native';
import { fetchConversations } from '../services/messaging.service';

export interface InitialMessagePromptResult {
  shouldSendMessage: boolean;
  conversationId?: string;
  postTitle?: string;
  otherUserIdentifier?: string;
}

/**
 * Prompts user if they want to send an initial message after expressing interest
 * Returns conversation details if user wants to message
 * 
 * @param userId - Current user's ID
 * @param interestId - The interest that was just created
 * @returns Promise with result indicating if user wants to message and conversation details
 */
export async function promptForInitialMessage(
  userId: string,
  interestId: string
): Promise<InitialMessagePromptResult> {
  return new Promise((resolve) => {
    Alert.alert(
      'Interest Sent!',
      'Would you like to send a message to start the conversation?',
      [
        {
          text: 'Skip',
          style: 'cancel',
          onPress: () => {
            resolve({ shouldSendMessage: false });
          },
        },
        {
          text: 'Send Message',
          onPress: async () => {
            // Fetch the conversation that was just created
            const { conversations, error } = await fetchConversations(userId);
            
            if (error || !conversations) {
              console.error('Error fetching conversations:', error);
              resolve({ shouldSendMessage: false });
              return;
            }
            
            // Find the conversation for this interest
            const conversation = conversations.find(c => c.interestId === interestId);
            
            if (!conversation) {
              console.error('Conversation not found for interest:', interestId);
              resolve({ shouldSendMessage: false });
              return;
            }
            
            resolve({
              shouldSendMessage: true,
              conversationId: conversation.id,
              postTitle: conversation.postTitle,
              otherUserIdentifier: conversation.otherUserIdentifier,
            });
          },
        },
      ],
      { cancelable: false }
    );
  });
}

/**
 * Enhanced interest expression handler with optional initial message flow
 * This function can be used to replace the basic handleInterestPress
 * 
 * @param postId - ID of the post to express interest in
 * @param userId - Current user's ID
 * @param userIdentifier - Current user's identifier
 * @param expressInterestFn - Function to express interest
 * @param navigateToChat - Optional callback to navigate to chat screen
 * @returns Promise that resolves when flow is complete
 */
export async function handleInterestWithMessage(
  postId: string,
  userId: string,
  userIdentifier: string,
  expressInterestFn: (
    postId: string,
    userId: string,
    userIdentifier: string
  ) => Promise<{ interest: any; error: any }>,
  navigateToChat?: (conversationId: string, postTitle: string, otherUserIdentifier: string) => void
): Promise<void> {
  // Step 1: Express interest (this triggers conversation creation via database trigger)
  const { interest, error } = await expressInterestFn(postId, userId, userIdentifier);
  
  if (error) {
    Alert.alert('Error', 'Failed to express interest: ' + error.message);
    return;
  }
  
  if (!interest) {
    Alert.alert('Error', 'Failed to express interest');
    return;
  }
  
  // Step 2: Prompt for initial message
  const result = await promptForInitialMessage(userId, interest.id);
  
  // Step 3: Navigate to chat if user wants to send message
  if (result.shouldSendMessage && result.conversationId && navigateToChat) {
    navigateToChat(
      result.conversationId,
      result.postTitle || 'Conversation',
      result.otherUserIdentifier || 'Neighbor'
    );
  } else if (!result.shouldSendMessage) {
    // Show success message if user skipped messaging
    Alert.alert('Success', 'Your interest has been sent to the post author!');
  }
}
