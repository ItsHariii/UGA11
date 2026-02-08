/**
 * Bluetooth Service (Stub Implementation)
 * 
 * Manages Bluetooth Low Energy (BLE) mesh networking for survival mode.
 * This is a stub implementation for development. In production, integrate with:
 * - react-native-ble-plx (recommended)
 * - react-native-ble-manager
 * - Custom native modules
 * 
 * Requirements: Bluetooth Constraints
 */

import { GossipMessage } from './gossip.service';

export interface BluetoothConfig {
  discoveryInterval: number;  // milliseconds
  maxConnections: number;     // max concurrent connections
  messageSize: number;        // max message size in bytes
}

export interface BluetoothPeer {
  id: string;
  name: string;
  rssi: number;              // signal strength
  isConnected: boolean;
  lastSeen: number;
}

export const DEFAULT_BLUETOOTH_CONFIG: BluetoothConfig = {
  discoveryInterval: 15000,  // 15 seconds
  maxConnections: 8,         // max 8 peers
  messageSize: 512,          // 512 bytes max
};

class BluetoothService {
  private config: BluetoothConfig = DEFAULT_BLUETOOTH_CONFIG;
  private peers: Map<string, BluetoothPeer> = new Map();
  private isScanning: boolean = false;
  private scanInterval: NodeJS.Timeout | null = null;
  private callbacks: {
    onPeerDiscovered?: (peer: BluetoothPeer) => void;
    onPeerConnected?: (peer: BluetoothPeer) => void;
    onPeerDisconnected?: (peerId: string) => void;
    onMessageReceived?: (message: GossipMessage, fromPeerId: string) => void;
  } = {};

  /**
   * Initialize Bluetooth service
   */
  async initialize(callbacks: typeof this.callbacks): Promise<boolean> {
    this.callbacks = callbacks;
    
    console.log('[Bluetooth] Initializing service...');
    
    // Stub: In production, initialize BLE manager
    // const manager = new BleManager();
    // await manager.start();
    
    console.log('[Bluetooth] Service initialized (stub)');
    return true;
  }

  /**
   * Start scanning for nearby peers
   */
  async startScanning(): Promise<void> {
    if (this.isScanning) {
      console.log('[Bluetooth] Already scanning');
      return;
    }

    this.isScanning = true;
    console.log(`[Bluetooth] Starting scan (interval: ${this.config.discoveryInterval}ms)`);

    // Stub: In production, start BLE scanning
    // manager.startDeviceScan(null, null, (error, device) => {
    //   if (error) {
    //     console.error('[Bluetooth] Scan error:', error);
    //     return;
    //   }
    //   this.handlePeerDiscovered(device);
    // });

    // Simulate periodic scanning
    this.scanInterval = setInterval(() => {
      this.simulatePeerDiscovery();
    }, this.config.discoveryInterval);
  }

  /**
   * Stop scanning for peers
   */
  stopScanning(): void {
    if (!this.isScanning) return;

    this.isScanning = false;
    console.log('[Bluetooth] Stopping scan');

    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }

