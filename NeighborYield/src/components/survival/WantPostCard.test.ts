/**
 * Unit tests for WantPostCard component
 * Tests formatting, expiration, and responder display logic
 */

import {
  formatRelativeTime,
  isPostExpired,
  getExpirationCountdown,
  formatResponders,
} from './WantPostCard';

// ============================================
// formatRelativeTime Tests
// ============================================

describe('formatRelativeTime', () => {
  it('should return "just now" for timestamps less than 60 seconds ago', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(formatRelativeTime(now)).toBe('just now');
    expect(formatRelativeTime(now - 30)).toBe('just now');
    expect(formatRelativeTime(now - 59)).toBe('just now');
  });

  it('should return minutes for timestamps less than 60 minutes ago', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(formatRelativeTime(now - 60)).toBe('1m ago');
    expect(formatRelativeTime(now - 300)).toBe('5m ago');
    expect(formatRelativeTime(now - 1800)).toBe('30m ago');
    expect(formatRelativeTime(now - 3540)).toBe('59m ago');
  });

  it('should return hours for timestamps less than 24 hours ago', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(formatRelativeTime(now - 3600)).toBe('1h ago');
    expect(formatRelativeTime(now - 7200)).toBe('2h ago');
    expect(formatRelativeTime(now - 43200)).toBe('12h ago');
    expect(formatRelativeTime(now - 82800)).toBe('23h ago');
  });

  it('should return days for timestamps 24 hours or more ago', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(formatRelativeTime(now - 86400)).toBe('1d ago');
    expect(formatRelativeTime(now - 172800)).toBe('2d ago');
    expect(formatRelativeTime(now - 604800)).toBe('7d ago');
  });
});

// ============================================
// isPostExpired Tests
// ============================================

describe('isPostExpired', () => {
  it('should return false for posts less than 24 hours old', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isPostExpired(now)).toBe(false);
    expect(isPostExpired(now - 3600)).toBe(false); // 1 hour ago
    expect(isPostExpired(now - 43200)).toBe(false); // 12 hours ago
    expect(isPostExpired(now - 86399)).toBe(false); // 23h 59m 59s ago
  });

  it('should return true for posts 24 hours or older', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isPostExpired(now - 86400)).toBe(true); // Exactly 24 hours
    expect(isPostExpired(now - 86401)).toBe(true); // 24h 1s ago
    expect(isPostExpired(now - 172800)).toBe(true); // 48 hours ago
  });
});

// ============================================
// getExpirationCountdown Tests
// ============================================

describe('getExpirationCountdown', () => {
  it('should return "Expired" for posts 24 hours or older', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(getExpirationCountdown(now - 86400)).toBe('Expired');
    expect(getExpirationCountdown(now - 86401)).toBe('Expired');
    expect(getExpirationCountdown(now - 172800)).toBe('Expired');
  });

  it('should return hours remaining for posts with > 1 hour left', () => {
    const now = Math.floor(Date.now() / 1000);
    // 23 hours old = 1 hour remaining
    expect(getExpirationCountdown(now - 82800)).toBe('1h left');
    // 12 hours old = 12 hours remaining
    expect(getExpirationCountdown(now - 43200)).toBe('12h left');
    // 1 hour old = 23 hours remaining
    expect(getExpirationCountdown(now - 3600)).toBe('23h left');
  });

  it('should return minutes remaining for posts with < 1 hour left', () => {
    const now = Math.floor(Date.now() / 1000);
    // 23h 30m old = 30 minutes remaining
    expect(getExpirationCountdown(now - 84600)).toBe('30m left');
    // 23h 50m old = 10 minutes remaining
    expect(getExpirationCountdown(now - 85800)).toBe('10m left');
    // 23h 59m old = 1 minute remaining
    expect(getExpirationCountdown(now - 86340)).toBe('1m left');
  });

  it('should handle edge case of just created post', () => {
    const now = Math.floor(Date.now() / 1000);
    const result = getExpirationCountdown(now);
    expect(result).toBe('24h left');
  });
});

// ============================================
// formatResponders Tests
// ============================================

describe('formatResponders', () => {
  it('should format single responder with # prefix', () => {
    expect(formatResponders(['123'])).toBe('#123');
  });

  it('should format multiple responders with # prefix and comma separation', () => {
    expect(formatResponders(['123', '124'])).toBe('#123, #124');
    expect(formatResponders(['123', '124', '125'])).toBe('#123, #124, #125');
  });

  it('should handle empty array', () => {
    expect(formatResponders([])).toBe('');
  });

  it('should handle responders with different number formats', () => {
    expect(formatResponders(['1', '10', '100', '1000'])).toBe('#1, #10, #100, #1000');
  });
});

// ============================================
// Integration Tests
// ============================================

describe('WantPostCard integration', () => {
  it('should correctly identify expired posts and format countdown', () => {
    const now = Math.floor(Date.now() / 1000);
    
    // Fresh post
    const freshPost = now;
    expect(isPostExpired(freshPost)).toBe(false);
    expect(getExpirationCountdown(freshPost)).toBe('24h left');
    
    // Old post
    const oldPost = now - 86400;
    expect(isPostExpired(oldPost)).toBe(true);
    expect(getExpirationCountdown(oldPost)).toBe('Expired');
  });

  it('should format post with responders correctly', () => {
    const responders = ['123', '124', '125'];
    const formatted = formatResponders(responders);
    expect(formatted).toBe('#123, #124, #125');
    expect(formatted.split(', ').length).toBe(3);
  });

  it('should handle post lifecycle from creation to expiration', () => {
    const now = Math.floor(Date.now() / 1000);
    
    // Just created
    const created = now;
    expect(formatRelativeTime(created)).toBe('just now');
    expect(isPostExpired(created)).toBe(false);
    expect(getExpirationCountdown(created)).toBe('24h left');
    
    // 1 hour old
    const oneHourOld = now - 3600;
    expect(formatRelativeTime(oneHourOld)).toBe('1h ago');
    expect(isPostExpired(oneHourOld)).toBe(false);
    expect(getExpirationCountdown(oneHourOld)).toBe('23h left');
    
    // 23 hours old
    const almostExpired = now - 82800;
    expect(formatRelativeTime(almostExpired)).toBe('23h ago');
    expect(isPostExpired(almostExpired)).toBe(false);
    expect(getExpirationCountdown(almostExpired)).toBe('1h left');
    
    // 24 hours old (expired)
    const expired = now - 86400;
    expect(formatRelativeTime(expired)).toBe('1d ago');
    expect(isPostExpired(expired)).toBe(true);
    expect(getExpirationCountdown(expired)).toBe('Expired');
  });
});
