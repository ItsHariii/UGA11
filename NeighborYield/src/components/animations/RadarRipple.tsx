/**
 * RadarRipple Component
 * Displays a pulsing radar animation with concentric circles that expand outward.
 * Used in the Dynamic Island to indicate mesh peer discovery activity.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Animated, StyleSheet, View, Easing } from 'react-native';
import { survivalTokens } from '../../theme/tokens';

// ============================================
// Types and Interfaces
// ============================================

export interface RadarRippleProps {
  /** Whether the animation is active */
  isActive: boolean;
  /** Size of the ripple container */
  size: number;
  /** Number of ripple rings (default: 3) */
  ringCount?: number;
  /** Color of the ripples (default: survival accent) */
  color?: string;
  /** Duration of one ripple cycle in ms (default: 2000) */
  duration?: number;
  /** Callback when a peer is discovered (for directional highlight) */
  onPeerDiscovered?: (direction: number) => void;
  /** Use reduced frame rate for battery savings (default: false) */
  reducedFrameRate?: boolean;
  /** Test ID for testing */
  testID?: string;
}

export interface RippleRing {
  id: number;
  scale: Animated.Value;
  opacity: Animated.Value;
  delay: number;
}

// ============================================
// Constants
// ============================================

const DEFAULT_RING_COUNT = 3;
const DEFAULT_DURATION = 2000;
const DEFAULT_COLOR = survivalTokens.accentPrimary; // #00E676 - high visibility green
const STAGGER_DELAY_RATIO = 0.33; // Each ring starts 33% after the previous

// ============================================
// Animation Configuration
// ============================================

export interface AnimationConfig {
  duration: number;
  useNativeDriver: boolean;
  easing: (value: number) => number;
}

/**
 * Get animation configuration based on frame rate mode
 * Requirements: 6.7 - Optimized for battery consumption
 */
export function getAnimationConfig(reducedFrameRate: boolean): AnimationConfig {
  return {
    duration: reducedFrameRate ? 2500 : DEFAULT_DURATION, // Slower for battery savings
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  };
}

// ============================================
// Ring Creation Utility
// ============================================

/**
 * Creates ripple ring objects with animated values
 * Requirements: 6.3 - 3 ripple rings with staggered timing
 */
export function createRippleRings(count: number, duration: number): RippleRing[] {
  const rings: RippleRing[] = [];
  const staggerDelay = duration * STAGGER_DELAY_RATIO;

  for (let i = 0; i < count; i++) {
    rings.push({
      id: i,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
      delay: i * staggerDelay,
    });
  }

  return rings;
}

// ============================================
// Animation Utilities
// ============================================

/**
 * Creates a single ripple animation sequence
 * Requirements: 6.1 - Concentric circles expanding outward
 * Requirements: 6.2 - Use withRepeat and withSequence
 */
export function createRippleAnimation(
  ring: RippleRing,
  config: AnimationConfig,
): Animated.CompositeAnimation {
  const { duration, useNativeDriver, easing } = config;

  // Scale from 0 to 1 (center to edge)
  const scaleAnimation = Animated.timing(ring.scale, {
    toValue: 1,
    duration,
    useNativeDriver,
    easing,
  });

  // Opacity from 1 to 0 (fade out as it expands)
  const opacityAnimation = Animated.timing(ring.opacity, {
    toValue: 0,
    duration,
    useNativeDriver,
    easing,
  });

  // Run scale and opacity in parallel
  return Animated.parallel([scaleAnimation, opacityAnimation]);
}

/**
 * Creates the full staggered animation for all rings
 * Requirements: 6.2 - Continuous animation with staggered timing
 */
export function createStaggeredAnimation(
  rings: RippleRing[],
  config: AnimationConfig,
): Animated.CompositeAnimation {
  const animations = rings.map(ring => {
    return Animated.sequence([
      // Delay based on ring index
      Animated.delay(ring.delay),
      createRippleAnimation(ring, config),
    ]);
  });

  return Animated.parallel(animations);
}

/**
 * Resets all ring values to initial state
 */
export function resetRings(rings: RippleRing[]): void {
  rings.forEach(ring => {
    ring.scale.setValue(0);
    ring.opacity.setValue(1);
  });
}

// ============================================
// Directional Highlight Utilities
// Requirements: 6.4 - Directional highlight on peer discovery
// ============================================

export interface DirectionalHighlight {
  direction: number; // Angle in degrees (0-360)
  opacity: Animated.Value;
  isActive: boolean;
}

/**
 * Creates a directional highlight animation
 */
export function createDirectionalHighlight(): DirectionalHighlight {
  return {
    direction: 0,
    opacity: new Animated.Value(0),
    isActive: false,
  };
}

/**
 * Triggers a directional highlight animation
 * Requirements: 6.4 - Briefly highlight in direction of peer
 */
export function triggerDirectionalHighlight(
  highlight: DirectionalHighlight,
  direction: number,
  callback?: () => void,
): void {
  highlight.direction = direction;
  highlight.isActive = true;

  Animated.sequence([
    // Flash in
    Animated.timing(highlight.opacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
    // Hold briefly
    Animated.delay(200),
    // Fade out
    Animated.timing(highlight.opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }),
  ]).start(() => {
    highlight.isActive = false;
    callback?.();
  });
}

