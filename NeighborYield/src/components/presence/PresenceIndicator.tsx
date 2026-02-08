/**
 * PresenceIndicator Component
 * Displays "X neighbors in range" or "No neighbors in range" with
 * muted style when no peers and animation on count increase.
 *
 * Requirements: 3.6, 4.1, 4.2, 4.3
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ConnectivityMode } from '../../types';

export interface PresenceIndicatorProps {
  peerCount: number;
  connectivityMode: ConnectivityMode;
  onPress?: () => void;
}

/**
 * Formats the peer count display string
 * Property 11: Peer Count Display Format
 * For N >= 1: "N neighbors in range"
 * For N = 0: "No neighbors in range"
 */
export function formatPeerCountDisplay(count: number): string {
  if (count === 0) {
    return 'No neighbors in range';
  }
  if (count === 1) {
    return '1 neighbor in range';
  }
  return `${count} neighbors in range`;
}

/**
 * Determines if the indicator should be visible based on connectivity mode
 * Property 12: Online-Only Mode Indicator
 */
export function shouldShowIndicator(mode: ConnectivityMode): boolean {
  return mode !== 'online';
}

/**
 * Returns the display text for online-only mode
 */
export function getOnlineModeText(): string {
  return 'Online mode';
}

export function PresenceIndicator({
  peerCount,
  connectivityMode,
  onPress,
}: PresenceIndicatorProps): React.JSX.Element | null {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCountRef = useRef(peerCount);

  // Animate when peer count increases
  useEffect(() => {
    if (peerCount > prevCountRef.current) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCountRef.current = peerCount;
  }, [peerCount, scaleAnim]);

  const isOnlineOnly = connectivityMode === 'online';
  const hasPeers = peerCount > 0;

  const displayText = isOnlineOnly ? getOnlineModeText() : formatPeerCountDisplay(peerCount);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={displayText}
      accessibilityHint="Tap to see mesh network status">
      <Animated.View
        style={[
          styles.container,
          !hasPeers && !isOnlineOnly && styles.mutedContainer,
          isOnlineOnly && styles.onlineContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{isOnlineOnly ? '🌐' : hasPeers ? '📡' : '📴'}</Text>
        </View>
        <Text
          style={[
            styles.text,
            !hasPeers && !isOnlineOnly && styles.mutedText,
            isOnlineOnly && styles.onlineText,
          ]}>
          {displayText}
        </Text>
        {hasPeers && !isOnlineOnly && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{peerCount}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  mutedContainer: {
    backgroundColor: '#f5f5f5',
  },
  onlineContainer: {
    backgroundColor: '#e3f2fd',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
  },
  mutedText: {
    color: '#9e9e9e',
  },
  onlineText: {
    color: '#1976d2',
  },
  badge: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});

// ============================================
// Memoized Export
// Requirements: 9.2 - Minimize component re-renders using React.memo
// ============================================

export const MemoizedPresenceIndicator = React.memo(PresenceIndicator);
MemoizedPresenceIndicator.displayName = 'PresenceIndicator';

export default MemoizedPresenceIndicator;
