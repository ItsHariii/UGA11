# Person 3's Business Logic Code - Complete Explanation

## Overview

Person 3 built the **business logic layer** for NeighborYield, a food-sharing app with offline mesh networking. This layer sits between the UI (Person 1) and the network layer (Person 2), managing all the core application logic.

Think of it like this:
- **Person 1** (Frontend): What users see and click
- **Person 3** (Business Logic): The brain that makes decisions
- **Person 2** (Transport): How messages get sent (internet or Bluetooth)

---

## Architecture: The 5 Core Managers

Person 3 created 5 independent "manager" classes, each responsible for a specific aspect of the app:

### 1. TTL Manager (Time-To-Live)
**Purpose**: Automatically delete food posts after they expire based on safety risk.

**How It Works**:
```
Fresh Sushi (high risk) → expires in 15 minutes
Cooked Pasta (medium risk) → expires in 30 minutes  
Canned Goods (low risk) → expires in 60 minutes
```

**Key Features**:
- Stores all posts in a `Map<string, SharePost>` (like a dictionary)
- Every 10 seconds, runs a cleanup check (`purgeExpired()`)
- When a post expires, fires an event so the UI can remove it
- Uses TypeScript's `setInterval()` for automatic checking

**Code Flow**:
```typescript
// 1. Track a new post
ttlManager.trackPost(post);

// 2. Every 10 seconds, this runs automatically:
purgeExpired() {
  for each post:
    if (post.expiresAt <= now):
      delete post
      emit event → UI removes post from screen
}

// 3. UI listens for expirations:
ttlManager.onPostExpired((postId) => {
  // Remove from screen
});
```

**Why It Matters**: Food safety! High-risk foods (sushi, raw meat) shouldn't sit around as long as shelf-stable items.

---

### 2. Presence Manager (Peer Discovery)
**Purpose**: Find nearby users and keep track of who's online.

**How It Works**:
1. **Broadcasting**: Every 15 seconds, sends a "heartbeat" to everyone nearby
2. **Listening**: When it receives heartbeats from others, adds them to peer list
3. **Timeout**: If someone hasn't sent a heartbeat in 30 seconds (2 missed intervals), removes them

**Data Structure**:
```typescript
peers: Map<endpointId, PeerInfo>
// Example:
// "endpoint_abc123" → { userIdentifier: "Neighbor-A3F9", lastSeen: 1234567890 }
// "endpoint_def456" → { userIdentifier: "Neighbor-B7C2", lastSeen: 1234567895 }
```

**Heartbeat Payload** (kept tiny for efficiency):
```typescript
{
  v: 1,                    // protocol version
  uid: "Neighbor-A3F9",    // who I am
  ts: 1234567890,          // current timestamp
  cap: 0                   // capabilities (future use)
}
```

**Code Flow**:
```typescript
// Start broadcasting
presenceManager.startBroadcasting();
  → Sends heartbeat immediately
  → Sets timer to send every 15s

// When receiving heartbeat from peer:
receivedHeartbeat("endpoint_xyz", payload) {
  peers.set("endpoint_xyz", {
    endpointId: "endpoint_xyz",
    userIdentifier: payload.uid,
    lastSeen: now
  });
  emit peerCountChange event → UI shows "3 neighbors nearby"
}

// Cleanup timer runs every 15s:
removeStalePeers() {
  for each peer:
    if (now - peer.lastSeen > 30 seconds):
      delete peer
}
```

**Battery Optimization**: Can adjust interval to 60 seconds when app is in background.

---

### 3. Interest Manager (Claim Flow)
**Purpose**: Handle the "I'm interested!" → "Accept/Decline" conversation between users.

**How It Works**:

**Scenario**: Alice posts food, Bob clicks "Interested"

1. **Bob's Side**:
   ```typescript
   interestManager.expressInterest("post_123")
   → Creates interest object
   → Sends via transport layer
   → Starts retry logic (1s, 2s, 4s, 8s, 15s) if message fails
   ```

