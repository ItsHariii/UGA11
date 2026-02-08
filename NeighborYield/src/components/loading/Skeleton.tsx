/**
 * Skeleton Loading Components
 * Mode-aware skeleton loading states with appropriate styling for
 * Abundance and Survival modes.
 *
 * Requirements: 10.3
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';
import { useAnimatedTheme, ThemeMode } from '../../theme';

// ============================================
// Skeleton Variant Types
// ============================================

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card' | 'list' | 'header';

// ============================================
// Skeleton Props
// ============================================

export interface SkeletonProps {
  /** Variant of skeleton to display */
  variant?: SkeletonVariant;
  /** Width of the skeleton (number or percentage string) */
  width?: number | string;
  /** Height of the skeleton */
  height?: number;
  /** Border radius override */
  borderRadius?: number;
  /** Whether to animate the skeleton */
  animated?: boolean;
  /** Additional style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// Skeleton Configuration by Mode
// ============================================

export interface SkeletonModeConfig {
  backgroundColor: string;
  highlightColor: string;
  animationDuration: number;
  borderRadius: number;
}

export const abundanceSkeletonConfig: SkeletonModeConfig = {
  backgroundColor: '#E0E8E0',
  highlightColor: '#F5F9F5',
  animationDuration: 1500,
  borderRadius: 8,
};

export const survivalSkeletonConfig: SkeletonModeConfig = {
  backgroundColor: '#1A221A',
  highlightColor: '#2E4A2E',
  animationDuration: 2000, // Slower for battery savings
  borderRadius: 2,
};

/**
 * Get skeleton config for a given theme mode
 */
export function getSkeletonConfigForMode(mode: ThemeMode): SkeletonModeConfig {
  return mode === 'survival' ? survivalSkeletonConfig : abundanceSkeletonConfig;
}

// ============================================
// Default Dimensions by Variant
// ============================================

const variantDefaults: Record<
  SkeletonVariant,
  { width: number | string; height: number; borderRadius?: number }
> = {
  text: { width: '100%', height: 16 },
  circular: { width: 48, height: 48, borderRadius: 24 },
  rectangular: { width: '100%', height: 100 },
  card: { width: '100%', height: 180 },
  list: { width: '100%', height: 72 },
  header: { width: '100%', height: 56 },
};

// ============================================
// Base Skeleton Component
// Requirements: 10.3 - skeleton loading states with mode-appropriate styling
// ============================================

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  borderRadius,
  animated = true,
  style,
  testID = 'skeleton',
}: SkeletonProps): React.JSX.Element {
  const { mode } = useAnimatedTheme();
  const config = getSkeletonConfigForMode(mode);
  const defaults = variantDefaults[variant];

  // Animation value
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Start shimmer animation
  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: config.animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: config.animationDuration,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [animated, animatedValue, config.animationDuration]);

  // Interpolate background color for shimmer effect
  const backgroundColor = animated
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [config.backgroundColor, config.highlightColor],
      })
    : config.backgroundColor;

  // Calculate dimensions
  const finalWidth = width ?? defaults.width;
  const finalHeight = height ?? defaults.height;
  const finalBorderRadius = borderRadius ?? defaults.borderRadius ?? config.borderRadius;

  const skeletonStyle: ViewStyle = {
    width: finalWidth as DimensionValue,
    height: finalHeight,
    borderRadius: finalBorderRadius,
  };

  return (
    <Animated.View
      style={[styles.skeleton, skeletonStyle, { backgroundColor }, style]}
      testID={testID}
    />
  );
}

// ============================================
// Skeleton Card Component
// ============================================

