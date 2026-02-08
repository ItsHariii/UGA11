/**
 * Type definitions for NeighborYield
 * Central location for all TypeScript interfaces and types
 */

// ============================================
// Connectivity Types
// ============================================

export type ConnectivityMode = 'online' | 'offline';

// ============================================
// Risk and TTL Types
// ============================================

export type RiskTier = 'high' | 'medium' | 'low';

export const TTL_VALUES: Record<RiskTier, number> = {
  high: 15 * 60 * 1000, // 15 minutes
  medium: 30 * 60 * 1000, // 30 minutes
  low: 60 * 60 * 1000, // 60 minutes
};

// ============================================
// Share Post Types
// ============================================

export interface SharePost {
  id: string;
  authorId: string;
  authorIdentifier: string;
  title: string;
  description: string;
  riskTier: RiskTier;
  createdAt: number;
  expiresAt: number;
  source: 'local' | 'supabase';
  location?: {
    latitude: number;
    longitude: number;
  };
  imageUrl?: string;
}

// ============================================
// Image Asset Types
// ============================================

/**
 * Image asset metadata from image picker
 * Contains all information about a selected or captured image
 */
export interface ImageAsset {
  /** Local URI of the image */
  uri: string;
  
  /** MIME type of the image */
  type: string; // 'image/jpeg' | 'image/png'
  
  /** Original filename */
  fileName: string;
  
  /** File size in bytes */
  fileSize: number;
  
  /** Image width in pixels */
  width: number;
  
  /** Image height in pixels */
  height: number;
  
  /** Optional base64 encoded data for AI analysis */
  base64?: string;
}

/**
 * Compressed image data ready for upload
 */
export interface CompressedImage {
  /** Local URI of the compressed image */
  uri: string;
  
  /** MIME type of the image */
  type: string;
  
  /** Filename for upload */
  fileName: string;
  
  /** Compressed file size in bytes */
  fileSize: number;
  
  /** Optional base64 encoded data */
  base64?: string;
}

/**
 * AI analysis result from Gemini Vision API
 * Contains extracted food data and risk classification
 */
export interface AIAnalysisResult {
  /** Whether the analysis was successful */
  success: boolean;
  
  /** Suggested title extracted from image */
  suggestedTitle?: string;
  
  /** Suggested description extracted from image */
  suggestedDescription?: string;
  
  /** AI observations about the food */
  observations?: string;
  
  /** Classified risk tier */
  riskTier?: RiskTier;
  
  /** Confidence score (0-1) */
  confidence?: number;
  
  /** Error information if analysis failed */
  error?: {
    type: 'timeout' | 'rate_limit' | 'network_error' | 'invalid_image' | 'unknown';
    message: string;
  };
}

// ============================================
// Interest Types
// ============================================

export type InterestStatus = 'pending' | 'accepted' | 'declined';

export interface InterestAck {
  id: string;
  postId: string;
  interestedUserId: string;
  interestedUserIdentifier: string;
  timestamp: number;
  source: 'local' | 'supabase';
  status: InterestStatus;
}

export interface InterestResponse {
  interestId: string;
  postId: string;
  responderId: string;
  response: 'accepted' | 'declined';
  message?: string;
  timestamp: number;
}

export type InterestError = 'poster_unreachable' | 'post_expired' | 'already_claimed';

export interface InterestResult {
  success: boolean;
  interestId?: string;
  error?: InterestError;
}

// ============================================
// Peer and Presence Types
// ============================================

export interface PeerInfo {
  endpointId: string;
  userIdentifier: string;
  lastSeen: number;
  signalStrength?: number;
}

export interface HeartbeatPayload {
  v: number;
  uid: string;
  ts: number;
  cap: number;
}

// ============================================
// Permission Types
// ============================================

export type MeshPermission = 'bluetooth' | 'location' | 'nearby_devices';

export type PermissionState = 'granted' | 'denied' | 'never_ask_again' | 'unavailable';

export interface PermissionStatus {
  bluetooth: PermissionState;
  location: PermissionState;
  nearbyDevices: PermissionState;
  canUseMesh: boolean;
}

export interface PermissionResult {
  granted: boolean;
  state: PermissionState;
}

// ============================================
// Battery Types
// ============================================

export type NearbyState = 'active' | 'suspended' | 'disabled';

