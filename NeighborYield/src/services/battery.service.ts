/**
 * Battery Service
 * 
 * Manages battery-aware behavior for survival mode including:
 * - Bluetooth discovery interval adjustment
 * - Animation control
 * - Background task management
 * - Power save mode
 * 
 * Requirements: 6.1-6.10
 */

import { BatteryConfig, BATTERY_THRESHOLDS } from '../hooks/useBatteryMonitor';

export interface BatteryServiceConfig {
  onBatteryLevelChange?: (level: number) => void;
  onPowerSaveModeChange?: (enabled: boolean) => void;
  onDiscoveryIntervalChange?: (interval: number) => void;
}

class BatteryService {
  private currentConfig: BatteryConfig | null = null;
  private callbacks: BatteryServiceConfig = {};
  private backgroundTasks: Set<string> = new Set();
  private criticalTasks: Set<string> = new Set();

  /**
   * Initialize battery service with callbacks
   */
  initialize(config: BatteryServiceConfig) {
    this.callbacks = config;
  }

  /**
   * Update battery configuration
   * Requirements: 6.2
   */
  updateBatteryConfig(config: BatteryConfig) {
    const previousConfig = this.currentConfig;
    this.currentConfig = config;

    // Notify callbacks of changes
    if (this.callbacks.onBatteryLevelChange) {
      this.callbacks.onBatteryLevelChange(config.level);
    }

    // Check if power save mode changed
    if (previousConfig?.powerSaveMode !== config.powerSaveMode) {
      this.handlePowerSaveModeChange(config.powerSaveMode);
    }

    // Check if discovery interval changed
    if (previousConfig?.discoveryInterval !== config.discoveryInterval) {
      if (this.callbacks.onDiscoveryIntervalChange) {
        this.callbacks.onDiscoveryIntervalChange(config.discoveryInterval);
      }
    }

    // Pause non-critical tasks if battery is low
    if (config.level < 20) {
      this.pauseNonCriticalTasks();
    } else {
      this.resumeNonCriticalTasks();
    }
  }

  /**
   * Handle power save mode changes
   * Requirements: 6.3, 6.4, 6.7, 6.8
   */
  private handlePowerSaveModeChange(enabled: boolean) {
    if (this.callbacks.onPowerSaveModeChange) {
      this.callbacks.onPowerSaveModeChange(enabled);
    }

    if (enabled) {
      console.log('[Battery Service] Entering power save mode');
      // Disable animations
      // Use pure black backgrounds
      // Pause non-critical tasks
      this.pauseNonCriticalTasks();
    } else {
      console.log('[Battery Service] Exiting power save mode');
      this.resumeNonCriticalTasks();
    }
  }

  /**
   * Register a background task
   */
  registerBackgroundTask(taskId: string, isCritical: boolean = false) {
    this.backgroundTasks.add(taskId);
    if (isCritical) {
      this.criticalTasks.add(taskId);
    }
  }

  /**
   * Unregister a background task
   */
  unregisterBackgroundTask(taskId: string) {
    this.backgroundTasks.delete(taskId);
    this.criticalTasks.delete(taskId);
  }

  /**
   * Pause non-critical background tasks
   * Requirements: 6.7
   */
  private pauseNonCriticalTasks() {
    const nonCriticalTasks = Array.from(this.backgroundTasks).filter(
      taskId => !this.criticalTasks.has(taskId)
    );

    console.log('[Battery Service] Pausing non-critical tasks:', nonCriticalTasks);
    
    // In production, this would actually pause the tasks
    // For now, just log the action
  }

  /**
   * Resume non-critical background tasks
   */
  private resumeNonCriticalTasks() {
    const nonCriticalTasks = Array.from(this.backgroundTasks).filter(
      taskId => !this.criticalTasks.has(taskId)
    );

    console.log('[Battery Service] Resuming non-critical tasks:', nonCriticalTasks);
    
    // In production, this would actually resume the tasks
  }

  /**
   * Get recommended Bluetooth discovery interval based on battery level
   * Requirements: 6.2
   */
  getDiscoveryInterval(batteryLevel: number): number {
    if (batteryLevel > BATTERY_THRESHOLDS.HIGH.min) {
      return BATTERY_THRESHOLDS.HIGH.interval;
    } else if (batteryLevel > BATTERY_THRESHOLDS.MEDIUM.min) {
      return BATTERY_THRESHOLDS.MEDIUM.interval;
    } else {
      return BATTERY_THRESHOLDS.LOW.interval;
    }
  }

  /**
   * Check if animations should be enabled
   * Requirements: 6.3
   */
  shouldEnableAnimations(batteryLevel: number): boolean {
    return batteryLevel >= 20;
  }

  /**
   * Check if power save mode should be active
   */
  shouldEnablePowerSaveMode(batteryLevel: number): boolean {
    return batteryLevel < 20;
  }

  /**
   * Get current battery configuration
   */
  getCurrentConfig(): BatteryConfig | null {
    return this.currentConfig;
  }

  /**
   * Get battery status summary
   */
  getStatusSummary(): string {
    if (!this.currentConfig) {
      return 'Battery status unknown';
    }

    const { level, powerSaveMode, isCharging } = this.currentConfig;

    if (isCharging) {
      return `Charging (${level}%)`;
    }

    if (powerSaveMode) {
      return `Power Save Mode (${level}%)`;
    }

    if (level > 50) {
      return `Good (${level}%)`;
    } else if (level > 20) {
      return `Fair (${level}%)`;
    } else {
      return `Low (${level}%)`;
    }
  }
}

// Export singleton instance
export const batteryService = new BatteryService();
