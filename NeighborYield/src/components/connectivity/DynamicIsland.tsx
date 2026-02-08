/**
 * DynamicIsland Component
 * An interactive header component that displays connectivity status with visual feedback.
 * Shows mode-specific icons, labels, peer count badges, and radar animations.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Easing } from 'react-native';
import { ConnectivityMode } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { RadarRipple } from '../animations/RadarRipple';

// ============================================
// Types and Interfaces
// ============================================

export interface DynamicIslandProps {
  /** Current connectivity mode */
  connectivityMode: ConnectivityMode;
  /** Number of connected mesh peers */
  peerCount: number;
  /** Whether mesh discovery is active */
  isDiscovering: boolean;
  /** Callback when tapped (for cycling modes) */
  onPress?: () => void;
  /** Test ID for testing */
  testID?: string;
}

export interface ModeDisplayConfig {
  icon: string;
  label: string;
  description: string;
}

// ============================================
// Constants
// ============================================

const COLLAPSED_HEIGHT = 48;
const EXPANDED_HEIGHT = 72;
const ANIMATION_DURATION = 300;
const RADAR_SIZE = 32;

// ============================================
// Mode Configuration Utility
// Requirements: 3.1 - Display correct icon and label for each mode
// ============================================

export function getModeDisplayConfig(mode: ConnectivityMode): ModeDisplayConfig {
  switch (mode) {
    case 'online':
      return {
        icon: '📶', // wifi icon representation
        label: 'Online',
        description: 'Connected via internet',
      };
    case 'offline':
      return {
        icon: '📡', // mesh icon representation
        label: 'Mesh Active',
        description: 'Connected via local mesh',
      };
    default:
      return {
        icon: '❓',
        label: 'Unknown',
        description: 'Status unknown',
      };
  }
}

// ============================================
// Peer Count Badge Visibility
// Requirements: 3.2 - Show peer count for offline/hybrid modes
// ============================================

export function shouldShowPeerCount(mode: ConnectivityMode, peerCount: number): boolean {
  return mode === 'offline' && peerCount > 0;
}

// ============================================
// Radar Visibility
// Requirements: 3.3 - Show radar when discovering
// ============================================

export function shouldShowRadar(isDiscovering: boolean): boolean {
  return isDiscovering;
}

// ============================================
// DynamicIsland Component
// ============================================

function DynamicIslandComponent({
  connectivityMode,
  peerCount,
  isDiscovering,
  onPress,
  testID,
}: DynamicIslandProps): React.JSX.Element {
  const { mode: themeMode, tokens } = useTheme();
  const { colors } = tokens;

  // Animated values for height transitions
  // Requirements: 3.7 - Animate height when transitioning between states
  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  // Get mode display configuration
  // Requirements: 3.1 - Mode-specific icon and label
  const displayConfig = useMemo(() => getModeDisplayConfig(connectivityMode), [connectivityMode]);

  // Determine if peer count badge should be shown
  // Requirements: 3.2 - Peer count for offline/hybrid
  const showPeerCount = useMemo(
    () => shouldShowPeerCount(connectivityMode, peerCount),
    [connectivityMode, peerCount],
  );

  // Determine if radar should be shown
  // Requirements: 3.3 - Radar when discovering
  const showRadar = useMemo(() => shouldShowRadar(isDiscovering), [isDiscovering]);

  // Determine if expanded (no longer needed since we removed disconnected)
  const isExpanded = false;

  // Animate height changes
  // Requirements: 3.7 - Animated height transitions
  useEffect(() => {
    const targetHeight = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;

    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // height animation requires layout
    }).start();
  }, [isExpanded, animatedHeight]);

  // Handle press to cycle modes
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  // Dynamic styles based on theme
  // Requirements: 3.5 - Theme tokens for mode-appropriate styling
  const containerStyle = useMemo(
    () => ({
      backgroundColor: colors.backgroundCard,
      shadowColor: colors.shadowColor,
    }),
    [colors],
  );

  const labelStyle = useMemo(
    () => ({
      color: colors.textPrimary,
    }),
    [colors],
  );

  const descriptionStyle = useMemo(
    () => ({
      color: colors.textSecondary,
    }),
    [colors],
  );

  const badgeStyle = useMemo(
    () => ({
      backgroundColor: colors.accentPrimary,
    }),
    [colors],
  );

  const badgeTextStyle = useMemo(
    () => ({
      color: themeMode === 'survival' ? colors.backgroundPrimary : '#FFFFFF',
    }),
    [themeMode, colors],
  );

  // Render content
  const content = (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        { height: animatedHeight },
        themeMode === 'survival' && styles.survivalContainer,
      ]}
      testID={testID}>
      <View style={styles.mainRow}>
        {/* Radar or Icon */}
        <View style={styles.iconContainer}>
          {showRadar ? (
            <RadarRipple
              isActive={isDiscovering}
              size={RADAR_SIZE}
              color={colors.accentPrimary}
              testID={`${testID}-radar`}
            />
          ) : (
            <Text style={styles.icon}>{displayConfig.icon}</Text>
          )}
        </View>

        {/* Label and Description */}
        <View style={styles.textContainer}>
          <Text style={[styles.label, labelStyle]}>{displayConfig.label}</Text>
          <Text style={[styles.description, descriptionStyle]}>{displayConfig.description}</Text>
        </View>

        {/* Peer Count Badge */}
        {showPeerCount && (
          <View style={[styles.badge, badgeStyle]}>
            <Text style={[styles.badgeText, badgeTextStyle]}>{peerCount}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  // Wrap in Pressable to allow cycling through modes
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${displayConfig.label}. ${displayConfig.description}`}
      accessibilityHint="Tap to cycle connectivity modes">
      {content}
    </Pressable>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  survivalContainer: {
    borderRadius: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.3)',
  },
  tapHint: {
    fontSize: 12,
    textAlign: 'center',
  },
});

// ============================================
// Memoized Export
// ============================================

export const DynamicIsland = React.memo(DynamicIslandComponent);
DynamicIsland.displayName = 'DynamicIsland';

export default DynamicIsland;
