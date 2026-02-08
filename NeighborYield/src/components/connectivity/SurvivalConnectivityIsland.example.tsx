/**
 * Example usage of SurvivalConnectivityIsland component
 * This file demonstrates how to integrate the component in your app
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SurvivalConnectivityIsland } from './SurvivalConnectivityIsland';

/**
 * Example 1: Basic usage with static props
 */
export function BasicExample() {
  return (
    <View style={styles.container}>
      <SurvivalConnectivityIsland
        peerCount={3}
        isDiscovering={false}
        batteryLevel={75}
        lastSyncTime={Date.now() - 2 * 60 * 1000} // 2 minutes ago
        onPress={() => Alert.alert('Connection Details', 'Show connection details modal here')}
      />
    </View>
  );
}

/**
 * Example 2: Searching state with low battery
 */
export function SearchingExample() {
  return (
    <View style={styles.container}>
      <SurvivalConnectivityIsland
        peerCount={0}
        isDiscovering={true}
        batteryLevel={15}
        lastSyncTime={Date.now() - 10 * 60 * 1000} // 10 minutes ago
        onPress={() => Alert.alert('Searching', 'Currently searching for neighbors...')}
      />
    </View>
  );
}

/**
 * Example 3: Connected state with multiple peers
 */
export function ConnectedExample() {
  return (
    <View style={styles.container}>
      <SurvivalConnectivityIsland
        peerCount={5}
        isDiscovering={false}
        batteryLevel={92}
        lastSyncTime={Date.now() - 30 * 1000} // 30 seconds ago
        onPress={() => Alert.alert('Connected', 'Connected to 5 neighbors')}
      />
    </View>
  );
}

/**
 * Example 4: Dynamic state with live updates
 */
export function DynamicExample() {
  const [peerCount, setPeerCount] = useState(2);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(60);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());

  // Simulate peer connection
  const simulatePeerConnection = () => {
    setPeerCount(prev => prev + 1);
    setLastSyncTime(Date.now());
  };

  // Simulate discovery toggle
  const toggleDiscovery = () => {
    setIsDiscovering(prev => !prev);
  };

  // Simulate battery drain
  const simulateBatteryDrain = () => {
    setBatteryLevel(prev => Math.max(0, prev - 10));
  };

  return (
    <View style={styles.container}>
      <SurvivalConnectivityIsland
        peerCount={peerCount}
        isDiscovering={isDiscovering}
        batteryLevel={batteryLevel}
        lastSyncTime={lastSyncTime}
        onPress={() => {
          Alert.alert(
            'Connection Details',
            `Peers: ${peerCount}\nDiscovering: ${isDiscovering}\nBattery: ${batteryLevel}%`,
            [
              { text: 'Add Peer', onPress: simulatePeerConnection },
              { text: 'Toggle Discovery', onPress: toggleDiscovery },
              { text: 'Drain Battery', onPress: simulateBatteryDrain },
              { text: 'Close', style: 'cancel' },
            ]
          );
        }}
      />
    </View>
  );
}

/**
 * Example 5: Integration with app state
 * This shows how to connect the component to your app's state management
 */
export function IntegratedExample() {
  // In a real app, these would come from your state management (Context, Redux, etc.)
  const appState = {
    survivalMode: {
      peerCount: 3,
      isDiscovering: false,
      batteryLevel: 45,
      lastSyncTime: Date.now() - 5 * 60 * 1000, // 5 minutes ago
    },
  };

  const handlePress = () => {
    // In a real app, this would navigate to a connection details screen
    // or show a modal with detailed connection information
    Alert.alert(
      'Connection Details',
      `Connected to ${appState.survivalMode.peerCount} neighbors\n` +
      `Battery: ${appState.survivalMode.batteryLevel}%\n` +
      `Last sync: 5 minutes ago`
    );
  };

  return (
    <View style={styles.container}>
      <SurvivalConnectivityIsland
        peerCount={appState.survivalMode.peerCount}
        isDiscovering={appState.survivalMode.isDiscovering}
        batteryLevel={appState.survivalMode.batteryLevel}
        lastSyncTime={appState.survivalMode.lastSyncTime}
        onPress={handlePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#0D1210', // Survival mode background
  },
});
