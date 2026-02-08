/**
 * Transport Layer
 * Exports all transport-related interfaces and implementations
 */

export { ITransportRouter, TransportError, Unsubscribe } from './ITransportRouter';
export { SupabaseTransport } from './SupabaseTransport';
export { 
  calculateMessageSize, 
  compressMessage, 
  decompressMessage,
  splitIntoChunks,
  reassembleChunks,
  ChunkReassembler
} from './messageUtils';
export { 
  serializeHeartbeat,
  deserializeHeartbeat,
  createHeartbeatPayload,
  isHeartbeatUnderLimit
} from './heartbeat';
export type { MessageChunk, SerializedHeartbeat } from './types';
