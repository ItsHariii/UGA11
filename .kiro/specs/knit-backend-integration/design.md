# Design Document: Knit Backend Integration

## Overview

This design document specifies the technical approach for integrating the knit backend transport layer into NeighborYield. The knit backend provides a production-ready dual-mode transport system that intelligently routes messages between online (Supabase) and offline (Android Nearby Connections) transports.

### Integration Strategy

The integration follows a **phased hybrid approach** that minimizes disruption while delivering immediate value:

**Phase 1: Mesh Networking Integration**
- Adopt nearbyAdapter.ts for production-ready Bluetooth mesh
- Implement Android NearbyConnectionsModule.kt native module
- Replace bluetooth.service.ts stub with functional mesh networking
- Connect gossip.service.ts to nearbyAdapter for message transport

**Phase 2: Hybrid Mode Support**
- Enhance mode-switching.service.ts with hybrid mode detection
- Enable simultaneous online + mesh broadcasting
- Implement heartbeat system for peer presence
- Support automatic mode transitions

**Phase 3 (Optional): Full Transport Unification**
- Adopt transportRouter.ts as primary transport layer
- Migrate services to unified send()/subscribe() API
- Consolidate duplicate code

### Key Benefits

- **Functional Offline Mode**: Production-ready Android Nearby Connections replaces stub implementation
- **Hybrid Resilience**: Messages sent via both cloud and mesh when both available
- **Automatic Mode Switching**: Seamless transitions based on connectivity
- **Minimal Disruption**: Existing service layer and UI remain unchanged
- **Incremental Migration**: Can evolve to full adoption over time


## Architecture

### Current NeighborYield Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Components & Hooks                      │
│  (useConnectivity, useModeSwitch, useBatteryMonitor)        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ posts.service│  │interests.svc │  │messaging.svc │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │         SupabaseTransport (ITransportRouter)       │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                    Supabase Client                          │
│  (auth, database, realtime, storage)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Offline/Mesh Services (Stubs)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │bluetooth.svc │  │ gossip.svc   │  │mode-switch   │     │
│  │   (stub)     │  │ (protocol)   │  │   .svc       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Target Architecture (Phase 1 & 2)

```
┌─────────────────────────────────────────────────────────────┐
│                      Components & Hooks                      │
│  (useConnectivity, useModeSwitch, useBatteryMonitor)        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ posts.service│  │interests.svc │  │messaging.svc │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │         SupabaseTransport (ITransportRouter)       │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                    Supabase Client                          │
│  (auth, database, realtime, storage)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Mesh Networking (Production)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │nearbyAdapter │  │ gossip.svc   │  │mode-switch   │     │
│  │ (knit)       │  │ (enhanced)   │  │ (hybrid)     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │         Android NearbyConnectionsModule.kt         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Connectivity Modes

The system supports four connectivity modes:

1. **Online**: Internet available, mesh unavailable/disabled
   - Messages sent via Supabase only
   - Realtime subscriptions active
   - Full feature set available

2. **Offline**: No internet, mesh available
   - Messages sent via Nearby Connections only
   - Gossip protocol for message propagation
   - Simplified UI (survival mode)

3. **Hybrid**: Both internet and mesh available
   - Messages sent via BOTH transports simultaneously
   - Maximum resilience and redundancy
   - Full feature set with mesh backup

4. **Disconnected**: No connectivity available
   - Messages queued for later transmission
   - Local-only operations
   - Minimal UI


## Components and Interfaces

### 1. nearbyAdapter (from knit backend)

**Purpose**: React Native adapter for Android Nearby Connections API

**Key Methods**:
```typescript
interface NearbyAdapter {
  // Lifecycle
  startAdvertising(displayName: string): Promise<void>;
  startDiscovery(): Promise<void>;
  stopAll(): Promise<void>;
  
  // Messaging
  sendPayload(endpointId: string, jsonString: string): Promise<void>;
  broadcastPayload(jsonString: string): Promise<void>;
  
