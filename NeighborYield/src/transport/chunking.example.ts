/**
 * Example usage of message chunking functionality.
 * 
 * This demonstrates how to split large messages into chunks for Bluetooth transmission
 * and reassemble them on the receiving end.
 */

import { 
  splitIntoChunks, 
  reassembleChunks, 
  ChunkReassembler,
  calculateMessageSize,
  compressMessage,
  type MessageChunk 
} from './messageUtils';

/**
 * Example 1: Basic chunking and reassembly
 */
function basicChunkingExample() {
  // Create a large message
  const largeMessage = JSON.stringify({
    type: 'share_post',
    payload: {
      id: '123',
      title: 'Large Post',
      description: 'This is a very long description that exceeds 512 bytes...'.repeat(20),
      riskTier: 'low',
    },
  });

  console.log('Original message size:', calculateMessageSize(largeMessage), 'bytes');

  // Split into chunks (512 bytes max per chunk)
  const chunks = splitIntoChunks(largeMessage, 512);
  console.log('Split into', chunks.length, 'chunks');

  // Each chunk can now be transmitted via Bluetooth
  chunks.forEach((chunk, index) => {
    console.log(`Chunk ${index}:`, {
      messageId: chunk.messageId,
      chunkIndex: chunk.chunkIndex,
      totalChunks: chunk.totalChunks,
      dataSize: calculateMessageSize(chunk.data),
      checksum: chunk.checksum,
    });
  });

  // Reassemble on the receiving end
  const reassembled = reassembleChunks(chunks);
  console.log('Reassembled successfully:', reassembled === largeMessage);
}

/**
 * Example 2: Chunking with compression
 */
function chunkingWithCompressionExample() {
  // Create a large message
  const largeMessage = 'This is a repetitive message. '.repeat(100);
  const originalSize = calculateMessageSize(largeMessage);
  console.log('Original size:', originalSize, 'bytes');

  // Try compression first
  const compressed = compressMessage(largeMessage);
  const compressedSize = calculateMessageSize(compressed);
  console.log('Compressed size:', compressedSize, 'bytes');

  // If still too large, chunk it
  if (compressedSize > 512) {
    const chunks = splitIntoChunks(compressed, 512);
    console.log('Compressed message split into', chunks.length, 'chunks');
    
    // On receiving end: reassemble then decompress
    const reassembledCompressed = reassembleChunks(chunks);
    // Note: You would then call decompressMessage(reassembledCompressed)
  } else {
    console.log('Compressed message fits in single chunk');
  }
}

/**
 * Example 3: Using ChunkReassembler for streaming chunks
 */
function streamingChunksExample() {
  // Create reassembler with 30-second timeout
  const reassembler = new ChunkReassembler(30000);

  // Simulate receiving chunks over time
  const message1 = 'First message: ' + 'a'.repeat(1000);
  const message2 = 'Second message: ' + 'b'.repeat(1000);
  
  const chunks1 = splitIntoChunks(message1, 512);
  const chunks2 = splitIntoChunks(message2, 512);

  console.log('Simulating chunk arrival...');

  // Chunks arrive out of order and interleaved
  const result1 = reassembler.addChunk(chunks1[1]); // Second chunk first
  console.log('After chunk 1[1]:', result1); // null - incomplete

  const result2 = reassembler.addChunk(chunks2[0]); // Different message
  console.log('After chunk 2[0]:', result2); // null - incomplete

  const result3 = reassembler.addChunk(chunks1[0]); // First chunk
  console.log('After chunk 1[0]:', result3); // null - still incomplete

  const result4 = reassembler.addChunk(chunks1[2]); // Last chunk
  console.log('After chunk 1[2]:', result4); // Complete! Returns message1

  // Check partial message count
  console.log('Partial messages:', reassembler.getPartialMessageCount()); // 1 (message2)

  // Complete second message
  for (let i = 1; i < chunks2.length; i++) {
    const result = reassembler.addChunk(chunks2[i]);
    if (result) {
      console.log('Message 2 complete:', result === message2);
    }
  }

  // Clean up
  reassembler.destroy();
}

