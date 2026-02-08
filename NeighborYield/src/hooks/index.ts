/**
 * Custom hooks barrel export
 * Export all custom React hooks from this file
 */

// Connectivity hooks
export { useConnectivity, type UseConnectivityResult } from './useConnectivity';

// Permission hooks
export { usePermissions, type UsePermissionsResult } from './usePermissions';

// Presence hooks
export { usePeerCount, formatPeerCount, type UsePeerCountResult } from './usePeerCount';

// TTL hooks
export { useTTL, type UseTTLResult } from './useTTL';

// Battery hooks
export { 
  useBatteryMonitor, 
  useBrightnessRecommendation,
  useBatteryLogger,
  getBatteryConfig,
  getBatteryColor,
  getBatteryIcon,
  BATTERY_THRESHOLDS,
  type BatteryConfig 
} from './useBatteryMonitor';