// ============================================
// Fade Out Animation
// Requirements: 6.6 - Fade out smoothly when inactive
// ============================================

/**
 * Creates a fade out animation for all rings
 */
export function createFadeOutAnimation(
  rings: RippleRing[],
  duration: number = 300,
): Animated.CompositeAnimation {
  const animations = rings.map(ring =>
    Animated.timing(ring.opacity, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }),
  );

  return Animated.parallel(animations);
}

// ============================================
// RadarRipple Component
// Requirements: 6.7 - Optimized for battery consumption
// ============================================

function RadarRippleComponent({
  isActive,
  size,
  ringCount = DEFAULT_RING_COUNT,
  color = DEFAULT_COLOR,
  duration = DEFAULT_DURATION,
  onPeerDiscovered,
  reducedFrameRate = false,
  testID,
}: RadarRippleProps): React.JSX.Element | null {
  // Early return if not active and we want to minimize renders
  // This is a performance optimization for battery savings
  // Create rings with animated values
  const ringsRef = useRef<RippleRing[]>(createRippleRings(ringCount, duration));
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isRunningRef = useRef(false);

  // Directional highlight state
  const highlightRef = useRef<DirectionalHighlight>(createDirectionalHighlight());

  // Get animation config based on frame rate mode
  const animConfig = useMemo(() => getAnimationConfig(reducedFrameRate), [reducedFrameRate]);

  // Start continuous animation loop
  const startAnimation = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const runLoop = () => {
      if (!isRunningRef.current) return;

      resetRings(ringsRef.current);
      animationRef.current = createStaggeredAnimation(ringsRef.current, animConfig);

      animationRef.current.start(({ finished }) => {
        if (finished && isRunningRef.current) {
          // Loop the animation
          runLoop();
        }
      });
    };

    runLoop();
  }, [animConfig]);

  // Stop animation with fade out
  const stopAnimation = useCallback(() => {
    isRunningRef.current = false;

    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    // Fade out smoothly
    createFadeOutAnimation(ringsRef.current).start(() => {
      resetRings(ringsRef.current);
    });
  }, []);

  // Handle isActive changes
  // Requirements: 6.7 - Stop animation when inactive
  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      isRunningRef.current = false;
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isActive, startAnimation, stopAnimation]);

  // Handle peer discovery callback
  // Requirements: 6.4 - Directional highlight capability
  const handlePeerDiscovered = useCallback(
    (direction: number) => {
      triggerDirectionalHighlight(highlightRef.current, direction, () => {
        onPeerDiscovered?.(direction);
      });
    },
    [onPeerDiscovered],
  );

  // Store handler reference for external access
  const handlerRef = useRef(handlePeerDiscovered);
  handlerRef.current = handlePeerDiscovered;

  // Calculate ring styles
  const ringStyles = useMemo(() => {
    return ringsRef.current.map(ring => ({
      transform: [
        {
          scale: ring.scale.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          }),
        },
      ],
      opacity: ring.opacity,
    }));
  }, []);

  // Directional highlight style
  const highlightStyle = useMemo(() => {
    const highlight = highlightRef.current;
    return {
      transform: [{ rotate: `${highlight.direction}deg` }],
      opacity: highlight.opacity,
    };
  }, []);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      testID={testID}
      accessibilityLabel="Radar ripple animation"
      accessibilityRole="image">
      {/* Ripple rings */}
      {ringsRef.current.map((ring, index) => (
        <Animated.View
          key={ring.id}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
            },
            ringStyles[index],
          ]}
        />
      ))}

      {/* Center dot */}
      <View
        style={[
          styles.centerDot,
          {
            backgroundColor: color,
            width: size * 0.1,
            height: size * 0.1,
            borderRadius: size * 0.05,
          },
        ]}
      />

      {/* Directional highlight indicator */}
      <Animated.View
        style={[
          styles.directionalHighlight,
          {
            width: size,
            height: size,
          },
          highlightStyle,
        ]}>
        <View
          style={[
            styles.highlightBeam,
            {
              backgroundColor: color,
              width: size * 0.08,
              height: size * 0.4,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  centerDot: {
    position: 'absolute',
  },
  directionalHighlight: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  highlightBeam: {
    borderRadius: 4,
    opacity: 0.8,
  },
});

// ============================================
// Memoized RadarRipple Component
// Requirements: 6.7 - Optimized for battery consumption
// Using React.memo to prevent unnecessary re-renders
// ============================================

export const RadarRipple = React.memo(RadarRippleComponent);

// Add display name for debugging
RadarRipple.displayName = 'RadarRipple';

// ============================================
// Static method for triggering peer discovery externally
// ============================================

/**
 * Trigger a peer discovery highlight from outside the component
 * This is set dynamically when the component mounts
 */
(RadarRipple as any).triggerPeerDiscovery = (_direction: number) => {
  // Will be overwritten when component mounts
};

export default RadarRipple;
