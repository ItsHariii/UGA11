/**
 * InterestNotificationCard Component
 * Displays an incoming interest notification with the interested user's identifier
 * and Accept/Decline action buttons.
 *
 * Requirements: 1.4
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { InterestAck } from '../../types';
import { useTheme } from '../../theme/ThemeContext';

export interface InterestNotificationCardProps {
  interest: InterestAck;
  postTitle: string;
  onAccept: (interestId: string) => void;
  onDecline: (interestId: string) => void;
  isProcessing?: boolean;
}

/**
 * Formats the time since interest was received
 */
export function formatInterestTime(timestamp: number, currentTime: number = Date.now()): string {
  const diffMs = currentTime - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes === 1) {
    return '1 min ago';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  } else {
    const hours = Math.floor(diffMinutes / 60);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
}

export function InterestNotificationCard({
  interest,
  postTitle,
  onAccept,
  onDecline,
  isProcessing = false,
}: InterestNotificationCardProps): React.JSX.Element {
  const { tokens } = useTheme();

  const handleAccept = () => {
    if (!isProcessing) {
      onAccept(interest.id);
    }
  };

  const handleDecline = () => {
    if (!isProcessing) {
      onDecline(interest.id);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.colors.backgroundCard,
          borderLeftColor: tokens.colors.accentPrimary,
          shadowColor: tokens.colors.shadowColor,
        },
      ]}>
      <View style={styles.header}>
        <Text style={[styles.userIdentifier, { color: tokens.colors.accentPrimary }]}>
          {interest.interestedUserIdentifier}
        </Text>
        <Text style={[styles.timestamp, { color: tokens.colors.textMuted }]}>
          {formatInterestTime(interest.timestamp)}
        </Text>
      </View>

      <Text style={[styles.message, { color: tokens.colors.textSecondary }]}>
        is interested in your post:{' '}
        <Text style={[styles.postTitle, { color: tokens.colors.textPrimary }]}>{postTitle}</Text>
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: tokens.colors.backgroundSecondary,
              borderColor: tokens.colors.borderDefault,
            },
            pressed && styles.buttonPressed,
            isProcessing && styles.buttonDisabled,
          ]}
          onPress={handleDecline}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel="Decline interest">
          <Text style={[styles.buttonText, { color: tokens.colors.textSecondary }]}>Decline</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: tokens.colors.accentPrimary },
            pressed && styles.buttonPressed,
            isProcessing && styles.buttonDisabled,
          ]}
          onPress={handleAccept}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel="Accept interest">
          <Text style={[styles.buttonText, styles.acceptButtonText]}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userIdentifier: {
    fontSize: 16,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  postTitle: {
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButtonText: {
    color: '#ffffff',
  },
});

export default InterestNotificationCard;
