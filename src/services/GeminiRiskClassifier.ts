/**
 * Gemini AI-powered food safety risk classifier implementation
 */

import { GoogleGenAI } from '@google/genai';
import type { IGeminiRiskClassifier } from './IGeminiRiskClassifier';
import type { 
  FoodClassificationInput, 
  ClassificationResult,
  GeminiError,
  ExtractedFoodData 
} from '../types/GeminiClassification';
import type { RiskTier } from '../types/Common';
import { validateImage, calculateBase64Size } from '../utils/ImageValidator';
import { needsCompression } from '../utils/ImageCompressor';

/**
 * Timeout duration for Gemini API calls (in milliseconds)
 * Image classification may take longer than text-only
 */
const CLASSIFICATION_TIMEOUT_MS = 15000;

/**
 * AI model to use for classification
 * Uses gemini-2.5-flash for better free-tier quotas (supports text + image multimodal input)
 * Fallback: gemini-2.0-flash if 2.5 unavailable
 */
const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Implementation of food safety risk classifier using Google Gemini API
 */
export class GeminiRiskClassifier implements IGeminiRiskClassifier {
  private genAI: GoogleGenAI | null = null;
  private lastError: GeminiError | null = null;

  constructor(apiKey: string | null) {
    if (apiKey && apiKey.length > 0) {
      try {
        this.genAI = new GoogleGenAI({ apiKey });
      } catch (error) {
        console.error('[GeminiRiskClassifier] Failed to initialize Gemini API:', error);
        this.lastError = 'invalid_key';
        this.genAI = null;
      }
    }
  }

  public isAvailable(): boolean {
    return this.genAI !== null;
  }

  public getLastError(): GeminiError | null {
    return this.lastError;
  }