2. **Alice's Side**:
   ```typescript
   interestManager.receivedInterest(interest)
   → Adds to queue for post_123
   → Fires event → UI shows "Bob wants this food!"
   ```

3. **Alice Responds**:
   ```typescript
   interestManager.respondToInterest(interestId, 'accept')
   → Sends response back to Bob
   ```

4. **Bob Gets Response**:
   ```typescript
   interestManager.receivedResponse(response)
   → Fires event → UI shows "Alice accepted! Here's her contact..."
   ```

**Retry Logic** (Smart Exponential Backoff):
```
Attempt 1: Wait 1 second, retry
Attempt 2: Wait 2 seconds, retry
Attempt 3: Wait 4 seconds, retry
Attempt 4: Wait 8 seconds, retry
Attempt 5: Wait 15 seconds, retry
Total: ~30 seconds of trying
```

This handles flaky Bluetooth connections without overwhelming the network.

**Data Structures**:
```typescript
outgoingInterests: Map<interestId, InterestAck>  // Interests I've sent
incomingInterests: Map<postId, InterestAck[]>    // Interests I've received per post
```

---

### 4. Permission Manager (Android Permissions)
**Purpose**: Request and track Android runtime permissions needed for Bluetooth mesh networking.

**Required Permissions**:
1. **Bluetooth**: Device-to-device communication
2. **Location**: Required by Android for Nearby Connections (privacy requirement)
3. **Nearby Devices**: Android 12+ permission for finding nearby devices

**How It Works**:
```typescript
// Check current state
permissionManager.checkPermissions()
→ Returns: { bluetooth: 'denied', location: 'denied', ... canUseMesh: false }

// Request permission with explanation
permissionManager.requestPermission('bluetooth')
→ Shows explanation to user
→ Requests permission
→ Updates internal state
→ Fires event if mesh status changes

// All granted?
canUseMesh = (bluetooth === 'granted' && location === 'granted' && nearbyDevices === 'granted')
```

**Graceful Degradation**:
- If permissions denied → `canUseMesh = false` → app falls back to online-only mode
- Users can still use the app via internet, just no offline mesh features

**In This Code**: Simulated for standalone testing
**In Production**: Would use `react-native-permissions` library

---

### 5. Battery Manager (Lifecycle & Optimization)
**Purpose**: Manage power usage and app lifecycle to preserve battery.

**Features**:

1. **Foreground/Background Detection**:
   ```typescript
   onAppForeground() → heartbeat every 15s
   onAppBackground() → heartbeat every 60s (or stop if disabled)
   ```

2. **Background Mesh Toggle**:
   ```typescript
   setBackgroundMeshEnabled(true)  → Keep mesh active in background
   setBackgroundMeshEnabled(false) → Suspend mesh when backgrounded
   ```

3. **Low Battery Protection**:
   ```typescript
   simulateBatteryLevel(12%)
   → Detects < 15% threshold
   → Automatically disables background mesh
   → Fires low battery event → UI shows warning
   ```

**Battery States**:
```
'active'    → Broadcasting heartbeats, full power
'suspended' → Stopped broadcasting to save battery
'disabled'  → Mesh off due to low battery or user choice
```

**Integration with Presence Manager**:
```typescript
// When app goes to background:
batteryManager.onAppBackground()
  → presenceManager.setHeartbeatInterval(60000)  // 60s
  → presenceManager.stopBroadcasting()           // if disabled
```

---

## Supporting Infrastructure

### User Identifier Generator
**Purpose**: Create pseudonymous usernames like `Neighbor-A3F9`

```typescript
generateUserIdentifier()
  → Random 4-digit hex: Math.random() → "A3F9"
  → Format: "Neighbor-A3F9"
  → Cache in memory (in production: save to AsyncStorage)
```

**Why Pseudonymous?**: Privacy! Users don't share real names on the mesh network.

---

### Mock Transport Router
**Purpose**: Simulates the network layer for testing without Person 2's code.

