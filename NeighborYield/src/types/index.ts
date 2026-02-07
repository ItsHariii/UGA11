/**
 * Type definitions for NeighborYield
 * Central location for all TypeScript interfaces and types
 */

// ============================================
// Connectivity Types
// ============================================

export type ConnectivityMode = 'online' | 'offline' | 'hybrid' | 'disconnected';

// ============================================
// Risk and TTL Types
// ============================================

export type RiskTier = 'high' | 'medium' | 'low';

export const TTL_VALUES: Record<RiskTier, number> = {
  high: 15 * 60 * 1000, // 15 minutes
  medium: 30 * 60 * 1000, // 30 minutes
  low: 60 * 60 * 1000, // 60 minutes
};

// ============================================
// Share Post Types
// ============================================

export interface SharePost {
  id: string;
  authorId: string;
  authorIdentifier: string;
  title: string;
  description: string;
  riskTier: RiskTier;
  createdAt: number;
  expiresAt: number;
  source: 'local' | 'supabase';
  location?: {
    latitude: number;
    longitude: number;
  };
}

// ============================================
// Interest Types
// ============================================

export type InterestStatus = 'pending' | 'accepted' | 'declined';

export interface InterestAck {
  id: string;
  postId: string;
  interestedUserId: string;
  interestedUserIdentifier: string;
  timestamp: number;
  source: 'local' | 'supabase';
  status: InterestStatus;
}

export interface InterestResponse {
  interestId: string;
  postId: string;
  responderId: string;
  response: 'accepted' | 'declined';
  message?: string;
  timestamp: number;
}

export type InterestError = 'poster_unreachable' | 'post_expired' | 'already_claimed';

export interface InterestResult {
  success: boolean;
  interestId?: string;
  error?: InterestError;
}

// ============================================
// Peer and Presence Types
// ============================================

export interface PeerInfo {
  endpointId: string;
  userIdentifier: string;
  lastSeen: number;
  signalStrength?: number;
}

export interface HeartbeatPayload {
  v: number;
  uid: string;
  ts: number;
  cap: number;
}

// ============================================
// Permission Types
// ============================================

export type MeshPermission = 'bluetooth' | 'location' | 'nearby_devices';

export type PermissionState = 'granted' | 'denied' | 'never_ask_again' | 'unavailable';

export interface PermissionStatus {
  bluetooth: PermissionState;
  location: PermissionState;
  nearbyDevices: PermissionState;
  canUseMesh: boolean;
}

export interface PermissionResult {
  granted: boolean;
  state: PermissionState;
}

// ============================================
// Battery Types
// ============================================

export type NearbyState = 'active' | 'suspended' | 'disabled';

export interface BatteryConfig {
  foregroundHeartbeatInterval: number;
  backgroundHeartbeatInterval: number;
  lowBatteryThreshold: number;
}

// ============================================
// Transport Types
// ============================================

export type MessageType =
  | 'share_post'
  | 'interest_ack'
  | 'interest_response'
  | 'heartbeat'
  | 'peer_discovery';

export interface TransportMessage {
  type: MessageType;
  payload: unknown;
  targetEndpoint?: string;
  ttl?: number;
}

export interface SendResult {
  success: boolean;
  error?: string;
}

// ============================================
// Local State Types
// ============================================

export interface LocalState {
  posts: Map<string, SharePost>;
  interestsByPost: Map<string, InterestAck[]>;
  myInterests: Map<string, InterestAck>;
  peers: Map<string, PeerInfo>;
  permissions: PermissionStatus;
  connectivityMode: ConnectivityMode;
  userIdentifier: string;
  userId: string;
}
