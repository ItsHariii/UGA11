/**
 * Supabase Transport Implementation
 * Wraps existing Supabase services to implement ITransportRouter interface
 * 
 * This transport enables online mode by connecting to Supabase backend
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ITransportRouter, TransportError, Unsubscribe } from './ITransportRouter';
import { SharePost, InterestAck, InterestResponse, HeartbeatPayload, RiskTier } from '../types';
import { transportErrorHandler } from './transportErrorHandler';

/**
 * Supabase Transport
 * Implements transport layer using Supabase as backend
 */
export class SupabaseTransport implements ITransportRouter {
  private subscriptions: Map<string, any> = new Map();

  constructor(private supabase: SupabaseClient) {}

  // ============================================
  // Send Operations
  // ============================================

  async sendPost(post: SharePost): Promise<void> {
    return transportErrorHandler.executeWithRetry(
      async () => {
        const { error } = await this.supabase.from('share_posts').insert({
          id: post.id,
          author_id: post.authorId,
          author_identifier: post.authorIdentifier,
          title: post.title,
          description: post.description,
          risk_tier: post.riskTier,
          created_at: new Date(post.createdAt).toISOString(),
          expires_at: new Date(post.expiresAt).toISOString(),
          source: 'supabase',
          latitude: post.location?.latitude?.toString() || null,
          longitude: post.location?.longitude?.toString() || null,
          is_active: true,
        });

        if (error) {
          throw new TransportError(
            `Failed to send post: ${error.message}`,
            error,
            'sendPost'
          );
        }
      },
      {
        operation: 'sendPost',
        metadata: { postId: post.id, postType: post.riskTier },
      }
    );
  }

  async sendInterest(interest: InterestAck): Promise<void> {
    return transportErrorHandler.executeWithRetry(
      async () => {
        const { error } = await this.supabase.from('interests').insert({
          id: interest.id,
          post_id: interest.postId,
          interested_user_id: interest.interestedUserId,
          interested_user_identifier: interest.interestedUserIdentifier,
          created_at: new Date(interest.timestamp).toISOString(),
          source: 'supabase',
          status: interest.status,
        });

        if (error) {
          throw new TransportError(
            `Failed to send interest: ${error.message}`,
            error,
            'sendInterest'
          );
        }
      },
      {
        operation: 'sendInterest',
        metadata: { interestId: interest.id, postId: interest.postId },
      }
    );
  }

  async sendResponse(response: InterestResponse): Promise<void> {
    return transportErrorHandler.executeWithRetry(
      async () => {
        const { error } = await this.supabase
          .from('interests')
          .update({
            status: response.response === 'accepted' ? 'accepted' : 'declined',
            response_message: response.message || null,
            responded_at: new Date(response.timestamp).toISOString(),
          })
          .eq('id', response.interestId);

        if (error) {
          throw new TransportError(
            `Failed to send response: ${error.message}`,
            error,
            'sendResponse'
          );
        }
      },
      {
        operation: 'sendResponse',
        metadata: { interestId: response.interestId, response: response.response },
      }
    );
  }

  async sendHeartbeat(payload: HeartbeatPayload): Promise<void> {
    try {
      // For now, heartbeats are not stored in Supabase
      // They will be used for mesh networking in the future
      // This is a no-op for online mode
      console.log('[SupabaseTransport] Heartbeat sent:', payload);
    } catch (error) {
      throw new TransportError(
        'Failed to send heartbeat',
        error,
        'sendHeartbeat'
      );
    }
  }

  // ============================================
  // Fetch Operations
  // ============================================

  async fetchPosts(): Promise<SharePost[]> {
    return transportErrorHandler.executeWithRetry(
      async () => {
        const { data, error } = await this.supabase
          .from('share_posts')
          .select('*')
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          throw new TransportError(
            `Failed to fetch posts: ${error.message}`,
            error,
            'fetchPosts'
          );
        }

        // Transform database posts to app format
        const posts: SharePost[] = (data || []).map(row => ({
          id: row.id,
          authorId: row.author_id,
          authorIdentifier: row.author_identifier,
          title: row.title,
          description: row.description || '',
          riskTier: row.risk_tier as RiskTier,
          createdAt: new Date(row.created_at).getTime(),
          expiresAt: new Date(row.expires_at).getTime(),
          source: 'supabase' as const,
          location:
            row.latitude && row.longitude
              ? {
                  latitude: parseFloat(row.latitude),
                  longitude: parseFloat(row.longitude),
                }
              : undefined,
        }));

        return posts;
      },
      {
        operation: 'fetchPosts',
      }
    );
  }

  // ============================================
  // Subscription Operations
  // ============================================

  onPostReceived(handler: (post: SharePost) => void): Unsubscribe {
    const channelName = `posts-${Date.now()}`;
    
    const subscription = this.supabase
      .channel(channelName)
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
            description: data.description || '',
            riskTier: data.risk_tier as RiskTier,
            createdAt: new Date(data.created_at).getTime(),
            expiresAt: new Date(data.expires_at).getTime(),
            source: 'supabase',
            location:
              data.latitude && data.longitude
                ? {
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                  }
                : undefined,
          };
          handler(post);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
    };
  }

  onInterestReceived(handler: (interest: InterestAck) => void): Unsubscribe {
    const channelName = `interests-${Date.now()}`;
    
    const subscription = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'interests' },
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
          handler(interest);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
    };
  }

  onResponseReceived(handler: (response: InterestResponse) => void): Unsubscribe {
    const channelName = `responses-${Date.now()}`;
    
    const subscription = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'interests' },
        payload => {
          const data = payload.new;
          
          // Only fire if status changed (response was given)
          if (data.responded_at) {
            const response: InterestResponse = {
              interestId: data.id,
              postId: data.post_id,
              response: data.status === 'accepted' ? 'accepted' : 'declined',
              message: data.response_message || undefined,
              timestamp: new Date(data.responded_at).getTime(),
              responderId: data.responder_id || undefined,
            };
            handler(response);
          }
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
    };
  }

  onHeartbeatReceived(_handler: (payload: HeartbeatPayload) => void): Unsubscribe {
    // Heartbeats are not stored in Supabase for online mode
    // This is a no-op that returns an empty unsubscribe function
    // In the future, this could subscribe to a presence channel
    console.log('[SupabaseTransport] Heartbeat subscription created (no-op for online mode)');
    
    return () => {
      console.log('[SupabaseTransport] Heartbeat subscription removed');
    };
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Dispose of all subscriptions
   * Call this when the transport is no longer needed
   */
  dispose(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}
