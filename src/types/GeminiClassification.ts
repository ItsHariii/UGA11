/**
 * Types for Gemini AI-powered food safety risk classification
 */

import { RiskTier } from './Common';

/**
 * Supported image MIME types for food classification
 */
export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

/**
 * Image data for multimodal food classification
 */
export interface ImageData {
  /** Base64-encoded image data (without data URI prefix) */
  data: string;
  
  /** MIME type of the image */
  mimeType: ImageMimeType;
}

/**
 * Extracted food details from image analysis
 */
export interface ExtractedFoodData {
  /** AI-detected food name/title */
  suggestedTitle?: string;
  
  /** AI-detected food description */
  suggestedDescription?: string;
  
  /** Additional observations from the image */
  observations?: string;
}

/**
 * Input data for food safety risk classification
 */
export interface FoodClassificationInput {
  /** Name or title of the food item (e.g., "Fresh Sushi Rolls") */
  title: string;
  
  /** Detailed description of the food, preparation, and storage conditions */
  description: string;
  
  /** Optional additional content or notes about the food item */
  content?: string;
  
  /** Optional image of the food item for visual analysis */
  image?: ImageData;
}

/**
 * Error types that can occur during Gemini API classification
 */
export type GeminiError = 
  | 'timeout'         // API call exceeded time limit
  | 'api_error'       // Gemini API returned an error
  | 'invalid_key'     // API key is missing or invalid
  | 'rate_limit'      // API rate limit exceeded
  | 'network_error'   // Network connectivity issue
  | 'parse_error';    // Failed to parse AI response

/**
 * Result of a food safety risk classification attempt
 */
export interface ClassificationResult {
  /** Whether the classification was successful */
  success: boolean;
  
  /** The determined risk tier (high/medium/low) */
  riskTier: RiskTier;
  
  /** Confidence score between 0 and 1 (0 = no confidence, 1 = very confident) */
  confidence: number;
  
  /** Human-readable explanation of why this risk tier was chosen */
  reasoning: string;
  
  /** Extracted food details from image analysis (only present when image was provided) */
  extractedData?: ExtractedFoodData;
  
  /** Error type if classification failed (only present when success is false) */
  error?: GeminiError;
}
