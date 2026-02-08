/**
 * Messaging Service
 * Handles all Supabase operations for conversations and messages
 */

import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Conversation type representing a messaging thread between two users about a post
 */
export interface Conversation {
  id: string;
  interestId: string;
  postId: string;
  postTitle: string;
  user1Id: string;
  user2Id: string;
  otherUserId: string;
  otherUserIdentifier: string;
  lastMessageAt: number;
  lastMessageText: string | null;
  unreadCount: number;
  createdAt: number;
}

/**
 * Message type representing a single message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderIdentifier: string;
  messageText: string;
  isRead: boolean;
  createdAt: number;
}

/**
 * Error type for messaging operations
 */
export interface MessagingError {
  message: string;
  code?: string;
}

/**
 * Fetch all conversations for a user
 * Joins with posts table to get post titles
 * Calculates unread counts for each conversation
 * Determines the "other user" in each conversation
 */
export async function fetchConversations(
  userId: string
): Promise<{ conversations: Conversation[]; error: MessagingError | null }> {
  try {
    // Query conversations with joins to get post titles and interest info
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        interest_id,
        post_id,
        user1_id,
        user2_id,
        created_at,
        last_message_at,
        share_posts!inner(title, author_identifier),
        interests!inner(interested_user_identifier)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      return { conversations: [], error: { message: error.message, code: error.code } };
    }

    // For each conversation, fetch unread count and last message
    const conversationsWithDetails = await Promise.all(
      (data || []).map(async (conv: any) => {
        // Calculate unread count - messages from other user that are unread
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        // Fetch last message text
        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('message_text')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Determine the "other user" in the conversation
        const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
        
        // Extract post and interest data (Supabase returns single object for !inner joins)
        const postData = conv.share_posts;
        const interestData = conv.interests;
        
        // Determine other user's identifier
        // If current user is the post author, other user is the interested user
        // If current user is the interested user, other user is the post author
        const otherUserIdentifier = conv.user1_id === userId 
          ? interestData.interested_user_identifier 
          : postData.author_identifier;

        return {
          conv,
          unreadCount: unreadCount || 0,
          lastMessageText: lastMessageData?.message_text || null,
          otherUserId,
          otherUserIdentifier,
          postTitle: postData.title,
        };
      })
    );

    // Transform database rows to app format
    const conversations: Conversation[] = conversationsWithDetails.map(
      ({ conv, unreadCount, lastMessageText, otherUserId, otherUserIdentifier, postTitle }) => ({
        id: conv.id,
        interestId: conv.interest_id,
        postId: conv.post_id,
        postTitle,
        user1Id: conv.user1_id,
        user2Id: conv.user2_id,
        otherUserId,
        otherUserIdentifier,
        lastMessageAt: new Date(conv.last_message_at).getTime(),
        lastMessageText,
        unreadCount,
        createdAt: new Date(conv.created_at).getTime(),
      })
    );

    return { conversations, error: null };
  } catch (error) {
    return {
      conversations: [],
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Fetch all messages for a conversation
 * Orders by created_at ascending (oldest first)
 */
export async function fetchMessages(
  conversationId: string
): Promise<{ messages: Message[]; error: MessagingError | null }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return { messages: [], error: { message: error.message, code: error.code } };
    }

    // Transform database rows to app format
    const messages: Message[] = (data || []).map((msg: any) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderIdentifier: msg.sender_identifier,
      messageText: msg.message_text,
      isRead: msg.is_read,
      createdAt: new Date(msg.created_at).getTime(),
    }));

    return { messages, error: null };
  } catch (error) {
    return {
      messages: [],
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Send a new message in a conversation
 * Inserts message with sender info and text
 * Database trigger automatically updates conversation's last_message_at
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderIdentifier: string,
  messageText: string
): Promise<{ message: Message | null; error: MessagingError | null }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_identifier: senderIdentifier,
        message_text: messageText,
      })
      .select()
      .single();

    if (error) {
      return { message: null, error: { message: error.message, code: error.code } };
    }

    // Transform database row to app format
    const message: Message = {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      senderIdentifier: data.sender_identifier,
      messageText: data.message_text,
      isRead: data.is_read,
      createdAt: new Date(data.created_at).getTime(),
    };

    return { message, error: null };
  } catch (error) {
    return {
      message: null,
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Mark all unread messages in a conversation as read
 * Updates is_read to true for all messages where sender != current user
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ error: MessagingError | null }> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (error) {
      return { error: { message: error.message, code: error.code } };
    }

    return { error: null };
  } catch (error) {
    return {
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Subscribe to real-time message updates for a conversation
 * Listens for INSERT events on messages table
 * Returns subscription object that can be unsubscribed
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        // Transform payload to Message type
        const newMessage: Message = {
          id: payload.new.id,
          conversationId: payload.new.conversation_id,
          senderId: payload.new.sender_id,
          senderIdentifier: payload.new.sender_identifier,
          messageText: payload.new.message_text,
          isRead: payload.new.is_read,
          createdAt: new Date(payload.new.created_at).getTime(),
        };
        
        // Invoke callback with new message
        onNewMessage(newMessage);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to real-time conversation list updates
 * Listens for INSERT and UPDATE events on messages table
 * Returns subscription object that can be unsubscribed
 */
export function subscribeToConversations(
  userId: string,
  onConversationUpdate: () => void
): RealtimeChannel {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      async (payload) => {
        // Check if this message belongs to a conversation the user participates in
        if (payload.new && typeof payload.new === 'object' && 'conversation_id' in payload.new) {
          const conversationId = (payload.new as any).conversation_id;
          const { data: conversation } = await supabase
            .from('conversations')
            .select('user1_id, user2_id')
            .eq('id', conversationId)
            .single();

          if (
            conversation &&
            (conversation.user1_id === userId || conversation.user2_id === userId)
          ) {
            // Invoke callback when updates occur
            onConversationUpdate();
          }
        }
      }
    )
    .subscribe();

  return channel;
}
