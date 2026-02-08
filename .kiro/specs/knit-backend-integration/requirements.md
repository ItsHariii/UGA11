# Requirements Document: Knit Backend Integration

## Introduction

This document specifies the requirements for integrating the knit backend transport layer into NeighborYield. The knit backend is a production-ready dual-mode transport layer that provides intelligent message routing between online (Supabase) and offline (Nearby Connections) transports. This integration will enable functional offline mesh networking and hybrid connectivity modes for NeighborYield.

The integration follows a phased hybrid approach:
- **Phase 1**: Adopt mesh networking (nearbyAdapter)
- **Phase 2**: Add hybrid mode support
- **Phase 3** (Optional): Full transport layer unification

## Glossary

- **Transport_Layer**: The system responsible for message transmission and routing between online and offline modes
- **Nearby_Adapter**: The Android Nearby Connections integration module that enables Bluetooth mesh networking
- **Transport_Router**: The unified mode management system that selects appropriate transports based on connectivity
- **Hybrid_Mode**: A connectivity mode where both online (Supabase) and offline (mesh) transports are active simultaneously
- **Gossip_Service**: The peer-to-peer message propagation service that broadcasts messages through the mesh network
- **Mode_Switching_Service**: The service that manages transitions between abundance (online) and survival (offline) modes
- **Supabase_Transport**: The existing online transport layer using Supabase for cloud-based messaging
- **Mesh_Network**: The peer-to-peer Bluetooth network formed by nearby devices
- **Heartbeat_System**: The presence and peer discovery system that broadcasts device availability
- **Message_Router**: The component that determines which transport(s) to use for message delivery
- **Native_Module**: The Android Kotlin module (NearbyConnectionsModule) that interfaces with Android Nearby Connections API
- **Service_Layer**: The existing NeighborYield services (posts.service, interests.service, messaging.service)
- **Transport_Message**: The unified message format used across all transport mechanisms

## Requirements

### Requirement 1: Mesh Networking Integration (Phase 1)

**User Story:** As a NeighborYield user, I want to communicate with nearby neighbors via Bluetooth mesh networking when internet is unavailable, so that I can share resources during connectivity outages.

#### Acceptance Criteria

1. WHEN the nearbyAdapter module is integrated, THE System SHALL provide production-ready Android Nearby Connections functionality
2. WHEN the Android NearbyConnectionsModule native module is implemented, THE System SHALL enable peer discovery, connection management, and payload transmission
3. WHEN bluetooth.service.ts stub is replaced with nearbyAdapter, THE System SHALL support functional mesh networking operations
4. WHEN gossip.service.ts is connected to nearbyAdapter, THE System SHALL transmit messages through the mesh network
5. WHEN a message is transmitted via mesh, THE System SHALL respect the 512-byte message size limit
6. WHEN connection lifecycle events occur (peer discovered, connected, disconnected), THE System SHALL handle them gracefully and update peer state
7. WHEN a peer is discovered, THE System SHALL attempt connection if under the maximum connection limit
8. WHEN a payload is received from a peer, THE System SHALL deserialize and validate it before processing

### Requirement 2: Hybrid Mode Support (Phase 2)

**User Story:** As a NeighborYield user, I want messages to be sent via both cloud and mesh when both are available, so that I have maximum reliability and resilience in message delivery.

#### Acceptance Criteria

1. WHEN both internet and mesh connectivity are available, THE System SHALL enable hybrid mode
2. WHEN hybrid mode is active, THE System SHALL broadcast messages simultaneously to both Supabase and mesh transports
3. WHEN mode-switching.service.ts detects hybrid connectivity, THE System SHALL transition to hybrid mode automatically
4. WHEN the heartbeat system is active, THE System SHALL broadcast presence information to nearby peers
5. WHEN connectivity changes from online-only to hybrid, THE System SHALL enable mesh transport without disrupting online operations
6. WHEN connectivity changes from hybrid to online-only, THE System SHALL disable mesh transport gracefully
7. WHEN connectivity changes from hybrid to offline-only, THE System SHALL disable online transport and rely on mesh
8. WHEN a message is sent in hybrid mode, THE System SHALL confirm delivery via at least one transport

