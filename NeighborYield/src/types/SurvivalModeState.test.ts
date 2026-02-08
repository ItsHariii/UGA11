/**
 * Unit tests for SurvivalModeState interface and state management
 * Tests state initialization, reducer actions, and state transitions
 * 
 * Requirements: All (comprehensive state management)
 */

import {
  SurvivalModeState,
  PostAction,
  UIAction,
  NetworkAction,
  BatteryAction,
  survivalModeReducer,
  createInitialSurvivalModeState,
  createSurvivalPost,
  BATTERY_THRESHOLDS,
} from './index';

describe('SurvivalModeState', () => {
  describe('createInitialSurvivalModeState', () => {
    it('should create initial state with default battery level', () => {
      const state = createInitialSurvivalModeState(123);
      
      expect(state.posts).toEqual([]);
      expect(state.activeTab).toBe('community');
      expect(state.isCreating).toBe(false);
      expect(state.peerCount).toBe(0);
      expect(state.isDiscovering).toBe(false);
      expect(state.batteryLevel).toBe(100);
      expect(state.userHouseNumber).toBe(123);
      expect(state.powerSaveMode).toBe(false);
      expect(state.batteryConfig.animationsEnabled).toBe(true);
    });

    it('should create initial state with custom battery level', () => {
      const state = createInitialSurvivalModeState(456, 15);
      
      expect(state.batteryLevel).toBe(15);
      expect(state.powerSaveMode).toBe(true);
      expect(state.batteryConfig.animationsEnabled).toBe(false);
      expect(state.batteryConfig.discoveryInterval).toBe(BATTERY_THRESHOLDS.LOW.interval);
    });

    it('should set lastSyncTime to current time', () => {
      const before = Date.now();
      const state = createInitialSurvivalModeState(789);
      const after = Date.now();
      
      expect(state.lastSyncTime).toBeGreaterThanOrEqual(before);
      expect(state.lastSyncTime).toBeLessThanOrEqual(after);
    });
  });

  describe('survivalModeReducer - Post Actions', () => {
    let initialState: SurvivalModeState;

    beforeEach(() => {
      initialState = createInitialSurvivalModeState(123);
    });

    it('should add a post', () => {
      const post = createSurvivalPost('h', 'Fresh tomatoes', 123)!;
      const action: PostAction = { type: 'ADD_POST', post };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.posts).toHaveLength(1);
      expect(newState.posts[0]).toEqual(post);
    });

    it('should remove a post', () => {
      const post1 = createSurvivalPost('h', 'Tomatoes', 123)!;
      const post2 = createSurvivalPost('w', 'Milk', 124)!;
      const stateWithPosts = {
        ...initialState,
        posts: [post1, post2],
      };
      
      const action: PostAction = { type: 'REMOVE_POST', postId: post1.id };
      const newState = survivalModeReducer(stateWithPosts, action);
      
      expect(newState.posts).toHaveLength(1);
      expect(newState.posts[0].id).toBe(post2.id);
    });

    it('should update a post', () => {
      const post = createSurvivalPost('w', 'Need milk', 123)!;
      const stateWithPost = {
        ...initialState,
        posts: [post],
      };
      
      const action: PostAction = {
        type: 'UPDATE_POST',
        postId: post.id,
        updates: { r: ['124', '125'] },
      };
      const newState = survivalModeReducer(stateWithPost, action);
      
      expect(newState.posts[0].r).toEqual(['124', '125']);
    });

    it('should merge posts without duplicates', () => {
      const post1 = createSurvivalPost('h', 'Tomatoes', 123)!;
      const post2 = createSurvivalPost('w', 'Milk', 124)!;
      const post3 = createSurvivalPost('s', 'Help needed', 125, 'm')!;
      
      const stateWithPosts = {
        ...initialState,
        posts: [post1, post2],
      };
      
      // Try to merge post2 (duplicate) and post3 (new)
      const action: PostAction = {
        type: 'MERGE_POSTS',
        posts: [post2, post3],
      };
      const newState = survivalModeReducer(stateWithPosts, action);
      
      expect(newState.posts).toHaveLength(3);
      expect(newState.posts.map(p => p.id)).toEqual([post1.id, post2.id, post3.id]);
    });

    it('should add responder to a post', () => {
      const post = createSurvivalPost('w', 'Need milk', 123)!;
      const stateWithPost = {
        ...initialState,
        posts: [post],
      };
      
      const action: PostAction = {
        type: 'ADD_RESPONDER',
        postId: post.id,
        houseNumber: '124',
      };
      const newState = survivalModeReducer(stateWithPost, action);
      
      expect(newState.posts[0].r).toEqual(['124']);
    });

    it('should not add duplicate responder', () => {
      const post = createSurvivalPost('w', 'Need milk', 123)!;
      post.r = ['124'];
      const stateWithPost = {
        ...initialState,
        posts: [post],
      };
      
      const action: PostAction = {
        type: 'ADD_RESPONDER',
        postId: post.id,
        houseNumber: '124',
      };
      const newState = survivalModeReducer(stateWithPost, action);
      
      expect(newState.posts[0].r).toEqual(['124']);
    });

    it('should resolve SOS post', () => {
      const sosPost = createSurvivalPost('s', 'Medical emergency', 123, 'm')!;
      const stateWithPost = {
        ...initialState,
        posts: [sosPost],
      };
      
      const action: PostAction = {
        type: 'RESOLVE_SOS',
        postId: sosPost.id,
      };
      const newState = survivalModeReducer(stateWithPost, action);
      
      expect(newState.posts[0].resolved).toBe(true);
    });

    it('should only resolve SOS posts', () => {
      const havePost = createSurvivalPost('h', 'Tomatoes', 123)!;
      const stateWithPost = {
        ...initialState,
        posts: [havePost],
      };
      
      const action: PostAction = {
        type: 'RESOLVE_SOS',
        postId: havePost.id,
      };
      const newState = survivalModeReducer(stateWithPost, action);
      
      expect(newState.posts[0].resolved).toBeUndefined();
    });
  });

  describe('survivalModeReducer - UI Actions', () => {
    let initialState: SurvivalModeState;

    beforeEach(() => {
      initialState = createInitialSurvivalModeState(123);
    });

    it('should set active tab to community', () => {
      const stateWithSOS = { ...initialState, activeTab: 'sos' as const };
      const action: UIAction = { type: 'SET_ACTIVE_TAB', tab: 'community' };
      
      const newState = survivalModeReducer(stateWithSOS, action);
      
      expect(newState.activeTab).toBe('community');
    });

    it('should set active tab to sos', () => {
      const action: UIAction = { type: 'SET_ACTIVE_TAB', tab: 'sos' };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.activeTab).toBe('sos');
    });

    it('should toggle create form', () => {
      const action: UIAction = { type: 'TOGGLE_CREATE_FORM' };
      
      const newState1 = survivalModeReducer(initialState, action);
      expect(newState1.isCreating).toBe(true);
      
      const newState2 = survivalModeReducer(newState1, action);
      expect(newState2.isCreating).toBe(false);
    });

    it('should set creating state', () => {
      const action1: UIAction = { type: 'SET_CREATING', isCreating: true };
      const newState1 = survivalModeReducer(initialState, action1);
      expect(newState1.isCreating).toBe(true);
      
      const action2: UIAction = { type: 'SET_CREATING', isCreating: false };
      const newState2 = survivalModeReducer(newState1, action2);
      expect(newState2.isCreating).toBe(false);
    });
  });

  describe('survivalModeReducer - Network Actions', () => {
    let initialState: SurvivalModeState;

    beforeEach(() => {
      initialState = createInitialSurvivalModeState(123);
    });

    it('should update peer count', () => {
      const action: NetworkAction = { type: 'UPDATE_PEER_COUNT', count: 5 };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.peerCount).toBe(5);
    });

    it('should set discovering state', () => {
      const action1: NetworkAction = { type: 'SET_DISCOVERING', isDiscovering: true };
      const newState1 = survivalModeReducer(initialState, action1);
      expect(newState1.isDiscovering).toBe(true);
      
      const action2: NetworkAction = { type: 'SET_DISCOVERING', isDiscovering: false };
      const newState2 = survivalModeReducer(newState1, action2);
      expect(newState2.isDiscovering).toBe(false);
    });

    it('should update sync time', () => {
      const timestamp = Date.now();
      const action: NetworkAction = { type: 'UPDATE_SYNC_TIME', timestamp };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.lastSyncTime).toBe(timestamp);
    });

    it('should increment peer count on peer connected', () => {
      const action: NetworkAction = { type: 'PEER_CONNECTED', endpointId: 'peer1' };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.peerCount).toBe(1);
    });

    it('should decrement peer count on peer disconnected', () => {
      const stateWithPeers = { ...initialState, peerCount: 3 };
      const action: NetworkAction = { type: 'PEER_DISCONNECTED', endpointId: 'peer1' };
      
      const newState = survivalModeReducer(stateWithPeers, action);
      
      expect(newState.peerCount).toBe(2);
    });

    it('should not go below zero peer count', () => {
      const action: NetworkAction = { type: 'PEER_DISCONNECTED', endpointId: 'peer1' };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.peerCount).toBe(0);
    });
  });

  describe('survivalModeReducer - Battery Actions', () => {
    let initialState: SurvivalModeState;

    beforeEach(() => {
      initialState = createInitialSurvivalModeState(123, 100);
    });

    it('should update battery level and config for high battery', () => {
      const action: BatteryAction = { type: 'UPDATE_BATTERY', level: 75 };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.batteryLevel).toBe(75);
      expect(newState.batteryConfig.discoveryInterval).toBe(BATTERY_THRESHOLDS.HIGH.interval);
      expect(newState.batteryConfig.animationsEnabled).toBe(true);
      expect(newState.powerSaveMode).toBe(false);
    });

    it('should update battery level and config for medium battery', () => {
      const action: BatteryAction = { type: 'UPDATE_BATTERY', level: 35 };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.batteryLevel).toBe(35);
      expect(newState.batteryConfig.discoveryInterval).toBe(BATTERY_THRESHOLDS.MEDIUM.interval);
      expect(newState.batteryConfig.animationsEnabled).toBe(true);
      expect(newState.powerSaveMode).toBe(false);
    });

    it('should update battery level and config for low battery', () => {
      const action: BatteryAction = { type: 'UPDATE_BATTERY', level: 15 };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.batteryLevel).toBe(15);
      expect(newState.batteryConfig.discoveryInterval).toBe(BATTERY_THRESHOLDS.LOW.interval);
      expect(newState.batteryConfig.animationsEnabled).toBe(false);
      expect(newState.powerSaveMode).toBe(true);
    });

    it('should toggle power save mode', () => {
      const action: BatteryAction = { type: 'TOGGLE_POWER_SAVE' };
      
      const newState1 = survivalModeReducer(initialState, action);
      expect(newState1.powerSaveMode).toBe(true);
      
      const newState2 = survivalModeReducer(newState1, action);
      expect(newState2.powerSaveMode).toBe(false);
    });

    it('should set power save mode', () => {
      const action1: BatteryAction = { type: 'SET_POWER_SAVE', enabled: true };
      const newState1 = survivalModeReducer(initialState, action1);
      expect(newState1.powerSaveMode).toBe(true);
      
      const action2: BatteryAction = { type: 'SET_POWER_SAVE', enabled: false };
      const newState2 = survivalModeReducer(newState1, action2);
      expect(newState2.powerSaveMode).toBe(false);
    });

    it('should update battery config', () => {
      const customConfig = {
        level: 50,
        discoveryInterval: 20000,
        animationsEnabled: false,
        powerSaveMode: true,
      };
      const action: BatteryAction = { type: 'UPDATE_BATTERY_CONFIG', config: customConfig };
      
      const newState = survivalModeReducer(initialState, action);
      
      expect(newState.batteryConfig).toEqual(customConfig);
    });
  });

  describe('State immutability', () => {
    it('should not mutate original state when adding post', () => {
      const initialState = createInitialSurvivalModeState(123);
      const originalPosts = initialState.posts;
      
      const post = createSurvivalPost('h', 'Tomatoes', 123)!;
      const action: PostAction = { type: 'ADD_POST', post };
      
      survivalModeReducer(initialState, action);
      
      expect(initialState.posts).toBe(originalPosts);
      expect(initialState.posts).toHaveLength(0);
    });

    it('should not mutate original state when updating UI', () => {
      const initialState = createInitialSurvivalModeState(123);
      const originalTab = initialState.activeTab;
      
      const action: UIAction = { type: 'SET_ACTIVE_TAB', tab: 'sos' };
      
      survivalModeReducer(initialState, action);
      
      expect(initialState.activeTab).toBe(originalTab);
    });

    it('should not mutate original state when updating network', () => {
      const initialState = createInitialSurvivalModeState(123);
      const originalPeerCount = initialState.peerCount;
      
      const action: NetworkAction = { type: 'UPDATE_PEER_COUNT', count: 5 };
      
      survivalModeReducer(initialState, action);
      
      expect(initialState.peerCount).toBe(originalPeerCount);
    });

    it('should not mutate original state when updating battery', () => {
      const initialState = createInitialSurvivalModeState(123);
      const originalBatteryLevel = initialState.batteryLevel;
      
      const action: BatteryAction = { type: 'UPDATE_BATTERY', level: 50 };
      
      survivalModeReducer(initialState, action);
      
      expect(initialState.batteryLevel).toBe(originalBatteryLevel);
    });
  });

  describe('Complex state transitions', () => {
    it('should handle multiple actions in sequence', () => {
      let state = createInitialSurvivalModeState(123);
      
      // Add posts
      const post1 = createSurvivalPost('h', 'Tomatoes', 123)!;
      state = survivalModeReducer(state, { type: 'ADD_POST', post: post1 });
      
      const post2 = createSurvivalPost('w', 'Milk', 124)!;
      state = survivalModeReducer(state, { type: 'ADD_POST', post: post2 });
      
      // Switch tab
      state = survivalModeReducer(state, { type: 'SET_ACTIVE_TAB', tab: 'sos' });
      
      // Update network
      state = survivalModeReducer(state, { type: 'UPDATE_PEER_COUNT', count: 3 });
      state = survivalModeReducer(state, { type: 'SET_DISCOVERING', isDiscovering: true });
      
      // Update battery
      state = survivalModeReducer(state, { type: 'UPDATE_BATTERY', level: 25 });
      
      // Verify final state
      expect(state.posts).toHaveLength(2);
      expect(state.activeTab).toBe('sos');
      expect(state.peerCount).toBe(3);
      expect(state.isDiscovering).toBe(true);
      expect(state.batteryLevel).toBe(25);
      expect(state.batteryConfig.discoveryInterval).toBe(BATTERY_THRESHOLDS.MEDIUM.interval);
    });

    it('should handle post lifecycle', () => {
      let state = createInitialSurvivalModeState(123);
      
      // Create and add post
      const post = createSurvivalPost('w', 'Need milk', 123)!;
      state = survivalModeReducer(state, { type: 'ADD_POST', post });
      
      // Add responders
      state = survivalModeReducer(state, {
        type: 'ADD_RESPONDER',
        postId: post.id,
        houseNumber: '124',
      });
      state = survivalModeReducer(state, {
        type: 'ADD_RESPONDER',
        postId: post.id,
        houseNumber: '125',
      });
      
      // Update post
      state = survivalModeReducer(state, {
        type: 'UPDATE_POST',
        postId: post.id,
        updates: { i: 'Need milk urgently' },
      });
      
      // Verify state
      expect(state.posts[0].r).toEqual(['124', '125']);
      expect(state.posts[0].i).toBe('Need milk urgently');
      
      // Remove post
      state = survivalModeReducer(state, { type: 'REMOVE_POST', postId: post.id });
      expect(state.posts).toHaveLength(0);
    });
  });
});
