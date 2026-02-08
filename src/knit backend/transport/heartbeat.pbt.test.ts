/**
 * Property 10: Heartbeat Payload Size Constraint
 * Validates: Requirements 3.4 — heartbeat payload < 1KB
 */

import * as fc from 'fast-check';
import { createHeartbeatPayload, serializeHeartbeat } from './heartbeat';
import { HEARTBEAT_MAX_BYTES as MAX_BYTES } from './constants';

describe('Transport Layer - Heartbeat', () => {
  describe('Property 10: Heartbeat Payload Size Constraint', () => {
    it('serialized heartbeat must be under 1KB for any valid uid', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 64 }), (uid) => {
          const payload = createHeartbeatPayload(uid);
          const { size } = serializeHeartbeat(payload);
          return size < MAX_BYTES;
        }),
        { numRuns: 100 }
      );
    });

    it('createHeartbeatPayload produces payload that serializes under limit', () => {
      const payload = createHeartbeatPayload('Neighbor-A3F9');
      const { size } = serializeHeartbeat(payload);
      expect(size).toBeLessThan(MAX_BYTES);
    });
  });
});
