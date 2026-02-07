/**
 * InterestQueueList Component
 * Displays all pending interests for the poster's posts.
 *
 * Requirements: 1.5
 */

import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { InterestAck, SharePost } from '../../types';
import { InterestNotificationCard } from './InterestNotificationCard';

export interface InterestQueueItem {
  interest: InterestAck;
  post: SharePost;
}

export interface InterestQueueListProps {
  interests: InterestQueueItem[];
  onAccept: (interestId: string) => void;
  onDecline: (interestId: string) => void;
  processingInterestId?: string;
  emptyMessage?: string;
}

/**
 * Filters interests to only show pending ones
 */
export function filterPendingInterests(interests: InterestQueueItem[]): InterestQueueItem[] {
  return interests.filter((item) => item.interest.status === 'pending');
}

/**
 * Sorts interests by timestamp (newest first)
 */
export function sortInterestsByTime(interests: InterestQueueItem[]): InterestQueueItem[] {
  return [...interests].sort((a, b) => b.interest.timestamp - a.interest.timestamp);
}

function EmptyState({ message }: { message: string }): React.JSX.Element {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function InterestQueueList({
  interests,
  onAccept,
  onDecline,
  processingInterestId,
  emptyMessage = 'No pending interests',
}: InterestQueueListProps): React.JSX.Element {
  const pendingInterests = filterPendingInterests(interests);
  const sortedInterests = sortInterestsByTime(pendingInterests);

  const renderItem = ({ item }: { item: InterestQueueItem }) => (
    <InterestNotificationCard
      interest={item.interest}
      postTitle={item.post.title}
      onAccept={onAccept}
      onDecline={onDecline}
      isProcessing={processingInterestId === item.interest.id}
    />
  );

  const keyExtractor = (item: InterestQueueItem) => item.interest.id;

  if (sortedInterests.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Interests</Text>
        <Text style={styles.headerCount}>{sortedInterests.length}</Text>
      </View>
      <FlatList
        data={sortedInterests}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
  },
});

export default InterestQueueList;