### Requirement 3: Transport Router Integration

**User Story:** As a developer, I want unified mode management through the transport router, so that connectivity mode detection and transport selection are handled automatically.

#### Acceptance Criteria

1. WHEN transportRouter.ts is integrated, THE System SHALL provide unified mode management
2. WHEN connectivity is detected, THE System SHALL classify it as one of four modes: online, offline, hybrid, or disconnected
3. WHEN transport selection is needed, THE System SHALL automatically choose the appropriate transport(s) based on current mode
4. WHEN NetInfo reports connectivity changes, THE System SHALL update the current mode accordingly
5. WHEN mesh permissions are granted, THE System SHALL enable mesh capability detection
6. WHEN mesh permissions are denied, THE System SHALL disable mesh transport and operate in online-only mode
7. WHEN mode changes occur, THE System SHALL notify registered listeners of the mode transition
8. WHEN the System is in disconnected mode (no connectivity), THE System SHALL queue messages for later transmission

### Requirement 4: Type System Compatibility

**User Story:** As a developer, I want type compatibility between existing NeighborYield types and knit backend types, so that integration is seamless and type-safe.

#### Acceptance Criteria

1. WHEN TransportMessage type is used, THE System SHALL support all existing message types (SharePost, InterestAck, InterestResponse)
2. WHEN HeartbeatPayload type is added, THE System SHALL support presence broadcasting
3. WHEN messages are serialized, THE System SHALL maintain backward compatibility with existing service layer types
4. WHEN type conversions are needed, THE System SHALL provide adapter functions between formats
5. WHEN new message types are added, THE System SHALL extend the MessageType union type
6. WHEN payload validation occurs, THE System SHALL verify type correctness before processing
7. WHEN TTL (time-to-live) is specified, THE System SHALL respect message expiration times

### Requirement 5: Service Layer Integration

**User Story:** As a developer, I want the knit backend to integrate with existing services, so that current functionality is preserved while gaining mesh networking capabilities.

#### Acceptance Criteria

1. WHEN posts.service.ts sends a post, THE System SHALL route it through the appropriate transport based on current mode
2. WHEN interests.service.ts expresses interest, THE System SHALL deliver it via available transport(s)
3. WHEN messaging.service.ts sends a message, THE System SHALL use the transport router for delivery
4. WHEN realtime subscriptions are active, THE System SHALL receive updates from both Supabase and mesh transports
5. WHEN service APIs are called, THE System SHALL maintain existing function signatures for backward compatibility
6. WHEN a message is received from any transport, THE System SHALL deliver it to the appropriate service handler
7. WHEN mode transitions occur, THE System SHALL ensure service layer operations continue without interruption

### Requirement 6: Error Handling and Resilience

**User Story:** As a NeighborYield user, I want the system to handle transport failures gracefully, so that temporary connectivity issues don't cause data loss or crashes.

#### Acceptance Criteria

1. WHEN a transport operation fails, THE System SHALL log the error and attempt recovery
2. WHEN message transmission fails, THE System SHALL implement retry logic with exponential backoff
3. WHEN a transport becomes unavailable, THE System SHALL queue messages for later transmission
4. WHEN the message queue exceeds capacity, THE System SHALL prioritize SOS messages and drop lower-priority messages
5. WHEN an error occurs, THE System SHALL provide clear error messages for debugging
6. WHEN a peer connection is lost, THE System SHALL attempt reconnection after a backoff period
7. WHEN message deserialization fails, THE System SHALL log the error and discard the invalid message
8. WHEN the native module is unavailable, THE System SHALL gracefully degrade to online-only mode

