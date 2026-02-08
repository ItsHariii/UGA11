# Business Logic Layer Integration - Design Document

**Feature**: Integration of Mohini's Business Logic Layer  
**Status**: Draft  
**Created**: February 8, 2026  
**Version**: 1.0

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

The integration introduces a clean layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    React Native UI                       │
│  Components, Screens, Hooks                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              AppContext (State Management)               │
│  - Delegates to Managers                                │
│  - Handles Manager Events                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Business Logic Layer (Managers)             │
│  - BatteryManager                                       │
│  - PermissionManager                                    │
│  - PresenceManager                                      │
│  - TTLManager                                           │
│  - InterestManager                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Transport Layer                         │
│  - ITransportRouter (interface)                         │
│  - SupabaseTransport (implementation)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Infrastructure Services                     │
│  - Supabase Client                                       │
│  - Bluetooth/Nearby API (future)                        │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

1. **Separation of Concerns**: Business logic separated from UI
2. **Interface-Driven**: All managers implement interfaces
3. **Event-Driven**: Managers communicate via events/callbacks
4. **Transport Abstraction**: Online/offline modes via transport layer
5. **Testability**: All components testable in isolation
6. **Backward Compatibility**: Phased migration maintains existing functionality

---

## 2. Component Design

### 2.1 Transport Layer

#### 2.1.1 ITransportRouter Interface

**Purpose**: Define contract for all transport implementations

**Location**: `NeighborYield/src/transport/ITransportRouter.ts`

**Interface Definition**:
```typescript
export interface ITransportRouter {
  // Send operations
  sendPost(post: SharePost): Promise<void>;
  sendInterest(interest: InterestAck): Promise<void>;
  sendResponse(response: InterestResponse): Promise<void>;
  sendHeartbeat(payload: HeartbeatPayload): Promise<void>;
  
  // Fetch operations
  fetchPosts(): Promise<SharePost[]>;
  
  // Subscription operations
  onPostReceived(handler: (post: SharePost) => void): Unsubscribe;
  onInterestReceived(handler: (interest: InterestAck) => void): Unsubscribe;
  onResponseReceived(handler: (response: InterestResponse) => void): Unsubscribe;
  onHeartbeatReceived(handler: (payload: HeartbeatPayload) => void): Unsubscribe;
}

export type Unsubscribe = () => void;
```

**Design Decisions**:
- Async operations return Promises
- Subscriptions return unsubscribe functions
- Errors thrown as exceptions
- All data types strongly typed

#### 2.1.2 SupabaseTransport Implementation

**Purpose**: Implement transport using Supabase

**Location**: `NeighborYield/src/transport/SupabaseTransport.ts`

**Key Methods**:

```typescript
class SupabaseTransport implements ITransportRouter {
  constructor(private supabase: SupabaseClient) {}
  
  async sendPost(post: SharePost): Promise<void> {
    const row = mapSharePostToSupabase(post);
    const { error } = await this.supabase.from('posts').insert(row);
    if (error) throw new TransportError('Failed to send post', error);
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
    if (error) throw new TransportError('Failed to send interest', error);
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
  
  // ... other methods
}
```

**Error Handling**:
- Wrap Supabase errors in TransportError
- Include original error for debugging
- Log all errors with context

**Data Mapping**:
- Use SupabaseMappers utility for conversions
- Validate data before sending
- Handle missing/null fields gracefully

### 2.2 Manager Layer

#### 2.2.1 TTLManager

**Purpose**: Automatic post expiration management

**Location**: `NeighborYield/src/managers/TTLManager.ts`

**Interface**: `ITTLManager`

**State**:
```typescript
private trackedPosts: Map<string, {
  post: SharePost;
  expiresAt: number;
  timer: NodeJS.Timeout;
}>;
private expirationHandlers: Set<(postId: string) => void>;
```

