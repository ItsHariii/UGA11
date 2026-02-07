/**
 * useTTL Hook
 * Provides TTL-related utilities and post expiration management.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.2, 6.3, 6.4
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context';
import { RiskTier, SharePost, TTL_VALUES } from '../types';

export interface UseTTLResult {
  /** Get TTL in milliseconds for a risk tier */
  getTTLForRisk: (tier: RiskTier) => number;

  /** Get remaining TTL for a post in milliseconds */
  getRemainingTTL: (post: SharePost, currentTime?: number) => number;

  /** Check if a post is expired */
  isExpired: (post: SharePost, currentTime?: number) => boolean;

  /** Check if a post is expiring soon (< 5 minutes) */
  isExpiringSoon: (post: SharePost, currentTime?: number) => boolean;

  /** Format relative time string (e.g., "posted 5 min ago") */
  formatRelativeTime: (createdAt: number, currentTime?: number) => string;

  /** Remove all expired posts from state */
  purgeExpiredPosts: (currentTime?: number) => void;

  /** Get all active (non-expired) posts */
  activePosts: SharePost[];

  /** Calculate expiration timestamp from creation time and risk tier */
  calculateExpiresAt: (createdAt: number, riskTier: RiskTier) => number;
}

/** Threshold for "expiring soon" warning in milliseconds (5 minutes) */
const EXPIRING_SOON_THRESHOLD = 5 * 60 * 1000;

/** Default TTL for posts without explicit risk tier (medium) */
const DEFAULT_TTL = TTL_VALUES.medium;

/**
 * Hook for TTL management and post expiration
 */
export function useTTL(): UseTTLResult {
  const { state, removeExpiredPosts } = useAppContext();
  const purgeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getTTLForRisk = useCallback((tier: RiskTier): number => {
    return TTL_VALUES[tier] ?? DEFAULT_TTL;
  }, []);

  const getRemainingTTL = useCallback(
    (post: SharePost, currentTime: number = Date.now()): number => {
      const remaining = post.expiresAt - currentTime;
      return Math.max(0, remaining);
    },
    []
  );

  const isExpired = useCallback(
    (post: SharePost, currentTime: number = Date.now()): boolean => {
      return post.expiresAt <= currentTime;
    },
    []
  );

  const isExpiringSoon = useCallback(
    (post: SharePost, currentTime: number = Date.now()): boolean => {
      const remaining = post.expiresAt - currentTime;
      return remaining > 0 && remaining < EXPIRING_SOON_THRESHOLD;
    },
    []
  );

  const formatRelativeTime = useCallback(
    (createdAt: number, currentTime: number = Date.now()): string => {
      const diffMs = currentTime - createdAt;
      const diffMinutes = Math.floor(diffMs / 60000);

      if (diffMinutes < 1) {
        return 'posted just now';
      }
      if (diffMinutes === 1) {
        return 'posted 1 min ago';
      }
      if (diffMinutes < 60) {
        return `posted ${diffMinutes} min ago`;
      }

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours === 1) {
        return 'posted 1 hour ago';
      }
      return `posted ${diffHours} hours ago`;
    },
    []
  );

  const purgeExpiredPosts = useCallback(
    (currentTime: number = Date.now()) => {
      removeExpiredPosts(currentTime);
    },
    [removeExpiredPosts]
  );

  const calculateExpiresAt = useCallback(
    (createdAt: number, riskTier: RiskTier): number => {
      const ttl = getTTLForRisk(riskTier);
      return createdAt + ttl;
    },
    [getTTLForRisk]
  );

  const activePosts = useMemo((): SharePost[] => {
    const now = Date.now();
    return state.posts.filter((post) => post.expiresAt > now);
  }, [state.posts]);

  // Auto-purge expired posts periodically (every 30 seconds)
  useEffect(() => {
    purgeIntervalRef.current = setInterval(() => {
      removeExpiredPosts(Date.now());
    }, 30000);

    return () => {
      if (purgeIntervalRef.current) {
        clearInterval(purgeIntervalRef.current);
      }
    };
  }, [removeExpiredPosts]);

  return {
    getTTLForRisk,
    getRemainingTTL,
    isExpired,
    isExpiringSoon,
    formatRelativeTime,
    purgeExpiredPosts,
    activePosts,
    calculateExpiresAt,
  };
}

export default useTTL;
