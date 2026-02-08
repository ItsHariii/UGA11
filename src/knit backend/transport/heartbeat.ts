/**
 * Heartbeat payload serialization/deserialization.
 * Ensures payload stays under 1KB (Requirements 3.4, Property 10).
 */

import type { HeartbeatPayload } from './types';
import { HEARTBEAT_VERSION, HEARTBEAT_MAX_BYTES } from './constants';

const HEARTBEAT_PAYLOAD_KEY = 'heartbeat';

export interface SerializedHeartbeat {
  [key: string]: HeartbeatPayload;
}

/** UTF-8 encode string to bytes (portable, no TextEncoder dependency) */
function utf8Encode(s: string): Uint8Array {
  const u8: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) u8.push(c);
    else if (c < 0x800) {
      u8.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      u8.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i++;
      c = 0x10000 + (((c & 0x3ff) << 10) | (s.charCodeAt(i) & 0x3ff));
      u8.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f)
      );
    }
  }
  return new Uint8Array(u8);
}

/** UTF-8 decode bytes to string (portable, no TextDecoder dependency) */
function utf8Decode(bytes: Uint8Array): string {
  const codes: number[] = [];
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    if (b < 0x80) codes.push(b);
    else if (b < 0xe0) codes.push(((b & 0x1f) << 6) | (bytes[i++]! & 0x3f));
    else if (b < 0xf0)
      codes.push(
        ((b & 0x0f) << 12) | ((bytes[i++]! & 0x3f) << 6) | (bytes[i++]! & 0x3f)
      );
    else {
      const c =
        ((b & 0x07) << 18) |
        ((bytes[i++]! & 0x3f) << 12) |
        ((bytes[i++]! & 0x3f) << 6) |
        (bytes[i++]! & 0x3f);
      codes.push(0xd800 + ((c - 0x10000) >> 10), 0xdc00 + ((c - 0x10000) & 0x3ff));
    }
  }
  return String.fromCharCode(...codes);
}

/**
 * Serialize heartbeat to JSON string then to UTF-8 bytes.
 * Returns size in bytes for validation.
 */
export function serializeHeartbeat(payload: HeartbeatPayload): { bytes: Uint8Array; size: number } {
  const wrapped: SerializedHeartbeat = { [HEARTBEAT_PAYLOAD_KEY]: payload };
  const json = JSON.stringify(wrapped);
  const bytes = utf8Encode(json);
  const size = bytes.byteLength;
  if (size >= HEARTBEAT_MAX_BYTES) {
    console.warn(`[Heartbeat] Payload size ${size} bytes exceeds ${HEARTBEAT_MAX_BYTES} limit`);
  }
  return { bytes, size };
}

/**
 * Deserialize bytes to HeartbeatPayload.
 * Returns null if invalid or wrong shape.
 */
export function deserializeHeartbeat(bytes: Uint8Array): HeartbeatPayload | null {
  try {
    const json = utf8Decode(bytes);
    const parsed = JSON.parse(json) as SerializedHeartbeat;
    const payload = parsed[HEARTBEAT_PAYLOAD_KEY];
    if (
      payload &&
      typeof payload.v === 'number' &&
      typeof payload.uid === 'string' &&
      typeof payload.ts === 'number' &&
      typeof payload.cap === 'number'
    ) {
      return payload as HeartbeatPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build a valid HeartbeatPayload (e.g. for Presence Manager).
 */
export function createHeartbeatPayload(
  uid: string,
  capabilities: number = 0
): HeartbeatPayload {
  return {
    v: HEARTBEAT_VERSION,
    uid,
    ts: Date.now(),
    cap: capabilities,
  };
}

/**
 * Check that serialized heartbeat is under 1KB (for tests / Property 10).
 */
export function isHeartbeatUnderLimit(payload: HeartbeatPayload): boolean {
  const { size } = serializeHeartbeat(payload);
  return size < HEARTBEAT_MAX_BYTES;
}
