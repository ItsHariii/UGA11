/**
 * Performance Utilities for NeighborYield
 * Provides render tracking, mode-aware animation optimization,
 * and asset preloading for Survival UI efficiency.
 *
 * Requirements: 9.3, 9.4, 9.6
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeMode } from '../theme/ThemeContext';

// ============================================
// Animation Frame Rate Configuration
// Requirements: 9.3 - Simplified animations with reduced frame rates
// ============================================

export interface AnimationConfig {
  /** Target frame rate for animations */
  frameRate: number;
  /** Frame interval in milliseconds */
  frameInterval: number;
  /** Whether animations should be enabled */
  enabled: boolean;
  /** Whether to use simplified animations */
  simplified: boolean;
}

/**
 * Animation configuration for Abundance mode (full quality)
 */
export const abundanceAnimationConfig: AnimationConfig = {
  frameRate: 60,
  frameInterval: 1000 / 60, // ~16.67ms
  enabled: true,
  simplified: false,
};

/**
 * Animation configuration for Survival mode (battery efficient)
 * Requirements: 9.3 - Use simplified animations with reduced frame rates
 */
export const survivalAnimationConfig: AnimationConfig = {
  frameRate: 30,
  frameInterval: 1000 / 30, // ~33.33ms
  enabled: true,
  simplified: true,
};

/**
 * Get animation configuration based on theme mode
 */
export function getAnimationConfigForMode(mode: ThemeMode): AnimationConfig {
  return mode === 'survival' ? survivalAnimationConfig : abundanceAnimationConfig;
}

// ============================================
// Render Tracking Utilities
// Requirements: 9.6 - Measure and log render performance metrics
// ============================================

export interface RenderMetrics {
  /** Component name being tracked */
  componentName: string;
  /** Total number of renders */
  renderCount: number;
  /** Timestamps of recent renders */
  renderTimestamps: number[];
  /** Average time between renders (ms) */
  averageRenderInterval: number;
  /** Last render timestamp */
  lastRenderTime: number;
}

/**
 * Create a render tracker for a component
 */
export function createRenderTracker(componentName: string): RenderMetrics {
  return {
    componentName,
    renderCount: 0,
    renderTimestamps: [],
    averageRenderInterval: 0,
    lastRenderTime: 0,
  };
}

/**
 * Record a render event and update metrics
 */
