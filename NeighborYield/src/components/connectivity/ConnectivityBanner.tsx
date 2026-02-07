/**
 * ConnectivityBanner Component
 * Shows current connectivity mode (Online/Offline/Hybrid)
 * with warning for disconnected state and instructions.
 *
 * Requirements: 10.4
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ConnectivityMode } from '../../types';

export interface ConnectivityBannerProps {
  mode: ConnectivityMode;
  onDisconnectedPress?: () => void;
}

export interface ModeConfig {
  icon: string;
  label: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  isWarning: boolean;
}

/**
 * Returns configuration for each connectivity mode
 */
export function getModeConfig(mode: ConnectivityMode): ModeConfig {
  switch (mode) {
    case 'online':
      return {
        icon: '🌐',
        label: 'Online',
        description: 'Connected via internet',
        backgroundColor: '#e3f2fd',
        textColor: '#1565c0',
        isWarning: false,
      };
    case 'offline':
      return {
        icon: '📡',
        label: 'Offline',
        description: 'Connected via local mesh',
        backgroundColor: '#e8f5e9',
        textColor: '#2e7d32',
        isWarning: false,
      };
    case 'hybrid':
      return {
        icon: '🔗',
        label: 'Hybrid',
        description: 'Internet + local mesh active',
        backgroundColor: '#f3e5f5',
        textColor: '#7b1fa2',
        isWarning: false,
      };
    case 'disconnected':
      return {
        icon: '⚠️',
        label: 'Disconnected',
        description: 'No connection available',
        backgroundColor: '#ffebee',
        textColor: '#c62828',
        isWarning: true,
      };
    default:
      return {
        icon: '❓',
        label: 'Unknown',
        description: 'Connection status unknown',
        backgroundColor: '#f5f5f5',
        textColor: '#616161',
        isWarning: false,
      };
  }
}

/**
 * Returns instructions for disconnected state
 */
export function getDisconnectedInstructions(): string {
  return 'Enable Bluetooth and Location permissions, or connect to the internet to share and discover food.';
}

export function ConnectivityBanner({
  mode,
  onDisconnectedPress,
}: ConnectivityBannerProps): React.JSX.Element {
  const config = getModeConfig(mode);
  const isDisconnected = mode === 'disconnected';

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        isDisconnected && styles.warningContainer,
      ]}
    >
      <View style={styles.mainRow}>
        <Text style={styles.icon}>{config.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: config.textColor }]}>
            {config.label}
          </Text>
          <Text style={[styles.description, { color: config.textColor }]}>
            {config.description}
          </Text>
        </View>
      </View>

      {isDisconnected && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            {getDisconnectedInstructions()}
          </Text>
          <Text style={styles.tapHint}>Tap for settings</Text>
        </View>
      )}
    </View>
  );

  if (isDisconnected && onDisconnectedPress) {
    return (
      <Pressable
        onPress={onDisconnectedPress}
        accessibilityRole="button"
        accessibilityLabel="Disconnected. Tap to open settings."
        accessibilityHint="Opens settings to enable permissions or connect to internet"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  warningContainer: {
    borderWidth: 1,
    borderColor: '#ef9a9a',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.85,
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ef9a9a',
  },
  instructions: {
    fontSize: 13,
    color: '#c62828',
    lineHeight: 18,
  },
  tapHint: {
    fontSize: 12,
    color: '#c62828',
    fontWeight: '500',
    marginTop: 8,
    opacity: 0.8,
  },
});

export default ConnectivityBanner;
