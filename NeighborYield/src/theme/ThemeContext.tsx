/**
 * ThemeContext and useTheme Hook
 * Provides theme tokens based on connectivity mode.
 * Integrates with AppContext to automatically switch between
 * Abundance UI and Survival UI based on network state.
 *
 * Requirements: 1.2, 1.3, 1.7
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAppContext } from '../context/AppContext';
import { ConnectivityMode } from '../types';
import { DesignTokens, abundanceDesignTokens, survivalDesignTokens } from './tokens';

// ============================================
// Theme Mode Type
// ============================================

export type ThemeMode = 'abundance' | 'survival';

// ============================================
// Theme Context Interface
// ============================================

export interface ThemeContextValue {
  /** Current theme mode */
  mode: ThemeMode;

  /** Current design tokens */
  tokens: DesignTokens;

  /** Force a specific mode (for testing/preview) */
  setMode?: (mode: ThemeMode) => void;
}

// ============================================
// Context Creation
// ============================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================
// Mode Mapping Utility
// Maps connectivity mode to theme mode
// Requirements: 1.2, 1.3
// ============================================

export function getThemeModeFromConnectivity(connectivityMode: ConnectivityMode): ThemeMode {
  // Survival UI for offline mode
  // Requirements: 1.2 - offline -> Survival_UI
  if (connectivityMode === 'offline') {
    return 'survival';
  }
  // Abundance UI for online mode
  // Requirements: 1.3 - online -> Abundance_UI
  return 'abundance';
}

// ============================================
// Token Selection Utility
// Returns appropriate tokens based on theme mode
// ============================================

export function getTokensForMode(mode: ThemeMode): DesignTokens {
  return mode === 'survival' ? survivalDesignTokens : abundanceDesignTokens;
}

// ============================================
// Provider Props
// ============================================

export interface ThemeProviderProps {
  children: ReactNode;
  /** Override mode for testing/preview purposes */
  overrideMode?: ThemeMode;
}

// ============================================
// Theme Provider Component
// ============================================

export function ThemeProvider({ children, overrideMode }: ThemeProviderProps): React.JSX.Element {
  const { state } = useAppContext();

  const value = useMemo<ThemeContextValue>(() => {
    // Use override mode if provided, otherwise derive from connectivity
    const mode = overrideMode ?? getThemeModeFromConnectivity(state.connectivityMode);
    const tokens = getTokensForMode(mode);

    return {
      mode,
      tokens,
    };
  }, [state.connectivityMode, overrideMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================
// useTheme Hook
// Requirements: 1.7
// ============================================

export interface UseThemeResult {
  /** Current theme mode */
  mode: ThemeMode;

  /** Static token values for current mode */
  tokens: DesignTokens;
}

/**
 * Hook for accessing theme tokens based on connectivity mode.
 * Returns current token values that automatically update when
 * connectivity mode changes.
 *
 * @throws Error if used outside of ThemeProvider
 */
export function useTheme(): UseThemeResult {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return {
    mode: context.mode,
    tokens: context.tokens,
  };
}

export default ThemeContext;