export function recordRender(metrics: RenderMetrics): RenderMetrics {
  const now = Date.now();
  const newTimestamps = [...metrics.renderTimestamps, now].slice(-10); // Keep last 10

  let averageInterval = 0;
  if (newTimestamps.length > 1) {
    const intervals: number[] = [];
    for (let i = 1; i < newTimestamps.length; i++) {
      intervals.push(newTimestamps[i] - newTimestamps[i - 1]);
    }
    averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  return {
    ...metrics,
    renderCount: metrics.renderCount + 1,
    renderTimestamps: newTimestamps,
    averageRenderInterval: averageInterval,
    lastRenderTime: now,
  };
}

/**
 * Log render metrics to console (for development)
 */
export function logRenderMetrics(metrics: RenderMetrics): void {
  if (__DEV__) {
    console.log(`[RenderTracker] ${metrics.componentName}:`, {
      renderCount: metrics.renderCount,
      avgInterval: `${metrics.averageRenderInterval.toFixed(2)}ms`,
      lastRender: new Date(metrics.lastRenderTime).toISOString(),
    });
  }
}

// ============================================
// useRenderTracker Hook
// Requirements: 9.6 - Measure and log render performance metrics
// ============================================

export interface UseRenderTrackerResult {
  /** Current render metrics */
  metrics: RenderMetrics;
  /** Log current metrics to console */
  logMetrics: () => void;
  /** Reset the tracker */
  reset: () => void;
}

/**
 * Hook for tracking component render performance
 */
export function useRenderTracker(componentName: string): UseRenderTrackerResult {
  const metricsRef = useRef<RenderMetrics>(createRenderTracker(componentName));

  // Record render on each call
  useEffect(() => {
    metricsRef.current = recordRender(metricsRef.current);
  });

  const logMetrics = useCallback(() => {
    logRenderMetrics(metricsRef.current);
  }, []);

  const reset = useCallback(() => {
    metricsRef.current = createRenderTracker(componentName);
  }, [componentName]);

  return {
    metrics: metricsRef.current,
    logMetrics,
    reset,
  };
}

// ============================================
// useOptimizedAnimation Hook
// Requirements: 9.3 - Mode-aware frame rates
// ============================================

export interface UseOptimizedAnimationResult {
  /** Current animation configuration */
  config: AnimationConfig;
  /** Whether animations should run */
  shouldAnimate: boolean;
  /** Get throttled animation callback */
  throttle: <T extends (...args: unknown[]) => void>(callback: T) => T;
}

/**
 * Hook for mode-aware animation optimization
 * Provides throttled callbacks and configuration based on theme mode
 */
export function useOptimizedAnimation(mode: ThemeMode): UseOptimizedAnimationResult {
  const config = useMemo(() => getAnimationConfigForMode(mode), [mode]);
  const lastCallRef = useRef<number>(0);

  const throttle = useCallback(
    <T extends (...args: unknown[]) => void>(callback: T): T => {
      const throttled = ((...args: unknown[]) => {
        const now = Date.now();
        if (now - lastCallRef.current >= config.frameInterval) {
          lastCallRef.current = now;
          callback(...args);
        }
      }) as T;
      return throttled;
    },
    [config.frameInterval],
  );

  return {
    config,
    shouldAnimate: config.enabled,
    throttle,
  };
}

// ============================================
// Background Process Management
// Requirements: 9.5 - Disable non-essential background processes
// ============================================

export type BackgroundProcessType =
  | 'analytics'
  | 'prefetching'
  | 'sync'
  | 'telemetry'
  | 'cache_cleanup';

export interface BackgroundProcessConfig {
  /** Process type identifier */
  type: BackgroundProcessType;
  /** Whether the process is essential (runs in all modes) */
  essential: boolean;
  /** Whether the process is currently enabled */
  enabled: boolean;
}

/**
 * Default background process configurations
 */
export const defaultBackgroundProcesses: BackgroundProcessConfig[] = [
  { type: 'analytics', essential: false, enabled: true },
  { type: 'prefetching', essential: false, enabled: true },
  { type: 'sync', essential: true, enabled: true },
  { type: 'telemetry', essential: false, enabled: true },
  { type: 'cache_cleanup', essential: true, enabled: true },
];

/**
 * Get enabled background processes for a given mode
 * Requirements: 9.5 - Disable non-essential processes in survival mode
 */
export function getEnabledProcesses(
  mode: ThemeMode,
  processes: BackgroundProcessConfig[] = defaultBackgroundProcesses,
): BackgroundProcessConfig[] {
  if (mode === 'survival') {
    // Only essential processes in survival mode
    return processes.filter(p => p.essential);
  }
  // All enabled processes in abundance mode
  return processes.filter(p => p.enabled);
}

/**
 * Check if a specific process should run in the given mode
 */
export function shouldProcessRun(
  processType: BackgroundProcessType,
  mode: ThemeMode,
  processes: BackgroundProcessConfig[] = defaultBackgroundProcesses,
): boolean {
  const process = processes.find(p => p.type === processType);
  if (!process) return false;

  if (mode === 'survival') {
    return process.essential && process.enabled;
  }
  return process.enabled;
}

// ============================================
// useBackgroundProcesses Hook
// Requirements: 9.5 - Disable non-essential background processes
// ============================================

export interface UseBackgroundProcessesResult {
  /** Currently enabled processes */
  enabledProcesses: BackgroundProcessConfig[];
  /** Check if a specific process should run */
  shouldRun: (processType: BackgroundProcessType) => boolean;
  /** List of disabled processes (for logging/debugging) */
  disabledProcesses: BackgroundProcessConfig[];
}

/**
 * Hook for managing background processes based on theme mode
 */
export function useBackgroundProcesses(mode: ThemeMode): UseBackgroundProcessesResult {
  const enabledProcesses = useMemo(() => getEnabledProcesses(mode), [mode]);

  const disabledProcesses = useMemo(
    () => defaultBackgroundProcesses.filter(p => !enabledProcesses.some(ep => ep.type === p.type)),
    [enabledProcesses],
  );

  const shouldRun = useCallback(
    (processType: BackgroundProcessType) => shouldProcessRun(processType, mode),
    [mode],
  );

  return {
    enabledProcesses,
    shouldRun,
    disabledProcesses,
  };
}

// ============================================
// Asset Preloading
// Requirements: 9.4 - Preload Survival_UI assets during initial app launch
// ============================================

export interface PreloadedAsset {
  /** Asset identifier */
  id: string;
  /** Asset type */
  type: 'icon' | 'font' | 'image';
  /** Whether the asset is loaded */
  loaded: boolean;
  /** Error if loading failed */
  error?: string;
}

export interface AssetPreloadState {
  /** Whether preloading is in progress */
  isLoading: boolean;
  /** Whether preloading is complete */
  isComplete: boolean;
  /** List of preloaded assets */
  assets: PreloadedAsset[];
  /** Overall progress (0-1) */
  progress: number;
}

/**
 * Survival mode icon identifiers that should be preloaded
 * These correspond to lucide-react-native icons used in survival mode
 */
export const survivalModeIcons: string[] = [
  'wifi-off',
  'wifi',
  'bluetooth',
  'bluetooth-off',
  'signal',
  'signal-low',
  'signal-medium',
  'signal-high',
  'battery',
  'battery-low',
  'battery-medium',
  'battery-full',
  'alert-triangle',
  'alert-circle',
  'check-circle',
  'x-circle',
  'info',
  'map-pin',
  'navigation',
  'users',
  'user',
  'package',
  'clock',
  'calendar',
  'search',
  'menu',
  'settings',
  'home',
  'list',
  'grid',
  'refresh-cw',
  'loader',
  'chevron-up',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'plus',
  'minus',
  'x',
  'check',
  'edit',
  'trash',
  'share',
  'heart',
  'star',
  'camera',
  'image',
  'file',
  'folder',
  'link',
  'external-link',
  'copy',
  'clipboard',
  'download',
  'upload',
  'send',
  'message-circle',
  'bell',
  'bell-off',
  'eye',
  'eye-off',
  'lock',
  'unlock',
  'shield',
  'zap',
  'activity',
  'radio',
  'radar',
];

/**
 * Create initial preload state
 */
export function createPreloadState(): AssetPreloadState {
  return {
    isLoading: false,
    isComplete: false,
    assets: [],
    progress: 0,
  };
}

/**
 * Simulate asset preloading (icons are bundled, so this is mainly for tracking)
 * In a real implementation, this would preload actual assets
 */
export async function preloadSurvivalAssets(): Promise<AssetPreloadState> {
  const assets: PreloadedAsset[] = survivalModeIcons.map(icon => ({
    id: icon,
    type: 'icon' as const,
    loaded: true, // Icons from lucide-react-native are bundled
  }));

  return {
    isLoading: false,
    isComplete: true,
    assets,
    progress: 1,
  };
}

// ============================================
// useAssetPreload Hook
// Requirements: 9.4 - Preload Survival_UI assets during initial app launch
// ============================================

export interface UseAssetPreloadResult {
  /** Current preload state */
  state: AssetPreloadState;
  /** Trigger preloading */
  preload: () => Promise<void>;
  /** Whether assets are ready */
  isReady: boolean;
}

/**
 * Hook for preloading survival mode assets
 */
export function useAssetPreload(): UseAssetPreloadResult {
  const [state, setState] = useState<AssetPreloadState>(createPreloadState);

  const preload = useCallback(async () => {
    if (state.isComplete || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await preloadSurvivalAssets();
      setState(result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isComplete: false,
      }));
    }
  }, [state.isComplete, state.isLoading]);

  return {
    state,
    preload,
    isReady: state.isComplete,
  };
}

