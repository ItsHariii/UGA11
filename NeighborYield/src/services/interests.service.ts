/**
 * Interests Service
 * Handles all Supabase operations for post interests
 */

import { supabase } from '../lib/supabase';
import { InterestAck } from '../types';

export interface InterestsError {
  message: string;
  code?: string;
}

/**
 * Express interest in a post
 */
export async function expressInterest(
  postId: string,
  userId: string,
  userIdentifier: string
): Promise<{ interest: InterestAck | null; error: InterestsError | null }> {
  try {
    const { data, error } = await supabase
      .from('interests')
      .insert({
        post_id: postId,
        interested_user_id: userId,
        interested_user_identifier: userIdentifier,
        source: 'supabase',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return { interest: null, error: { message: error.message, code: error.code } };
    }

    const interest: InterestAck = {
      id: data.id,
      postId: data.post_id,
      interestedUserId: data.interested_user_id,
      interestedUserIdentifier: data.interested_user_identifier,
      timestamp: new Date(data.created_at).getTime(),
      source: 'supabase',
      status: data.status as 'pending' | 'accepted' | 'declined',
    };

    return { interest, error: null };
  } catch (error) {
    return {
      interest: null,
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Fetch interests for a specific post (for post authors)
 */
export async function fetchPostInterests(
  postId: string
): Promise<{ interests: InterestAck[]; error: InterestsError | null }> {
  try {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      return { interests: [], error: { message: error.message, code: error.code } };
    }

    const interests: InterestAck[] = (data || []).map(interest => ({
      id: interest.id,
      postId: interest.post_id,
      interestedUserId: interest.interested_user_id,
      interestedUserIdentifier: interest.interested_user_identifier,
      timestamp: new Date(interest.created_at).getTime(),
      source: interest.source as 'local' | 'supabase',
      status: interest.status as 'pending' | 'accepted' | 'declined',
    }));

    return { interests, error: null };
  } catch (error) {
    return {
      interests: [],
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Fetch all interests for current user's posts
 */
export async function fetchMyPostsInterests(
  userId: string
): Promise<{ interests: InterestAck[]; error: InterestsError | null }> {
  try {
    const { data, error } = await supabase
      .from('interests')
      .select('*, share_posts!inner(author_id)')
      .eq('share_posts.author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { interests: [], error: { message: error.message, code: error.code } };
    }

    const interests: InterestAck[] = (data || []).map(interest => ({
      id: interest.id,
      postId: interest.post_id,
      interestedUserId: interest.interested_user_id,
      interestedUserIdentifier: interest.interested_user_identifier,
      timestamp: new Date(interest.created_at).getTime(),
      source: interest.source as 'local' | 'supabase',
      status: interest.status as 'pending' | 'accepted' | 'declined',
    }));

    return { interests, error: null };
  } catch (error) {
    return {
      interests: [],
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Update interest status (accept/decline)
 */
export async function updateInterestStatus(
  interestId: string,
  status: 'accepted' | 'declined',
  responseMessage?: string
): Promise<{ error: InterestsError | null }> {
  try {
    const { error } = await supabase
      .from('interests')
      .update({
        status,
        response_message: responseMessage || null,
        responded_at: new Date().toISOString(),
      })
      .eq('id', interestId);

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
 * Subscribe to realtime interest updates
 */
export function subscribeToInterestUpdates(
  userId: string,
  onInsert: (interest: InterestAck) => void,
  onUpdate: (interest: InterestAck) => void
) {
  const subscription = supabase
    .channel('interests')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'interests',
        filter: `interested_user_id=eq.${userId}`,
      },
      payload => {
        const data = payload.new;
        const interest: InterestAck = {
          id: data.id,
          postId: data.post_id,
          interestedUserId: data.interested_user_id,
          interestedUserIdentifier: data.interested_user_identifier,
          timestamp: new Date(data.created_at).getTime(),
          source: 'supabase',
          status: data.status as 'pending' | 'accepted' | 'declined',
        };
        onInsert(interest);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'interests',
        filter: `interested_user_id=eq.${userId}`,
      },
      payload => {
        const data = payload.new;
        const interest: InterestAck = {
          id: data.id,
          postId: data.post_id,
          interestedUserId: data.interested_user_id,
          interestedUserIdentifier: data.interested_user_identifier,
          timestamp: new Date(data.created_at).getTime(),
          source: 'supabase',
          status: data.status as 'pending' | 'accepted' | 'declined',
        };
        onUpdate(interest);
      }
    )
    .subscribe();

  return subscription;
}
