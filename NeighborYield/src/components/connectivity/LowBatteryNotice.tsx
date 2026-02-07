/**
 * LowBatteryNotice Component
 * Notification when battery < 15% disables background mesh.
 *
 * Requirements: 9.5
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

export interface LowBatteryNoticeProps {
  batteryLevel: number;
  visible: boolean;
  onDismiss?: () => void;
}

/**
 * Low battery threshold constant (15%)
 */
export const LOW_BATTERY_THRESHOLD = 15;

/**
 * Returns whether battery level is considered low
 */
export function isLowBattery(level: number): boolean {
  return level < LOW_BATTERY_THRESHOLD;
}

/**
 * Returns the notice message based on battery level
 */
export function getNoticeMessage(batteryLevel: number): string {
  return `Battery at ${batteryLevel}%. Background mesh has been disabled to conserve power.`;
}

/**
 * Returns the action hint text
 */
export function getActionHint(): string {
  return 'Mesh will resume when battery is charged above 15%';
}

export function LowBatteryNotice({
  batteryLevel,
  visible,
  onDismiss,
}: LowBatteryNoticeProps): React.JSX.Element | null {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={getNoticeMessage(batteryLevel)}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🪫</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Low Battery</Text>
          <Text style={styles.message}>{getNoticeMessage(batteryLevel)}</Text>
          <Text style={styles.hint}>{getActionHint()}</Text>
        </View>

        {onDismiss && (
          <Pressable
            style={styles.dismissButton}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notice"
          >
            <Text style={styles.dismissIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.batteryIndicator}>
        <View style={styles.batteryTrack}>
          <View
            style={[
              styles.batteryFill,
              { width: `${Math.max(batteryLevel, 5)}%` },
            ]}
          />
        </View>
        <Text style={styles.batteryText}>{batteryLevel}%</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffcc80',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffe0b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#bf360c',
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    color: '#f57c00',
    marginTop: 6,
    fontStyle: 'italic',
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffe0b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  dismissIcon: {
    fontSize: 14,
    color: '#e65100',
    fontWeight: '600',
  },
  batteryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffcc80',
    gap: 8,
  },
  batteryTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#ffe0b2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    backgroundColor: '#ff9800',
    borderRadius: 4,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e65100',
    minWidth: 36,
    textAlign: 'right',
  },
});

export default LowBatteryNotice;