export interface SkeletonCardProps {
  /** Whether to show image placeholder */
  showImage?: boolean;
  /** Number of text lines */
  lines?: number;
  /** Additional style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

export function SkeletonCard({
  showImage = true,
  lines = 3,
  style,
  testID = 'skeleton-card',
}: SkeletonCardProps): React.JSX.Element {
  const { mode } = useAnimatedTheme();
  const config = getSkeletonConfigForMode(mode);

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: config.borderRadius,
          backgroundColor: mode === 'survival' ? '#141A14' : '#FFFFFF',
        },
        style,
      ]}
      testID={testID}>
      {showImage && (
        <Skeleton
          variant="rectangular"
          height={120}
          style={styles.cardImage}
          testID={`${testID}-image`}
        />
      )}
      <View style={styles.cardContent}>
        <Skeleton
          variant="text"
          width="60%"
          height={20}
          style={styles.cardTitle}
          testID={`${testID}-title`}
        />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? '40%' : '100%'}
            height={14}
            style={styles.cardLine}
            testID={`${testID}-line-${index}`}
          />
        ))}
      </View>
    </View>
  );
}

// ============================================
// Skeleton List Item Component
// ============================================

export interface SkeletonListItemProps {
  /** Whether to show avatar */
  showAvatar?: boolean;
  /** Number of text lines */
  lines?: number;
  /** Additional style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

export function SkeletonListItem({
  showAvatar = true,
  lines = 2,
  style,
  testID = 'skeleton-list-item',
}: SkeletonListItemProps): React.JSX.Element {
  const { mode } = useAnimatedTheme();

  return (
    <View
      style={[
        styles.listItem,
        { backgroundColor: mode === 'survival' ? '#141A14' : '#FFFFFF' },
        style,
      ]}
      testID={testID}>
      {showAvatar && (
        <Skeleton variant="circular" width={48} height={48} testID={`${testID}-avatar`} />
      )}
      <View style={styles.listItemContent}>
        <Skeleton
          variant="text"
          width="70%"
          height={16}
          style={styles.listItemTitle}
          testID={`${testID}-title`}
        />
        {Array.from({ length: lines - 1 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 2 ? '50%' : '90%'}
            height={12}
            style={styles.listItemLine}
            testID={`${testID}-line-${index}`}
          />
        ))}
      </View>
    </View>
  );
}

// ============================================
// Skeleton Header Component
// ============================================

export interface SkeletonHeaderProps {
  /** Whether to show back button placeholder */
  showBackButton?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Additional style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

export function SkeletonHeader({
  showBackButton = false,
  showActions = true,
  style,
  testID = 'skeleton-header',
}: SkeletonHeaderProps): React.JSX.Element {
  const { mode } = useAnimatedTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: mode === 'survival' ? '#0A0F0A' : '#F5F9F5' },
        style,
      ]}
      testID={testID}>
      {showBackButton && (
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          style={styles.headerBackButton}
          testID={`${testID}-back`}
        />
      )}
      <Skeleton
        variant="text"
        width={150}
        height={24}
        style={styles.headerTitle}
        testID={`${testID}-title`}
      />
      {showActions && (
        <View style={styles.headerActions}>
          <Skeleton variant="circular" width={32} height={32} testID={`${testID}-action`} />
        </View>
      )}
    </View>
  );
}

// ============================================
// Skeleton List Component (Multiple Items)
// ============================================

export interface SkeletonListProps {
  /** Number of items to show */
  count?: number;
  /** Whether to show avatars */
  showAvatars?: boolean;
  /** Additional style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

export function SkeletonList({
  count = 5,
  showAvatars = true,
  style,
  testID = 'skeleton-list',
}: SkeletonListProps): React.JSX.Element {
  return (
    <View style={style} testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonListItem
          key={index}
          showAvatar={showAvatars}
          style={styles.listItemSpacing}
          testID={`${testID}-item-${index}`}
        />
      ))}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImage: {
    marginBottom: 12,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardLine: {
    marginBottom: 6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  listItemTitle: {
    marginBottom: 6,
  },
  listItemLine: {
    marginBottom: 4,
  },
  listItemSpacing: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  headerBackButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Skeleton;