**Key Methods**:
```typescript
trackPost(post: SharePost): void {
  const ttl = this.getTTLForRisk(post.riskTier);
  const expiresAt = post.createdAt + ttl;
  
  const timer = setTimeout(() => {
    this.handleExpiration(post.id);
  }, ttl);
  
  this.trackedPosts.set(post.id, { post, expiresAt, timer });
}

private handleExpiration(postId: string): void {
  this.trackedPosts.delete(postId);
  this.expirationHandlers.forEach(handler => handler(postId));
}

getRemainingTTL(postId: string): number | null {
  const tracked = this.trackedPosts.get(postId);
  if (!tracked) return null;
  return Math.max(0, tracked.expiresAt - Date.now());
}
```

**TTL Values**:
- Low risk: 86,400,000 ms (24 hours)
- Medium risk: 43,200,000 ms (12 hours)
- High risk: 21,600,000 ms (6 hours)

**Cleanup Strategy**:
- Timers automatically fire at expiration
- Manual purge every 30 seconds as backup
- Clear all timers on dispose

#### 2.2.2 PermissionManager

**Purpose**: Android runtime permission management

**Location**: `NeighborYield/src/managers/PermissionManager.ts`

**Interface**: `IPermissionManager`

**State**:
```typescript
private currentStatus: PermissionStatus;
private changeHandlers: Set<(status: PermissionStatus) => void>;
```

**Key Methods**:
```typescript
async checkPermissions(): Promise<PermissionStatus> {
  const bluetooth = await this.checkPermission('bluetooth');
  const location = await this.checkPermission('location');
  const nearbyDevices = await this.checkPermission('nearby_devices');
  
  const canUseMesh = bluetooth === 'granted' && 
                     location === 'granted' && 
                     nearbyDevices === 'granted';
  
  return { bluetooth, location, nearbyDevices, canUseMesh };
}

async requestAllPermissions(): Promise<PermissionStatus> {
  // Request in sequence with explanations
  await this.requestPermission('bluetooth');
  await this.requestPermission('location');
  await this.requestPermission('nearby_devices');
  
  return this.checkPermissions();
}
```

**Permission Flow**:
1. Check current status
2. Show explanation if needed
3. Request permission
4. Handle result (granted/denied/never_ask_again)
5. Fire change events
6. Update UI

#### 2.2.3 PresenceManager

**Purpose**: Heartbeat broadcasting and peer discovery

**Location**: `NeighborYield/src/managers/PresenceManager.ts`

**Interface**: `IPresenceManager`

**State**:
```typescript
private activePeers: Map<string, PeerInfo>;
private heartbeatInterval: number = 15000; // 15 seconds
private heartbeatTimer: NodeJS.Timeout | null;
private countChangeHandlers: Set<(count: number) => void>;
```

**Key Methods**:
```typescript
startBroadcasting(): void {
  this.heartbeatTimer = setInterval(() => {
    const payload: HeartbeatPayload = {
      userId: this.userId,
      userIdentifier: this.userIdentifier,
      timestamp: Date.now(),
    };
    this.transport.sendHeartbeat(payload);
  }, this.heartbeatInterval);
}

receivedHeartbeat(endpointId: string, payload: HeartbeatPayload): void {
  const peer: PeerInfo = {
    endpointId,
    userId: payload.userId,
    userIdentifier: payload.userIdentifier,
    lastSeen: payload.timestamp,
  };
  
  this.activePeers.set(endpointId, peer);
  this.notifyCountChange();
  
  // Remove peer after 30 seconds of inactivity
  setTimeout(() => {
    const current = this.activePeers.get(endpointId);
    if (current && current.lastSeen === payload.timestamp) {
      this.activePeers.delete(endpointId);
      this.notifyCountChange();
    }
  }, 30000);
}
```

**Heartbeat Strategy**:
- Broadcast every 15 seconds (default)
- Adjust interval based on battery level
- Remove peers after 30 seconds of inactivity
- Fire count change events

