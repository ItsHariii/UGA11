/**
 * Message utility functions for transport layer.
 * Handles message size calculation, compression, and chunking.
 */

import pako from 'pako';
import { MessageChunk } from './types';

/**
 * Calculate the byte size of a message string.
 * Uses TextEncoder to get accurate UTF-8 byte size.
 * 
 * @param message - The message string to measure
 * @returns The size in bytes
 * 
 * @example
 * const size = calculateMessageSize('Hello, world!');
 * console.log(size); // 13
 * 
 * const emojiSize = calculateMessageSize('Hello 👋');
 * console.log(emojiSize); // 10 (emoji takes 4 bytes in UTF-8)
 */
export function calculateMessageSize(message: string): number {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);
  return encoded.length;
}

/**
 * Compress a message string using deflate compression.
 * Converts the compressed data to base64 for safe transmission.
 * Should be used when message exceeds 512 bytes.
 * 
 * @param message - The message string to compress
 * @returns The compressed message as a base64 string
 * 
 * @example
 * const original = 'This is a long message that needs compression...';
 * const compressed = compressMessage(original);
 * const decompressed = decompressMessage(compressed);
 * console.log(original === decompressed); // true
 */
export function compressMessage(message: string): string {
  try {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Compress using deflate
    const compressed = pako.deflate(data);
    
    // Convert to base64 for safe transmission
    const base64 = btoa(String.fromCharCode(...compressed));
    
    return base64;
  } catch (error) {
    throw new Error(`Failed to compress message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decompress a message string that was compressed with compressMessage.
 * Expects a base64-encoded deflate-compressed string.
 * 
 * @param compressed - The compressed message as a base64 string
 * @returns The original decompressed message string
 * 
 * @example
 * const original = 'This is a long message that needs compression...';
 * const compressed = compressMessage(original);
 * const decompressed = decompressMessage(compressed);
 * console.log(original === decompressed); // true
 */
export function decompressMessage(compressed: string): string {
  try {
    // Convert base64 to Uint8Array
    const binaryString = atob(compressed);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Decompress using inflate
    const decompressed = pako.inflate(bytes);
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decompressed);
  } catch (error) {
    throw new Error(`Failed to decompress message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a unique message ID for chunking.
 * Uses timestamp and random value to ensure uniqueness.
 * 
 * @returns A unique message ID string
 */
function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate a simple checksum for data integrity verification.
 * Uses a basic hash function for lightweight validation.
 * 
 * @param data - The data string to checksum
 * @returns A checksum string
 */
function calculateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Split a message into chunks that fit within the specified size limit.
 * Each chunk includes metadata for reassembly: messageId, chunkIndex, totalChunks.
 * Optionally includes a checksum for data integrity verification.
 * 
 * @param message - The message string to split
 * @param maxSize - Maximum size in bytes for each chunk (default: 512)
 * @returns Array of MessageChunk objects
 * 
 * @example
 * const longMessage = 'a'.repeat(1000);
 * const chunks = splitIntoChunks(longMessage, 512);
 * console.log(chunks.length); // 2 or more chunks
 * console.log(chunks[0].chunkIndex); // 0
 * console.log(chunks[0].totalChunks); // total number of chunks
 * 
 * @throws {Error} If message is empty or maxSize is too small
 */
export function splitIntoChunks(message: string, maxSize: number = 512): MessageChunk[] {
  if (!message || message.length === 0) {
    throw new Error('Cannot split empty message into chunks');
  }
  
  if (maxSize < 100) {
    throw new Error('maxSize must be at least 100 bytes to accommodate chunk metadata');
  }
  
  const messageId = generateMessageId();
  const checksum = calculateChecksum(message);
  
  // Calculate overhead for chunk metadata
  // Format: {"messageId":"xxx","chunkIndex":0,"totalChunks":0,"data":"","checksum":"xxx"}
  // We need to reserve space for the JSON structure and metadata
  const metadataOverhead = 150; // Conservative estimate for JSON overhead
  const dataMaxSize = maxSize - metadataOverhead;
  
  if (dataMaxSize <= 0) {
    throw new Error('maxSize is too small to fit chunk metadata');
  }
  
  // Split message into data chunks
  const chunks: MessageChunk[] = [];
  let offset = 0;
  
  while (offset < message.length) {
    // Extract chunk data
    const chunkData = message.substring(offset, offset + dataMaxSize);
    
    // Create chunk with metadata
    const chunk: MessageChunk = {
      messageId,
      chunkIndex: chunks.length,
      totalChunks: 0, // Will be updated after we know total count
      data: chunkData,
      checksum,
    };
    
    chunks.push(chunk);
    offset += dataMaxSize;
  }
  
  // Update totalChunks in all chunks
  const totalChunks = chunks.length;
  chunks.forEach(chunk => {
    chunk.totalChunks = totalChunks;
  });
  
  // Verify each chunk fits within maxSize
  chunks.forEach((chunk, index) => {
    const chunkJson = JSON.stringify(chunk);
    const chunkSize = calculateMessageSize(chunkJson);
    if (chunkSize > maxSize) {
      throw new Error(
        `Chunk ${index} exceeds maxSize: ${chunkSize} > ${maxSize}. ` +
        `Try reducing dataMaxSize or increasing maxSize.`
      );
    }
  });
  
  return chunks;
}

/**
 * Reassemble message chunks back into the original message.
 * Validates chunk order, completeness, and data integrity.
 * 
 * @param chunks - Array of MessageChunk objects to reassemble
 * @returns The original message string
 * 
 * @example
 * const original = 'This is a long message that needs chunking';
 * const chunks = splitIntoChunks(original, 512);
 * const reassembled = reassembleChunks(chunks);
 * console.log(original === reassembled); // true
 * 
 * @throws {Error} If chunks are invalid, incomplete, or corrupted
 */
export function reassembleChunks(chunks: MessageChunk[]): string {
  if (!chunks || chunks.length === 0) {
    throw new Error('Cannot reassemble empty chunk array');
  }
  
  // Validate all chunks have the same messageId
  const messageId = chunks[0].messageId;
  const invalidChunk = chunks.find(chunk => chunk.messageId !== messageId);
  if (invalidChunk) {
    throw new Error(
      `Chunk messageId mismatch: expected ${messageId}, got ${invalidChunk.messageId}`
    );
  }
  
  // Validate all chunks have the same totalChunks
  const totalChunks = chunks[0].totalChunks;
  const mismatchChunk = chunks.find(chunk => chunk.totalChunks !== totalChunks);
  if (mismatchChunk) {
    throw new Error(
      `Chunk totalChunks mismatch: expected ${totalChunks}, got ${mismatchChunk.totalChunks}`
    );
  }
  
  // Validate we have all chunks
  if (chunks.length !== totalChunks) {
    throw new Error(
      `Incomplete chunks: expected ${totalChunks}, got ${chunks.length}`
    );
  }
  
  // Sort chunks by chunkIndex
  const sortedChunks = [...chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);
  
  // Validate chunk indices are sequential
  for (let i = 0; i < sortedChunks.length; i++) {
    if (sortedChunks[i].chunkIndex !== i) {
      throw new Error(
        `Missing or duplicate chunk: expected index ${i}, got ${sortedChunks[i].chunkIndex}`
      );
    }
  }
  
  // Reassemble message
  const reassembled = sortedChunks.map(chunk => chunk.data).join('');
  
  // Validate checksum if present
  const checksum = chunks[0].checksum;
  if (checksum) {
    const calculatedChecksum = calculateChecksum(reassembled);
    if (calculatedChecksum !== checksum) {
      throw new Error(
        `Checksum mismatch: expected ${checksum}, got ${calculatedChecksum}. ` +
        `Message may be corrupted.`
      );
    }
  }
  
  return reassembled;
}

/**
 * Chunk reassembly manager with timeout support.
 * Manages partial chunk collections and handles reassembly timeouts.
 */
export class ChunkReassembler {
  private partialMessages: Map<string, {
    chunks: MessageChunk[];
    timestamp: number;
  }> = new Map();
  
  private timeout: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  /**
   * Create a new chunk reassembler.
   * 
   * @param timeout - Timeout in milliseconds for incomplete messages (default: 30000ms = 30s)
   */
  constructor(timeout: number = 30000) {
    this.timeout = timeout;
    this.startCleanup();
  }
  
  /**
   * Add a chunk to the reassembler.
   * Returns the complete message if all chunks are received, or null if still waiting.
   * 
   * @param chunk - The chunk to add
   * @returns The complete message if all chunks received, null otherwise
   * 
   * @throws {Error} If chunk is invalid or reassembly fails
   */
  addChunk(chunk: MessageChunk): string | null {
    const { messageId } = chunk;
    
    // Get or create partial message entry
    let entry = this.partialMessages.get(messageId);
    if (!entry) {
      entry = {
        chunks: [],
        timestamp: Date.now(),
      };
      this.partialMessages.set(messageId, entry);
    }
    
    // Add chunk if not already present
    const existingChunk = entry.chunks.find(c => c.chunkIndex === chunk.chunkIndex);
    if (!existingChunk) {
      entry.chunks.push(chunk);
    }
    
    // Check if we have all chunks
    if (entry.chunks.length === chunk.totalChunks) {
      // Remove from partial messages
      this.partialMessages.delete(messageId);
      
      // Reassemble and return
      return reassembleChunks(entry.chunks);
    }
    
    // Still waiting for more chunks
    return null;
  }
  
  /**
   * Start periodic cleanup of timed-out partial messages.
   */
  private startCleanup(): void {
    // Run cleanup every 10 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10000);
  }
  
  /**
   * Clean up timed-out partial messages.
   * Removes any partial messages that have exceeded the timeout.
   */
  private cleanup(): void {
    const now = Date.now();
    const timedOut: string[] = [];
    
    this.partialMessages.forEach((entry, messageId) => {
      if (now - entry.timestamp > this.timeout) {
        timedOut.push(messageId);
      }
    });
    
    timedOut.forEach(messageId => {
      this.partialMessages.delete(messageId);
    });
    
    if (timedOut.length > 0) {
      console.warn(
        `[ChunkReassembler] Cleaned up ${timedOut.length} timed-out partial messages`
      );
    }
  }
  
  /**
   * Stop the cleanup interval and clear all partial messages.
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.partialMessages.clear();
  }
  
  /**
   * Get the number of partial messages currently being tracked.
   */
  getPartialMessageCount(): number {
    return this.partialMessages.size;
  }
  
  /**
   * Clear all partial messages.
   */
  clear(): void {
    this.partialMessages.clear();
  }
}
