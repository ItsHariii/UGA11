/**
 * Common types shared across the NeighborYield application
 */

/**
 * Risk tier classification for food items by perishability
 */
export type RiskTier = 'high' | 'medium' | 'low';

/**
 * Android permission states
 */
export type PermissionState = 'granted' | 'denied' | 'never_ask_again' | 'unavailable';

/**
 * Types of mesh-related permissions
 */
export type MeshPermission = 'bluetooth' | 'location' | 'nearby_devices';

/**
 * Network connectivity modes
 */
export type ConnectivityMode = 'online' | 'offline' | 'hybrid' | 'disconnected';

/**
 * Nearby Connections state
 */
export type NearbyState = 'active' | 'suspended' | 'disabled';

/**
 * Message types for transport layer
 */
export type MessageType = 
  | 'share_post'
  | 'interest_ack'
  | 'interest_response'
  | 'heartbeat'
  | 'peer_discovery';

/**
 * Function to unsubscribe from an event listener
 */
export type Unsubscribe = () => void;

/**
 * Status of an interest acknowledgment
 */
export type InterestStatus = 'pending' | 'accepted' | 'declined';

/**
 * Response type from poster to interested user
 */
export type ResponseType = 'accept' | 'decline';

/**
 * Interest error types
 */
export type InterestError = 'poster_unreachable' | 'post_expired' | 'already_claimed';
