/**
 * Tests for message utility functions.
 * Includes both unit tests and property-based tests.
 */

import fc from 'fast-check';
import { 
  calculateMessageSize, 
  compressMessage, 
  decompressMessage,
  splitIntoChunks,
  reassembleChunks,
  ChunkReassembler
} from './messageUtils';

describe('messageUtils', () => {
  describe('calculateMessageSize', () => {
    // Unit Tests - Specific examples and edge cases
    describe('unit tests', () => {
      it('should return 0 for empty string', () => {
        expect(calculateMessageSize('')).toBe(0);
      });

      it('should calculate size for ASCII characters', () => {
        expect(calculateMessageSize('Hello')).toBe(5);
        expect(calculateMessageSize('Hello, world!')).toBe(13);
      });

      it('should calculate size for multi-byte UTF-8 characters', () => {
        // Emoji takes 4 bytes in UTF-8
        expect(calculateMessageSize('👋')).toBe(4);
        expect(calculateMessageSize('Hello 👋')).toBe(10); // 6 ASCII + 4 emoji
      });

      it('should calculate size for various Unicode characters', () => {
        // Latin extended characters (2 bytes)
        expect(calculateMessageSize('café')).toBe(5); // c(1) + a(1) + f(1) + é(2)
        
        // Chinese characters (3 bytes each)
        expect(calculateMessageSize('你好')).toBe(6); // 3 + 3
        
        // Mixed content
        expect(calculateMessageSize('Hello 你好 👋')).toBe(17); // 6 + 6 + 4 + 1
      });

      it('should handle newlines and special characters', () => {
        expect(calculateMessageSize('\n')).toBe(1);
        expect(calculateMessageSize('\r\n')).toBe(2);
        expect(calculateMessageSize('\t')).toBe(1);
        expect(calculateMessageSize('Line1\nLine2')).toBe(11);
      });

      it('should handle JSON strings', () => {
        const json = JSON.stringify({ type: 'test', payload: { id: 1 } });
        const size = calculateMessageSize(json);
        expect(size).toBeGreaterThan(0);
        expect(size).toBe(new TextEncoder().encode(json).length);
      });

      it('should handle long strings', () => {
        const longString = 'a'.repeat(1000);
        expect(calculateMessageSize(longString)).toBe(1000);
      });

      it('should handle strings with mixed content', () => {
        const mixed = 'ASCII text with émojis 🎉 and 中文字符';
        const encoder = new TextEncoder();
        const expected = encoder.encode(mixed).length;
        expect(calculateMessageSize(mixed)).toBe(expected);
      });
    });

    // Property-Based Tests
    describe('property-based tests', () => {
      it('Feature: knit-backend-integration, Property: Size calculation should match TextEncoder for all strings', () => {
        fc.assert(
          fc.property(
            fc.string(),
            (str) => {
              const encoder = new TextEncoder();
              const expected = encoder.encode(str).length;
              const actual = calculateMessageSize(str);
              expect(actual).toBe(expected);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Size should be non-negative for all strings', () => {
        fc.assert(
          fc.property(
            fc.string(),
            (str) => {
              const size = calculateMessageSize(str);
              expect(size).toBeGreaterThanOrEqual(0);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Empty string should always have size 0', () => {
        fc.assert(
          fc.property(
            fc.constant(''),
            (str) => {
              expect(calculateMessageSize(str)).toBe(0);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Concatenated strings should have combined size', () => {
        fc.assert(
          fc.property(
            fc.string(),
            fc.string(),
            (str1, str2) => {
              const size1 = calculateMessageSize(str1);
              const size2 = calculateMessageSize(str2);
              const combinedSize = calculateMessageSize(str1 + str2);
              expect(combinedSize).toBe(size1 + size2);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Size should be consistent for repeated calls', () => {
        fc.assert(
          fc.property(
            fc.string(),
            (str) => {
              const size1 = calculateMessageSize(str);
              const size2 = calculateMessageSize(str);
              expect(size1).toBe(size2);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: ASCII strings should have size equal to length', () => {
        fc.assert(
          fc.property(
            fc.array(fc.integer({ min: 32, max: 126 })).map(arr => arr.map(n => String.fromCharCode(n)).join('')),
            (asciiStr) => {
              const size = calculateMessageSize(asciiStr);
              expect(size).toBe(asciiStr.length);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Size should handle Unicode correctly', () => {
        fc.assert(
          fc.property(
            fc.string(),
            (unicodeStr) => {
              const size = calculateMessageSize(unicodeStr);
              const encoder = new TextEncoder();
              const expected = encoder.encode(unicodeStr).length;
              expect(size).toBe(expected);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });

  describe('compressMessage and decompressMessage', () => {
    // Unit Tests - Specific examples and edge cases
    describe('unit tests', () => {
      it('should compress and decompress empty string', () => {
        const original = '';
        const compressed = compressMessage(original);
        const decompressed = decompressMessage(compressed);
        expect(decompressed).toBe(original);
      });

      it('should compress and decompress simple ASCII text', () => {
        const original = 'Hello, world!';
        const compressed = compressMessage(original);
        const decompressed = decompressMessage(compressed);
        expect(decompressed).toBe(original);
      });

      it('should compress and decompress text with emojis', () => {
        const original = 'Hello 👋 World 🌍';
        const compressed = compressMessage(original);
        const decompressed = decompressMessage(compressed);
        expect(decompressed).toBe(original);
      });

      it('should compress and decompress Unicode text', () => {
        const original = 'café 你好 مرحبا';
        const compressed = compressMessage(original);
        const decompressed = decompressMessage(compressed);
        expect(decompressed).toBe(original);
      });

      it('should compress and decompress JSON strings', () => {
        const original = JSON.stringify({
          type: 'share_post',
          payload: {
            id: '123',
            title: 'Test Post',
            description: 'This is a test post with some content',
            riskTier: 'low',
          },
        });
        const compressed = compressMessage(original);
        const decompressed = decompressMessage(compressed);
        expect(decompressed).toBe(original);
      });

      it('should compress and decompress long repetitive strings', () => {
        const original = 'a'.repeat(1000);
        const compressed = compressMessage(original);
        const decompressed = decompressMessage(compressed);
        expect(decompressed).toBe(original);
      });

      it('should reduce size for repetitive content', () => {
        const original = 'This is a test. '.repeat(50); // ~800 bytes
        const compressed = compressMessage(original);
        const compressedSize = calculateMessageSize(compressed);
        const originalSize = calculateMessageSize(original);
        
        // Compression should reduce size significantly for repetitive content
        expect(compressedSize).toBeLessThan(originalSize);
      });

      it('should handle newlines and special characters', () => {
        const original = 'Line1\nLine2\r\nLine3\tTabbed';
        const compressed = compressMessage(original);
        const decompressed = decompressMessage(compressed);
        expect(decompressed).toBe(original);
      });

      it('should handle messages exceeding 512 bytes', () => {
        const original = 'This is a long message that exceeds 512 bytes. '.repeat(20); // ~940 bytes
        const originalSize = calculateMessageSize(original);
        expect(originalSize).toBeGreaterThan(512);
        
        const compressed = compressMessage(original);
        const decompressed = decompressMessage(compressed);
        expect(decompressed).toBe(original);
      });

      it('should throw error for invalid compressed data', () => {
        expect(() => decompressMessage('invalid-base64-!@#$')).toThrow();
      });

      it('should throw error for corrupted compressed data', () => {
        const original = 'Hello, world!';
        const compressed = compressMessage(original);
        const corrupted = compressed.slice(0, -5) + 'XXXXX'; // Corrupt the end
        expect(() => decompressMessage(corrupted)).toThrow();
      });
    });

    // Property-Based Tests
    describe('property-based tests', () => {
      it('Feature: knit-backend-integration, Property 22: Message Serialization Round-Trip - compression should preserve all content', () => {
        fc.assert(
          fc.property(
            fc.string(),
            (original) => {
              const compressed = compressMessage(original);
              const decompressed = decompressMessage(compressed);
              expect(decompressed).toBe(original);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Compressed output should be valid base64', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1 }),
            (original) => {
              const compressed = compressMessage(original);
              // Base64 should only contain valid characters
              expect(compressed).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Compression should be deterministic', () => {
        fc.assert(
          fc.property(
            fc.string(),
            (original) => {
              const compressed1 = compressMessage(original);
              const compressed2 = compressMessage(original);
              expect(compressed1).toBe(compressed2);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Decompression should be deterministic', () => {
        fc.assert(
          fc.property(
            fc.string(),
            (original) => {
              const compressed = compressMessage(original);
              const decompressed1 = decompressMessage(compressed);
              const decompressed2 = decompressMessage(compressed);
              expect(decompressed1).toBe(decompressed2);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Compression should handle all Unicode characters', () => {
        fc.assert(
          fc.property(
            fc.string(),
            (original) => {
              const compressed = compressMessage(original);
              const decompressed = decompressMessage(compressed);
              expect(decompressed).toBe(original);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Compression should handle JSON structures', () => {
        fc.assert(
          fc.property(
            fc.record({
              type: fc.constantFrom('share_post', 'interest_ack', 'heartbeat'),
              payload: fc.jsonValue(),
              timestamp: fc.integer({ min: 0 }),
            }),
            (obj) => {
              const original = JSON.stringify(obj);
              const compressed = compressMessage(original);
              const decompressed = decompressMessage(compressed);
              expect(decompressed).toBe(original);
              // JSON round-trip comparison (JSON.stringify removes undefined, so we compare strings)
              expect(JSON.stringify(JSON.parse(decompressed))).toBe(original);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Compression should reduce size for repetitive content', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 10 }),
            fc.integer({ min: 10, max: 100 }),
            (pattern, repetitions) => {
              const original = pattern.repeat(repetitions);
              const originalSize = calculateMessageSize(original);
              
              // Only test if original is large enough to benefit from compression
              if (originalSize > 100) {
                const compressed = compressMessage(original);
                const compressedSize = calculateMessageSize(compressed);
                
                // Compression should reduce size for repetitive content
                expect(compressedSize).toBeLessThan(originalSize);
              }
            }
          ),
          { numRuns: 50 }
        );
      });

      it('Feature: knit-backend-integration, Property 4: Messages exceeding 512 bytes should compress successfully', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 513 }),
            (original) => {
              const originalSize = calculateMessageSize(original);
              expect(originalSize).toBeGreaterThan(512);
              
              const compressed = compressMessage(original);
              const decompressed = decompressMessage(compressed);
              expect(decompressed).toBe(original);
            }
          ),
          { numRuns: 50 }
        );
      });
    });
  });

  describe('splitIntoChunks and reassembleChunks', () => {
    // Unit Tests - Specific examples and edge cases
    describe('unit tests', () => {
      it('should split and reassemble a short message', () => {
        const original = 'Hello, world!';
        const chunks = splitIntoChunks(original, 512);
        expect(chunks.length).toBe(1);
        expect(chunks[0].chunkIndex).toBe(0);
        expect(chunks[0].totalChunks).toBe(1);
        
        const reassembled = reassembleChunks(chunks);
        expect(reassembled).toBe(original);
      });

      it('should split a long message into multiple chunks', () => {
        const original = 'a'.repeat(1000);
        const chunks = splitIntoChunks(original, 512);
        expect(chunks.length).toBeGreaterThan(1);
        
        // Verify chunk metadata
        chunks.forEach((chunk, index) => {
          expect(chunk.chunkIndex).toBe(index);
          expect(chunk.totalChunks).toBe(chunks.length);
          expect(chunk.messageId).toBe(chunks[0].messageId);
        });
        
        const reassembled = reassembleChunks(chunks);
        expect(reassembled).toBe(original);
      });

      it('should include checksum in chunks', () => {
        const original = 'Test message with checksum';
        const chunks = splitIntoChunks(original, 512);
        
        chunks.forEach(chunk => {
          expect(chunk.checksum).toBeDefined();
          expect(typeof chunk.checksum).toBe('string');
        });
      });

      it('should handle messages with Unicode characters', () => {
        const original = 'Hello 👋 World 🌍 café 你好';
        const chunks = splitIntoChunks(original, 512);
        const reassembled = reassembleChunks(chunks);
        expect(reassembled).toBe(original);
      });

      it('should handle JSON messages', () => {
        const original = JSON.stringify({
          type: 'share_post',
          payload: {
            id: '123',
            title: 'Test Post',
            description: 'This is a test post with some content that might be long',
          },
        });
        const chunks = splitIntoChunks(original, 512);
        const reassembled = reassembleChunks(chunks);
        expect(reassembled).toBe(original);
      });

      it('should respect maxSize parameter', () => {
        const original = 'a'.repeat(1000);
        const maxSize = 300;
        const chunks = splitIntoChunks(original, maxSize);
        
        // Verify each chunk fits within maxSize
        chunks.forEach(chunk => {
          const chunkJson = JSON.stringify(chunk);
          const chunkSize = calculateMessageSize(chunkJson);
          expect(chunkSize).toBeLessThanOrEqual(maxSize);
        });
      });

      it('should throw error for empty message', () => {
        expect(() => splitIntoChunks('', 512)).toThrow('Cannot split empty message');
      });

      it('should throw error for maxSize too small', () => {
        expect(() => splitIntoChunks('Hello', 50)).toThrow('maxSize must be at least 100 bytes');
      });

      it('should throw error for empty chunk array', () => {
        expect(() => reassembleChunks([])).toThrow('Cannot reassemble empty chunk array');
      });

      it('should throw error for mismatched messageId', () => {
        const original = 'a'.repeat(1000); // Create multiple chunks
        const chunks = splitIntoChunks(original, 512);
        chunks[0].messageId = 'different-id';
        expect(() => reassembleChunks(chunks)).toThrow('messageId mismatch');
      });

      it('should throw error for incomplete chunks', () => {
        const original = 'a'.repeat(1000);
        const chunks = splitIntoChunks(original, 512);
        const incomplete = chunks.slice(0, -1); // Remove last chunk
        expect(() => reassembleChunks(incomplete)).toThrow('Incomplete chunks');
      });

      it('should throw error for corrupted checksum', () => {
        const chunks = splitIntoChunks('Hello, world!', 512);
        chunks[0].checksum = 'invalid-checksum';
        expect(() => reassembleChunks(chunks)).toThrow('Checksum mismatch');
      });

      it('should handle chunks received out of order', () => {
        const original = 'a'.repeat(1000);
        const chunks = splitIntoChunks(original, 512);
        
        // Shuffle chunks
        const shuffled = [...chunks].sort(() => Math.random() - 0.5);
        
        const reassembled = reassembleChunks(shuffled);
        expect(reassembled).toBe(original);
      });

      it('should handle very long messages', () => {
        const original = 'This is a test message. '.repeat(100); // ~2400 bytes
        const chunks = splitIntoChunks(original, 512);
        expect(chunks.length).toBeGreaterThan(4);
        
        const reassembled = reassembleChunks(chunks);
        expect(reassembled).toBe(original);
      });

      it('should handle messages exactly at chunk boundary', () => {
        // Create a message that fits exactly in one chunk after metadata
        const original = 'a'.repeat(350);
        const chunks = splitIntoChunks(original, 512);
        const reassembled = reassembleChunks(chunks);
        expect(reassembled).toBe(original);
      });

      it('should handle messages with newlines and special characters', () => {
        const original = 'Line1\nLine2\r\nLine3\tTabbed\n\n\nMultiple newlines';
        const chunks = splitIntoChunks(original, 512);
        const reassembled = reassembleChunks(chunks);
        expect(reassembled).toBe(original);
      });
    });

    // Property-Based Tests
    describe('property-based tests', () => {
      it('Feature: knit-backend-integration, Property 5: Message Chunk Round-Trip - reassembling chunks should produce original message', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            fc.integer({ min: 200, max: 1000 }),
            (message, maxSize) => {
              const chunks = splitIntoChunks(message, maxSize);
              const reassembled = reassembleChunks(chunks);
              expect(reassembled).toBe(message);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: All chunks should have same messageId', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            (message) => {
              const chunks = splitIntoChunks(message, 512);
              const messageId = chunks[0].messageId;
              chunks.forEach(chunk => {
                expect(chunk.messageId).toBe(messageId);
              });
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: All chunks should have same totalChunks', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            (message) => {
              const chunks = splitIntoChunks(message, 512);
              const totalChunks = chunks.length;
              chunks.forEach(chunk => {
                expect(chunk.totalChunks).toBe(totalChunks);
              });
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Chunk indices should be sequential', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            (message) => {
              const chunks = splitIntoChunks(message, 512);
              chunks.forEach((chunk, index) => {
                expect(chunk.chunkIndex).toBe(index);
              });
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property 4: Each chunk should fit within maxSize', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            fc.integer({ min: 200, max: 1000 }),
            (message, maxSize) => {
              const chunks = splitIntoChunks(message, maxSize);
              chunks.forEach(chunk => {
                const chunkJson = JSON.stringify(chunk);
                const chunkSize = calculateMessageSize(chunkJson);
                expect(chunkSize).toBeLessThanOrEqual(maxSize);
              });
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Reassembly should work with shuffled chunks', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            (message) => {
              const chunks = splitIntoChunks(message, 512);
              // Shuffle chunks
              const shuffled = [...chunks].sort(() => Math.random() - 0.5);
              const reassembled = reassembleChunks(shuffled);
              expect(reassembled).toBe(message);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: All chunks should have checksum', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            (message) => {
              const chunks = splitIntoChunks(message, 512);
              chunks.forEach(chunk => {
                expect(chunk.checksum).toBeDefined();
                expect(typeof chunk.checksum).toBe('string');
                expect(chunk.checksum!.length).toBeGreaterThan(0);
              });
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Checksum should be consistent across chunks', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            (message) => {
              const chunks = splitIntoChunks(message, 512);
              const checksum = chunks[0].checksum;
              chunks.forEach(chunk => {
                expect(chunk.checksum).toBe(checksum);
              });
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Splitting should handle all Unicode characters', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 2000 }),
            (message) => {
              const chunks = splitIntoChunks(message, 512);
              const reassembled = reassembleChunks(chunks);
              expect(reassembled).toBe(message);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: Number of chunks should be deterministic', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            fc.integer({ min: 200, max: 1000 }),
            (message, maxSize) => {
              const chunks1 = splitIntoChunks(message, maxSize);
              const chunks2 = splitIntoChunks(message, maxSize);
              expect(chunks1.length).toBe(chunks2.length);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });

  describe('ChunkReassembler', () => {
    // Unit Tests
    describe('unit tests', () => {
      it('should reassemble chunks as they arrive', () => {
        const reassembler = new ChunkReassembler();
        const original = 'a'.repeat(1000);
        const chunks = splitIntoChunks(original, 512);
        
        // Add chunks one by one
        for (let i = 0; i < chunks.length - 1; i++) {
          const result = reassembler.addChunk(chunks[i]);
          expect(result).toBeNull(); // Not complete yet
        }
        
        // Add last chunk
        const result = reassembler.addChunk(chunks[chunks.length - 1]);
        expect(result).toBe(original);
        
        reassembler.destroy();
      });

      it('should handle chunks arriving out of order', () => {
        const reassembler = new ChunkReassembler();
        const original = 'a'.repeat(1000);
        const chunks = splitIntoChunks(original, 512);
        
        // Shuffle chunks
        const shuffled = [...chunks].sort(() => Math.random() - 0.5);
        
        // Add all but last
        for (let i = 0; i < shuffled.length - 1; i++) {
          const result = reassembler.addChunk(shuffled[i]);
          expect(result).toBeNull();
        }
        
        // Add last chunk
        const result = reassembler.addChunk(shuffled[shuffled.length - 1]);
        expect(result).toBe(original);
        
        reassembler.destroy();
      });

      it('should handle duplicate chunks gracefully', () => {
        const reassembler = new ChunkReassembler();
        const original = 'Hello, world!';
        const chunks = splitIntoChunks(original, 512);
        
        // Add same chunk multiple times
        reassembler.addChunk(chunks[0]);
        reassembler.addChunk(chunks[0]);
        reassembler.addChunk(chunks[0]);
        
        const result = reassembler.addChunk(chunks[0]);
        expect(result).toBe(original);
        
        reassembler.destroy();
      });

      it('should track partial message count', () => {
        const reassembler = new ChunkReassembler();
        const original1 = 'a'.repeat(1000);
        const original2 = 'b'.repeat(1000);
        const chunks1 = splitIntoChunks(original1, 512);
        const chunks2 = splitIntoChunks(original2, 512);
        
        expect(reassembler.getPartialMessageCount()).toBe(0);
        
        reassembler.addChunk(chunks1[0]);
        expect(reassembler.getPartialMessageCount()).toBe(1);
        
        reassembler.addChunk(chunks2[0]);
        expect(reassembler.getPartialMessageCount()).toBe(2);
        
        reassembler.destroy();
      });

      it('should clear partial messages', () => {
        const reassembler = new ChunkReassembler();
        const original = 'a'.repeat(1000);
        const chunks = splitIntoChunks(original, 512);
        
        reassembler.addChunk(chunks[0]);
        expect(reassembler.getPartialMessageCount()).toBe(1);
        
        reassembler.clear();
        expect(reassembler.getPartialMessageCount()).toBe(0);
        
        reassembler.destroy();
      });

      it('should handle multiple concurrent messages', () => {
        const reassembler = new ChunkReassembler();
        const original1 = 'Message 1: ' + 'a'.repeat(1000);
        const original2 = 'Message 2: ' + 'b'.repeat(1000);
        const chunks1 = splitIntoChunks(original1, 512);
        const chunks2 = splitIntoChunks(original2, 512);
        
        // Interleave chunks from both messages
        reassembler.addChunk(chunks1[0]);
        reassembler.addChunk(chunks2[0]);
        reassembler.addChunk(chunks1[1]);
        reassembler.addChunk(chunks2[1]);
        
        // Complete first message
        for (let i = 2; i < chunks1.length; i++) {
          const result = reassembler.addChunk(chunks1[i]);
          if (i === chunks1.length - 1) {
            expect(result).toBe(original1);
          } else {
            expect(result).toBeNull();
          }
        }
        
        // Complete second message
        for (let i = 2; i < chunks2.length; i++) {
          const result = reassembler.addChunk(chunks2[i]);
          if (i === chunks2.length - 1) {
            expect(result).toBe(original2);
          } else {
            expect(result).toBeNull();
          }
        }
        
        reassembler.destroy();
      });

      it('should clean up after destroy', () => {
        const reassembler = new ChunkReassembler();
        const original = 'a'.repeat(1000);
        const chunks = splitIntoChunks(original, 512);
        
        reassembler.addChunk(chunks[0]);
        expect(reassembler.getPartialMessageCount()).toBe(1);
        
        reassembler.destroy();
        expect(reassembler.getPartialMessageCount()).toBe(0);
      });
    });

    // Property-Based Tests
    describe('property-based tests', () => {
      it('Feature: knit-backend-integration, Property: ChunkReassembler should handle any chunk order', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 5000 }),
            (message) => {
              const reassembler = new ChunkReassembler();
              const chunks = splitIntoChunks(message, 512);
              
              // Shuffle chunks
              const shuffled = [...chunks].sort(() => Math.random() - 0.5);
              
              let result: string | null = null;
              for (const chunk of shuffled) {
                result = reassembler.addChunk(chunk);
              }
              
              expect(result).toBe(message);
              reassembler.destroy();
            }
          ),
          { numRuns: 100 }
        );
      });

      it('Feature: knit-backend-integration, Property: ChunkReassembler should handle duplicate chunks', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 2000 }),
            (message) => {
              const reassembler = new ChunkReassembler();
              const chunks = splitIntoChunks(message, 512);
              
              // Add each chunk multiple times
              let result: string | null = null;
              for (const chunk of chunks) {
                reassembler.addChunk(chunk);
                reassembler.addChunk(chunk); // Duplicate
                result = reassembler.addChunk(chunk); // Triplicate
              }
              
              expect(result).toBe(message);
              reassembler.destroy();
            }
          ),
          { numRuns: 50 }
        );
      });

      it('Feature: knit-backend-integration, Property: ChunkReassembler should handle multiple messages', () => {
        fc.assert(
          fc.property(
            fc.array(fc.string({ minLength: 1, maxLength: 1000 }), { minLength: 1, maxLength: 5 }),
            (messages) => {
              const reassembler = new ChunkReassembler();
              const allChunks = messages.map(msg => splitIntoChunks(msg, 512));
              
              // Interleave all chunks
              const maxChunks = Math.max(...allChunks.map(chunks => chunks.length));
              const results: (string | null)[] = new Array(messages.length).fill(null);
              
              for (let i = 0; i < maxChunks; i++) {
                allChunks.forEach((chunks, msgIndex) => {
                  if (i < chunks.length) {
                    const result = reassembler.addChunk(chunks[i]);
                    if (result !== null) {
                      results[msgIndex] = result;
                    }
                  }
                });
              }
              
              // Verify all messages were reassembled correctly
              results.forEach((result, index) => {
                expect(result).toBe(messages[index]);
              });
              
              reassembler.destroy();
            }
          ),
          { numRuns: 50 }
        );
      });
    });
  });
});
