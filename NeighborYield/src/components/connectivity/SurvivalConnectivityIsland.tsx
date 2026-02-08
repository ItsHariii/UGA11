/**
 * SurvivalConnectivityIsland Component
 * Simplified header showing mesh network status, battery level, and last sync time
 * Optimized for survival mode with minimal animations and OLED-friendly colors
 *
 * Requirements: 1.1-1.10 (Simplified Connectivity Island)
 */

import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Easing } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

// ============================================
// Types and Interfaces
// ============================================

export interface SurvivalConnectivityIslandProps {
  /** Number of connected mesh peers */
  peerCount: number;
  /** Whether mesh discovery is active */
  isDiscovering: boolean;
  /** Battery level (0-100) */
  batteryLevel: number;
  /** Last sync timestamp (Unix milliseconds) */
  lastSyncTime: number;
  /** Callback when tapped to show connection details */
  onPress?: () => void;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// Constants
// ============================================

const ISLAND_HEIGHT = 48; // Requirement 1.5: 48px height (reduced from 60px)
const PULSE_DURATION = 2000; // 2 second pulse cycle
const PULSE_MIN_OPACITY = 0.3;
const PULSE_MAX_OPACITY = 0.7;

// Battery color thresholds
const BATTERY_HIGH = 50;
const BATTERY_MEDIUM = 20;

// ============================================
// Utility Functions
// ============================================

/**
 * Formats a timestamp as relative time (e.g., "2m ago", "1h ago")
 * Requirement 1.8: Display relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else {
    return `${diffDays}d`;
  }
}

/**
 * Gets battery color based on level
 * Requirement 2.3: Color code based on level (green/yellow/red)
 */
export function getBatteryColor(level: number): string {
  if (level > BATTERY_HIGH) {
    return '#4AEDC4'; // Green (survival accent)
  } else if (level > BATTERY_MEDIUM) {
    return '#FFAB00'; // Yellow (warning)
  } else {
    return '#FF5252'; // Red (danger)
  }
}

/**
 * Gets battery icon based on level
 */
export function getBatteryIcon(level: number): string {
  if (level > 75) {
    return '🔋'; // Full battery
  } else if (level > 50) {
    return '🔋'; // Good battery
  } else if (level > 25) {
    return '🪫'; // Medium battery
  } else {
    return '🪫'; // Low battery
  }
}

// ============================================
// SurvivalConnectivityIsland Component
// ============================================

function SurvivalConnectivityIslandComponent({
  peerCount,
  isDiscovering,
  batteryLevel,
  lastSyncTime,
  onPress,
  testID = 'survival-connectivity-island',
}: SurvivalConnectivityIslandProps): React.JSX.Element {
  const { tokens } = useTheme();
  const { colors } = tokens;

  // State for relative time updates
  const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(lastSyncTime));

  // Animated value for pulse animation
  // Requirement 1.2: Searching state with dim pulse animation
  const pulseAnim = useRef(new Animated.Value(PULSE_MIN_OPACITY)).current;

  // Update relative time every minute
  // Requirement 2.4: Update every minute
  useEffect(() => {
    const updateTime = () => {
      setRelativeTime(formatRelativeTime(lastSyncTime));
    };

    // Update immediately
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [lastSyncTime]);

  // Pulse animation for searching state
  // Requirement 1.4: Use minimal animations (< 30fps)
  useEffect(() => {
    if (isDiscovering) {
      // Start pulse animation
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: PULSE_MAX_OPACITY,
            duration: PULSE_DURATION / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: PULSE_MIN_OPACITY,
            duration: PULSE_DURATION / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
    
    // Reset to full opacity when not discovering
    pulseAnim.setValue(1);
    return undefined;
  }, [isDiscovering, pulseAnim]);

  // Handle press
  // Requirement 2.5: Make island tappable
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  // Determine status text
  // Requirement 1.2: Show two states (Searching/Connected)
  // Requirement 1.3: Display peer count
  const statusText = useMemo(() => {
    if (isDiscovering && peerCount === 0) {
      return 'Searching...';
    } else if (peerCount === 0) {
      return 'No neighbors';
    } else if (peerCount === 1) {
      return '1 neighbor';
    } else {
      return `${peerCount} neighbors`;
    }
  }, [isDiscovering, peerCount]);

  // Battery color
  const batteryColor = useMemo(() => getBatteryColor(batteryLevel), [batteryLevel]);
  const batteryIcon = useMemo(() => getBatteryIcon(batteryLevel), [batteryLevel]);

  // Accessibility label
  // Requirement 2.5: Add accessibility labels
  const accessibilityLabel = useMemo(() => {
    const status = isDiscovering ? 'Searching for neighbors' : `Connected to ${peerCount} neighbors`;
    const battery = `Battery ${batteryLevel} percent`;
    const sync = `Last synced ${relativeTime} ago`;
    return `${status}. ${battery}. ${sync}`;
  }, [isDiscovering, peerCount, batteryLevel, relativeTime]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Tap to show connection details"
      testID={testID}
    >
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        {/* Status Indicator and Text */}
        <View style={styles.statusSection}>
          {/* Animated Status Indicator */}
          <Animated.View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: colors.accentPrimary,
                opacity: isDiscovering ? pulseAnim : 1,
              },
            ]}
            testID={`${testID}-indicator`}
          />

          {/* Mesh Icon */}
          <Text style={styles.icon}>📡</Text>

          {/* Status Label */}
          <Text style={[styles.statusText, { color: colors.textPrimary }]}>
            Mesh Active
          </Text>

          {/* Separator */}
          <Text style={[styles.separator, { color: colors.textSecondary }]}>|</Text>

          {/* Peer Count */}
          <Text style={[styles.peerCount, { color: colors.textSecondary }]}>
            {statusText}
          </Text>
        </View>

        {/* Battery and Sync Section */}
        <View style={styles.infoSection}>
          {/* Battery Indicator */}
          <View style={styles.batteryContainer}>
            <Text style={styles.batteryIcon}>{batteryIcon}</Text>
            <Text style={[styles.batteryText, { color: batteryColor }]}>
              {batteryLevel}%
            </Text>
          </View>

          {/* Last Sync Time */}
          <Text style={[styles.syncTime, { color: colors.textMuted }]}>
            {relativeTime}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    height: ISLAND_HEIGHT, // Requirement 1.5: 48px height
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    // Requirement 1.7: Dark background (#0D1210)
    // Requirement 1.10: OLED-friendly colors (pure black)
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    // Requirement 1.2: Solid indicator for connected, pulse for searching
  },
  icon: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 14, // Requirement 1.6: System fonts only
    fontWeight: '600',
  },
  separator: {
    fontSize: 14,
    fontWeight: '300',
  },
  peerCount: {
    fontSize: 14,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryIcon: {
    fontSize: 14,
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '600',
    // Requirement 2.3: Color coded based on level
  },
  syncTime: {
    fontSize: 14,
    // Requirement 2.4: Display relative time
  },
});

// ============================================
// Memoized Export
// ============================================

export const SurvivalConnectivityIsland = React.memo(SurvivalConnectivityIslandComponent);
SurvivalConnectivityIsland.displayName = 'SurvivalConnectivityIsland';

export default SurvivalConnectivityIsland;
