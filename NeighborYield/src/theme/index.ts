/**
 * Theme Module Exports
 * Central export point for all theme-related functionality.
 */

// Token types and constants
export {
  type ColorTokens,
  type SpacingTokens,
  type TypographyTokens,
  type AnimationTokens,
  type DesignTokens,
  abundanceTokens,
  survivalTokens,
  spacingTokens,
  typographyTokens,
  animationTokens,
  abundanceDesignTokens,
  survivalDesignTokens,
  requiredColorKeys,
} from './tokens';

// Theme context and hook
export {
  type ThemeMode,
  type ThemeContextValue,
  type ThemeProviderProps,
  type UseThemeResult,
  ThemeProvider,
  useTheme,
  getThemeModeFromConnectivity,
  getTokensForMode,
} from './ThemeContext';

// Theme animator for transitions
export {
  type ThemeAnimatorConfig,
  type TransitionState,
  type AnimatedColorValues,
  type ThemeAnimatorResult,
  ThemeAnimator,
  createThemeAnimator,
  defaultThemeAnimatorConfig,
  interpolateColor,
  interpolateColorTokens,
  easeInOutCubic,
  calculateLuminance,
  isLuminanceMonotonic,
  isValidTransitionDuration,
  getMaxChannelDifference,
} from './ThemeAnimator';

// Animated theme provider
export {
  type AnimatedThemeContextValue,
  type AnimatedThemeProviderProps,
  type UseAnimatedThemeResult,
  type TransitionInfo,
  AnimatedThemeProvider,
  useAnimatedTheme,
  useAnimatedColors,
  useThemeTransition,
} from './AnimatedThemeProvider';
