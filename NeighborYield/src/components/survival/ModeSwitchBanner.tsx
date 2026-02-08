/**
 * Mode Switch Banner Component
 * 
 * Displays notifications when switching between Abundance and Survival modes.
 * Shows sync progress and status messages.
 * 
 * Requirements: 10.4
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';

export interface ModeSwitchBannerProps {
  visible: boolean;
  message: string;
  type: 'info' | 'success' | 'warning';
  syncProgress?: number;
  syncMessage?: string;
  onDismiss: () => void;
}

export const ModeSwitchBanner: React.FC<ModeSwitchBannerProps> = ({
  visible,
  message,
  type,
  syncProgress,
  syncMessage,
  onDismiss,
}) => {
  if (!visible) return null;

  const backgroundColor = {
    info: '#1A2420',
    success: '#1A3A2A',
    warning: '#3A2A1A',
  }[type];

  const borderColor = {
    info: '#4AEDC4',
    success: '#4AEDC4',
    warning: '#FFAB00',
  }[type];

  const icon = {
    info: '📡',
    success: '✓',
    warning: '⚠️',
  }[type];

  const showProgress = syncProgress !== undefined && syncProgress < 100;

  return (
    <View style={styles.container}>
      <View style={[styles.content, { backgroundColor, borderLeftColor: borderColor }]}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          {showProgress && syncMessage && (
            <View style={styles.progressContainer}>
              <Text style={styles.syncMessage}>{syncMessage}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${syncProgress}%`, backgroundColor: borderColor }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>
        {!showProgress && (
          <Pressable
            onPress={onDismiss}
            style={styles.dismissButton}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
          >
            <Text style={styles.dismissText}>✕</Text>
          </Pressable>
        )}
        {showProgress && (
          <ActivityIndicator size="small" color={borderColor} />
        )}
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
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
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
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  syncMessage: {
    fontSize: 14,
    color: '#E8E8E8',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
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
