/**
 * HavePostCard Component
 * Display "Have" posts with house number for pickup
 * Text-only layout optimized for survival mode
 *
 * Requirements: 3.1-3.10 (Community Board - Have Section)
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { SurvivalPost } from '../../types';

// ============================================
// Types and Interfaces
// ============================================

export interface HavePostCardProps {
  /** The survival post to display */
  post: SurvivalPost;
  /** Callback when card is pressed */
  onPress: () => void;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// Constants
// ============================================

const CARD_PADDING = 16; // Requirement 3.7: 16px padding
const SEPARATOR_HEIGHT = 1; // Requirement 3.8: 1px separator line

// ============================================
// Utility Functions
// ============================================

/**
 * Formats a Unix timestamp (seconds) as relative time
 * Requirement 3.4: Show relative time (e.g., "10m ago", "2h ago")
 * 
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000); // Convert to Unix seconds
  const diffSeconds = now - timestamp;
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

// ============================================
// HavePostCard Component
// ============================================

function HavePostCardComponent({
  post,
  onPress,
  testID = 'have-post-card',
}: HavePostCardProps): React.JSX.Element {
  const { tokens } = useTheme();
  const { colors, spacing } = tokens;

  // Check if post is claimed
  // Requirement 3.10: Show "CLAIMED" badge if taken
  const isClaimed = post.resolved === true;

  // Format the post text
  // Requirement 3.1: Format: "[ITEM] - House #[NUMBER] - [TIME]"
  const formattedText = useMemo(() => {
    const item = post.i;
    const houseNumber = post.h;
    const time = formatRelativeTime(post.ts);
    
    return `${item} - House #${houseNumber} - ${time}`;
  }, [post.i, post.h, post.ts]);

  // Accessibility label
  const accessibilityLabel = useMemo(() => {
    const claimedText = isClaimed ? ', claimed' : '';
    return `Have post: ${post.i} at house number ${post.h}, posted ${formatRelativeTime(post.ts)}${claimedText}`;
  }, [post.i, post.h, post.ts, isClaimed]);

  const accessibilityHint = useMemo(() => {
    return isClaimed 
      ? 'This item has been claimed'
      : 'Tap to view full details and contact information';
  }, [isClaimed]);

  return (
    <View style={styles.container} testID={testID}>
      {/* Pressable Card */}
      {/* Requirement 3.9: Tappable to show full details */}
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          { backgroundColor: colors.backgroundCard }, // #161E1A
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessible={true}
        testID={`${testID}-pressable`}
      >
        {/* Post Text */}
        {/* Requirement 3.2: Text-only (no images) */}
        {/* Requirement 3.6: White text on dark background */}
        <Text
          style={[
            styles.postText,
            { color: isClaimed ? colors.textMuted : colors.textPrimary }, // #E8F5E9 or muted if claimed
          ]}
          numberOfLines={2}
          testID={`${testID}-text`}
        >
          {formattedText}
        </Text>

        {/* Claimed Badge */}
        {/* Requirement 3.10: Show "CLAIMED" badge if taken */}
        {isClaimed && (
          <View style={styles.badgeContainer}>
            <Text
              style={[styles.badgeText, { color: colors.textMuted }]}
              testID={`${testID}-claimed-badge`}
            >
              CLAIMED
            </Text>
          </View>
        )}
      </Pressable>

      {/* Separator Line */}
      {/* Requirement 3.8: 1px separator line */}
      <View
        style={[
          styles.separator,
          { backgroundColor: colors.borderDefault }, // #2A3A30
        ]}
        testID={`${testID}-separator`}
      />
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    // Requirement 3.7: 16px padding
    padding: CARD_PADDING,
    // Requirement 3.2: Background #161E1A (set dynamically from theme)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postText: {
    flex: 1,
    // Requirement 3.6: White text (#E8F5E9) - set dynamically from theme
    fontSize: 16, // Body text size
    lineHeight: 24, // 1.5 line height for readability
    // Requirement 3.3: Monospace font for house numbers
    // Note: Using system font for consistency, but house numbers are clearly marked with #
    fontFamily: 'System',
  },
  badgeContainer: {
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    // Requirement 3.10: Gray "CLAIMED" text
  },
  separator: {
    // Requirement 3.8: 1px separator line (#2A3A30)
    height: SEPARATOR_HEIGHT,
    width: '100%',
  },
});

// ============================================
// Memoized Export
// ============================================

export const HavePostCard = React.memo(HavePostCardComponent);
HavePostCard.displayName = 'HavePostCard';

export default HavePostCard;
