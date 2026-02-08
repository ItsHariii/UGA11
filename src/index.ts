/**
 * NeighborYield Resilience Edition - Business Logic Layer
 * Main exports for all managers, types, and utilities
 */

// Managers
export { TTLManager } from './managers/TTLManager';
export { PresenceManager } from './managers/PresenceManager';
export { InterestManager } from './managers/InterestManager';
export { PermissionManager } from './managers/PermissionManager';
export { BatteryManager } from './managers/BatteryManager';

// Manager Interfaces
export type { ITTLManager } from './managers/ITTLManager';
export type { IPresenceManager } from './managers/IPresenceManager';
export type { IInterestManager, InterestResult } from './managers/IInterestManager';
export type { IPermissionManager, PermissionStatus, PermissionResult } from './managers/IPermissionManager';
export type { IBatteryManager } from './managers/IBatteryManager';

// Types
export type { SharePost } from './types/SharePost';
export type { InterestAck } from './types/InterestAck';
export type { InterestResponse } from './types/InterestResponse';
export type { PeerInfo, HeartbeatPayload } from './types/PeerInfo';
export type { LocalState } from './types/LocalState';
export type {
  RiskTier,
  PermissionState,
  MeshPermission,
  ConnectivityMode,
  NearbyState,
  MessageType,
  Unsubscribe,
  InterestStatus,
  ResponseType,
  InterestError,
} from './types/Common';

// Utilities
export { generateUserIdentifier, getUserIdentifier, clearUserIdentifier } from './utils/UserIdentifierGenerator';
export { EnvConfig } from './utils/EnvConfig';
export type { IEnvConfig } from './utils/EnvConfig';

// Supabase mapping utilities (for Person 2 transport layer)
export {
  postToSupabaseRow,
  supabaseRowToPost,
  interestToSupabaseRow,
  supabaseRowToInterest,
} from './utils/SupabaseMappers';
export type {
  SharePostRow,
  InterestRow,
  SharePostInsertRow,
  InterestInsertRow,
} from './utils/SupabaseMappers';

// Image utilities for AI classification
export {
  validateImage,
  isValidBase64,
  calculateBase64Size,
  formatBytes,
  parseDataUri,
  MAX_IMAGE_SIZE_BYTES,
  SUPPORTED_IMAGE_FORMATS,
} from './utils/ImageValidator';
export type { ImageValidationResult } from './utils/ImageValidator';

export {
  getDefaultCompressionConfig,
  calculateScaledDimensions,
  estimateQualityForTargetSize,
  needsCompression,
  validateCompressionConfig,
  getImagePickerOptions,
  formatCompressionStats,
  TARGET_IMAGE_SIZE_BYTES,
  MAX_IMAGE_DIMENSION,
  DEFAULT_IMAGE_QUALITY,
  MIN_IMAGE_QUALITY,
} from './utils/ImageCompressor';
export type {
  CompressionConfig,
  ImageDimensions,
  CompressionResult,
} from './utils/ImageCompressor';

// AI Services
import { GeminiRiskClassifier } from './services/GeminiRiskClassifier';
import { EnvConfig } from './utils/EnvConfig';

/**
 * Singleton instance of the Gemini risk classifier
 * Automatically configured with API key from environment variables
 */
export const geminiClassifier = new GeminiRiskClassifier(EnvConfig.geminiApiKey);

export { GeminiRiskClassifier };
export type { IGeminiRiskClassifier } from './services/IGeminiRiskClassifier';
export type {
  FoodClassificationInput,
  ClassificationResult,
  GeminiError,
  ImageData,
  ImageMimeType,
  ExtractedFoodData,
} from './types/GeminiClassification';

// Mocks (for testing)
export { MockTransportRouter } from './mocks/MockTransportRouter';
export type { ITransportRouter, TransportMessage, SendResult, MessageHandler } from './mocks/MockTransportRouter';
