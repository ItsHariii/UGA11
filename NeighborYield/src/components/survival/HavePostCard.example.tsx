/**
 * HavePostCard Example Usage
 * Demonstrates how to use the HavePostCard component
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { HavePostCard } from './HavePostCard';
import { SurvivalPost, createSurvivalPost } from '../../types';

// ============================================
// Example Component
// ============================================

export function HavePostCardExample(): React.JSX.Element {
  // Example posts
  const now = Math.floor(Date.now() / 1000);

  // Recent post (10 minutes ago)
  const recentPost: SurvivalPost = createSurvivalPost('h', 'Fresh Tomatoes', 123)!;
  recentPost.ts = now - 10 * 60;

  // Older post (2 hours ago)
  const olderPost: SurvivalPost = createSurvivalPost('h', 'Milk (1 gallon)', 456)!;
  olderPost.ts = now - 2 * 60 * 60;

  // Claimed post
  const claimedPost: SurvivalPost = createSurvivalPost('h', 'Bread', 789)!;
  claimedPost.ts = now - 30 * 60;
  claimedPost.resolved = true;

  // Long item name
  const longPost: SurvivalPost = createSurvivalPost(
    'h',
    'Fresh organic vegetables from my garden including carrots and lettuce',
    321
  )!;
  longPost.ts = now - 5 * 60;

  // Handle press
  const handlePress = (post: SurvivalPost) => {
    Alert.alert(
      'Post Details',
      `Item: ${post.i}\nHouse: #${post.h}\nPosted: ${new Date(post.ts * 1000).toLocaleString()}\nClaimed: ${post.resolved ? 'Yes' : 'No'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Recent Post */}
      <HavePostCard
        post={recentPost}
        onPress={() => handlePress(recentPost)}
        testID="example-recent"
      />

      {/* Older Post */}
      <HavePostCard
        post={olderPost}
        onPress={() => handlePress(olderPost)}
        testID="example-older"
      />

      {/* Claimed Post */}
      <HavePostCard
        post={claimedPost}
        onPress={() => handlePress(claimedPost)}
        testID="example-claimed"
      />

      {/* Long Item Name */}
      <HavePostCard
        post={longPost}
        onPress={() => handlePress(longPost)}
        testID="example-long"
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
    backgroundColor: '#0D1210', // Survival mode background
  },
});

export default HavePostCardExample;
