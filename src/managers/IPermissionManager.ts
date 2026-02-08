/**
 * Permission Manager Interface
 * Handles Android runtime permissions for mesh functionality
 */

import { PermissionState, MeshPermission, Unsubscribe } from '../types/Common';

export interface PermissionStatus {
  bluetooth: PermissionState;
  location: PermissionState;
  nearbyDevices: PermissionState;
  canUseMesh: boolean;
}

export interface PermissionResult {
  granted: boolean;
  state: PermissionState;
}

export interface IPermissionManager {
  /**
   * Check all required permissions
   */
  checkPermissions(): Promise<PermissionStatus>;
  
  /**
   * Request a specific permission with explanation
   */
  requestPermission(permission: MeshPermission): Promise<PermissionResult>;
  
  /**
   * Request all permissions in sequence
   */
  requestAllPermissions(): Promise<PermissionStatus>;
  
  /**
   * Subscribe to permission changes
   */
  onPermissionChange(handler: (status: PermissionStatus) => void): Unsubscribe;
  
  /**
   * Open system settings for permissions
   */
  openSettings(): Promise<void>;
}