#### 2.2.4 InterestManager

**Purpose**: Interest expression with retry logic

**Location**: `NeighborYield/src/managers/InterestManager.ts`

**Interface**: `IInterestManager`

**State**:
```typescript
private pendingInterests: Map<string, InterestAck>;
private interestHandlers: Set<(interest: InterestAck) => void>;
private responseHandlers: Set<(response: InterestResponse) => void>;
```

**Key Methods**:
```typescript
async expressInterest(postId: string): Promise<InterestResult> {
  const interest: InterestAck = {
    id: generateId(),
    postId,
    interestedUserId: this.userId,
    posterId: this.getPosterId(postId),
    timestamp: Date.now(),
    retryCount: 0,
  };
  
  return this.sendWithRetry(interest);
}

private async sendWithRetry(
  interest: InterestAck, 
  attempt: number = 1
): Promise<InterestResult> {
  try {
    await this.transport.sendInterest(interest);
    return { success: true, interestId: interest.id };
  } catch (error) {
    if (attempt >= 3) {
      return { 
        success: false, 
        error: 'max_retries_exceeded' 
      };
    }
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, attempt - 1) * 1000;
    await this.sleep(delay);
    
    interest.retryCount = attempt;
    return this.sendWithRetry(interest, attempt + 1);
  }
}
```

**Retry Strategy**:
- Maximum 3 attempts
- Exponential backoff (1s, 2s, 4s)
- Track retry count in interest object
- Fire events for success/failure

#### 2.2.5 BatteryManager

**Purpose**: App lifecycle and battery optimization

**Location**: `NeighborYield/src/managers/BatteryManager.ts`

**Interface**: `IBatteryManager`

**State**:
```typescript
private batteryLevel: number = 100;
private backgroundMeshEnabled: boolean = false;
private isInForeground: boolean = true;
private lowBatteryHandlers: Set<() => void>;
```

**Key Methods**:
```typescript
onAppForeground(): void {
  this.isInForeground = true;
  if (this.backgroundMeshEnabled || this.batteryLevel > 20) {
    // Resume mesh operations
    this.resumeMeshOperations();
  }
}

onAppBackground(): void {
  this.isInForeground = false;
  if (!this.backgroundMeshEnabled) {
    // Pause mesh operations
    this.pauseMeshOperations();
  }
}

private checkBatteryLevel(): void {
  // In production, use native battery API
  // For now, coordinate with existing battery.service
  
  if (this.batteryLevel < 20 && !this.lowBatteryFired) {
    this.lowBatteryHandlers.forEach(handler => handler());
    this.lowBatteryFired = true;
  }
}
```

**Lifecycle Management**:
- Track foreground/background state
- Pause mesh when in background (if configured)
- Resume mesh when returning to foreground
- Coordinate with battery.service for optimizations

---

## 3. Data Flow Design

### 3.1 Post Creation Flow

```
User Input
  ↓
PostCreatorForm
  ↓
dispatch({ type: 'ADD_POST', payload: post })
  ↓
AppContext Reducer
  ├─→ ttlManager.trackPost(post)
  └─→ transport.sendPost(post)
      ↓
      SupabaseTransport
      ↓
      Supabase Database
      ↓
      Real-time Subscription
      ↓
      Other Clients
```

### 3.2 Interest Expression Flow

```
User Clicks "Interested"
  ↓
handleInterestPress()
  ↓
interestManager.expressInterest(postId)
  ↓
InterestManager
  ├─→ Attempt 1: transport.sendInterest()
  ├─→ [If fails] Wait 1s
  ├─→ Attempt 2: transport.sendInterest()
  ├─→ [If fails] Wait 2s
  └─→ Attempt 3: transport.sendInterest()
      ↓
      SupabaseTransport
      ↓
      Supabase Database
      ↓
      Poster's Device
      ↓
      interestManager.receivedInterest()
      ↓
      onInterestReceived callback
      ↓
      dispatch({ type: 'INTEREST_RECEIVED' })
```

