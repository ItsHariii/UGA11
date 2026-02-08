/**
 * Connectivity components barrel export
 */

export {
  ConnectivityBanner,
  getModeConfig,
  getDisconnectedInstructions,
} from './ConnectivityBanner';
export type { ConnectivityBannerProps, ModeConfig } from './ConnectivityBanner';

export {
  BackgroundMeshToggle,
  getToggleDescription,
  getBatteryImpactText,
} from './BackgroundMeshToggle';
export type { BackgroundMeshToggleProps } from './BackgroundMeshToggle';

export {
  LowBatteryNotice,
  LOW_BATTERY_THRESHOLD,
  isLowBattery,
  getNoticeMessage,
  getActionHint,
} from './LowBatteryNotice';
export type { LowBatteryNoticeProps } from './LowBatteryNotice';

export {
  DynamicIsland,
  getModeDisplayConfig,
  shouldShowPeerCount,
  shouldShowRadar,
} from './DynamicIsland';
export type { DynamicIslandProps, ModeDisplayConfig } from './DynamicIsland';

export {
  SurvivalConnectivityIsland,
  formatRelativeTime,
  getBatteryColor,
  getBatteryIcon,
} from './SurvivalConnectivityIsland';
export type { SurvivalConnectivityIslandProps } from './SurvivalConnectivityIsland';