### Requirement 7: Mode Transition Behavior

**User Story:** As a NeighborYield user, I want automatic mode switching based on connectivity, so that I don't have to manually manage online/offline transitions.

#### Acceptance Criteria

1. WHEN internet connectivity is lost, THE System SHALL transition from online mode to offline mode
2. WHEN internet connectivity is restored, THE System SHALL transition from offline mode to online mode
3. WHEN both internet and mesh are available, THE System SHALL transition to hybrid mode
4. WHEN transitioning to offline mode, THE System SHALL enable mesh networking and broadcast local posts
5. WHEN transitioning to online mode, THE System SHALL sync mesh data to Supabase
6. WHEN transitioning to hybrid mode, THE System SHALL enable both transports simultaneously
7. WHEN mode transitions occur, THE System SHALL update UI indicators to reflect current connectivity state
8. WHEN a mode transition fails, THE System SHALL retry the transition after a delay

### Requirement 8: Performance and Optimization

**User Story:** As a NeighborYield user, I want mesh networking to have minimal battery impact, so that I can use the app for extended periods during emergencies.

#### Acceptance Criteria

1. WHEN mesh networking is active, THE System SHALL minimize battery consumption through efficient discovery intervals
2. WHEN battery level is above 50%, THE System SHALL use 15-second discovery intervals
3. WHEN battery level is between 20-50%, THE System SHALL use 30-second discovery intervals
4. WHEN battery level is below 20%, THE System SHALL use 60-second discovery intervals
5. WHEN messages exceed 512 bytes, THE System SHALL compress or split them before transmission
6. WHEN peer discovery runs, THE System SHALL limit the number of concurrent connections to 8 peers
7. WHEN background tasks are needed, THE System SHALL use efficient scheduling to minimize wake-ups
8. WHEN the app is backgrounded, THE System SHALL reduce mesh activity to conserve battery

### Requirement 9: Native Module Implementation

**User Story:** As a developer, I want the Android NearbyConnectionsModule to provide reliable Bluetooth mesh functionality, so that offline communication works consistently.

#### Acceptance Criteria

1. WHEN startAdvertising is called, THE Native_Module SHALL advertise the device for peer discovery
2. WHEN startDiscovery is called, THE Native_Module SHALL scan for nearby advertising devices
3. WHEN sendPayload is called with an endpoint ID, THE Native_Module SHALL transmit the payload to that specific peer
4. WHEN broadcastPayload is called, THE Native_Module SHALL transmit the payload to all connected peers
5. WHEN a payload is received, THE Native_Module SHALL emit an onPayloadReceived event with the payload data
6. WHEN an endpoint is discovered, THE Native_Module SHALL emit an onEndpointFound event with endpoint information
7. WHEN an endpoint is lost, THE Native_Module SHALL emit an onEndpointLost event with the endpoint ID
8. WHEN connection state changes, THE Native_Module SHALL emit appropriate connection events

### Requirement 10: Message Size Management

**User Story:** As a developer, I want automatic message size management, so that Bluetooth transmission limits are respected without manual intervention.

#### Acceptance Criteria

1. WHEN a message is prepared for mesh transmission, THE System SHALL calculate its serialized size
2. WHEN a message exceeds 512 bytes, THE System SHALL compress it using a compression algorithm
3. WHEN a compressed message still exceeds 512 bytes, THE System SHALL split it into multiple chunks
4. WHEN message chunks are transmitted, THE System SHALL include chunk metadata (sequence number, total chunks)
5. WHEN message chunks are received, THE System SHALL reassemble them in correct order
6. WHEN all chunks are received, THE System SHALL validate the complete message before processing
7. WHEN chunk reassembly times out, THE System SHALL discard incomplete messages and request retransmission

### Requirement 11: Heartbeat and Presence System

**User Story:** As a NeighborYield user, I want to see which neighbors are nearby and available, so that I know who I can communicate with in offline mode.

