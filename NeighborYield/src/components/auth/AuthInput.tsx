import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  KeyboardTypeOptions,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  onBlur?: () => void;
}

/**
 * AuthInput Component
 * Reusable form input with label, validation, and error states
 * Requirements: 4.1-4.10, 6.4-6.7
 */
export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  onBlur,
}) => {
  const { tokens } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.();
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? tokens.colors.accentDanger : tokens.colors.borderDefault,
      tokens.colors.accentPrimary,
    ],
  });

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            color: tokens.colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: tokens.colors.backgroundSecondary,
            borderColor: error && !isFocused ? tokens.colors.accentDanger : borderColor,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: tokens.colors.textPrimary,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
      {error && (
        <Text
          style={[
            styles.errorText,
            {
              color: tokens.colors.accentDanger,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  input: {
    fontSize: 16,
    padding: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});
