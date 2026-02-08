/**
 * Example usage of message compression utilities.
 * Demonstrates how to use compression for messages exceeding 512 bytes.
 */

import { calculateMessageSize, compressMessage, decompressMessage } from './messageUtils';

// Example 1: Small message (no compression needed)
const smallMessage = JSON.stringify({
  type: 'share_post',
  payload: {
    id: '123',
    title: 'Fresh Tomatoes',
    description: 'I have fresh tomatoes to share',
  },
});

console.log('Small message size:', calculateMessageSize(smallMessage), 'bytes');
// Output: Small message size: 123 bytes (no compression needed)

// Example 2: Large message (compression recommended)
const largeMessage = JSON.stringify({
  type: 'share_post',
  payload: {
    id: '456',
    title: 'Community Garden Update',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20),
    location: { latitude: 37.7749, longitude: -122.4194 },
    imageUrl: 'https://example.com/very/long/url/to/image/file.jpg',
  },
});

const originalSize = calculateMessageSize(largeMessage);
console.log('Large message original size:', originalSize, 'bytes');

if (originalSize > 512) {
  const compressed = compressMessage(largeMessage);
  const compressedSize = calculateMessageSize(compressed);
  console.log('Compressed size:', compressedSize, 'bytes');
  console.log('Compression ratio:', ((1 - compressedSize / originalSize) * 100).toFixed(1) + '%');
  
  // Verify decompression works
  const decompressed = decompressMessage(compressed);
  console.log('Decompression successful:', decompressed === largeMessage);
}

// Example 3: Recommended usage pattern for mesh transmission
function prepareMessageForMesh(message: string): string {
  const size = calculateMessageSize(message);
  
  if (size > 512) {
    console.log(`Message size (${size} bytes) exceeds 512 byte limit. Compressing...`);
    return compressMessage(message);
  }
  
  return message;
}

function processReceivedMessage(message: string, isCompressed: boolean): string {
  if (isCompressed) {
    return decompressMessage(message);
  }
  return message;
}

// Usage
const messageToSend = largeMessage;
const prepared = prepareMessageForMesh(messageToSend);
console.log('Prepared message size:', calculateMessageSize(prepared), 'bytes');

// On receiver side
const received = processReceivedMessage(prepared, originalSize > 512);
console.log('Received message matches original:', received === messageToSend);
