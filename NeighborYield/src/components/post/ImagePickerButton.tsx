/**
 * ImagePickerButton Component
 * Button for selecting images from camera or photo library
 * 
 * Requirements: 1.1, 1.2, 7.1, 7.2, 7.4
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { Camera } from 'lucide-react-native';
import { ImageAsset, ImageService } from '../../services/image.service';
import { handleError } from '../../utils/errorHandling';

export interface ImagePickerButtonProps {
  onImageSelected: (image: ImageAsset) => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * ImagePickerButton Component
 * Displays a button with camera icon and dashed border
 * Opens action sheet to select camera or photo library
 */
export function ImagePickerButton({
  onImageSelected,
  disabled = false,
  testID = 'image-picker-button',
}: ImagePickerButtonProps): React.JSX.Element {
  /**
   * Shows action sheet with camera/library options
   */
  const showImageSourceOptions = useCallback(() => {
    if (disabled) return;

    if (Platform.OS === 'ios') {
      // iOS Action Sheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
          title: 'Add Photo',
          message: 'Select a photo of your food item',
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            // Take Photo
            await handleImagePick('camera');
          } else if (buttonIndex === 2) {
            // Choose from Library
            await handleImagePick('library');
          }
        }
      );
    } else {
      // Android Alert (simpler alternative to ActionSheet)
      Alert.alert(
        'Add Photo',
        'Select a photo of your food item',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Take Photo',
            onPress: () => handleImagePick('camera'),
          },
          {
            text: 'Choose from Library',
            onPress: () => handleImagePick('library'),
          },
        ],
        { cancelable: true }
      );
    }
  }, [disabled]);

  /**
   * Handles image picking from camera or library
   * Requirements: 6.1, 6.3
   */
  const handleImagePick = async (source: 'camera' | 'library') => {
    try {
      const image = await ImageService.pickImage(source);
      onImageSelected(image);
    } catch (error: any) {
      // Check if user cancelled - this is not an error, just return silently
      const errorMessage = error?.message || error?.toString() || '';
      if (
        errorMessage.includes('cancelled') ||
        errorMessage.includes('canceled') ||
        errorMessage.includes('User cancelled') ||
        error?.code === 'E_PICKER_CANCELLED'
      ) {
        // User cancelled - this is normal, don't show error
        return;
      }

      // Handle actual errors with centralized error handler
      handleError(
        error,
        `Image picker (${source})`,
        {
          showAlert: true,
          onRetry: () => handleImagePick(source),
        }
      );
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        disabled && styles.containerDisabled,
        pressed && !disabled && styles.containerPressed,
      ]}
      onPress={showImageSourceOptions}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Add photo"
      accessibilityHint="Opens options to take a photo or choose from library"
      accessibilityState={{ disabled }}
      testID={testID}>
      <View style={styles.content}>
        <Camera
          size={32}
          color={disabled ? '#9e9e9e' : '#2e7d32'}
          strokeWidth={2}
        />
        <Text style={[styles.text, disabled && styles.textDisabled]}>
          Add Photo
        </Text>
        <Text style={[styles.subtext, disabled && styles.subtextDisabled]}>
          Take a photo or choose from library
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2e7d32',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    // Earthy shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  containerDisabled: {
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  containerPressed: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginTop: 4,
  },
  textDisabled: {
    color: '#9e9e9e',
  },
  subtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  subtextDisabled: {
    color: '#9e9e9e',
  },
});

export default ImagePickerButton;
