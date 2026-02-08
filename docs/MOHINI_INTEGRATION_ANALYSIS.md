# Mohini's Business Logic Layer - Integration Analysis Report

## Executive Summary

This report provides a comprehensive analysis of how Mohini's business logic layer integrates with the existing NeighborYield React Native codebase. The analysis covers architecture comparison, integration points, data flow, migration strategy, conflicts, benefits, and a detailed implementation plan.

**Key Finding**: Mohini's business logic layer provides a clean separation of concerns with interface-driven design, but requires significant architectural changes to integrate with the current direct-Supabase implementation.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Current Implementation Analysis](#current-implementation-analysis)
3. [Mohini's Business Logic Layer](#mohinis-business-logic-layer)
4. [Integration Points](#integration-points)
5. [Data Flow Comparison](#data-flow-comparison)
6. [Conflicts and Resolutions](#conflicts-and-resolutions)
7. [Benefits and Trade-offs](#benefits-and-trade-offs)
8. [Migration Strategy](#migration-strategy)
9. [Implementation Plan](#implementation-plan)
10. [Testing Strategy](#testing-strategy)
11. [Risk Assessment](#risk-assessment)

---

## 1. Architecture Overview

### 1.1 Current Architecture (Hari's Implementation)

```
┌─────────────────────────────────────────────────────────┐
│                    React Native UI                       │
│  (Components, Screens, Hooks)                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  AppContext (Reducer)                    │
│  - State Management                                      │
│  - Direct Business Logic                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Services Layer                        │
│  - posts.service.ts                                      │
│  - interests.service.ts                                  │
│  - auth.service.ts                                       │
│  - messaging.service.ts                                  │
│  - bluetooth.service.ts                                  │
│  - gossip.service.ts                                     │
│  - mode-switching.service.ts                             │
│  - battery.service.ts                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Client                         │
│  - Direct database queries                               │
│  - Real-time subscriptions                               │
│  - Authentication                                        │
└─────────────────────────────────────────────────────────┘
```

**Characteristics**:
- Direct coupling between UI and data layer
- Business logic scattered across services and AppContext
- No abstraction layer for transport/networking
- Tightly coupled to Supabase implementation
- Limited testability due to direct dependencies

### 1.2 Proposed Architecture (With Mohini's Layer)

```
┌─────────────────────────────────────────────────────────┐
│                    React Native UI                       │
│  (Components, Screens, Hooks)                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  AppContext (Reducer)                    │
│  - State Management Only                                 │
│  - Delegates to Managers                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Business Logic Layer (Managers)             │
│  - BatteryManager (lifecycle, mesh control)             │
│  - PermissionManager (runtime permissions)              │
│  - PresenceManager (heartbeat, peer discovery)          │
│  - TTLManager (post expiration)                         │
│  - InterestManager (claim flow with retry)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Transport Layer                         │
│  - ITransportRouter (interface)                         │
│  - SupabaseTransport (online implementation)            │
│  - BluetoothTransport (offline implementation)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Infrastructure Services                     │
│  - Supabase Client                                       │
│  - Bluetooth/Nearby API                                  │
│  - Native Device APIs                                    │
└─────────────────────────────────────────────────────────┘
```

**Characteristics**:
- Clean separation of concerns
- Interface-driven design for testability
- Transport abstraction enables online/offline modes
- Business logic centralized in managers
- Event-driven architecture with subscriptions

---

## 2. Current Implementation Analysis

### 2.1 State Management (AppContext)

**File**: `NeighborYield/src/context/AppContext.tsx`

**Current Approach**:
- Uses React Context + useReducer pattern
- Manages: posts, interests, user state, loading states
- Direct calls to service functions
- Business logic mixed with state updates

**State Structure**:
```typescript
interface AppState {
  posts: SharePost[];
  interests: InterestAck[];
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

**Actions**: `LOAD_POSTS`, `ADD_POST`, `EXPRESS_INTEREST`, `RESPOND_INTEREST`, etc.

**Integration Impact**: 
- AppContext needs to be refactored to delegate to managers
- State structure remains similar but updates come from manager events
- Reducer logic simplified to handle manager callbacks

### 2.2 Services Layer

#### 2.2.1 Posts Service
**File**: `NeighborYield/src/services/posts.service.ts`

**Current Functions**:
- `fetchPosts()` - Direct Supabase query
- `createPost()` - Direct Supabase insert
- `deletePost()` - Direct Supabase delete
- `subscribeToPostChanges()` - Real-time subscription

**Integration Impact**:
- Replace with TTLManager for expiration tracking
- Use Transport layer for create/fetch operations
- Maintain Supabase service as SupabaseTransport implementation

#### 2.2.2 Interests Service
**File**: `NeighborYield/src/services/interests.service.ts`

**Current Functions**:
- `expressInterest()` - Direct Supabase insert
- `respondToInterest()` - Direct Supabase update
- `fetchInterests()` - Direct Supabase query
- `subscribeToInterestChanges()` - Real-time subscription

**Integration Impact**:
- Replace with InterestManager (includes retry logic)
- InterestManager provides queue management
- Event-driven callbacks replace subscriptions

#### 2.2.3 Battery Service
**File**: `NeighborYield/src/services/battery.service.ts`

**Current Implementation**:
- Singleton service
- Manages battery-aware behavior
- Adjusts Bluetooth discovery intervals
- Controls animations and power save mode

**Integration Impact**:
- **CONFLICT**: Overlaps with BatteryManager
- **Resolution**: Merge functionality into BatteryManager
- BatteryManager handles lifecycle + mesh control
- Current battery.service handles UI-level optimizations
- Keep both but clarify responsibilities

#### 2.2.4 Bluetooth & Gossip Services
**Files**: 
- `NeighborYield/src/services/bluetooth.service.ts`
- `NeighborYield/src/services/gossip.service.ts`

**Current Implementation**:
- Bluetooth service manages Nearby Connections API
- Gossip service implements mesh networking protocol
- Direct integration with React Native

**Integration Impact**:
- These become the BluetoothTransport implementation
- Wrap in ITransportRouter interface
- PresenceManager uses transport for heartbeats
- InterestManager uses transport for claim flow

#### 2.2.5 Mode Switching Service
**File**: `NeighborYield/src/services/mode-switching.service.ts`

**Current Implementation**:
- Manages abundance ↔ survival mode transitions
- Handles sync operations
- Controls navigation mode
- Shows transition banners

**Integration Impact**:
- No direct conflict with Mohini's layer
- Coordinates with BatteryManager for power-aware switching
- Uses Transport layer for sync operations

### 2.3 Hooks Layer

#### 2.3.1 Battery Monitor Hook
**File**: `NeighborYield/src/hooks/useBatteryMonitor.ts`

**Current Implementation**:
- Monitors battery level (stub implementation)
- Calculates battery-aware configuration
- Provides UI helpers (colors, icons)
- Manual override for testing

**Integration Impact**:
- Hook becomes a wrapper around BatteryManager
- BatteryManager provides core logic
- Hook provides React-specific state management

#### 2.3.2 Mode Switch Hook
**File**: `NeighborYield/src/hooks/useModeSwitch.ts`

**Current Implementation**:
- Wraps mode-switching.service
- Provides React state for mode transitions
- Manages banner visibility

**Integration Impact**:
- No changes needed
- Works alongside BatteryManager

#### 2.3.3 Missing Hooks
**Files**: Empty/non-existent
- `useConnectivity.ts`
- `usePeerCount.ts`
- `usePermissions.ts`
- `useTTL.ts`

**Integration Impact**:
- These need to be implemented as wrappers around managers
- `usePeerCount` → PresenceManager
- `usePermissions` → PermissionManager
- `useTTL` → TTLManager
- `useConnectivity` → Transport layer status

---

## 3. Mohini's Business Logic Layer

### 3.1 Manager Overview


#### 3.1.1 BatteryManager
**Interface**: `IBatteryManager`

**Responsibilities**:
- App lifecycle management (foreground/background)
- Background mesh preference control
- Battery level monitoring
- Low battery detection and events
- Nearby state management

**Key Methods**:
- `onAppForeground()` / `onAppBackground()`
- `setBackgroundMeshEnabled(enabled)`
- `getBatteryLevel()` / `isLowBattery()`
- `onLowBattery(handler)` - Event subscription
- `getNearbyState()` - Returns mesh connectivity state

**Integration Points**:
- App.tsx lifecycle events
- Battery service coordination
- Transport layer state

#### 3.1.2 PermissionManager
**Interface**: `IPermissionManager`

**Responsibilities**:
- Android runtime permission handling
- Permission status checking
- Sequential permission requests
- Permission change notifications
- System settings navigation

**Key Methods**:
- `checkPermissions()` - Returns status for all permissions
- `requestPermission(permission)` - Request single permission
- `requestAllPermissions()` - Request all in sequence
- `onPermissionChange(handler)` - Event subscription
- `openSettings()` - Open system settings

**Integration Points**:
- App initialization
- Permission explanation screens
- Bluetooth service initialization

#### 3.1.3 PresenceManager
**Interface**: `IPresenceManager`

**Responsibilities**:
- Heartbeat broadcasting
- Peer discovery and tracking
- Peer count management
- Active peer list maintenance

**Key Methods**:
- `startBroadcasting()` / `stopBroadcasting()`
- `getPeerCount()` / `getActivePeers()`
- `onPeerCountChange(handler)` - Event subscription
- `receivedHeartbeat(endpointId, payload)` - Transport callback
- `setHeartbeatInterval(intervalMs)` - Battery optimization

**Integration Points**:
- Transport layer (receives heartbeats)
- BatteryManager (adjusts interval)
- UI components (peer count display)

#### 3.1.4 TTLManager
**Interface**: `ITTLManager`

**Responsibilities**:
- Post expiration tracking
- Automatic cleanup of expired posts
- TTL calculation by risk tier
- Expiration event notifications

**Key Methods**:
- `trackPost(post)` / `untrackPost(postId)`
- `getRemainingTTL(postId)` / `isExpired(postId)`
- `purgeExpired()` - Returns expired post IDs
- `onPostExpired(handler)` - Event subscription
- `getTTLForRisk(tier)` - Get TTL duration

**Integration Points**:
- Post creation (start tracking)
- AppContext (remove expired posts)
- UI (display remaining time)


#### 3.1.5 InterestManager
**Interface**: `IInterestManager`

**Responsibilities**:
- Interest expression with retry logic
- Interest response handling
- Queue management for pending interests
- Event notifications for both parties

**Key Methods**:
- `expressInterest(postId)` - Returns InterestResult with retry
- `respondToInterest(interestId, response, message, responderId)`
- `onInterestReceived(handler)` - For posters
- `onResponseReceived(handler)` - For interested parties
- `getPendingInterests(postId)` - Get queue
- `receivedInterest(interest)` / `receivedResponse(response)` - Transport callbacks

**Integration Points**:
- Transport layer (send/receive)
- AppContext (update interest state)
- UI (interest notifications)

### 3.2 Supporting Infrastructure

#### 3.2.1 GeminiRiskClassifier
**Interface**: `IGeminiRiskClassifier`

**Responsibilities**:
- AI-powered risk classification
- Text + image multimodal analysis
- Confidence scoring
- Explanation generation

**Key Methods**:
- `classifyText(text)` - Text-only classification
- `classifyWithImage(text, imageBase64)` - Multimodal classification
- Returns: `{ tier, confidence, explanation }`

**Integration Points**:
- Post creation flow
- Risk tier picker component

#### 3.2.2 Utilities

**ImageValidator** (`src/utils/ImageValidator.ts`):
- Validates image format, size, dimensions
- Checks for corruption
- Returns validation result with errors

**ImageCompressor** (`src/utils/ImageCompressor.ts`):
- Compresses images for network efficiency
- Configurable quality and max dimensions
- Returns base64 compressed image

**SupabaseMappers** (`src/utils/SupabaseMappers.ts`):
- Maps between Supabase row format and domain types
- `mapSupabasePost()` - Database → SharePost
- `mapSharePostToSupabase()` - SharePost → Database
- `mapSupabaseInterest()` - Database → InterestAck

**UserIdentifierGenerator** (`src/utils/UserIdentifierGenerator.ts`):
- Generates anonymous user identifiers
- Deterministic from auth UUID
- Format: "Adjective-Noun-Number"

### 3.3 Type System

**Key Types**:
- `SharePost` - Post with metadata, risk tier, TTL
- `InterestAck` - Interest acknowledgment with retry info
- `InterestResponse` - Response from poster
- `PeerInfo` - Peer metadata with heartbeat
- `HeartbeatPayload` - Presence broadcast data
- `RiskTier` - 'low' | 'medium' | 'high'
- `ResponseType` - 'coming' | 'not_available' | 'maybe'
- `NearbyState` - Mesh connectivity state
- `PermissionState` - Permission status

---

## 4. Integration Points

### 4.1 Critical Integration Points


#### 4.1.1 App Initialization (App.tsx)

**Current Flow**:
```typescript
useEffect(() => {
  // Check auth
  // Load posts from Supabase
  // Subscribe to real-time changes
  // Initialize services
}, []);
```

**Proposed Flow**:
```typescript
useEffect(() => {
  // 1. Initialize managers
  const batteryManager = new BatteryManager(transport);
  const permissionManager = new PermissionManager();
  const presenceManager = new PresenceManager(transport);
  const ttlManager = new TTLManager();
  const interestManager = new InterestManager(transport);
  
  // 2. Check permissions
  const permStatus = await permissionManager.checkPermissions();
  if (!permStatus.canUseMesh) {
    // Show permission explanation
  }
  
  // 3. Initialize transport
  const transport = new SupabaseTransport(supabase);
  
  // 4. Start managers
  batteryManager.onAppForeground();
  presenceManager.startBroadcasting();
  
  // 5. Load posts and start TTL tracking
  const posts = await transport.fetchPosts();
  posts.forEach(post => ttlManager.trackPost(post));
  
  // 6. Subscribe to events
  ttlManager.onPostExpired((postId) => {
    dispatch({ type: 'REMOVE_POST', payload: postId });
  });
  
  interestManager.onInterestReceived((interest) => {
    dispatch({ type: 'ADD_INTEREST', payload: interest });
  });
  
  presenceManager.onPeerCountChange((count) => {
    dispatch({ type: 'UPDATE_PEER_COUNT', payload: count });
  });
}, []);
```

#### 4.1.2 AppContext Refactoring

**Current Reducer**:
```typescript
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_POSTS':
      return { ...state, posts: action.payload };
    case 'ADD_POST':
      // Direct state update
      return { ...state, posts: [...state.posts, action.payload] };
    case 'EXPRESS_INTEREST':
      // Call service directly
      await expressInterest(action.payload.postId);
      return state;
    // ...
  }
}
```

**Proposed Reducer**:
```typescript
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_POSTS':
      return { ...state, posts: action.payload };
    case 'ADD_POST':
      // Manager handles persistence
      const post = action.payload;
      ttlManager.trackPost(post);
      return { ...state, posts: [...state.posts, post] };
    case 'EXPRESS_INTEREST':
      // Manager handles retry logic
      interestManager.expressInterest(action.payload.postId);
      return state;
    case 'REMOVE_EXPIRED_POST':
      // Triggered by TTL manager event
      return {
        ...state,
        posts: state.posts.filter(p => p.id !== action.payload)
      };
    // ...
  }
}
```

#### 4.1.3 Transport Layer Implementation

**Missing Component**: ITransportRouter implementation

**Required Implementation**:
```typescript
// src/transport/SupabaseTransport.ts
class SupabaseTransport implements ITransportRouter {
  constructor(private supabase: SupabaseClient) {}
  
  async sendPost(post: SharePost): Promise<void> {
    const row = mapSharePostToSupabase(post);
    await this.supabase.from('posts').insert(row);
  }
  
  async sendInterest(interest: InterestAck): Promise<void> {
    const row = mapInterestToSupabase(interest);
    await this.supabase.from('interests').insert(row);
  }
  
  async sendHeartbeat(payload: HeartbeatPayload): Promise<void> {
    // Implement presence broadcasting
  }
  
  onPostReceived(handler: (post: SharePost) => void): Unsubscribe {
    const subscription = this.supabase
      .from('posts')
      .on('INSERT', (payload) => {
        handler(mapSupabasePost(payload.new));
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }
  
  // ... other methods
}
```


```typescript
// src/transport/BluetoothTransport.ts
class BluetoothTransport implements ITransportRouter {
  constructor(
    private bluetoothService: BluetoothService,
    private gossipService: GossipService
  ) {}
  
  async sendPost(post: SharePost): Promise<void> {
    await this.gossipService.broadcast('POST', post);
  }
  
  async sendInterest(interest: InterestAck): Promise<void> {
    await this.gossipService.sendDirect(interest.posterId, 'INTEREST', interest);
  }
  
  async sendHeartbeat(payload: HeartbeatPayload): Promise<void> {
    await this.gossipService.broadcast('HEARTBEAT', payload);
  }
  
  onPostReceived(handler: (post: SharePost) => void): Unsubscribe {
    return this.gossipService.on('POST', handler);
  }
  
  // ... other methods
}
```

#### 4.1.4 Hook Implementations

**usePeerCount Hook**:
```typescript
// NeighborYield/src/hooks/usePeerCount.ts
export function usePeerCount(presenceManager: IPresenceManager) {
  const [peerCount, setPeerCount] = useState(0);
  
  useEffect(() => {
    setPeerCount(presenceManager.getPeerCount());
    
    const unsubscribe = presenceManager.onPeerCountChange((count) => {
      setPeerCount(count);
    });
    
    return unsubscribe;
  }, [presenceManager]);
  
  return { peerCount, peers: presenceManager.getActivePeers() };
}
```

**usePermissions Hook**:
```typescript
// NeighborYield/src/hooks/usePermissions.ts
export function usePermissions(permissionManager: IPermissionManager) {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  
  useEffect(() => {
    permissionManager.checkPermissions().then(setStatus);
    
    const unsubscribe = permissionManager.onPermissionChange(setStatus);
    
    return unsubscribe;
  }, [permissionManager]);
  
  const requestAll = async () => {
    const result = await permissionManager.requestAllPermissions();
    setStatus(result);
  };
  
  return { status, requestAll, openSettings: permissionManager.openSettings };
}
```

**useTTL Hook**:
```typescript
// NeighborYield/src/hooks/useTTL.ts
export function useTTL(ttlManager: ITTLManager, postId: string) {
  const [remainingTTL, setRemainingTTL] = useState<number | null>(null);
  
  useEffect(() => {
    const updateTTL = () => {
      setRemainingTTL(ttlManager.getRemainingTTL(postId));
    };
    
    updateTTL();
    const interval = setInterval(updateTTL, 1000);
    
    return () => clearInterval(interval);
  }, [ttlManager, postId]);
  
  return { 
    remainingTTL, 
    isExpired: ttlManager.isExpired(postId),
    formattedTime: formatTTL(remainingTTL)
  };
}
```

---

## 5. Data Flow Comparison

### 5.1 Current Data Flow: Post Creation

```
User Input (Component)
  ↓
dispatch({ type: 'ADD_POST', payload: post })
  ↓
AppContext Reducer
  ↓
posts.service.createPost(post)
  ↓
Supabase Client
  ↓
Database Insert
  ↓
Real-time Subscription Triggers
  ↓
Other Clients Receive Update
```

### 5.2 Proposed Data Flow: Post Creation

```
User Input (Component)
  ↓
dispatch({ type: 'ADD_POST', payload: post })
  ↓
AppContext Reducer
  ├─→ ttlManager.trackPost(post)  [Start TTL tracking]
  └─→ transport.sendPost(post)     [Persist to backend]
      ↓
      SupabaseTransport OR BluetoothTransport
      ↓
      Database/Mesh Network
      ↓
      Transport Layer Receives
      ↓
      onPostReceived callback
      ↓
      dispatch({ type: 'RECEIVED_POST', payload: post })
```

### 5.3 Current Data Flow: Interest Expression

```
User Clicks "Interested"
  ↓
interests.service.expressInterest(postId)
  ↓
Supabase Insert
  ↓
Real-time Subscription
  ↓
Poster Receives Notification
```

**Issues**:
- No retry on failure
- No queue management
- Direct coupling to Supabase


### 5.4 Proposed Data Flow: Interest Expression

```
User Clicks "Interested"
  ↓
interestManager.expressInterest(postId)
  ↓
InterestManager (with retry logic)
  ├─→ Attempt 1: transport.sendInterest()
  ├─→ [If fails] Attempt 2 (exponential backoff)
  └─→ [If fails] Attempt 3
      ↓
      Transport Layer
      ↓
      Poster's Device
      ↓
      interestManager.receivedInterest(interest)
      ↓
      onInterestReceived callback
      ↓
      dispatch({ type: 'ADD_INTEREST', payload: interest })
```

**Benefits**:
- Automatic retry with exponential backoff
- Queue management for pending interests
- Transport abstraction (works online/offline)
- Event-driven notifications

### 5.5 Current Data Flow: Post Expiration

**Current**: No automatic expiration
- Posts remain in database indefinitely
- Manual cleanup required

### 5.6 Proposed Data Flow: Post Expiration

```
Post Created
  ↓
ttlManager.trackPost(post)
  ↓
TTL Manager starts timer based on risk tier
  ↓
[Time passes]
  ↓
TTL expires
  ↓
onPostExpired callback fires
  ↓
dispatch({ type: 'REMOVE_EXPIRED_POST', payload: postId })
  ↓
UI updates automatically
```

**Benefits**:
- Automatic cleanup
- Risk-based TTL (low: 24h, medium: 12h, high: 6h)
- Event-driven removal
- No manual intervention needed

---

## 6. Conflicts and Resolutions

### 6.1 Battery Management Overlap

**Conflict**: 
- Existing `battery.service.ts` handles UI-level battery optimizations
- Mohini's `BatteryManager` handles lifecycle and mesh control

**Resolution**:
```
BatteryManager (Mohini's)
├─ App lifecycle (foreground/background)
├─ Background mesh enable/disable
├─ Nearby state management
└─ Low battery events

battery.service.ts (Existing)
├─ UI optimizations (animations, colors)
├─ Discovery interval recommendations
├─ Power save mode UI state
└─ Background task management
```

**Integration Strategy**:
1. Keep both components
2. BatteryManager focuses on mesh/lifecycle
3. battery.service focuses on UI/UX optimizations
4. battery.service subscribes to BatteryManager events
5. Coordinate through event callbacks

### 6.2 Service Layer Duplication

**Conflict**:
- Existing services (posts, interests) directly call Supabase
- Managers expect to work through transport layer

**Resolution**:
1. **Phase 1**: Wrap existing services in transport interface
   - Create `SupabaseTransport` that uses existing services
   - Minimal changes to existing code
   
2. **Phase 2**: Refactor services to be transport implementations
   - Move Supabase logic into SupabaseTransport
   - Remove direct service calls from AppContext
   
3. **Phase 3**: Add BluetoothTransport for offline mode
   - Implement using existing bluetooth/gossip services
   - Enable seamless online/offline switching

### 6.3 State Management Patterns

**Conflict**:
- Current: Reducer handles business logic
- Proposed: Managers handle business logic, reducer handles state

**Resolution**:
```typescript
// Before: Business logic in reducer
case 'EXPRESS_INTEREST':
  await expressInterest(action.payload.postId);
  return { ...state, interests: [...state.interests, newInterest] };

// After: Business logic in manager
case 'EXPRESS_INTEREST':
  // Manager handles the logic and retry
  interestManager.expressInterest(action.payload.postId);
  return state; // State updated via callback

case 'INTEREST_RECEIVED':
  // Triggered by manager callback
  return { ...state, interests: [...state.interests, action.payload] };
```

**Migration Path**:
1. Add new action types for manager callbacks
2. Keep existing actions for backward compatibility
3. Gradually migrate to manager-driven flow
4. Remove old actions once migration complete


### 6.4 Hook Implementation Gaps

**Conflict**:
- Hooks are exported but not implemented
- `useConnectivity`, `usePeerCount`, `usePermissions`, `useTTL` are empty

**Resolution**:
1. Implement hooks as wrappers around managers
2. Follow React patterns (useState, useEffect)
3. Provide clean API for components
4. Handle subscription cleanup

**Implementation Priority**:
1. `usePermissions` - Critical for app initialization
2. `usePeerCount` - Important for presence display
3. `useTTL` - Important for post expiration UI
4. `useConnectivity` - Important for online/offline status

---

## 7. Benefits and Trade-offs

### 7.1 Benefits of Integration

#### 7.1.1 Architectural Benefits
- **Separation of Concerns**: Business logic separated from UI
- **Testability**: Interface-driven design enables easy mocking
- **Maintainability**: Centralized logic easier to update
- **Scalability**: Transport abstraction enables new backends

#### 7.1.2 Feature Benefits
- **Automatic Retry**: InterestManager handles failed requests
- **Post Expiration**: TTLManager automates cleanup
- **Permission Management**: Structured permission flow
- **Presence Tracking**: Standardized peer discovery
- **Battery Optimization**: Lifecycle-aware mesh control

#### 7.1.3 Code Quality Benefits
- **Type Safety**: Strong TypeScript interfaces
- **Event-Driven**: Loose coupling via subscriptions
- **Error Handling**: Centralized error management
- **Testing**: 806-line test suite included

### 7.2 Trade-offs and Costs

#### 7.2.1 Complexity
- **Learning Curve**: Team needs to understand new architecture
- **Abstraction Overhead**: More layers to navigate
- **Debugging**: Event-driven flow harder to trace

**Mitigation**:
- Comprehensive documentation
- Clear naming conventions
- Logging at manager boundaries
- Developer tools for event inspection

#### 7.2.2 Migration Effort
- **Refactoring Required**: AppContext, services, hooks
- **Testing Burden**: Need to test integration points
- **Risk of Regression**: Changes to core functionality

**Mitigation**:
- Phased migration approach
- Maintain backward compatibility during transition
- Comprehensive integration tests
- Feature flags for gradual rollout

#### 7.2.3 Performance Considerations
- **Event Overhead**: Subscription callbacks add overhead
- **Memory Usage**: Managers maintain state
- **Initialization Time**: More components to initialize

**Mitigation**:
- Lazy initialization of managers
- Efficient event dispatching
- Memory profiling and optimization
- Benchmark critical paths

### 7.3 Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Breaking existing features | High | Medium | Phased migration, feature flags |
| Performance degradation | Medium | Low | Benchmarking, profiling |
| Team adoption resistance | Medium | Medium | Training, documentation |
| Integration bugs | High | Medium | Comprehensive testing |
| Increased complexity | Medium | High | Clear architecture docs |
| Timeline overrun | Medium | Medium | Realistic estimates, buffer |

---

## 8. Migration Strategy

### 8.1 Migration Phases

#### Phase 1: Foundation (Week 1-2)
**Goal**: Set up infrastructure without breaking existing functionality

**Tasks**:
1. Create transport layer interfaces
2. Implement SupabaseTransport wrapping existing services
3. Add manager instances to App.tsx (not yet used)
4. Implement missing hooks (empty wrappers initially)
5. Add integration tests for transport layer

**Success Criteria**:
- All existing features work unchanged
- Transport layer tested and ready
- Managers instantiated but not active

#### Phase 2: TTL Integration (Week 3)
**Goal**: Add automatic post expiration

**Tasks**:
1. Initialize TTLManager in App.tsx
2. Track posts on load and creation
3. Subscribe to expiration events
4. Update AppContext to handle expiration
5. Add UI indicators for remaining TTL

**Success Criteria**:
- Posts automatically expire based on risk tier
- UI shows countdown timers
- Expired posts removed from state
- No impact on other features


#### Phase 3: Permission Integration (Week 4)
**Goal**: Structured permission management

**Tasks**:
1. Initialize PermissionManager in App.tsx
2. Implement usePermissions hook
3. Add permission explanation screens
4. Replace direct permission checks with manager
5. Add permission status indicators

**Success Criteria**:
- Structured permission flow on first launch
- Permission status visible in UI
- Easy access to system settings
- Graceful handling of denied permissions

#### Phase 4: Presence Integration (Week 5)
**Goal**: Standardized peer discovery

**Tasks**:
1. Initialize PresenceManager in App.tsx
2. Implement usePeerCount hook
3. Connect to transport layer for heartbeats
4. Update UI components to use hook
5. Add peer list display

**Success Criteria**:
- Accurate peer count display
- Heartbeat broadcasting active
- Peer list shows active neighbors
- Battery-aware heartbeat intervals

#### Phase 5: Interest Integration (Week 6-7)
**Goal**: Reliable interest flow with retry

**Tasks**:
1. Initialize InterestManager in App.tsx
2. Refactor AppContext to use manager
3. Update interest components
4. Add retry indicators in UI
5. Test failure scenarios

**Success Criteria**:
- Interests automatically retry on failure
- Queue management working
- UI shows retry status
- No lost interests

#### Phase 6: Battery Integration (Week 8)
**Goal**: Lifecycle-aware mesh control

**Tasks**:
1. Initialize BatteryManager in App.tsx
2. Connect to app lifecycle events
3. Coordinate with existing battery.service
4. Add background mesh toggle
5. Test foreground/background transitions

**Success Criteria**:
- Mesh pauses in background (if disabled)
- Battery events trigger optimizations
- Smooth lifecycle transitions
- No battery drain issues

#### Phase 7: Cleanup and Optimization (Week 9-10)
**Goal**: Remove legacy code, optimize performance

**Tasks**:
1. Remove direct service calls from AppContext
2. Deprecate old action types
3. Optimize event dispatching
4. Add performance monitoring
5. Update documentation

**Success Criteria**:
- Clean architecture with no legacy code
- Performance benchmarks met
- Documentation complete
- Team trained on new architecture

### 8.2 Rollback Strategy

**For Each Phase**:
1. **Feature Flags**: Enable/disable new functionality
2. **Backward Compatibility**: Keep old code paths during migration
3. **Monitoring**: Track errors and performance metrics
4. **Quick Rollback**: Ability to revert within 1 hour

**Rollback Triggers**:
- Critical bug affecting core functionality
- Performance degradation > 20%
- User-facing errors > 1%
- Team consensus to pause

---

## 9. Implementation Plan

### 9.1 File Structure Changes

```
NeighborYield/
├── src/
│   ├── managers/           [NEW - Mohini's managers]
│   │   ├── BatteryManager.ts
│   │   ├── PermissionManager.ts
│   │   ├── PresenceManager.ts
│   │   ├── TTLManager.ts
│   │   └── InterestManager.ts
│   ├── transport/          [NEW - Transport layer]
│   │   ├── ITransportRouter.ts
│   │   ├── SupabaseTransport.ts
│   │   └── BluetoothTransport.ts
│   ├── services/           [EXISTING - Refactor to use managers]
│   │   ├── posts.service.ts      → Use TTLManager
│   │   ├── interests.service.ts  → Use InterestManager
│   │   ├── auth.service.ts       → No change
│   │   ├── messaging.service.ts  → No change
│   │   ├── bluetooth.service.ts  → Wrapped in BluetoothTransport
│   │   ├── gossip.service.ts     → Wrapped in BluetoothTransport
│   │   ├── mode-switching.service.ts → Coordinate with BatteryManager
│   │   └── battery.service.ts    → Coordinate with BatteryManager
│   ├── hooks/              [UPDATE - Implement missing hooks]
│   │   ├── useBatteryMonitor.ts  → Wrap BatteryManager
│   │   ├── useConnectivity.ts    → [IMPLEMENT]
│   │   ├── usePeerCount.ts       → [IMPLEMENT]
│   │   ├── usePermissions.ts     → [IMPLEMENT]
│   │   ├── useTTL.ts             → [IMPLEMENT]
│   │   └── useModeSwitch.ts      → No change
│   ├── context/            [REFACTOR - Delegate to managers]
│   │   └── AppContext.tsx        → Use manager callbacks
│   ├── utils/              [NEW - Mohini's utilities]
│   │   ├── ImageValidator.ts
│   │   ├── ImageCompressor.ts
│   │   ├── SupabaseMappers.ts
│   │   └── UserIdentifierGenerator.ts
│   └── types/              [EXTEND - Add Mohini's types]
│       ├── Common.ts
│       ├── PeerInfo.ts
│       ├── InterestAck.ts
│       └── InterestResponse.ts
└── App.tsx                 [MAJOR REFACTOR - Initialize managers]
```


### 9.2 Code Changes by File

#### 9.2.1 App.tsx - Manager Initialization

**Add at top**:
```typescript
import { BatteryManager } from './src/managers/BatteryManager';
import { PermissionManager } from './src/managers/PermissionManager';
import { PresenceManager } from './src/managers/PresenceManager';
import { TTLManager } from './src/managers/TTLManager';
import { InterestManager } from './src/managers/InterestManager';
import { SupabaseTransport } from './src/transport/SupabaseTransport';
```

**Add state for managers**:
```typescript
const [managers, setManagers] = useState<{
  battery: BatteryManager;
  permission: PermissionManager;
  presence: PresenceManager;
  ttl: TTLManager;
  interest: InterestManager;
} | null>(null);
```

**Initialize in useEffect**:
```typescript
useEffect(() => {
  const initializeManagers = async () => {
    // 1. Create transport
    const transport = new SupabaseTransport(supabase);
    
    // 2. Create managers
    const batteryManager = new BatteryManager(transport);
    const permissionManager = new PermissionManager();
    const presenceManager = new PresenceManager(transport);
    const ttlManager = new TTLManager();
    const interestManager = new InterestManager(transport);
    
    // 3. Check permissions
    const permStatus = await permissionManager.checkPermissions();
    if (!permStatus.canUseMesh) {
      // Show permission explanation
      setShowPermissionExplanation(true);
    }
    
    // 4. Start managers
    batteryManager.onAppForeground();
    presenceManager.startBroadcasting();
    
    // 5. Subscribe to events
    ttlManager.onPostExpired((postId) => {
      dispatch({ type: 'REMOVE_EXPIRED_POST', payload: postId });
    });
    
    interestManager.onInterestReceived((interest) => {
      dispatch({ type: 'INTEREST_RECEIVED', payload: interest });
    });
    
    interestManager.onResponseReceived((response) => {
      dispatch({ type: 'RESPONSE_RECEIVED', payload: response });
    });
    
    presenceManager.onPeerCountChange((count) => {
      dispatch({ type: 'UPDATE_PEER_COUNT', payload: count });
    });
    
    batteryManager.onLowBattery(() => {
      dispatch({ type: 'LOW_BATTERY_WARNING' });
    });
    
    // 6. Load posts and track TTL
    const posts = await transport.fetchPosts();
    posts.forEach(post => ttlManager.trackPost(post));
    dispatch({ type: 'LOAD_POSTS', payload: posts });
    
    // 7. Save managers
    setManagers({
      battery: batteryManager,
      permission: permissionManager,
      presence: presenceManager,
      ttl: ttlManager,
      interest: interestManager,
    });
  };
  
  initializeManagers();
  
  return () => {
    // Cleanup
    if (managers) {
      managers.battery.dispose();
      managers.presence.stopBroadcasting();
    }
  };
}, []);
```

**Add app lifecycle handlers**:
```typescript
useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (managers) {
      if (nextAppState === 'active') {
        managers.battery.onAppForeground();
      } else if (nextAppState === 'background') {
        managers.battery.onAppBackground();
      }
    }
  });
  
  return () => subscription.remove();
}, [managers]);
```

#### 9.2.2 AppContext.tsx - Reducer Updates

**Add new action types**:
```typescript
type Action =
  | { type: 'LOAD_POSTS'; payload: SharePost[] }
  | { type: 'ADD_POST'; payload: SharePost }
  | { type: 'REMOVE_EXPIRED_POST'; payload: string }
  | { type: 'INTEREST_RECEIVED'; payload: InterestAck }
  | { type: 'RESPONSE_RECEIVED'; payload: InterestResponse }
  | { type: 'UPDATE_PEER_COUNT'; payload: number }
  | { type: 'LOW_BATTERY_WARNING' }
  // ... existing actions
```

**Update reducer**:
```typescript
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REMOVE_EXPIRED_POST':
      return {
        ...state,
        posts: state.posts.filter(p => p.id !== action.payload)
      };
    
    case 'INTEREST_RECEIVED':
      return {
        ...state,
        interests: [...state.interests, action.payload]
      };
    
    case 'RESPONSE_RECEIVED':
      // Update interest with response
      return {
        ...state,
        interests: state.interests.map(i =>
          i.id === action.payload.interestId
            ? { ...i, response: action.payload }
            : i
        )
      };
    
    case 'UPDATE_PEER_COUNT':
      return {
        ...state,
        peerCount: action.payload
      };
    
    case 'LOW_BATTERY_WARNING':
      return {
        ...state,
        showLowBatteryWarning: true
      };
    
    // ... existing cases
  }
}
```


#### 9.2.3 Transport Layer Implementation

**Create SupabaseTransport**:
```typescript
// src/transport/SupabaseTransport.ts
import { ITransportRouter } from './ITransportRouter';
import { SharePost } from '../types/SharePost';
import { InterestAck } from '../types/InterestAck';
import { InterestResponse } from '../types/InterestResponse';
import { HeartbeatPayload } from '../types/PeerInfo';
import { mapSupabasePost, mapSharePostToSupabase } from '../utils/SupabaseMappers';

export class SupabaseTransport implements ITransportRouter {
  constructor(private supabase: SupabaseClient) {}
  
  async sendPost(post: SharePost): Promise<void> {
    const row = mapSharePostToSupabase(post);
    const { error } = await this.supabase.from('posts').insert(row);
    if (error) throw error;
  }
  
  async sendInterest(interest: InterestAck): Promise<void> {
    const { error } = await this.supabase.from('interests').insert({
      id: interest.id,
      post_id: interest.postId,
      interested_user_id: interest.interestedUserId,
      poster_id: interest.posterId,
      timestamp: interest.timestamp,
      retry_count: interest.retryCount,
    });
    if (error) throw error;
  }
  
  async sendResponse(response: InterestResponse): Promise<void> {
    const { error } = await this.supabase
      .from('interests')
      .update({
        response_type: response.responseType,
        response_message: response.message,
        responded_at: response.timestamp,
      })
      .eq('id', response.interestId);
    if (error) throw error;
  }
  
  async sendHeartbeat(payload: HeartbeatPayload): Promise<void> {
    // Implement presence broadcasting via Supabase
    // Could use presence channels or a heartbeats table
  }
  
  async fetchPosts(): Promise<SharePost[]> {
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(mapSupabasePost);
  }
  
  onPostReceived(handler: (post: SharePost) => void): Unsubscribe {
    const subscription = this.supabase
      .channel('posts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => handler(mapSupabasePost(payload.new))
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }
  
  onInterestReceived(handler: (interest: InterestAck) => void): Unsubscribe {
    const subscription = this.supabase
      .channel('interests')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'interests' },
        (payload) => handler(mapSupabaseInterest(payload.new))
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }
  
  // ... other methods
}
```

#### 9.2.4 Hook Implementations

**usePermissions**:
```typescript
// src/hooks/usePermissions.ts
import { useState, useEffect } from 'react';
import { IPermissionManager, PermissionStatus } from '../managers/IPermissionManager';

export function usePermissions(permissionManager: IPermissionManager) {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkPermissions = async () => {
      const result = await permissionManager.checkPermissions();
      setStatus(result);
      setLoading(false);
    };
    
    checkPermissions();
    
    const unsubscribe = permissionManager.onPermissionChange((newStatus) => {
      setStatus(newStatus);
    });
    
    return unsubscribe;
  }, [permissionManager]);
  
  const requestAll = async () => {
    setLoading(true);
    const result = await permissionManager.requestAllPermissions();
    setStatus(result);
    setLoading(false);
    return result;
  };
  
  const openSettings = async () => {
    await permissionManager.openSettings();
  };
  
  return {
    status,
    loading,
    canUseMesh: status?.canUseMesh ?? false,
    requestAll,
    openSettings,
  };
}
```

**usePeerCount**:
```typescript
// src/hooks/usePeerCount.ts
import { useState, useEffect } from 'react';
import { IPresenceManager } from '../managers/IPresenceManager';
import { PeerInfo } from '../types/PeerInfo';

export function usePeerCount(presenceManager: IPresenceManager) {
  const [peerCount, setPeerCount] = useState(0);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  
  useEffect(() => {
    const updatePeers = () => {
      setPeerCount(presenceManager.getPeerCount());
      setPeers(presenceManager.getActivePeers());
    };
    
    updatePeers();
    
    const unsubscribe = presenceManager.onPeerCountChange((count) => {
      setPeerCount(count);
      setPeers(presenceManager.getActivePeers());
    });
    
    return unsubscribe;
  }, [presenceManager]);
  
  return {
    peerCount,
    peers,
    isActive: presenceManager.isActive(),
  };
}

export function formatPeerCount(count: number): string {
  if (count === 0) return 'No neighbors nearby';
  if (count === 1) return '1 neighbor nearby';
  return `${count} neighbors nearby`;
}
```

**useTTL**:
```typescript
// src/hooks/useTTL.ts
import { useState, useEffect } from 'react';
import { ITTLManager } from '../managers/ITTLManager';

export function useTTL(ttlManager: ITTLManager, postId: string) {
  const [remainingTTL, setRemainingTTL] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const updateTTL = () => {
      const ttl = ttlManager.getRemainingTTL(postId);
      setRemainingTTL(ttl);
      setIsExpired(ttlManager.isExpired(postId));
    };
    
    updateTTL();
    const interval = setInterval(updateTTL, 1000);
    
    return () => clearInterval(interval);
  }, [ttlManager, postId]);
  
  const formatTTL = (ms: number | null): string => {
    if (ms === null || ms <= 0) return 'Expired';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  return {
    remainingTTL,
    isExpired,
    formattedTime: formatTTL(remainingTTL),
  };
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Manager Tests** (Already included in Mohini's code):
- `src/test.ts` - 806 lines of comprehensive tests
- Tests all managers in isolation
- Uses MockTransportRouter for testing
- Covers edge cases and error scenarios

**New Tests Needed**:
1. **Transport Layer Tests**
   - SupabaseTransport integration
   - BluetoothTransport integration
   - Error handling and retries

2. **Hook Tests**
   - usePermissions behavior
   - usePeerCount updates
   - useTTL countdown
   - useConnectivity status

3. **AppContext Tests**
   - Manager event handling
   - State updates from callbacks
   - Action dispatching

### 10.2 Integration Tests

**Critical Flows**:
1. **Post Creation → TTL Tracking → Expiration**
   - Create post
   - Verify TTL tracking started
   - Fast-forward time
   - Verify expiration event
   - Verify UI update

2. **Interest Expression → Retry → Response**
   - Express interest
   - Simulate network failure
   - Verify retry attempts
   - Simulate success
   - Verify response received

3. **Permission Flow**
   - Check permissions on launch
   - Request permissions
   - Handle granted/denied
   - Verify mesh state

4. **Presence Broadcasting**
   - Start broadcasting
   - Simulate peer discovery
   - Verify peer count updates
   - Stop broadcasting
   - Verify cleanup

### 10.3 End-to-End Tests

**User Scenarios**:
1. **First Launch**
   - App opens
   - Permission explanation shown
   - Permissions requested
   - Mesh initialized
   - Posts loaded

2. **Create and Share Post**
   - User creates post
   - Risk classification runs
   - Post saved to Supabase
   - TTL tracking starts
   - Other users see post

3. **Express Interest**
   - User sees post
   - Clicks "Interested"
   - Interest sent (with retry)
   - Poster receives notification
   - Poster responds
   - User receives response

4. **Battery Optimization**
   - Battery drops below 20%
   - Low battery event fires
   - Heartbeat interval increases
   - Animations disabled
   - Power save mode active

### 10.4 Performance Tests

**Benchmarks**:
1. **App Initialization**
   - Target: < 2 seconds to interactive
   - Measure: Manager initialization time
   - Measure: Permission check time

2. **Post Loading**
   - Target: < 1 second for 100 posts
   - Measure: Fetch + TTL tracking time
   - Measure: UI render time

3. **Interest Expression**
   - Target: < 500ms for success
   - Measure: Manager processing time
   - Measure: Transport send time

4. **Memory Usage**
   - Target: < 50MB additional memory
   - Measure: Manager memory footprint
   - Measure: Event subscription overhead

---

## 11. Risk Assessment

### 11.1 Technical Risks


#### Risk 1: Breaking Existing Features
**Severity**: High  
**Likelihood**: Medium  
**Impact**: Users unable to use core functionality

**Mitigation**:
- Phased migration with feature flags
- Comprehensive regression testing
- Maintain backward compatibility during transition
- Quick rollback capability

#### Risk 2: Performance Degradation
**Severity**: Medium  
**Likelihood**: Low  
**Impact**: Slower app, poor user experience

**Mitigation**:
- Performance benchmarking before/after
- Profiling critical paths
- Lazy initialization of managers
- Memory monitoring

#### Risk 3: Integration Bugs
**Severity**: High  
**Likelihood**: Medium  
**Impact**: Data loss, incorrect behavior

**Mitigation**:
- Extensive integration testing
- Staged rollout to subset of users
- Error monitoring and alerting
- Data validation at boundaries

#### Risk 4: Team Adoption
**Severity**: Medium  
**Likelihood**: Medium  
**Impact**: Slow development, confusion

**Mitigation**:
- Comprehensive documentation
- Team training sessions
- Code review guidelines
- Pair programming for first implementations

#### Risk 5: Timeline Overrun
**Severity**: Medium  
**Likelihood**: Medium  
**Impact**: Delayed features, missed deadlines

**Mitigation**:
- Realistic estimates with buffer
- Regular progress reviews
- Prioritize critical features
- Parallel work streams where possible

### 11.2 Organizational Risks

#### Risk 6: Scope Creep
**Severity**: Medium  
**Likelihood**: High  
**Impact**: Never-ending migration

**Mitigation**:
- Clear scope definition
- Change control process
- Regular stakeholder alignment
- Focus on MVP first

#### Risk 7: Knowledge Silos
**Severity**: Low  
**Likelihood**: Medium  
**Impact**: Only one person understands architecture

**Mitigation**:
- Documentation as code
- Knowledge sharing sessions
- Code reviews with rotation
- Architecture decision records

---

## 12. Recommendations

### 12.1 Immediate Actions (Week 1)

1. **Team Alignment**
   - Review this analysis with full team
   - Discuss concerns and questions
   - Get buy-in on migration approach
   - Assign roles and responsibilities

2. **Environment Setup**
   - Set up feature flags system
   - Configure monitoring and alerting
   - Prepare staging environment
   - Set up performance benchmarking

3. **Documentation**
   - Create architecture decision record
   - Document current baseline performance
   - Set up integration test framework
   - Create migration checklist

### 12.2 Short-term Priorities (Month 1)

1. **Phase 1: Foundation**
   - Implement transport layer
   - Add manager instances (inactive)
   - Create integration tests
   - Validate no regressions

2. **Phase 2: TTL Integration**
   - Activate TTLManager
   - Add expiration UI
   - Test automatic cleanup
   - Monitor performance

3. **Phase 3: Permission Integration**
   - Activate PermissionManager
   - Implement permission flow
   - Test on various devices
   - Gather user feedback

### 12.3 Long-term Strategy (Months 2-3)

1. **Complete Migration**
   - Integrate all managers
   - Remove legacy code
   - Optimize performance
   - Full regression testing

2. **Offline Mode**
   - Implement BluetoothTransport
   - Test mesh networking
   - Add offline indicators
   - Handle sync conflicts

3. **Continuous Improvement**
   - Monitor metrics
   - Gather feedback
   - Iterate on architecture
   - Document learnings

---

## 13. Conclusion

### 13.1 Summary

Mohini's business logic layer provides a well-architected foundation for the NeighborYield app with clear separation of concerns, interface-driven design, and event-driven architecture. The integration requires significant refactoring but offers substantial benefits:

**Key Benefits**:
- Automatic retry logic for interests
- Post expiration management
- Structured permission flow
- Standardized presence tracking
- Transport abstraction for online/offline modes
- Improved testability and maintainability

**Key Challenges**:
- Refactoring AppContext and services
- Implementing transport layer
- Coordinating with existing battery/bluetooth services
- Team learning curve
- Migration complexity

### 13.2 Go/No-Go Decision Factors

**Proceed with Integration if**:
- Team has capacity for 2-3 month migration
- Offline mode is a priority
- Code quality and testability are important
- Long-term maintainability is valued
- Team is comfortable with architectural changes

**Defer Integration if**:
- Immediate feature delivery is critical
- Team is understaffed or overcommitted
- Current architecture is "good enough"
- Risk tolerance is low
- Simpler alternatives exist

### 13.3 Final Recommendation

**Recommendation**: **Proceed with phased integration**

**Rationale**:
1. The architectural benefits are significant
2. The phased approach mitigates risk
3. The code quality is high (806-line test suite)
4. The transport abstraction enables future features
5. The team can learn incrementally

**Success Criteria**:
- All existing features continue to work
- Performance remains within 10% of baseline
- Team is productive with new architecture
- Integration complete within 3 months
- User satisfaction maintained or improved

---

## Appendix A: Code Examples

### A.1 Complete App.tsx Integration Example

See section 9.2.1 for detailed code.

### A.2 Complete AppContext.tsx Refactoring

See section 9.2.2 for detailed code.

### A.3 Transport Layer Implementation

See section 9.2.3 for detailed code.

### A.4 Hook Implementations

See section 9.2.4 for detailed code.

---

## Appendix B: Architecture Diagrams

### B.1 Current Architecture
See section 1.1

### B.2 Proposed Architecture
See section 1.2

### B.3 Data Flow Diagrams
See section 5

---

## Appendix C: Testing Checklist

### C.1 Unit Tests
- [ ] BatteryManager tests
- [ ] PermissionManager tests
- [ ] PresenceManager tests
- [ ] TTLManager tests
- [ ] InterestManager tests
- [ ] SupabaseTransport tests
- [ ] BluetoothTransport tests
- [ ] Hook tests

### C.2 Integration Tests
- [ ] Post creation → TTL tracking
- [ ] Interest expression → retry → response
- [ ] Permission flow
- [ ] Presence broadcasting
- [ ] Battery optimization
- [ ] Mode switching

### C.3 E2E Tests
- [ ] First launch flow
- [ ] Create and share post
- [ ] Express interest flow
- [ ] Battery optimization flow
- [ ] Offline mode (future)

### C.4 Performance Tests
- [ ] App initialization time
- [ ] Post loading time
- [ ] Interest expression time
- [ ] Memory usage
- [ ] Battery drain

---

## Appendix D: Migration Checklist

### D.1 Phase 1: Foundation
- [ ] Create ITransportRouter interface
- [ ] Implement SupabaseTransport
- [ ] Add manager instances to App.tsx
- [ ] Implement missing hooks (stubs)
- [ ] Add integration tests
- [ ] Verify no regressions

### D.2 Phase 2: TTL Integration
- [ ] Initialize TTLManager
- [ ] Track posts on load/creation
- [ ] Subscribe to expiration events
- [ ] Update AppContext
- [ ] Add TTL UI indicators
- [ ] Test expiration flow

### D.3 Phase 3: Permission Integration
- [ ] Initialize PermissionManager
- [ ] Implement usePermissions hook
- [ ] Add permission screens
- [ ] Replace direct checks
- [ ] Add status indicators
- [ ] Test permission flow

### D.4 Phase 4: Presence Integration
- [ ] Initialize PresenceManager
- [ ] Implement usePeerCount hook
- [ ] Connect to transport
- [ ] Update UI components
- [ ] Add peer list display
- [ ] Test heartbeat flow

### D.5 Phase 5: Interest Integration
- [ ] Initialize InterestManager
- [ ] Refactor AppContext
- [ ] Update interest components
- [ ] Add retry indicators
- [ ] Test failure scenarios
- [ ] Verify no lost interests

### D.6 Phase 6: Battery Integration
- [ ] Initialize BatteryManager
- [ ] Connect lifecycle events
- [ ] Coordinate with battery.service
- [ ] Add background mesh toggle
- [ ] Test transitions
- [ ] Monitor battery drain

### D.7 Phase 7: Cleanup
- [ ] Remove direct service calls
- [ ] Deprecate old actions
- [ ] Optimize performance
- [ ] Add monitoring
- [ ] Update documentation
- [ ] Train team

---

**Document Version**: 1.0  
**Last Updated**: February 8, 2026  
**Author**: Kiro AI Assistant  
**Status**: Draft for Review
