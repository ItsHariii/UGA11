/**
 * Image compression utilities for optimizing images before sending to Gemini API
 * 
 * Note: This module provides compression configuration and size calculations.
 * Actual image compression should be performed in the React Native layer using
 * libraries like react-native-image-picker (built-in compression) or 
 * react-native-image-resizer for more control.
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
  /** Target quality (0-100, higher = better quality but larger file) */
  quality: number;
  
  /** Maximum dimension for the longest side (pixels) */
  maxDimension: number;
  
  /** Target size in bytes (if possible) */
  targetSizeBytes: number;
}

/**
 * Image dimension information
 */
export interface ImageDimensions {
  /** Original width in pixels */
  width: number;
  
  /** Original height in pixels */
  height: number;
}

/**
 * Compression result
 */
export interface CompressionResult {
  /** Whether compression was successful */
  success: boolean;
  
  /** Compressed image data (base64) */
  data: string;
  
  /** MIME type of compressed image */
  mimeType: string;
  
  /** Original size in bytes */
  originalSize: number;
  
  /** Compressed size in bytes */
  compressedSize: number;
  
  /** Compression ratio (0-1, where 0.5 = 50% size reduction) */
  compressionRatio: number;
  
  /** Error message if compression failed */
  error?: string;
}

/**
 * Gets the default compression configuration
 * 
 * @returns Default compression settings optimized for food images
 */
export function getDefaultCompressionConfig(): CompressionConfig {
  return {
    quality: DEFAULT_IMAGE_QUALITY,
    maxDimension: MAX_IMAGE_DIMENSION,
    targetSizeBytes: TARGET_IMAGE_SIZE_BYTES,
  };
}

/**
 * Calculates optimal image dimensions to maintain aspect ratio
 * 
 * @param originalDimensions - Original image width and height
 * @param maxDimension - Maximum allowed dimension for longest side
 * @returns Scaled dimensions that maintain aspect ratio
 */
export function calculateScaledDimensions(
  originalDimensions: ImageDimensions,
  maxDimension: number
): ImageDimensions {
  const { width, height } = originalDimensions;
  
  // If image is already smaller than max, don't scale up
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  // Calculate scaling factor based on longest side
  const longestSide = Math.max(width, height);
  const scale = maxDimension / longestSide;

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/**
 * Estimates the quality needed to reach a target file size
 * 
 * @param currentSize - Current file size in bytes
 * @param targetSize - Target file size in bytes
 * @param currentQuality - Current quality setting (0-100)
 * @returns Estimated quality to achieve target size
 */
export function estimateQualityForTargetSize(
  currentSize: number,
  targetSize: number,
  currentQuality: number
): number {
  if (currentSize <= targetSize) {
    return currentQuality;
  }

  // Rough approximation: size is roughly proportional to quality
  const sizeRatio = targetSize / currentSize;
  const estimatedQuality = Math.round(currentQuality * sizeRatio);

  // Clamp to valid range
  return Math.max(MIN_IMAGE_QUALITY, Math.min(100, estimatedQuality));
}

/**
 * Checks if an image needs compression
 * 
 * @param base64Data - Base64 image data
 * @param config - Compression configuration
 * @returns True if image exceeds size or dimension limits
 */
export function needsCompression(
  base64Data: string,
  config: CompressionConfig = getDefaultCompressionConfig()
): boolean {
  const sizeBytes = calculateBase64Size(base64Data);
  return sizeBytes > config.targetSizeBytes;
}

/**
 * Validates compression configuration
 * 
 * @param config - Configuration to validate
 * @returns Validation result with error message if invalid
 */
export function validateCompressionConfig(config: CompressionConfig): {
  valid: boolean;
  error?: string;
} {
  if (config.quality < 0 || config.quality > 100) {
    return {
      valid: false,
      error: 'Quality must be between 0 and 100',
    };
  }

  if (config.maxDimension < 100) {
    return {
      valid: false,
      error: 'Maximum dimension must be at least 100 pixels',
    };
  }

  if (config.targetSizeBytes < 10000) {
    return {
      valid: false,
      error: 'Target size must be at least 10KB',
    };
  }

  return { valid: true };
}

/**
 * Creates compression instructions for React Native image picker
 * 
 * This helper generates the options object to pass to react-native-image-picker
 * or similar libraries for automatic compression during image selection.
 * 
 * @param config - Compression configuration
 * @returns Options object for image picker libraries
 * 
 * @example
 * ```typescript
 * import { launchCamera } from 'react-native-image-picker';
 * import { getImagePickerOptions } from '@/business-logic';
 * 
 * const options = getImagePickerOptions();
 * const result = await launchCamera(options);
 * ```
 */
export function getImagePickerOptions(
  config: CompressionConfig = getDefaultCompressionConfig()
) {
  return {
    mediaType: 'photo' as const,
    quality: config.quality / 100, // Convert to 0-1 range
    maxWidth: config.maxDimension,
    maxHeight: config.maxDimension,
    includeBase64: true, // Needed for Gemini API
    saveToPhotos: false,
  };
}

/**
 * Formats compression statistics for logging or display
 * 
 * @param result - Compression result
 * @returns Human-readable compression summary
 */
export function formatCompressionStats(result: CompressionResult): string {
  const reductionPercent = Math.round((1 - result.compressionRatio) * 100);
  return `Compressed from ${formatBytes(result.originalSize)} to ${formatBytes(result.compressedSize)} (${reductionPercent}% reduction)`;
}

/**
 * Formats bytes into human-readable string
 * 
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
