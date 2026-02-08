/**
 * Unit tests for heartbeat module
 */

import {
  serializeHeartbeat,
  deserializeHeartbeat,
  createHeartbeatPayload,
  isHeartbeatUnderLimit,
} from './heartbeat';
import { HEARTBEAT_MAX_BYTES } from './constants';

describe('Heartbeat Module', () => {
  describe('createHeartbeatPayload', () => {
    it('should create a valid heartbeat payload', () => {
      const uid = 'test-user-123';
      const capabilities = 5;
      const payload = createHeartbeatPayload(uid, capabilities);

      expect(payload.v).toBe(1);
      expect(payload.uid).toBe(uid);
      expect(payload.cap).toBe(capabilities);
      expect(payload.ts).toBeGreaterThan(0);
      expect(typeof payload.ts).toBe('number');
    });

    it('should default capabilities to 0', () => {
      const uid = 'test-user-456';
      const payload = createHeartbeatPayload(uid);

      expect(payload.cap).toBe(0);
    });

    it('should create timestamp close to current time', () => {
      const before = Date.now();
      const payload = createHeartbeatPayload('test-user');
      const after = Date.now();

      expect(payload.ts).toBeGreaterThanOrEqual(before);
      expect(payload.ts).toBeLessThanOrEqual(after);
    });
  });

  describe('serializeHeartbeat', () => {
    it('should serialize a heartbeat payload', () => {
      const payload = createHeartbeatPayload('test-user', 3);
      const { bytes, size } = serializeHeartbeat(payload);

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(HEARTBEAT_MAX_BYTES);
    });

    it('should produce consistent size for same payload', () => {
      const payload = createHeartbeatPayload('test-user', 3);
      const { size: size1 } = serializeHeartbeat(payload);
      const { size: size2 } = serializeHeartbeat(payload);

      expect(size1).toBe(size2);
    });

    it('should handle long user IDs', () => {
      const longUid = 'a'.repeat(64);
      const payload = createHeartbeatPayload(longUid, 7);
      const { size } = serializeHeartbeat(payload);

      expect(size).toBeLessThan(HEARTBEAT_MAX_BYTES);
    });
  });

  describe('deserializeHeartbeat', () => {
    it('should deserialize a serialized heartbeat', () => {
      const original = createHeartbeatPayload('test-user-789', 4);
      const { bytes } = serializeHeartbeat(original);
      const deserialized = deserializeHeartbeat(bytes);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.v).toBe(original.v);
      expect(deserialized?.uid).toBe(original.uid);
      expect(deserialized?.ts).toBe(original.ts);
      expect(deserialized?.cap).toBe(original.cap);
    });

    it('should return null for invalid bytes', () => {
      const invalidBytes = new Uint8Array([1, 2, 3, 4, 5]);
      const result = deserializeHeartbeat(invalidBytes);

      expect(result).toBeNull();
    });

    it('should return null for malformed JSON', () => {
      const malformedJson = new TextEncoder().encode('{ invalid json }');
      const result = deserializeHeartbeat(malformedJson);

      expect(result).toBeNull();
    });

    it('should return null for missing required fields', () => {
      const incomplete = JSON.stringify({ heartbeat: { v: 1, uid: 'test' } });
      const bytes = new TextEncoder().encode(incomplete);
      const result = deserializeHeartbeat(bytes);

      expect(result).toBeNull();
    });
  });

  describe('isHeartbeatUnderLimit', () => {
    it('should return true for normal heartbeat payloads', () => {
      const payload = createHeartbeatPayload('test-user', 2);
      const result = isHeartbeatUnderLimit(payload);

      expect(result).toBe(true);
    });

    it('should return true for heartbeat with long user ID', () => {
      const longUid = 'a'.repeat(64);
      const payload = createHeartbeatPayload(longUid, 15);
      const result = isHeartbeatUnderLimit(payload);

      expect(result).toBe(true);
    });

    it('should handle edge case of very long user ID', () => {
      // Even with a very long UID, the payload should still be under 1KB
      // because the structure is minimal
      const veryLongUid = 'a'.repeat(500);
      const payload = createHeartbeatPayload(veryLongUid, 255);
      const result = isHeartbeatUnderLimit(payload);

      // This should still be under 1KB due to efficient JSON structure
      expect(result).toBe(true);
    });
  });

  describe('Round-trip serialization', () => {
    it('should preserve all fields through serialize/deserialize cycle', () => {
      const original = createHeartbeatPayload('round-trip-test', 8);
      const { bytes } = serializeHeartbeat(original);
      const restored = deserializeHeartbeat(bytes);

      expect(restored).toEqual(original);
    });

    it('should handle multiple round trips', () => {
      let payload = createHeartbeatPayload('multi-trip', 1);

      for (let i = 0; i < 5; i++) {
        const { bytes } = serializeHeartbeat(payload);
        const restored = deserializeHeartbeat(bytes);
        expect(restored).toEqual(payload);
        payload = restored!;
      }
    });
  });
});
