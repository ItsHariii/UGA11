/**
 * Transport Router Interface
 * Defines the contract for all transport implementations (Supabase, Bluetooth, etc.)
 * 
 * This abstraction enables:
 * - Online mode via Supabase
 * - Offline mode via Bluetooth/Nearby (future)
 * - Hybrid mode switching between transports
 */

import { SharePost, InterestAck, InterestResponse, HeartbeatPayload } from '../types';

/**
 * Function to unsubscribe from an event listener
 */
export type Unsubscribe = () => void;

/**
 * Transport Router Interface
 * All transport implementations must implement this interface
 */
export interface ITransportRouter {
  // ============================================
  // Send Operations
  // ============================================
  
  /**
   * Send a share post to the network
   * @param post The post to send
   * @throws TransportError if send fails
   */
  sendPost(post: SharePost): Promise<void>;
  
  /**
   * Send an interest acknowledgment
   * @param interest The interest to send
   * @throws TransportError if send fails
   */
  sendInterest(interest: InterestAck): Promise<void>;
  
  /**
   * Send a response to an interest
   * @param response The response to send
   * @throws TransportError if send fails
   */
  sendResponse(response: InterestResponse): Promise<void>;
  
  /**
   * Send a heartbeat/presence announcement
   * @param payload The heartbeat payload
   * @throws TransportError if send fails
   */
  sendHeartbeat(payload: HeartbeatPayload): Promise<void>;
  
  // ============================================
  // Fetch Operations
  // ============================================
  
  /**
   * Fetch all available posts from the network
   * @returns Array of posts
   * @throws TransportError if fetch fails
   */
  fetchPosts(): Promise<SharePost[]>;
  
  // ============================================
  // Subscription Operations
  // ============================================
  
  /**
   * Subscribe to new posts
   * @param handler Callback when a new post is received
   * @returns Unsubscribe function
   */
  onPostReceived(handler: (post: SharePost) => void): Unsubscribe;
  
  /**
   * Subscribe to interest acknowledgments
   * @param handler Callback when an interest is received
   * @returns Unsubscribe function
   */
  onInterestReceived(handler: (interest: InterestAck) => void): Unsubscribe;
  
  /**
   * Subscribe to interest responses
   * @param handler Callback when a response is received
   * @returns Unsubscribe function
   */
  onResponseReceived(handler: (response: InterestResponse) => void): Unsubscribe;
  
  /**
   * Subscribe to heartbeats
   * @param handler Callback when a heartbeat is received
   * @returns Unsubscribe function
   */
  onHeartbeatReceived(handler: (payload: HeartbeatPayload) => void): Unsubscribe;
}

/**
 * Transport Error
 * Thrown when transport operations fail
 */
export class TransportError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any,
    public readonly operation?: string
  ) {
    super(message);
    this.name = 'TransportError';
  }
}
