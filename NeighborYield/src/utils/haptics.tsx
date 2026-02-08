/**
 * Haptic Feedback System
 * Mode-aware haptic triggers that provide tactile feedback in Abundance mode
 * and are disabled in Survival mode for battery conservation.
 *
 * Requirements: 10.2
 */

import { Platform, Vibration } from 'react-native';
import { ThemeMode } from '../theme';

// ============================================
// Haptic Feedback Types
// ============================================

export type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

// ============================================
// Haptic Configuration
// ============================================

export interface HapticConfig {
  /** Whether haptics are enabled */
  enabled: boolean;
  /** Vibration duration in ms for each feedback type */
  durations: Record<HapticFeedbackType, number>;
}

export const defaultHapticConfig: HapticConfig = {
  enabled: true,
  durations: {
    light: 10,
    medium: 20,
    heavy: 40,
    selection: 5,
    success: 30,
    warning: 50,
    error: 100,
  },
};

// ============================================
// Haptic State Management
// ============================================

let currentConfig: HapticConfig = { ...defaultHapticConfig };
let currentMode: ThemeMode = 'abundance';

/**
 * Configure the haptic feedback system
 */
export function configureHaptics(config: Partial<HapticConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Set the current theme mode for haptic feedback
 * Haptics are disabled in survival mode
 * Requirements: 10.2 - disable haptics in survival mode
 */
export function setHapticMode(mode: ThemeMode): void {
  currentMode = mode;
}

/**
 * Get the current haptic mode
 */
export function getHapticMode(): ThemeMode {
  return currentMode;
}

/**
 * Check if haptics are currently enabled
 * Returns false in survival mode regardless of config
 */
export function isHapticsEnabled(): boolean {
  // Requirements: 10.2 - disable haptics in survival mode
  if (currentMode === 'survival') {
    return false;
  }
  return currentConfig.enabled;
}

// ============================================
// Core Haptic Functions
// ============================================

/**
 * Trigger haptic feedback of the specified type
 * Does nothing in survival mode
 * Requirements: 10.2 - add haptic feedback on key interactions in abundance mode
 */
export function triggerHaptic(type: HapticFeedbackType = 'medium'): void {
  // Skip if haptics disabled or in survival mode
  if (!isHapticsEnabled()) {
    return;
  }

  const duration = currentConfig.durations[type];

  // Use platform-specific haptic APIs
  if (Platform.OS === 'ios') {
    // On iOS, we use Vibration with pattern for different intensities
    // In a real app, you'd use react-native-haptic-feedback or expo-haptics
    Vibration.vibrate(duration);
  } else if (Platform.OS === 'android') {
    // Android vibration
    Vibration.vibrate(duration);
  }
}

/**
 * Trigger light haptic feedback
 * Suitable for subtle interactions like selections
 */
export function triggerLightHaptic(): void {
  triggerHaptic('light');
}

/**
 * Trigger medium haptic feedback
 * Suitable for button presses and standard interactions
 */
export function triggerMediumHaptic(): void {
  triggerHaptic('medium');
}

/**
 * Trigger heavy haptic feedback
 * Suitable for important actions or confirmations
 */
export function triggerHeavyHaptic(): void {
  triggerHaptic('heavy');
}

/**
 * Trigger selection haptic feedback
 * Suitable for picker selections and toggles
 */
export function triggerSelectionHaptic(): void {
  triggerHaptic('selection');
}

/**
 * Trigger success haptic feedback
 * Suitable for successful operations
 */
export function triggerSuccessHaptic(): void {
  triggerHaptic('success');
}

/**
 * Trigger warning haptic feedback
 * Suitable for warnings or caution states
 */
export function triggerWarningHaptic(): void {
  triggerHaptic('warning');
}

/**
 * Trigger error haptic feedback
 * Suitable for errors or failed operations
 */
export function triggerErrorHaptic(): void {
  triggerHaptic('error');
}

// ============================================
// React Hook for Haptic Feedback
// ============================================

import { useCallback, useEffect } from 'react';
import { useAnimatedTheme } from '../theme';

export interface UseHapticsResult {
  /** Whether haptics are currently enabled */
  enabled: boolean;
  /** Trigger haptic feedback */
  trigger: (type?: HapticFeedbackType) => void;
  /** Trigger light haptic */
  triggerLight: () => void;
  /** Trigger medium haptic */
  triggerMedium: () => void;
  /** Trigger heavy haptic */
  triggerHeavy: () => void;
  /** Trigger selection haptic */
  triggerSelection: () => void;
  /** Trigger success haptic */
  triggerSuccess: () => void;
  /** Trigger warning haptic */
  triggerWarning: () => void;
  /** Trigger error haptic */
  triggerError: () => void;
}

/**
 * Hook for using haptic feedback with automatic mode awareness
 * Automatically disables haptics in survival mode
 * Requirements: 10.2
 */
export function useHaptics(): UseHapticsResult {
  const { mode } = useAnimatedTheme();

  // Update haptic mode when theme mode changes
  useEffect(() => {
    setHapticMode(mode);
  }, [mode]);

  const trigger = useCallback((type: HapticFeedbackType = 'medium') => {
    triggerHaptic(type);
  }, []);

  const triggerLight = useCallback(() => triggerLightHaptic(), []);
  const triggerMedium = useCallback(() => triggerMediumHaptic(), []);
  const triggerHeavy = useCallback(() => triggerHeavyHaptic(), []);
  const triggerSelection = useCallback(() => triggerSelectionHaptic(), []);
  const triggerSuccess = useCallback(() => triggerSuccessHaptic(), []);
  const triggerWarning = useCallback(() => triggerWarningHaptic(), []);
  const triggerError = useCallback(() => triggerErrorHaptic(), []);

  return {
    enabled: mode === 'abundance',
    trigger,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSelection,
    triggerSuccess,
    triggerWarning,
    triggerError,
  };
}

// ============================================
// Higher-Order Component for Haptic Buttons
// ============================================

import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

export interface HapticTouchableProps extends TouchableOpacityProps {
  /** Type of haptic feedback to trigger */
  hapticType?: HapticFeedbackType;
}

/**
 * TouchableOpacity with automatic haptic feedback
 * Triggers haptic on press in abundance mode only
 */
export function HapticTouchable({
  hapticType = 'medium',
  onPress,
  children,
  ...props
}: HapticTouchableProps): React.JSX.Element {
  const handlePress = useCallback(
    (event: any) => {
      triggerHaptic(hapticType);
      onPress?.(event);
    },
    [hapticType, onPress],
  );

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
}

export default {
  triggerHaptic,
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerHeavyHaptic,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
  triggerErrorHaptic,
  setHapticMode,
  getHapticMode,
  isHapticsEnabled,
  configureHaptics,
  useHaptics,
  HapticTouchable,
};