```typescript
interface ITransportRouter {
  send(message) → Promise<SendResult>     // Send message
  subscribe(handler) → Unsubscribe        // Listen for messages
  getMode() → 'online' | 'offline' | 'hybrid'
  onModeChange(handler)
}
```

**In Testing**: Logs messages to console
**In Production**: Person 2 replaces this with real Supabase + Bluetooth code

---

## Type System (Type Safety)

Person 3 created comprehensive TypeScript interfaces for all data:

### SharePost
```typescript
{
  id: "post_123",
  authorId: "user_456",
  authorIdentifier: "Neighbor-A3F9",
  title: "Fresh Sushi",
  description: "Made 2 hours ago",
  riskTier: "high",           // high | medium | low
  ttl: 900000,                // 15 minutes in ms
  createdAt: 1234567890,
  expiresAt: 1234568790
}
```

### InterestAck
```typescript
{
  id: "interest_789",
  postId: "post_123",
  interestedUserId: "user_999",
  interestedUserIdentifier: "Neighbor-B7C2",
  timestamp: 1234567890,
  status: "pending"  // pending | accepted | declined
}
```

### InterestResponse
```typescript
{
  interestId: "interest_789",
  postId: "post_123",
  response: "accept",  // accept | decline
  message: "Come by anytime!",
  timestamp: 1234567900
}
```

---

## Design Patterns Used

### 1. **Interface-First Design**
Every manager has an interface (contract):
```typescript
interface ITTLManager { ... }
class TTLManager implements ITTLManager { ... }
```

**Benefits**:
- Easy to mock for testing
- Clear API contracts
- Can swap implementations

### 2. **Observer Pattern (Event Subscription)**
Managers emit events, UI subscribes:
```typescript
// Subscribe
const unsubscribe = ttlManager.onPostExpired((postId) => {
  console.log("Post expired:", postId);
});

// Later, unsubscribe
unsubscribe();
```

**Why?**: Decouples managers from UI. Managers don't know about React, just fire events.

### 3. **Dependency Injection**
Managers receive dependencies via constructor:
```typescript
const presenceManager = new PresenceManager(transportRouter);
const batteryManager = new BatteryManager(presenceManager);
```

**Why?**: Easier to test, can inject mocks.

### 4. **State Management via Maps**
Uses JavaScript `Map` objects for efficient lookups:
```typescript
posts: Map<string, SharePost>
peers: Map<string, PeerInfo>
```

**Why Maps over Arrays?**:
- O(1) lookup by ID: `posts.get("post_123")`
- Easy add/remove: `posts.set(id, post)`, `posts.delete(id)`

---

## How Everything Connects

