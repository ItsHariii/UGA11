/**
 * Design Token System for NeighborYield Double Stack UI
 * Provides color, spacing, typography, and animation tokens for both
 * Abundance UI (normal operation) and Survival UI (offline/outage scenarios).
 *
 * Requirements: 1.1, 1.4, 1.5, 1.6
 */

// ============================================
// Color Token Interface
// ============================================

export interface ColorTokens {
  // Backgrounds
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundCard: string;
  backgroundOverlay: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;

  // Accents
  accentPrimary: string;
  accentSecondary: string;
  accentSuccess: string;
  accentWarning: string;
  accentDanger: string;

  // Borders & Shadows
  borderDefault: string;
  borderFocus: string;
  shadowColor: string;
}

// ============================================
// Spacing Token Interface
// ============================================

export interface SpacingTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

// ============================================
// Typography Token Interface
// ============================================

export interface TypographyTokens {
  fontFamily: string;
  fontSizeXs: number;
  fontSizeSm: number;
  fontSizeMd: number;
  fontSizeLg: number;
  fontSizeXl: number;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
}

// ============================================
// Animation Token Interface
// ============================================

export interface AnimationTokens {
  durationFast: number;
  durationNormal: number;
  durationSlow: number;
  easingDefault: string;
}

// ============================================
// Combined Design Tokens Interface
// ============================================

export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  animation: AnimationTokens;
  mode: 'abundance' | 'survival';
}

// ============================================
// Abundance UI Color Tokens
// Warm earthy tones, forest green accents, cream surfaces
// Requirements: 1.1-1.14
// ============================================

export const abundanceTokens: ColorTokens = {
  // Backgrounds - warm beige and cream
  backgroundPrimary: '#F5F0E8',
  backgroundSecondary: '#FAF7F2',
  backgroundCard: '#FFFDF8',
  backgroundOverlay: 'rgba(0, 0, 0, 0.3)',

  // Text - dark charcoal and warm grays
  textPrimary: '#2C2C2C',
  textSecondary: '#6B6560',
  textMuted: '#A09A93',
  textAccent: '#2D5A3D',

  // Accents - forest green and earthy tones
  accentPrimary: '#2D5A3D',
  accentSecondary: '#6B8F71',
  accentSuccess: '#5A8A5E',
  accentWarning: '#D4943A',
  accentDanger: '#C75B3F',

  // Borders & Shadows - soft tan, warm subtle shadows
  borderDefault: '#E5DDD3',
  borderFocus: '#2D5A3D',
  shadowColor: 'rgba(0, 0, 0, 0.08)',
};

// ============================================
// Survival UI Color Tokens
// Dark backgrounds, cool mint accents, high contrast
// Requirements: 2.1-2.7
// ============================================

export const survivalTokens: ColorTokens = {
  // Backgrounds - dark, tactical, battery-efficient
  backgroundPrimary: '#0D1210',
  backgroundSecondary: '#121A16',
  backgroundCard: '#161E1A',
  backgroundOverlay: 'rgba(0, 0, 0, 0.8)',

  // Text - high contrast for visibility
  textPrimary: '#E8F5E9',
  textSecondary: '#A5D6A7',
  textMuted: '#4AEDC4',
  textAccent: '#4AEDC4',

  // Accents - cool mint for refined dark mode
  accentPrimary: '#4AEDC4',
  accentSecondary: '#7AF2D4',
  accentSuccess: '#4AEDC4',
  accentWarning: '#FFAB00',
  accentDanger: '#FF5252',

  // Borders & Shadows - minimal, no shadows for battery
  borderDefault: '#2A3A30',
  borderFocus: '#4AEDC4',
  shadowColor: 'transparent',
};

// ============================================
// Shared Spacing Tokens
// Consistent spacing across both modes
// ============================================

export const spacingTokens: SpacingTokens = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// ============================================
// Shared Typography Tokens
// Consistent typography across both modes
// ============================================

export const typographyTokens: TypographyTokens = {
  fontFamily: 'System',
  fontSizeXs: 10,
  fontSizeSm: 12,
  fontSizeMd: 14,
  fontSizeLg: 18,
  fontSizeXl: 24,
  fontWeightNormal: '400',
  fontWeightMedium: '500',
  fontWeightBold: '700',
};

// ============================================
// Shared Animation Tokens
// Consistent animation timing across both modes
// ============================================

export const animationTokens: AnimationTokens = {
  durationFast: 150,
  durationNormal: 300,
  durationSlow: 500,
  easingDefault: 'ease-in-out',
};

// ============================================
// Complete Token Sets
// ============================================

export const abundanceDesignTokens: DesignTokens = {
  colors: abundanceTokens,
  spacing: spacingTokens,
  typography: typographyTokens,
  animation: animationTokens,
  mode: 'abundance',
};

export const survivalDesignTokens: DesignTokens = {
  colors: survivalTokens,
  spacing: spacingTokens,
  typography: typographyTokens,
  animation: animationTokens,
  mode: 'survival',
};

// ============================================
// Required Color Keys for Validation
// ============================================

export const requiredColorKeys: (keyof ColorTokens)[] = [
  'backgroundPrimary',
  'backgroundSecondary',
  'backgroundCard',
  'textPrimary',
  'textSecondary',
  'textMuted',
  'textAccent',
  'accentPrimary',
  'accentSecondary',
  'borderDefault',
  'shadowColor',
];
