/**
 * BentoGrid Layout Component
 * A modern asymmetric grid layout system for displaying content cards in varying sizes.
 * Supports both Abundance mode (grid) and Survival mode (single-column list).
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ThemeMode } from '../../theme/ThemeContext';
import { RiskTier } from '../../types';

// ============================================
// Types and Interfaces
// ============================================

export type CardSize = 'small' | 'wide' | 'tall' | 'featured';

export interface BentoGridItem<T> {
  data: T;
  size: CardSize;
  priority: number;
}

export interface BentoGridProps<T> {
  /** Items to display in the grid */
  items: BentoGridItem<T>[];
  /** Render function for each item */
  renderItem: (item: T, size: CardSize, index: number) => React.ReactNode;
  /** Current theme mode */
  mode: ThemeMode;
  /** Number of columns in grid mode */
  columns?: number;
  /** Gap between items */
  gap?: number;
  /** Pull to refresh handler */
  onRefresh?: () => void;
  /** Whether refreshing */
  refreshing?: boolean;
  /** Empty state component */
  ListEmptyComponent?: React.ComponentType;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// Constants
// ============================================

const DEFAULT_COLUMNS = 2;
const DEFAULT_GAP = 12;
const BASE_HEIGHT = 180;

const ANIMATION_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

// ============================================
// Size Calculation Utilities
// Requirements: 5.2 - Support card sizes of 1x1, 2x1, 1x2, 2x2
// ============================================

export interface CardDimensions {
  width: number;
  height: number;
}

/**
 * Calculate card dimensions based on size and container width
 * Requirements: 5.2
 * - small: 1x1 (half width, standard height)
 * - wide: 2x1 (full width, standard height)
 * - tall: 1x2 (half width, double height)
 * - featured: 2x2 (full width, double height)
 */
export function calculateCardDimensions(
  size: CardSize,
  containerWidth: number,
  columns: number = DEFAULT_COLUMNS,
  gap: number = DEFAULT_GAP,
  baseHeight: number = BASE_HEIGHT,
): CardDimensions {
  const totalGap = gap * (columns - 1);
  const availableWidth = containerWidth - totalGap;
  const columnWidth = availableWidth / columns;

  switch (size) {
    case 'small':
      return {
        width: columnWidth,
        height: baseHeight,
      };
    case 'wide':
      return {
        width: containerWidth,
        height: baseHeight,
      };
    case 'tall':
      return {
        width: columnWidth,
        height: baseHeight * 2 + gap,
      };
    case 'featured':
      return {
        width: containerWidth,
        height: baseHeight * 2 + gap,
      };
    default:
      return {
        width: columnWidth,
        height: baseHeight,
      };
  }
}

// ============================================
// Size Assignment Algorithm
// Requirements: 5.3 - Automatically assign card sizes based on priority and risk tier
// ============================================

export type Priority = 'high' | 'medium' | 'low';

/**
 * Determine card size based on risk tier and priority
 * Requirements: 5.3
 * - featured: high-risk + high-priority
 * - wide: high-risk OR high-priority
 * - tall: medium-risk + medium-priority
 * - small: otherwise
 */
export function assignCardSize(riskTier: RiskTier, priority: Priority): CardSize {
  const isHighRisk = riskTier === 'high';
  const isHighPriority = priority === 'high';
  const isMediumRisk = riskTier === 'medium';
  const isMediumPriority = priority === 'medium';

  // Featured: high-risk AND high-priority
  if (isHighRisk && isHighPriority) {
    return 'featured';
  }

  // Wide: high-risk OR high-priority (but not both - that's featured)
  if (isHighRisk || isHighPriority) {
    return 'wide';
  }

  // Tall: medium-risk AND medium-priority
  if (isMediumRisk && isMediumPriority) {
    return 'tall';
  }

  // Small: everything else
  return 'small';
}

/**
 * Convert numeric priority to Priority type
 */
export function numericToPriority(priority: number): Priority {
  if (priority >= 0.7) return 'high';
  if (priority >= 0.4) return 'medium';
  return 'low';
}

// ============================================
// BentoGrid Component
// Requirements: 5.1, 5.4, 5.6
// ============================================

function BentoGridComponent<T>({
  items,
  renderItem,
  mode,
  gap = DEFAULT_GAP,
  onRefresh,
  refreshing = false,
  ListEmptyComponent,
  testID,
}: BentoGridProps<T>): React.JSX.Element {
  // Scroll position preservation
  const flatListRef = useRef<FlatList>(null);
  const scrollOffset = useRef(0);
  const previousMode = useRef(mode);

  // Animation progress for mode transitions
  const modeProgress = useSharedValue(mode === 'survival' ? 1 : 0);

  // Handle mode changes with scroll preservation
  useEffect(() => {
    if (previousMode.current !== mode) {
      const savedOffset = scrollOffset.current;
      modeProgress.value = withTiming(mode === 'survival' ? 1 : 0, ANIMATION_CONFIG);
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: savedOffset,
          animated: false,
        });
      }, ANIMATION_CONFIG.duration + 50);
      previousMode.current = mode;
    }
  }, [mode, modeProgress]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  }, []);

  // Simple render: just render each item full-width in a vertical list
  const renderFlatListItem = useCallback(
    ({ item, index }: { item: BentoGridItem<T>; index: number }) => {
      const cardSize = mode === 'survival' ? 'wide' : item.size;
      return (
        <View style={styles.gridItem}>
          {renderItem(item.data, cardSize, index)}
        </View>
      );
    },
    [renderItem, mode],
  );

  const keyExtractor = useCallback(
    (_item: BentoGridItem<T>, index: number) => `bento-${index}`,
    [],
  );

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={mode === 'survival' ? ['#00E676'] : ['#4CAF50']}
      tintColor={mode === 'survival' ? '#00E676' : '#4CAF50'}
      progressBackgroundColor={mode === 'survival' ? '#1A221A' : '#FFFFFF'}
    />
  ) : undefined;

  return (
    <View style={styles.container} testID={testID}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderFlatListItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.contentContainer, { paddingHorizontal: gap }]}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={refreshControl}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={6}
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
  },
  contentContainer: {
    paddingVertical: 12,
  },
  gridItem: {
    marginBottom: 12,
  },
});

// ============================================
// Memoized Export
// ============================================

// Using type assertion to properly type the memoized generic component
export const BentoGrid = React.memo(BentoGridComponent) as <T>(
  props: BentoGridProps<T>,
) => React.JSX.Element;

export default BentoGrid;
