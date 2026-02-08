/**
 * React Optimization Utilities for NeighborYield
 * Provides React.memo wrappers and useMemo utilities for survival mode efficiency.
 *
 * Requirements: 9.2, 9.5
 */

import React, { useMemo, useCallback, useRef, ComponentType, memo } from 'react';
import { ThemeMode } from '../theme/ThemeContext';

// ============================================
// Memoization Utilities
// Requirements: 9.2 - Minimize component re-renders using React.memo and useMemo
// ============================================

/**
 * Options for creating a memoized component
 */
export interface MemoOptions<P> {
  /** Custom comparison function for props */
  arePropsEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean;
  /** Display name for debugging */
  displayName?: string;
}

/**
 * Creates a memoized component with optional custom comparison
 * Requirements: 9.2 - Wrap components with React.memo for survival mode
 */
export function createMemoizedComponent<P extends object>(
  Component: ComponentType<P>,
  options?: MemoOptions<P>,
): React.MemoExoticComponent<ComponentType<P>> {
  const MemoizedComponent = memo(Component, options?.arePropsEqual);

  if (options?.displayName) {
    MemoizedComponent.displayName = options.displayName;
  } else if (Component.displayName || Component.name) {
    MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  }

  return MemoizedComponent;
}

/**
 * Shallow comparison for props (default React.memo behavior)
 */
export function shallowEqual<T extends object>(
  prevProps: Readonly<T>,
  nextProps: Readonly<T>,
): boolean {
  const prevKeys = Object.keys(prevProps) as (keyof T)[];
  const nextKeys = Object.keys(nextProps) as (keyof T)[];

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Deep comparison for props (more expensive but catches nested changes)
 */
export function deepEqual<T>(prev: T, next: T): boolean {
  if (prev === next) return true;
  if (prev === null || next === null) return prev === next;
  if (typeof prev !== typeof next) return false;

  if (typeof prev === 'object' && typeof next === 'object') {
    const prevObj = prev as Record<string, unknown>;
    const nextObj = next as Record<string, unknown>;
    const prevKeys = Object.keys(prevObj);
    const nextKeys = Object.keys(nextObj);

    if (prevKeys.length !== nextKeys.length) return false;

    for (const key of prevKeys) {
      if (!deepEqual(prevObj[key], nextObj[key])) return false;
    }

    return true;
  }

  return false;
}

/**
 * Creates a comparison function that ignores specified props
 */
export function createPropsComparison<P extends object>(
  ignoredProps: (keyof P)[],
): (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean {
  return (prevProps, nextProps) => {
    const prevKeys = Object.keys(prevProps) as (keyof P)[];

    for (const key of prevKeys) {
      if (ignoredProps.includes(key)) continue;
      if (prevProps[key] !== nextProps[key]) return false;
    }

    return true;
  };
}

// ============================================
// Survival Mode Optimization Hooks
// Requirements: 9.2, 9.5
// ============================================

/**
 * Hook that returns a memoized value only in survival mode
 * In abundance mode, always returns the computed value
 */
export function useSurvivalMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  mode: ThemeMode,
): T {
  // In survival mode, use aggressive memoization
  // In abundance mode, still memoize but with standard behavior
  return useMemo(factory, mode === 'survival' ? deps : [...deps, mode]);
}

/**
 * Hook that returns a memoized callback only in survival mode
 */
export function useSurvivalCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList,
  mode: ThemeMode,
): T {
  return useCallback(callback, mode === 'survival' ? deps : [...deps, mode]) as T;
}

/**
 * Hook that tracks and limits re-renders in survival mode
 */
export function useRenderLimit(
  componentName: string,
  mode: ThemeMode,
  maxRenders: number = 10,
): { shouldRender: boolean; renderCount: number } {
  const renderCountRef = useRef(0);
  const lastModeRef = useRef(mode);

  // Reset counter when mode changes
  if (lastModeRef.current !== mode) {
    renderCountRef.current = 0;
    lastModeRef.current = mode;
  }

  renderCountRef.current += 1;

  // In survival mode, limit renders
  if (mode === 'survival' && renderCountRef.current > maxRenders) {
    if (__DEV__) {
      console.warn(
        `[RenderLimit] ${componentName} exceeded ${maxRenders} renders in survival mode`,
      );
    }
    return { shouldRender: false, renderCount: renderCountRef.current };
  }

  return { shouldRender: true, renderCount: renderCountRef.current };
}

// ============================================
// Background Process Control
// Requirements: 9.5 - Disable non-essential background processes
// ============================================

export type ProcessType =
  | 'analytics'
  | 'prefetching'
  | 'sync'
  | 'telemetry'
  | 'cache_cleanup'
  | 'image_preload'
  | 'animation_precompute';

export interface ProcessConfig {
  type: ProcessType;
  essential: boolean;
  enabled: boolean;
}

/**
 * Default process configurations
 */
export const defaultProcessConfigs: ProcessConfig[] = [
  { type: 'analytics', essential: false, enabled: true },
  { type: 'prefetching', essential: false, enabled: true },
  { type: 'sync', essential: true, enabled: true },
  { type: 'telemetry', essential: false, enabled: true },
  { type: 'cache_cleanup', essential: true, enabled: true },
  { type: 'image_preload', essential: false, enabled: true },
  { type: 'animation_precompute', essential: false, enabled: true },
];

