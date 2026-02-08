/**
 * ConnectionCelebration Component
 * Celebration animation triggered when connection is restored
 * (transitioning from offline/disconnected to online/hybrid mode).
 *
 * Requirements: 10.5
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useAnimatedTheme, ThemeMode } from '../../theme';

// ============================================
// Types
// ============================================

export interface ConnectionCelebrationProps {
  /** Whether the celebration should be visible */
  visible?: boolean;
  /** Duration of the celebration in ms */
  duration?: number;
  /** Number of pulse rings */
  pulseCount?: number;
  /** Callback when celebration completes */
  onComplete?: () => void;
  /** Additional style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

export interface PulseRing {
  id: number;
  scale: Animated.Value;
  opacity: Animated.Value;
}

// ============================================
// Constants
// ============================================

const DEFAULT_DURATION = 1500;
const DEFAULT_PULSE_COUNT = 3;

// ============================================
// Celebration Colors
// ============================================

export const celebrationColors = {
  primary: '#4CAF50', // Success green
  secondary: '#81C784', // Light green
  accent: '#00E676', // Bright green
};

// ============================================
// Helper Functions
// ============================================

/**
 * Create pulse ring animation values
 */
export function createPulseRings(count: number): PulseRing[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    scale: new Animated.Value(0),
    opacity: new Animated.Value(1),
  }));
}

/**
 * Create staggered pulse animation
 */
export function createPulseAnimation(
  rings: PulseRing[],
  duration: number,
): Animated.CompositeAnimation {
  const staggerDelay = duration / (rings.length + 1);

  const animations = rings.map((ring, index) => {
    return Animated.sequence([
      Animated.delay(index * staggerDelay),
      Animated.parallel([
        Animated.timing(ring.scale, {
          toValue: 2,
          duration: duration - index * staggerDelay,
          useNativeDriver: true,
        }),
        Animated.timing(ring.opacity, {
          toValue: 0,
          duration: duration - index * staggerDelay,
          useNativeDriver: true,
        }),
      ]),
    ]);
  });

  return Animated.parallel(animations);
}

/**
 * Reset pulse rings to initial state
 */
export function resetPulseRings(rings: PulseRing[]): void {
  rings.forEach(ring => {
    ring.scale.setValue(0);
    ring.opacity.setValue(1);
  });
}

/**
 * Check if transitioning from offline to online
 */
export function isConnectionRestored(
  previousMode: ThemeMode | null,
  currentMode: ThemeMode,
): boolean {
  // Requirements: 10.5 - trigger on transition from offline/disconnected to online/hybrid
  return previousMode === 'survival' && currentMode === 'abundance';
}

// ============================================
// ConnectionCelebration Component
// Requirements: 10.5 - connection restored celebration animation
// ============================================

export function ConnectionCelebration({
  visible: visibleProp,
  duration = DEFAULT_DURATION,
  pulseCount = DEFAULT_PULSE_COUNT,
  onComplete,
  style,
  testID = 'connection-celebration',
}: ConnectionCelebrationProps): React.JSX.Element | null {
  const { mode } = useAnimatedTheme();
  const previousModeRef = useRef<ThemeMode | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rings] = useState(() => createPulseRings(pulseCount));
  const celebrationTriggeredRef = useRef(false);

  // Track mode changes and trigger celebration
  useEffect(() => {
    const previousMode = previousModeRef.current;
    previousModeRef.current = mode;

    // Skip on initial mount
    if (previousMode === null) {
      return;
    }

    // Check if connection was restored
    // Requirements: 10.5 - trigger exactly once on transition
    if (isConnectionRestored(previousMode, mode) && !celebrationTriggeredRef.current) {
      celebrationTriggeredRef.current = true;
      triggerCelebration();
    }

    // Reset trigger flag when going back to survival mode
    if (mode === 'survival') {
      celebrationTriggeredRef.current = false;
    }
  }, [mode]);

  // Handle external visibility control
  useEffect(() => {
    if (visibleProp && !isAnimating) {
      triggerCelebration();
    }
  }, [visibleProp]);

  const triggerCelebration = useCallback(() => {
    setIsAnimating(true);
    resetPulseRings(rings);

    const animation = createPulseAnimation(rings, duration);

    animation.start(({ finished }) => {
      if (finished) {
        setIsAnimating(false);
        onComplete?.();
      }
    });
  }, [rings, duration, onComplete]);

  // Don't render if not animating
  if (!isAnimating) {
    return null;
  }

  return (
    <View style={[styles.container, style]} pointerEvents="none" testID={testID}>
      {/* Center pulse effect */}
      <View style={styles.centerContainer}>
        {rings.map(ring => (
          <Animated.View
            key={ring.id}
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: ring.scale }],
                opacity: ring.opacity,
                backgroundColor:
                  ring.id === 0
                    ? celebrationColors.primary
                    : ring.id === 1
                      ? celebrationColors.secondary
                      : celebrationColors.accent,
              },
            ]}
            testID={`${testID}-ring-${ring.id}`}
          />
        ))}

        {/* Center icon/checkmark */}
        <Animated.View
          style={[
            styles.centerIcon,
            {
              opacity: rings[0].opacity.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 1],
              }),
            },
          ]}
          testID={`${testID}-icon`}>
          <View style={styles.checkmark}>
            <View style={styles.checkmarkStem} />
            <View style={styles.checkmarkKick} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

// ============================================
// Hook for Manual Celebration Trigger
// ============================================

export interface UseCelebrationResult {
  /** Whether celebration is currently showing */
  isShowing: boolean;
  /** Manually trigger the celebration */
  trigger: () => void;
}

/**
 * Hook for manually controlling the celebration animation
 */
export function useCelebration(): UseCelebrationResult {
  const [isShowing, setIsShowing] = useState(false);

  const trigger = useCallback(() => {
    setIsShowing(true);
    // Auto-hide after animation completes
    setTimeout(() => setIsShowing(false), DEFAULT_DURATION + 100);
  }, []);

  return {
    isShowing,
    trigger,
  };
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  centerContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  centerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: celebrationColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 30,
    height: 30,
    position: 'relative',
  },
  checkmarkStem: {
    position: 'absolute',
    width: 4,
    height: 18,
    backgroundColor: '#FFFFFF',
    left: 16,
    top: 6,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  checkmarkKick: {
    position: 'absolute',
    width: 4,
    height: 10,
    backgroundColor: '#FFFFFF',
    left: 8,
    top: 14,
    transform: [{ rotate: '-45deg' }],
    borderRadius: 2,
  },
});

export default ConnectionCelebration;
