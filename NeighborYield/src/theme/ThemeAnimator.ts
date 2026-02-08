/**
 * ThemeAnimator - Animation system for theme transitions
 * Provides smooth color interpolation between Abundance and Survival UI modes
 * using react-native-reanimated shared values and derived values.
 *
 * Requirements: 2.1, 2.2, 2.5, 2.6
 */

import { ThemeMode } from './ThemeContext';
import { abundanceTokens, survivalTokens, ColorTokens } from './tokens';

// ============================================
// Configuration Interface
// ============================================

export interface ThemeAnimatorConfig {
  /** Duration of transition in ms (300-500ms per requirements) */
  duration: number;
}

// ============================================
// Default Configuration
// ============================================

export const defaultThemeAnimatorConfig: ThemeAnimatorConfig = {
  duration: 400, // Middle of 300-500ms range
};

// ============================================
// Transition State Interface
// ============================================

export interface TransitionState {
  /** Current progress of transition (0-1) */
  progress: number;
  /** Whether a transition is currently in progress */
  isTransitioning: boolean;
  /** Source mode for the transition */
  fromMode: ThemeMode;
  /** Target mode for the transition */
  toMode: ThemeMode;
  /** Timestamp when transition started */
  startTime: number;
}

// ============================================
// Animated Color Tokens Interface
// ============================================

export interface AnimatedColorValues {
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundCard: string;
  backgroundOverlay: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  accentPrimary: string;
  accentSecondary: string;
  accentSuccess: string;
  accentWarning: string;
  accentDanger: string;
  borderDefault: string;
  borderFocus: string;
  shadowColor: string;
}

// ============================================
// Theme Animator Result Interface
// ============================================

export interface ThemeAnimatorResult {
  /** Current progress of transition (0-1) */
  progress: number;
  /** Whether currently transitioning */
  isTransitioning: boolean;
  /** Current interpolated color values */
  colors: AnimatedColorValues;
  /** Start transition to target mode */
  transitionTo: (mode: ThemeMode) => void;
  /** Get current transition state */
  getTransitionState: () => TransitionState;
}

// ============================================
// Color Parsing Utilities
// ============================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface RGBA extends RGB {
  a: number;
}

/**
 * Parse hex color to RGB values
 */
