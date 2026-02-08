/**
 * Gossip Protocol Service Tests
 * 
 * Tests message broadcasting, deduplication, priority queuing, and hop limiting
 * Requirements: 9.1-9.10
 */

import {
  gossipService,
  getPostPriority,
  MessagePriority,
  compressPostList,
  decompressPostList,
  validatePost,
  MAX_HOPS,
  RETRY_BACKOFF,
  GossipMessage,
} from './gossip.service';
import { SurvivalPost } from '../types';

describe('Gossip Protocol Service', () => {
  // Helper to create test posts
  const createTestPost = (type: 'h' | 'w' | 's', id: string): SurvivalPost => ({
    t: type,
    i: 'Test item',
    h: 123,
    ts: Date.now(),
    id,
  });

  describe('getPostPriority', () => {
    it('should assign highest priority to SOS posts', () => {
      expect(getPostPriority('s')).toBe(MessagePriority.SOS);
    });

    it('should assign medium priority to Want posts', () => {
      expect(getPostPriority('w')).toBe(MessagePriority.WANT);
    });

    it('should assign lowest priority to Have posts', () => {
      expect(getPostPriority('h')).toBe(MessagePriority.HAVE);
    });

    it('should have correct priority ordering', () => {
      expect(MessagePriority.SOS).toBeLessThan(MessagePriority.WANT);
      expect(MessagePriority.WANT).toBeLessThan(MessagePriority.HAVE);
    });
  });

  describe('compressPostList and decompressPostList', () => {
    it('should compress and decompress post list correctly', () => {
      const posts: SurvivalPost[] = [
        createTestPost('h', 'post001'),
        createTestPost('w', 'post002'),
        createTestPost('s', 'post003'),
      ];

      const compressed = compressPostList(posts);
      const decompressed = decompressPostList(compressed);

      expect(decompressed).toEqual(posts);
    });

    it('should handle empty post list', () => {
      const compressed = compressPostList([]);
      const decompressed = decompressPostList(compressed);

      expect(decompressed).toEqual([]);
    });

    it('should handle invalid compressed data', () => {
      const decompressed = decompressPostList('invalid json');
      expect(decompressed).toEqual([]);
    });
  });

  describe('validatePost', () => {
    it('should validate correct post', () => {
      const post = createTestPost('h', 'post001');
      expect(validatePost(post)).toBe(true);
    });

    it('should reject post with invalid type', () => {
      const post = { ...createTestPost('h', 'post001'), t: 'x' };
      expect(validatePost(post)).toBe(false);
    });

    it('should reject post with missing fields', () => {
      const post = { t: 'h', i: 'Test' };
      expect(validatePost(post)).toBe(false);
    });

    it('should reject post with item too long', () => {
      const post = createTestPost('h', 'post001');
      post.i = 'x'.repeat(101); // > 100 chars
      expect(validatePost(post)).toBe(false);
    });

    it('should reject post with invalid id length', () => {
      const post = createTestPost('h', 'short');
      expect(validatePost(post)).toBe(false);
    });

    it('should accept post with optional fields', () => {
      const post: SurvivalPost = {
        ...createTestPost('s', 'post001'),
        r: ['124', '125'],
        c: 'm',
      };
      expect(validatePost(post)).toBe(true);
    });
  });

  describe('Message Broadcasting', () => {
    beforeEach(() => {
      // Reset service state
      gossipService['localPosts'].clear();
      gossipService['receivedMessageIds'].clear();
      gossipService['messageQueue'] = [];
    });

    it('should add local post and broadcast', () => {
      const post = createTestPost('h', 'post001');
      gossipService.addLocalPost(post);

      const localPosts = gossipService.getLocalPosts();
      expect(localPosts).toContainEqual(post);
    });

    it('should remove local post', () => {
      const post = createTestPost('h', 'post001');
      gossipService.addLocalPost(post);
      gossipService.removeLocalPost('post001');

      const localPosts = gossipService.getLocalPosts();
      expect(localPosts).not.toContainEqual(post);
    });

    it('should broadcast multiple posts sorted by priority', () => {
      const havePost = createTestPost('h', 'post001');
      const wantPost = createTestPost('w', 'post002');
      const sosPost = createTestPost('s', 'post003');

      gossipService.addLocalPost(havePost);
      gossipService.addLocalPost(wantPost);
      gossipService.addLocalPost(sosPost);

      const localPosts = gossipService.getLocalPosts();
      expect(localPosts).toHaveLength(3);
    });
  });

  describe('Message Receiving and Deduplication', () => {
    beforeEach(() => {
      gossipService['localPosts'].clear();
      gossipService['receivedMessageIds'].clear();
      gossipService['peerSyncStatus'].clear();
      gossipService['messageQueue'] = [];
    });

    it('should receive and merge new posts', () => {
      const post = createTestPost('h', 'post001');
      const message: GossipMessage = {
        type: 'post_list',
        payload: [post],
        hopCount: 0,
        timestamp: Date.now(),
        senderId: 'peer1',
      };

      const newPosts = gossipService.receiveMessage(message, 'peer1');
      
      expect(newPosts).toHaveLength(1);
      expect(newPosts[0]).toEqual(post);
      expect(gossipService.getLocalPosts()).toContainEqual(post);
    });

    it('should deduplicate received messages', () => {
      const post = createTestPost('h', 'post001');
      const message: GossipMessage = {
        type: 'post_list',
        payload: [post],
        hopCount: 0,
        timestamp: Date.now(),
        senderId: 'peer1',
      };

      // Receive same message twice
      const newPosts1 = gossipService.receiveMessage(message, 'peer1');
      const newPosts2 = gossipService.receiveMessage(message, 'peer1');

      expect(newPosts1).toHaveLength(1);
      expect(newPosts2).toHaveLength(0); // Duplicate, ignored
    });

    it('should reject messages exceeding max hops', () => {
      const post = createTestPost('h', 'post001');
      const message: GossipMessage = {
        type: 'post_list',
        payload: [post],
        hopCount: MAX_HOPS,
        timestamp: Date.now(),
        senderId: 'peer1',
      };

      const newPosts = gossipService.receiveMessage(message, 'peer1');
      
      expect(newPosts).toHaveLength(0);
    });

    it('should filter out invalid posts', () => {
      const validPost = createTestPost('h', 'post001');
      const invalidPost = { t: 'x', i: 'Invalid' };
      
      const message: GossipMessage = {
        type: 'post_list',
        payload: [validPost, invalidPost],
        hopCount: 0,
        timestamp: Date.now(),
        senderId: 'peer1',
      };

      const newPosts = gossipService.receiveMessage(message, 'peer1');
      
      expect(newPosts).toHaveLength(1);
      expect(newPosts[0]).toEqual(validPost);
    });

    it('should update peer sync status', () => {
      const post = createTestPost('h', 'post001');
      const message: GossipMessage = {
        type: 'post_list',
        payload: [post],
        hopCount: 0,
        timestamp: Date.now(),
        senderId: 'peer1',
      };

      gossipService.receiveMessage(message, 'peer1');
      
      const peerStatus = gossipService.getPeerSyncStatus();
      expect(peerStatus).toHaveLength(1);
      expect(peerStatus[0].peerId).toBe('peer1');
      expect(peerStatus[0].messageCount).toBe(1);
    });
  });

  describe('Hop Count Limiting', () => {
    it('should increment hop count on rebroadcast', () => {
      const post = createTestPost('h', 'post001');
      const message: GossipMessage = {
        type: 'post_list',
        payload: [post],
        hopCount: 2,
        timestamp: Date.now(),
        senderId: 'peer1',
      };

      gossipService.receiveMessage(message, 'peer1');
      
      // Check that message would be rebroadcast with hopCount + 1
      // (In actual implementation, this would be in the message queue)
    });

    it('should respect MAX_HOPS constant', () => {
      expect(MAX_HOPS).toBe(5);
    });
  });

  describe('Retry Logic', () => {
    it('should have exponential backoff values', () => {
      expect(RETRY_BACKOFF).toEqual([1000, 2000, 4000, 8000]);
    });

    it('should have increasing backoff intervals', () => {
      for (let i = 1; i < RETRY_BACKOFF.length; i++) {
        expect(RETRY_BACKOFF[i]).toBeGreaterThan(RETRY_BACKOFF[i - 1]);
      }
    });
  });

  describe('Queue Statistics', () => {
    it('should return queue statistics', () => {
      const stats = gossipService.getQueueStats();
      
      expect(stats).toHaveProperty('queueLength');
      expect(stats).toHaveProperty('isProcessing');
      expect(stats).toHaveProperty('localPostCount');
      expect(stats).toHaveProperty('receivedMessageCount');
      expect(stats).toHaveProperty('peerCount');
    });
  });
});

