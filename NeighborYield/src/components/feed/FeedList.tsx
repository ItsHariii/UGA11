/**
 * FeedList Component
 * Renders a list of SharePostCards with pull-to-refresh,
 * empty state handling, and auto-removal of expired posts with animation.
 * Now uses BentoGrid layout and DualModeFeedCard for dual-mode support.
 *
 * Requirements: 5.1, 5.2, 4.1
 */

import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl } from 'react-native';
import { SharePost } from '../../types';
import { SharePostCard } from './SharePostCard';
import { InterestedButton, InterestButtonState } from './InterestedButton';
import { DualModeFeedCard, CardSize } from './DualModeFeedCard';
import { BentoGrid, BentoGridItem, assignCardSize, numericToPriority } from '../layout/BentoGrid';
import { useAnimatedTheme } from '../../theme';

export interface FeedListProps {
  posts: SharePost[];
  refreshing: boolean;
  onRefresh: () => void;
  onInterestPress: (postId: string) => void;
  interestStates?: Record<string, InterestButtonState>;
  currentTime?: number;
  /** Use new BentoGrid layout with DualModeFeedCard */
  useBentoLayout?: boolean;
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

/**
 * Convert posts to BentoGridItems with size assignment
 * Requirements: 5.3 - Automatically assign card sizes based on priority and risk tier
 */
function convertToBentoItems(posts: SharePost[], currentTime: number): BentoGridItem<SharePost>[] {
  return posts
    .filter(post => post.expiresAt > currentTime)
    .map((post, index) => {
      // Calculate priority based on position and time remaining
      const timeRemaining = post.expiresAt - currentTime;
      const maxTTL = 30 * 60 * 1000; // 30 minutes
      const timePriority = 1 - Math.min(timeRemaining / maxTTL, 1);
      const positionPriority = 1 - index / Math.max(posts.length, 1);
      const priority = (timePriority + positionPriority) / 2;

      // Assign size based on risk tier and priority
      const priorityLevel = numericToPriority(priority);
      const size = assignCardSize(post.riskTier, priorityLevel);

      return {
        data: post,
        size,
        priority,
      };
    });
}

export function FeedList({
  posts,
  refreshing,
  onRefresh,
  onInterestPress,
  interestStates = {},
  currentTime = Date.now(),
  useBentoLayout = true,
}: FeedListProps): React.JSX.Element {
  // Get theme mode for BentoGrid
  let themeMode: 'abundance' | 'survival' = 'abundance';
  try {
    const theme = useAnimatedTheme();
    themeMode = theme.mode;
  } catch {
    // If not within AnimatedThemeProvider, default to abundance
    themeMode = 'abundance';
  }

  // Filter out expired posts
  const activePosts = useMemo(() => {
    return posts.filter(post => post.expiresAt > currentTime);
  }, [posts, currentTime]);

  // Convert to BentoGridItems
  const bentoItems = useMemo(() => convertToBentoItems(posts, currentTime), [posts, currentTime]);

  // Render item for BentoGrid
  const renderBentoItem = useCallback(
    (post: SharePost, size: CardSize, _index: number) => (
      <DualModeFeedCard
        post={post}
        mode={themeMode}
        size={size}
        interestState={interestStates[post.id] || 'idle'}
        onInterestPress={onInterestPress}
        currentTime={currentTime}
        testID={`feed-card-${post.id}`}
      />
    ),
    [themeMode, interestStates, onInterestPress, currentTime],
  );

  // Render item for legacy FlatList
  const renderLegacyItem = useCallback(
    ({ item }: { item: SharePost }) => (
      <FeedItem
        post={item}
        onInterestPress={onInterestPress}
        interestState={interestStates[item.id] || 'idle'}
        currentTime={currentTime}
      />
    ),
    [onInterestPress, interestStates, currentTime],
  );

  const keyExtractor = useCallback((item: SharePost) => item.id, []);

  // Use BentoGrid layout when enabled
  if (useBentoLayout) {
    return (
      <BentoGrid
        items={bentoItems}
        renderItem={renderBentoItem}
        mode={themeMode}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={EmptyState}
        testID="feed-bento-grid"
      />
    );
  }

  // Legacy FlatList implementation (for backward compatibility)
  return (
    <FlatList
      data={activePosts}
      renderItem={renderLegacyItem}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    marginBottom: 12,
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
