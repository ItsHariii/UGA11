/**
 * SupabaseTransport Unit Tests
 * Tests the Supabase transport implementation
 */

import { SupabaseTransport } from './SupabaseTransport';
import { TransportError } from './ITransportRouter';
import { SharePost, InterestAck, InterestResponse, HeartbeatPayload } from '../types';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  channel: jest.fn(),
};

describe('SupabaseTransport', () => {
  let transport: SupabaseTransport;

  beforeEach(() => {
    jest.clearAllMocks();
    transport = new SupabaseTransport(mockSupabaseClient as any);
  });

  afterEach(() => {
    transport.dispose();
  });

  // ============================================
  // Send Operations Tests
  // ============================================

  describe('sendPost', () => {
    it('should send a post successfully', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      const post: SharePost = {
        id: 'post-1',
        authorId: 'user-1',
        authorIdentifier: 'Neighbor-A1B2',
        title: 'Fresh Tomatoes',
        description: 'Organic tomatoes from my garden',
        riskTier: 'low',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        source: 'supabase',
      };

      await transport.sendPost(post);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('share_posts');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: post.id,
          author_id: post.authorId,
          author_identifier: post.authorIdentifier,
          title: post.title,
          description: post.description,
          risk_tier: post.riskTier,
          source: 'supabase',
          is_active: true,
        })
      );
    });

    it('should throw TransportError on failure', async () => {
      const mockError = { message: 'Database error', code: 'DB_ERROR' };
      const mockInsert = jest.fn().mockResolvedValue({ error: mockError });
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      const post: SharePost = {
        id: 'post-1',
        authorId: 'user-1',
        authorIdentifier: 'Neighbor-A1B2',
        title: 'Fresh Tomatoes',
        description: 'Organic tomatoes',
        riskTier: 'low',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        source: 'supabase',
      };

      await expect(transport.sendPost(post)).rejects.toThrow(TransportError);
    }, 20000); // 20 second timeout for retry logic
  });

  describe('sendInterest', () => {
    it('should send an interest successfully', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      const interest: InterestAck = {
        id: 'interest-1',
        postId: 'post-1',
        interestedUserId: 'user-2',
        interestedUserIdentifier: 'Neighbor-C3D4',
        timestamp: Date.now(),
        source: 'supabase',
        status: 'pending',
      };

      await transport.sendInterest(interest);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('interests');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: interest.id,
          post_id: interest.postId,
          interested_user_id: interest.interestedUserId,
          interested_user_identifier: interest.interestedUserIdentifier,
          source: 'supabase',
          status: 'pending',
        })
      );
    });

    it('should throw TransportError on failure', async () => {
      const mockError = { message: 'Database error', code: 'DB_ERROR' };
      const mockInsert = jest.fn().mockResolvedValue({ error: mockError });
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      const interest: InterestAck = {
        id: 'interest-1',
        postId: 'post-1',
        interestedUserId: 'user-2',
        interestedUserIdentifier: 'Neighbor-C3D4',
        timestamp: Date.now(),
        source: 'supabase',
        status: 'pending',
      };

      await expect(transport.sendInterest(interest)).rejects.toThrow(TransportError);
    }, 20000); // 20 second timeout for retry logic
  });

  describe('sendResponse', () => {
    it('should send an accept response successfully', async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ update: mockUpdate });

      const response: InterestResponse = {
        interestId: 'interest-1',
        postId: 'post-1',
        response: 'accepted',
        message: 'Come pick it up!',
        timestamp: Date.now(),
        responderId: 'user-1',
      };

      await transport.sendResponse(response);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('interests');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'accepted',
          response_message: response.message,
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', response.interestId);
    });

    it('should send a decline response successfully', async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ update: mockUpdate });

      const response: InterestResponse = {
        interestId: 'interest-1',
        postId: 'post-1',
        response: 'declined',
        message: 'Already claimed',
        timestamp: Date.now(),
        responderId: 'user-1',
      };

      await transport.sendResponse(response);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'declined',
          response_message: response.message,
        })
      );
    });

    it('should throw TransportError on failure', async () => {
      const mockError = { message: 'Database error', code: 'DB_ERROR' };
      const mockEq = jest.fn().mockResolvedValue({ error: mockError });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ update: mockUpdate });

      const response: InterestResponse = {
        interestId: 'interest-1',
        postId: 'post-1',
        response: 'accepted',
        timestamp: Date.now(),
        responderId: 'user-1',
      };

      await expect(transport.sendResponse(response)).rejects.toThrow(TransportError);
    }, 20000); // 20 second timeout for retry logic
  });

  describe('sendHeartbeat', () => {
    it('should handle heartbeat (no-op for online mode)', async () => {
      const payload: HeartbeatPayload = {
        v: 1,
        uid: 'user-1',
        ts: Date.now(),
        cap: 100,
      };

      // Should not throw
      await expect(transport.sendHeartbeat(payload)).resolves.not.toThrow();
    });
  });

  // ============================================
  // Fetch Operations Tests
  // ============================================

  describe('fetchPosts', () => {
    it('should fetch posts successfully', async () => {
      const mockData = [
        {
          id: 'post-1',
          author_id: 'user-1',
          author_identifier: 'Neighbor-A1B2',
          title: 'Fresh Tomatoes',
          description: 'Organic tomatoes',
          risk_tier: 'low',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          source: 'supabase',
          is_active: true,
          latitude: null,
          longitude: null,
        },
      ];

      const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockGt = jest.fn().mockReturnValue({ order: mockOrder });
      const mockEq = jest.fn().mockReturnValue({ gt: mockGt });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const posts = await transport.fetchPosts();

      expect(posts).toHaveLength(1);
      expect(posts[0]).toMatchObject({
        id: 'post-1',
        authorId: 'user-1',
        authorIdentifier: 'Neighbor-A1B2',
        title: 'Fresh Tomatoes',
        description: 'Organic tomatoes',
        riskTier: 'low',
        source: 'supabase',
      });
    });

    it('should throw TransportError on failure', async () => {
      const mockError = { message: 'Database error', code: 'DB_ERROR' };
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: mockError });
      const mockGt = jest.fn().mockReturnValue({ order: mockOrder });
      const mockEq = jest.fn().mockReturnValue({ gt: mockGt });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      await expect(transport.fetchPosts()).rejects.toThrow(TransportError);
    }, 20000); // 20 second timeout for retry logic
  });

  // ============================================
  // Subscription Tests
  // ============================================

  describe('onPostReceived', () => {
    it('should subscribe to new posts', () => {
      const mockSubscribe = jest.fn().mockReturnValue({ unsubscribe: jest.fn() });
      const mockOn = jest.fn().mockReturnValue({ subscribe: mockSubscribe });
      const mockChannel = jest.fn().mockReturnValue({ on: mockOn });
      mockSupabaseClient.channel = mockChannel;

      const handler = jest.fn();
      const unsubscribe = transport.onPostReceived(handler);

      expect(mockChannel).toHaveBeenCalled();
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'share_posts' },
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });
  });

  describe('onInterestReceived', () => {
    it('should subscribe to new interests', () => {
      const mockSubscribe = jest.fn().mockReturnValue({ unsubscribe: jest.fn() });
      const mockOn = jest.fn().mockReturnValue({ subscribe: mockSubscribe });
      const mockChannel = jest.fn().mockReturnValue({ on: mockOn });
      mockSupabaseClient.channel = mockChannel;

      const handler = jest.fn();
      const unsubscribe = transport.onInterestReceived(handler);

      expect(mockChannel).toHaveBeenCalled();
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'interests' },
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });
  });

  describe('onResponseReceived', () => {
    it('should subscribe to interest responses', () => {
      const mockSubscribe = jest.fn().mockReturnValue({ unsubscribe: jest.fn() });
      const mockOn = jest.fn().mockReturnValue({ subscribe: mockSubscribe });
      const mockChannel = jest.fn().mockReturnValue({ on: mockOn });
      mockSupabaseClient.channel = mockChannel;

      const handler = jest.fn();
      const unsubscribe = transport.onResponseReceived(handler);

      expect(mockChannel).toHaveBeenCalled();
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'interests' },
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });
  });

  describe('onHeartbeatReceived', () => {
    it('should return no-op unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = transport.onHeartbeatReceived(handler);

      // Should not throw
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  // ============================================
  // Cleanup Tests
  // ============================================

  describe('dispose', () => {
    it('should unsubscribe from all subscriptions', () => {
      const mockUnsubscribe = jest.fn();
      const mockSubscribe = jest.fn().mockReturnValue({ unsubscribe: mockUnsubscribe });
      const mockOn = jest.fn().mockReturnValue({ subscribe: mockSubscribe });
      const mockChannel = jest.fn().mockReturnValue({ on: mockOn });
      mockSupabaseClient.channel = mockChannel;

      // Create some subscriptions
      transport.onPostReceived(jest.fn());
      transport.onInterestReceived(jest.fn());

      // Dispose
      transport.dispose();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    });
  });
});
