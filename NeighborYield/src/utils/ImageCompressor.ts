/**
 * Image compression utilities for optimizing images before sending to Gemini API
 */

import { calculateBase64Size } from './ImageValidator';

/**
 * Target maximum size for compressed images (1MB)
 */
export const TARGET_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

/**
 * Maximum image dimensions (longest side)
 */
export const MAX_IMAGE_DIMENSION = 1200;

/**
 * Default image quality for compression (0-100)
 */
export const DEFAULT_IMAGE_QUALITY = 85;

/**
 * Minimum acceptable image quality (0-100)
 */
export const MIN_IMAGE_QUALITY = 60;

/**
 * Compression configuration
 */
export interface CompressionConfig {
  quality: number;
  maxDimension: number;
  targetSizeBytes: number;
}

/**
 * Gets the default compression configuration
 */
export function getDefaultCompressionConfig(): CompressionConfig {
  return {
    quality: DEFAULT_IMAGE_QUALITY,
    maxDimension: MAX_IMAGE_DIMENSION,
    targetSizeBytes: TARGET_IMAGE_SIZE_BYTES,
  };
}

/**
 * Checks if an image needs compression
 */
export function needsCompression(
  base64Data: string,
  config: CompressionConfig = getDefaultCompressionConfig()
): boolean {
  const sizeBytes = calculateBase64Size(base64Data);
  return sizeBytes > config.targetSizeBytes;
}
