/**
 * Mode Switching Service
 * 
 * Manages transitions between Abundance Mode (online) and Survival Mode (offline).
 * Handles connectivity detection, theme switching, navigation changes, and data synchronization.
 * 
 * Requirements: Mode Switching Behavior
 */

import { gossipService } from './gossip.service';
import { bluetoothService } from './bluetooth.service';
import { batteryService } from './battery.service';

export type AppMode = 'abundance' | 'survival';
export type NavigationMode = 'abundance' | 'survival'; // 5-tab vs 2-tab

export interface ModeSwitchingConfig {
  onModeChange?: (mode: AppMode) => void;
  onNavigationChange?: (navMode: NavigationMode) => void;
  onSyncProgress?: (progress: number, message: string) => void;
  onBannerShow?: (message: string, type: 'info' | 'success' | 'warning') => void;
}

export interface ConnectivityStatus {
  isOnline: boolean;
  lastChecked: number;
  checkInterval: number;
}

class ModeSwitchingService {
  private currentMode: AppMode = 'abundance';
  private connectivityStatus: ConnectivityStatus = {
    isOnline: true,
    lastChecked: Date.now(),
    checkInterval: 10000, // 10 seconds
  };
  private checkInterval: NodeJS.Timeout | null = null;
  private callbacks: ModeSwitchingConfig = {};
  private isSwitching: boolean = false;

  /**
   * Initialize mode switching service
   */
  initialize(config: ModeSwitchingConfig) {
    this.callbacks = config;
    console.log('[Mode Switching] Service initialized');
    
    // Start connectivity monitoring
    this.startConnectivityMonitoring();
  }

  /**
   * Start monitoring internet connectivity
   * Requirements: 10.1
   */
  private startConnectivityMonitoring() {
    console.log('[Mode Switching] Starting connectivity monitoring');
    
    // Check immediately
    this.checkConnectivity();
    
    // Check every 10 seconds
    this.checkInterval = setInterval(() => {
      this.checkConnectivity();
    }, this.connectivityStatus.checkInterval);
  }

  /**
   * Stop connectivity monitoring
   */
  private stopConnectivityMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check internet connectivity
   * Requirements: 10.1
   */
  private async checkConnectivity() {
    const isOnline = await this.checkInternetConnectivity();
    const wasOnline = this.connectivityStatus.isOnline;
    
    this.connectivityStatus.isOnline = isOnline;
    this.connectivityStatus.lastChecked = Date.now();

    // Detect transitions
    if (wasOnline && !isOnline) {
      // Online → Offline
      console.log('[Mode Switching] Connectivity lost, entering survival mode');
      await this.enterSurvivalMode();
    } else if (!wasOnline && isOnline) {
      // Offline → Online
      console.log('[Mode Switching] Connectivity restored, exiting survival mode');
      await this.exitSurvivalMode();
    }
  }

