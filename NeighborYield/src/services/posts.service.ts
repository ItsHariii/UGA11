/**
 * Posts Service
 * Handles all Supabase operations for share posts
 */

import { supabase } from '../lib/supabase';
import { SharePost, RiskTier } from '../types';

export interface CreatePostData {
  title: string;
  description: string;
  riskTier: RiskTier;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export interface PostsError {
  message: string;
  code?: string;
}

/**
 * Fetch all active posts
 */
export async function fetchPosts(): Promise<{ posts: SharePost[]; error: PostsError | null }> {
  try {
    const { data, error } = await supabase
      .from('share_posts')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return { posts: [], error: { message: error.message, code: error.code } };
    }

    // Transform database posts to app format
    const posts: SharePost[] = (data || []).map(post => ({
      id: post.id,
      authorId: post.author_id,
      authorIdentifier: post.author_identifier,
      title: post.title,
      description: post.description,
      riskTier: post.risk_tier as RiskTier,
      createdAt: new Date(post.created_at).getTime(),
      expiresAt: new Date(post.expires_at).getTime(),
      source: post.source as 'local' | 'supabase',
      location: post.latitude && post.longitude
        ? {
            latitude: parseFloat(post.latitude),
            longitude: parseFloat(post.longitude),
          }
        : undefined,
      imageUrl: post.image_url || undefined,
    }));

    return { posts, error: null };
  } catch (error) {
    return {
      posts: [],
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Create a new post
 */
export async function createPost(
  postData: CreatePostData,
  authorId: string,
  authorIdentifier: string
): Promise<{ post: SharePost | null; error: PostsError | null }> {
  try {
    // Calculate expiration based on risk tier
    const now = new Date();
    let expiresAt: Date;

    switch (postData.riskTier) {
      case 'high':
        expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
        break;
      case 'medium':
        expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
        break;
      case 'low':
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        break;
    }

    const { data, error } = await supabase
      .from('share_posts')
      .insert({
        author_id: authorId,
        author_identifier: authorIdentifier,
        title: postData.title,
        description: postData.description,
        risk_tier: postData.riskTier,
        expires_at: expiresAt.toISOString(),
        source: 'supabase',
        latitude: postData.latitude || null,
        longitude: postData.longitude || null,
        image_url: postData.imageUrl || null,
      })
      .select()
      .single();

    if (error) {
      return { post: null, error: { message: error.message, code: error.code } };
    }

    const post: SharePost = {
      id: data.id,
      authorId: data.author_id,
      authorIdentifier: data.author_identifier,
      title: data.title,
      description: data.description,
      riskTier: data.risk_tier as RiskTier,
      createdAt: new Date(data.created_at).getTime(),
      expiresAt: expiresAt.getTime(),
      source: 'supabase',
      location: data.latitude && data.longitude
        ? {
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
          }
        : undefined,
      imageUrl: data.image_url || undefined,
    };

    return { post, error: null };
  } catch (error) {
    return {
      post: null,
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<{ error: PostsError | null }> {
  try {
    const { error } = await supabase.from('share_posts').delete().eq('id', postId);

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
 * Mark a post as claimed
 */
export async function claimPost(
  postId: string,
  claimedBy: string
): Promise<{ error: PostsError | null }> {
  try {
    const { error } = await supabase
      .from('share_posts')
      .update({
        is_claimed: true,
        claimed_by: claimedBy,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', postId);

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
 * Subscribe to realtime post updates
 */
export function subscribeToPostUpdates(
  onInsert: (post: SharePost) => void,
  onUpdate: (post: SharePost) => void,
  onDelete: (postId: string) => void
) {
  const subscription = supabase
    .channel('posts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'share_posts' },
      payload => {
        const data = payload.new;
        const post: SharePost = {
          id: data.id,
          authorId: data.author_id,
          authorIdentifier: data.author_identifier,
          title: data.title,
          description: data.description,
          riskTier: data.risk_tier as RiskTier,
          createdAt: new Date(data.created_at).getTime(),
          expiresAt: new Date(data.expires_at).getTime(),
          source: 'supabase',
          location: data.latitude && data.longitude
            ? {
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
              }
            : undefined,
          imageUrl: data.image_url || undefined,
        };
        onInsert(post);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'share_posts' },
      payload => {
        const data = payload.new;
        const post: SharePost = {
          id: data.id,
          authorId: data.author_id,
          authorIdentifier: data.author_identifier,
          title: data.title,
          description: data.description,
          riskTier: data.risk_tier as RiskTier,
          createdAt: new Date(data.created_at).getTime(),
          expiresAt: new Date(data.expires_at).getTime(),
          source: 'supabase',
          location: data.latitude && data.longitude
            ? {
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
              }
            : undefined,
          imageUrl: data.image_url || undefined,
        };
        onUpdate(post);
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'share_posts' },
      payload => {
        onDelete(payload.old.id);
      }
    )
    .subscribe();

  return subscription;
}