export interface BatteryConfig {
  foregroundHeartbeatInterval: number;
  backgroundHeartbeatInterval: number;
  lowBatteryThreshold: number;
}

// ============================================
// Survival Mode Battery Configuration
// ============================================

/**
 * Battery configuration for survival mode
 * Adjusts Bluetooth discovery interval and UI features based on battery level
 * 
 * Requirements: 6.1-6.10
 */
export interface SurvivalBatteryConfig {
  level: number;                    // Battery level 0-100
  discoveryInterval: number;        // Bluetooth discovery interval in milliseconds
  animationsEnabled: boolean;       // Whether animations are enabled
  powerSaveMode: boolean;           // Whether power save mode is active
}

/**
 * Battery threshold configuration
 * Defines discovery intervals based on battery level
 * 
 * Requirements: 6.2
 * - > 50%: 15 second interval
 * - 20-50%: 30 second interval
 * - < 20%: 60 second interval
 */
export const BATTERY_THRESHOLDS = {
  HIGH: { min: 50, interval: 15000 },      // 15 seconds
  MEDIUM: { min: 20, interval: 30000 },    // 30 seconds
  LOW: { min: 0, interval: 60000 },        // 60 seconds
} as const;

/**
 * Gets battery configuration based on current battery level
 * Adjusts discovery interval and features based on battery thresholds
 * 
 * @param level Current battery level (0-100)
 * @returns SurvivalBatteryConfig with appropriate settings
 * 
 * Requirements: 6.2, 6.3, 6.4
 */
export function getBatteryConfig(level: number): SurvivalBatteryConfig {
  // Clamp level to 0-100 range
  const clampedLevel = Math.max(0, Math.min(100, level));

  if (clampedLevel > BATTERY_THRESHOLDS.HIGH.min) {
    // High battery (> 50%): Full functionality
    return {
      level: clampedLevel,
      discoveryInterval: BATTERY_THRESHOLDS.HIGH.interval,
      animationsEnabled: true,
      powerSaveMode: false,
    };
  } else if (clampedLevel > BATTERY_THRESHOLDS.MEDIUM.min) {
    // Medium battery (20-50%): Reduced discovery frequency
    return {
      level: clampedLevel,
      discoveryInterval: BATTERY_THRESHOLDS.MEDIUM.interval,
      animationsEnabled: true,
      powerSaveMode: false,
    };
  } else {
    // Low battery (< 20%): Minimal UI, no animations, 60s discovery
    return {
      level: clampedLevel,
      discoveryInterval: BATTERY_THRESHOLDS.LOW.interval,
      animationsEnabled: false,
      powerSaveMode: true,
    };
  }
}

// ============================================
// Transport Types
// ============================================

export type MessageType =
  | 'share_post'
  | 'interest_ack'
  | 'interest_response'
  | 'heartbeat'
  | 'peer_discovery';

export interface TransportMessage {
  type: MessageType;
  payload: unknown;
  targetEndpoint?: string;
  ttl?: number;
}

export interface SendResult {
  success: boolean;
  error?: string;
}

// ============================================
// Survival Mode Types
// ============================================

/**
 * Compact post format optimized for Bluetooth transmission
 * Maximum size: 512 bytes when serialized
 * 
 * Field abbreviations:
 * - t: type (have, want, sos)
 * - i: item description (max 100 chars)
 * - h: house number
 * - ts: timestamp (Unix seconds)
 * - id: unique ID (8 chars, base64)
 * - r: responders (house numbers as strings)
 * - c: category for SOS ('m'|'s'|'f'|'o' = medical|safety|fire|other)
 * - resolved: SOS resolution status
 */
export interface SurvivalPost {
  t: 'h' | 'w' | 's';  // type: have, want, sos
  i: string;            // item description (max 100 chars)
  h: number;            // house number
  ts: number;           // timestamp (Unix seconds)
  id: string;           // unique ID (8 chars, base64)
  r?: string[];         // responders (house numbers as strings)
  c?: 'm' | 's' | 'f' | 'o';  // category: medical, safety, fire, other
  resolved?: boolean;   // SOS resolution status
}

/**
 * Type guard to validate if an object is a valid SurvivalPost
 * Validates all required fields and their types
 */
