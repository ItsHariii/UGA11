/**
 * usePermissions Hook
 * Provides access to permission status and related actions from AppContext.
 *
 * Requirements: 7.1, 7.6, 8.1, 8.2, 8.3, 8.4
 */

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../context';
import { MeshPermission, PermissionState, PermissionStatus } from '../types';

export interface UsePermissionsResult {
  /** Current permission status for all mesh permissions */
  permissions: PermissionStatus;

  /** Whether all permissions are granted and mesh can be used */
  canUseMesh: boolean;

  /** Whether system Bluetooth is enabled */
  isBluetoothEnabled: boolean;

  /** Check if a specific permission is granted */
  isGranted: (permission: MeshPermission) => boolean;

  /** Check if a specific permission is denied */
  isDenied: (permission: MeshPermission) => boolean;

  /** Get the state of a specific permission */
  getPermissionState: (permission: MeshPermission) => PermissionState;

  /** Update all permissions */
  setPermissions: (permissions: PermissionStatus) => void;

  /** Update Bluetooth enabled state */
  setBluetoothEnabled: (enabled: boolean) => void;

  /** List of permissions that are denied */
  deniedPermissions: MeshPermission[];

  /** Whether any permission is denied */
  hasAnyDenied: boolean;
}

/**
 * Hook for accessing permission state and actions
 */
export function usePermissions(): UsePermissionsResult {
  const { state, setPermissions, setBluetoothEnabled } = useAppContext();

  const isGranted = useCallback(
    (permission: MeshPermission): boolean => {
      return state.permissions[permission] === 'granted';
    },
    [state.permissions]
  );

  const isDenied = useCallback(
    (permission: MeshPermission): boolean => {
      const permState = state.permissions[permission];
      return permState === 'denied' || permState === 'never_ask_again';
    },
    [state.permissions]
  );

  const getPermissionState = useCallback(
    (permission: MeshPermission): PermissionState => {
      return state.permissions[permission];
    },
    [state.permissions]
  );

  const deniedPermissions = useMemo((): MeshPermission[] => {
    const permissions: MeshPermission[] = ['bluetooth', 'location', 'nearby_devices'];
    return permissions.filter((p) => isDenied(p));
  }, [isDenied]);

  const hasAnyDenied = useMemo(
    () => deniedPermissions.length > 0,
    [deniedPermissions]
  );

  return {
    permissions: state.permissions,
    canUseMesh: state.permissions.canUseMesh,
    isBluetoothEnabled: state.isBluetoothEnabled,
    isGranted,
    isDenied,
    getPermissionState,
    setPermissions,
    setBluetoothEnabled,
    deniedPermissions,
    hasAnyDenied,
  };
}

export default usePermissions;
