/**
 * PresenceTooltip Component
 * Shows mesh network status explanation on tap.
 *
 * Requirements: 4.5
 */

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ConnectivityMode } from '../../types';

export interface PresenceTooltipProps {
  visible: boolean;
  onClose: () => void;
  peerCount: number;
  connectivityMode: ConnectivityMode;
}

/**
 * Returns explanation text based on connectivity mode and peer count
 */
export function getTooltipExplanation(mode: ConnectivityMode, peerCount: number): string {
  switch (mode) {
    case 'online':
      return 'You are connected to the internet. Your posts and interests are synced with the cloud, reaching neighbors citywide.';
    case 'offline':
      if (peerCount > 0) {
        return `You are in offline mesh mode. ${peerCount} neighbor${peerCount === 1 ? ' is' : 's are'} nearby and can receive your posts directly via Bluetooth.`;
      }
      return 'You are in offline mesh mode, but no neighbors are currently in range. Your posts will be shared when neighbors come nearby.';
    default:
      return 'Checking network status...';
  }
}

/**
 * Returns the title for the tooltip based on connectivity mode
 */
export function getTooltipTitle(mode: ConnectivityMode): string {
  switch (mode) {
    case 'online':
      return '🌐 Online Mode';
    case 'offline':
      return '📡 Mesh Network Mode';
    default:
      return 'Network Status';
  }
}

export function PresenceTooltip({
  visible,
  onClose,
  peerCount,
  connectivityMode,
}: PresenceTooltipProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.tooltipContainer}>
          <Pressable onPress={e => e.stopPropagation()}>
            <View style={styles.tooltip}>
              <Text style={styles.title}>{getTooltipTitle(connectivityMode)}</Text>
              <Text style={styles.explanation}>
                {getTooltipExplanation(connectivityMode, peerCount)}
              </Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Got it</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    width: '85%',
    maxWidth: 320,
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
  },
  explanation: {
    fontSize: 15,
    color: '#616161',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PresenceTooltip;
