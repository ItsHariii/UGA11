/**
 * User Identifier Generator
 * Generates and persists pseudonymous user identifiers
 */

/**
 * Cached user identifier for persistence across sessions
 * In production, this would be stored in AsyncStorage or SecureStore
 */
let cachedUserId: string | null = null;

/**
 * Generate a random 4-character hexadecimal suffix
 */
function generateRandomHex(): string {
  return Math.floor(Math.random() * 0xFFFF)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
}

/**
 * Generate a new user identifier in format "Neighbor-XXXX"
 * where XXXX is a random 4-character hexadecimal string
 */
export function generateUserIdentifier(): string {
  const suffix = generateRandomHex();
  return `Neighbor-${suffix}`;
}

/**
 * Get the current user identifier, generating one if it doesn't exist
 * This implements in-memory persistence simulation
 * 
 * In production React Native app, this would:
 * - Check AsyncStorage for existing ID
 * - Generate and persist new ID if not found
 * - Return cached value
 */
export function getUserIdentifier(): string {
  if (!cachedUserId) {
    cachedUserId = generateUserIdentifier();
    console.log(`[UserIdentifier] Generated new identifier: ${cachedUserId}`);
  }
  return cachedUserId;
}

/**
 * Clear cached user identifier (for testing purposes)
 */
export function clearUserIdentifier(): void {
  cachedUserId = null;
}