  // Events
  onPayloadReceived(handler: (event: PayloadReceivedEvent) => void): Unsubscribe;
  onEndpointFound(handler: (event: EndpointFoundEvent) => void): Unsubscribe;
  onEndpointLost(handler: (event: EndpointLostEvent) => void): Unsubscribe;
}
```

**Integration Points**:
- Replaces bluetooth.service.ts stub
- Used by gossip.service.ts for message transport
- Managed by mode-switching.service.ts lifecycle

### 2. NearbyConnectionsModule.kt (Android Native)

**Purpose**: Native Android module wrapping Nearby Connections API

**Required Methods**:
```kotlin
class NearbyConnectionsModule : ReactContextBaseJavaModule() {
  @ReactMethod
  fun startAdvertising(displayName: String, promise: Promise)
  
  @ReactMethod
  fun startDiscovery(promise: Promise)
  
  @ReactMethod
  fun stopAll(promise: Promise)
  
  @ReactMethod
  fun sendPayload(endpointId: String, payload: String, promise: Promise)
  
  @ReactMethod
  fun broadcastPayload(payload: String, promise: Promise)
  
  // Events emitted to JavaScript
  private fun sendEvent(eventName: String, params: WritableMap)
}
```

**Events Emitted**:
- `onPayloadReceived`: When payload received from peer
- `onEndpointFound`: When new peer discovered
- `onEndpointLost`: When peer connection lost
- `onConnectionInitiated`: When connection request received
- `onConnectionResult`: When connection succeeds/fails

**Permissions Required**:
- `ACCESS_FINE_LOCATION`
- `BLUETOOTH_ADVERTISE`
- `BLUETOOTH_CONNECT`
- `BLUETOOTH_SCAN`
- `NEARBY_WIFI_DEVICES` (Android 13+)

### 3. Enhanced gossip.service.ts

**Purpose**: Peer-to-peer message propagation using nearbyAdapter

**Key Changes**:
```typescript
class GossipService {
  // Replace stub with nearbyAdapter
  private async sendViaBluetooth(message: GossipMessage): Promise<void> {
    const compressed = compressPostList(message.payload);
    
    // Check size limit
    if (compressed.length > 512) {
      // Split into chunks or compress further
    }
    
    // Use nearbyAdapter instead of stub
    await nearbyAdapter.broadcastPayload(compressed);
  }
  
  // Initialize with nearbyAdapter
  async initialize() {
    nearbyAdapter.onPayloadReceived((event) => {
      const message = JSON.parse(event.payload) as GossipMessage;
      this.receiveMessage(message, event.endpointId);
    });
    
    await nearbyAdapter.startDiscovery();
    await nearbyAdapter.startAdvertising();
  }
}
```

### 4. Enhanced mode-switching.service.ts

**Purpose**: Manage mode transitions including hybrid mode

**Key Changes**:
```typescript
export type AppMode = 'abundance' | 'survival' | 'hybrid';

class ModeSwitchingService {
  private async checkConnectivity() {
    const isOnline = await this.checkInternetConnectivity();
    const canMesh = await this.checkMeshCapability();
    
    // Determine mode
    let newMode: AppMode;
    if (isOnline && canMesh) {
      newMode = 'hybrid';  // BOTH AVAILABLE
    } else if (isOnline) {
      newMode = 'abundance';
    } else if (canMesh) {
      newMode = 'survival';
    } else {
      newMode = 'survival';  // Fallback
    }
    
    if (newMode !== this.currentMode) {
      await this.switchMode(newMode);
    }
  }
  
  async enterHybridMode() {
    // Keep Supabase active
    // Keep mesh active
    // Messages sent via both for redundancy
  }
}
```

### 5. transportRouter (from knit backend)

**Purpose**: Unified transport layer with automatic mode-based routing

**Key Methods**:
```typescript
// Get current connectivity mode
export function getMode(): ConnectivityMode;

// Send message via appropriate transport(s)
export function send(message: TransportMessage): Promise<SendResult>;

// Subscribe to messages from all transports
export function subscribe(handler: MessageHandler): Unsubscribe;

