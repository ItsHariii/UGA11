/**
 * Permission Manager Implementation
 * Handles Android runtime permissions for mesh functionality
 */

import { IPermissionManager, PermissionStatus, PermissionResult } from './IPermissionManager';
import { PermissionState, MeshPermission, Unsubscribe } from '../types/Common';

/**
 * Permission explanations for user education
 */
const PERMISSION_EXPLANATIONS: Record<MeshPermission, string> = {
  bluetooth: 'Bluetooth enables device-to-device communication for sharing food offers with neighbors when offline.',
  location: 'Location is required by Android for Nearby Connections discovery. We do not track your location.',
  nearby_devices: 'Nearby Devices permission allows the app to find neighbors for local food sharing.',
};

/**
 * Permission Manager implementation
 * 
 * Note: This is a simulation for standalone testing.
 * In production React Native, this would use react-native-permissions
 * or platform-specific native modules.
 */
export class PermissionManager implements IPermissionManager {
  private permissions: {
    bluetooth: PermissionState;
    location: PermissionState;
    nearbyDevices: PermissionState;
  } = {
    bluetooth: 'denied',
    location: 'denied',
    nearbyDevices: 'denied',
  };
  
  private permissionChangeHandlers: Set<(status: PermissionStatus) => void> = new Set();
  
  constructor() {
    console.log('[PermissionManager] Initialized (simulation mode)');
  }
  
  /**
   * Check all required permissions
   */
  async checkPermissions(): Promise<PermissionStatus> {
    const canUseMesh = this.calculateCanUseMesh();
    
    const status: PermissionStatus = {
      bluetooth: this.permissions.bluetooth,
      location: this.permissions.location,
      nearbyDevices: this.permissions.nearbyDevices,
      canUseMesh,
    };
    
    if (!canUseMesh) {
      const deniedPerms = this.getDeniedPermissions();
      if (deniedPerms.length > 0) {
        console.log(`[PermissionManager] ⚠️  Operating in online-only mode. Missing permissions: ${deniedPerms.join(', ')}`);
      }
    }
    
    return status;
  }
  
  /**
   * Request a specific permission with explanation
   */
  async requestPermission(permission: MeshPermission): Promise<PermissionResult> {
    console.log('[PermissionManager] ━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[PermissionManager] 📋 Requesting ${permission} permission`);
    console.log(`[PermissionManager] 💡 ${PERMISSION_EXPLANATIONS[permission]}`);
    console.log('[PermissionManager] ━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Simulate user granting permission after 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const permissionKey = this.getPermissionKey(permission);
    this.permissions[permissionKey] = 'granted';
    
    console.log(`[PermissionManager] ✓ ${permission} permission granted`);
    
    // Emit change event
    this.emitPermissionChange();
    
    return {
      granted: true,
      state: 'granted',
    };
  }
  
  /**
   * Request all permissions in sequence
   */
  async requestAllPermissions(): Promise<PermissionStatus> {
    console.log('[PermissionManager] Requesting all permissions...');
    
    await this.requestPermission('bluetooth');
    await this.requestPermission('location');
    await this.requestPermission('nearby_devices');
    
    const status = await this.checkPermissions();
    
    if (status.canUseMesh) {
      console.log('[PermissionManager] ✓ All permissions granted - mesh functionality enabled');
    }
    
    return status;
  }
  
  /**
   * Subscribe to permission changes
   */
  onPermissionChange(handler: (status: PermissionStatus) => void): Unsubscribe {
    this.permissionChangeHandlers.add(handler);
    return () => {
      this.permissionChangeHandlers.delete(handler);
    };
  }
  
  /**
   * Open system settings for permissions
   */
  async openSettings(): Promise<void> {
    console.log('[PermissionManager] Opening system settings (simulated)');
    console.log('[PermissionManager] In production, this would: Linking.openSettings()');
  }
  
  /**
   * Calculate if mesh networking is fully enabled
   */
  private calculateCanUseMesh(): boolean {
    return (
      this.permissions.bluetooth === 'granted' &&
      this.permissions.location === 'granted' &&
      this.permissions.nearbyDevices === 'granted'
    );
  }
  
  /**
   * Get list of denied permissions
   */
  private getDeniedPermissions(): string[] {
    const denied: string[] = [];
    if (this.permissions.bluetooth !== 'granted') denied.push('Bluetooth');
    if (this.permissions.location !== 'granted') denied.push('Location');
    if (this.permissions.nearbyDevices !== 'granted') denied.push('Nearby Devices');
    return denied;
  }
  
  /**
   * Convert MeshPermission to permission key
   */
  private getPermissionKey(permission: MeshPermission): 'bluetooth' | 'location' | 'nearbyDevices' {
    const map: Record<MeshPermission, 'bluetooth' | 'location' | 'nearbyDevices'> = {
      bluetooth: 'bluetooth',
      location: 'location',
      nearby_devices: 'nearbyDevices',
    };
    return map[permission];
  }
  
  /**
   * Emit permission change event
   */
  private async emitPermissionChange(): Promise<void> {
    const status = await this.checkPermissions();
    this.permissionChangeHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('[PermissionManager] Error in permission change handler:', error);
      }
    });
  }
  
  /**
   * Simulate permission denial (for testing)
   */
  async simulateDenial(permission: MeshPermission): Promise<void> {
    const permissionKey = this.getPermissionKey(permission);
    this.permissions[permissionKey] = 'denied';
    console.log(`[PermissionManager] Simulated denial of ${permission}`);
    await this.emitPermissionChange();
  }
  
  /**
   * Get current permission state (for testing)
   */
  getCurrentState(): PermissionStatus {
    return {
      bluetooth: this.permissions.bluetooth,
      location: this.permissions.location,
      nearbyDevices: this.permissions.nearbyDevices,
      canUseMesh: this.calculateCanUseMesh(),
    };
  }
  
  /**
   * Dispose of the manager and cleanup resources
   */
  dispose(): void {
    this.permissionChangeHandlers.clear();
    console.log('[PermissionManager] Disposed');
  }
}
