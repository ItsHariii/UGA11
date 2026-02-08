/**
 * Transport layer type definitions.
 * Re-exports from app types and adds transport-specific interfaces.
 */

export type {
  ConnectivityMode,
  TransportMessage,
  MessageType,
  SendResult,
  SharePost,
  InterestAck,
  InterestResponse,
  HeartbeatPayload,
  PeerInfo,
} from '../types';

/** Handler for incoming messages from any transport */
export type MessageHandler = (message: { type: string; payload: unknown; source: 'supabase' | 'nearby' }) => void;

/** Unsubscribe function */
export type Unsubscribe = () => void;

/** Discovered endpoint from Nearby Connections */
export interface DiscoveredEndpoint {
  endpointId: string;
  serviceId: string;
  endpointName: string;
}

/** Connection lifecycle info when a connection is initiated */
export interface ConnectionInfo {
  endpointName: string;
  authenticationToken?: string;
}

/** Result of accepting or rejecting a connection */
export type ConnectionResult = 'success' | 'failure';

/** Message chunk for splitting large messages */
export interface MessageChunk {
  messageId: string;
  chunkIndex: number;
  totalChunks: number;
  data: string;
  checksum?: string;
}

/** Serialized heartbeat wrapper */
export interface SerializedHeartbeat {
  [key: string]: HeartbeatPayload;
}
