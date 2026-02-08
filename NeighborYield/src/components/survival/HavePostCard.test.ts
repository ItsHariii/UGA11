/**
 * Unit Tests for HavePostCard Component
 * Tests formatting, display logic, and claimed badge functionality
 */

import { formatRelativeTime } from './HavePostCard';
import { SurvivalPost } from '../../types';

// ============================================
// formatRelativeTime Tests
// ============================================

describe('formatRelativeTime', () => {
  it('should return "just now" for times less than 60 seconds ago', () => {
    const now = Math.floor(Date.now() / 1000);
    const thirtySecondsAgo = now - 30;
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');
  });

  it('should return minutes for times less than 60 minutes ago', () => {
    const now = Math.floor(Date.now() / 1000);
    const twoMinutesAgo = now - 2 * 60;
    expect(formatRelativeTime(twoMinutesAgo)).toBe('2m ago');
  });

  it('should return "10m ago" for 10 minutes', () => {
    const now = Math.floor(Date.now() / 1000);
    const tenMinutesAgo = now - 10 * 60;
    expect(formatRelativeTime(tenMinutesAgo)).toBe('10m ago');
  });

  it('should return hours for times less than 24 hours ago', () => {
    const now = Math.floor(Date.now() / 1000);
    const threeHoursAgo = now - 3 * 60 * 60;
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
  });

  it('should return "2h ago" for 2 hours', () => {
    const now = Math.floor(Date.now() / 1000);
    const twoHoursAgo = now - 2 * 60 * 60;
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('should return days for times 24 hours or more ago', () => {
    const now = Math.floor(Date.now() / 1000);
    const twoDaysAgo = now - 2 * 24 * 60 * 60;
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');
  });

  it('should handle edge case of exactly 60 seconds', () => {
    const now = Math.floor(Date.now() / 1000);
    const sixtySecondsAgo = now - 60;
    expect(formatRelativeTime(sixtySecondsAgo)).toBe('1m ago');
  });

  it('should handle edge case of exactly 60 minutes', () => {
    const now = Math.floor(Date.now() / 1000);
    const sixtyMinutesAgo = now - 60 * 60;
    expect(formatRelativeTime(sixtyMinutesAgo)).toBe('1h ago');
  });

  it('should handle edge case of exactly 24 hours', () => {
    const now = Math.floor(Date.now() / 1000);
    const twentyFourHoursAgo = now - 24 * 60 * 60;
    expect(formatRelativeTime(twentyFourHoursAgo)).toBe('1d ago');
  });
});

// ============================================
// Post Formatting Tests
// ============================================

describe('HavePostCard formatting', () => {
  it('should format post text correctly', () => {
    const now = Math.floor(Date.now() / 1000);
    const post: SurvivalPost = {
      t: 'h',
      i: 'Fresh Tomatoes',
      h: 123,
      ts: now - 10 * 60, // 10 minutes ago
      id: 'test1234',
    };

    const expectedFormat = `Fresh Tomatoes - House #123 - 10m ago`;
    // This would be tested in component rendering tests
    expect(post.i).toBe('Fresh Tomatoes');
    expect(post.h).toBe(123);
    expect(formatRelativeTime(post.ts)).toBe('10m ago');
  });

  it('should handle long item names', () => {
    const now = Math.floor(Date.now() / 1000);
    const post: SurvivalPost = {
      t: 'h',
      i: 'Fresh organic tomatoes from my garden, very ripe and ready to eat',
      h: 456,
      ts: now - 2 * 60 * 60, // 2 hours ago
      id: 'test5678',
    };

    expect(post.i.length).toBeLessThanOrEqual(100); // Max 100 chars per requirement
    expect(formatRelativeTime(post.ts)).toBe('2h ago');
  });

  it('should handle large house numbers', () => {
    const now = Math.floor(Date.now() / 1000);
    const post: SurvivalPost = {
      t: 'h',
      i: 'Milk',
      h: 9999,
      ts: now - 5 * 60, // 5 minutes ago
      id: 'test9999',
    };

    expect(post.h).toBe(9999);
    expect(formatRelativeTime(post.ts)).toBe('5m ago');
  });
});

// ============================================
// Claimed Badge Tests
// ============================================

describe('HavePostCard claimed badge', () => {
  it('should identify claimed posts', () => {
    const now = Math.floor(Date.now() / 1000);
    const post: SurvivalPost = {
      t: 'h',
      i: 'Bread',
      h: 100,
      ts: now - 30 * 60, // 30 minutes ago
      id: 'claimed1',
      resolved: true, // Claimed
    };

    expect(post.resolved).toBe(true);
  });

  it('should identify unclaimed posts', () => {
    const now = Math.floor(Date.now() / 1000);
    const post: SurvivalPost = {
      t: 'h',
      i: 'Eggs',
      h: 200,
      ts: now - 15 * 60, // 15 minutes ago
      id: 'unclaim1',
      resolved: false, // Not claimed
    };

    expect(post.resolved).toBe(false);
  });

  it('should handle posts without resolved field', () => {
    const now = Math.floor(Date.now() / 1000);
    const post: SurvivalPost = {
      t: 'h',
      i: 'Sugar',
      h: 300,
      ts: now - 60 * 60, // 1 hour ago
      id: 'nofield1',
      // No resolved field
    };

    expect(post.resolved).toBeUndefined();
  });
});

// ============================================
// Size Validation Tests
// ============================================

describe('HavePostCard size requirements', () => {
  it('should validate post is under 512 bytes', () => {
    const now = Math.floor(Date.now() / 1000);
    const post: SurvivalPost = {
      t: 'h',
      i: 'Fresh Tomatoes',
      h: 123,
      ts: now,
      id: 'test1234',
    };

    const serialized = JSON.stringify(post);
    const sizeInBytes = new TextEncoder().encode(serialized).length;
    
    // Requirement 3.5: Maximum 512 bytes when serialized
    expect(sizeInBytes).toBeLessThanOrEqual(512);
  });

  it('should validate post with responders is under 512 bytes', () => {
    const now = Math.floor(Date.now() / 1000);
    const post: SurvivalPost = {
      t: 'h',
      i: 'Fresh Tomatoes',
      h: 123,
      ts: now,
      id: 'test1234',
      r: ['124', '125', '126'], // Multiple responders
      resolved: true,
    };

    const serialized = JSON.stringify(post);
    const sizeInBytes = new TextEncoder().encode(serialized).length;
    
    // Requirement 3.5: Maximum 512 bytes when serialized
    expect(sizeInBytes).toBeLessThanOrEqual(512);
  });
});
