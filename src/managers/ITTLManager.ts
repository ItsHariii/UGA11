/**
 * TTL Manager Interface
 * Handles post expiration and cleanup
 */

import { SharePost } from '../types/SharePost';
import { RiskTier, Unsubscribe } from '../types/Common';

export interface ITTLManager {
  /**
   * Register a post for TTL tracking
   */
  trackPost(post: SharePost): void;
  
  /**
   * Remove a post from tracking
   */
  untrackPost(postId: string): void;
  
  /**
   * Get remaining TTL for a post in milliseconds
   * @returns Remaining TTL in ms, or null if post not found
   */
  getRemainingTTL(postId: string): number | null;
  
  /**
   * Check if post is expired
   */
  isExpired(postId: string): boolean;
  
  /**
   * Purge all expired posts
   * @returns Array of purged post IDs
   */
  purgeExpired(): string[];
  
  /**
   * Subscribe to expiration events
   */
  onPostExpired(handler: (postId: string) => void): Unsubscribe;
  
  /**
   * Get TTL duration for a risk tier in milliseconds
   */
  getTTLForRisk(tier: RiskTier): number;
}