export function isSurvivalPost(obj: unknown): obj is SurvivalPost {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const post = obj as Partial<SurvivalPost>;

  // Check required fields
  if (!post.t || !['h', 'w', 's'].includes(post.t)) {
    return false;
  }

  if (typeof post.i !== 'string' || post.i.length === 0 || post.i.length > 100) {
    return false;
  }

  if (typeof post.h !== 'number' || !Number.isInteger(post.h) || post.h <= 0) {
    return false;
  }

  if (typeof post.ts !== 'number' || !Number.isInteger(post.ts) || post.ts <= 0) {
    return false;
  }

  if (typeof post.id !== 'string' || post.id.length !== 8) {
    return false;
  }

  // Check optional fields
  if (post.r !== undefined) {
    if (!Array.isArray(post.r)) {
      return false;
    }
    if (!post.r.every(r => typeof r === 'string')) {
      return false;
    }
  }

  if (post.c !== undefined && !['m', 's', 'f', 'o'].includes(post.c)) {
    return false;
  }

  if (post.resolved !== undefined && typeof post.resolved !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Maximum allowed size for a serialized SurvivalPost in bytes
 */
export const MAX_SURVIVAL_POST_SIZE = 512;

/**
 * Serializes a SurvivalPost to a compact JSON string
 * @param post The post to serialize
 * @returns JSON string representation
 */
export function serializeSurvivalPost(post: SurvivalPost): string {
  return JSON.stringify(post);
}

/**
 * Deserializes a JSON string to a SurvivalPost
 * @param json The JSON string to deserialize
 * @returns The deserialized post or null if invalid
 */
export function deserializeSurvivalPost(json: string): SurvivalPost | null {
  try {
    const obj = JSON.parse(json);
    return isSurvivalPost(obj) ? obj : null;
  } catch {
    return null;
  }
}

/**
 * Validates that a serialized SurvivalPost is under the size limit
 * @param post The post to validate
 * @returns true if the post is under 512 bytes when serialized
 */
export function validateSurvivalPostSize(post: SurvivalPost): boolean {
  const serialized = serializeSurvivalPost(post);
  const sizeInBytes = new TextEncoder().encode(serialized).length;
  return sizeInBytes <= MAX_SURVIVAL_POST_SIZE;
}

/**
 * Gets the size in bytes of a serialized SurvivalPost
 * @param post The post to measure
 * @returns Size in bytes
 */
export function getSurvivalPostSize(post: SurvivalPost): number {
  const serialized = serializeSurvivalPost(post);
  return new TextEncoder().encode(serialized).length;
}

/**
 * Generates a unique 8-character base64 ID for a SurvivalPost
 * Uses timestamp and random values to ensure uniqueness
 * @returns 8-character base64 string
 */
let idCounter = 0;
export function generateSurvivalPostId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 4);
  const counter = (idCounter++).toString(36).padStart(2, '0');
  // Take last 4 chars of timestamp + 2 random + 2 counter = 8 chars
  return (timestamp.slice(-4) + random + counter);
}

/**
 * Creates a new SurvivalPost with validation
 * @param type Post type (have, want, sos)
 * @param item Item description (max 100 chars)
 * @param houseNumber House number
 * @param category Optional category for SOS posts
 * @returns A valid SurvivalPost or null if validation fails
 */
export function createSurvivalPost(
  type: 'h' | 'w' | 's',
  item: string,
  houseNumber: number,
  category?: 'm' | 's' | 'f' | 'o'
): SurvivalPost | null {
  // Trim the item first
  const trimmedItem = item.trim();
  
  // Validate inputs
  if (trimmedItem.length === 0 || trimmedItem.length > 100) {
    return null;
  }

  if (!Number.isInteger(houseNumber) || houseNumber <= 0) {
    return null;
  }

  const post: SurvivalPost = {
    t: type,
    i: trimmedItem,
    h: houseNumber,
    ts: Math.floor(Date.now() / 1000), // Unix seconds
    id: generateSurvivalPostId(),
  };

  // Add category for SOS posts
  if (type === 's' && category) {
    post.c = category;
  }

  // Validate size
  if (!validateSurvivalPostSize(post)) {
    return null;
  }

  return post;
}

/**
 * Minimal acknowledgment for "Coming" button
 * Sent via Bluetooth when user indicates they're coming
 * Target size: ~30 bytes serialized
 */
export interface ComingAck {
  postId: string;      // 8 chars - references the SurvivalPost
  houseNumber: string; // responder's house number
}

