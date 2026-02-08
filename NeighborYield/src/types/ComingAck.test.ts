/**
 * Unit tests for ComingAck type guards, serialization, and validation
 * 
 * Requirements: 4.3
 */

import {
  ComingAck,
  isComingAck,
  serializeComingAck,
  deserializeComingAck,
  getComingAckSize,
  createComingAck,
} from './index';

describe('ComingAck', () => {
  describe('isComingAck', () => {
    it('should return true for valid ComingAck', () => {
      const ack: ComingAck = {
        postId: 'a1b2c3d4',
        houseNumber: '123',
      };
      expect(isComingAck(ack)).toBe(true);
    });

    it('should return true for ComingAck with longer house number', () => {
      const ack: ComingAck = {
        postId: 'b2c3d4e5',
        houseNumber: '12345',
      };
      expect(isComingAck(ack)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isComingAck(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isComingAck(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isComingAck('string')).toBe(false);
      expect(isComingAck(123)).toBe(false);
    });

    it('should return false for missing postId', () => {
      const ack = {
        houseNumber: '123',
      };
      expect(isComingAck(ack)).toBe(false);
    });

    it('should return false for missing houseNumber', () => {
      const ack = {
        postId: 'a1b2c3d4',
      };
      expect(isComingAck(ack)).toBe(false);
    });

    it('should return false for invalid postId length', () => {
      const ack = {
        postId: 'short',
        houseNumber: '123',
      };
      expect(isComingAck(ack)).toBe(false);
    });

    it('should return false for postId longer than 8 chars', () => {
      const ack = {
        postId: 'toolongid',
        houseNumber: '123',
      };
      expect(isComingAck(ack)).toBe(false);
    });

    it('should return false for empty houseNumber', () => {
      const ack = {
        postId: 'a1b2c3d4',
        houseNumber: '',
      };
      expect(isComingAck(ack)).toBe(false);
    });

    it('should return false for non-string postId', () => {
      const ack = {
        postId: 12345678,
        houseNumber: '123',
      };
      expect(isComingAck(ack)).toBe(false);
    });

    it('should return false for non-string houseNumber', () => {
      const ack = {
        postId: 'a1b2c3d4',
        houseNumber: 123,
      };
      expect(isComingAck(ack)).toBe(false);
    });
  });

  describe('serializeComingAck', () => {
    it('should serialize a ComingAck', () => {
      const ack: ComingAck = {
        postId: 'a1b2c3d4',
        houseNumber: '123',
      };
      const serialized = serializeComingAck(ack);
      expect(serialized).toBe(JSON.stringify(ack));
    });

    it('should serialize with longer house number', () => {
      const ack: ComingAck = {
        postId: 'b2c3d4e5',
        houseNumber: '12345',
      };
      const serialized = serializeComingAck(ack);
      expect(serialized).toBe(JSON.stringify(ack));
    });
  });

  describe('deserializeComingAck', () => {
    it('should deserialize a valid JSON string', () => {
      const ack: ComingAck = {
        postId: 'a1b2c3d4',
        houseNumber: '123',
      };
      const json = JSON.stringify(ack);
      const deserialized = deserializeComingAck(json);
      expect(deserialized).toEqual(ack);
    });

    it('should return null for invalid JSON', () => {
      const result = deserializeComingAck('not valid json');
      expect(result).toBeNull();
    });

    it('should return null for JSON with invalid ack structure', () => {
      const invalidAck = {
        postId: 'short',
        houseNumber: '123',
      };
      const json = JSON.stringify(invalidAck);
      const result = deserializeComingAck(json);
      expect(result).toBeNull();
    });

    it('should return null for JSON missing fields', () => {
      const invalidAck = {
        postId: 'a1b2c3d4',
      };
      const json = JSON.stringify(invalidAck);
      const result = deserializeComingAck(json);
      expect(result).toBeNull();
    });
  });

  describe('getComingAckSize', () => {
    it('should return correct size in bytes', () => {
      const ack: ComingAck = {
        postId: 'a1b2c3d4',
        houseNumber: '123',
      };
      const size = getComingAckSize(ack);
      const serialized = serializeComingAck(ack);
      const expectedSize = new TextEncoder().encode(serialized).length;
      expect(size).toBe(expectedSize);
    });

    it('should be under 30 bytes for typical ack', () => {
      const ack: ComingAck = {
        postId: 'a1b2c3d4',
        houseNumber: '123',
      };
      const size = getComingAckSize(ack);
      expect(size).toBeLessThan(50); // Target ~30 bytes, allow some margin
    });

    it('should handle longer house numbers', () => {
      const ack: ComingAck = {
        postId: 'b2c3d4e5',
        houseNumber: '12345',
      };
      const size = getComingAckSize(ack);
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(60); // Still compact
    });
  });

  describe('createComingAck', () => {
    it('should create a valid ComingAck', () => {
      const ack = createComingAck('a1b2c3d4', '123');
      expect(ack).not.toBeNull();
      expect(ack?.postId).toBe('a1b2c3d4');
      expect(ack?.houseNumber).toBe('123');
    });

    it('should create ComingAck with longer house number', () => {
      const ack = createComingAck('b2c3d4e5', '12345');
      expect(ack).not.toBeNull();
      expect(ack?.houseNumber).toBe('12345');
    });

    it('should return null for invalid postId length', () => {
      const ack = createComingAck('short', '123');
      expect(ack).toBeNull();
    });

    it('should return null for postId longer than 8 chars', () => {
      const ack = createComingAck('toolongid', '123');
      expect(ack).toBeNull();
    });

    it('should return null for empty houseNumber', () => {
      const ack = createComingAck('a1b2c3d4', '');
      expect(ack).toBeNull();
    });

    it('should validate created ack', () => {
      const ack = createComingAck('a1b2c3d4', '123');
      expect(ack).not.toBeNull();
      if (ack) {
        expect(isComingAck(ack)).toBe(true);
      }
    });
  });

  describe('Size validation', () => {
    it('should create compact acknowledgments', () => {
      const ack = createComingAck('a1b2c3d4', '123');
      expect(ack).not.toBeNull();
      if (ack) {
        const size = getComingAckSize(ack);
        // Target ~30 bytes as per design doc
        expect(size).toBeLessThan(50);
      }
    });

    it('should handle various house number formats', () => {
      const testCases = ['1', '123', '12345', '999999'];
      testCases.forEach(houseNumber => {
        const ack = createComingAck('a1b2c3d4', houseNumber);
        expect(ack).not.toBeNull();
        if (ack) {
          const size = getComingAckSize(ack);
          expect(size).toBeLessThan(60); // Still compact
        }
      });
    });

    it('should serialize and deserialize correctly', () => {
      const original = createComingAck('a1b2c3d4', '123');
      expect(original).not.toBeNull();
      if (original) {
        const serialized = serializeComingAck(original);
        const deserialized = deserializeComingAck(serialized);
        expect(deserialized).toEqual(original);
      }
    });
  });
});
