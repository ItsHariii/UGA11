/**
 * Example Usage: SurvivalPostCreator Component
 * Demonstrates how to use the SurvivalPostCreator in different scenarios
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { SurvivalPostCreator } from './SurvivalPostCreator';
import { SurvivalPost } from '../../types';

// ============================================
// Example 1: Basic Usage
// ============================================

export function BasicExample(): React.JSX.Element {
  const [showCreator, setShowCreator] = useState(true);

  const handleSubmit = (post: SurvivalPost) => {
    console.log('Post created:', post);
    Alert.alert('Success', `Created ${post.t === 'h' ? 'Have' : post.t === 'w' ? 'Want' : 'SOS'} post: ${post.i}`);
    setShowCreator(false);
  };

  const handleCancel = () => {
    console.log('Post creation cancelled');
    setShowCreator(false);
  };

  return (
    <View style={styles.container}>
      {showCreator ? (
        <SurvivalPostCreator
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          userHouseNumber={123}
        />
      ) : (
        <Text style={styles.message}>Post creator closed</Text>
      )}
    </View>
  );
}

// ============================================
// Example 2: With State Management
// ============================================

export function StateManagementExample(): React.JSX.Element {
  const [posts, setPosts] = useState<SurvivalPost[]>([]);
  const [showCreator, setShowCreator] = useState(false);

  const handleSubmit = (post: SurvivalPost) => {
    // Add post to state
    setPosts(prevPosts => [...prevPosts, post]);
    setShowCreator(false);
    
    // Show success message
    Alert.alert('Success', 'Post created successfully!');
  };

  const handleCancel = () => {
    setShowCreator(false);
  };

  return (
    <View style={styles.container}>
      {showCreator ? (
        <SurvivalPostCreator
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          userHouseNumber={123}
        />
      ) : (
        <View>
          <Text style={styles.message}>Total posts: {posts.length}</Text>
          {posts.map(post => (
            <Text key={post.id} style={styles.postItem}>
              {post.t === 'h' ? '📦' : post.t === 'w' ? '🔍' : '🚨'} {post.i} - House #{post.h}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================
// Example 3: With Validation Feedback
// ============================================

export function ValidationExample(): React.JSX.Element {
  const [lastPost, setLastPost] = useState<SurvivalPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (post: SurvivalPost) => {
    // Validate post
    if (post.i.length === 0) {
      setError('Item description is required');
      return;
    }

    if (post.h <= 0) {
      setError('House number must be positive');
      return;
    }

    // Success
    setLastPost(post);
    setError(null);
    Alert.alert('Success', 'Post created and validated!');
  };

  const handleCancel = () => {
    setError(null);
    Alert.alert('Cancelled', 'Post creation cancelled');
  };

  return (
    <View style={styles.container}>
      <SurvivalPostCreator
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        userHouseNumber={456}
      />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {lastPost && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Last post: {lastPost.i} at House #{lastPost.h}
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================
// Example 4: Modal Usage
// ============================================

export function ModalExample(): React.JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState<SurvivalPost[]>([]);

  const handleSubmit = (post: SurvivalPost) => {
    setPosts(prevPosts => [...prevPosts, post]);
    setShowModal(false);
    Alert.alert('Success', 'Post added to feed!');
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {showModal && (
        <View style={styles.modalContainer}>
          <SurvivalPostCreator
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            userHouseNumber={789}
          />
        </View>
      )}
      
      {!showModal && (
        <View>
          <Text style={styles.message}>Posts: {posts.length}</Text>
          <Text 
            style={styles.button}
            onPress={() => setShowModal(true)}
          >
            Create New Post
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================
// Example 5: Different Post Types
// ============================================

export function PostTypesExample(): React.JSX.Element {
  const [posts, setPosts] = useState<{
    have: SurvivalPost[];
    want: SurvivalPost[];
    sos: SurvivalPost[];
  }>({
    have: [],
    want: [],
    sos: [],
  });

  const handleSubmit = (post: SurvivalPost) => {
    setPosts(prevPosts => {
      if (post.t === 'h') {
        return { ...prevPosts, have: [...prevPosts.have, post] };
      } else if (post.t === 'w') {
        return { ...prevPosts, want: [...prevPosts.want, post] };
      } else {
        return { ...prevPosts, sos: [...prevPosts.sos, post] };
      }
    });
    
    Alert.alert('Success', `${post.t === 'h' ? 'Have' : post.t === 'w' ? 'Want' : 'SOS'} post created!`);
  };

  const handleCancel = () => {
    Alert.alert('Cancelled', 'Post creation cancelled');
  };

  return (
    <View style={styles.container}>
      <SurvivalPostCreator
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        userHouseNumber={321}
      />
      
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Have: {posts.have.length}</Text>
        <Text style={styles.statText}>Want: {posts.want.length}</Text>
        <Text style={styles.statText}>SOS: {posts.sos.length}</Text>
      </View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1210',
  },
  message: {
    color: '#E8F5E9',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  postItem: {
    color: '#E8F5E9',
    fontSize: 14,
    padding: 8,
    marginHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: '#FF5252',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#4AEDC4',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  successText: {
    color: '#0D1210',
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0D1210',
  },
  button: {
    color: '#4AEDC4',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginTop: 20,
  },
  statText: {
    color: '#E8F5E9',
    fontSize: 14,
  },
});
