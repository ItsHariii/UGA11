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
  DualModeFeedCard,
  getModeConfig as getFeedCardModeConfig,
  getCategoryFromPost,
  getCategoryIcon,
  getCategoryIconComponent,
  getRiskTierStyle,
  abundanceModeConfig,
  survivalModeConfig,
} from './feed';
export type {
  SharePostCardProps,
  InterestedButtonProps,
  InterestButtonState,
  FeedListProps,
  DualModeFeedCardProps,
  CardSize as FeedCardSize,
  ModeStyleConfig,
  PostCategory,
  RiskTierStyle,
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
  DynamicIsland,
  getModeDisplayConfig,
  shouldShowPeerCount,
  shouldShowRadar,
} from './connectivity';
export type {
  ConnectivityBannerProps,
  ModeConfig,
  BackgroundMeshToggleProps,
  LowBatteryNoticeProps,
  DynamicIslandProps,
  ModeDisplayConfig,
} from './connectivity';

// Animation components
export {
  RadarRipple,
  createRippleRings,
  createRippleAnimation,
  createStaggeredAnimation,
  resetRings,
  createDirectionalHighlight,
  triggerDirectionalHighlight,
  createFadeOutAnimation,
  getAnimationConfig,
  ConnectionCelebration,
  createPulseRings,
  createPulseAnimation,
  resetPulseRings,
  isConnectionRestored,
  celebrationColors,
  useCelebration,
} from './animations';
export type {
  RadarRippleProps,
  RippleRing,
  AnimationConfig,
  DirectionalHighlight,
  ConnectionCelebrationProps,
  PulseRing,
  UseCelebrationResult,
} from './animations';

// Layout components
export {
  BentoGrid,
  calculateCardDimensions,
  assignCardSize,
  numericToPriority,
  GradientHeader,
  getGradientColorsForMode,
  abundanceGradientColors,
  survivalGradientColors,
} from './layout';
export type {
  BentoGridProps,
  BentoGridItem,
  CardSize,
  CardDimensions,
  Priority,
  GradientHeaderProps,
  GradientColors,
} from './layout';

// Scanner components
export {
  PantryScanner,
  getViewfinderConfig,
  getTokensForMode,
  shouldCameraBeActive,
  scanResultToSharePost,
  abundanceViewfinderConfig,
  survivalViewfinderConfig,
} from './scanner';
export type {
  PantryScannerProps,
  ScannerView,
  ScanResult,
  ManualEntryData,
  ViewfinderConfig,
} from './scanner';

// Map components
export {
  NeighborMap,
  getTokensForMode as getMapTokensForMode,
  determineViewMode,
  formatDistance,
  calculateRadarPosition,
  getSignalStrengthLabel,
} from './map';
export type { NeighborMapProps, MeshPeer, MapViewMode, MarkerPosition } from './map';

// Loading components
export {
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonHeader,
  SkeletonList,
  getSkeletonConfigForMode,
  abundanceSkeletonConfig,
  survivalSkeletonConfig,
} from './loading';
export type {
  SkeletonProps,
  SkeletonVariant,
  SkeletonModeConfig,
  SkeletonCardProps,
  SkeletonListItemProps,
  SkeletonHeaderProps,
  SkeletonListProps,
} from './loading';
