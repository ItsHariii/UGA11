import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import * as messagingService from '../services/messaging.service';
import type { Conversation } from '../services/messaging.service';

interface MessagesScreenProps {
  navigation: any;
  userId: string;
  userIdentifier: string;
}

/**
 * MessagesScreen Component
 * Displays all conversations for the logged-in user
 * Requirements: 1.1, 1.8
 */
export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  navigation,
  userId,
  userIdentifier,
}) => {
  const { tokens } = useTheme();
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount and subscribe to real-time updates
  useEffect(() => {
    loadConversations();
    
    // Subscribe to conversation updates
    const subscription = messagingService.subscribeToConversations(
      userId,
      () => {
        // Reload conversations when updates occur
        loadConversations();
      }
    );
    
    // Cleanup: unsubscribe on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  // Load conversations function
  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    
    const { conversations: fetchedConversations, error: fetchError } = 
      await messagingService.fetchConversations(userId);
    
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setConversations(fetchedConversations);
    }
    
    setLoading(false);
  };

  // Handle conversation press
  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      postTitle: conversation.postTitle,
      otherUserIdentifier: conversation.otherUserIdentifier,
    });
  };

  // Render loading state
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: tokens.colors.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={tokens.colors.accentPrimary} />
        <Text style={[styles.loadingText, { color: tokens.colors.textSecondary }]}>
          Loading conversations...
        </Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: tokens.colors.backgroundPrimary }]}>
        <Text style={[styles.errorText, { color: tokens.colors.accentDanger }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: tokens.colors.accentPrimary }]}
          onPress={loadConversations}
        >
          <Text style={[styles.retryButtonText, { color: tokens.colors.backgroundCard }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render empty state
  if (conversations.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: tokens.colors.backgroundPrimary }]}>
        <Text style={[styles.emptyTitle, { color: tokens.colors.textPrimary }]}>
          No conversations yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: tokens.colors.textSecondary }]}>
          Express interest in a post to start a conversation
        </Text>
      </View>
    );
  }

  // Render conversation list
  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.backgroundPrimary }]}>
      <View style={[styles.screenHeader, { backgroundColor: tokens.colors.backgroundCard, borderBottomColor: tokens.colors.borderDefault }]}>
        <Text style={[styles.screenTitle, { color: tokens.colors.textPrimary }]}>
          Messages
        </Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationListItem
            conversation={item}
            onPress={() => handleConversationPress(item)}
            tokens={tokens}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

/**
 * ConversationListItem Component
 * Displays a single conversation in the list
 * Requirements: 1.2, 1.3, 1.4, 1.5, 1.6
 */
interface ConversationListItemProps {
  conversation: Conversation;
  onPress: () => void;
  tokens: any;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  onPress,
  tokens,
}) => {
  // Format timestamp to relative time
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        {
          backgroundColor: tokens.colors.backgroundCard,
          borderColor: tokens.colors.borderDefault,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.conversationHeader}>
        <Text
          style={[styles.postTitle, { color: tokens.colors.textPrimary }]}
          numberOfLines={1}
        >
          {conversation.postTitle}
        </Text>
        <Text style={[styles.timestamp, { color: tokens.colors.textMuted }]}>
          {formatTimestamp(conversation.lastMessageAt)}
        </Text>
      </View>

      <Text style={[styles.otherUser, { color: tokens.colors.textSecondary }]}>
        {conversation.otherUserIdentifier}
      </Text>

      <View style={styles.lastMessageRow}>
        <Text
          style={[styles.lastMessage, { color: tokens.colors.textSecondary }]}
          numberOfLines={1}
        >
          {conversation.lastMessageText || 'No messages yet'}
        </Text>
        {conversation.unreadCount > 0 && (
          <View
            style={[
              styles.unreadBadge,
              { backgroundColor: tokens.colors.accentPrimary },
            ]}
          >
            <Text style={[styles.unreadCount, { color: tokens.colors.backgroundCard }]}>
              {conversation.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  conversationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  otherUser: {
    fontSize: 14,
    marginBottom: 6,
  },
  lastMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    fontStyle: 'italic',
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '700',
  },
});
