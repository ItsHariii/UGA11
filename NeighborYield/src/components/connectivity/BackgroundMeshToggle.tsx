/**
 * BackgroundMeshToggle Component
 * Settings toggle for background mesh option.
 *
 * Requirements: 9.3
 */

import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

export interface BackgroundMeshToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Returns the description text for the toggle
 */
export function getToggleDescription(enabled: boolean): string {
  if (enabled) {
    return 'Mesh networking stays active in background (uses more battery)';
  }
  return 'Mesh networking pauses when app is in background';
}

/**
 * Returns the battery impact text
 */
export function getBatteryImpactText(enabled: boolean): string {
  if (enabled) {
    return 'Higher battery usage • Heartbeat every 60s';
  }
  return 'Battery optimized • Resumes when app opens';
}

export function BackgroundMeshToggle({
  enabled,
  onToggle,
  disabled = false,
  disabledReason,
}: BackgroundMeshToggleProps): React.JSX.Element {
  const handleToggle = (value: boolean) => {
    if (!disabled) {
      onToggle(value);
    }
  };

  return (
    <View style={[styles.container, disabled && styles.disabledContainer]}>
      <View style={styles.header}>
        <Text style={styles.icon}>📡</Text>
        <Text style={[styles.title, disabled && styles.disabledText]}>Background Mesh</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.description, disabled && styles.disabledText]}>
            {getToggleDescription(enabled)}
          </Text>
          <View style={styles.batteryRow}>
            <Text style={styles.batteryIcon}>🔋</Text>
            <Text style={[styles.batteryText, disabled && styles.disabledText]}>
              {getBatteryImpactText(enabled)}
            </Text>
          </View>
        </View>

        <Switch
          value={enabled}
          onValueChange={handleToggle}
          disabled={disabled}
          trackColor={{ false: '#e0e0e0', true: '#81c784' }}
          thumbColor={enabled ? '#2e7d32' : '#f5f5f5'}
          accessibilityLabel="Background mesh toggle"
          accessibilityHint={
            enabled
              ? 'Turn off to save battery when app is in background'
              : 'Turn on to keep mesh active in background'
          }
        />
      </View>

      {disabled && disabledReason && (
        <View style={styles.disabledBanner}>
          <Text style={styles.disabledIcon}>ℹ️</Text>
          <Text style={styles.disabledReason}>{disabledReason}</Text>
        </View>
      )}

      {enabled && !disabled && (
        <Pressable style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚡</Text>
          <Text style={styles.warningText}>
            Background mesh will automatically disable when battery falls below 15%
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledContainer: {
    backgroundColor: '#fafafa',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  description: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  batteryIcon: {
    fontSize: 12,
  },
  batteryText: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  disabledText: {
    color: '#bdbdbd',
  },
  disabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  disabledIcon: {
    fontSize: 14,
  },
  disabledReason: {
    flex: 1,
    fontSize: 13,
    color: '#757575',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fff3e0',
    backgroundColor: '#fff8e1',
    marginHorizontal: -16,
    marginBottom: -16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  warningIcon: {
    fontSize: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#f57c00',
    lineHeight: 16,
  },
});

// ============================================
// Memoized Export
// Requirements: 9.2 - Minimize component re-renders using React.memo
// ============================================

export const MemoizedBackgroundMeshToggle = React.memo(BackgroundMeshToggle);
MemoizedBackgroundMeshToggle.displayName = 'BackgroundMeshToggle';

export default MemoizedBackgroundMeshToggle;
