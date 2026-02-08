/**
 * AnimatedThemeProvider
 * Combines ThemeContext with ThemeAnimator to provide animated theme transitions.
 * Wraps the app and provides both static tokens and animated color values.
 * Also provides the basic ThemeContext for components using useTheme.
 *
 * Requirements: 2.1, 2.3, 2.4
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useAppContext } from '../context/AppContext';
import {
  ThemeMode,
  getThemeModeFromConnectivity,
  getTokensForMode,
  ThemeProvider,
} from './ThemeContext';
import { DesignTokens, abundanceTokens, survivalTokens } from './tokens';
import {
  ThemeAnimator,
  AnimatedColorValues,
  ThemeAnimatorConfig,
  defaultThemeAnimatorConfig,
  createThemeAnimator,
} from './ThemeAnimator';

// ============================================
// Animated Theme Context Interface
// ============================================

export interface AnimatedThemeContextValue {
  /** Current theme mode */
  mode: ThemeMode;

  /** Static token values for current mode */
  tokens: DesignTokens;

  /** Animated color values that interpolate during transitions */
  animatedColors: AnimatedColorValues;

  /** Whether a transition is currently in progress */
  isTransitioning: boolean;

  /** Current transition progress (0-1) */
  transitionProgress: number;

  /** Force a specific mode (for testing/preview) */
  setMode?: (mode: ThemeMode) => void;
}

// ============================================
// Context Creation
// ============================================

const AnimatedThemeContext = createContext<AnimatedThemeContextValue | undefined>(undefined);

// ============================================
// Get Initial Animated Colors
// ============================================

function getInitialAnimatedColors(mode: ThemeMode): AnimatedColorValues {
  const tokens = mode === 'survival' ? survivalTokens : abundanceTokens;
  return {
    backgroundPrimary: tokens.backgroundPrimary,
    backgroundSecondary: tokens.backgroundSecondary,
    backgroundCard: tokens.backgroundCard,
    backgroundOverlay: tokens.backgroundOverlay,
    textPrimary: tokens.textPrimary,
    textSecondary: tokens.textSecondary,
    textMuted: tokens.textMuted,
    textAccent: tokens.textAccent,
    accentPrimary: tokens.accentPrimary,
    accentSecondary: tokens.accentSecondary,
    accentSuccess: tokens.accentSuccess,
    accentWarning: tokens.accentWarning,
    accentDanger: tokens.accentDanger,
    borderDefault: tokens.borderDefault,
    borderFocus: tokens.borderFocus,
    shadowColor: tokens.shadowColor,
  };
}

// ============================================
// Provider Props
// ============================================

export interface AnimatedThemeProviderProps {
  children: ReactNode;
  /** Override mode for testing/preview purposes */
  overrideMode?: ThemeMode;
  /** Custom animator configuration */
  animatorConfig?: Partial<ThemeAnimatorConfig>;
}

// ============================================
// Animated Theme Provider Component
// Requirements: 2.1 - animate colors on mode change
// Requirements: 2.3 - bleed effect (darkening) to Survival
// Requirements: 2.4 - bloom effect (brightening) to Abundance
// ============================================

