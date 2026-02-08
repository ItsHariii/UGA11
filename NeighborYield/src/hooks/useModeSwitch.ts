/**
 * Mode Switching Hook
 * 
 * React hook for managing mode transitions between Abundance and Survival modes.
 * Provides mode state, switching functions, and transition status.
 * 
 * Requirements: Mode Switching Behavior
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  modeSwitchingService, 
  AppMode, 
  NavigationMode,
  ConnectivityStatus 
} from '../services/mode-switching.service';

export interface UseModeSwitch {
  // Current state
  currentMode: AppMode;
  navigationMode: NavigationMode;
  connectivityStatus: ConnectivityStatus;
  isSwitching: boolean;
  
  // Sync progress
  syncProgress: number;
  syncMessage: string;
  
  // Banner state
  bannerVisible: boolean;
  bannerMessage: string;
  bannerType: 'info' | 'success' | 'warning';
  
  // Actions
  switchMode: (mode: AppMode) => Promise<void>;
  dismissBanner: () => void;
}

/**
 * Hook to manage mode switching
 */
export function useModeSwitch(): UseModeSwitch {
  const [currentMode, setCurrentMode] = useState<AppMode>('abundance');
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('abundance');
  const [isSwitching, setIsSwitching] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState<'info' | 'success' | 'warning'>('info');
  const [connectivityStatus, setConnectivityStatus] = useState<ConnectivityStatus>(
    modeSwitchingService.getConnectivityStatus()
  );

  useEffect(() => {
    // Initialize mode switching service
    modeSwitchingService.initialize({
      onModeChange: (mode) => {
        setCurrentMode(mode);
        setIsSwitching(false);
      },
      onNavigationChange: (navMode) => {
        setNavigationMode(navMode);
      },
      onSyncProgress: (progress, message) => {
        setSyncProgress(progress);
        setSyncMessage(message);
      },
      onBannerShow: (message, type) => {
        setBannerMessage(message);
        setBannerType(type);
        setBannerVisible(true);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setBannerVisible(false);
        }, 5000);
      },
    });

    // Update connectivity status periodically
    const interval = setInterval(() => {
      setConnectivityStatus(modeSwitchingService.getConnectivityStatus());
      setIsSwitching(modeSwitchingService.isSwitchingMode());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const switchMode = useCallback(async (mode: AppMode) => {
    setIsSwitching(true);
    await modeSwitchingService.switchMode(mode);
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
  }, []);

  return {
    currentMode,
    navigationMode,
    connectivityStatus,
    isSwitching,
    syncProgress,
    syncMessage,
    bannerVisible,
    bannerMessage,
    bannerType,
    switchMode,
    dismissBanner,
  };
}

/**
 * Hook to get current mode only (lightweight)
 */
export function useCurrentMode(): AppMode {
  const [mode, setMode] = useState<AppMode>(modeSwitchingService.getCurrentMode());

  useEffect(() => {
    const interval = setInterval(() => {
      setMode(modeSwitchingService.getCurrentMode());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return mode;
}

/**
 * Hook to check if in survival mode
 */
export function useIsSurvivalMode(): boolean {
  const mode = useCurrentMode();
  return mode === 'survival';
}
