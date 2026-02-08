/**
 * AppContext
 * Central state management for NeighborYield app.
 * Provides connectivity mode, permissions, peer count, posts, and interests to all components.
 *
 * Requirements: All UI requirements
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  ReactNode,
} from 'react';
import {
  ConnectivityMode,
  InterestAck,
  PeerInfo,
  PermissionStatus,
  SharePost,
} from '../types';

// ============================================
// State Interface
// ============================================

export interface AppState {
  // Connectivity
  connectivityMode: ConnectivityMode;

  // Permissions
  permissions: PermissionStatus;
  isBluetoothEnabled: boolean;

  // Presence
  peerCount: number;
  peers: Map<string, PeerInfo>;

  // Posts
  posts: SharePost[];

  // Interests
  myInterests: Map<string, InterestAck>;
  incomingInterests: InterestAck[];

  // User
  userIdentifier: string;
  userId: string;

  // Battery
  batteryLevel: number;
  isBackgroundMeshEnabled: boolean;

  // UI State
  isRefreshing: boolean;
}

// ============================================
// Action Types
// ============================================

type AppAction =
  | { type: 'SET_CONNECTIVITY_MODE'; payload: ConnectivityMode }
  | { type: 'SET_PERMISSIONS'; payload: PermissionStatus }
  | { type: 'SET_BLUETOOTH_ENABLED'; payload: boolean }
  | { type: 'SET_PEER_COUNT'; payload: number }
  | { type: 'SET_PEERS'; payload: Map<string, PeerInfo> }
  | { type: 'ADD_PEER'; payload: PeerInfo }
  | { type: 'REMOVE_PEER'; payload: string }
  | { type: 'SET_POSTS'; payload: SharePost[] }
  | { type: 'ADD_POST'; payload: SharePost }
  | { type: 'REMOVE_POST'; payload: string }
  | { type: 'REMOVE_EXPIRED_POSTS'; payload: number }
  | { type: 'SET_MY_INTEREST'; payload: InterestAck }
  | { type: 'ADD_INCOMING_INTEREST'; payload: InterestAck }
  | { type: 'UPDATE_INTEREST_STATUS'; payload: { id: string; status: InterestAck['status'] } }
  | { type: 'SET_BATTERY_LEVEL'; payload: number }
  | { type: 'SET_BACKGROUND_MESH_ENABLED'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_USER'; payload: { userId: string; userIdentifier: string } };

// ============================================
// Initial State
// ============================================

const defaultPermissions: PermissionStatus = {
  bluetooth: 'denied',
  location: 'denied',
  nearbyDevices: 'denied',
  canUseMesh: false,
};

export const initialAppState: AppState = {
  connectivityMode: 'disconnected',
  permissions: defaultPermissions,
  isBluetoothEnabled: false,
  peerCount: 0,
  peers: new Map(),
  posts: [],
  myInterests: new Map(),
  incomingInterests: [],
  userIdentifier: '',
  userId: '',
  batteryLevel: 100,
  isBackgroundMeshEnabled: false,
  isRefreshing: false,
};

// ============================================
// Reducer
// ============================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CONNECTIVITY_MODE':
      return { ...state, connectivityMode: action.payload };

    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };

    case 'SET_BLUETOOTH_ENABLED':
      return { ...state, isBluetoothEnabled: action.payload };

    case 'SET_PEER_COUNT':
      return { ...state, peerCount: action.payload };

    case 'SET_PEERS': {
      return {
        ...state,
        peers: action.payload,
        peerCount: action.payload.size,
      };
    }

    case 'ADD_PEER': {
      const newPeers = new Map(state.peers);
      newPeers.set(action.payload.endpointId, action.payload);
      return {
        ...state,
        peers: newPeers,
        peerCount: newPeers.size,
      };
    }

    case 'REMOVE_PEER': {
      const newPeers = new Map(state.peers);
      newPeers.delete(action.payload);
      return {
        ...state,
        peers: newPeers,
        peerCount: newPeers.size,
      };
    }

    case 'SET_POSTS':
      return { ...state, posts: action.payload };

    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };

    case 'REMOVE_POST':
      return {
        ...state,
        posts: state.posts.filter((p) => p.id !== action.payload),
      };

    case 'REMOVE_EXPIRED_POSTS': {
      const currentTime = action.payload;
      return {
        ...state,
        posts: state.posts.filter((p) => p.expiresAt > currentTime),
      };
    }

    case 'SET_MY_INTEREST': {
      const newInterests = new Map(state.myInterests);
      newInterests.set(action.payload.postId, action.payload);
      return { ...state, myInterests: newInterests };
    }

    case 'ADD_INCOMING_INTEREST':
      return {
        ...state,
        incomingInterests: [...state.incomingInterests, action.payload],
      };

    case 'UPDATE_INTEREST_STATUS': {
      const { id, status } = action.payload;
      // Update in myInterests
      const newMyInterests = new Map(state.myInterests);
      for (const [postId, interest] of newMyInterests) {
        if (interest.id === id) {
          newMyInterests.set(postId, { ...interest, status });
          break;
        }
      }
      // Update in incomingInterests
      const newIncoming = state.incomingInterests.map((i) =>
        i.id === id ? { ...i, status } : i
      );
      return {
        ...state,
        myInterests: newMyInterests,
        incomingInterests: newIncoming,
      };
    }

    case 'SET_BATTERY_LEVEL':
      return { ...state, batteryLevel: action.payload };

    case 'SET_BACKGROUND_MESH_ENABLED':
      return { ...state, isBackgroundMeshEnabled: action.payload };

    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };

    case 'SET_USER':
      return {
        ...state,
        userId: action.payload.userId,
        userIdentifier: action.payload.userIdentifier,
      };

    default:
      return state;
  }
}

// ============================================
// Context Interface
// ============================================

export interface AppContextValue {
  state: AppState;

  // Connectivity actions
  setConnectivityMode: (mode: ConnectivityMode) => void;

  // Permission actions
  setPermissions: (permissions: PermissionStatus) => void;
  setBluetoothEnabled: (enabled: boolean) => void;

  // Peer actions
  setPeerCount: (count: number) => void;
  setPeers: (peers: Map<string, PeerInfo>) => void;
  addPeer: (peer: PeerInfo) => void;
  removePeer: (endpointId: string) => void;

  // Post actions
  setPosts: (posts: SharePost[]) => void;
  addPost: (post: SharePost) => void;
  removePost: (postId: string) => void;
  removeExpiredPosts: (currentTime: number) => void;

  // Interest actions
  setMyInterest: (interest: InterestAck) => void;
  addIncomingInterest: (interest: InterestAck) => void;
  updateInterestStatus: (id: string, status: InterestAck['status']) => void;

  // Battery actions
  setBatteryLevel: (level: number) => void;
  setBackgroundMeshEnabled: (enabled: boolean) => void;

  // UI actions
  setRefreshing: (refreshing: boolean) => void;

  // User actions
  setUser: (userId: string, userIdentifier: string) => void;
}

// ============================================
// Context Creation
// ============================================

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

export interface AppProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

export function AppProvider({
  children,
  initialState,
}: AppProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialAppState,
    ...initialState,
  });

  // Connectivity actions
  const setConnectivityMode = useCallback((mode: ConnectivityMode) => {
    dispatch({ type: 'SET_CONNECTIVITY_MODE', payload: mode });
  }, []);

  // Permission actions
  const setPermissions = useCallback((permissions: PermissionStatus) => {
    dispatch({ type: 'SET_PERMISSIONS', payload: permissions });
  }, []);

  const setBluetoothEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_BLUETOOTH_ENABLED', payload: enabled });
  }, []);

  // Peer actions
  const setPeerCount = useCallback((count: number) => {
    dispatch({ type: 'SET_PEER_COUNT', payload: count });
  }, []);

  const setPeers = useCallback((peers: Map<string, PeerInfo>) => {
    dispatch({ type: 'SET_PEERS', payload: peers });
  }, []);

  const addPeer = useCallback((peer: PeerInfo) => {
    dispatch({ type: 'ADD_PEER', payload: peer });
  }, []);

  const removePeer = useCallback((endpointId: string) => {
    dispatch({ type: 'REMOVE_PEER', payload: endpointId });
  }, []);

  // Post actions
  const setPosts = useCallback((posts: SharePost[]) => {
    dispatch({ type: 'SET_POSTS', payload: posts });
  }, []);

  const addPost = useCallback((post: SharePost) => {
    dispatch({ type: 'ADD_POST', payload: post });
  }, []);

  const removePost = useCallback((postId: string) => {
    dispatch({ type: 'REMOVE_POST', payload: postId });
  }, []);

  const removeExpiredPosts = useCallback((currentTime: number) => {
    dispatch({ type: 'REMOVE_EXPIRED_POSTS', payload: currentTime });
  }, []);

  // Interest actions
  const setMyInterest = useCallback((interest: InterestAck) => {
    dispatch({ type: 'SET_MY_INTEREST', payload: interest });
  }, []);

  const addIncomingInterest = useCallback((interest: InterestAck) => {
    dispatch({ type: 'ADD_INCOMING_INTEREST', payload: interest });
  }, []);

  const updateInterestStatus = useCallback(
    (id: string, status: InterestAck['status']) => {
      dispatch({ type: 'UPDATE_INTEREST_STATUS', payload: { id, status } });
    },
    []
  );

  // Battery actions
  const setBatteryLevel = useCallback((level: number) => {
    dispatch({ type: 'SET_BATTERY_LEVEL', payload: level });
  }, []);

  const setBackgroundMeshEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_BACKGROUND_MESH_ENABLED', payload: enabled });
  }, []);

  // UI actions
  const setRefreshing = useCallback((refreshing: boolean) => {
    dispatch({ type: 'SET_REFRESHING', payload: refreshing });
  }, []);

  // User actions
  const setUser = useCallback((userId: string, userIdentifier: string) => {
    dispatch({ type: 'SET_USER', payload: { userId, userIdentifier } });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      setConnectivityMode,
      setPermissions,
      setBluetoothEnabled,
      setPeerCount,
      setPeers,
      addPeer,
      removePeer,
      setPosts,
      addPost,
      removePost,
      removeExpiredPosts,
      setMyInterest,
      addIncomingInterest,
      updateInterestStatus,
      setBatteryLevel,
      setBackgroundMeshEnabled,
      setRefreshing,
      setUser,
    }),
    [
      state,
      setConnectivityMode,
      setPermissions,
      setBluetoothEnabled,
      setPeerCount,
      setPeers,
      addPeer,
      removePeer,
      setPosts,
      addPost,
      removePost,
      removeExpiredPosts,
      setMyInterest,
      addIncomingInterest,
      updateInterestStatus,
      setBatteryLevel,
      setBackgroundMeshEnabled,
      setRefreshing,
      setUser,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================
// Hook
// ============================================

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
