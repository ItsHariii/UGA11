/**
 * Presence Manager Interface
 * Manages heartbeat broadcasting and peer discovery
 */

import { PeerInfo, HeartbeatPayload } from '../types/PeerInfo';
import { Unsubscribe } from '../types/Common';

export interface IPresenceManager {
  /**
   * Start broadcasting presence heartbeats
   */
  startBroadcasting(): void;
  
  /**
   * Stop broadcasting presence heartbeats
   */
  stopBroadcasting(): void;
  
  /**
   * Get current count of active peers
   */
  getPeerCount(): number;
  
  /**
   * Get list of all active peers
   */
  getActivePeers(): PeerInfo[];
  
  /**
   * Subscribe to peer count changes
   */
  onPeerCountChange(handler: (count: number) => void): Unsubscribe;
  
  /**
   * Check if presence broadcasting is active
   */
  isActive(): boolean;
  
  /**
   * Called when a heartbeat is received from a peer
   * @internal Used by transport layer
   */
  receivedHeartbeat(endpointId: string, payload: HeartbeatPayload): void;
  
  /**
   * Set heartbeat interval (for battery optimization)
   * @internal Used by battery manager
   */
  setHeartbeatInterval(intervalMs: number): void;
}
