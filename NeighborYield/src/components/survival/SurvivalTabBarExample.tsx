/**
 * SurvivalTabBar Example
 * Demonstrates the SOS unread badge functionality
 * 
 * This example shows how the badge appears with different unread counts
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SurvivalTabBar, SurvivalTab } from './SurvivalTabBar';

export function SurvivalTabBarExample(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SurvivalTab>('community');
  const [sosUnreadCount, setSosUnreadCount] = useState(3);

  const incrementCount = () => setSosUnreadCount(prev => prev + 1);
  const decrementCount = () => setSosUnreadCount(prev => Math.max(0, prev - 1));
  const resetCount = () => setSosUnreadCount(0);
  const setLargeCount = () => setSosUnreadCount(99);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS Unread Badge Demo</Text>
      
      {/* Tab Bar with Badge */}
      <SurvivalTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sosUnreadCount={sosUnreadCount}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.countLabel}>
          Current Count: {sosUnreadCount}
        </Text>
        
        <View style={styles.buttonRow}>
          <Pressable style={styles.button} onPress={decrementCount}>
            <Text style={styles.buttonText}>-1</Text>
          </Pressable>
          
          <Pressable style={styles.button} onPress={incrementCount}>
            <Text style={styles.buttonText}>+1</Text>
          </Pressable>
          
          <Pressable style={styles.button} onPress={resetCount}>
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>
          
          <Pressable style={styles.button} onPress={setLargeCount}>
            <Text style={styles.buttonText}>99</Text>
          </Pressable>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            ✅ Badge shows when count {'>'} 0
          </Text>
          <Text style={styles.infoText}>
            ✅ Badge hides when count = 0
          </Text>
          <Text style={styles.infoText}>
            ✅ Red circle (#FF5252)
          </Text>
          <Text style={styles.infoText}>
            ✅ White count text
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  controls: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#0D1210',
    borderRadius: 8,
  },
  countLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4AEDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#161E1A',
    borderRadius: 4,
  },
  infoText: {
    color: '#E8F5E9',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default SurvivalTabBarExample;
