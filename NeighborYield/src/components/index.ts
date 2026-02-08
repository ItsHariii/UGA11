/**
 * Components barrel export
 * Export all reusable UI components from this file
 */

// Feed components
export {
  SharePostCard,
  formatRelativeTime,
  getRemainingTTL,
  isInWarningState,
  getRiskTierLabel,
  InterestedButton,
  getButtonText,
  FeedList,
} from './feed';
export type {
  SharePostCardProps,
  InterestedButtonProps,
  InterestButtonState,
  FeedListProps,
} from './feed';

// Post components
export {
  PostCreatorForm,
  formatTTLPreview,
  validateFormData,
  RiskTierPicker,
  getTTLLabel,
  RISK_TIER_OPTIONS,
} from './post';
export type {
  PostCreatorFormProps,
  PostFormData,
  RiskTierPickerProps,
  RiskTierOption,
} from './post';

// Presence components
export {
  PresenceIndicator,
  formatPeerCountDisplay,
  shouldShowIndicator,
  getOnlineModeText,
  PresenceTooltip,
  getTooltipExplanation,
  getTooltipTitle,
  PresenceDisplay,
  isOnlineOnlyMode,
} from './presence';
export type {
  PresenceIndicatorProps,
  PresenceTooltipProps,
  PresenceDisplayProps,
} from './presence';

// Permission components
export {
  PermissionExplanationScreen,
  getPermissionExplanation,
  PermissionStatusBar,
  getPermissionIconConfig,
  getStatusIcon,
  shouldShowWarning,
  getReducedFunctionalityText,
  BluetoothDisabledPrompt,
} from './permission';
export type {
  PermissionExplanationScreenProps,
  PermissionExplanation,
  PermissionStatusBarProps,
  PermissionIconConfig,
  BluetoothDisabledPromptProps,
} from './permission';

// Interest components
export {
  InterestNotificationCard,
  formatInterestTime,
  InterestQueueList,
  filterPendingInterests,
  sortInterestsByTime,
  InterestResponseToast,
  getResponseIcon,
  getResponseText,
  getResponseVariant,
} from './interest';
export type {
  InterestNotificationCardProps,
  InterestQueueListProps,
  InterestQueueItem,
  InterestResponseToastProps,
} from './interest';

// Connectivity components
export {
  ConnectivityBanner,
  getModeConfig,
  getDisconnectedInstructions,
  BackgroundMeshToggle,
  getToggleDescription,
  getBatteryImpactText,
  LowBatteryNotice,
  LOW_BATTERY_THRESHOLD,
  isLowBattery,
  getNoticeMessage,
  getActionHint,
} from './connectivity';
export type {
  ConnectivityBannerProps,
  ModeConfig,
  BackgroundMeshToggleProps,
  LowBatteryNoticeProps,
} from './connectivity';