### 3.3 Post Expiration Flow

```
Post Created
  ↓
ttlManager.trackPost(post)
  ↓
TTLManager sets timer
  ↓
[Time passes]
  ↓
Timer fires
  ↓
onPostExpired callback
  ↓
dispatch({ type: 'REMOVE_EXPIRED_POST' })
  ↓
AppContext Reducer removes post
  ↓
UI updates automatically
```

### 3.4 Permission Request Flow

```
App Launch
  ↓
permissionManager.checkPermissions()
  ↓
[If not granted]
  ↓
Show Permission Explanation Screen
  ↓
User clicks "Grant Permissions"
  ↓
permissionManager.requestAllPermissions()
  ↓
Request Bluetooth
  ↓
Request Location
  ↓
Request Nearby Devices
  ↓
onPermissionChange callback
  ↓
dispatch({ type: 'UPDATE_PERMISSIONS' })
  ↓
UI updates
```

---

## 4. Integration Points

### 4.1 App.tsx Integration

**Manager Initialization**:

```typescript
// In App.tsx useEffect
useEffect(() => {
  const initializeManagers = async () => {
    // 1. Create transport
    const transport = new SupabaseTransport(supabase);
    
    // 2. Create managers
    const batteryMgr = new BatteryManager(transport);
    const permissionMgr = new PermissionManager();
    const presenceMgr = new PresenceManager(transport, currentUser);
    const ttlMgr = new TTLManager();
    const interestMgr = new InterestManager(transport, currentUser);
    
    // 3. Check permissions
    const permStatus = await permissionMgr.checkPermissions();
    if (!permStatus.canUseMesh) {
      setShowPermissionExplanation(true);
    }
    
    // 4. Start managers
    batteryMgr.onAppForeground();
    if (permStatus.canUseMesh) {
      presenceMgr.startBroadcasting();
    }
    
    // 5. Subscribe to events
    ttlMgr.onPostExpired((postId) => {
      dispatch({ type: 'REMOVE_EXPIRED_POST', payload: postId });
    });
    
    interestMgr.onInterestReceived((interest) => {
      dispatch({ type: 'INTEREST_RECEIVED', payload: interest });
    });
    
    interestMgr.onResponseReceived((response) => {
      dispatch({ type: 'RESPONSE_RECEIVED', payload: response });
    });
    
    presenceMgr.onPeerCountChange((count) => {
      dispatch({ type: 'UPDATE_PEER_COUNT', payload: count });
    });
    
    batteryMgr.onLowBattery(() => {
      dispatch({ type: 'LOW_BATTERY_WARNING' });
    });
    
    // 6. Load posts and track TTL
    const posts = await transport.fetchPosts();
    posts.forEach(post => ttlMgr.trackPost(post));
    dispatch({ type: 'LOAD_POSTS', payload: posts });
    
    // 7. Save managers
    setManagers({
      battery: batteryMgr,
      permission: permissionMgr,
      presence: presenceMgr,
      ttl: ttlMgr,
      interest: interestMgr,
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

**Lifecycle Handling**:
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

### 4.2 AppContext Integration

**New Action Types**:
```typescript
type Action =
  | { type: 'LOAD_POSTS'; payload: SharePost[] }
  | { type: 'ADD_POST'; payload: SharePost }
  | { type: 'REMOVE_EXPIRED_POST'; payload: string }
  | { type: 'INTEREST_RECEIVED'; payload: InterestAck }
  | { type: 'RESPONSE_RECEIVED'; payload: InterestResponse }
  | { type: 'UPDATE_PEER_COUNT'; payload: number }
  | { type: 'LOW_BATTERY_WARNING' }
  | { type: 'UPDATE_PERMISSIONS'; payload: PermissionStatus }
  // ... existing actions
