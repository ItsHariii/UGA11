/**
 * BluetoothDisabledPrompt Component
 * Prompts user to enable system Bluetooth for mesh networking.
 *
 * Requirements: 8.4
 */

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface BluetoothDisabledPromptProps {
  visible: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

export function BluetoothDisabledPrompt({
  visible,
  onEnable,
  onDismiss,
}: BluetoothDisabledPromptProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.promptContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📶</Text>
          </View>

          <Text style={styles.title}>Bluetooth is Off</Text>

          <Text style={styles.description}>
            Turn on Bluetooth to connect with neighbors nearby and share food
            even without internet.
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Share food offline</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Connect with nearby neighbors</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Works without WiFi or cellular</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.enableButton}
              onPress={onEnable}
              accessibilityRole="button"
              accessibilityLabel="Enable Bluetooth"
            >
              <Text style={styles.enableButtonText}>Enable Bluetooth</Text>
            </Pressable>

            <Pressable
              style={styles.dismissButton}
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Not now"
            >
              <Text style={styles.dismissButtonText}>Not Now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  promptContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#616161',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsList: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitIcon: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '700',
  },
  benefitText: {
    fontSize: 14,
    color: '#424242',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  enableButton: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  enableButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#757575',
    fontSize: 15,
  },
});

export default BluetoothDisabledPrompt;