/**
 * Type guard to validate if an object is a valid ComingAck
 * Validates all required fields and their types
 */
export function isComingAck(obj: unknown): obj is ComingAck {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const ack = obj as Partial<ComingAck>;

  // Check required fields
  if (typeof ack.postId !== 'string' || ack.postId.length !== 8) {
    return false;
  }

  if (typeof ack.houseNumber !== 'string' || ack.houseNumber.length === 0) {
    return false;
  }

  return true;
}

/**
 * Serializes a ComingAck to a compact JSON string
 * @param ack The acknowledgment to serialize
 * @returns JSON string representation
 */
export function serializeComingAck(ack: ComingAck): string {
  return JSON.stringify(ack);
}

/**
 * Deserializes a JSON string to a ComingAck
 * @param json The JSON string to deserialize
 * @returns The deserialized acknowledgment or null if invalid
 */
export function deserializeComingAck(json: string): ComingAck | null {
  try {
    const obj = JSON.parse(json);
    return isComingAck(obj) ? obj : null;
  } catch {
    return null;
  }
}

/**
 * Gets the size in bytes of a serialized ComingAck
 * @param ack The acknowledgment to measure
 * @returns Size in bytes
 */
export function getComingAckSize(ack: ComingAck): number {
  const serialized = serializeComingAck(ack);
  return new TextEncoder().encode(serialized).length;
}

/**
 * Creates a new ComingAck with validation
 * @param postId The ID of the post being acknowledged (8 chars)
 * @param houseNumber The responder's house number
 * @returns A valid ComingAck or null if validation fails
 */
export function createComingAck(
  postId: string,
  houseNumber: string
): ComingAck | null {
  // Validate inputs
  if (postId.length !== 8) {
    return null;
  }

  if (houseNumber.length === 0) {
    return null;
  }

  const ack: ComingAck = {
    postId,
    houseNumber,
  };

  return ack;
}

// ============================================
// Survival Mode State Management
// ============================================

/**
 * State management for survival mode
 * Manages posts, UI state, network state, battery state, and user state
 * 
 * Requirements: All (comprehensive state management)
 */
export interface SurvivalModeState {
  // Posts
  posts: SurvivalPost[];
  
  // UI State
  activeTab: 'community' | 'sos';
  isCreating: boolean;
  
  // Network State
  peerCount: number;
  isDiscovering: boolean;
  lastSyncTime: number;
  
  // Battery State
  batteryLevel: number;
  batteryConfig: SurvivalBatteryConfig;
  powerSaveMode: boolean;
  
  // User State
  userHouseNumber: number;
}

/**
 * Action types for managing survival mode posts
 */
export type PostAction =
  | { type: 'ADD_POST'; post: SurvivalPost }
  | { type: 'REMOVE_POST'; postId: string }
  | { type: 'UPDATE_POST'; postId: string; updates: Partial<SurvivalPost> }
  | { type: 'MERGE_POSTS'; posts: SurvivalPost[] }
  | { type: 'ADD_RESPONDER'; postId: string; houseNumber: string }
  | { type: 'RESOLVE_SOS'; postId: string };

/**
 * Action types for managing survival mode UI state
 */
export type UIAction =
  | { type: 'SET_ACTIVE_TAB'; tab: 'community' | 'sos' }
  | { type: 'TOGGLE_CREATE_FORM' }
  | { type: 'SET_CREATING'; isCreating: boolean };

/**
 * Action types for managing network state
 */
export type NetworkAction =
  | { type: 'UPDATE_PEER_COUNT'; count: number }
  | { type: 'SET_DISCOVERING'; isDiscovering: boolean }
  | { type: 'UPDATE_SYNC_TIME'; timestamp: number }
  | { type: 'PEER_CONNECTED'; endpointId: string }
  | { type: 'PEER_DISCONNECTED'; endpointId: string };

/**
 * Action types for managing battery state
 */
export type BatteryAction =
  | { type: 'UPDATE_BATTERY'; level: number }
  | { type: 'TOGGLE_POWER_SAVE' }
  | { type: 'SET_POWER_SAVE'; enabled: boolean }
  | { type: 'UPDATE_BATTERY_CONFIG'; config: SurvivalBatteryConfig };

/**
 * Combined action type for survival mode state management
 */
export type SurvivalModeAction = PostAction | UIAction | NetworkAction | BatteryAction;