```

**Reducer Updates**:
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
    
    case 'UPDATE_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload
      };
    
    // ... existing cases
  }
}
```

### 4.3 Hook Implementations

#### usePermissions Hook

**Location**: `NeighborYield/src/hooks/usePermissions.ts`

```typescript
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

#### usePeerCount Hook

**Location**: `NeighborYield/src/hooks/usePeerCount.ts`

```typescript
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

#### useTTL Hook

**Location**: `NeighborYield/src/hooks/useTTL.ts`

```typescript
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
    isExpiringSoon: remainingTTL !== null && remainingTTL < 5 * 60 * 1000,
  };
}
```

---

## 5. UI Component Updates

### 5.1 SharePostCard Updates

**Add TTL Display**:
```typescript
function SharePostCard({ post }: { post: SharePost }) {
  const { formattedTime, isExpiringSoon } = useTTL(ttlManager, post.id);
  
  return (
    <View style={styles.card}>
      {/* Existing content */}
      
      <View style={styles.ttlContainer}>
        <Text style={[
          styles.ttlText,
          isExpiringSoon && styles.ttlWarning
        ]}>
          {isExpiringSoon ? '⚠️ ' : '⏱️ '}
          {formattedTime} remaining
        </Text>
      </View>
    </View>
  );
}
```

### 5.2 DynamicIsland Updates

**Use usePeerCount Hook**:
```typescript
function DynamicIsland() {
  const { peerCount } = usePeerCount(presenceManager);
  const displayText = formatPeerCount(peerCount);
  
  return (
    <View style={styles.island}>
      <Text>{displayText}</Text>
    </View>
  );
}
```

### 5.3 InterestNotificationCard Updates

**Show Retry Status**:
```typescript
function InterestNotificationCard({ interest }: { interest: InterestAck }) {
  const isRetrying = interest.retryCount > 0;
  
  return (
    <View style={styles.card}>
      {/* Existing content */}
      
      {isRetrying && (
        <View style={styles.retryBadge}>
          <Text>Retry {interest.retryCount}/3</Text>
        </View>
      )}
    </View>
  );
}
```

### 5.4 Permission Explanation Screen

**New Component**:
```typescript
function PermissionExplanationScreen({ onRequestPermissions, onSkip }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Permissions Needed</Text>
      
      <PermissionItem
        icon="bluetooth"
        title="Bluetooth"
        description="Required for mesh networking with nearby devices"
      />
      
      <PermissionItem
        icon="location"
        title="Location"
        description="Required by Android for Bluetooth functionality"
      />
      
      <PermissionItem
        icon="nearby"
        title="Nearby Devices"
        description="Allows discovery of neighbors in your area"
      />
      
      <Button title="Grant Permissions" onPress={onRequestPermissions} />
      <Button title="Skip" onPress={onSkip} variant="text" />
    </ScrollView>
  );
}
```

---

## 6. Error Handling Strategy

### 6.1 Transport Errors

**Error Types**:
```typescript
class TransportError extends Error {
  constructor(
    message: string,
    public originalError: any,
    public operation: string
  ) {
    super(message);
    this.name = 'TransportError';
  }
}
```

**Handling**:
- Wrap all Supabase errors
- Log with context
- Propagate to manager layer
- Manager decides retry strategy

### 6.2 Manager Errors

**Error Types**:
```typescript
class ManagerError extends Error {
  constructor(
    message: string,
    public manager: string,
    public operation: string
  ) {
    super(message);
    this.name = 'ManagerError';
  }
}
```

**Handling**:
- Catch transport errors
- Implement retry logic where appropriate
- Fire error events to UI
- Graceful degradation

### 6.3 UI Error Handling

**Strategy**:
- Show user-friendly error messages
- Provide retry options
- Log errors for debugging
- Don't crash app on non-critical errors

