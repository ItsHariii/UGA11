import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import * as messagingService from '../services/messaging.service';
import type { Message } from '../services/messaging.service';

interface ChatScreenProps {
  route: {
    params: {
      conversationId: string;
      postTitle: string;
      otherUserIdentifier: string;
    };
  };
  userId: string;
  userIdentifier: string;
}

/**
 * ChatScreen Component
 * Displays messages within a specific conversation and allows sending new messages
 * Requirements: 2.1, 2.4, 2.5, 2.6, 2.8
 */
export const ChatScreen: React.FC<ChatScreenProps> = ({
  route,
  userId,
  userIdentifier,
}) => {
  const { conversationId, postTitle, otherUserIdentifier } = route.params;
  const { tokens } = useTheme();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Refs
  const flatListRef = useRef<FlatList>(null);

  // Load messages on mount and set up real-time subscriptions
  useEffect(() => {
    loadMessages();

    // Mark messages as read when screen opens
    messagingService.markMessagesAsRead(conversationId, userId);

    // Subscribe to real-time message updates
    const subscription = messagingService.subscribeToMessages(
      conversationId,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();

        // Mark as read if not from current user
        if (newMessage.senderId !== userId) {
          messagingService.markMessagesAsRead(conversationId, userId);
        }
      }
    );

    // Cleanup: unsubscribe on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, userId]);

  // Load messages function
  const loadMessages = async () => {
    setLoading(true);
    setError(null);

    const { messages: fetchedMessages, error: fetchError } =
      await messagingService.fetchMessages(conversationId);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setMessages(fetchedMessages);
    }

    setLoading(false);
  };

  // Retry loading messages
  const handleRetry = () => {
    loadMessages();
  };

  // Handle send message
  const handleSend = async () => {
    const trimmedText = inputText.trim();

    // Clear previous validation error
    setValidationError(null);

    // Validate minimum length (1 character after trim)
    if (!trimmedText) {
      setValidationError('Message cannot be empty');
      return;
    }

    // Validate maximum length (1000 characters)
    if (trimmedText.length > 1000) {
      setValidationError('Message is too long (max 1000 characters)');
      return;
    }

    setSending(true);
    setError(null);

    const { message, error: sendError } = await messagingService.sendMessage(
      conversationId,
      userId,
      userIdentifier,
      trimmedText
    );

    if (sendError) {
      setError(sendError.message);
    } else if (message) {
      // Clear input on success
      setInputText('');
      // Message will be added via real-time subscription
    }

    setSending(false);
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Handle input text change
  const handleInputChange = (text: string) => {
    setInputText(text);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  // Check if send button should be disabled
  const isSendDisabled = () => {
    const trimmedText = inputText.trim();
    return !trimmedText || trimmedText.length > 1000 || sending;
  };

  // Render loading state
  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: tokens.colors.backgroundPrimary },
        ]}
      >
        <ActivityIndicator size="large" color={tokens.colors.accentPrimary} />
        <Text
          style={[
            styles.loadingText,
            { color: tokens.colors.textSecondary },
          ]}
        >
          Loading messages...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.backgroundPrimary }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: tokens.colors.backgroundCard,
            borderBottomColor: tokens.colors.borderDefault,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text
            style={[styles.headerTitle, { color: tokens.colors.textPrimary }]}
            numberOfLines={1}
          >
            {postTitle}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: tokens.colors.textSecondary },
            ]}
          >
            {otherUserIdentifier}
          </Text>
        </View>
      </View>

      {/* Error banner with dismiss */}
      {error && (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: tokens.colors.accentDanger + '15' },
          ]}
        >
          <Text
            style={[styles.errorText, { color: tokens.colors.accentDanger }]}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => setError(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.dismissText, { color: tokens.colors.accentDanger }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Validation error banner */}
      {validationError && (
        <View
          style={[
            styles.validationBanner,
            { backgroundColor: tokens.colors.accentWarning + '15' },
          ]}
        >
          <Text
            style={[styles.validationText, { color: tokens.colors.accentWarning }]}
          >
            {validationError}
          </Text>
        </View>
      )}

      {/* Messages list */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            {error ? (
              <>
                <Text
                  style={[styles.errorTitle, { color: tokens.colors.accentDanger }]}
                >
                  Failed to load messages
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: tokens.colors.accentPrimary }]}
                  onPress={handleRetry}
                >
                  <Text style={[styles.retryButtonText, { color: tokens.colors.backgroundCard }]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text
                style={[styles.emptyText, { color: tokens.colors.textSecondary }]}
              >
                No messages yet. Start the conversation!
              </Text>
            )}
          </View>
        ) : (
          messages.length > 0 && (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  isOwnMessage={item.senderId === userId}
                  tokens={tokens}
                />
              )}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={scrollToBottom}
              onLayout={scrollToBottom}
            />
          )
        )}

        {/* Input container */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: tokens.colors.backgroundCard,
              borderTopColor: tokens.colors.borderDefault,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: tokens.colors.backgroundPrimary,
                color: tokens.colors.textPrimary,
                borderColor: validationError 
                  ? tokens.colors.accentWarning 
                  : tokens.colors.borderDefault,
              },
            ]}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            placeholderTextColor={tokens.colors.textMuted}
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: isSendDisabled()
                  ? tokens.colors.borderDefault
                  : tokens.colors.accentPrimary,
              },
            ]}
            onPress={handleSend}
            disabled={isSendDisabled()}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color={tokens.colors.backgroundCard} />
            ) : (
              <Text
                style={[
                  styles.sendButtonText,
                  { color: tokens.colors.backgroundCard },
                ]}
              >
                Send
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

/**
 * MessageBubble Component
 * Displays a single message with sender info and timestamp
 * Requirements: 2.2, 2.3
 */
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  tokens: any;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  tokens,
}) => {
  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isOwnMessage
            ? [
                styles.ownMessageBubble,
                { backgroundColor: tokens.colors.accentPrimary },
              ]
            : [
                styles.otherMessageBubble,
                { backgroundColor: tokens.colors.backgroundCard },
              ],
        ]}
      >
        {/* Sender identifier (only for other messages) */}
        {!isOwnMessage && (
          <Text
            style={[
              styles.senderIdentifier,
              { color: tokens.colors.textSecondary },
            ]}
          >
            {message.senderIdentifier}
          </Text>
        )}

        {/* Message text */}
        <Text
          style={[
            styles.messageText,
            {
              color: isOwnMessage
                ? tokens.colors.backgroundCard
                : tokens.colors.textPrimary,
            },
          ]}
        >
          {message.messageText}
        </Text>

        {/* Timestamp */}
        <Text
          style={[
            styles.timestamp,
            {
              color: isOwnMessage
                ? tokens.colors.backgroundCard + 'CC'
                : tokens.colors.textMuted,
            },
          ]}
        >
          {formatTimestamp(message.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  errorBanner: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
  dismissText: {
    fontSize: 18,
    fontWeight: '700',
  },
  validationBanner: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  validationText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubbleContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  ownMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  senderIdentifier: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    marginRight: 8,
  },
  sendButton: {
    width: 60,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