/**
 * Example 4: Error handling
 */
function errorHandlingExample() {
  try {
    // Empty message
    splitIntoChunks('', 512);
  } catch (error) {
    console.log('Error:', (error as Error).message);
    // "Cannot split empty message into chunks"
  }

  try {
    // maxSize too small
    splitIntoChunks('Hello', 50);
  } catch (error) {
    console.log('Error:', (error as Error).message);
    // "maxSize must be at least 100 bytes to accommodate chunk metadata"
  }

  try {
    // Incomplete chunks
    const chunks = splitIntoChunks('a'.repeat(1000), 512);
    const incomplete = chunks.slice(0, -1); // Remove last chunk
    reassembleChunks(incomplete);
  } catch (error) {
    console.log('Error:', (error as Error).message);
    // "Incomplete chunks: expected X, got Y"
  }

  try {
    // Corrupted checksum
    const chunks = splitIntoChunks('Hello, world!', 512);
    chunks[0].checksum = 'invalid';
    reassembleChunks(chunks);
  } catch (error) {
    console.log('Error:', (error as Error).message);
    // "Checksum mismatch: expected X, got Y. Message may be corrupted."
  }
}

/**
 * Example 5: Real-world usage with Nearby Connections
 */
async function nearbyConnectionsExample() {
  // Assume we have a nearbyAdapter instance
  // import { nearbyAdapter } from './nearbyAdapter';

  // Prepare message for transmission
  const message = JSON.stringify({
    type: 'share_post',
    payload: { /* large post data */ },
  });

  const messageSize = calculateMessageSize(message);
  
  if (messageSize <= 512) {
    // Send directly
    // await nearbyAdapter.broadcastPayload(message);
    console.log('Sent directly (fits in 512 bytes)');
  } else {
    // Try compression
    const compressed = compressMessage(message);
    const compressedSize = calculateMessageSize(compressed);
    
    if (compressedSize <= 512) {
      // Send compressed
      // await nearbyAdapter.broadcastPayload(compressed);
      console.log('Sent compressed (fits in 512 bytes)');
    } else {
      // Split into chunks
      const chunks = splitIntoChunks(compressed, 512);
      console.log('Sending', chunks.length, 'chunks...');
      
      // Send each chunk
      for (const chunk of chunks) {
        const chunkJson = JSON.stringify(chunk);
        // await nearbyAdapter.broadcastPayload(chunkJson);
        console.log('Sent chunk', chunk.chunkIndex + 1, 'of', chunk.totalChunks);
      }
    }
  }

  // On receiving end:
  const reassembler = new ChunkReassembler();
  
  // nearbyAdapter.onPayloadReceived((event) => {
  //   try {
  //     const chunk = JSON.parse(event.payload) as MessageChunk;
  //     const completeMessage = reassembler.addChunk(chunk);
  //     
  //     if (completeMessage) {
  //       // Try to decompress
  //       try {
  //         const decompressed = decompressMessage(completeMessage);
  //         const message = JSON.parse(decompressed);
  //         // Process message...
  //       } catch {
  //         // Not compressed, use as-is
  //         const message = JSON.parse(completeMessage);
  //         // Process message...
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Failed to process chunk:', error);
  //   }
  // });
}

// Run examples
if (require.main === module) {
  console.log('\n=== Example 1: Basic Chunking ===');
  basicChunkingExample();

  console.log('\n=== Example 2: Chunking with Compression ===');
  chunkingWithCompressionExample();

  console.log('\n=== Example 3: Streaming Chunks ===');
  streamingChunksExample();

  console.log('\n=== Example 4: Error Handling ===');
  errorHandlingExample();

  console.log('\n=== Example 5: Nearby Connections Usage ===');
  nearbyConnectionsExample();
}