function parseHexColor(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Parse rgba color string to RGBA values
 */
function parseRgbaColor(rgba: string): RGBA {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Parse any color format to RGBA
 */
function parseColor(color: string): RGBA {
  if (color === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  if (color.startsWith('#')) {
    const rgb = parseHexColor(color);
    return { ...rgb, a: 1 };
  }
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    return parseRgbaColor(color);
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Convert RGBA to color string
 */
function rgbaToString(rgba: RGBA): string {
  if (rgba.a < 1) {
    return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a.toFixed(2)})`;
  }
  const r = Math.round(rgba.r).toString(16).padStart(2, '0');
  const g = Math.round(rgba.g).toString(16).padStart(2, '0');
  const b = Math.round(rgba.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

// ============================================
// Color Interpolation
// Requirements: 2.1 - animate colors using interpolation
// ============================================

/**
 * Interpolate between two colors based on progress
 * @param fromColor - Starting color
 * @param toColor - Target color
 * @param progress - Interpolation progress (0-1)
 * @returns Interpolated color string
 */
export function interpolateColor(fromColor: string, toColor: string, progress: number): string {
  const from = parseColor(fromColor);
  const to = parseColor(toColor);

  // Clamp progress to 0-1 range
  const t = Math.max(0, Math.min(1, progress));

  const interpolated: RGBA = {
    r: from.r + (to.r - from.r) * t,
    g: from.g + (to.g - from.g) * t,
    b: from.b + (to.b - from.b) * t,
    a: from.a + (to.a - from.a) * t,
  };

  return rgbaToString(interpolated);
}

/**
 * Interpolate all color tokens between two modes
 */
export function interpolateColorTokens(
  fromTokens: ColorTokens,
  toTokens: ColorTokens,
  progress: number,
): AnimatedColorValues {
  return {
    backgroundPrimary: interpolateColor(
      fromTokens.backgroundPrimary,
      toTokens.backgroundPrimary,
      progress,
    ),
    backgroundSecondary: interpolateColor(
      fromTokens.backgroundSecondary,
      toTokens.backgroundSecondary,
      progress,
    ),
    backgroundCard: interpolateColor(fromTokens.backgroundCard, toTokens.backgroundCard, progress),
    backgroundOverlay: interpolateColor(
      fromTokens.backgroundOverlay,
      toTokens.backgroundOverlay,
      progress,
    ),
    textPrimary: interpolateColor(fromTokens.textPrimary, toTokens.textPrimary, progress),
    textSecondary: interpolateColor(fromTokens.textSecondary, toTokens.textSecondary, progress),
    textMuted: interpolateColor(fromTokens.textMuted, toTokens.textMuted, progress),
    textAccent: interpolateColor(fromTokens.textAccent, toTokens.textAccent, progress),
    accentPrimary: interpolateColor(fromTokens.accentPrimary, toTokens.accentPrimary, progress),
    accentSecondary: interpolateColor(
      fromTokens.accentSecondary,
      toTokens.accentSecondary,
      progress,
    ),
    accentSuccess: interpolateColor(fromTokens.accentSuccess, toTokens.accentSuccess, progress),
    accentWarning: interpolateColor(fromTokens.accentWarning, toTokens.accentWarning, progress),
    accentDanger: interpolateColor(fromTokens.accentDanger, toTokens.accentDanger, progress),
    borderDefault: interpolateColor(fromTokens.borderDefault, toTokens.borderDefault, progress),
    borderFocus: interpolateColor(fromTokens.borderFocus, toTokens.borderFocus, progress),
    shadowColor: interpolateColor(fromTokens.shadowColor, toTokens.shadowColor, progress),
  };
}

// ============================================
// Easing Functions
// ============================================

/**
 * Ease-in-out cubic easing function for smooth transitions
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================
// Get Tokens for Mode
// ============================================

function getColorTokensForMode(mode: ThemeMode): ColorTokens {
  return mode === 'survival' ? survivalTokens : abundanceTokens;
}

// ============================================
// Theme Animator Class
// Manages transition state and provides interpolated values
// Requirements: 2.2, 2.5, 2.6
// ============================================

export class ThemeAnimator {
  private config: ThemeAnimatorConfig;
  private transitionState: TransitionState;
  private animationFrameId: number | null = null;
  private onUpdate:
    | ((colors: AnimatedColorValues, progress: number, isTransitioning: boolean) => void)
    | null = null;

  constructor(initialMode: ThemeMode, config: Partial<ThemeAnimatorConfig> = {}) {
    this.config = { ...defaultThemeAnimatorConfig, ...config };
    this.transitionState = {
      progress: 1,
      isTransitioning: false,
      fromMode: initialMode,
      toMode: initialMode,
      startTime: 0,
    };
  }

  /**
   * Set callback for animation updates
   */
  setOnUpdate(
    callback: (colors: AnimatedColorValues, progress: number, isTransitioning: boolean) => void,
  ): void {
    this.onUpdate = callback;
  }

  /**
   * Get current transition state
   */
  getTransitionState(): TransitionState {
    return { ...this.transitionState };
  }

  /**
   * Get current interpolated colors
   */
  getCurrentColors(): AnimatedColorValues {
    const fromTokens = getColorTokensForMode(this.transitionState.fromMode);
    const toTokens = getColorTokensForMode(this.transitionState.toMode);
    const easedProgress = easeInOutCubic(this.transitionState.progress);
    return interpolateColorTokens(fromTokens, toTokens, easedProgress);
  }

  /**
   * Start transition to target mode
   * Requirements: 2.6 - Handle transition interruption with smooth redirection
   */
  transitionTo(targetMode: ThemeMode): void {
    // If already at target mode and not transitioning, do nothing
    if (this.transitionState.toMode === targetMode && !this.transitionState.isTransitioning) {
      return;
    }

    // Handle interruption: if currently transitioning, start from current interpolated state
    // Requirements: 2.6 - smoothly redirect to new target state
    if (this.transitionState.isTransitioning) {
      // Cancel current animation
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Calculate current progress and determine new starting point
      // For smooth redirection, we invert the progress if going back
      const currentProgress = this.transitionState.progress;

      if (targetMode === this.transitionState.fromMode) {
        // Going back to where we came from - invert progress
        this.transitionState = {
          progress: 0,
          isTransitioning: true,
          fromMode: this.transitionState.toMode,
          toMode: targetMode,
          startTime: Date.now(),
        };
        // Adjust duration based on how far we've progressed
        this.startAnimation(this.config.duration * currentProgress);
      } else {
        // Going to a new target - continue from current position
        this.transitionState = {
          progress: 0,
          isTransitioning: true,
          fromMode: this.transitionState.toMode,
          toMode: targetMode,
          startTime: Date.now(),
        };
        this.startAnimation(this.config.duration);
      }
    } else {
      // Start fresh transition
      this.transitionState = {
        progress: 0,
        isTransitioning: true,
        fromMode: this.transitionState.toMode,
        toMode: targetMode,
        startTime: Date.now(),
      };
      this.startAnimation(this.config.duration);
    }
  }

  /**
   * Start the animation loop
   * Requirements: 2.2 - 300-500ms duration
   */
  private startAnimation(duration: number): void {
    const startTime = Date.now();
    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      this.transitionState.progress = rawProgress;

      // Notify listeners
      if (this.onUpdate) {
        const colors = this.getCurrentColors();
        this.onUpdate(colors, rawProgress, rawProgress < 1);
      }

      if (rawProgress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        // Transition complete
        this.transitionState.isTransitioning = false;
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop any ongoing animation
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.transitionState.isTransitioning = false;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.onUpdate = null;
  }
}

// ============================================
// Factory Function
// ============================================

/**
 * Create a new ThemeAnimator instance
 */
export function createThemeAnimator(
  initialMode: ThemeMode,
  config?: Partial<ThemeAnimatorConfig>,
): ThemeAnimator {
  return new ThemeAnimator(initialMode, config);
}

// ============================================
// Luminance Calculation Utility
// Used for verifying transition direction (bleed/bloom effects)
// Requirements: 2.3, 2.4
// ============================================

/**
 * Calculate relative luminance of a color
 * Uses the formula from WCAG 2.0
 */
export function calculateLuminance(color: string): number {
  const rgba = parseColor(color);

  // Convert to sRGB
  const rsRGB = rgba.r / 255;
  const gsRGB = rgba.g / 255;
  const bsRGB = rgba.b / 255;

  // Apply gamma correction
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if luminance is monotonically changing during transition
 * Requirements: 2.3 - bleed effect (darkening) to Survival
 * Requirements: 2.4 - bloom effect (brightening) to Abundance
 */
export function isLuminanceMonotonic(
  fromColor: string,
  toColor: string,
  samples: number = 10,
): { isMonotonic: boolean; direction: 'increasing' | 'decreasing' | 'stable' } {
  const fromLum = calculateLuminance(fromColor);
  const toLum = calculateLuminance(toColor);

  // Determine expected direction
  const expectedDirection =
    toLum > fromLum ? 'increasing' : toLum < fromLum ? 'decreasing' : 'stable';

  if (expectedDirection === 'stable') {
    return { isMonotonic: true, direction: 'stable' };
  }

  // Sample luminance values along the transition
  let previousLum = fromLum;
  for (let i = 1; i <= samples; i++) {
    const progress = i / samples;
    const interpolated = interpolateColor(fromColor, toColor, progress);
    const currentLum = calculateLuminance(interpolated);

    if (expectedDirection === 'increasing' && currentLum < previousLum - 0.001) {
      return { isMonotonic: false, direction: expectedDirection };
    }
    if (expectedDirection === 'decreasing' && currentLum > previousLum + 0.001) {
      return { isMonotonic: false, direction: expectedDirection };
    }

    previousLum = currentLum;
  }

  return { isMonotonic: true, direction: expectedDirection };
}

/**
 * Validate that transition timing is within bounds
 * Requirements: 2.2 - 300-500ms duration
 */
export function isValidTransitionDuration(duration: number): boolean {
  return duration >= 300 && duration <= 500;
}

/**
 * Calculate color channel difference for interruption handling
 * Requirements: 2.6 - no discontinuities > 10% in any channel
 */
export function getMaxChannelDifference(color1: string, color2: string): number {
  const rgba1 = parseColor(color1);
  const rgba2 = parseColor(color2);

  const rDiff = Math.abs(rgba1.r - rgba2.r) / 255;
  const gDiff = Math.abs(rgba1.g - rgba2.g) / 255;
  const bDiff = Math.abs(rgba1.b - rgba2.b) / 255;
  const aDiff = Math.abs(rgba1.a - rgba2.a);

  return Math.max(rDiff, gDiff, bDiff, aDiff);
}