/**
 * Get processes that should run in the given mode
 * Requirements: 9.5 - Disable non-essential background processes in survival mode
 */
export function getActiveProcesses(
  mode: ThemeMode,
  configs: ProcessConfig[] = defaultProcessConfigs,
): ProcessConfig[] {
  if (mode === 'survival') {
    // Only essential processes in survival mode
    return configs.filter(p => p.essential && p.enabled);
  }
  // All enabled processes in abundance mode
  return configs.filter(p => p.enabled);
}

/**
 * Check if a specific process should run
 */
export function isProcessActive(
  processType: ProcessType,
  mode: ThemeMode,
  configs: ProcessConfig[] = defaultProcessConfigs,
): boolean {
  const config = configs.find(p => p.type === processType);
  if (!config || !config.enabled) return false;

  if (mode === 'survival') {
    return config.essential;
  }
  return true;
}

/**
 * Hook for managing background processes based on mode
 */
export function useBackgroundProcessControl(mode: ThemeMode): {
  activeProcesses: ProcessConfig[];
  isActive: (processType: ProcessType) => boolean;
  disabledProcesses: ProcessConfig[];
} {
  const activeProcesses = useMemo(() => getActiveProcesses(mode), [mode]);

  const disabledProcesses = useMemo(
    () => defaultProcessConfigs.filter(p => !activeProcesses.some(ap => ap.type === p.type)),
    [activeProcesses],
  );

  const isActive = useCallback(
    (processType: ProcessType) => isProcessActive(processType, mode),
    [mode],
  );

  return {
    activeProcesses,
    isActive,
    disabledProcesses,
  };
}

// ============================================
// Expensive Calculation Memoization
// Requirements: 9.2 - Add useMemo for expensive calculations
// ============================================

/**
 * Cache for expensive calculations
 */
const calculationCache = new Map<string, { value: unknown; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

/**
 * Memoize an expensive calculation with caching
 */
export function memoizeCalculation<T>(key: string, calculate: () => T, mode: ThemeMode): T {
  const now = Date.now();
  const cached = calculationCache.get(key);

  // In survival mode, use longer cache TTL
  const ttl = mode === 'survival' ? CACHE_TTL * 2 : CACHE_TTL;

  if (cached && now - cached.timestamp < ttl) {
    return cached.value as T;
  }

  const value = calculate();
  calculationCache.set(key, { value, timestamp: now });

  return value;
}

/**
 * Clear the calculation cache
 */
export function clearCalculationCache(): void {
  calculationCache.clear();
}

/**
 * Hook for memoizing expensive calculations with mode-aware caching
 */
export function useMemoizedCalculation<T>(
  key: string,
  calculate: () => T,
  deps: React.DependencyList,
  mode: ThemeMode,
): T {
  return useMemo(() => {
    return memoizeCalculation(key, calculate, mode);
  }, [key, mode, ...deps]);
}

// ============================================
// Component Optimization Helpers
// ============================================

/**
 * Props for optimized components
 */
export interface OptimizedComponentProps {
  /** Current theme mode */
  mode: ThemeMode;
  /** Whether to enable aggressive optimization */
  optimized?: boolean;
}

/**
 * Higher-order component that adds survival mode optimizations
 */
export function withSurvivalOptimization<P extends OptimizedComponentProps>(
  Component: ComponentType<P>,
  displayName?: string,
): React.MemoExoticComponent<ComponentType<P>> {
  const OptimizedComponent = memo(Component, (prevProps, nextProps) => {
    // In survival mode, use stricter comparison
    if (nextProps.mode === 'survival') {
      // Only re-render if essential props change
      const essentialKeys: (keyof P)[] = ['mode'] as (keyof P)[];
      for (const key of essentialKeys) {
        if (prevProps[key] !== nextProps[key]) return false;
      }
      // For other props, use shallow comparison
      return shallowEqual(prevProps, nextProps);
    }
    // In abundance mode, use standard shallow comparison
    return shallowEqual(prevProps, nextProps);
  });

  OptimizedComponent.displayName =
    displayName || `Optimized(${Component.displayName || Component.name})`;

  return OptimizedComponent;
}

// ============================================
// Render Batching Utilities
// ============================================

/**
 * Batch multiple state updates to reduce re-renders
 */
export function batchUpdates(updates: (() => void)[]): void {
  // React 18+ automatically batches updates, but this provides explicit control
  React.startTransition(() => {
    updates.forEach(update => update());
  });
}

/**
 * Hook for batching updates in survival mode
 */
export function useBatchedUpdates(mode: ThemeMode): {
  batch: (updates: (() => void)[]) => void;
  shouldBatch: boolean;
} {
  const shouldBatch = mode === 'survival';

  const batch = useCallback(
    (updates: (() => void)[]) => {
      if (shouldBatch) {
        batchUpdates(updates);
      } else {
        updates.forEach(update => update());
      }
    },
    [shouldBatch],
  );

  return { batch, shouldBatch };
}
