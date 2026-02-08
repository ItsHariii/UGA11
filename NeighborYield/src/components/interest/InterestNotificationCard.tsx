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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userIdentifier}>{interest.interestedUserIdentifier}</Text>
        <Text style={styles.timestamp}>{formatInterestTime(interest.timestamp)}</Text>
      </View>

      <Text style={styles.message}>
        is interested in your post: <Text style={styles.postTitle}>{postTitle}</Text>
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.declineButton,
            pressed && styles.buttonPressed,
            isProcessing && styles.buttonDisabled,
          ]}
          onPress={handleDecline}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel="Decline interest"
        >
          <Text style={[styles.buttonText, styles.declineButtonText]}>Decline</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.acceptButton,
            pressed && styles.buttonPressed,
            isProcessing && styles.buttonDisabled,
          ]}
          onPress={handleAccept}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel="Accept interest"
        >
          <Text style={[styles.buttonText, styles.acceptButtonText]}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
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
    color: '#2e7d32',
  },
  timestamp: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  message: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 16,
  },
  postTitle: {
    fontWeight: '600',
    color: '#212121',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#2e7d32',
  },
  declineButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  declineButtonText: {
    color: '#616161',
  },
});

export default InterestNotificationCard;
