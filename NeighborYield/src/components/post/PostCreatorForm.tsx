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
} from 'react-native';
import { RiskTier, TTL_VALUES } from '../../types';
import { RiskTierPicker } from './RiskTierPicker';

export interface PostCreatorFormProps {
  onSubmit: (data: PostFormData) => void;
  isSubmitting?: boolean;
}

export interface PostFormData {
  title: string;
  description: string;
  riskTier: RiskTier;
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

  const handleSubmit = useCallback(() => {
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
    onSubmit(formData);
  }, [title, description, riskTier, onSubmit]);

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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
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
            onChangeText={setDescription}
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
            onSelectTier={setRiskTier}
            disabled={isSubmitting}
          />
          <View style={styles.ttlPreviewContainer}>
            <Text style={styles.ttlPreview}>{ttlPreview}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
            pressed && !isSubmitting && styles.submitButtonPressed,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Create post"
          accessibilityState={{ disabled: isSubmitting }}>
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating...' : 'Share with Neighbors'}
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
});

export default PostCreatorForm;