  public async classifyFoodRisk(input: FoodClassificationInput): Promise<ClassificationResult> {
    // Reset last error
    this.lastError = null;

    // Check if API is available
    if (!this.isAvailable()) {
      this.lastError = 'invalid_key';
      return this.createFallbackResult('invalid_key');
    }

    // Validate image if provided
    if (input.image) {
      const validation = validateImage(input.image.data, input.image.mimeType);
      if (!validation.valid) {
        console.error('[GeminiRiskClassifier] Image validation failed:', validation.error);
        this.lastError = 'api_error';
        return this.createFallbackResult('api_error');
      }

      // Warn if image is large
      const imageSize = calculateBase64Size(input.image.data);
      if (needsCompression(input.image.data)) {
        console.warn(`[GeminiRiskClassifier] Image size (${Math.round(imageSize / 1024)}KB) is large. Consider compressing before sending.`);
      }
    }

    try {
      // Build the classification prompt (text-only or multimodal)
      const prompt = this.buildPrompt(input);

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), CLASSIFICATION_TIMEOUT_MS);
      });

      // Race between API call and timeout
      const response = await Promise.race([
        this.genAI!.models.generateContent({
          model: MODEL_NAME,
          contents: prompt
        }),
        timeoutPromise,
      ]);

      // Extract text from response (property, not method in new SDK)
      const text = response.text;

      // Check if text was returned
      if (!text) {
        throw new Error('No text returned from Gemini API');
      }

      // Parse the JSON response (includes extracted data if image was provided)
      return this.parseResponse(text, !!input.image);

    } catch (error: any) {
      // Handle different error types
      if (error.message === 'timeout') {
        console.error('[GeminiRiskClassifier] Timeout error:', error);
        this.lastError = 'timeout';
        return this.createFallbackResult('timeout');
      }

      if (error.message?.includes('API key')) {
        console.error('[GeminiRiskClassifier] API key error:', error);
        console.error('Error message:', error.message);
        this.lastError = 'invalid_key';
        return this.createFallbackResult('invalid_key');
      }

      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        console.error('[GeminiRiskClassifier] Rate limit/quota error:', error);
        console.error('Error message:', error.message);
        this.lastError = 'rate_limit';
        return this.createFallbackResult('rate_limit');
      }

      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        console.error('[GeminiRiskClassifier] Network/fetch error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        if (error.cause) console.error('Error cause:', error.cause);
        this.lastError = 'network_error';
        return this.createFallbackResult('network_error');
      }

      console.error('[GeminiRiskClassifier] Classification error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      this.lastError = 'api_error';
      return this.createFallbackResult('api_error');
    }
  }

  /**
   * Builds the classification prompt for Gemini
   * Returns either a text-only prompt or multimodal content array
   */
  private buildPrompt(input: FoodClassificationInput): string | Array<string | { inlineData: { data: string; mimeType: string } }> {
    // Build base prompt text
    const hasImage = !!input.image;
    
    const basePrompt = `You are a food safety expert. Classify the following food item into a risk tier based on perishability and food safety considerations.

**Risk Tier Definitions:**
- HIGH (15 minutes TTL): Raw, perishable foods that spoil quickly (raw fish, uncooked meat, fresh dairy, cut fruit)
- MEDIUM (30 minutes TTL): Cooked foods, prepared items (cooked meat, pizza, sandwiches, cooked vegetables)
- LOW (60 minutes TTL): Shelf-stable, packaged foods (canned goods, packaged snacks, dried foods, unopened packaged items)

${hasImage ? '**Image Analysis:**\nAn image of the food item is provided. Analyze the visual characteristics to identify the food type, freshness indicators, packaging, and any visible quality markers.\n\n' : ''}`;

    const foodInfo = `**Food Item:**
Title: ${input.title}
Description: ${input.description}
${input.content ? `Additional Info: ${input.content}` : ''}`;

    const instructions = `
**Instructions:**
1. ${hasImage ? 'First, identify what food is shown in the image\n2. ' : ''}Analyze the food type, preparation method, and storage conditions
${hasImage ? '3' : '2'}. Consider time since preparation if mentioned
${hasImage ? '4' : '3'}. Classify into HIGH, MEDIUM, or LOW risk tier
${hasImage ? '5' : '4'}. Provide confidence score (0.0 to 1.0)
${hasImage ? '6' : '5'}. Explain your reasoning in 1-2 sentences

**Response Format (JSON only, no markdown):**
${hasImage ? `{
  "suggestedTitle": "detected food name from image",
  "suggestedDescription": "brief description of what you see in the image",
  "observations": "key visual observations about freshness, packaging, etc.",
  "riskTier": "high" | "medium" | "low",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}` : `{
  "riskTier": "high" | "medium" | "low",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}`}

Respond with ONLY the JSON object, no additional text.`;

    const textPrompt = basePrompt + foodInfo + instructions;

    // If image is provided, return multimodal content array
    if (input.image) {
      return [
        textPrompt,
        {
          inlineData: {
            data: input.image.data,
            mimeType: input.image.mimeType,
          },
        },
      ];
    }

    // Otherwise, return text-only prompt
    return textPrompt;
  }

  /**
   * Parses the Gemini API response into a ClassificationResult
   * 
   * @param responseText - Raw text response from Gemini API
   * @param hasImage - Whether the request included an image
   */
  private parseResponse(responseText: string, hasImage: boolean): ClassificationResult {
    try {
      // Remove markdown code blocks if present
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/```$/, '').trim();
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/```$/, '').trim();
      }

      // Parse JSON
      const parsed = JSON.parse(cleanText);

      // Validate risk tier
      const riskTier = this.validateRiskTier(parsed.riskTier);
      if (!riskTier) {
        throw new Error('Invalid risk tier in response');
      }

      // Validate confidence
      const confidence = typeof parsed.confidence === 'number' 
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.5;

      // Extract reasoning
      const reasoning = typeof parsed.reasoning === 'string' 
        ? parsed.reasoning 
        : 'AI classification completed';

      // Extract food data from image analysis (if image was provided)
      let extractedData: ExtractedFoodData | undefined;
      if (hasImage) {
        extractedData = {
          suggestedTitle: typeof parsed.suggestedTitle === 'string' ? parsed.suggestedTitle : undefined,
          suggestedDescription: typeof parsed.suggestedDescription === 'string' ? parsed.suggestedDescription : undefined,
          observations: typeof parsed.observations === 'string' ? parsed.observations : undefined,
        };
      }

      return {
        success: true,
        riskTier,
        confidence,
        reasoning,
        extractedData,
      };

    } catch (error) {
      console.error('[GeminiRiskClassifier] Failed to parse response:', error);
      this.lastError = 'parse_error';
      return this.createFallbackResult('parse_error');
    }
  }

  /**
   * Validates that a string is a valid RiskTier
   */
  private validateRiskTier(tier: any): RiskTier | null {
    if (tier === 'high' || tier === 'medium' || tier === 'low') {
      return tier as RiskTier;
    }
    return null;
  }

  /**
   * Creates a fallback result when classification fails
   */
  private createFallbackResult(error: GeminiError): ClassificationResult {
    return {
      success: false,
      riskTier: 'medium', // Safe default
      confidence: 0,
      reasoning: 'Classification failed - please select manually',
      error,
    };
  }
}
