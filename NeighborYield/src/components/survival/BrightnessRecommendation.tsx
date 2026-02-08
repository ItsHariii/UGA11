/**
 * Brightness Recommendation Component
 * 
 * Shows a notification when battery is low, recommending to reduce screen brightness
 * 
 * Requirements: 6.5
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export interface BrightnessRecommendationProps {
  visible: boolean;
  batteryLevel: number;
  onDismiss: () => void;
}

export const BrightnessRecommendation: React.FC<BrightnessRecommendationProps> = ({
  visible,
  batteryLevel,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>💡</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Low Battery ({batteryLevel}%)</Text>
          <Text style={styles.message}>
            Consider reducing screen brightness to extend battery life
          </Text>
        </View>
        <Pressable
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss brightness recommendation"
        >
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#1A2420',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FFAB00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#E8E8E8',
    lineHeight: 20,
  },
  dismissButton: {
    padding: 8,
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 20,
    color: '#A5A5A5',
  },
});
