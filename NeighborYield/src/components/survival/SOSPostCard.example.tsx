/**
 * SOSPostCard Example
 * Demonstrates usage of the SOSPostCard component with various scenarios
 * 
 * Requirements: 5.1-5.10
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SOSPostCard } from './SOSPostCard';
import { SurvivalPost } from '../../types';

// ============================================
// Example Data
// ============================================

const exampleSOSPosts: SurvivalPost[] = [
  // Medical emergency - recent
  {
    t: 's',
    i: 'Medical emergency - need help immediately',
    h: 126,
    ts: Math.floor(Date.now() / 1000) - 120, // 2 minutes ago
    id: 'sos00001',
    c: 'm', // Medical
    r: ['123', '124', '125'],
  },
  
  // Safety issue - no responders yet
  {
    t: 's',
    i: 'Suspicious activity - need assistance',
    h: 130,
    ts: Math.floor(Date.now() / 1000) - 600, // 10 minutes ago
    id: 'sos00002',
    c: 's', // Safety
  },
  
  // Fire emergency - multiple responders
  {
    t: 's',
    i: 'House fire - evacuating',
    h: 145,
    ts: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
    id: 'sos00003',
    c: 'f', // Fire
    r: ['140', '141', '142', '143', '144'],
  },
  
  // Other emergency - resolved
  {
    t: 's',
    i: 'Power line down in yard',
    h: 150,
    ts: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    id: 'sos00004',
    c: 'o', // Other
    r: ['151', '152'],
    resolved: true,
  },
  
  // Medical - single responder
  {
    t: 's',
    i: 'Need insulin urgently',
    h: 160,
    ts: Math.floor(Date.now() / 1000) - 900, // 15 minutes ago
    id: 'sos00005',
    c: 'm', // Medical
    r: ['161'],
  },
];

// ============================================
// Example Component
// ============================================

export function SOSPostCardExample(): React.JSX.Element {
  const [posts, setPosts] = useState<SurvivalPost[]>(exampleSOSPosts);

  const handleRespondPress = (postId: string) => {
    console.log(`Responding to SOS post: ${postId}`);
    
    // Add current user as responder (example: house #999)
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const responders = post.r || [];
          if (!responders.includes('999')) {
            return { ...post, r: [...responders, '999'] };
          }
        }
        return post;
      })
    );
  };

  const handleResolvePress = (postId: string) => {
    console.log(`Resolving SOS post: ${postId}`);
    
    // Mark post as resolved
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, resolved: true } : post
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Medical Emergency - Recent */}
        <View style={styles.section}>
          <SOSPostCard
            post={posts[0]}
            onRespondPress={() => handleRespondPress(posts[0].id)}
            onResolvePress={() => handleResolvePress(posts[0].id)}
            isAuthor={false}
            testID="sos-medical-recent"
          />
        </View>

        {/* Safety Issue - No Responders */}
        <View style={styles.section}>
          <SOSPostCard
            post={posts[1]}
            onRespondPress={() => handleRespondPress(posts[1].id)}
            onResolvePress={() => handleResolvePress(posts[1].id)}
            isAuthor={true} // User is author, can resolve
            testID="sos-safety-no-responders"
          />
        </View>

        {/* Fire Emergency - Multiple Responders */}
        <View style={styles.section}>
          <SOSPostCard
            post={posts[2]}
            onRespondPress={() => handleRespondPress(posts[2].id)}
            onResolvePress={() => handleResolvePress(posts[2].id)}
            isAuthor={false}
            testID="sos-fire-multiple"
          />
        </View>

        {/* Other Emergency - Resolved */}
        <View style={styles.section}>
          <SOSPostCard
            post={posts[3]}
            onRespondPress={() => handleRespondPress(posts[3].id)}
            onResolvePress={() => handleResolvePress(posts[3].id)}
            isAuthor={false}
            testID="sos-other-resolved"
          />
        </View>

        {/* Medical - Single Responder */}
        <View style={styles.section}>
          <SOSPostCard
            post={posts[4]}
            onRespondPress={() => handleRespondPress(posts[4].id)}
            onResolvePress={() => handleResolvePress(posts[4].id)}
            isAuthor={true} // User is author, can resolve
            testID="sos-medical-single"
          />
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
});

export default SOSPostCardExample;
