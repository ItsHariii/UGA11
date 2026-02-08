/**
 * ImagePickerButton Example Usage
 * Demonstrates how to use the ImagePickerButton component
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ImagePickerButton } from './ImagePickerButton';
import { ImageAsset } from '../../services/image.service';

/**
 * Example: Basic usage of ImagePickerButton
 */
export function ImagePickerButtonExample() {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);

  const handleImageSelected = (image: ImageAsset) => {
    console.log('Image selected:', {
      uri: image.uri,
      type: image.type,
      size: image.fileSize,
      dimensions: `${image.width}x${image.height}`,
    });
    setSelectedImage(image);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Picker Example</Text>

      {!selectedImage ? (
        <ImagePickerButton onImageSelected={handleImageSelected} />
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
          <Text style={styles.info}>
            Size: {(selectedImage.fileSize / 1024).toFixed(2)} KB
          </Text>
          <Text style={styles.info}>
            Dimensions: {selectedImage.width}x{selectedImage.height}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Example: Disabled state
 */
export function ImagePickerButtonDisabledExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Disabled State</Text>
      <ImagePickerButton
        onImageSelected={() => {}}
        disabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  previewContainer: {
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  info: {
    fontSize: 14,
    color: '#757575',
  },
});
