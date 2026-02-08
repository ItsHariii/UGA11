/**
 * Image validation utilities for food classification
 */

import { ImageMimeType } from '../types/GeminiClassification';

/**
 * Maximum image size in bytes (4MB - Gemini API limit)
 */
export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

/**
 * Supported image MIME types
 */
export const SUPPORTED_IMAGE_FORMATS: ImageMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

/**
 * Validation result for image data
 */
export interface ImageValidationResult {
  /** Whether the image is valid */
  valid: boolean;
  
  /** Error message if validation failed */
  error?: string;
  
  /** Estimated size in bytes */
  sizeBytes?: number;
}

/**
 * Validates image data for Gemini API compatibility
 * 
 * @param data - Base64-encoded image data (without data URI prefix)
 * @param mimeType - MIME type of the image
 * @returns Validation result with error details if invalid
 */
export function validateImage(data: string, mimeType: string): ImageValidationResult {
  // Check if data is provided
  if (!data || data.length === 0) {
    return {
      valid: false,
      error: 'Image data is empty',
    };
  }

  // Check if MIME type is supported
  if (!SUPPORTED_IMAGE_FORMATS.includes(mimeType as ImageMimeType)) {
    return {
      valid: false,
      error: `Unsupported image format: ${mimeType}. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`,
    };
  }

  // Validate base64 encoding
  if (!isValidBase64(data)) {
    return {
      valid: false,
      error: 'Invalid base64 encoding',
    };
  }

  // Calculate approximate size
  const sizeBytes = calculateBase64Size(data);

  // Check size limit
  if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image size (${formatBytes(sizeBytes)}) exceeds maximum allowed size (${formatBytes(MAX_IMAGE_SIZE_BYTES)})`,
      sizeBytes,
    };
  }

  return {
    valid: true,
    sizeBytes,
  };
}

/**
 * Checks if a string is valid base64
 * 
 * @param str - String to validate
 * @returns True if valid base64
 */
export function isValidBase64(str: string): boolean {
  if (!str || str.length === 0) {
    return false;
  }

  // Base64 pattern: alphanumeric + / and + characters, with optional = padding
  const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
  
  // Remove whitespace
  const cleaned = str.replace(/\s/g, '');
  
  // Check pattern
  if (!base64Pattern.test(cleaned)) {
    return false;
  }

  // Base64 length must be multiple of 4
  if (cleaned.length % 4 !== 0) {
    return false;
  }

  return true;
}

/**
 * Calculates the approximate decoded size of base64 data
 * 
 * @param base64Data - Base64 string
 * @returns Size in bytes
 */
export function calculateBase64Size(base64Data: string): number {
  // Remove whitespace
  const cleaned = base64Data.replace(/\s/g, '');
  
  // Count padding characters
  let padding = 0;
  if (cleaned.endsWith('==')) {
    padding = 2;
  } else if (cleaned.endsWith('=')) {
    padding = 1;
  }

  // Calculate decoded size: (length * 3/4) - padding
  return Math.floor((cleaned.length * 3) / 4) - padding;
}

/**
 * Formats bytes into human-readable string
 * 
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Extracts base64 data from a data URI
 * 
 * @param dataUri - Data URI (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
 * @returns Object with MIME type and base64 data, or null if invalid
 */
export function parseDataUri(dataUri: string): { mimeType: string; data: string } | null {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
}
