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
} from '../../src/types';

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
