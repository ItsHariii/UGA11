/**
 * TTL Manager Implementation
 * Handles post expiration tracking and automatic cleanup
 */

import { ITTLManager } from './ITTLManager';
import { SharePost } from '../types/SharePost';
import { RiskTier, Unsubscribe } from '../types/Common';

/**
 * TTL values for each risk tier in milliseconds
 */
const TTL_VALUES: Record<RiskTier, number> = {
  high: 15 * 60 * 1000,    // 15 minutes
  medium: 30 * 60 * 1000,  // 30 minutes
  low: 60 * 60 * 1000,     // 60 minutes
};

/**
 * TTL Manager implementation
 */
export class TTLManager implements ITTLManager {
  private posts: Map<string, SharePost> = new Map();
  private expirationHandlers: Set<(postId: string) => void> = new Set();
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private readonly cleanupIntervalMs = 10000; // 10 seconds
  
  constructor() {
    this.startCleanupTimer();
    console.log('[TTLManager] Initialized with automatic cleanup every 10s');
  }
  
  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupIntervalId = setInterval(() => {
      const purged = this.purgeExpired();
      if (purged.length > 0) {
        console.log(`[TTLManager] Auto-purged ${purged.length} expired posts`);
      }
    }, this.cleanupIntervalMs);
  }
  
  /**
   * Track a post for TTL management
   */
  trackPost(post: SharePost): void {
    this.posts.set(post.id, post);
    const remainingMs = post.expiresAt - Date.now();
    const remainingMin = Math.floor(remainingMs / 60000);
    console.log(`[TTLManager] Tracking post ${post.id} (${post.riskTier} risk, expires in ${remainingMin}m)`);
  }
  
  /**
   * Remove post from tracking
   */
  untrackPost(postId: string): void {
    const removed = this.posts.delete(postId);
    if (removed) {
      console.log(`[TTLManager] Untracked post ${postId}`);
    }
  }
  
  /**
   * Get remaining TTL for a post
   */
  getRemainingTTL(postId: string): number | null {
    const post = this.posts.get(postId);
    if (!post) {
      return null;
    }
    return post.expiresAt - Date.now();
  }
  
  /**
   * Check if post is expired
   */
  isExpired(postId: string): boolean {
    const remaining = this.getRemainingTTL(postId);
    if (remaining === null) {
      return false; // Post not found, not expired
    }
    return remaining <= 0;
  }
  
  /**
   * Purge all expired posts
   */
  purgeExpired(): string[] {
    const now = Date.now();
    const expiredIds: string[] = [];
    
    for (const [id, post] of this.posts.entries()) {
      if (post.expiresAt <= now) {
        expiredIds.push(id);
      }
    }
    
    // Remove expired posts and emit events
    for (const id of expiredIds) {
      this.posts.delete(id);
      this.emitPostExpired(id);
    }
    
    return expiredIds;
  }
  
  /**
   * Subscribe to post expiration events
   */
  onPostExpired(handler: (postId: string) => void): Unsubscribe {
    this.expirationHandlers.add(handler);
    return () => {
      this.expirationHandlers.delete(handler);
    };
  }
  
  /**
   * Get TTL duration for a risk tier
   */
  getTTLForRisk(tier: RiskTier): number {
    return TTL_VALUES[tier] || TTL_VALUES.medium;
  }
  
  /**
   * Emit expiration event to all subscribers
   */
  private emitPostExpired(postId: string): void {
    this.expirationHandlers.forEach(handler => {
      try {
        handler(postId);
      } catch (error) {
        console.error('[TTLManager] Error in expiration handler:', error);
      }
    });
  }
  
  /**
   * Get count of tracked posts
   */
  getTrackedCount(): number {
    return this.posts.size;
  }
  
  /**
   * Dispose of the manager and cleanup resources
   */
  dispose(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    this.posts.clear();
    this.expirationHandlers.clear();
    console.log('[TTLManager] Disposed');
  }
}
