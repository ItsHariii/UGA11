/**
 * Battery Manager Implementation
 * Manages Nearby Connections lifecycle for battery optimization
 */

import { IBatteryManager } from './IBatteryManager';
import { NearbyState, Unsubscribe } from '../types/Common';
import { IPresenceManager } from './IPresenceManager';

/**
 * Battery configuration constants
 */
const BATTERY_CONFIG = {
  foregroundHeartbeatInterval: 15000,  // 15 seconds
  backgroundHeartbeatInterval: 60000,  // 60 seconds
  lowBatteryThreshold: 15,             // 15%
};

/**
 * Battery Manager implementation
 */
export class BatteryManager implements IBatteryManager {
  private currentState: NearbyState = 'disabled';
  private isInForeground: boolean = false;
  private backgroundMeshEnabled: boolean = false;
  private batteryLevel: number = 80; // Start at 80%
  private lowBatteryHandlers: Set<() => void> = new Set();
  
  constructor(private presenceManager: IPresenceManager) {
    console.log('[BatteryManager] Initialized');
  }
  
  /**
   * Handle app coming to foreground
   */
  onAppForeground(): void {
    this.isInForeground = true;
    console.log('[BatteryManager] App entered foreground');
    
    if (!this.isLowBattery()) {
      this.currentState = 'active';
      this.presenceManager.setHeartbeatInterval(BATTERY_CONFIG.foregroundHeartbeatInterval);
      this.presenceManager.startBroadcasting();
      console.log('[BatteryManager] Nearby set to active (foreground)');
    }
  }
  
  /**
   * Handle app going to background
   */
  onAppBackground(): void {
    this.isInForeground = false;
    console.log('[BatteryManager] App entered background');
    
    if (this.backgroundMeshEnabled && !this.isLowBattery()) {
      this.currentState = 'active';
      this.presenceManager.setHeartbeatInterval(BATTERY_CONFIG.backgroundHeartbeatInterval);
      console.log('[BatteryManager] Nearby remains active (background mesh enabled)');
    } else {
      this.currentState = 'suspended';
      this.presenceManager.stopBroadcasting();
      console.log('[BatteryManager] Nearby suspended (background)');
    }
  }
  
  /**
   * Set background mesh preference
   */
  setBackgroundMeshEnabled(enabled: boolean): void {
    this.backgroundMeshEnabled = enabled;
    console.log(`[BatteryManager] Background mesh ${enabled ? 'enabled' : 'disabled'}`);
    
    // If we're in background, update state accordingly
    if (!this.isInForeground) {
      if (enabled && !this.isLowBattery()) {
        this.onAppBackground(); // Re-evaluate state
      } else {
        this.currentState = 'suspended';
        this.presenceManager.stopBroadcasting();
      }
    }
  }
  
  /**
   * Check if background mesh is enabled
   */
  isBackgroundMeshEnabled(): boolean {
    return this.backgroundMeshEnabled;
  }
  
  /**
   * Get current battery level
   */
  getBatteryLevel(): number {
    return this.batteryLevel;
  }
  
  /**
   * Check if battery is low
   */
  isLowBattery(): boolean {
    return this.batteryLevel < BATTERY_CONFIG.lowBatteryThreshold;
  }
  
  /**
   * Subscribe to low battery events
   */
  onLowBattery(handler: () => void): Unsubscribe {
    this.lowBatteryHandlers.add(handler);
    return () => {
      this.lowBatteryHandlers.delete(handler);
    };
  }
  
  /**
   * Get current Nearby state
   */
  getNearbyState(): NearbyState {
    return this.currentState;
  }
  
  /**
   * Simulate battery level change (for testing)
   */
  simulateBatteryLevel(level: number): void {
    const wasLowBattery = this.isLowBattery();
    this.batteryLevel = level;
    const isNowLowBattery = this.isLowBattery();
    
    console.log(`[BatteryManager] Battery level: ${level}%`);
    
    if (!wasLowBattery && isNowLowBattery) {
      console.log('[BatteryManager] ⚠️  Low battery detected - disabling background mesh');
      this.backgroundMeshEnabled = false;
      this.currentState = 'disabled';
      this.presenceManager.stopBroadcasting();
      
      // Emit low battery event
      this.lowBatteryHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.error('[BatteryManager] Error in low battery handler:', error);
        }
      });
    }
  }
  
  /**
   * Dispose of the manager and cleanup resources
   */
  dispose(): void {
    this.lowBatteryHandlers.clear();
    console.log('[BatteryManager] Disposed');
  }
}
