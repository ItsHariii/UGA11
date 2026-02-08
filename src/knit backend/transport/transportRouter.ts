/**
 * Transport Router: routes messages by connectivity mode (online / offline / hybrid).
 * Integrates NetInfo, Supabase adapter, and Nearby adapter.
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import type { ConnectivityMode, TransportMessage, SendResult } from './types';
import type { MessageHandler, Unsubscribe } from './types';
import * as supabaseAdapter from './supabaseAdapter';
import { nearbyAdapter } from './nearbyAdapter';

/** Current connectivity mode (derived from net + optional mesh capability) */
let currentMode: ConnectivityMode = 'disconnected';

/** Subscribers for mode changes */
const modeChangeHandlers: Set<(mode: ConnectivityMode) => void> = new Set();

/** Subscribers for incoming messages (from any transport) */
const messageHandlers: Set<MessageHandler> = new Set();

/** Whether mesh (Nearby) is allowed by permissions; set externally by Permission Manager */
let canUseMesh = false;

/**
 * Set whether mesh is available (call from Permission Manager when permissions change).
 */
export function setCanUseMesh(value: boolean): void {
  canUseMesh = value;
  updateModeFromNetInfo(null);
}

/**
 * Derive connectivity mode from NetInfo and canUseMesh.
 */
function deriveMode(isConnected: boolean): ConnectivityMode {
  if (isConnected && canUseMesh) return 'hybrid';
  if (isConnected) return 'online';
  if (canUseMesh) return 'offline';
  return 'disconnected';
}

function updateModeFromNetInfo(state: NetInfoState | null): void {
  const isConnected = state?.isConnected ?? false;
  const next = deriveMode(isConnected);
  if (next !== currentMode) {
    currentMode = next;
    modeChangeHandlers.forEach((h) => h(next));
  }
}

/**
 * Get current connectivity mode.
 */
export function getMode(): ConnectivityMode {
  return currentMode;
}

/**
 * Send a message via the appropriate transport(s) per current mode.
 * Online → Supabase only; Offline → Nearby only; Hybrid → both.
 */
export async function send(message: TransportMessage): Promise<SendResult> {
  const mode = getMode();
  const results: SendResult[] = [];

  if (mode === 'disconnected') {
    return { success: false, error: 'No transport available (disconnected)' };
  }

  const jsonString = JSON.stringify({ type: message.type, payload: message.payload });

  if (mode === 'online' || mode === 'hybrid') {
    try {
      await sendViaSupabase(message);
      results.push({ success: true });
    } catch (e) {
      results.push({ success: false, error: String(e) });
    }
  }

  if (mode === 'offline' || mode === 'hybrid') {
    try {
      if (message.targetEndpoint) {
        await nearbyAdapter.sendPayload(message.targetEndpoint, jsonString);
      } else {
        await nearbyAdapter.broadcastPayload(jsonString);
      }
      results.push({ success: true });
    } catch (e) {
      results.push({ success: false, error: String(e) });
    }
  }

  const allOk = results.every((r) => r.success);
  const firstError = results.find((r) => !r.success)?.error;
  return { success: allOk, error: allOk ? undefined : firstError };
}

/**
 * Route to Supabase by message type (share_post → createPost; interest_ack → sendInterest; etc.).
 */
async function sendViaSupabase(message: TransportMessage): Promise<void> {
  switch (message.type) {
    case 'share_post': {
      const post = message.payload as Parameters<typeof supabaseAdapter.createPost>[0] & {
        id?: string;
        source?: string;
      };
      await supabaseAdapter.createPost({
        authorId: post.authorId,
        authorIdentifier: post.authorIdentifier,
        title: post.title,
        description: post.description ?? '',
        riskTier: post.riskTier,
        createdAt: post.createdAt,
        expiresAt: post.expiresAt,
        location: post.location,
      });
      break;
    }
    case 'interest_ack': {
      const ack = message.payload as { postId: string; [key: string]: unknown };
      await supabaseAdapter.sendInterest(ack.postId, ack as Parameters<typeof supabaseAdapter.sendInterest>[1]);
      break;
    }
    case 'interest_response': {
      const res = message.payload as { interestId: string; [key: string]: unknown };
      await supabaseAdapter.respondToInterest(
        res.interestId,
        res as Parameters<typeof supabaseAdapter.respondToInterest>[1]
      );
      break;
    }
    case 'heartbeat':
    case 'peer_discovery':
      break;
    default:
      console.warn('[TransportRouter] Unknown message type for Supabase:', (message as TransportMessage).type);
  }
}

/**
 * Subscribe to incoming messages (from Supabase realtime or Nearby payloads).
 */
export function subscribe(handler: MessageHandler): Unsubscribe {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

/**
 * Notify all message subscribers (called when we receive from Supabase or Nearby).
 */
export function notifyMessage(message: { type: string; payload: unknown; source: 'supabase' | 'nearby' }): void {
  messageHandlers.forEach((h) => h(message));
}

/**
 * Listen for connectivity mode changes.
 */
export function onModeChange(handler: (mode: ConnectivityMode) => void): Unsubscribe {
  modeChangeHandlers.add(handler);
  handler(currentMode);
  return () => modeChangeHandlers.delete(handler);
}

/**
 * Start the transport layer: NetInfo subscription and initial state.
 */
export function start(): Unsubscribe {
  const unsubNet = NetInfo.addEventListener((state) => updateModeFromNetInfo(state));
  NetInfo.fetch().then(updateModeFromNetInfo);

  return () => {
    unsubNet();
  };
}

/**
 * Wire Nearby payload events into the router (call once at app init).
 */
export function attachNearbyPayloadHandler(): Unsubscribe {
  return nearbyAdapter.onPayloadReceived((event) => {
    try {
      const parsed = JSON.parse(event.payload) as { type: string; payload: unknown };
      notifyMessage({
        type: parsed.type,
        payload: parsed.payload,
        source: 'nearby',
      });
    } catch {
      // Ignore malformed payloads
    }
  });
}