#### Acceptance Criteria

1. WHEN mesh networking is active, THE System SHALL broadcast heartbeat messages at regular intervals
2. WHEN a heartbeat is broadcast, THE System SHALL include device ID, timestamp, battery level, and peer count
3. WHEN a heartbeat is received, THE System SHALL update the peer's last-seen timestamp
4. WHEN a peer hasn't sent a heartbeat for 60 seconds, THE System SHALL mark them as inactive
5. WHEN a peer becomes active again, THE System SHALL restore their active status
6. WHEN peer count changes, THE System SHALL update UI indicators showing nearby neighbor count
7. WHEN battery level is included in heartbeat, THE System SHALL use it for peer health monitoring

### Requirement 12: Data Synchronization

**User Story:** As a NeighborYield user, I want mesh data to sync to the cloud when connectivity is restored, so that my offline activity is preserved and shared with the broader community.

#### Acceptance Criteria

1. WHEN transitioning from offline to online mode, THE System SHALL identify all mesh-only posts
2. WHEN mesh posts are identified, THE System SHALL upload them to Supabase in priority order (SOS first)
3. WHEN sync is in progress, THE System SHALL display sync progress to the user
4. WHEN sync completes successfully, THE System SHALL mark synced posts as cloud-backed
5. WHEN sync fails, THE System SHALL retry with exponential backoff
6. WHEN sync is interrupted, THE System SHALL resume from the last successful sync point
7. WHEN duplicate posts are detected during sync, THE System SHALL deduplicate based on post ID

### Requirement 13: Testing and Validation

**User Story:** As a developer, I want comprehensive testing of mesh networking functionality, so that I can verify correct behavior across different scenarios.

#### Acceptance Criteria

1. WHEN mesh networking tests run, THE System SHALL verify message transmission between multiple devices
2. WHEN mode transition tests run, THE System SHALL verify correct behavior for all mode transitions
3. WHEN message size tests run, THE System SHALL verify handling of messages at and above the 512-byte limit
4. WHEN peer discovery tests run, THE System SHALL verify correct peer connection and disconnection
5. WHEN error handling tests run, THE System SHALL verify graceful degradation when transports fail
6. WHEN backward compatibility tests run, THE System SHALL verify existing features continue to work
7. WHEN integration tests run, THE System SHALL verify end-to-end message flow from sender to receiver

### Requirement 14: Backward Compatibility

**User Story:** As a NeighborYield user, I want existing features to continue working after the integration, so that I don't lose functionality during the upgrade.

#### Acceptance Criteria

1. WHEN the knit backend is integrated, THE System SHALL maintain all existing Supabase functionality
2. WHEN posts are created in online mode, THE System SHALL store them in Supabase with full schema support
3. WHEN interests are expressed, THE System SHALL create conversation threads as before
4. WHEN messages are sent, THE System SHALL use the existing messaging service for online delivery
5. WHEN image uploads occur, THE System SHALL continue using Supabase storage
6. WHEN AI analysis runs, THE System SHALL continue using the Gemini API integration
7. WHEN the app is used in online-only mode, THE System SHALL behave identically to pre-integration behavior

### Requirement 15: Configuration and Feature Flags

**User Story:** As a developer, I want configuration options for the knit backend integration, so that I can enable/disable features and tune performance parameters.

#### Acceptance Criteria

1. WHEN the app starts, THE System SHALL read configuration for mesh networking enable/disable
2. WHEN mesh networking is disabled via config, THE System SHALL operate in online-only mode
3. WHEN discovery intervals are configured, THE System SHALL use the specified intervals instead of defaults
4. WHEN max connections are configured, THE System SHALL respect the connection limit
5. WHEN message size limits are configured, THE System SHALL enforce the specified limits
6. WHEN retry parameters are configured, THE System SHALL use the specified backoff intervals
7. WHEN debug logging is enabled, THE System SHALL output detailed transport layer logs
