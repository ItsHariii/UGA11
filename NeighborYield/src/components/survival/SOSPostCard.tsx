/**
 * SOSPostCard Component
 * Display emergency SOS posts with "Responding" button and resolution functionality
 * Sticky layout (always at top) with red accent and high priority
 *
 * Requirements: 5.1-5.10 (SOS / Help Board)
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { SurvivalPost } from '../../types';

// ============================================
// Types and Interfaces
// ============================================

export interface SOSPostCardProps {
  /** The SOS survival post to display */
  post: SurvivalPost;
  /** Callback when "Responding" button is pressed */
  onRespondPress: () => void;
  /** Callback when "Mark Resolved" button is pressed (only for post author) */
  onResolvePress: () => void;
  /** Whether the current user is the post author */
  isAuthor?: boolean;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// Constants
// ============================================

const CARD_PADDING = 16; // 16px padding
const SEPARATOR_HEIGHT = 1; // 1px separator line
const BUTTON_HEIGHT = 44; // Requirement 5.4: 44px minimum touch target
const BORDER_WIDTH = 2; // Red border width

// Category display names and colors
const CATEGORY_INFO = {
  m: { label: 'Medical', color: '#FF5252' }, // Red
  s: { label: 'Safety', color: '#FFAB00' },  // Yellow
  f: { label: 'Fire', color: '#FF6B35' },    // Orange-red
  o: { label: 'Other', color: '#9E9E9E' },   // Gray
} as const;

// ============================================
// Utility Functions
// ============================================

/**
 * Formats a Unix timestamp (seconds) as relative time
 * Requirement 5.3: Show relative time
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

/**
 * Formats responder house numbers
 * Requirement 5.5: Show list of responders with house numbers
 * 
 * @param responders Array of house numbers as strings
 * @returns Formatted string of house numbers
 */
export function formatResponders(responders: string[]): string {
  return responders.map(h => `#${h}`).join(', ');
}

/**
 * Gets category information for display
 * Requirement 5.10: Support categories: Medical, Safety, Fire, Other
 * 
 * @param category Category code
 * @returns Category label and color
 */
export function getCategoryInfo(category?: 'm' | 's' | 'f' | 'o') {
  if (!category) {
    return CATEGORY_INFO.o; // Default to "Other"
  }
  return CATEGORY_INFO[category];
}

// ============================================
// SOSPostCard Component
// ============================================

