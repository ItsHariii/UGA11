/**
 * Battery Indicator Component
 * 
 * Displays battery level with color coding and power save mode indicator
 * Used in SurvivalConnectivityIsland
 * 
 * Requirements: 6.6
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getBatteryColor, getBatteryIcon } from '../../hooks/useBatteryMonitor';

export interface BatteryIndicatorProps {
  level: number;
  isCharging: boolean;
  powerSaveMode: boolean;
  compact?: boolean;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  level,
  isCharging,
  powerSaveMode,
  compact = false,
}) => {
  const color = getBatteryColor(level);
  const icon = getBatteryIcon(level, isCharging);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.level, { color }]}>
        {level}%
      </Text>
      {powerSaveMode && !compact && (
        <View style={styles.powerSaveBadge}>
          <Text style={styles.powerSaveText}>PS</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 14,
  },
  level: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  powerSaveBadge: {
    backgroundColor: '#FFAB00',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 4,
  },
  powerSaveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
});
