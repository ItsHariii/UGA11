/**
 * Unit tests for SharePostCard time formatting and warning indicator
 *
 * Requirements: 5.4, 5.5
 */

import {
  formatRelativeTime,
  getRemainingTTL,
  isInWarningState,
  getRiskTierLabel,
} from './SharePostCard';

describe('SharePostCard', () => {
  describe('formatRelativeTime', () => {
    const baseTime = 1700000000000; // Fixed timestamp for testing

    it('should return "posted just now" for less than 1 minute', () => {
      const createdAt = baseTime - 30000; // 30 seconds ago
      expect(formatRelativeTime(createdAt, baseTime)).toBe('posted just now');
    });

    it('should return "posted 1 min ago" for exactly 1 minute', () => {
      const createdAt = baseTime - 60000; // 1 minute ago
      expect(formatRelativeTime(createdAt, baseTime)).toBe('posted 1 min ago');
    });

    it('should return "posted X min ago" for multiple minutes', () => {
      const createdAt = baseTime - 5 * 60000; // 5 minutes ago
      expect(formatRelativeTime(createdAt, baseTime)).toBe('posted 5 min ago');
    });

    it('should floor partial minutes', () => {
      const createdAt = baseTime - 5.7 * 60000; // 5.7 minutes ago
      expect(formatRelativeTime(createdAt, baseTime)).toBe('posted 5 min ago');
    });

    it('should handle large time differences', () => {
      const createdAt = baseTime - 45 * 60000; // 45 minutes ago
      expect(formatRelativeTime(createdAt, baseTime)).toBe('posted 45 min ago');
    });
  });

  describe('getRemainingTTL', () => {
    const currentTime = 1700000000000;

    it('should return positive value when not expired', () => {
      const expiresAt = currentTime + 10 * 60000; // 10 minutes from now
      expect(getRemainingTTL(expiresAt, currentTime)).toBe(10 * 60000);
    });

    it('should return 0 when expired', () => {
      const expiresAt = currentTime - 5 * 60000; // 5 minutes ago
      expect(getRemainingTTL(expiresAt, currentTime)).toBe(0);
    });

    it('should return 0 when exactly at expiration', () => {
      expect(getRemainingTTL(currentTime, currentTime)).toBe(0);
    });
  });

  describe('isInWarningState', () => {
    const currentTime = 1700000000000;
    const fiveMinutesMs = 5 * 60 * 1000;

    it('should return true when TTL < 5 minutes', () => {
      const expiresAt = currentTime + 4 * 60000; // 4 minutes remaining
      expect(isInWarningState(expiresAt, currentTime)).toBe(true);
    });

    it('should return false when TTL >= 5 minutes', () => {
      const expiresAt = currentTime + fiveMinutesMs; // exactly 5 minutes
      expect(isInWarningState(expiresAt, currentTime)).toBe(false);
    });

    it('should return false when already expired', () => {
      const expiresAt = currentTime - 60000; // expired 1 minute ago
      expect(isInWarningState(expiresAt, currentTime)).toBe(false);
    });

    it('should return true at 4:59 remaining', () => {
      const expiresAt = currentTime + (4 * 60 + 59) * 1000; // 4:59 remaining
      expect(isInWarningState(expiresAt, currentTime)).toBe(true);
    });
  });

  describe('getRiskTierLabel', () => {
    it('should return "High Risk" for high tier', () => {
      expect(getRiskTierLabel('high')).toBe('High Risk');
    });

    it('should return "Medium Risk" for medium tier', () => {
      expect(getRiskTierLabel('medium')).toBe('Medium Risk');
    });

    it('should return "Low Risk" for low tier', () => {
      expect(getRiskTierLabel('low')).toBe('Low Risk');
    });
  });
});