function SOSPostCardComponent({
  post,
  onRespondPress,
  onResolvePress,
  isAuthor = false,
  testID = 'sos-post-card',
}: SOSPostCardProps): React.JSX.Element {
  const { tokens } = useTheme();
  const { colors } = tokens;

  // Get responders
  const responders = post.r || [];
  const respondingCount = responders.length;
  const hasResponders = respondingCount > 0;

  // Check if resolved
  const isResolved = post.resolved === true;

  // Get category info
  const categoryInfo = useMemo(() => getCategoryInfo(post.c), [post.c]);

  // Format the post text
  // Requirement 5.3: Format: "⚠️ [EMERGENCY] - House #[NUMBER] - [TIME]"
  const formattedText = useMemo(() => {
    const item = post.i;
    const houseNumber = post.h;
    const time = formatRelativeTime(post.ts);
    
    return `⚠️ ${item} - House #${houseNumber} - ${time}`;
  }, [post.i, post.h, post.ts]);

  // Format responding indicator
  // Requirement 5.5: Show list of responders
  const respondingText = useMemo(() => {
    if (respondingCount === 0) return null;
    if (respondingCount === 1) return '1 responding';
    return `${respondingCount} responding`;
  }, [respondingCount]);

  // Format responder list
  const responderText = useMemo(() => {
    if (responders.length === 0) return null;
    return formatResponders(responders);
  }, [responders]);

  // Accessibility label
  const accessibilityLabel = useMemo(() => {
    const resolvedText = isResolved ? ', resolved' : '';
    const respondingInfo = hasResponders ? `, ${respondingCount} people responding` : '';
    const categoryText = `, category: ${categoryInfo.label}`;
    return `SOS emergency post: ${post.i} at house number ${post.h}, posted ${formatRelativeTime(post.ts)}${categoryText}${respondingInfo}${resolvedText}`;
  }, [post.i, post.h, post.ts, respondingCount, hasResponders, isResolved, categoryInfo.label]);

  return (
    <View style={styles.container} testID={testID} accessible={true} accessibilityLabel={accessibilityLabel}>
      {/* Card Container with Red Border */}
      {/* Requirement 5.2: Red accent color (#FF5252), red border */}
      <View
        style={[
          styles.card,
          { 
            backgroundColor: colors.backgroundCard, // #161E1A
            borderColor: colors.accentDanger, // #FF5252 (red)
            borderWidth: BORDER_WIDTH,
            opacity: isResolved ? 0.6 : 1, // Dim resolved posts
          },
        ]}
      >
        {/* Header Row with Alert Icon and Category Badge */}
        <View style={styles.headerRow}>
          {/* Alert Icon */}
          {/* Requirement 5.9: Alert icon (⚠️) */}
          <Text style={styles.alertIcon} testID={`${testID}-alert-icon`}>
            ⚠️
          </Text>

          {/* Category Badge */}
          {/* Requirement 5.10: Support categories with color-coded badges */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryInfo.color },
            ]}
            testID={`${testID}-category-badge`}
          >
            <Text style={styles.categoryText}>{categoryInfo.label}</Text>
          </View>

          {/* Resolved Badge */}
          {isResolved && (
            <View
              style={[
                styles.resolvedBadge,
                { backgroundColor: colors.textMuted },
              ]}
              testID={`${testID}-resolved-badge`}
            >
              <Text style={styles.resolvedText}>RESOLVED</Text>
            </View>
          )}
        </View>

        {/* Post Text */}
        {/* Requirement 5.3: Format with emergency indicator */}
        <Text
          style={[
            styles.postText,
            { color: colors.textPrimary }, // White (#E8F5E9)
          ]}
          numberOfLines={3}
          testID={`${testID}-text`}
        >
          {formattedText}
        </Text>

        {/* Action Buttons and Responder Info */}
        {!isResolved && (
          <View style={styles.actionRow}>
            {/* Responding Button */}
            {/* Requirement 5.4: "Responding" button with 44px height, red color */}
            <Pressable
              onPress={onRespondPress}
              style={[
                styles.respondingButton,
                { backgroundColor: colors.accentDanger }, // #FF5252 (red)
              ]}
              accessibilityRole="button"
              accessibilityLabel="Responding button"
              accessibilityHint="Tap to indicate you are responding to this emergency"
              testID={`${testID}-responding-button`}
            >
              <Text style={styles.respondingButtonText}>Responding</Text>
            </Pressable>

            {/* Responding Count and Responders */}
            {/* Requirement 5.5: Show list of responders with house numbers */}
            {hasResponders && (
              <View style={styles.respondingInfo}>
                <Text
                  style={[
                    styles.respondingCountText,
                    { color: colors.accentDanger }, // Red highlight
                  ]}
                  testID={`${testID}-responding-count`}
                >
                  {respondingText}
                </Text>
                {responderText && (
                  <Text
                    style={[
                      styles.responderText,
                      { color: colors.textSecondary },
                    ]}
                    testID={`${testID}-responders`}
                  >
                    {responderText}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Mark Resolved Button (only for author) */}
        {/* Requirement 5.8: "Mark Resolved" button for post author */}
        {isAuthor && !isResolved && (
          <Pressable
            onPress={onResolvePress}
            style={[
              styles.resolveButton,
              { borderColor: colors.textMuted },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Mark resolved button"
            accessibilityHint="Tap to mark this emergency as resolved"
            testID={`${testID}-resolve-button`}
          >
            <Text style={[styles.resolveButtonText, { color: colors.textSecondary }]}>
              Mark Resolved
            </Text>
          </Pressable>
        )}
      </View>

      {/* Separator Line */}
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
    padding: CARD_PADDING,
    // Background #161E1A (set dynamically from theme)
    // Border color and width set dynamically
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  alertIcon: {
    fontSize: 20,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  resolvedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  resolvedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  postText: {
    fontSize: 16, // Body text size
    lineHeight: 24, // 1.5 line height for readability
    fontFamily: 'System',
    marginBottom: 12,
    fontWeight: '600', // Bold for emergency emphasis
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  respondingButton: {
    // Requirement 5.4: 44px height (minimum touch target)
    height: BUTTON_HEIGHT,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Requirement 5.4: Red color (#FF5252) - set dynamically
  },
  respondingButtonText: {
    color: '#FFFFFF', // White text on red button
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  respondingInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  respondingCountText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
    // Red highlight - set dynamically
  },
  responderText: {
    fontSize: 12,
    fontFamily: 'System',
  },
  resolveButton: {
    height: BUTTON_HEIGHT,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  resolveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  separator: {
    height: SEPARATOR_HEIGHT,
    width: '100%',
  },
});

// ============================================
// Memoized Export
// ============================================

export const SOSPostCard = React.memo(SOSPostCardComponent);
SOSPostCard.displayName = 'SOSPostCard';

export default SOSPostCard;
