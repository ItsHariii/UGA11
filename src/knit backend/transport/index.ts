/**
 * Transport layer: Supabase adapter, Nearby adapter, Transport Router, Heartbeat.
 */

export { supabase } from '../lib/supabase';
export * from './constants';
export * from './types';
export * from './heartbeat';
export * from './supabaseAdapter';
export { nearbyAdapter, isNearbyAvailable, NEARBY_SERVICE_ID } from './nearbyAdapter';
export type { PayloadReceivedEvent, EndpointFoundEvent, EndpointLostEvent } from './nearbyAdapter';
export {
  getMode,
  send,
  subscribe,
  onModeChange,
  start,
  setCanUseMesh,
  notifyMessage,
  attachNearbyPayloadHandler,
} from './transportRouter';
