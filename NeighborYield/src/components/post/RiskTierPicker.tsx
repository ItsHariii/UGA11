/**
 * RiskTierPicker Component
 * Three-option selector for food perishability risk tier
 * with icons and TTL labels.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { RiskTier, TTL_VALUES } from '../../types';

export interface RiskTierPickerProps {
  selectedTier: RiskTier;
  onSelectTier: (tier: RiskTier) => void;
  disabled?: boolean;
}

export interface RiskTierOption {
  tier: RiskTier;
  label: string;
  icon: string;
  description: string;
  ttlLabel: string;
  color: string;
}

/**
 * Returns TTL label for a risk tier
 */
export function getTTLLabel(tier: RiskTier): string {
  const ttlMs = TTL_VALUES[tier];
  const minutes = ttlMs / 60000;
  return `${minutes} min`;
}

/**
 * Risk tier configuration with icons and descriptions
 */
export const RISK_TIER_OPTIONS: RiskTierOption[] = [
  {
    tier: 'high',
    label: 'High',
    icon: '🔥',
    description: 'Highly perishable',
    ttlLabel: getTTLLabel('high'),
    color: '#d32f2f',
  },
  {
    tier: 'medium',
    label: 'Medium',
    icon: '⏱️',
    description: 'Moderately perishable',
    ttlLabel: getTTLLabel('medium'),
    color: '#f57c00',
  },
  {
    tier: 'low',
    label: 'Low',
    icon: '📦',
    description: 'Shelf-stable',
    ttlLabel: getTTLLabel('low'),
    color: '#388e3c',
  },
];

export function RiskTierPicker({
  selectedTier,
  onSelectTier,
  disabled = false,
}: RiskTierPickerProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {RISK_TIER_OPTIONS.map((option) => {
        const isSelected = selectedTier === option.tier;

        return (
          <Pressable
            key={option.tier}
            style={({ pressed }) => [
              styles.option,
              isSelected && styles.optionSelected,
              isSelected && { borderColor: option.color },
              disabled && styles.optionDisabled,
              pressed && !disabled && styles.optionPressed,
            ]}
            onPress={() => onSelectTier(option.tier)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityLabel={`${option.label} risk: ${option.description}, expires in ${option.ttlLabel}`}
            accessibilityState={{ selected: isSelected, disabled }}
          >
            <Text style={styles.icon}>{option.icon}</Text>
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && { color: option.color },
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <View
              style={[
                styles.ttlBadge,
                isSelected && { backgroundColor: option.color },
              ]}
            >
              <Text
                style={[
                  styles.ttlBadgeText,
                  isSelected && styles.ttlBadgeTextSelected,
                ]}
              >
                {option.ttlLabel}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 12,
  },
  optionSelected: {
    backgroundColor: '#fafafa',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionPressed: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#757575',
  },
  ttlBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ttlBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#616161',
  },
  ttlBadgeTextSelected: {
    color: '#ffffff',
  },
});

export default RiskTierPicker;