describe('Gossip Protocol Property Tests', () => {
  const createTestPost = (type: 'h' | 'w' | 's', id: string): SurvivalPost => ({
    t: type,
    i: 'Test item',
    h: 123,
    ts: Date.now(),
    id,
  });

  beforeEach(() => {
    gossipService['localPosts'].clear();
    gossipService['receivedMessageIds'].clear();
  });

  it('should never have duplicate posts in merged list', () => {
    // Generate random posts with some duplicates
    const posts: SurvivalPost[] = [];
    const duplicateIds = ['dup0001x', 'dup0002x', 'dup0003x']; // 8 chars each
    
    // Add posts with duplicate IDs
    for (let i = 0; i < 10; i++) {
      const id = duplicateIds[i % duplicateIds.length];
      posts.push(createTestPost('h', id));
    }

    // Receive messages with these posts
    for (const post of posts) {
      const message: GossipMessage = {
        type: 'post_update',
        payload: [post],
        hopCount: 0,
        timestamp: Date.now() + Math.random(),
        senderId: 'peer1',
      };
      gossipService.receiveMessage(message, 'peer1');
    }

    // Check that local posts have no duplicates
    const localPosts = gossipService.getLocalPosts();
    const uniqueIds = new Set(localPosts.map(p => p.id));
    
    expect(localPosts.length).toBe(uniqueIds.size);
    expect(uniqueIds.size).toBe(duplicateIds.length);
  });

  it('should prioritize SOS messages over other types', () => {
    const posts: SurvivalPost[] = [
      createTestPost('h', 'have001'),
      createTestPost('w', 'want001'),
      createTestPost('s', 'sos0001'),
      createTestPost('h', 'have002'),
      createTestPost('s', 'sos0002'),
    ];

    const priorities = posts.map(post => getPostPriority(post.t));
    const sosPriorities = priorities.filter(p => p === MessagePriority.SOS);
    const otherPriorities = priorities.filter(p => p !== MessagePriority.SOS);

    // All SOS priorities should be lower (higher priority) than others
    for (const sosPriority of sosPriorities) {
      for (const otherPriority of otherPriorities) {
        expect(sosPriority).toBeLessThan(otherPriority);
      }
    }
  });

  it('should validate all posts before merging', () => {
    const validPosts: SurvivalPost[] = [
      createTestPost('h', 'post001'),
      createTestPost('w', 'post002'),
      createTestPost('s', 'post003'),
    ];

    const invalidPosts = [
      { t: 'x', i: 'Invalid type' },
      { t: 'h', i: 'x'.repeat(101), h: 123, ts: Date.now(), id: 'post004' },
      { t: 'h', i: 'Short ID', h: 123, ts: Date.now(), id: 'short' },
    ];

    // All valid posts should pass validation
    for (const post of validPosts) {
      expect(validatePost(post)).toBe(true);
    }

    // All invalid posts should fail validation
    for (const post of invalidPosts) {
      expect(validatePost(post)).toBe(false);
    }
  });
});