// Listen for mode changes
export function onModeChange(handler: (mode: ConnectivityMode) => void): Unsubscribe;

// Start transport layer
export function start(): Unsubscribe;

// Set mesh capability (from permission manager)
export function setCanUseMesh(value: boolean): void;
```

**Message Routing Logic**:
```typescript
async function send(message: TransportMessage): Promise<SendResult> {
  const mode = getMode();
  
  if (mode === 'online' || mode === 'hybrid') {
    await sendViaSupabase(message);
  }
  
  if (mode === 'offline' || mode === 'hybrid') {
    if (message.targetEndpoint) {
      await nearbyAdapter.sendPayload(message.targetEndpoint, jsonString);
    } else {
      await nearbyAdapter.broadcastPayload(jsonString);
    }
  }
  
  return { success: true };
}
```

### 6. Heartbeat System

**Purpose**: Peer presence and discovery

**Key Components**:
```typescript
interface HeartbeatPayload {
  v: number;           // version
  uid: string;         // device ID
  ts: number;          // timestamp
  cap: number;         // capabilities bitmask
}

// Serialize heartbeat (must be < 1KB)
function serializeHeartbeat(payload: HeartbeatPayload): { bytes: Uint8Array; size: number };

// Deserialize heartbeat
function deserializeHeartbeat(bytes: Uint8Array): HeartbeatPayload | null;

// Create heartbeat
function createHeartbeatPayload(uid: string, capabilities: number): HeartbeatPayload;
```

**Broadcasting**:
- Broadcast every 30 seconds in foreground
- Broadcast every 60 seconds in background
- Include battery level and peer count
- Update peer last-seen timestamps on receipt


## Data Models

### TransportMessage

Unified message format for all transports:

```typescript
interface TransportMessage {
  type: MessageType;
  payload: unknown;
  targetEndpoint?: string;  // For directed messages
  ttl?: number;             // Time-to-live in milliseconds
}

type MessageType =
  | 'share_post'
  | 'interest_ack'
  | 'interest_response'
  | 'heartbeat'
  | 'peer_discovery';
```

### Message Payloads

**SharePost** (existing):
```typescript
interface SharePost {
  id: string;
  authorId: string;
  authorIdentifier: string;
  title: string;
  description: string;
  riskTier: RiskTier;
  createdAt: number;
  expiresAt: number;
  source: 'local' | 'supabase';
  location?: { latitude: number; longitude: number };
  imageUrl?: string;
}
```

**InterestAck** (existing):
```typescript
interface InterestAck {
  id: string;
  postId: string;
  interestedUserId: string;
  interestedUserIdentifier: string;
  timestamp: number;
  source: 'local' | 'supabase';
  status: 'pending' | 'accepted' | 'declined';
}
```

**HeartbeatPayload** (new):
```typescript
interface HeartbeatPayload {
  v: number;           // Protocol version
  uid: string;         // Device unique ID
  ts: number;          // Timestamp (Unix milliseconds)
  cap: number;         // Capabilities bitmask
}
```

### PeerInfo

Tracks discovered and connected peers:

```typescript
interface PeerInfo {
  endpointId: string;
  userIdentifier: string;
  lastSeen: number;
  signalStrength?: number;
  batteryLevel?: number;
  peerCount?: number;
  isActive: boolean;
}
```

### Message Queue Entry

For queuing messages when transport unavailable:

```typescript
interface QueuedMessage {
  message: TransportMessage;
  priority: MessagePriority;
  retryCount: number;
  timestamp: number;
}

enum MessagePriority {
  SOS = 0,      // Highest priority
  WANT = 1,
  HAVE = 2,
  ACK = 3,      // Lowest priority
}
```

### Chunk Metadata

For splitting large messages:

```typescript
interface MessageChunk {
  messageId: string;
  chunkIndex: number;
  totalChunks: number;
  data: string;
  checksum?: string;
}
```

### Configuration

```typescript
interface KnitBackendConfig {
  // Mesh networking
  meshEnabled: boolean;
  discoveryInterval: number;        // milliseconds
  maxConnections: number;           // max concurrent peers
  messageSize: number;              // max message size in bytes
  
