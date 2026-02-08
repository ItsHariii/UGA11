/**
 * Presence Manager Implementation
 * Manages heartbeat broadcasting and peer discovery
 */

import { IPresenceManager } from './IPresenceManager';
import { PeerInfo, HeartbeatPayload } from '../types/PeerInfo';
import { Unsubscribe } from '../types/Common';
import { ITransportRouter, TransportMessage } from '../mocks/MockTransportRouter';
import { getUserIdentifier } from '../utils/UserIdentifierGenerator';

/**
 * Presence Manager implementation
 */
export class PresenceManager implements IPresenceManager {
  private peers: Map<string, PeerInfo> = new Map();
  private peerCountHandlers: Set<(count: number) => void> = new Set();
  private broadcasting: boolean = false;
  private heartbeatIntervalId: NodeJS.Timeout | null = null;
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private heartbeatIntervalMs: number = 15000; // 15 seconds default
  private readonly peerTimeoutMs = 30000; // 30 seconds (2 missed intervals)
  private readonly cleanupCheckMs = 15000; // Check every 15 seconds
  
  constructor(private transportRouter: ITransportRouter) {
    this.startCleanupTimer();
    console.log('[PresenceManager] Initialized');
  }
  
  /**
   * Start broadcasting heartbeats
   */
  startBroadcasting(): void {
    if (this.broadcasting) {
      console.log('[PresenceManager] Already broadcasting');
      return;
    }
    
    this.broadcasting = true;
    console.log(`[PresenceManager] Started broadcasting (interval: ${this.heartbeatIntervalMs}ms)`);
    
    // Send immediate heartbeat
    this.sendHeartbeat();
    
    // Set up periodic heartbeats
    this.heartbeatIntervalId = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatIntervalMs);
  }
  
  /**
   * Stop broadcasting heartbeats
   */
  stopBroadcasting(): void {
    if (!this.broadcasting) {
      return;
    }
    
    this.broadcasting = false;
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
    console.log('[PresenceManager] Stopped broadcasting');
  }
  
  /**
   * Get current peer count
   */
  getPeerCount(): number {
    return this.peers.size;
  }
  
  /**
   * Get list of active peers
   */
  getActivePeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }
  
  /**
   * Subscribe to peer count changes
   */
  onPeerCountChange(handler: (count: number) => void): Unsubscribe {
    this.peerCountHandlers.add(handler);
    return () => {
      this.peerCountHandlers.delete(handler);
    };
  }
  
  /**
   * Check if broadcasting is active
   */
  isActive(): boolean {
    return this.broadcasting;
  }
  
  /**
   * Called when a heartbeat is received from a peer
   */
  receivedHeartbeat(endpointId: string, payload: HeartbeatPayload): void {
    const previousCount = this.peers.size;
    const isNewPeer = !this.peers.has(endpointId);
    
    const peerInfo: PeerInfo = {
      endpointId,
      userIdentifier: payload.uid,
      lastSeen: Date.now(),
      signalStrength: undefined,
    };
    
    this.peers.set(endpointId, peerInfo);
    
    if (isNewPeer) {
      console.log(`[PresenceManager] Discovered peer: ${payload.uid} (${endpointId})`);
    }
    
    const currentCount = this.peers.size;
    if (currentCount !== previousCount) {
      this.emitPeerCountChange(currentCount);
    }
  }
  
  /**
   * Set heartbeat interval (for battery optimization)
   */
  setHeartbeatInterval(intervalMs: number): void {
    if (this.heartbeatIntervalMs === intervalMs) {
      return;
    }
    
    console.log(`[PresenceManager] Changing heartbeat interval: ${this.heartbeatIntervalMs}ms -> ${intervalMs}ms`);
    this.heartbeatIntervalMs = intervalMs;
    
    // Restart broadcasting with new interval if currently active
    if (this.broadcasting) {
      this.stopBroadcasting();
      this.startBroadcasting();
    }
  }
  
  /**
   * Send a heartbeat payload
   */
  private sendHeartbeat(): void {
    const payload: HeartbeatPayload = {
      v: 1,
      uid: getUserIdentifier(),
      ts: Date.now(),
      cap: 0,
    };
    
    const message: TransportMessage = {
      type: 'heartbeat',
      payload,
    };
    
    this.transportRouter.send(message).catch(error => {
      console.error('[PresenceManager] Failed to send heartbeat:', error);
    });
  }
  
  /**
   * Remove peers that haven't sent heartbeat within timeout period
   */
  private removeStalePeers(): void {
    const now = Date.now();
    const previousCount = this.peers.size;
    const staleEndpoints: string[] = [];
    
    for (const [endpointId, peer] of this.peers.entries()) {
      const timeSinceLastSeen = now - peer.lastSeen;
      if (timeSinceLastSeen > this.peerTimeoutMs) {
        staleEndpoints.push(endpointId);
        console.log(`[PresenceManager] Peer timeout: ${peer.userIdentifier} (${endpointId}), last seen ${Math.floor(timeSinceLastSeen / 1000)}s ago`);
      }
    }
    
    // Remove stale peers
    for (const endpointId of staleEndpoints) {
      this.peers.delete(endpointId);
    }
    
    const currentCount = this.peers.size;
    if (currentCount !== previousCount) {
      this.emitPeerCountChange(currentCount);
    }
  }
  
  /**
   * Start the cleanup timer for stale peers
   */
  private startCleanupTimer(): void {
    this.cleanupIntervalId = setInterval(() => {
      this.removeStalePeers();
    }, this.cleanupCheckMs);
  }
  
  /**
   * Emit peer count change event
   */
  private emitPeerCountChange(count: number): void {
    console.log(`[PresenceManager] Peer count changed: ${count}`);
    this.peerCountHandlers.forEach(handler => {
      try {
        handler(count);
      } catch (error) {
        console.error('[PresenceManager] Error in peer count handler:', error);
      }
    });
  }
  
  /**
   * Dispose of the manager and cleanup resources
   */
  dispose(): void {
    this.stopBroadcasting();
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    this.peers.clear();
    this.peerCountHandlers.clear();
    console.log('[PresenceManager] Disposed');
  }
}
