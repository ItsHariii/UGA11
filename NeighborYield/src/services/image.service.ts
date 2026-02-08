/**
 * Image Service
 * Handles image picking, compression, conversion, and upload to Supabase storage
 */

import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { supabase } from '../lib/supabase';

/**
 * Image asset with metadata
 */
export interface ImageAsset {
  uri: string;
  type: string; // 'image/jpeg' | 'image/png'
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  base64?: string;
}

/**
 * Compressed image result
 */
export interface CompressedImage {
  uri: string;
  type: string;
  fileName: string;
  fileSize: number;
  base64?: string;
}

/**
 * Image picker options
 */
const IMAGE_PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  quality: 0.9 as const,
  maxWidth: 4096,
  maxHeight: 4096,
  includeBase64: true, // Include base64 for AI analysis
};

/**
 * Maximum file size (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image formats
 */
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 * Image Service
 * Provides methods for image handling throughout the app
 */
export class ImageService {
  /**
   * Opens native image picker
   * @param source - 'camera' | 'library'
   * @returns Selected image asset with metadata
   * @throws Error with specific message for different failure scenarios
   */
  static async pickImage(source: 'camera' | 'library'): Promise<ImageAsset> {
    try {
      let response: ImagePickerResponse;

      if (source === 'camera') {
        response = await launchCamera(IMAGE_PICKER_OPTIONS);
      } else {
        response = await launchImageLibrary(IMAGE_PICKER_OPTIONS);
      }

      // Handle cancellation
      if (response.didCancel) {
        throw new Error('User cancelled image picker');
      }

      // Handle permission errors specifically
      if (response.errorCode === 'permission') {
        const permissionType = source === 'camera' ? 'Camera' : 'Photo library';
        throw new Error(`Permission denied. ${permissionType} access is needed. Please enable it in Settings.`);
      }

      // Handle camera not available
      if (response.errorCode === 'camera_unavailable') {
        throw new Error('Camera is not available on this device.');
      }

      // Handle other errors
      if (response.errorCode) {
        throw new Error(response.errorMessage || `Failed to pick image: ${response.errorCode}`);
      }

      // Extract asset
      const asset = response.assets?.[0];
      if (!asset || !asset.uri) {
        throw new Error('No image selected');
      }

      // Validate image
      this.validateImage(asset);

      // Return formatted image asset
      return {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        fileSize: asset.fileSize || 0,
        width: asset.width || 0,
        height: asset.height || 0,
        base64: asset.base64, // Include base64 if available
      };
    } catch (error) {
      // Re-throw with context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Image picker error: ${String(error)}`);
    }
  }

  /**
   * Validates image format and size
   * @param asset - Image asset to validate
   * @throws Error if validation fails
   */
  private static validateImage(asset: Asset): void {
    // Check file size
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
      throw new Error('Image is too large. Please select an image under 5MB.');
    }

    // Check format
    const type = asset.type || 'image/jpeg';
    if (!ALLOWED_FORMATS.includes(type.toLowerCase())) {
      throw new Error('Invalid format. Please select a JPEG or PNG image.');
    }
  }

  /**
   * Compresses image for upload
   * @param image - Original image asset
   * @param maxWidth - Maximum width (default: 1200)
   * @param quality - JPEG quality 0-100 (default: 80)
   * @returns Compressed image
   * @throws Error if compression fails
   */
  static async compressImage(
    image: ImageAsset,
    maxWidth: number = 1200,
    quality: number = 80
  ): Promise<CompressedImage> {
    try {
      console.log('Compressing image:', {
        originalSize: image.fileSize,
        originalDimensions: `${image.width}x${image.height}`,
      });

      // Validate image URI
      if (!image.uri) {
        throw new Error('Invalid image URI');
      }

      // Compress using react-native-image-resizer
      const result = await ImageResizer.createResizedImage(
        image.uri,
        maxWidth,
        maxWidth, // Keep aspect ratio by using same value
        'JPEG',
        quality,
        0, // rotation
        undefined, // outputPath
        true // keepMeta
      );

      console.log('Compression complete:', {
        newUri: result.uri,
        newDimensions: `${result.width}x${result.height}`,
      });

      return {
        uri: result.uri,
        type: 'image/jpeg',
        fileName: image.fileName.replace(/\.(png|jpg|jpeg)$/i, '.jpg'),
        fileSize: result.size || image.fileSize,
      };
    } catch (error) {
      console.error('Image compression error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to compress image: ${error.message}`);
      }
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Converts image to base64 for AI analysis
   * @param image - Image asset
   * @returns Base64 string
   */
  static async convertToBase64(image: ImageAsset): Promise<string> {
    try {
      // If base64 is already available from picker, return it
      if (image.base64) {
        return image.base64;
      }

      // Otherwise, we need to re-pick the image with base64 enabled
      // or read it from the file system
      throw new Error(
        'Base64 data not available. Please pick image with includeBase64: true option.'
      );
    } catch (error) {
      console.error('Base64 conversion error:', error);
      throw error;
    }
  }

  /**
   * Uploads image to Supabase storage with retry logic
   * @param image - Compressed image to upload
   * @param bucket - Storage bucket name (default: 'post-images')
   * @param userId - User ID for organizing uploads
   * @returns Public URL of uploaded image
   * @throws Error with specific message after all retries fail
   */
  static async uploadToSupabase(
    image: CompressedImage,
    bucket: string = 'post-images',
    userId?: string
  ): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries}`);

        // Validate image URI
        if (!image.uri) {
          throw new Error('Invalid image URI');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileName = userId
          ? `${userId}/${timestamp}_${randomSuffix}.jpg`
          : `${timestamp}_${randomSuffix}.jpg`;

        // Read file as blob for upload
        const response = await fetch(image.uri);
        
        if (!response.ok) {
          throw new Error(`Failed to read image file: ${response.statusText}`);
        }
        
        const blob = await response.blob();

        // Validate blob
        if (!blob || blob.size === 0) {
          throw new Error('Invalid image data');
        }

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          // Check for specific error types
          if (uploadError.message?.includes('quota') || uploadError.message?.includes('storage')) {
            throw new Error('Storage quota exceeded. Please contact support.');
          }
          if (uploadError.message?.includes('auth') || uploadError.message?.includes('unauthorized')) {
            throw new Error('Upload failed due to authentication error. Please sign in again.');
          }
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        if (!urlData?.publicUrl) {
          throw new Error('Failed to get public URL');
        }

        console.log('Upload successful:', urlData.publicUrl);
        return urlData.publicUrl;
      } catch (error) {
        lastError = error as Error;
        console.error(`Upload attempt ${attempt} failed:`, error);

        // If not the last attempt, wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = 1000 * attempt; // 1s, 2s, 3s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    const errorMessage = lastError?.message || 'Unknown error';
    throw new Error(
      `Upload failed after ${maxRetries} attempts: ${errorMessage}`
    );
  }
}
