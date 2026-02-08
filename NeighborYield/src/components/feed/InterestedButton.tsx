/**
 * InterestedButton Component
 * "I'm Interested" button with loading, success, and error states.
 *
 * Requirements: 1.1
 */

import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type InterestButtonState = 'idle' | 'loading' | 'success' | 'error';

export interface InterestedButtonProps {
  state: InterestButtonState;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Returns the button text based on current state
 */
export function getButtonText(state: InterestButtonState): string {
  switch (state) {
    case 'idle':
      return "I'm Interested";
    case 'loading':
      return 'Sending...';
    case 'success':
      return 'Interest Sent ✓';
    case 'error':
      return 'Try Again';
    default:
      return "I'm Interested";
  }
}

export function InterestedButton({
  state,
  onPress,
  disabled = false,
}: InterestedButtonProps): React.JSX.Element {
  const isDisabled = disabled || state === 'loading' || state === 'success';
  const { tokens } = useTheme();

  // Derive darker variant of accentPrimary for success state
  const successBackground = tokens.colors.accentPrimary.replace(/^#/, '');
  const r = parseInt(successBackground.substring(0, 2), 16);
  const g = parseInt(successBackground.substring(2, 4), 16);
  const b = parseInt(successBackground.substring(4, 6), 16);
  const darkerAccent = `#${Math.floor(r * 0.7).toString(16).padStart(2, '0')}${Math.floor(g * 0.7).toString(16).padStart(2, '0')}${Math.floor(b * 0.7).toString(16).padStart(2, '0')}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tokens.colors.accentPrimary },
        state === 'success' && { backgroundColor: darkerAccent },
        state === 'error' && { backgroundColor: tokens.colors.accentDanger },
        isDisabled && styles.disabledButton,
        pressed && !isDisabled && styles.pressedButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={getButtonText(state)}
      accessibilityState={{ disabled: isDisabled }}>
      <View style={styles.content}>
        {state === 'loading' && (
          <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
        )}
        <Text
          style={[
            styles.text,
            state === 'success' && styles.successText,
            state === 'error' && styles.errorText,
          ]}>
          {getButtonText(state)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  pressedButton: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  successText: {
    color: '#ffffff',
  },
  errorText: {
    color: '#ffffff',
  },
});

export default InterestedButton;
