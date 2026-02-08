/**
 * Utilities barrel export
 * Export all utility functions and hooks from this file
 */

// Performance utilities
export {
  // Animation configuration
  type AnimationConfig,
  abundanceAnimationConfig,
  survivalAnimationConfig,
  getAnimationConfigForMode,

  // Render tracking
  type RenderMetrics,
  createRenderTracker,
  recordRender,
  logRenderMetrics,
  useRenderTracker,
  type UseRenderTrackerResult,

  // Optimized animation hook
  useOptimizedAnimation,
  type UseOptimizedAnimationResult,

  // Background process management
  type BackgroundProcessType,
  type BackgroundProcessConfig,
  defaultBackgroundProcesses,
  getEnabledProcesses,
  shouldProcessRun,
  useBackgroundProcesses,
  type UseBackgroundProcessesResult,

  // Asset preloading
  type PreloadedAsset,
  type AssetPreloadState,
  survivalModeIcons,
  createPreloadState,
  preloadSurvivalAssets,
  useAssetPreload,
  type UseAssetPreloadResult,

  // Performance mode configuration
  type PerformanceModeConfig,
  getPerformanceConfig,
  usePerformanceMode,
  type UsePerformanceModeResult,
} from './performance';

// Haptic feedback utilities
export {
  type HapticFeedbackType,
  type HapticConfig,
  type UseHapticsResult,
  type HapticTouchableProps,
  defaultHapticConfig,
  configureHaptics,
  setHapticMode,
  getHapticMode,
  isHapticsEnabled,
  triggerHaptic,
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerHeavyHaptic,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
  triggerErrorHaptic,
  useHaptics,
  HapticTouchable,
} from './haptics';

// React optimization utilities
export {
  // Memoization utilities
  type MemoOptions,
  createMemoizedComponent,
  shallowEqual,
  deepEqual,
  createPropsComparison,

  // Survival mode optimization hooks
  useSurvivalMemo,
  useSurvivalCallback,
  useRenderLimit,

  // Background process control
  type ProcessType,
  type ProcessConfig,
  defaultProcessConfigs,
  getActiveProcesses,
  isProcessActive,
  useBackgroundProcessControl,

  // Expensive calculation memoization
  memoizeCalculation,
  clearCalculationCache,
  useMemoizedCalculation,

  // Component optimization helpers
  type OptimizedComponentProps,
  withSurvivalOptimization,

  // Render batching utilities
  batchUpdates,
  useBatchedUpdates,
} from './optimizations';

// Validation utilities
export {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePasswordMatch,
  formatPhoneNumber,
} from './validation';

// Interest flow utilities
export {
  type InitialMessagePromptResult,
  promptForInitialMessage,
  handleInterestWithMessage,
} from './interestFlow';