  // Heartbeat
  heartbeatInterval: number;        // milliseconds
  heartbeatTimeout: number;         // milliseconds
  
  // Retry
  retryBackoff: number[];           // exponential backoff intervals
  maxRetries: number;
  
  // Queue
  queueCapacity: number;
  
  // Debug
  debugLogging: boolean;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following areas where properties can be consolidated:

**Mode Transition Properties**: Requirements 2.1, 2.3, 2.5, 2.6, 2.7, 3.2, 3.4, 7.1, 7.2, 7.3 all test mode detection and transition logic. These can be consolidated into comprehensive properties that test mode transitions for all connectivity states.

**Message Routing Properties**: Requirements 2.2, 2.8, 3.3, 5.1, 5.2, 5.3 all test message routing based on mode. These can be consolidated into properties that verify correct transport selection for all modes and message types.

**Battery-Aware Discovery**: Requirements 8.2, 8.3, 8.4 all test discovery interval selection based on battery level. These can be consolidated into a single property that tests all battery ranges.

**Event Emission Properties**: Requirements 9.5, 9.6, 9.7, 9.8 all test event emission from the native module. These can be consolidated into a property that tests all event types.

**Heartbeat Properties**: Requirements 11.1, 11.2, 11.3 all test heartbeat broadcasting and processing. These can be consolidated into comprehensive heartbeat properties.

The following properties represent the unique, non-redundant validation requirements:

### Core Transport Properties

**Property 1: Mode-Based Transport Selection**
*For any* connectivity state (online, offline, hybrid, disconnected) and any message type, the transport router should select the correct transport(s) based on the current mode: online mode uses Supabase only, offline mode uses mesh only, hybrid mode uses both, and disconnected mode queues messages.
**Validates: Requirements 2.1, 2.2, 3.2, 3.3, 5.1, 5.2, 5.3**

**Property 2: Hybrid Mode Dual Delivery**
*For any* message sent in hybrid mode, the message should be delivered via both Supabase and mesh transports, and the send operation should succeed if at least one transport succeeds.
**Validates: Requirements 2.2, 2.8**

**Property 3: Mode Transition Correctness**
*For any* sequence of connectivity changes (internet on/off, mesh on/off), the system should transition to the correct mode and notify all registered listeners of the mode change.
**Validates: Requirements 2.3, 3.4, 3.7, 7.1, 7.2, 7.3**

**Property 4: Message Size Enforcement**
*For any* message transmitted via mesh, if the serialized size exceeds 512 bytes, the system should either compress it to under 512 bytes or split it into chunks, each under 512 bytes.
**Validates: Requirements 1.5, 8.5, 10.2, 10.3**

**Property 5: Message Chunk Round-Trip**
*For any* message that is split into chunks, reassembling the chunks in correct order should produce a message equivalent to the original.
**Validates: Requirements 10.5, 10.6**

### Mesh Networking Properties

**Property 6: Peer Connection Limit**
*For any* number of discovered peers, the system should maintain at most the configured maximum number of concurrent connections (default 8).
**Validates: Requirements 1.7, 8.6**

**Property 7: Payload Validation**
*For any* payload received from a peer, the system should deserialize and validate it before processing, and should discard invalid payloads without crashing.
**Validates: Requirements 1.8, 4.6, 6.7**

**Property 8: Broadcast Delivery**
*For any* message broadcast via nearbyAdapter, all connected peers should receive the payload.
**Validates: Requirements 1.4, 9.4**

**Property 9: Targeted Delivery**
*For any* message sent to a specific endpoint via nearbyAdapter, only that endpoint should receive the payload.
**Validates: Requirements 9.3**

### Error Handling Properties

**Property 10: Retry with Exponential Backoff**
*For any* failed message transmission, the system should retry with exponentially increasing delays (e.g., 1s, 2s, 4s, 8s) up to the maximum retry count.
**Validates: Requirements 6.2**

**Property 11: Message Queue Priority**
*For any* message queue that exceeds capacity, SOS messages should be retained and lower-priority messages should be dropped first.
**Validates: Requirements 6.4**

**Property 12: Graceful Degradation**
*For any* transport that becomes unavailable, the system should queue messages for that transport and continue operating with available transports without crashing.
**Validates: Requirements 6.3, 6.8**

### Heartbeat Properties

**Property 13: Heartbeat Broadcast Interval**
*For any* time period when mesh networking is active, heartbeat messages should be broadcast at regular intervals (30s foreground, 60s background).
**Validates: Requirements 11.1**

**Property 14: Heartbeat Content Completeness**
*For any* heartbeat broadcast, the payload should include device ID, timestamp, battery level, and peer count.
**Validates: Requirements 11.2**

**Property 15: Heartbeat Size Limit**
*For any* heartbeat payload, the serialized size should be less than 1KB (1024 bytes).
**Validates: Requirements 11.2**

**Property 16: Peer Timeout Detection**
*For any* peer that hasn't sent a heartbeat for more than 60 seconds, the system should mark that peer as inactive.
**Validates: Requirements 11.4**

### Battery-Aware Properties

**Property 17: Battery-Aware Discovery Intervals**
*For any* battery level, the system should use the correct discovery interval: 15s for >50%, 30s for 20-50%, 60s for <20%.
**Validates: Requirements 8.2, 8.3, 8.4**

**Property 18: Background Activity Reduction**
*For any* app backgrounding event, the system should reduce mesh activity (increase intervals, reduce connection attempts).
**Validates: Requirements 8.8**

### Data Synchronization Properties

**Property 19: Sync Priority Order**
*For any* set of mesh-only posts being synced to Supabase, SOS posts should be uploaded before WANT posts, and WANT posts before HAVE posts.
**Validates: Requirements 12.2**

**Property 20: Sync Deduplication**
*For any* set of posts being synced that contains duplicates (same post ID), only one instance of each post should be uploaded to Supabase.
**Validates: Requirements 12.7**

**Property 21: Sync Resumption**
*For any* interrupted sync operation, resuming the sync should continue from the last successfully synced post, not restart from the beginning.
**Validates: Requirements 12.6**

### Type Compatibility Properties

**Property 22: Message Serialization Round-Trip**
*For any* valid TransportMessage, serializing then deserializing should produce an equivalent message with all fields preserved.
**Validates: Requirements 4.3**

**Property 23: Type Adapter Correctness**
*For any* message in existing format (SharePost, InterestAck, InterestResponse), converting to TransportMessage format and back should preserve all fields.
**Validates: Requirements 4.1, 4.4**

**Property 24: TTL Expiration**
*For any* message with a TTL, if the current time exceeds (message timestamp + TTL), the message should not be processed.
**Validates: Requirements 4.7**

### Backward Compatibility Properties

**Property 25: Supabase Functionality Preservation**
*For any* operation that worked before integration (create post, express interest, send message, upload image), the operation should continue to work identically after integration when in online mode.
**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7**

### Configuration Properties

**Property 26: Configuration Override**
*For any* configurable parameter (discovery interval, max connections, message size limit, retry backoff), setting a custom value should override the default and be used by the system.
**Validates: Requirements 15.3, 15.4, 15.5, 15.6**

**Property 27: Mesh Disable Configuration**
*For any* configuration where mesh networking is disabled, the system should operate in online-only mode regardless of mesh permissions or connectivity.
**Validates: Requirements 15.2**


## Error Handling

### Transport Failures

**Supabase Transport Errors**:
- Network timeout: Retry with exponential backoff (1s, 2s, 4s, 8s)
- Authentication error: Refresh token and retry once
- Rate limiting: Queue message and retry after rate limit window
- Server error (5xx): Retry with backoff, max 3 attempts

**Mesh Transport Errors**:
- Peer disconnected: Remove from active peers, attempt reconnection after 30s
- Payload too large: Compress or split into chunks
- Send timeout: Retry with backoff, max 3 attempts
- No peers available: Queue message for later broadcast

**Hybrid Mode Failures**:
- If one transport fails, continue with the other
- Log failure for debugging
- Return success if at least one transport succeeds
- Return failure only if both transports fail

### Native Module Errors

**Module Unavailable**:
- Detect at startup: `Platform.OS === 'android' && NativeModules.NearbyConnections != null`
- If unavailable: Disable mesh networking, operate in online-only mode
- Show user notification: "Offline mode unavailable on this device"

**Permission Errors**:
- Bluetooth permission denied: Disable mesh, show permission request UI
- Location permission denied: Disable mesh, show permission request UI
- Handle "never ask again": Show settings deep link

**Connection Errors**:
- Connection rejected: Log and continue discovery
- Connection timeout: Retry after backoff period
- Max connections reached: Queue connection attempt for later

### Message Processing Errors

**Deserialization Errors**:
```typescript
try {
  const message = JSON.parse(payload);
  if (!isValidTransportMessage(message)) {
    throw new Error('Invalid message format');
  }
  processMessage(message);
} catch (error) {
  console.error('[Transport] Failed to process message:', error);
  // Discard invalid message, don't crash
}
```

**Validation Errors**:
- Invalid message type: Log and discard
- Missing required fields: Log and discard
- Expired TTL: Log and discard
- Invalid payload: Log and discard

### Mode Transition Errors

**Transition Failures**:
```typescript
async switchMode(newMode: AppMode) {
  try {
    if (newMode === 'survival') {
      await this.enterSurvivalMode();
    } else if (newMode === 'hybrid') {
      await this.enterHybridMode();
    } else {
      await this.exitSurvivalMode();
    }
  } catch (error) {
    console.error('[Mode Switching] Transition failed:', error);
    // Retry after 5 seconds
    setTimeout(() => this.switchMode(newMode), 5000);
  }
}
```

**Sync Errors**:
- Network error during sync: Retry with backoff
- Partial sync failure: Mark failed posts for retry
- Duplicate detection error: Log and continue
- Interrupted sync: Save progress, resume on next attempt

### Recovery Strategies

**Automatic Recovery**:
1. Retry with exponential backoff for transient errors
2. Queue messages when transport unavailable
3. Reconnect to peers after connection loss
4. Resume interrupted operations from last checkpoint

**Manual Recovery**:
1. User-initiated retry button for failed syncs
2. Clear message queue option in settings
3. Reset mesh networking option
4. Force mode switch option for testing

**Logging and Debugging**:
```typescript
interface ErrorLog {
  timestamp: number;
  component: string;
  operation: string;
  error: string;
  context: Record<string, unknown>;
}

function logError(component: string, operation: string, error: Error, context?: Record<string, unknown>) {
  const log: ErrorLog = {
    timestamp: Date.now(),
    component,
    operation,
    error: error.message,
    context: context || {},
  };
  
  if (config.debugLogging) {
    console.error('[Error]', JSON.stringify(log, null, 2));
  }
  
  // Store in error log for debugging
  errorLogs.push(log);
  
  // Keep only last 100 errors
  if (errorLogs.length > 100) {
    errorLogs.shift();
  }
}
```


## Testing Strategy

### Dual Testing Approach

The integration requires both **unit tests** and **property-based tests** for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific mode transition scenarios
- Error handling for known failure cases
- Integration between components
- Native module event handling
- UI updates and user feedback

**Property-Based Tests**: Verify universal properties across all inputs
- Message routing for all modes and message types
- Size enforcement for all message sizes
- Retry logic for all failure scenarios
- Mode transitions for all connectivity states
- Serialization round-trips for all message types

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each test must reference its design document property
- Tag format: `Feature: knit-backend-integration, Property {number}: {property_text}`

**Example Property Test**:
```typescript
import fc from 'fast-check';

describe('Feature: knit-backend-integration, Property 1: Mode-Based Transport Selection', () => {
  it('should select correct transport(s) for all modes and message types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('online', 'offline', 'hybrid', 'disconnected'),
        fc.constantFrom('share_post', 'interest_ack', 'interest_response', 'heartbeat'),
        fc.record({
          type: fc.constantFrom('share_post', 'interest_ack', 'interest_response'),
          payload: fc.anything(),
        }),
        async (mode, messageType, message) => {
          // Set mode
          setMode(mode);
          
          // Send message
          const result = await send(message);
          
          // Verify correct transport used
          if (mode === 'online') {
            expect(supabaseSendCalled).toBe(true);
            expect(meshSendCalled).toBe(false);
          } else if (mode === 'offline') {
            expect(supabaseSendCalled).toBe(false);
            expect(meshSendCalled).toBe(true);
          } else if (mode === 'hybrid') {
            expect(supabaseSendCalled).toBe(true);
            expect(meshSendCalled).toBe(true);
          } else {
            expect(result.success).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Categories

**1. Mesh Networking Tests**
- Peer discovery and connection
- Payload transmission and reception
- Connection lifecycle events
- Size limit enforcement
- Broadcast vs targeted delivery

**2. Mode Transition Tests**
- Online → Offline transition
- Offline → Online transition
- Hybrid mode activation
- Mode change notifications
- Transition failure recovery

**3. Message Routing Tests**
- Correct transport selection per mode
- Hybrid mode dual delivery
- Message queuing in disconnected mode
- Priority-based queue management

**4. Error Handling Tests**
- Transport failure recovery
- Retry with exponential backoff
- Invalid message handling
- Native module unavailable
- Permission denied scenarios

**5. Heartbeat Tests**
- Broadcast interval correctness
- Payload content completeness
- Size limit enforcement
- Peer timeout detection
- Last-seen timestamp updates

**6. Data Synchronization Tests**
- Mesh to cloud sync
- Priority ordering (SOS first)
- Deduplication
- Interrupted sync resumption
- Sync progress reporting

**7. Backward Compatibility Tests**
- Existing Supabase operations
- Service layer API compatibility
- Type compatibility
- UI component behavior
- End-to-end user flows

**8. Performance Tests**
- Battery consumption monitoring
- Discovery interval adaptation
- Message throughput
- Connection limit enforcement
- Background activity reduction

### Integration Testing

**Multi-Device Testing**:
- Test with 2-8 Android devices
- Verify peer discovery across devices
- Test message propagation through mesh
- Verify gossip protocol hop limiting
- Test network partition healing

**Mode Transition Testing**:
- Simulate connectivity changes
- Verify smooth transitions
- Test data sync after reconnection
- Verify no data loss during transitions

**Stress Testing**:
- High message volume (100+ messages/minute)
- Many peers (8+ concurrent connections)
- Large messages (near 512-byte limit)
- Rapid mode transitions
- Extended offline periods

### Test Environment Setup

**Android Emulator**:
- Not suitable for Nearby Connections testing
- Use for online-only mode testing
- Use for UI and service layer testing

**Physical Devices**:
- Required for mesh networking tests
- Minimum 2 devices for peer testing
- Recommended 4+ devices for mesh propagation
- Android 8.0+ required for Nearby Connections

**Mock Native Module**:
```typescript
// For unit testing without physical devices
const mockNearbyModule = {
  startAdvertising: jest.fn().mockResolvedValue(undefined),
  startDiscovery: jest.fn().mockResolvedValue(undefined),
  stopAll: jest.fn().mockResolvedValue(undefined),
  sendPayload: jest.fn().mockResolvedValue(undefined),
  broadcastPayload: jest.fn().mockResolvedValue(undefined),
};
```

### Continuous Integration

**CI Pipeline**:
1. Run unit tests on every commit
2. Run property-based tests on every PR
3. Run integration tests nightly
4. Run multi-device tests weekly
5. Generate coverage reports

**Coverage Goals**:
- Unit test coverage: >80%
- Property test coverage: All 27 properties
- Integration test coverage: All critical paths
- E2E test coverage: All user flows

