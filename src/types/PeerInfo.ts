/**
 * Peer Info data model
 * Represents information about a nearby peer in the mesh network
 */

export interface PeerInfo {
  /** Unique endpoint identifier from Nearby Connections */
  endpointId: string;
  
  /** Pseudonymous user identifier (e.g., "Neighbor-C3F1") */
  userIdentifier: string;
  
  /** Timestamp of last heartbeat received (Unix epoch ms) */
  lastSeen: number;
  
  /** Signal strength indicator (optional) */
  signalStrength?: number;
}

/**
 * Heartbeat payload structure (kept minimal <1KB)
 */
export interface HeartbeatPayload {
  /** Protocol version */
  v: number;
  
  /** User identifier */
  uid: string;
  
  /** Timestamp (Unix epoch ms) */
  ts: number;
  
  /** Capabilities bitmask */
  cap: number;
}
