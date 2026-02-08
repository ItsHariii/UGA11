/**
 * WantPostCard Component
 * Display "Want" posts with "Coming" button and responder list
 * Text-only layout optimized for survival mode
 *
 * Requirements: 4.1-4.10 (Community Board - Want Section)
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { SurvivalPost } from '../../types';

// ============================================
// Types and Interfaces
// ============================================

export interface WantPostCardProps {
  /** The survival post to display */
  post: SurvivalPost;
  /** Callback when "Coming" button is pressed */
  onComingPress: () => void;
  /** Callback when reply button is pressed */
  onReplyPress: () => void;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// Constants
// ============================================

const CARD_PADDING = 16; // 16px padding
const SEPARATOR_HEIGHT = 1; // 1px separator line
const BUTTON_HEIGHT = 44; // Requirement 4.2: 44px minimum touch target
const EXPIRATION_TIME = 24 * 60 * 60; // 24 hours in seconds

// ============================================
// Utility Functions
// ============================================

/**
 * Formats a Unix timestamp (seconds) as relative time
 * Requirement 4.1: Show relative time (e.g., "10m ago", "2h ago")
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
 * Checks if a post has expired (24 hours old)
 * Requirement 4.10: Auto-expire posts after 24 hours
 * 
 * @param timestamp Unix timestamp in seconds
 * @returns true if post is expired
 */
export function isPostExpired(timestamp: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;
  return age >= EXPIRATION_TIME;
}

/**
 * Gets time remaining until expiration
 * Requirement 4.10: Show expiration countdown
 * 
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted time remaining string
 */
export function getExpirationCountdown(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;
  const remaining = EXPIRATION_TIME - age;
  
  if (remaining <= 0) {
    return 'Expired';
  }
  
  const hoursRemaining = Math.floor(remaining / 3600);
  const minutesRemaining = Math.floor((remaining % 3600) / 60);
  
  if (hoursRemaining > 0) {
    return `${hoursRemaining}h left`;
  } else {
    return `${minutesRemaining}m left`;
  }
}

/**
 * Formats responder house numbers
 * Requirement 4.9: Format: "#123, #125"
 * 
 * @param responders Array of house numbers as strings
 * @returns Formatted string of house numbers
 */
export function formatResponders(responders: string[]): string {
  return responders.map(h => `#${h}`).join(', ');
}

// ============================================
// WantPostCard Component
// ============================================

