/**
 * Battery Monitoring Hook
 * 
 * Monitors device battery level and provides battery-aware configuration
 * for survival mode optimization.
 * 
 * Requirements: 6.1-6.10
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export interface BatteryConfig {
  level: number;                    // 0-100
  discoveryInterval: number;        // milliseconds
  animationsEnabled: boolean;
  powerSaveMode: boolean;
  isCharging: boolean;
}

export const BATTERY_THRESHOLDS = {
  HIGH: { min: 50, interval: 15000 },      // 15 seconds
  MEDIUM: { min: 20, interval: 30000 },    // 30 seconds
  LOW: { min: 0, interval: 60000 },        // 60 seconds
};

/**
 * Calculate battery configuration based on current level
 * Requirements: 6.2
 */
export function getBatteryConfig(level: number, isCharging: boolean = false): BatteryConfig {
  // If charging, use high performance settings
  if (isCharging) {
    return {
      level,
      discoveryInterval: BATTERY_THRESHOLDS.HIGH.interval,
      animationsEnabled: true,
      powerSaveMode: false,
      isCharging: true,
    };
  }

  // Battery-aware configuration
  if (level > BATTERY_THRESHOLDS.HIGH.min) {
    return {
      level,
      discoveryInterval: BATTERY_THRESHOLDS.HIGH.interval,
      animationsEnabled: true,
      powerSaveMode: false,
      isCharging: false,
    };
  } else if (level >= BATTERY_THRESHOLDS.MEDIUM.min) {
    return {
      level,
      discoveryInterval: BATTERY_THRESHOLDS.MEDIUM.interval,
      animationsEnabled: true,
      powerSaveMode: false,
      isCharging: false,
    };
  } else {
    return {
      level,
      discoveryInterval: BATTERY_THRESHOLDS.LOW.interval,
      animationsEnabled: false,
      powerSaveMode: true,
      isCharging: false,
    };
  }
}

/**
 * Get battery level color for UI display
 */
export function getBatteryColor(level: number): string {
  if (level > 50) return '#4AEDC4'; // Green
  if (level > 20) return '#FFAB00'; // Yellow
  return '#FF5252'; // Red
}

/**
 * Get battery icon based on level
 */
export function getBatteryIcon(level: number, isCharging: boolean): string {
  if (isCharging) return '⚡';
  if (level > 75) return '🔋';
  if (level > 50) return '🔋';
  if (level > 25) return '🪫';
  return '🪫';
}

/**
 * Hook to monitor battery level continuously
 * Requirements: 6.1
 * 
 * Note: This is a stub implementation. In a real app, you would use:
 * - expo-battery for Expo projects
 * - react-native-device-info for bare React Native
 * - Native modules for custom implementation
 */
export function useBatteryMonitor() {
  const [batteryConfig, setBatteryConfig] = useState<BatteryConfig>({
    level: 100,
    discoveryInterval: BATTERY_THRESHOLDS.HIGH.interval,
    animationsEnabled: true,
    powerSaveMode: false,
    isCharging: false,
  });

  const [manualOverride, setManualOverride] = useState<boolean>(false);

  useEffect(() => {
    // Stub: Simulate battery monitoring
    // In production, this would use native battery APIs
    
    const updateBatteryLevel = () => {
      // Stub: Return mock battery level
      // In production: const level = await Battery.getBatteryLevelAsync();
      const mockLevel = 75; // Mock value for development
      const mockIsCharging = false;

      if (!manualOverride) {
        const config = getBatteryConfig(mockLevel, mockIsCharging);
        setBatteryConfig(config);
      }
    };

    // Update battery level every 30 seconds
    updateBatteryLevel();
    const interval = setInterval(updateBatteryLevel, 30000);

    return () => clearInterval(interval);
  }, [manualOverride]);

  /**
   * Manually set battery level (for testing/override)
   * Requirements: 6.9
   */
  const setBatteryLevel = (level: number, isCharging: boolean = false) => {
    const config = getBatteryConfig(level, isCharging);
    setBatteryConfig(config);
  };

  /**
   * Toggle manual override of power-save settings
   * Requirements: 6.9
   */
  const toggleManualOverride = (enabled: boolean) => {
    setManualOverride(enabled);
  };

  /**
   * Force power save mode regardless of battery level
   * Requirements: 6.9
   */
  const forcePowerSaveMode = (enabled: boolean) => {
    setBatteryConfig(prev => ({
      ...prev,
      powerSaveMode: enabled,
      animationsEnabled: !enabled,
    }));
  };

  return {
    batteryConfig,
    batteryLevel: batteryConfig.level,
    discoveryInterval: batteryConfig.discoveryInterval,
    animationsEnabled: batteryConfig.animationsEnabled,
    powerSaveMode: batteryConfig.powerSaveMode,
    isCharging: batteryConfig.isCharging,
    batteryColor: getBatteryColor(batteryConfig.level),
    batteryIcon: getBatteryIcon(batteryConfig.level, batteryConfig.isCharging),
    
    // Manual controls
    setBatteryLevel,
    toggleManualOverride,
    forcePowerSaveMode,
    manualOverride,
  };
}

/**
 * Hook to show brightness recommendation when battery is low
 * Requirements: 6.5
 */
export function useBrightnessRecommendation(batteryLevel: number) {
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show recommendation when battery < 30% and not dismissed
    if (batteryLevel < 30 && !dismissed) {
      setShowRecommendation(true);
    } else {
      setShowRecommendation(false);
    }
  }, [batteryLevel, dismissed]);

  const dismissRecommendation = () => {
    setDismissed(true);
    setShowRecommendation(false);
  };

  return {
    showRecommendation,
    dismissRecommendation,
  };
}

/**
 * Hook to log battery usage metrics
 * Requirements: 6.10
 */
export function useBatteryLogger() {
  const [metrics, setMetrics] = useState<{
    startLevel: number;
    currentLevel: number;
    startTime: number;
    drainRate: number; // % per hour
  }>({
    startLevel: 100,
    currentLevel: 100,
    startTime: Date.now(),
    drainRate: 0,
  });

  const startLogging = (initialLevel: number) => {
    setMetrics({
      startLevel: initialLevel,
      currentLevel: initialLevel,
      startTime: Date.now(),
      drainRate: 0,
    });
  };

  const updateLevel = (newLevel: number) => {
    setMetrics(prev => {
      const elapsedHours = (Date.now() - prev.startTime) / (1000 * 60 * 60);
      const drainRate = elapsedHours > 0 
        ? (prev.startLevel - newLevel) / elapsedHours 
        : 0;

      return {
        ...prev,
        currentLevel: newLevel,
        drainRate,
      };
    });
  };

  const logMetrics = () => {
    console.log('[Battery Metrics]', {
      startLevel: metrics.startLevel,
      currentLevel: metrics.currentLevel,
      drainRate: `${metrics.drainRate.toFixed(2)}% per hour`,
      elapsed: `${((Date.now() - metrics.startTime) / 60000).toFixed(1)} minutes`,
    });
  };

  return {
    metrics,
    startLogging,
    updateLevel,
    logMetrics,
  };
}
