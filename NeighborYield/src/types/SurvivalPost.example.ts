/**
 * Example usage of SurvivalPost interface and helper functions
 * This demonstrates the complete API for creating, validating, and serializing posts
 */

import {
  createSurvivalPost,
  serializeSurvivalPost,
  deserializeSurvivalPost,
  validateSurvivalPostSize,
  getSurvivalPostSize,
  isSurvivalPost,
  MAX_SURVIVAL_POST_SIZE,
} from './index';

// Example 1: Create a "Have" post
console.log('=== Example 1: Create a Have post ===');
const havePost = createSurvivalPost('h', 'Fresh tomatoes from garden', 123);
if (havePost) {
  console.log('Created post:', havePost);
  console.log('Size:', getSurvivalPostSize(havePost), 'bytes');
  console.log('Valid size:', validateSurvivalPostSize(havePost));
  console.log('Serialized:', serializeSurvivalPost(havePost));
}

// Example 2: Create a "Want" post
console.log('\n=== Example 2: Create a Want post ===');
const wantPost = createSurvivalPost('w', 'Need bottled water', 124);
if (wantPost) {
  console.log('Created post:', wantPost);
  console.log('Size:', getSurvivalPostSize(wantPost), 'bytes');
}

// Example 3: Create an SOS post with category
console.log('\n=== Example 3: Create an SOS post ===');
const sosPost = createSurvivalPost('s', 'Medical emergency - need insulin', 125, 'm');
if (sosPost) {
  console.log('Created post:', sosPost);
  console.log('Size:', getSurvivalPostSize(sosPost), 'bytes');
  console.log('Category:', sosPost.c);
}

// Example 4: Serialize and deserialize
console.log('\n=== Example 4: Serialize and deserialize ===');
if (havePost) {
  const serialized = serializeSurvivalPost(havePost);
  console.log('Serialized:', serialized);
  console.log('Serialized size:', new TextEncoder().encode(serialized).length, 'bytes');
  
  const deserialized = deserializeSurvivalPost(serialized);
  console.log('Deserialized:', deserialized);
  console.log('Valid:', isSurvivalPost(deserialized));
}

// Example 5: Size validation
console.log('\n=== Example 5: Size validation ===');
const maxPost = createSurvivalPost('h', 'a'.repeat(100), 99999);
if (maxPost) {
  console.log('Max length post size:', getSurvivalPostSize(maxPost), 'bytes');
  console.log('Under limit:', getSurvivalPostSize(maxPost) < MAX_SURVIVAL_POST_SIZE);
}

// Example 6: Invalid posts
console.log('\n=== Example 6: Invalid posts (should return null) ===');
console.log('Empty item:', createSurvivalPost('h', '', 123));
console.log('Item too long:', createSurvivalPost('h', 'a'.repeat(101), 123));
console.log('Invalid house number:', createSurvivalPost('h', 'Item', -1));

// Example 7: Type guard validation
console.log('\n=== Example 7: Type guard validation ===');
const validPost = { t: 'h', i: 'Item', h: 123, ts: 1709856000, id: 'a1b2c3d4' };
const invalidPost = { t: 'x', i: 'Item', h: 123 };
console.log('Valid post:', isSurvivalPost(validPost));
console.log('Invalid post:', isSurvivalPost(invalidPost));

// Example 8: Post with responders
console.log('\n=== Example 8: Post with responders ===');
if (wantPost) {
  wantPost.r = ['123', '125', '126'];
  console.log('Post with responders:', wantPost);
  console.log('Size with responders:', getSurvivalPostSize(wantPost), 'bytes');
  console.log('Valid size:', validateSurvivalPostSize(wantPost));
}

console.log('\n=== Summary ===');
console.log('Max allowed size:', MAX_SURVIVAL_POST_SIZE, 'bytes');
console.log('All examples demonstrate posts well under the size limit');