function WantPostCardComponent({
  post,
  onComingPress,
  onReplyPress,
  testID = 'want-post-card',
}: WantPostCardProps): React.JSX.Element {
  const { tokens } = useTheme();
  const { colors } = tokens;

  // Check if post is expired
  const expired = useMemo(() => isPostExpired(post.ts), [post.ts]);

  // Get responders
  const responders = post.r || [];
  const comingCount = responders.length;
  const hasComing = comingCount > 0;

  // Format the post text
  // Requirement 4.1: Format: "[ITEM NEEDED] - House #[NUMBER] - [TIME]"
  const formattedText = useMemo(() => {
    const item = post.i;
    const houseNumber = post.h;
    const time = formatRelativeTime(post.ts);
    
    return `${item} - House #${houseNumber} - ${time}`;
  }, [post.i, post.h, post.ts]);

  // Format coming indicator
  // Requirement 4.5: Display "2 coming" indicator
  const comingText = useMemo(() => {
    if (comingCount === 0) return null;
    if (comingCount === 1) return '1 coming';
    return `${comingCount} coming`;
  }, [comingCount]);

  // Format responder list
  // Requirement 4.9: List house numbers of responders
  const responderText = useMemo(() => {
    if (responders.length === 0) return null;
    return formatResponders(responders);
  }, [responders]);

  // Expiration countdown
  const expirationText = useMemo(() => {
    return getExpirationCountdown(post.ts);
  }, [post.ts]);

  // Accessibility label
  const accessibilityLabel = useMemo(() => {
    const expiredText = expired ? ', expired' : '';
    const comingInfo = hasComing ? `, ${comingCount} people coming` : '';
    return `Want post: ${post.i} at house number ${post.h}, posted ${formatRelativeTime(post.ts)}${comingInfo}${expiredText}`;
  }, [post.i, post.h, post.ts, comingCount, hasComing, expired]);

  return (
    <View style={styles.container} testID={testID} accessible={true} accessibilityLabel={accessibilityLabel}>
      {/* Card Container */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.backgroundCard }, // #161E1A
        ]}
      >
        {/* Post Text */}
        {/* Requirement 4.1: Text-only format */}
        <Text
          style={[
            styles.postText,
            { color: expired ? colors.textMuted : colors.textPrimary }, // #E8F5E9 or muted if expired
          ]}
          numberOfLines={2}
          testID={`${testID}-text`}
        >
          {formattedText}
        </Text>

        {/* Expiration Countdown */}
        {/* Requirement 4.10: Show expiration countdown */}
        <Text
          style={[
            styles.expirationText,
            { color: expired ? colors.accentDanger : colors.textSecondary },
          ]}
          testID={`${testID}-expiration`}
        >
          {expirationText}
        </Text>

        {/* Coming Button and Info Row */}
        <View style={styles.actionRow}>
          {/* Coming Button */}
          {/* Requirement 4.2: "Coming" button */}
          {/* Requirement 4.3: Send 1-byte ACK on press */}
          {!expired && (
            <Pressable
              onPress={onComingPress}
              style={[
                styles.comingButton,
                { backgroundColor: colors.accentSuccess }, // #4AEDC4 (green)
              ]}
              accessibilityRole="button"
              accessibilityLabel="Coming button"
              accessibilityHint="Tap to indicate you are bringing this item"
              testID={`${testID}-coming-button`}
            >
              <Text style={styles.comingButtonText}>Coming</Text>
            </Pressable>
          )}

          {/* Coming Count and Responders */}
          {/* Requirement 4.5: Display "2 coming" indicator */}
          {/* Requirement 4.6: Highlight when someone is coming (green) */}
          {hasComing && (
            <View style={styles.comingInfo}>
              <Text
                style={[
                  styles.comingCountText,
                  { color: colors.accentSuccess }, // Green highlight
                ]}
                testID={`${testID}-coming-count`}
              >
                {comingText}
              </Text>
              {/* Requirement 4.9: Show responder house numbers */}
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

          {/* Reply Button */}
          {/* Requirement 4.4: Allow leaving a reply with house number */}
          {!expired && (
            <Pressable
              onPress={onReplyPress}
              style={styles.replyButton}
              accessibilityRole="button"
              accessibilityLabel="Reply button"
              accessibilityHint="Tap to leave a reply with your house number"
              testID={`${testID}-reply-button`}
            >
              <Text style={[styles.replyButtonText, { color: colors.textSecondary }]}>
                Reply
              </Text>
            </Pressable>
          )}
        </View>
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
  },
  postText: {
    fontSize: 16, // Body text size
    lineHeight: 24, // 1.5 line height for readability
    fontFamily: 'System',
    marginBottom: 8,
  },
  expirationText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'System',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  comingButton: {
    // Requirement 4.2: 44px height (minimum touch target)
    height: BUTTON_HEIGHT,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Requirement 4.2: Green color (#4AEDC4) - set dynamically
  },
  comingButtonText: {
    color: '#000000', // Black text on green button for contrast
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  comingInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  comingCountText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
    // Requirement 4.6: Green highlight - set dynamically
  },
  responderText: {
    fontSize: 12,
    fontFamily: 'System',
    // Requirement 4.9: Format: "#123, #125"
  },
  replyButton: {
    height: BUTTON_HEIGHT,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyButtonText: {
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

export const WantPostCard = React.memo(WantPostCardComponent);
WantPostCard.displayName = 'WantPostCard';

export default WantPostCard;
