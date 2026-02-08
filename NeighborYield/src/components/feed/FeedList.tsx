/**
 * FeedList Component
 * Renders a list of SharePostCards with pull-to-refresh,
 * empty state handling, and auto-removal of expired posts with animation.
 *
 * Requirements: 5.2
 */

import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ListRenderItem,
} from 'react-native';
import { SharePost } from '../../types';
import { SharePostCard } from './SharePostCard';
import { InterestedButton, InterestButtonState } from './InterestedButton';

export interface FeedListProps {
  posts: SharePost[];
  refreshing: boolean;
  onRefresh: () => void;
  onInterestPress: (postId: string) => void;
  interestStates?: Record<string, InterestButtonState>;
  currentTime?: number;
}

interface FeedItemProps {
  post: SharePost;
  onInterestPress: (postId: string) => void;
  interestState: InterestButtonState;
  currentTime: number;
}

function FeedItem({
  post,
  onInterestPress,
  interestState,
  currentTime,
}: FeedItemProps): React.JSX.Element {
  const handlePress = useCallback(() => {
    onInterestPress(post.id);
  }, [onInterestPress, post.id]);

  return (
    <View style={styles.itemContainer}>
      <SharePostCard post={post} currentTime={currentTime} />
      <View style={styles.buttonContainer}>
        <InterestedButton state={interestState} onPress={handlePress} />
      </View>
    </View>
  );
}


function EmptyState(): React.JSX.Element {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🥗</Text>
      <Text style={styles.emptyTitle}>No shares available</Text>
      <Text style={styles.emptySubtitle}>
        Pull down to refresh or check back later for food shares from your neighbors
      </Text>
    </View>
  );
}

export function FeedList({
  posts,
  refreshing,
  onRefresh,
  onInterestPress,
  interestStates = {},
  currentTime = Date.now(),
}: FeedListProps): React.JSX.Element {
  // Filter out expired posts
  const activePosts = useMemo(() => {
    return posts.filter(post => post.expiresAt > currentTime);
  }, [posts, currentTime]);

  const renderItem: ListRenderItem<SharePost> = useCallback(
    ({ item }) => (
      <FeedItem
        post={item}
        onInterestPress={onInterestPress}
        interestState={interestStates[item.id] || 'idle'}
        currentTime={currentTime}
      />
    ),
    [onInterestPress, interestStates, currentTime]
  );

  const keyExtractor = useCallback((item: SharePost) => item.id, []);

  return (
    <FlatList
      data={activePosts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={activePosts.length === 0 ? styles.emptyList : styles.list}
      ListEmptyComponent={EmptyState}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2e7d32']}
          tintColor="#2e7d32"
        />
      }
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    marginBottom: 8,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: -4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FeedList;
