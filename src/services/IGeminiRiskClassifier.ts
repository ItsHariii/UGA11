/**
 * Interface for AI-powered food safety risk classification using Google Gemini API
 * 
 * Supports both text-only and multimodal (text + image) classification for food items.
 * When an image is provided, the AI can detect food type, freshness, and suggest
 * appropriate titles and descriptions.
 * 
 * @example Text-only classification
 * ```typescript
 * // In React Native RiskTierPicker component:
 * import { geminiClassifier } from '@/business-logic';
 * 
 * const handleAIClassify = async () => {
 *   // Check if AI classification is available
 *   if (!geminiClassifier.isAvailable()) {
 *     showError('AI classification not configured');
 *     return;
 *   }
 * 
 *   setClassifying(true);
 *   
 *   const result = await geminiClassifier.classifyFoodRisk({
 *     title: formData.title,
 *     description: formData.description,
 *   });
 *   
 *   setClassifying(false);
 *   
 *   if (result.success) {
 *     // Pre-select the suggested tier in the picker
 *     setSuggestedTier(result.riskTier);
 *     
 *     // Display confidence and reasoning to user
 *     setConfidence(result.confidence);
 *     setReasoning(result.reasoning);
 *     
 *     // User can still override the suggestion
 *   } else {
 *     // Fallback to manual selection
 *     showError(`Classification failed: ${result.error}`);
 *   }
 * };
 * ```
 * 
 * @example Image-based classification
 * ```typescript
 * import { launchCamera } from 'react-native-image-picker';
 * import { geminiClassifier, getImagePickerOptions } from '@/business-logic';
 * 
 * const handlePhotoClassify = async () => {
 *   // Launch camera with compression settings
 *   const options = getImagePickerOptions();
 *   const image = await launchCamera(options);
 *   
 *   if (!image.assets?.[0]?.base64) return;
 *   
 *   setClassifying(true);
 *   
 *   const result = await geminiClassifier.classifyFoodRisk({
 *     title: '', // Can be empty - AI will suggest
 *     description: '', // Can be empty - AI will suggest
 *     image: {
 *       data: image.assets[0].base64,
 *       mimeType: 'image/jpeg'
 *     }
 *   });
 *   
 *   if (result.success && result.extractedData) {
 *     // Use AI-detected food information
 *     setTitle(result.extractedData.suggestedTitle || '');
 *     setDescription(result.extractedData.suggestedDescription || '');
 *     setObservations(result.extractedData.observations || '');
 *     setSuggestedTier(result.riskTier);
 *   }
 *   
 *   setClassifying(false);
 * };
 * ```
 */

import { FoodClassificationInput, ClassificationResult, GeminiError } from '../types/GeminiClassification';

/**
 * Interface for the Gemini-powered food safety risk classifier
 */
export interface IGeminiRiskClassifier {
  /**
   * Classifies food safety risk based on title, description, and optionally an image
   * 
   * @param input - Food information to classify (title, description, optional content and image)
   * @returns Promise resolving to classification result with risk tier, confidence, reasoning, and extracted data (if image provided)
   * 
   * @remarks
   * - Has a 5-second timeout to ensure responsive UX
   * - Returns success=false with fallback tier on any error
   * - User should always be able to override the AI suggestion
   * - When image is provided, the result includes extractedData with AI-detected food information
   * - Images should be base64-encoded and compressed to < 1MB for optimal performance
   * - Supported image formats: JPEG, PNG, WebP
   * 
   * @example Text-only classification
   * ```typescript
   * const result = await classifier.classifyFoodRisk({
   *   title: "Fresh Sushi Rolls",
   *   description: "Made 1 hour ago with raw salmon"
   * });
   * // result: { success: true, riskTier: 'high', confidence: 0.95, reasoning: "..." }
   * ```
   * 
   * @example Image-based classification
   * ```typescript
   * const result = await classifier.classifyFoodRisk({
   *   title: "",
   *   description: "",
   *   image: {
   *     data: base64ImageData,
   *     mimeType: 'image/jpeg'
   *   }
   * });
   * // result includes extractedData: { suggestedTitle: "Sushi Platter", suggestedDescription: "...", observations: "..." }
   * ```
   */
  classifyFoodRisk(input: FoodClassificationInput): Promise<ClassificationResult>;

  /**
   * Checks if the Gemini API is configured and available
   * 
   * @returns true if API key is configured, false otherwise
   * 
   * @remarks
   * Use this to determine whether to show the "Classify with AI" button in the UI
   * 
   * @example
   * ```typescript
   * {geminiClassifier.isAvailable() && (
   *   <Button onPress={handleAIClassify}>Classify with AI</Button>
   * )}
   * ```
   */
  isAvailable(): boolean;

  /**
   * Retrieves the last error that occurred during classification
   * 
   * @returns The last error type, or null if no error occurred
   * 
   * @remarks
   * Useful for debugging and providing detailed error messages to users
   */
  getLastError(): GeminiError | null;
}
