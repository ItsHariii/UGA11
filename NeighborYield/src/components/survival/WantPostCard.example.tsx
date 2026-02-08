/**
 * WantPostCard Component Examples
 * Demonstrates various states and use cases for the WantPostCard component
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { WantPostCard } from './WantPostCard';
import { SurvivalPost, createSurvivalPost } from '../../types';

// ============================================
// Example Posts
// ============================================

// Fresh post with no responders
const freshPost: SurvivalPost = {
  t: 'w',
  i: 'Need Milk',
  h: 124,
  ts: Math.floor(Date.now() / 1000), // Just now
  id: 'abc12345',
};

// Post with one responder
const postWithOneResponder: SurvivalPost = {
  t: 'w',
  i: 'Need Batteries',
  h: 125,
  ts: Math.floor(Date.now() / 1000) - 600, // 10 minutes ago
  id: 'def67890',
  r: ['123'],
};

// Post with multiple responders
const postWithMultipleResponders: SurvivalPost = {
  t: 'w',
  i: 'Need Water',
  h: 126,
  ts: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  id: 'ghi11111',
  r: ['123', '124', '127'],
};

// Post about to expire (23 hours old)
const almostExpiredPost: SurvivalPost = {
  t: 'w',
  i: 'Need Flashlight',
  h: 127,
  ts: Math.floor(Date.now() / 1000) - 82800, // 23 hours ago
  id: 'jkl22222',
  r: ['123'],
};

// Expired post (25 hours old)
const expiredPost: SurvivalPost = {
  t: 'w',
  i: 'Need Candles',
  h: 128,
  ts: Math.floor(Date.now() / 1000) - 90000, // 25 hours ago
  id: 'mno33333',
};

// ============================================
// Example Component
// ============================================

export function WantPostCardExamples(): React.JSX.Element {
  const handleComingPress = (postId: string) => {
    Alert.alert(
      'Coming!',
      `You indicated you are bringing the item for post ${postId}`,
      [{ text: 'OK' }]
    );
  };

  const handleReplyPress = (postId: string) => {
    Alert.alert(
      'Reply',
      `Reply to post ${postId} with your house number`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => console.log('Reply sent') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Example 1: Fresh post with no responders */}
      <WantPostCard
        post={freshPost}
        onComingPress={() => handleComingPress(freshPost.id)}
        onReplyPress={() => handleReplyPress(freshPost.id)}
        testID="example-fresh-post"
      />

      {/* Example 2: Post with one responder */}
      <WantPostCard
        post={postWithOneResponder}
        onComingPress={() => handleComingPress(postWithOneResponder.id)}
        onReplyPress={() => handleReplyPress(postWithOneResponder.id)}
        testID="example-one-responder"
      />

      {/* Example 3: Post with multiple responders */}
      <WantPostCard
        post={postWithMultipleResponders}
        onComingPress={() => handleComingPress(postWithMultipleResponders.id)}
        onReplyPress={() => handleReplyPress(postWithMultipleResponders.id)}
        testID="example-multiple-responders"
      />

      {/* Example 4: Post about to expire */}
      <WantPostCard
        post={almostExpiredPost}
        onComingPress={() => handleComingPress(almostExpiredPost.id)}
        onReplyPress={() => handleReplyPress(almostExpiredPost.id)}
        testID="example-almost-expired"
      />

      {/* Example 5: Expired post */}
      <WantPostCard
        post={expiredPost}
        onComingPress={() => handleComingPress(expiredPost.id)}
        onReplyPress={() => handleReplyPress(expiredPost.id)}
        testID="example-expired"
      />
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black for OLED
  },
});

// ============================================
// Usage Notes
// ============================================

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic Usage:
 * ```tsx
 * <WantPostCard
 *   post={wantPost}
 *   onComingPress={() => handleComing(post.id)}
 *   onReplyPress={() => handleReply(post.id)}
 * />
 * ```
 * 
 * 2. With State Management:
 * ```tsx
 * const handleComing = (postId: string) => {
 *   // Create ComingAck
 *   const ack = createComingAck(postId, userHouseNumber.toString());
 *   
 *   // Send via Bluetooth
 *   sendComingAck(ack);
 *   
 *   // Update local state
 *   dispatch({
 *     type: 'ADD_RESPONDER',
 *     postId,
 *     houseNumber: userHouseNumber.toString(),
 *   });
 * };
 * ```
 * 
 * 3. With Reply Modal:
 * ```tsx
 * const [replyModalVisible, setReplyModalVisible] = useState(false);
 * const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
 * 
 * const handleReply = (postId: string) => {
 *   setSelectedPostId(postId);
 *   setReplyModalVisible(true);
 * };
 * ```
 * 
 * 4. Filtering Expired Posts:
 * ```tsx
 * const activePosts = posts.filter(post => !isPostExpired(post.ts));
 * ```
 * 
 * REQUIREMENTS SATISFIED:
 * - 4.1: Format: "[ITEM NEEDED] - House #[NUMBER] - [TIME]"
 * - 4.2: "Coming" button with 44px height
 * - 4.3: Send 1-byte ACK via Bluetooth (handled by onComingPress callback)
 * - 4.4: Allow leaving a reply with house number (handled by onReplyPress callback)
 * - 4.5: Show count of "Coming" responses
 * - 4.6: Highlight when someone is coming (green indicator)
 * - 4.7: Maximum 512 bytes when serialized (validated by SurvivalPost type)
 * - 4.8: Use high-contrast colors (white text on dark background)
 * - 4.9: Show response house numbers (formatted as "#123, #125")
 * - 4.10: Auto-expire after 24 hours (with countdown display)
 */