**Example**:
```typescript
try {
  await interestManager.expressInterest(postId);
  Alert.alert('Success', 'Interest sent!');
} catch (error) {
  if (error instanceof ManagerError) {
    Alert.alert('Error', 'Failed to send interest. Please try again.');
  } else {
    Alert.alert('Error', 'An unexpected error occurred.');
  }
  console.error('Interest expression failed:', error);
}
```

---

## 7. Performance Optimization

### 7.1 Manager Initialization

**Strategy**:
- Initialize managers in parallel where possible
- Lazy load non-critical managers
- Cache manager instances
- Minimize initialization work

**Implementation**:
```typescript
const initializeManagers = async () => {
  // Parallel initialization
  const [transport, permStatus] = await Promise.all([
    createTransport(),
    checkInitialPermissions(),
  ]);
  
  // Sequential for dependencies
  const managers = createManagers(transport);
  
  // Start only if permissions granted
  if (permStatus.canUseMesh) {
    managers.presence.startBroadcasting();
  }
};
```

### 7.2 Event Dispatching

**Strategy**:
- Debounce frequent events (peer count changes)
- Batch state updates where possible
- Use React.memo for expensive components
- Optimize re-renders

**Implementation**:
```typescript
// Debounce peer count changes
private notifyCountChange = debounce(() => {
  const count = this.activePeers.size;
  this.countChangeHandlers.forEach(handler => handler(count));
}, 500);
```

### 7.3 Memory Management

**Strategy**:
- Clear timers on cleanup
- Unsubscribe from events
- Remove expired posts from tracking
- Limit peer list size

**Implementation**:
```typescript
dispose(): void {
  // Clear all timers
  this.trackedPosts.forEach(({ timer }) => clearTimeout(timer));
  this.trackedPosts.clear();
  
  // Clear handlers
  this.expirationHandlers.clear();
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Manager Tests**:
- Test each manager in isolation
- Mock transport layer
- Test all public methods
- Test error scenarios
- Test event firing

**Example**:
```typescript
describe('TTLManager', () => {
  it('should track post and fire expiration event', async () => {
    const manager = new TTLManager();
    const handler = jest.fn();
    manager.onPostExpired(handler);
    
    const post = createMockPost({ riskTier: 'high' });
    manager.trackPost(post);
    
    // Fast-forward time
    jest.advanceTimersByTime(6 * 60 * 60 * 1000);
    
    expect(handler).toHaveBeenCalledWith(post.id);
  });
});
```

### 8.2 Integration Tests

**Transport Tests**:
- Test SupabaseTransport with real Supabase client
- Test data mapping
- Test subscriptions
- Test error handling

**Manager Integration Tests**:
- Test manager + transport interaction
- Test event flow
- Test retry logic
- Test state consistency

### 8.3 End-to-End Tests

**Critical Flows**:
- Post creation → TTL tracking → expiration
- Interest expression → retry → response
- Permission request → grant → mesh start
- App background → pause → foreground → resume

---

## 9. Migration Strategy

### 9.1 Phase 1: Foundation (Week 1-2)

**Deliverables**:
- Transport layer implemented
- Managers copied and adapted
- Hooks implemented (stubs)
- Integration tests passing

**Verification**:
- All existing features work
- No performance degradation
- No new bugs introduced

### 9.2 Phase 2: TTL Integration (Week 3)

**Deliverables**:
- TTLManager initialized in App.tsx
- Posts tracked on load/creation
- Expiration events handled
- UI shows TTL countdown

**Verification**:
- Posts expire correctly
- UI updates on expiration
- No memory leaks from timers

### 9.3 Phase 3: Permission Integration (Week 4)

**Deliverables**:
- PermissionManager initialized
- Permission flow implemented
- Explanation screen created
- Status indicators added

**Verification**:
- Permission flow works
- Mesh starts when granted
- Graceful handling of denials

### 9.4 Phase 4: Presence Integration (Week 5)

**Deliverables**:
- PresenceManager initialized
- Heartbeat broadcasting active
- Peer count displayed
- Battery-aware intervals

**Verification**:
- Peer count accurate
- Heartbeats sent/received
- Battery optimization works

### 9.5 Phase 5: Interest Integration (Week 6-7)

**Deliverables**:
- InterestManager initialized
- Retry logic active
- UI shows retry status
- Queue management working

**Verification**:
- Interests retry on failure
- No lost interests
- UI feedback clear

### 9.6 Phase 6: Battery Integration (Week 8)

**Deliverables**:
- BatteryManager initialized
- Lifecycle events handled
- Background mesh toggle
- Coordination with battery.service

**Verification**:
- Lifecycle transitions smooth
- Mesh pauses/resumes correctly
- Battery optimization effective

### 9.7 Phase 7: Cleanup (Week 9-10)

**Deliverables**:
- Legacy code removed
- Performance optimized
- Documentation complete
- Team trained

**Verification**:
- All tests passing
- Performance within targets
- Team productive

---

## 10. Rollback Plan

### 10.1 Feature Flags

**Implementation**:
```typescript
const FEATURE_FLAGS = {
  USE_TTL_MANAGER: true,
  USE_PERMISSION_MANAGER: true,
  USE_PRESENCE_MANAGER: true,
  USE_INTEREST_MANAGER: true,
  USE_BATTERY_MANAGER: true,
};

