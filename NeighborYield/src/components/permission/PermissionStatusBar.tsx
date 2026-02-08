/**
 * PermissionStatusBar Component
 * Displays icons indicating granted/denied status for each permission
 * with warning indicators for denied permissions.
 *
 * Requirements: 8.1, 8.2, 8.3
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MeshPermission, PermissionState, PermissionStatus } from '../../types';

export interface PermissionStatusBarProps {
  permissionStatus: PermissionStatus;
  onPermissionPress: (permission: MeshPermission) => void;
  isBluetoothEnabled?: boolean;
  onBluetoothPrompt?: () => void;
}

export interface PermissionIconConfig {
  icon: string;
  label: string;
  grantedColor: string;
  deniedColor: string;
}

/**
 * Returns icon configuration for each permission type
 */
export function getPermissionIconConfig(permission: MeshPermission): PermissionIconConfig {
  switch (permission) {
    case 'bluetooth':
      return {
        icon: '📶',
        label: 'Bluetooth',
        grantedColor: '#2e7d32',
        deniedColor: '#d32f2f',
      };
    case 'location':
      return {
        icon: '📍',
        label: 'Location',
        grantedColor: '#2e7d32',
        deniedColor: '#d32f2f',
      };
    case 'nearby_devices':
      return {
        icon: '👥',
        label: 'Nearby',
        grantedColor: '#2e7d32',
        deniedColor: '#d32f2f',
      };
    default:
      return {
        icon: '⚙️',
        label: 'Unknown',
        grantedColor: '#2e7d32',
        deniedColor: '#d32f2f',
      };
  }
}

/**
 * Returns the status icon based on permission state
 * Property 21: Permission Status Visualization
 */
export function getStatusIcon(state: PermissionState): string {
  switch (state) {
    case 'granted':
      return '✓';
    case 'denied':
    case 'never_ask_again':
      return '✗';
    case 'unavailable':
      return '—';
    default:
      return '?';
  }
}

/**
 * Returns whether a permission state should show a warning
 */
export function shouldShowWarning(state: PermissionState): boolean {
  return state === 'denied' || state === 'never_ask_again';
}

/**
 * Returns reduced functionality explanation for denied permissions
 */
export function getReducedFunctionalityText(permission: MeshPermission): string {
  switch (permission) {
    case 'bluetooth':
      return 'Mesh networking disabled. Online mode only.';
    case 'location':
      return 'Cannot discover nearby neighbors.';
    case 'nearby_devices':
      return 'Cannot connect to nearby devices.';
    default:
      return 'Some features may be limited.';
  }
}

interface PermissionIconProps {
  permission: MeshPermission;
  state: PermissionState;
  onPress: () => void;
}

function PermissionIcon({ permission, state, onPress }: PermissionIconProps): React.JSX.Element {
  const config = getPermissionIconConfig(permission);
  const isGranted = state === 'granted';
  const showWarning = shouldShowWarning(state);

  return (
    <Pressable
      style={styles.iconButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${config.label}: ${isGranted ? 'granted' : 'denied'}`}
      accessibilityHint={showWarning ? 'Tap to fix permission' : 'Tap for details'}>
      <View
        style={[
          styles.iconContainer,
          isGranted ? styles.iconContainerGranted : styles.iconContainerDenied,
        ]}>
        <Text style={styles.permissionIcon}>{config.icon}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isGranted ? config.grantedColor : config.deniedColor },
          ]}>
          <Text style={styles.statusIcon}>{getStatusIcon(state)}</Text>
        </View>
      </View>
      <Text style={[styles.label, showWarning && styles.warningLabel]}>{config.label}</Text>
      {showWarning && <Text style={styles.warningIcon}>⚠️</Text>}
    </Pressable>
  );
}

export function PermissionStatusBar({
  permissionStatus,
  onPermissionPress,
  isBluetoothEnabled = true,
  onBluetoothPrompt,
}: PermissionStatusBarProps): React.JSX.Element {
  const permissions: MeshPermission[] = ['bluetooth', 'location', 'nearby_devices'];
  const hasAnyDenied = !permissionStatus.canUseMesh;

  return (
    <View style={styles.container}>
      <View style={styles.iconsRow}>
        {permissions.map(permission => {
          const permKey = permission === 'nearby_devices' ? 'nearbyDevices' : permission;
          const state = permissionStatus[permKey as keyof Omit<PermissionStatus, 'canUseMesh'>];
          return (
            <PermissionIcon
              key={permission}
              permission={permission}
              state={state}
              onPress={() => onPermissionPress(permission)}
            />
          );
        })}
      </View>

      {hasAnyDenied && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>Some permissions are missing. Tap an icon to fix.</Text>
        </View>
      )}

      {!isBluetoothEnabled && permissionStatus.bluetooth === 'granted' && (
        <Pressable
          style={styles.bluetoothBanner}
          onPress={onBluetoothPrompt}
          accessibilityRole="button"
          accessibilityLabel="Enable Bluetooth">
          <Text style={styles.bluetoothIcon}>📶</Text>
          <Text style={styles.bluetoothText}>
            Bluetooth is off. Tap to enable for mesh networking.
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  iconButton: {
    alignItems: 'center',
    minWidth: 70,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainerGranted: {
    backgroundColor: '#e8f5e9',
  },
  iconContainerDenied: {
    backgroundColor: '#ffebee',
  },
  permissionIcon: {
    fontSize: 24,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  statusIcon: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: '#616161',
    fontWeight: '500',
  },
  warningLabel: {
    color: '#d32f2f',
  },
  warningIcon: {
    fontSize: 12,
    marginTop: 2,
  },
  warningBanner: {
    marginTop: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 10,
  },
  warningText: {
    fontSize: 13,
    color: '#e65100',
    textAlign: 'center',
  },
  bluetoothBanner: {
    marginTop: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bluetoothIcon: {
    fontSize: 16,
  },
  bluetoothText: {
    flex: 1,
    fontSize: 13,
    color: '#1565c0',
  },
});

export default PermissionStatusBar;