  /**
   * Check if internet is available (stub implementation)
   * Requirements: 10.1
   */
  private async checkInternetConnectivity(): Promise<boolean> {
    // Stub: In production, use:
    // - @react-native-community/netinfo
    // - fetch() to a reliable endpoint
    // - Native connectivity APIs
    
    try {
      // Simulate connectivity check
      // In production: const state = await NetInfo.fetch();
      // return state.isConnected && state.isInternetReachable;
      
      return true; // Mock: always online for development
    } catch (error) {
      console.error('[Mode Switching] Connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Enter Survival Mode (Online → Offline)
   * Requirements: 10.2
   */
  async enterSurvivalMode() {
    if (this.isSwitching || this.currentMode === 'survival') {
      return;
    }

    this.isSwitching = true;
    console.log('[Mode Switching] Entering survival mode...');

    try {
      // 1. Detect connectivity loss (already done)
      
      // 2. Switch theme to survival
      console.log('[Mode Switching] Switching to survival theme');
      // In production: setThemeMode('survival');
      
      // 3. Simplify UI to 2 tabs
      console.log('[Mode Switching] Switching to 2-tab navigation');
      if (this.callbacks.onNavigationChange) {
        this.callbacks.onNavigationChange('survival');
      }
      
      // 4. Enable Bluetooth mesh
      console.log('[Mode Switching] Enabling Bluetooth mesh');
      await this.startBluetoothMesh();
      
      // 5. Show survival mode banner
      if (this.callbacks.onBannerShow) {
        this.callbacks.onBannerShow(
          'Survival Mode Active - Mesh Networking Enabled',
          'info'
        );
      }
      
      // 6. Sync local data to mesh
      console.log('[Mode Switching] Broadcasting local posts to mesh');
      await this.broadcastLocalPosts();
      
      // Update mode
      this.currentMode = 'survival';
      if (this.callbacks.onModeChange) {
        this.callbacks.onModeChange('survival');
      }
      
      console.log('[Mode Switching] Survival mode activated');
    } catch (error) {
      console.error('[Mode Switching] Failed to enter survival mode:', error);
      if (this.callbacks.onBannerShow) {
        this.callbacks.onBannerShow(
          'Failed to enter survival mode',
          'warning'
        );
      }
    } finally {
      this.isSwitching = false;
    }
  }

  /**
   * Exit Survival Mode (Offline → Online)
   * Requirements: 10.3
   */
  async exitSurvivalMode() {
    if (this.isSwitching || this.currentMode === 'abundance') {
      return;
    }

    this.isSwitching = true;
    console.log('[Mode Switching] Exiting survival mode...');

    try {
      // 1. Detect connectivity restored (already done)
      
      // 2. Sync mesh data to cloud
      console.log('[Mode Switching] Syncing mesh data to cloud');
      await this.syncMeshDataToSupabase();
      
      // 3. Switch theme to abundance
      console.log('[Mode Switching] Switching to abundance theme');
      // In production: setThemeMode('abundance');
      
      // 4. Restore full UI (5 tabs)
      console.log('[Mode Switching] Switching to 5-tab navigation');
      if (this.callbacks.onNavigationChange) {
        this.callbacks.onNavigationChange('abundance');
      }
      
      // 5. Disable Bluetooth mesh (optional - keep running in background)
      console.log('[Mode Switching] Keeping Bluetooth mesh active in background');
      // await this.stopBluetoothMesh();
      
      // 6. Show sync progress
      if (this.callbacks.onBannerShow) {
        this.callbacks.onBannerShow(
          'Back online - Data synced successfully',
          'success'
        );
      }
      
      // Update mode
      this.currentMode = 'abundance';
      if (this.callbacks.onModeChange) {
        this.callbacks.onModeChange('abundance');
      }
      
      console.log('[Mode Switching] Abundance mode activated');
    } catch (error) {
      console.error('[Mode Switching] Failed to exit survival mode:', error);
      if (this.callbacks.onBannerShow) {
        this.callbacks.onBannerShow(
          'Failed to sync data - Will retry',
          'warning'
        );
      }
    } finally {
      this.isSwitching = false;
    }
  }

  /**
   * Start Bluetooth mesh networking
   */
  private async startBluetoothMesh(): Promise<void> {
    try {
      // Initialize Bluetooth service
      await bluetoothService.initialize({
        onPeerDiscovered: (peer) => {
          console.log(`[Mode Switching] Peer discovered: ${peer.name}`);
        },
        onPeerConnected: (peer) => {
          console.log(`[Mode Switching] Peer connected: ${peer.name}`);
          // Re-broadcast posts to new peer
          gossipService.broadcastLocalPosts();
        },
        onPeerDisconnected: (peerId) => {
          console.log(`[Mode Switching] Peer disconnected: ${peerId}`);
        },
        onMessageReceived: (message, fromPeerId) => {
          // Handle received gossip messages
          gossipService.receiveMessage(message, fromPeerId);
        },
      });

      // Start scanning for peers
      await bluetoothService.startScanning();
      
      console.log('[Mode Switching] Bluetooth mesh started');
    } catch (error) {
      console.error('[Mode Switching] Failed to start Bluetooth mesh:', error);
      throw error;
    }
  }

  /**
   * Stop Bluetooth mesh networking
   */
  private async stopBluetoothMesh(): Promise<void> {
    try {
      bluetoothService.stopScanning();
      await bluetoothService.shutdown();
      console.log('[Mode Switching] Bluetooth mesh stopped');
    } catch (error) {
      console.error('[Mode Switching] Failed to stop Bluetooth mesh:', error);
    }
  }

  /**
   * Broadcast local posts to mesh
   */
  private async broadcastLocalPosts(): Promise<void> {
    try {
      gossipService.broadcastLocalPosts();
      console.log('[Mode Switching] Local posts broadcast to mesh');
    } catch (error) {
      console.error('[Mode Switching] Failed to broadcast posts:', error);
    }
  }

  /**
   * Sync mesh data to Supabase
   */
  private async syncMeshDataToSupabase(): Promise<void> {
    try {
      const localPosts = gossipService.getLocalPosts();
      
      if (localPosts.length === 0) {
        console.log('[Mode Switching] No mesh data to sync');
        return;
      }

      console.log(`[Mode Switching] Syncing ${localPosts.length} posts to cloud`);
      
      // Show progress
      if (this.callbacks.onSyncProgress) {
        this.callbacks.onSyncProgress(0, 'Starting sync...');
      }

      // Stub: In production, sync to Supabase
      // for (let i = 0; i < localPosts.length; i++) {
      //   const post = localPosts[i];
      //   await supabase.from('posts').upsert(convertToSupabasePost(post));
      //   
      //   const progress = ((i + 1) / localPosts.length) * 100;
      //   if (this.callbacks.onSyncProgress) {
      //     this.callbacks.onSyncProgress(progress, `Syncing ${i + 1}/${localPosts.length}`);
      //   }
      // }

      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.callbacks.onSyncProgress) {
        this.callbacks.onSyncProgress(100, 'Sync complete');
      }

      console.log('[Mode Switching] Mesh data synced to cloud');
    } catch (error) {
      console.error('[Mode Switching] Failed to sync mesh data:', error);
      throw error;
    }
  }

  /**
   * Manually trigger mode switch (for testing)
   */
  async switchMode(mode: AppMode) {
    if (mode === 'survival') {
      await this.enterSurvivalMode();
    } else {
      await this.exitSurvivalMode();
    }
  }

  /**
   * Get current mode
   */
  getCurrentMode(): AppMode {
    return this.currentMode;
  }

  /**
   * Get connectivity status
   */
  getConnectivityStatus(): ConnectivityStatus {
    return { ...this.connectivityStatus };
  }

  /**
   * Check if currently switching modes
   */
  isSwitchingMode(): boolean {
    return this.isSwitching;
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    console.log('[Mode Switching] Shutting down...');
    this.stopConnectivityMonitoring();
    await this.stopBluetoothMesh();
  }
}

// Export singleton instance
export const modeSwitchingService = new ModeSwitchingService();
