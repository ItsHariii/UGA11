/**
 * ImagePreview Component Example
 * Demonstrates usage of the ImagePreview component
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { ImagePreview } from './ImagePreview';
import { ImageAsset } from '../../services/image.service';

/**
 * Example usage of ImagePreview component
 */
export function ImagePreviewExample(): React.JSX.Element {
  const [showExample1, setShowExample1] = useState(true);
  const [showExample2, setShowExample2] = useState(true);

  // Mock image asset
  const mockImage: ImageAsset = {
    uri: 'https://via.placeholder.com/400x300',
    type: 'image/jpeg',
    fileName: 'example.jpg',
    fileSize: 1024000,
    width: 400,
    height: 300,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ImagePreview Examples</Text>

      {/* Example 1: Normal State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Normal State (with actions)</Text>
        {showExample1 && (
          <ImagePreview
            image={mockImage}
            onRemove={() => {
              console.log('Remove clicked');
              setShowExample1(false);
            }}
            onReplace={() => {
              console.log('Replace clicked');
            }}
            isAnalyzing={false}
            testID="example-1"
          />
        )}
        {!showExample1 && (
          <Text style={styles.removedText}>Image removed</Text>
        )}
      </View>

      {/* Example 2: Analyzing State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Analyzing State (loading overlay)</Text>
        {showExample2 && (
          <ImagePreview
            image={mockImage}
            onRemove={() => {
              console.log('Remove clicked');
              setShowExample2(false);
            }}
            onReplace={() => {
              console.log('Replace clicked');
            }}
            isAnalyzing={true}
            testID="example-2"
          />
        )}
        {!showExample2 && (
          <Text style={styles.removedText}>Image removed</Text>
        )}
      </View>

      {/* Example 3: Different Image */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Different Image</Text>
        <ImagePreview
          image={{
            ...mockImage,
            uri: 'https://via.placeholder.com/600x400',
          }}
          onRemove={() => console.log('Remove clicked')}
          onReplace={() => console.log('Replace clicked')}
          isAnalyzing={false}
          testID="example-3"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 12,
  },
  removedText: {
    fontSize: 14,
    color: '#9e9e9e',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 24,
  },
});

export default ImagePreviewExample;
