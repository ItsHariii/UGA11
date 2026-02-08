/**
 * PermissionExplanationScreen Component
 * Displays explanatory content for each permission type with a "Continue" button
 * to trigger the system permission request.
 *
 * Requirements: 7.2, 7.3, 7.4, 7.5
 */

import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { MeshPermission } from '../../types';

export interface PermissionExplanationScreenProps {
  permission: MeshPermission;
  onContinue: () => void;
  onSkip?: () => void;
}

/**
 * Permission explanation content for each permission type
 * Requirements: 7.3, 7.4, 7.5
 */
export interface PermissionExplanation {
  icon: string;
  title: string;
  description: string;
  benefit: string;
}

/**
 * Returns the explanation content for a given permission type
 */
export function getPermissionExplanation(permission: MeshPermission): PermissionExplanation {
  switch (permission) {
    case 'bluetooth':
      return {
        icon: '📶',
        title: 'Bluetooth Access',
        description:
          'Bluetooth enables device-to-device communication with your neighbors, even without internet.',
        benefit: 'Share food with nearby neighbors when WiFi or cellular is unavailable.',
      };
    case 'location':
      return {
        icon: '📍',
        title: 'Location Access',
        description:
          'Location permission is required by Android for Nearby Connections discovery to find neighbors around you.',
        benefit: 'Discover neighbors in your area who are sharing or looking for food.',
      };
    case 'nearby_devices':
      return {
        icon: '👥',
        title: 'Nearby Devices',
        description:
          'This permission enables finding neighbors for food sharing through the mesh network.',
        benefit: 'Connect directly with neighbors to share food, even offline.',
      };
    default:
      return {
        icon: '⚙️',
        title: 'Permission Required',
        description: 'This permission is needed for the app to function properly.',
        benefit: 'Enable full app functionality.',
      };
  }
}

export function PermissionExplanationScreen({
  permission,
  onContinue,
  onSkip,
}: PermissionExplanationScreenProps): React.JSX.Element {
  const explanation = getPermissionExplanation(permission);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{explanation.icon}</Text>
        </View>

        <Text style={styles.title}>{explanation.title}</Text>

        <Text style={styles.description}>{explanation.description}</Text>

        <View style={styles.benefitContainer}>
          <Text style={styles.benefitLabel}>Why this matters:</Text>
          <Text style={styles.benefitText}>{explanation.benefit}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.continueButton}
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel={`Continue to grant ${explanation.title}`}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>

        {onSkip && (
          <Pressable
            style={styles.skipButton}
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip this permission">
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#616161',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  benefitContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  benefitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#757575',
    fontSize: 16,
  },
});

export default PermissionExplanationScreen;