    // Stub: In production, stop BLE scanning
    // manager.stopDeviceScan();
  }

  /**
   * Set discovery interval (battery-aware)
   */
  setDiscoveryInterval(interval: number): void {
    this.config.discoveryInterval = interval;
    console.log(`[Bluetooth] Discovery interval set to ${interval}ms`);

    // Restart scanning with new interval
    if (this.isScanning) {
      this.stopScanning();
      this.startScanning();
    }
  }

  /**
   * Connect to a peer
   */
  async connectToPeer(peerId: string): Promise<boolean> {
    console.log(`[Bluetooth] Connecting to peer ${peerId}...`);

    // Stub: In production, connect to BLE device
    // const device = await manager.connectToDevice(peerId);
    // await device.discoverAllServicesAndCharacteristics();

    const peer = this.peers.get(peerId);
    if (peer) {
      peer.isConnected = true;
      this.peers.set(peerId, peer);

      if (this.callbacks.onPeerConnected) {
        this.callbacks.onPeerConnected(peer);
      }

      console.log(`[Bluetooth] Connected to peer ${peerId}`);
      return true;
    }

    return false;
  }

  /**
   * Disconnect from a peer
   */
  async disconnectFromPeer(peerId: string): Promise<void> {
    console.log(`[Bluetooth] Disconnecting from peer ${peerId}...`);

    // Stub: In production, disconnect from BLE device
    // await manager.cancelDeviceConnection(peerId);

    const peer = this.peers.get(peerId);
    if (peer) {
      peer.isConnected = false;
      this.peers.set(peerId, peer);

      if (this.callbacks.onPeerDisconnected) {
        this.callbacks.onPeerDisconnected(peerId);
      }
    }
  }

  /**
   * Send message to a peer
   */
  async sendMessage(peerId: string, message: GossipMessage): Promise<boolean> {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.isConnected) {
      console.error(`[Bluetooth] Cannot send to disconnected peer ${peerId}`);
      return false;
    }

    // Serialize and compress message
    const payload = JSON.stringify(message);
    
    // Check size limit
    if (payload.length > this.config.messageSize) {
      console.error(`[Bluetooth] Message size ${payload.length} exceeds limit ${this.config.messageSize}`);
      return false;
    }

    console.log(`[Bluetooth] Sending message to ${peerId} (${payload.length} bytes)`);

    // Stub: In production, write to BLE characteristic
    // await device.writeCharacteristicWithResponseForService(
    //   SERVICE_UUID,
    //   CHARACTERISTIC_UUID,
    //   base64Encode(payload)
    // );

    return true;
  }

  /**
   * Broadcast message to all connected peers
   */
  async broadcastMessage(message: GossipMessage): Promise<number> {
    const connectedPeers = Array.from(this.peers.values()).filter(p => p.isConnected);
    
    console.log(`[Bluetooth] Broadcasting to ${connectedPeers.length} peers`);

    let successCount = 0;
    for (const peer of connectedPeers) {
      const success = await this.sendMessage(peer.id, message);
      if (success) successCount++;
    }

    return successCount;
  }

  /**
   * Get connected peers
   */
  getConnectedPeers(): BluetoothPeer[] {
    return Array.from(this.peers.values()).filter(p => p.isConnected);
  }

  /**
   * Get all discovered peers
   */
  getAllPeers(): BluetoothPeer[] {
    return Array.from(this.peers.values());
  }

  /**
   * Get peer count
   */
  getPeerCount(): number {
    return this.getConnectedPeers().length;
  }

  /**
   * Simulate peer discovery (for development)
   */
  private simulatePeerDiscovery(): void {
    // Simulate discovering 1-3 peers
    const peerCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < peerCount; i++) {
      const peerId = `peer-${Math.random().toString(36).substr(2, 9)}`;
      
      if (!this.peers.has(peerId)) {
        const peer: BluetoothPeer = {
          id: peerId,
          name: `Neighbor ${this.peers.size + 1}`,
          rssi: -50 - Math.floor(Math.random() * 50), // -50 to -100
          isConnected: false,
          lastSeen: Date.now(),
        };

        this.peers.set(peerId, peer);

        if (this.callbacks.onPeerDiscovered) {
          this.callbacks.onPeerDiscovered(peer);
        }

        console.log(`[Bluetooth] Discovered peer: ${peer.name} (${peerId})`);
      }
    }
  }

  /**
   * Simulate receiving a message (for development)
   */
  simulateMessageReceived(message: GossipMessage, fromPeerId: string): void {
    if (this.callbacks.onMessageReceived) {
      this.callbacks.onMessageReceived(message, fromPeerId);
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isScanning: this.isScanning,
      discoveryInterval: this.config.discoveryInterval,
      peerCount: this.getPeerCount(),
      totalPeers: this.peers.size,
      maxConnections: this.config.maxConnections,
      messageSize: this.config.messageSize,
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    console.log('[Bluetooth] Shutting down...');
    
    this.stopScanning();
    
    // Disconnect all peers
    const connectedPeers = this.getConnectedPeers();
    for (const peer of connectedPeers) {
      await this.disconnectFromPeer(peer.id);
    }

    this.peers.clear();
    
    // Stub: In production, destroy BLE manager
    // await manager.destroy();
    
    console.log('[Bluetooth] Shutdown complete');
  }
}

// Export singleton instance
export const bluetoothService = new BluetoothService();
