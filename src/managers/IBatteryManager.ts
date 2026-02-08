/**
 * Battery Manager Interface
 */

import { NearbyState, Unsubscribe } from '../types/Common';

export interface IBatteryManager {
  // App lifecycle hooks
  onAppForeground(): void;
  onAppBackground(): void;
  
  // Background mesh preference
  setBackgroundMeshEnabled(enabled: boolean): void;
  isBackgroundMeshEnabled(): boolean;
  
  // Battery monitoring
  getBatteryLevel(): number;
  isLowBattery(): boolean;
  
  // Subscribe to battery events
  onLowBattery(handler: () => void): Unsubscribe;
  
  // Get current Nearby state
  getNearbyState(): NearbyState;
  
  // Testing utilities
  simulateBatteryLevel?(level: number): void;
  
  // Cleanup
  dispose(): void;
}
