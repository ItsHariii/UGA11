/**
 * ImagePreview Component
 * Displays selected image with remove/replace actions and loading overlay
 * 
 * Requirements: 1.4, 5.1, 7.5
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import { X, RefreshCw } from 'lucide-react-native';
import { ImageAsset } from '../../services/image.service';

export interface ImagePreviewProps {
  image: ImageAsset;
  onRemove: () => void;
  onReplace: () => void;
  isAnalyzing?: boolean;
  testID?: string;
}

/**
 * ImagePreview Component
 * Displays selected image with rounded corners, overlay buttons, and loading state
 */
export function ImagePreview({
  image,
  onRemove,
  onReplace,
  isAnalyzing = false,
  testID = 'image-preview',
}: ImagePreviewProps): React.JSX.Element {
  return (
    <View style={styles.container} testID={testID}>
      {/* Image Display */}
      <Image
        source={{ uri: image.uri }}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel="Selected food image"
        testID={`${testID}-image`}
      />

      {/* Action Buttons Overlay */}
      {!isAnalyzing && (
        <View style={styles.actionsOverlay}>
          {/* Remove Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.removeButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel="Remove image"
            accessibilityHint="Removes the selected image"
            testID={`${testID}-remove-button`}>
            <X size={20} color="#ffffff" strokeWidth={2.5} />
          </Pressable>

          {/* Replace Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.replaceButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={onReplace}
            accessibilityRole="button"
            accessibilityLabel="Replace image"
            accessibilityHint="Choose a different image"
            testID={`${testID}-replace-button`}>
            <RefreshCw size={20} color="#ffffff" strokeWidth={2.5} />
          </Pressable>
        </View>
      )}

      {/* Loading Overlay */}
      {isAnalyzing && (
        <View style={styles.loadingOverlay} testID={`${testID}-loading-overlay`}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    // Earthy shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: '#f5f5f5',
  },
  actionsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow for buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  removeButton: {
    backgroundColor: '#ef5350', // Error red
  },
  replaceButton: {
    backgroundColor: '#2e7d32', // Primary green
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default ImagePreview;
