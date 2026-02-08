/**
 * PostCreatorForm Component
 * Form for creating new share posts with title, description,
 * risk tier selector, and TTL preview.
 *
 * Requirements: 6.1
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { RiskTier, TTL_VALUES, AIAnalysisResult } from '../../types';
import { RiskTierPicker } from './RiskTierPicker';
import { ImageAsset, ImageService } from '../../services/image.service';
import { ImagePickerButton } from './ImagePickerButton';
import { ImagePreview } from './ImagePreview';
import { AIAnalysisIndicator } from './AIAnalysisIndicator';
import { GeminiRiskClassifier } from '../../services/GeminiRiskClassifier';
import { EnvConfig } from '../../utils/EnvConfig';
import { handleError, logError, ErrorType } from '../../utils/errorHandling';

// Initialize Gemini classifier
const geminiClassifier = new GeminiRiskClassifier(EnvConfig.geminiApiKey);

/**
 * Maps our comprehensive ErrorType to AIAnalysisResult error type
 */
function mapToAIErrorType(errorType: ErrorType): 'timeout' | 'rate_limit' | 'network_error' | 'invalid_image' | 'unknown' {
  switch (errorType) {
    case 'ai_timeout':
      return 'timeout';
    case 'ai_rate_limit':
      return 'rate_limit';
    case 'ai_network':
      return 'network_error';
    case 'image_validation':
    case 'image_too_large':
    case 'image_invalid_format':
    case 'image_corrupted':
      return 'invalid_image';
    default:
      return 'unknown';
  }
}

export interface PostCreatorFormProps {
  onSubmit: (data: PostFormData) => void;
  isSubmitting?: boolean;
}

export interface PostFormData {
  title: string;
  description: string;
  riskTier: RiskTier;
  imageUrl?: string;
}

/**
 * Formats TTL duration for display
 */
export function formatTTLPreview(riskTier: RiskTier): string {
  const ttlMs = TTL_VALUES[riskTier];
  const minutes = ttlMs / 60000;
  return `Expires in ${minutes} min`;
}

/**
 * Validates form data
 */