export function AnimatedThemeProvider({
  children,
  overrideMode,
  animatorConfig,
}: AnimatedThemeProviderProps): React.JSX.Element {
  const { state } = useAppContext();

  // Derive theme mode from connectivity state
  const derivedMode = useMemo(
    () => overrideMode ?? getThemeModeFromConnectivity(state.connectivityMode),
    [state.connectivityMode, overrideMode],
  );

  // Track the current mode for transitions
  const [currentMode, setCurrentMode] = useState<ThemeMode>(derivedMode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(1);
  const [animatedColors, setAnimatedColors] = useState<AnimatedColorValues>(() =>
    getInitialAnimatedColors(derivedMode),
  );

  // Create and manage the animator
  const animatorRef = useRef<ThemeAnimator | null>(null);

  // Initialize animator (only on mount, mode changes handled by separate effect)
  useEffect(() => {
    const config: ThemeAnimatorConfig = {
      ...defaultThemeAnimatorConfig,
      ...animatorConfig,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only run on mount
    animatorRef.current = createThemeAnimator(derivedMode, config);

    // Set up update callback
    animatorRef.current.setOnUpdate((colors, progress, transitioning) => {
      setAnimatedColors(colors);
      setTransitionProgress(progress);
      setIsTransitioning(transitioning);

      // Update current mode when transition completes
      if (!transitioning && progress >= 1) {
        const state = animatorRef.current?.getTransitionState();
        if (state) {
          setCurrentMode(state.toMode);
        }
      }
    });

    return () => {
      animatorRef.current?.dispose();
      animatorRef.current = null;
    };
  }, [animatorConfig]);

  // Trigger transition when derived mode changes
  // Requirements: 2.1 - animate on connectivity mode change
  useEffect(() => {
    if (animatorRef.current && derivedMode !== currentMode) {
      animatorRef.current.transitionTo(derivedMode);
    }
  }, [derivedMode, currentMode]);

  // Manual mode setter for testing/preview
  const setMode = useCallback((mode: ThemeMode) => {
    if (animatorRef.current) {
      animatorRef.current.transitionTo(mode);
    }
  }, []);

  // Get static tokens for current mode
  const tokens = useMemo(() => getTokensForMode(currentMode), [currentMode]);

  // Build context value
  const value = useMemo<AnimatedThemeContextValue>(
    () => ({
      mode: currentMode,
      tokens,
      animatedColors,
      isTransitioning,
      transitionProgress,
      setMode,
    }),
    [currentMode, tokens, animatedColors, isTransitioning, transitionProgress, setMode],
  );

  return (
    <AnimatedThemeContext.Provider value={value}>
      <ThemeProvider overrideMode={currentMode}>{children}</ThemeProvider>
    </AnimatedThemeContext.Provider>
  );
}

// ============================================
// useAnimatedTheme Hook
// ============================================

export interface UseAnimatedThemeResult {
  /** Current theme mode */
  mode: ThemeMode;

  /** Static token values for current mode */
  tokens: DesignTokens;

  /** Animated color values that interpolate during transitions */
  animatedColors: AnimatedColorValues;

  /** Whether a transition is currently in progress */
  isTransitioning: boolean;

  /** Current transition progress (0-1) */
  transitionProgress: number;

  /** Force a specific mode (for testing/preview) */
  setMode?: (mode: ThemeMode) => void;
}

/**
 * Hook for accessing animated theme values.
 * Returns both static tokens and animated color values that
 * smoothly interpolate during mode transitions.
 *
 * @throws Error if used outside of AnimatedThemeProvider
 */
export function useAnimatedTheme(): UseAnimatedThemeResult {
  const context = useContext(AnimatedThemeContext);

  if (context === undefined) {
    throw new Error('useAnimatedTheme must be used within an AnimatedThemeProvider');
  }

  return context;
}

// ============================================
// Convenience Hook for Just Animated Colors
// ============================================

/**
 * Hook for accessing only the animated color values.
 * Useful for components that only need the interpolated colors.
 */
export function useAnimatedColors(): AnimatedColorValues {
  const { animatedColors } = useAnimatedTheme();
  return animatedColors;
}

// ============================================
// Convenience Hook for Transition State
// ============================================

export interface TransitionInfo {
  isTransitioning: boolean;
  progress: number;
}

/**
 * Hook for accessing transition state information.
 * Useful for components that need to react to transitions.
 */
export function useThemeTransition(): TransitionInfo {
  const { isTransitioning, transitionProgress } = useAnimatedTheme();
  return {
    isTransitioning,
    progress: transitionProgress,
  };
}

export default AnimatedThemeContext;