// In code
if (FEATURE_FLAGS.USE_TTL_MANAGER) {
  ttlManager.trackPost(post);
} else {
  // Old behavior
}
```

### 10.2 Rollback Triggers

**Conditions**:
- Critical bug affecting core functionality
- Performance degradation > 20%
- User-facing errors > 1%
- Team consensus to pause

**Procedure**:
1. Disable feature flags
2. Verify app works with old code
3. Deploy hotfix if needed
4. Analyze root cause
5. Plan fix and retry

---

## 11. Monitoring and Metrics

### 11.1 Performance Metrics

**Track**:
- App initialization time
- Post loading time
- Interest expression time
- Memory usage
- Battery drain

**Targets**:
- Initialization: < 2 seconds
- Post loading: < 1 second
- Interest expression: < 500ms
- Memory: < 50MB increase
- Battery: No significant increase

### 11.2 Functional Metrics

**Track**:
- Post expiration accuracy
- Interest success rate
- Permission grant rate
- Peer discovery rate
- Retry success rate

**Targets**:
- Expiration: 100% accurate
- Interest success: > 95%
- Permission grant: > 70%
- Peer discovery: > 80%
- Retry success: > 90%

### 11.3 Error Metrics

**Track**:
- Transport errors
- Manager errors
- UI errors
- Crash rate

**Targets**:
- Transport errors: < 1%
- Manager errors: < 0.5%
- UI errors: < 0.1%
- Crash rate: < 0.01%

---

## 12. Future Enhancements

### 12.1 Offline Mode

**Design**:
- Implement BluetoothTransport
- Wrap bluetooth.service and gossip.service
- Add transport switching logic
- Handle sync conflicts

**Timeline**: Post-integration (3-4 months)

### 12.2 Advanced Features

**Potential Additions**:
- Post prioritization based on urgency
- Smart retry with network quality detection
- Predictive peer discovery
- Advanced battery optimization
- Analytics and insights

---

## 13. References

- **Requirements**: `.kiro/specs/business-logic-integration/requirements.md`
- **Analysis**: `docs/MOHINI_INTEGRATION_ANALYSIS.md`
- **Tasks**: `docs/INTEGRATION_TASKS.md`
- **Mohini's Code**: `src/managers/`, `src/utils/`, `src/types/`

---

**Document Status**: Ready for Implementation  
**Next Steps**: Create tasks.md and begin Phase 1  
**Approval Required**: Tech Lead, Product Owner

---

**Version**: 1.0  
**Last Updated**: February 8, 2026  
**Author**: Development Team
