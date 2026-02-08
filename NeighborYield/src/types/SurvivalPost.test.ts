/**
 * Unit tests for SurvivalPost type guards, serialization, and validation
 * 
 * Requirements: 7.1-7.10
 */

import {
  SurvivalPost,
  isSurvivalPost,
  serializeSurvivalPost,
  deserializeSurvivalPost,
  validateSurvivalPostSize,
  getSurvivalPostSize,
  generateSurvivalPostId,
  createSurvivalPost,
  MAX_SURVIVAL_POST_SIZE,
} from './index';

describe('SurvivalPost', () => {
  describe('isSurvivalPost', () => {
    it('should return true for valid Have post', () => {
      const post: SurvivalPost = {
        t: 'h',
        i: 'Fresh tomatoes',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(isSurvivalPost(post)).toBe(true);
    });

    it('should return true for valid Want post', () => {
      const post: SurvivalPost = {
        t: 'w',
        i: 'Need milk',
        h: 124,
        ts: 1709856000,
        id: 'b2c3d4e5',
      };
      expect(isSurvivalPost(post)).toBe(true);
    });

    it('should return true for valid SOS post with category', () => {
      const post: SurvivalPost = {
        t: 's',
        i: 'Medical emergency',
        h: 125,
        ts: 1709856000,
        id: 'c3d4e5f6',
        c: 'm',
      };
      expect(isSurvivalPost(post)).toBe(true);
    });

    it('should return true for post with responders', () => {
      const post: SurvivalPost = {
        t: 'w',
        i: 'Need water',
        h: 126,
        ts: 1709856000,
        id: 'd4e5f6g7',
        r: ['123', '124'],
      };
      expect(isSurvivalPost(post)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isSurvivalPost(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isSurvivalPost(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isSurvivalPost('string')).toBe(false);
      expect(isSurvivalPost(123)).toBe(false);
    });

    it('should return false for invalid type', () => {
      const post = {
        t: 'x',
        i: 'Item',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(isSurvivalPost(post)).toBe(false);
    });

    it('should return false for empty item', () => {
      const post = {
        t: 'h',
        i: '',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(isSurvivalPost(post)).toBe(false);
    });

    it('should return false for item > 100 chars', () => {
      const post = {
        t: 'h',
        i: 'a'.repeat(101),
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(isSurvivalPost(post)).toBe(false);
    });

    it('should return false for non-integer house number', () => {
      const post = {
        t: 'h',
        i: 'Item',
        h: 123.5,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(isSurvivalPost(post)).toBe(false);
    });

    it('should return false for negative house number', () => {
      const post = {
        t: 'h',
        i: 'Item',
        h: -123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(isSurvivalPost(post)).toBe(false);
    });

    it('should return false for zero house number', () => {
      const post = {
        t: 'h',
        i: 'Item',
        h: 0,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(isSurvivalPost(post)).toBe(false);
    });

    it('should return false for invalid ID length', () => {
      const post = {
        t: 'h',
        i: 'Item',
        h: 123,
        ts: 1709856000,
        id: 'short',
      };
      expect(isSurvivalPost(post)).toBe(false);
    });

    it('should return false for invalid category', () => {
      const post = {
        t: 's',
        i: 'Emergency',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
        c: 'x',
      };
      expect(isSurvivalPost(post)).toBe(false);
    });

    it('should return false for non-array responders', () => {
      const post = {
        t: 'w',
        i: 'Item',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
        r: 'not-array',
      };
      expect(isSurvivalPost(post)).toBe(false);
    });

    it('should return false for responders with non-string elements', () => {
      const post = {
        t: 'w',
        i: 'Item',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
        r: [123, 124],
      };
      expect(isSurvivalPost(post)).toBe(false);
    });
  });

  describe('serializeSurvivalPost', () => {
    it('should serialize a minimal post', () => {
      const post: SurvivalPost = {
        t: 'h',
        i: 'Tomatoes',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      const serialized = serializeSurvivalPost(post);
      expect(serialized).toBe(JSON.stringify(post));
    });

    it('should serialize a post with all fields', () => {
      const post: SurvivalPost = {
        t: 's',
        i: 'Medical emergency',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
        r: ['124', '125'],
        c: 'm',
        resolved: false,
      };
      const serialized = serializeSurvivalPost(post);
      expect(serialized).toBe(JSON.stringify(post));
    });
  });

  describe('deserializeSurvivalPost', () => {
    it('should deserialize a valid JSON string', () => {
      const post: SurvivalPost = {
        t: 'h',
        i: 'Tomatoes',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      const json = JSON.stringify(post);
      const deserialized = deserializeSurvivalPost(json);
      expect(deserialized).toEqual(post);
    });

    it('should return null for invalid JSON', () => {
      const result = deserializeSurvivalPost('not valid json');
      expect(result).toBeNull();
    });

    it('should return null for JSON with invalid post structure', () => {
      const invalidPost = {
        t: 'x',
        i: 'Item',
        h: 123,
      };
      const json = JSON.stringify(invalidPost);
      const result = deserializeSurvivalPost(json);
      expect(result).toBeNull();
    });
  });

  describe('validateSurvivalPostSize', () => {
    it('should return true for small post', () => {
      const post: SurvivalPost = {
        t: 'h',
        i: 'Tomatoes',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(validateSurvivalPostSize(post)).toBe(true);
    });

    it('should return true for post with responders', () => {
      const post: SurvivalPost = {
        t: 'w',
        i: 'Need water bottles',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
        r: ['124', '125', '126'],
      };
      expect(validateSurvivalPostSize(post)).toBe(true);
    });

    it('should return true for post at max item length', () => {
      const post: SurvivalPost = {
        t: 'h',
        i: 'a'.repeat(100),
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(validateSurvivalPostSize(post)).toBe(true);
    });

    it('should validate size is under 512 bytes', () => {
      const post: SurvivalPost = {
        t: 's',
        i: 'Emergency situation requiring immediate assistance',
        h: 12345,
        ts: 1709856000,
        id: 'a1b2c3d4',
        r: ['124', '125', '126', '127', '128'],
        c: 'm',
        resolved: false,
      };
      const size = getSurvivalPostSize(post);
      expect(size).toBeLessThan(MAX_SURVIVAL_POST_SIZE);
      expect(validateSurvivalPostSize(post)).toBe(true);
    });
  });

  describe('getSurvivalPostSize', () => {
    it('should return correct size in bytes', () => {
      const post: SurvivalPost = {
        t: 'h',
        i: 'Tomatoes',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      const size = getSurvivalPostSize(post);
      const serialized = serializeSurvivalPost(post);
      const expectedSize = new TextEncoder().encode(serialized).length;
      expect(size).toBe(expectedSize);
    });

    it('should handle UTF-8 characters correctly', () => {
      const post: SurvivalPost = {
        t: 'h',
        i: 'Café ☕',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      const size = getSurvivalPostSize(post);
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('generateSurvivalPostId', () => {
    it('should generate 8-character ID', () => {
      const id = generateSurvivalPostId();
      expect(id).toHaveLength(8);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(generateSurvivalPostId());
      }
      // All 10 IDs should be unique
      expect(ids.size).toBe(10);
    });

    it('should generate alphanumeric IDs', () => {
      const id = generateSurvivalPostId();
      expect(id).toMatch(/^[a-z0-9]{8}$/);
    });
  });

  describe('createSurvivalPost', () => {
    it('should create a valid Have post', () => {
      const post = createSurvivalPost('h', 'Fresh tomatoes', 123);
      expect(post).not.toBeNull();
      expect(post?.t).toBe('h');
      expect(post?.i).toBe('Fresh tomatoes');
      expect(post?.h).toBe(123);
      expect(post?.id).toHaveLength(8);
      expect(post?.ts).toBeGreaterThan(0);
    });

    it('should create a valid Want post', () => {
      const post = createSurvivalPost('w', 'Need milk', 124);
      expect(post).not.toBeNull();
      expect(post?.t).toBe('w');
    });

    it('should create a valid SOS post with category', () => {
      const post = createSurvivalPost('s', 'Medical emergency', 125, 'm');
      expect(post).not.toBeNull();
      expect(post?.t).toBe('s');
      expect(post?.c).toBe('m');
    });

    it('should trim whitespace from item', () => {
      const post = createSurvivalPost('h', '  Tomatoes  ', 123);
      expect(post?.i).toBe('Tomatoes');
    });

    it('should return null for empty item', () => {
      const post = createSurvivalPost('h', '', 123);
      expect(post).toBeNull();
    });

    it('should return null for item > 100 chars', () => {
      const post = createSurvivalPost('h', 'a'.repeat(101), 123);
      expect(post).toBeNull();
    });

    it('should return null for non-integer house number', () => {
      const post = createSurvivalPost('h', 'Item', 123.5);
      expect(post).toBeNull();
    });

    it('should return null for negative house number', () => {
      const post = createSurvivalPost('h', 'Item', -123);
      expect(post).toBeNull();
    });

    it('should return null for zero house number', () => {
      const post = createSurvivalPost('h', 'Item', 0);
      expect(post).toBeNull();
    });

    it('should validate size constraint', () => {
      const post = createSurvivalPost('h', 'Valid item', 123);
      expect(post).not.toBeNull();
      if (post) {
        expect(validateSurvivalPostSize(post)).toBe(true);
      }
    });

    it('should create posts under 512 bytes', () => {
      const post = createSurvivalPost('h', 'a'.repeat(100), 99999);
      expect(post).not.toBeNull();
      if (post) {
        const size = getSurvivalPostSize(post);
        expect(size).toBeLessThan(MAX_SURVIVAL_POST_SIZE);
      }
    });
  });

  describe('Size validation edge cases', () => {
    it('should handle maximum length item', () => {
      const post: SurvivalPost = {
        t: 'h',
        i: 'a'.repeat(100),
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
      };
      expect(validateSurvivalPostSize(post)).toBe(true);
      expect(getSurvivalPostSize(post)).toBeLessThan(MAX_SURVIVAL_POST_SIZE);
    });

    it('should handle many responders', () => {
      const responders = Array.from({ length: 20 }, (_, i) => `${i + 100}`);
      const post: SurvivalPost = {
        t: 'w',
        i: 'Need help',
        h: 123,
        ts: 1709856000,
        id: 'a1b2c3d4',
        r: responders,
      };
      const size = getSurvivalPostSize(post);
      expect(size).toBeLessThan(MAX_SURVIVAL_POST_SIZE);
    });

    it('should handle all optional fields', () => {
      const post: SurvivalPost = {
        t: 's',
        i: 'Emergency requiring immediate assistance from neighbors',
        h: 99999,
        ts: 1709856000,
        id: 'a1b2c3d4',
        r: ['100', '101', '102', '103', '104'],
        c: 'm',
        resolved: false,
      };
      const size = getSurvivalPostSize(post);
      expect(size).toBeLessThan(MAX_SURVIVAL_POST_SIZE);
    });
  });
});