export function validateFormData(data: PostFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push('Title is required');
  } else if (data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  } else if (data.title.trim().length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (data.description.trim().length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function PostCreatorForm({
  onSubmit,
  isSubmitting = false,
}: PostCreatorFormProps): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [riskTier, setRiskTier] = useState<RiskTier>('medium');
  const [errors, setErrors] = useState<string[]>([]);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AIAnalysisResult | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // User override tracking - tracks which fields user has manually edited
  const [userOverrides, setUserOverrides] = useState<{
    title: boolean;
    description: boolean;
    riskTier: boolean;
  }>({
    title: false,
    description: false,
    riskTier: false,
  });

  // Handle title change with override tracking
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    // Mark as user-edited if the change is not from AI auto-population
    if (newTitle !== aiSuggestions?.suggestedTitle) {
      setUserOverrides(prev => ({ ...prev, title: true }));
    }
  }, [aiSuggestions?.suggestedTitle]);

  // Handle description change with override tracking
  const handleDescriptionChange = useCallback((newDescription: string) => {
    setDescription(newDescription);
    // Mark as user-edited if the change is not from AI auto-population
    if (newDescription !== aiSuggestions?.suggestedDescription) {
      setUserOverrides(prev => ({ ...prev, description: true }));
    }
  }, [aiSuggestions?.suggestedDescription]);

  // Handle risk tier change with override tracking and TTL recalculation
  const handleRiskTierChange = useCallback((newRiskTier: RiskTier) => {
    setRiskTier(newRiskTier);
    // Mark as user-edited if the change is not from AI auto-population
    if (newRiskTier !== aiSuggestions?.riskTier) {
      setUserOverrides(prev => ({ ...prev, riskTier: true }));
    }
    // TTL is automatically recalculated via formatTTLPreview(riskTier)
    // which is called in the render
  }, [aiSuggestions?.riskTier]);

  // Handle image selection
  const handleImageSelected = useCallback(async (image: ImageAsset) => {
    setSelectedImage(image);
    setAnalysisError(null);
    setAiSuggestions(null);
    
    // Check if AI classifier is available
    if (!geminiClassifier.isAvailable()) {
      console.log('AI classifier not available - skipping analysis');
      return;
    }
    
    // Start AI analysis
    setIsAnalyzing(true);
    
    try {
      // Convert image to base64 for AI analysis
      const base64Data = await ImageService.convertToBase64(image);
      
      // Create timeout promise (15 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Analysis timeout')), 15000);
      });
      
      // Race between AI analysis and timeout
      const result = await Promise.race([
        geminiClassifier.classifyFoodRisk({
          title: title || '',
          description: description || '',
          image: {
            data: base64Data,
            mimeType: image.type as 'image/jpeg' | 'image/png',
          },
        }),
        timeoutPromise,
      ]);
      
      // Handle successful analysis
      if (result.success && result.extractedData) {
        // Create AI suggestions object
        const suggestions: AIAnalysisResult = {
          success: true,
          suggestedTitle: result.extractedData.suggestedTitle,
          suggestedDescription: result.extractedData.suggestedDescription,
          observations: result.extractedData.observations,
          riskTier: result.riskTier,
          confidence: result.confidence,
        };
        
        setAiSuggestions(suggestions);
        
        // Auto-populate form fields only if user hasn't manually edited them
        // Preserve user edits over AI suggestions (Requirements 4.2)
        if (!userOverrides.title && !title && suggestions.suggestedTitle) {
          setTitle(suggestions.suggestedTitle);
        }
        if (!userOverrides.description && !description && suggestions.suggestedDescription) {
          setDescription(suggestions.suggestedDescription);
        }
        if (!userOverrides.riskTier && suggestions.riskTier) {
          setRiskTier(suggestions.riskTier);
        }
        
        setAnalysisError(null);
        console.log('AI analysis successful - Confidence:', result.confidence);
      } else {
        // Analysis failed but didn't throw
        // Requirements: 6.1 - Handle AI analysis errors with fallback to manual entry
        const errorDetails = handleError(
          new Error(result.error || 'unknown'),
          'AI analysis',
          { showAlert: false } // Don't show alert, just display inline error
        );
        
        // Map our error type to AIAnalysisResult error type
        const aiErrorType = mapToAIErrorType(errorDetails.type);
        
        setAnalysisError(errorDetails.userMessage);
        setAiSuggestions({ success: false, error: { type: aiErrorType, message: errorDetails.userMessage } });
      }
    } catch (error: any) {
      console.error('AI analysis error:', error);
      
      // Requirements: 6.1 - Handle AI analysis errors with fallback to manual entry
      const errorDetails = handleError(
        error,
        'AI analysis',
        { showAlert: false } // Don't show alert, just display inline error
      );
      
      // Map our error type to AIAnalysisResult error type
      const aiErrorType = mapToAIErrorType(errorDetails.type);
      
      setAnalysisError(errorDetails.userMessage);
      setAiSuggestions({ success: false, error: { type: aiErrorType, message: errorDetails.userMessage } });
    } finally {
      setIsAnalyzing(false);
    }
  }, [title, description, userOverrides]);

  // Handle image removal
  const handleImageRemove = useCallback(() => {
    setSelectedImage(null);
    setAiSuggestions(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    // Reset user overrides when image is removed
    setUserOverrides({
      title: false,
      description: false,
      riskTier: false,
    });
  }, []);

  // Handle image replacement
  const handleImageReplace = useCallback(() => {
    // Clear current image and allow new selection
    // The ImagePickerButton will be shown again
    handleImageRemove();
  }, [handleImageRemove]);

  const handleSubmit = useCallback(async () => {
    const formData: PostFormData = {
      title: title.trim(),
      description: description.trim(),
      riskTier,
    };

    const validation = validateFormData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);

    // If there's an image, upload it first
    if (selectedImage) {
      try {
        setIsUploadingImage(true);
        setUploadProgress(0);

        // Compress image before upload (Requirements 3.5)
        console.log('Compressing image before upload...');
        const compressedImage = await ImageService.compressImage(selectedImage);
        setUploadProgress(30);

        // Upload to Supabase with retry logic (Requirements 3.1, 3.2, 3.3, 3.4)
        console.log('Uploading image to Supabase...');
        const imageUrl = await ImageService.uploadToSupabase(
          compressedImage,
          'post-images',
          undefined // userId can be added later when auth is integrated
        );
        setUploadProgress(100);

        // Add image URL to form data
        formData.imageUrl = imageUrl;
        console.log('Image uploaded successfully:', imageUrl);
        
        setIsUploadingImage(false);
        setUploadProgress(0);
      } catch (error: any) {
        console.error('Image upload error:', error);
        setIsUploadingImage(false);
        setUploadProgress(0);
        
        // Requirements: 6.2 - Handle upload errors with retry/skip options
        const errorDetails = handleError(
          error,
          'Image upload',
          { showAlert: false } // We'll show custom alert below
        );
        
        // Show alert and let user decide
        return new Promise<void>((resolve) => {
          Alert.alert(
            'Image Upload Failed',
            errorDetails.userMessage + '\n\nWould you like to create the post without an image?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  setErrors([errorDetails.userMessage]);
                  resolve();
                },
              },
              {
                text: 'Retry Upload',
                onPress: async () => {
                  // Retry the upload
                  resolve();
                  await handleSubmit();
                },
              },
              {
                text: 'Continue Without Image',
                onPress: () => {
                  console.log('Continuing post creation without image');
                  // Submit without image
                  onSubmit(formData);
                  resolve();
                },
              },
            ]
          );
        });
      }
    }

    // Submit the form with or without image URL
    onSubmit(formData);
  }, [title, description, riskTier, selectedImage, onSubmit]);

  const ttlPreview = formatTTLPreview(riskTier);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Share Food</Text>

        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        {/* Image Picker Button - shown when no image selected */}
        {!selectedImage && (
          <View style={styles.imageSection}>
            <ImagePickerButton
              onImageSelected={handleImageSelected}
              disabled={isSubmitting}
              testID="post-creator-image-picker"
            />
          </View>
        )}

        {/* Image Preview - shown when image is selected */}
        {selectedImage && (
          <View style={styles.imageSection}>
            <ImagePreview
              image={selectedImage}
              onRemove={handleImageRemove}
              onReplace={handleImageReplace}
              isAnalyzing={isAnalyzing}
              testID="post-creator-image-preview"
            />
            
            {/* AI Analysis Indicator - shown below image preview */}
            <View style={styles.analysisIndicatorContainer}>
              <AIAnalysisIndicator
                isAnalyzing={isAnalyzing}
                error={analysisError}
                success={aiSuggestions?.success ?? false}
                testID="post-creator-analysis-indicator"
              />
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={handleTitleChange}
            placeholder="What are you sharing?"
            placeholderTextColor="#9e9e9e"
            maxLength={100}
            editable={!isSubmitting}
            accessibilityLabel="Post title"
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="Add details about your food item..."
            placeholderTextColor="#9e9e9e"
            multiline
            numberOfLines={4}
            maxLength={500}
            editable={!isSubmitting}
            accessibilityLabel="Post description"
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Perishability Risk</Text>
          <RiskTierPicker
            selectedTier={riskTier}
            onSelectTier={handleRiskTierChange}
            disabled={isSubmitting}
          />
          <View style={styles.ttlPreviewContainer}>
            <Text style={styles.ttlPreview}>{ttlPreview}</Text>
          </View>
        </View>

        {/* Upload Progress Indicator */}
        {isUploadingImage && (
          <View style={styles.uploadProgressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.uploadProgressText}>
              Uploading image... {uploadProgress}%
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            (isSubmitting || isUploadingImage) && styles.submitButtonDisabled,
            pressed && !isSubmitting && !isUploadingImage && styles.submitButtonPressed,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || isUploadingImage}
          accessibilityRole="button"
          accessibilityLabel="Create post"
          accessibilityState={{ disabled: isSubmitting || isUploadingImage }}>
          <Text style={styles.submitButtonText}>
            {isUploadingImage
              ? `Uploading image... ${uploadProgress}%`
              : isSubmitting
              ? 'Creating...'
              : 'Share with Neighbors'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding to prevent overlap with floating nav bar
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9e9e9e',
    textAlign: 'right',
    marginTop: 4,
  },
  ttlPreviewContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  ttlPreview: {
    fontSize: 14,
    color: '#616161',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 20,
  },
  analysisIndicatorContainer: {
    marginTop: 12,
  },
  uploadProgressContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2e7d32',
    borderRadius: 4,
  },
  uploadProgressText: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PostCreatorForm;
