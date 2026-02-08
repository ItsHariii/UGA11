/**
 * Interface for AI-powered food safety risk classification using Google Gemini API
 */

import { FoodClassificationInput, ClassificationResult, GeminiError } from '../types/GeminiClassification';

/**
 * Interface for the Gemini-powered food safety risk classifier
 */
export interface IGeminiRiskClassifier {
  /**
   * Classifies food safety risk based on title, description, and optionally an image
   */
  classifyFoodRisk(input: FoodClassificationInput): Promise<ClassificationResult>;

  /**
   * Checks if the Gemini API is configured and available
   */
  isAvailable(): boolean;

  /**
   * Retrieves the last error that occurred during classification
   */
  getLastError(): GeminiError | null;
}
