/**
 * Supabase adapter for online mode.
 * CRUD for share posts, interest operations, realtime subscriptions.
 */

import { supabase } from '../lib/supabase';
import type { SharePost, InterestAck, InterestResponse, RiskTier } from '../../src/types';
import type { Unsubscribe } from './types';

const POSTS_TABLE = 'share_posts';
const INTERESTS_TABLE = 'interests';

/** DB row shape for share_posts (snake_case) */
interface SharePostRow {
  id: string;
  author_id: string;
  author_identifier: string;
  title: string;
  description: string | null;
  risk_tier: RiskTier;
  created_at: string;
  expires_at: string;
  lat?: number | null;
  lng?: number | null;
  is_active?: boolean;
}

/** DB row shape for interests */
interface InterestRow {
  id: string;
  post_id: string;
  interested_user_id: string;
  interested_user_identifier: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

function rowToSharePost(row: SharePostRow): SharePost {
  return {
    id: row.id,
    authorId: row.author_id,
    authorIdentifier: row.author_identifier,
    title: row.title,
    description: row.description ?? '',
    riskTier: row.risk_tier,
    createdAt: new Date(row.created_at).getTime(),
    expiresAt: new Date(row.expires_at).getTime(),
    source: 'supabase',
    ...(row.lat != null && row.lng != null && { location: { latitude: row.lat, longitude: row.lng } }),
  };
}

function rowToInterestAck(row: InterestRow): InterestAck {
  return {
    id: row.id,
    postId: row.post_id,
    interestedUserId: row.interested_user_id,
    interestedUserIdentifier: row.interested_user_identifier,
    timestamp: new Date(row.created_at).getTime(),
    source: 'supabase',
    status: row.status,
  };
}

export interface PostFilters {
  excludeExpired?: boolean;
  limit?: number;
}

export async function createPost(post: Omit<SharePost, 'id' | 'source'>): Promise<SharePost> {
  const row = {
    author_id: post.authorId,
    author_identifier: post.authorIdentifier,
    title: post.title,
    description: post.description || null,
    risk_tier: post.riskTier,
    created_at: new Date(post.createdAt).toISOString(),
    expires_at: new Date(post.expiresAt).toISOString(),
    ...(post.location && { lat: post.location.latitude, lng: post.location.longitude }),
  };

  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return rowToSharePost(data as SharePostRow);
}

export async function getPosts(filters?: PostFilters): Promise<SharePost[]> {
  let query = supabase
    .from(POSTS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;

  let posts = (data as SharePostRow[]).map(rowToSharePost);
  if (filters?.excludeExpired) {
    const now = Date.now();
    posts = posts.filter((p) => p.expiresAt > now);
  }
  return posts;
}

export async function sendInterest(_postId: string, interest: InterestAck): Promise<void> {
  const row = {
    id: interest.id,
    post_id: interest.postId,
    interested_user_id: interest.interestedUserId,
    interested_user_identifier: interest.interestedUserIdentifier,
    status: interest.status,
    created_at: new Date(interest.timestamp).toISOString(),
  };

  const { error } = await supabase.from(INTERESTS_TABLE).insert(row);
  if (error) throw error;
}

export async function respondToInterest(
  interestId: string,
  response: InterestResponse
): Promise<void> {
  const { error } = await supabase
    .from(INTERESTS_TABLE)
    .update({ status: response.response })
    .eq('id', interestId);

  if (error) throw error;
}

export function subscribeToPostsChannel(handler: (post: SharePost) => void): Unsubscribe {
  const channel = supabase
    .channel('share_posts_realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: POSTS_TABLE },
      (payload: { new: SharePostRow }) => {
        const row = payload.new;
        handler(rowToSharePost(row));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToInterestsChannel(
  _userId: string,
  handler: (interest: InterestAck) => void
): Unsubscribe {
  const channel = supabase
    .channel('interests_realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: INTERESTS_TABLE },
      (payload: { new: InterestRow }) => {
        const row = payload.new;
        handler(rowToInterestAck(row));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToResponsesChannel(
  _userId: string,
  handler: (response: InterestResponse) => void
): Unsubscribe {
  const channel = supabase
    .channel('interests_responses_realtime')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: INTERESTS_TABLE },
      (payload: { new: InterestRow }) => {
        const row = payload.new;
        if (row.status !== 'pending') {
          handler({
            interestId: row.id,
            postId: row.post_id,
            responderId: '',
            response: row.status === 'accepted' ? 'accepted' : 'declined',
            timestamp: new Date(row.created_at).getTime(),
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