```
┌─────────────────────────────────────────────────────────────┐
│                         Person 1: UI                        │
│  (React Native Components, Hooks, Context)                  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Uses managers, subscribes to events
             │
┌────────────▼────────────────────────────────────────────────┐
│                   Person 3: Business Logic                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ TTL Manager  │  │  Presence    │  │  Interest    │      │
│  │              │  │   Manager    │  │   Manager    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Permission   │  │   Battery    │                        │
│  │   Manager    │  │   Manager    │                        │
│  └──────────────┘  └──────────────┘                        │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Sends/receives messages
             │
┌────────────▼────────────────────────────────────────────────┐
│                  Person 2: Transport Layer                  │
│            (Supabase + Nearby Connections)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Example: Complete User Flow

**Scenario**: Alice posts food, Bob claims it

1. **Alice creates post**:
   ```
   UI → TTL Manager: trackPost(post)
   TTL Manager: Stores post, starts 15-min timer
   UI → Transport: send(post) to Supabase/Mesh
   ```

2. **Bob sees post on his feed**:
   ```
   Transport → Bob's UI: New post received
   Bob clicks "Interested"
   UI → Interest Manager: expressInterest("post_123")
   Interest Manager → Transport: send(interest)
   ```

3. **Alice receives interest**:
   ```
   Transport → Interest Manager: receivedInterest(interest)
   Interest Manager: Fires event
   UI: Shows notification "Bob is interested!"
   ```

4. **Alice accepts**:
   ```
   UI → Interest Manager: respondToInterest("interest_789", "accept")
   Interest Manager → Transport: send(response)
   ```

5. **Bob gets acceptance**:
   ```
   Transport → Interest Manager: receivedResponse(response)
   Interest Manager: Fires event
   UI: Shows "Alice accepted! Contact: ..."
   ```

6. **Meanwhile, in background**:
   ```
   TTL Manager: Checking expiration every 10s
   Presence Manager: Broadcasting heartbeat every 15s
   Battery Manager: Monitoring battery, adjusting intervals
   Permission Manager: Watching for permission changes
   ```

---

## Testing & Validation

### Demo Script
The `demo.ts` file tests everything:

```typescript
1. Generate user identifier
2. Request all permissions (simulated)
3. Create posts with different TTLs
4. Wait for expiration
5. Simulate peer heartbeats
6. Express interest, receive responses
7. Test battery lifecycle (foreground/background)
8. Verify all events fire correctly
```

**Run it**:
```bash
npm install
npm run build
npm run dev
```

**Expected Output**:
```
✓ User identifier: Neighbor-A3F9
✓ All permissions granted
✓ Tracking 3 posts
✓ Auto-purged 1 expired post
✓ Discovered 2 peers
✓ Interest sent successfully
✓ Response received: accepted
✓ Battery manager handling foreground/background
```

---

## What Makes This Good Code?

### 1. **Separation of Concerns**
Each manager does ONE thing well:
- TTL → expiration
- Presence → discovery
- Interest → claims
- Permission → access
- Battery → power

### 2. **Type Safety**
TypeScript catches errors at compile time:
```typescript
// Compiler error: riskTier must be 'high' | 'medium' | 'low'
const post: SharePost = { riskTier: 'extreme' };  // ❌

// Correct:
const post: SharePost = { riskTier: 'high' };  // ✓
```

### 3. **Event-Driven Architecture**
Managers don't know about UI, just fire events:
```typescript
// Manager doesn't care who's listening
ttlManager.onPostExpired((id) => { /* UI updates */ });
```

### 4. **Graceful Degradation**
App still works with limited features:
- No permissions? → Online-only mode
- Low battery? → Disable mesh
- No internet? → Mesh-only mode

### 5. **Battery-Conscious**
- Adjustable heartbeat intervals
- Automatic suspension in background
- Low battery detection

### 6. **Retry Logic**
Interest messages retry with exponential backoff, handling flaky connections.

---

## Integration Points

### For Person 1 (Frontend):
```typescript
// Create React Context
const AppContext = createContext({
  ttlManager,
  presenceManager,
  interestManager,
  permissionManager,
  batteryManager
});

// Custom Hooks
function usePeerCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    return presenceManager.onPeerCountChange(setCount);
  }, []);
  return count;
}
```

### For Person 2 (Transport):
```typescript
// Implement ITransportRouter
class RealTransportRouter implements ITransportRouter {
  async send(message: TransportMessage) {
    if (mode === 'online') {
      return supabase.from('messages').insert(message);
    } else {
      return nearbyConnections.sendPayload(message);
    }
  }
  
  subscribe(handler: MessageHandler) {
    // When message arrives from Supabase or Bluetooth:
    if (message.type === 'heartbeat') {
      presenceManager.receivedHeartbeat(id, payload);
    } else if (message.type === 'interest_ack') {
      interestManager.receivedInterest(payload);
    }
  }
}
```

---

## Key Takeaways

1. **Clean Architecture**: Business logic is completely independent of UI and network
2. **Production-Ready**: All 5 managers fully implemented with error handling
3. **Well-Tested**: Demo script validates all functionality
4. **Type-Safe**: Comprehensive TypeScript interfaces prevent bugs
5. **Performance-Conscious**: Maps for O(1) lookups, efficient timers
6. **Battery-Optimized**: Dynamic intervals, automatic suspension
7. **Resilient**: Retry logic, graceful degradation, error handling

This is professional-grade code that's ready to be integrated into a real app!