/**
 * Reducer function for survival mode state management
 * Handles all state updates for survival mode
 * 
 * @param state Current survival mode state
 * @param action Action to apply
 * @returns Updated survival mode state
 */
export function survivalModeReducer(
  state: SurvivalModeState,
  action: SurvivalModeAction
): SurvivalModeState {
  switch (action.type) {
    // Post Actions
    case 'ADD_POST':
      return {
        ...state,
        posts: [...state.posts, action.post],
      };

    case 'REMOVE_POST':
      return {
        ...state,
        posts: state.posts.filter(p => p.id !== action.postId),
      };

    case 'UPDATE_POST': {
      const posts = state.posts.map(p =>
        p.id === action.postId ? { ...p, ...action.updates } : p
      );
      return { ...state, posts };
    }

    case 'MERGE_POSTS': {
      // Deduplicate posts by ID
      const existingIds = new Set(state.posts.map(p => p.id));
      const newPosts = action.posts.filter(p => !existingIds.has(p.id));
      return {
        ...state,
        posts: [...state.posts, ...newPosts],
      };
    }

    case 'ADD_RESPONDER': {
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          const responders = p.r || [];
          if (!responders.includes(action.houseNumber)) {
            return { ...p, r: [...responders, action.houseNumber] };
          }
        }
        return p;
      });
      return { ...state, posts };
    }

    case 'RESOLVE_SOS': {
      const posts = state.posts.map(p =>
        p.id === action.postId && p.t === 's' ? { ...p, resolved: true } : p
      );
      return { ...state, posts };
    }

    // UI Actions
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.tab,
      };

    case 'TOGGLE_CREATE_FORM':
      return {
        ...state,
        isCreating: !state.isCreating,
      };

    case 'SET_CREATING':
      return {
        ...state,
        isCreating: action.isCreating,
      };

    // Network Actions
    case 'UPDATE_PEER_COUNT':
      return {
        ...state,
        peerCount: action.count,
      };

    case 'SET_DISCOVERING':
      return {
        ...state,
        isDiscovering: action.isDiscovering,
      };

    case 'UPDATE_SYNC_TIME':
      return {
        ...state,
        lastSyncTime: action.timestamp,
      };

    case 'PEER_CONNECTED':
      return {
        ...state,
        peerCount: state.peerCount + 1,
      };

    case 'PEER_DISCONNECTED':
      return {
        ...state,
        peerCount: Math.max(0, state.peerCount - 1),
      };

    // Battery Actions
    case 'UPDATE_BATTERY': {
      const batteryConfig = getBatteryConfig(action.level);
      return {
        ...state,
        batteryLevel: action.level,
        batteryConfig,
        powerSaveMode: batteryConfig.powerSaveMode,
      };
    }

    case 'TOGGLE_POWER_SAVE':
      return {
        ...state,
        powerSaveMode: !state.powerSaveMode,
      };

    case 'SET_POWER_SAVE':
      return {
        ...state,
        powerSaveMode: action.enabled,
      };

    case 'UPDATE_BATTERY_CONFIG':
      return {
        ...state,
        batteryConfig: action.config,
      };

    default:
      return state;
  }
}

/**
 * Creates initial survival mode state
 * @param userHouseNumber User's house number
 * @param initialBatteryLevel Initial battery level (default 100)
 * @returns Initial SurvivalModeState
 */
export function createInitialSurvivalModeState(
  userHouseNumber: number,
  initialBatteryLevel: number = 100
): SurvivalModeState {
  const batteryConfig = getBatteryConfig(initialBatteryLevel);
  
  return {
    posts: [],
    activeTab: 'community',
    isCreating: false,
    peerCount: 0,
    isDiscovering: false,
    lastSyncTime: Date.now(),
    batteryLevel: initialBatteryLevel,
    batteryConfig,
    powerSaveMode: batteryConfig.powerSaveMode,
    userHouseNumber,
  };
}

// ============================================
// Local State Types
// ============================================

export interface LocalState {
  posts: Map<string, SharePost>;
  interestsByPost: Map<string, InterestAck[]>;
  myInterests: Map<string, InterestAck>;
  peers: Map<string, PeerInfo>;
  permissions: PermissionStatus;
  connectivityMode: ConnectivityMode;
  userIdentifier: string;
  userId: string;
}
