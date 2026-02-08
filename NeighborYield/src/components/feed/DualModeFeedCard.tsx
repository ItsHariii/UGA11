/**
 * DualModeFeedCard Component
 * A feed card that adapts its appearance based on the current theme mode.
 * - Abundance mode: Rich imagery, soft shadows, rounded corners
 * - Survival mode: Lucide icons, sharp corners, compact layout
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, ViewStyle, TextStyle } from 'react-native';
import { Carrot, Milk, Croissant, Soup, Package, Box, LucideIcon } from 'lucide-react-native';
import { SharePost, RiskTier } from '../../types';
import { ThemeMode } from '../../theme/ThemeContext';
import { DesignTokens, abundanceDesignTokens, survivalDesignTokens } from '../../theme/tokens';
import { formatRelativeTime, isInWarningState, getRiskTierLabel } from './SharePostCard';
import { InterestedButton, InterestButtonState } from './InterestedButton';

export type CardSize = 'small' | 'wide' | 'tall' | 'featured';

export interface DualModeFeedCardProps {
  post: SharePost;
  mode: ThemeMode;
  size: CardSize;
  interestState: InterestButtonState;
  onInterestPress: (postId: string) => void;
  currentTime?: number;
  testID?: string;
}

export interface ModeStyleConfig {
  borderRadius: number;
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
  padding: number;
  showImages: boolean;
  compactLayout: boolean;
}

export const abundanceModeConfig: ModeStyleConfig = {
  borderRadius: 12,
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  padding: 16,
  showImages: true,
  compactLayout: false,
};

export const survivalModeConfig: ModeStyleConfig = {
  borderRadius: 2,
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
  padding: 8,
  showImages: false,
  compactLayout: true,
};

export function getModeConfig(mode: ThemeMode): ModeStyleConfig {
  return mode === 'survival' ? survivalModeConfig : abundanceModeConfig;
}

export type PostCategory = 'produce' | 'dairy' | 'bakery' | 'prepared' | 'pantry' | 'other';

export function getCategoryFromPost(post: SharePost): PostCategory {
  const text = (post.title + ' ' + post.description).toLowerCase();

  if (
    text.includes('vegetable') ||
    text.includes('fruit') ||
    text.includes('produce') ||
    text.includes('fresh')
  ) {
    return 'produce';
  }
  if (
    text.includes('milk') ||
    text.includes('cheese') ||
    text.includes('dairy') ||
    text.includes('yogurt')
  ) {
    return 'dairy';
  }
  if (
    text.includes('bread') ||
    text.includes('bakery') ||
    text.includes('pastry') ||
    text.includes('cake')
  ) {
    return 'bakery';
  }
  if (
    text.includes('meal') ||
    text.includes('cooked') ||
    text.includes('prepared') ||
    text.includes('soup')
  ) {
    return 'prepared';
  }
  if (
    text.includes('canned') ||
    text.includes('pantry') ||
    text.includes('dry') ||
    text.includes('rice')
  ) {
    return 'pantry';
  }
  return 'other';
}

export function getCategoryIconComponent(category: PostCategory): LucideIcon {
  const icons: Record<PostCategory, LucideIcon> = {
    produce: Carrot,
    dairy: Milk,
    bakery: Croissant,
    prepared: Soup,
    pantry: Package,
    other: Box,
  };
  return icons[category];
}

export function getCategoryIcon(category: PostCategory): string {
  const icons: Record<PostCategory, string> = {
    produce: '🥬',
    dairy: '🧀',
    bakery: '🍞',
    prepared: '🍲',
    pantry: '🥫',
    other: '📦',
  };
  return icons[category];
}

export interface RiskTierStyle {
  backgroundColor: string;
  textColor: string;
}

export function getRiskTierStyle(tier: RiskTier, mode: ThemeMode): RiskTierStyle {
  const tokens = mode === 'survival' ? survivalDesignTokens : abundanceDesignTokens;

  const riskStyles: Record<RiskTier, RiskTierStyle> = {
    high: {
      backgroundColor: tokens.colors.accentDanger,
      textColor: mode === 'survival' ? '#000000' : '#FFFFFF',
    },
    medium: {
      backgroundColor: tokens.colors.accentWarning,
      textColor: '#000000',
    },
    low: {
      backgroundColor: tokens.colors.accentSuccess,
      textColor: mode === 'survival' ? '#000000' : '#FFFFFF',
    },
  };

  return riskStyles[tier];
}

function DualModeFeedCardComponent({
  post,
  mode,
  size: _size,
  interestState,
  onInterestPress,
  currentTime = Date.now(),
  testID,
}: DualModeFeedCardProps): React.JSX.Element {
  const tokens: DesignTokens = mode === 'survival' ? survivalDesignTokens : abundanceDesignTokens;
  const config = getModeConfig(mode);

  const borderRadiusAnim = useRef(new Animated.Value(config.borderRadius)).current;
  const paddingAnim = useRef(new Animated.Value(config.padding)).current;
  const shadowOpacityAnim = useRef(new Animated.Value(config.shadowOpacity)).current;

  useEffect(() => {
    const targetConfig = getModeConfig(mode);

    Animated.parallel([
      Animated.timing(borderRadiusAnim, {
        toValue: targetConfig.borderRadius,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(paddingAnim, {
        toValue: targetConfig.padding,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(shadowOpacityAnim, {
        toValue: targetConfig.shadowOpacity,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [mode, borderRadiusAnim, paddingAnim, shadowOpacityAnim]);

  const relativeTime = useMemo(
    () => formatRelativeTime(post.createdAt, currentTime),
    [post.createdAt, currentTime],
  );

  const showWarning = useMemo(
    () => isInWarningState(post.expiresAt, currentTime),
    [post.expiresAt, currentTime],
  );

  const category = useMemo(() => getCategoryFromPost(post), [post]);
  const CategoryIcon = getCategoryIconComponent(category);
  const riskTierStyle = getRiskTierStyle(post.riskTier, mode);

  const handleInterestPress = useCallback(() => {
    onInterestPress(post.id);
  }, [onInterestPress, post.id]);

  const showImage = config.showImages && post.location;

  const containerStyle: Animated.WithAnimatedObject<ViewStyle> = {
    backgroundColor: tokens.colors.backgroundCard,
    borderRadius: borderRadiusAnim,
    padding: paddingAnim,
    borderWidth: mode === 'survival' ? 1 : 0,
    borderColor: showWarning ? tokens.colors.accentWarning : tokens.colors.borderDefault,
    shadowColor: tokens.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: shadowOpacityAnim,
    shadowRadius: config.shadowRadius,
    elevation: config.elevation,
  };

  const titleStyle: TextStyle = {
    fontSize: config.compactLayout ? tokens.typography.fontSizeMd : tokens.typography.fontSizeLg,
    fontWeight: tokens.typography.fontWeightBold as TextStyle['fontWeight'],
    color: tokens.colors.textPrimary,
    marginBottom: config.compactLayout ? 4 : 8,
  };

  const descriptionStyle: TextStyle = {
    fontSize: config.compactLayout ? tokens.typography.fontSizeSm : tokens.typography.fontSizeMd,
    color: tokens.colors.textSecondary,
    lineHeight: config.compactLayout ? 16 : 20,
    marginBottom: config.compactLayout ? 8 : 12,
  };

  const authorStyle: TextStyle = {
    fontSize: config.compactLayout ? tokens.typography.fontSizeXs : tokens.typography.fontSizeSm,
    color: tokens.colors.textAccent,
    fontWeight: tokens.typography.fontWeightMedium as TextStyle['fontWeight'],
  };

  const timeStyle: TextStyle = {
    fontSize: tokens.typography.fontSizeXs,
    color: showWarning ? tokens.colors.accentWarning : tokens.colors.textMuted,
    fontWeight: showWarning
      ? (tokens.typography.fontWeightMedium as TextStyle['fontWeight'])
      : undefined,
  };

  const buttonContainerStyle = config.compactLayout
    ? styles.buttonContainerCompact
    : styles.buttonContainer;

  const accessibilityLabel = post.title + ' by ' + post.authorIdentifier;

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}>
      <View style={styles.header}>
        {mode === 'survival' && (
          <View style={[styles.categoryIcon, styles.categoryIconBg]}>
            <CategoryIcon size={18} color={tokens.colors.textAccent} strokeWidth={2} />
          </View>
        )}

        <View style={[styles.riskBadge, { backgroundColor: riskTierStyle.backgroundColor }]}>
          <Text style={[styles.riskBadgeText, { color: riskTierStyle.textColor }]}>
            {getRiskTierLabel(post.riskTier)}
          </Text>
        </View>

        {showWarning && (
          <View style={[styles.warningBadge, styles.warningBadgeBg]}>
            <Text style={[styles.warningBadgeText, { color: tokens.colors.accentWarning }]}>
              ⚠ Expiring
            </Text>
          </View>
        )}
      </View>

      {showImage && mode === 'abundance' && (
        <View style={[styles.imagePlaceholder, styles.imagePlaceholderBg]}>
          <CategoryIcon size={48} color={tokens.colors.textMuted} strokeWidth={1.5} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={titleStyle} numberOfLines={config.compactLayout ? 1 : 2}>
          {post.title}
        </Text>

        <Text style={descriptionStyle} numberOfLines={config.compactLayout ? 2 : 3}>
          {post.description}
        </Text>

        <View style={styles.footer}>
          <Text style={authorStyle}>{post.authorIdentifier}</Text>
          <Text style={timeStyle}>{relativeTime}</Text>
        </View>
      </View>

      <View style={buttonContainerStyle}>
        <InterestedButton state={interestState} onPress={handleInterestPress} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconBg: {
    backgroundColor: '#141A14',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  warningBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  warningBadgeBg: {
    backgroundColor: 'rgba(255, 171, 0, 0.125)',
  },
  warningBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imagePlaceholder: {
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderBg: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 12,
  },
  buttonContainerCompact: {
    marginTop: 8,
  },
});

export const DualModeFeedCard = React.memo(DualModeFeedCardComponent);

DualModeFeedCard.displayName = 'DualModeFeedCard';

export default DualModeFeedCard;
