/**
 * GradientHeader Component
 * A header component with mode-transitioning gradient background.
 * Integrates with AnimatedThemeProvider for smooth color transitions.
 *
 * Requirements: 10.1
 */

import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Platform, StatusBar } from 'react-native';
import { useAnimatedTheme, ThemeMode } from '../../theme';

// ============================================
// Gradient Colors by Mode
// ============================================

export interface GradientColors {
  start: string;
  middle: string;
  end: string;
}

export const abundanceGradientColors: GradientColors = {
  start: '#4CAF50', // Primary green
  middle: '#66BB6A', // Success green
  end: '#81C784', // Secondary green
};

export const survivalGradientColors: GradientColors = {
  start: '#0A0F0A', // Dark background
  middle: '#141A14', // Secondary dark
  end: '#1A221A', // Card dark
};

/**
 * Get gradient colors for a given theme mode
 */
export function getGradientColorsForMode(mode: ThemeMode): GradientColors {
  return mode === 'survival' ? survivalGradientColors : abundanceGradientColors;
}

// ============================================
// Component Props
// ============================================

export interface GradientHeaderProps {
  /** Child components to render inside the header */
  children?: ReactNode;

  /** Custom height for the header */
  height?: number;

  /** Whether to include safe area padding for status bar */
  includeSafeArea?: boolean;

  /** Additional style for the container */
  style?: ViewStyle;

  /** Test ID for testing */
  testID?: string;
}

// ============================================
// Default Values
// ============================================

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

// ============================================
// GradientHeader Component
// Requirements: 10.1 - gradient header that transitions with connectivity mode
// ============================================

export function GradientHeader({
  children,
  height,
  includeSafeArea = true,
  style,
  testID = 'gradient-header',
}: GradientHeaderProps): React.JSX.Element {
  const { mode, animatedColors, isTransitioning, transitionProgress } = useAnimatedTheme();

  // Get gradient colors based on current mode
  const gradientColors = useMemo(() => getGradientColorsForMode(mode), [mode]);

  // Calculate padding for safe area
  const paddingTop = includeSafeArea ? STATUS_BAR_HEIGHT : 0;

  // Use animated background color for smooth transitions
  // The gradient effect is simulated using layered views with opacity
  const containerStyle: ViewStyle = useMemo(
    () => ({
      ...(height && { height: height + paddingTop }),
      paddingTop,
      backgroundColor: animatedColors.backgroundPrimary,
    }),
    [height, paddingTop, animatedColors.backgroundPrimary],
  );

  return (
    <View style={[styles.container, containerStyle, style]} testID={testID}>
      {/* Gradient layer - start color */}
      <View
        style={[
          styles.gradientLayer,
          styles.gradientStart,
          { backgroundColor: gradientColors.start },
        ]}
        testID={`${testID}-gradient-start`}
      />

      {/* Gradient layer - middle color */}
      <View
        style={[
          styles.gradientLayer,
          styles.gradientMiddle,
          { backgroundColor: gradientColors.middle },
        ]}
        testID={`${testID}-gradient-middle`}
      />

      {/* Gradient layer - end color */}
      <View
        style={[styles.gradientLayer, styles.gradientEnd, { backgroundColor: gradientColors.end }]}
        testID={`${testID}-gradient-end`}
      />

      {/* Content container */}
      <View style={[styles.content, { paddingTop }]} testID={`${testID}-content`}>
        {children}
      </View>

      {/* Transition overlay for smooth mode changes */}
      {isTransitioning && (
        <View
          style={[styles.transitionOverlay, { opacity: 1 - transitionProgress }]}
          testID={`${testID}-transition-overlay`}
        />
      )}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientStart: {
    opacity: 0.8,
  },
  gradientMiddle: {
    opacity: 0.5,
    top: '30%',
  },
  gradientEnd: {
    opacity: 0.3,
    top: '60%',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 2,
  },
});

export default GradientHeader;
