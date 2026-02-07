/**
 * InterestedButton Component
 * "I'm Interested" button with loading, success, and error states.
 *
 * Requirements: 1.1
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        state === 'success' && styles.successButton,
        state === 'error' && styles.errorButton,
        isDisabled && styles.disabledButton,
        pressed && !isDisabled && styles.pressedButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={getButtonText(state)}
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={styles.content}>
        {state === 'loading' && (
          <ActivityIndicator
            size="small"
            color="#ffffff"
            style={styles.spinner}
          />
        )}
        <Text
          style={[
            styles.text,
            state === 'success' && styles.successText,
            state === 'error' && styles.errorText,
          ]}
        >
          {getButtonText(state)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  successButton: {
    backgroundColor: '#1b5e20',
  },
  errorButton: {
    backgroundColor: '#c62828',
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
    fontSize: 16,
    fontWeight: '600',
  },
  successText: {
    color: '#ffffff',
  },
  errorText: {
    color: '#ffffff',
  },
});

export default InterestedButton;
