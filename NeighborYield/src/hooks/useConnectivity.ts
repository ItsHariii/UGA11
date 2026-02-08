/**
 * useConnectivity Hook
 * Provides access to connectivity mode and related state from AppContext.
 *
 * Requirements: All UI requirements related to connectivity
 */

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../context';
import { ConnectivityMode } from '../types';

export interface UseConnectivityResult {
  /** Current connectivity mode */
  mode: ConnectivityMode;

  /** Whether the app is online (has internet) */
  isOnline: boolean;

  /** Whether the app can use mesh networking */
  canUseMesh: boolean;

  /** Set the connectivity mode */
  setMode: (mode: ConnectivityMode) => void;
}

/**
 * Hook for accessing connectivity state and actions
 */
export function useConnectivity(): UseConnectivityResult {
  const { state, setConnectivityMode } = useAppContext();

  const isOnline = useMemo(
    () => state.connectivityMode === 'online',
    [state.connectivityMode],
  );

  const canUseMesh = useMemo(
    () => state.connectivityMode === 'offline',
    [state.connectivityMode],
  );

  const setMode = useCallback(
    (mode: ConnectivityMode) => {
      setConnectivityMode(mode);
    },
    [setConnectivityMode],
  );

  return {
    mode: state.connectivityMode,
    isOnline,
    canUseMesh,
    setMode,
  };
}

export default useConnectivity;