// ============================================
// Performance Mode Configuration
// Combines all performance settings for a given mode
// ============================================

export interface PerformanceModeConfig {
  /** Theme mode */
  mode: ThemeMode;
  /** Animation configuration */
  animation: AnimationConfig;
  /** Enabled background processes */
  backgroundProcesses: BackgroundProcessConfig[];
  /** Whether to use memoization aggressively */
  aggressiveMemoization: boolean;
  /** Whether to disable non-essential features */
  minimalFeatures: boolean;
}

/**
 * Get complete performance configuration for a mode
 */
export function getPerformanceConfig(mode: ThemeMode): PerformanceModeConfig {
  return {
    mode,
    animation: getAnimationConfigForMode(mode),
    backgroundProcesses: getEnabledProcesses(mode),
    aggressiveMemoization: mode === 'survival',
    minimalFeatures: mode === 'survival',
  };
}

// ============================================
// usePerformanceMode Hook
// Combines all performance utilities into a single hook
// ============================================

export interface UsePerformanceModeResult {
  /** Complete performance configuration */
  config: PerformanceModeConfig;
  /** Animation utilities */
  animation: UseOptimizedAnimationResult;
  /** Background process utilities */
  processes: UseBackgroundProcessesResult;
  /** Asset preload utilities */
  assets: UseAssetPreloadResult;
}

/**
 * Combined hook for all performance utilities
 */
export function usePerformanceMode(mode: ThemeMode): UsePerformanceModeResult {
  const config = useMemo(() => getPerformanceConfig(mode), [mode]);
  const animation = useOptimizedAnimation(mode);
  const processes = useBackgroundProcesses(mode);
  const assets = useAssetPreload();

  return {
    config,
    animation,
    processes,
    assets,
  };
}
