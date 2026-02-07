/**
 * InterestResponseToast Component
 * Shows a toast notification when a response is received from a poster.
 *
 * Requirements: 2.4
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { InterestResponse } from '../../types';

export interface InterestResponseToastProps {
  response: InterestResponse;
  postTitle: string;
  visible: boolean;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * Returns the appropriate icon for the response type
 */
export function getResponseIcon(response: 'accepted' | 'declined'): string {
  return response === 'accepted' ? '✓' : '✗';
}

/**
 * Returns the display text for the response
 */
export function getResponseText(response: 'accepted' | 'declined', postTitle: string): string {
  if (response === 'accepted') {
    return `Your interest in "${postTitle}" was accepted!`;
  }
  return `Your interest in "${postTitle}" was declined.`;
}

/**
 * Returns the style variant based on response type
 */
export function getResponseVariant(response: 'accepted' | 'declined'): 'success' | 'declined' {
  return response === 'accepted' ? 'success' : 'declined';
}

export function InterestResponseToast({
  response,
  postTitle,
  visible,
  onDismiss,
  autoDismissMs = 5000,
}: InterestResponseToastProps): React.JSX.Element | null {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissMs);

      return () => clearTimeout(timer);
    } else {
      // Reset position when not visible
      translateY.setValue(-100);
      opacity.setValue(0);
    }
  }, [visible, autoDismissMs]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) {
    return null;
  }

  const variant = getResponseVariant(response.response);
  const icon = getResponseIcon(response.response);
  const text = getResponseText(response.response, postTitle);

  return (
    <Animated.View
      style={[
        styles.container,
        variant === 'success' ? styles.successContainer : styles.declinedContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable
        style={styles.content}
        onPress={handleDismiss}
        accessibilityRole="alert"
        accessibilityLabel={text}
      >
        <View
          style={[
            styles.iconContainer,
            variant === 'success' ? styles.successIcon : styles.declinedIcon,
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {response.response === 'accepted' ? 'Interest Accepted' : 'Interest Declined'}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {text}
          </Text>
          {response.message && (
            <Text style={styles.posterMessage} numberOfLines={1}>
              "{response.message}"
            </Text>
          )}
        </View>
        <Text style={styles.dismissHint}>Tap to dismiss</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginHorizontal: 16,
    marginTop: 50,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  declinedContainer: {
    backgroundColor: '#fce4ec',
    borderLeftWidth: 4,
    borderLeftColor: '#c62828',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successIcon: {
    backgroundColor: '#2e7d32',
  },
  declinedIcon: {
    backgroundColor: '#c62828',
  },
  icon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 18,
  },
  posterMessage: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 4,
  },
  dismissHint: {
    fontSize: 10,
    color: '#9e9e9e',
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
});

export default InterestResponseToast;
