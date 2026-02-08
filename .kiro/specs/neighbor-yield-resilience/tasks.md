# Implementation Plan: NeighborYield Resilience Edition

## Overview

This implementation is divided among 3 team members:
- **Person 1 (Frontend)**: All React Native UI components, screens, and user interactions
- **Person 2 (Transport Layer)**: Nearby Connections adapter, Supabase adapter, Transport Router
- **Person 3 (Business Logic)**: Interest Manager, Presence Manager, TTL Manager, Permission Manager, Battery Manager

## Person 1: Frontend Implementation

### Tasks

- [-] 1. Set up React Native project structure
  - [x] 1.1 Initialize React Native project with TypeScript
    - Configure Metro bundler for Android
    - Set up ESLint and Prettier
    - _Requirements: Project setup_
  
  - [x] 1.2 Create folder structure for components, screens, hooks, and types
    - Create src/components, src/screens, src/hooks, src/types, src/context
    - _Requirements: Project organization_

- [x] 2. Implement Feed Screen UI
  - [x] 2.1 Create SharePostCard component
    - Display title, description, author identifier, risk tier badge
    - Show "posted X min ago" relative time indicator
    - Show warning indicator when TTL < 5 minutes
    - _Requirements: 5.4, 5.5, 6.5_
  
  - [x] 2.2 Create "I'm Interested" button with loading/success states
    - Handle tap to express interest
    - Show pending/success/error states
    - _Requirements: 1.1_
  
  - [x] 2.3 Create FeedList component with pull-to-refresh
    - Render list of SharePostCards
    - Handle empty state
    - Auto-remove expired posts with animation
    - _Requirements: 5.2_
  
  - [x]* 2.4 Write unit tests for SharePostCard time formatting
    - Test relative time display logic
    - Test warning indicator threshold
    - _Requirements: 5.4, 5.5_

- [x] 3. Implement Post Creation Screen
  - [x] 3.1 Create PostCreatorForm component
    - Title and description inputs
    - Risk tier selector (High/Medium/Low) with TTL preview
    - Submit button
    - _Requirements: 6.1_
  
  - [x] 3.2 Create RiskTierPicker component
    - Three options with icons and TTL labels
    - Visual feedback on selection
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Implement Presence Indicator UI
  - [x] 4.1 Create PresenceIndicator component
    - Display "X neighbors in range" or "No neighbors in range"
    - Muted style when no peers
    - Animation on count increase
    - _Requirements: 3.6, 4.1, 4.2, 4.3_
  
  - [x] 4.2 Create PresenceTooltip component
    - Show mesh network status explanation on tap
    - _Requirements: 4.5_
  
  - [x] 4.3 Handle online-only mode display
    - Show "Online mode" when in online-only connectivity
    - _Requirements: 4.4_
  
  - [x]* 4.4 Write property test for peer count display format
    - **Property 11: Peer Count Display Format**
    - **Validates: Requirements 3.6, 4.2**

- [x] 5. Implement Permission Flow UI
  - [x] 5.1 Create PermissionExplanationScreen component
    - Explanatory content for each permission type
    - "Continue" button to trigger system request
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  
  - [x] 5.2 Create PermissionStatusBar component
    - Icons for Bluetooth, Location, Nearby Devices status
    - Warning indicators for denied permissions
    - Tap to navigate to settings or re-request
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 5.3 Create BluetoothDisabledPrompt component
    - Prompt user to enable system Bluetooth
    - _Requirements: 8.4_
  
  - [x]* 5.4 Write property test for permission status visualization
    - **Property 21: Permission Status Visualization**
    - **Validates: Requirements 8.1, 8.2**

- [x] 6. Implement Interest Notification UI
  - [x] 6.1 Create InterestNotificationCard component
    - Show interested user's identifier
    - Accept/Decline buttons
    - _Requirements: 1.4_
  
  - [x] 6.2 Create InterestQueueList component
    - Display all pending interests for poster's posts
    - _Requirements: 1.5_
  
  - [x] 6.3 Create InterestResponseToast component
    - Show response received from poster
    - _Requirements: 2.4_

- [x] 7. Implement Connectivity and Battery UI
  - [x] 7.1 Create ConnectivityBanner component
    - Show current mode (Online/Offline/Hybrid)
    - Warning for disconnected state with instructions
    - _Requirements: 10.4_
  
  - [x] 7.2 Create BackgroundMeshToggle component
    - Settings toggle for background mesh option
    - _Requirements: 9.3_
  
  - [x] 7.3 Create LowBatteryNotice component
    - Notification when battery < 15% disables background mesh
    - _Requirements: 9.5_

- [x] 8. Implement App Context and State Management
  - [x] 8.1 Create AppContext with connectivity mode, permissions, peer count
    - Provide state to all components
    - _Requirements: All UI requirements_
  
  - [x] 8.2 Create custom hooks: useConnectivity, usePermissions, usePeerCount, useTTL
    - Abstract business logic access for UI
    - _Requirements: All UI requirements_

- [ ] 9. Frontend Checkpoint
  - Ensure all UI components render correctly
  - Verify mock data displays properly
  - Ask team if questions arise

---

## Person 2: Transport Layer Implementation

### Tasks

- [ ] 1. Set up transport layer infrastructure
  - [ ] 1.1 Create transport layer folder structure and types
    - Define TransportMessage, ConnectivityMode, MessageType interfaces
    - _Requirements: Transport abstraction_
  
  - [ ] 1.2 Set up Supabase client configuration
    - Initialize Supabase client with environment variables
    - Configure realtime subscriptions
    - _Requirements: Online mode setup_

- [ ] 2. Implement Nearby Connections Adapter
  - [ ] 2.1 Create React Native bridge for Nearby Connections API
    - Native module for Android Nearby Connections
    - Expose start, stop, advertise, discover methods
    - _Requirements: Offline mode foundation_
  
  - [ ] 2.2 Implement advertising and discovery with P2P_CLUSTER strategy
    - Use STRATEGY_P2P_CLUSTER for battery optimization
    - Handle endpoint found/lost events
    - _Requirements: 9.4_
  
  - [ ] 2.3 Implement connection management
    - Request, accept, reject connections
    - Track connected endpoints
    - _Requirements: 2.1, 2.2_
  
  - [ ] 2.4 Implement payload messaging
    - Send payload to specific endpoint
    - Broadcast payload to all connected endpoints
    - Handle incoming payloads
    - _Requirements: 1.3, 2.2_
  
  - [ ]* 2.5 Write property test for P2P Cluster strategy
    - **Property 24: P2P Cluster Strategy**
    - **Validates: Requirements 9.4**

- [ ] 3. Implement Supabase Adapter
  - [ ] 3.1 Implement share post CRUD operations
    - Create, read posts from Supabase
    - Apply client-side TTL filtering
    - _Requirements: 5.7_
  
  - [ ] 3.2 Implement interest operations
    - Send interest, respond to interest via Supabase
    - _Requirements: 1.2, 2.3_
  
  - [ ] 3.3 Implement realtime subscriptions
    - Subscribe to posts channel
    - Subscribe to interests channel for user
    - Subscribe to responses channel for user
    - _Requirements: 1.2, 2.3_
  
  - [ ]* 3.4 Write unit tests for Supabase adapter
    - Test CRUD operations
    - Test subscription setup
    - _Requirements: 1.2, 2.3_

- [ ] 4. Implement Transport Router
  - [ ] 4.1 Create Transport Router with NetInfo integration
    - Monitor network connectivity changes
    - Determine current ConnectivityMode
    - _Requirements: Mode detection_
  
  - [ ] 4.2 Implement message routing logic
    - Route to Supabase for online mode
    - Route to Nearby for offline mode
    - Route to both for hybrid mode
    - _Requirements: 1.2, 1.3, 2.2, 2.3_
  
  - [ ] 4.3 Implement mode change notifications
    - Emit events when connectivity mode changes
    - _Requirements: 2.5_
  
  - [ ]* 4.4 Write property test for transport routing by mode
    - **Property 1: Transport Routing by Connectivity Mode**
    - **Validates: Requirements 1.2, 1.3, 2.2, 2.3**

- [ ] 5. Implement Heartbeat Protocol
  - [ ] 5.1 Define heartbeat payload structure
    - Version, user identifier, timestamp, capabilities
    - Ensure serialization < 1KB
    - _Requirements: 3.4_
  
  - [ ] 5.2 Implement heartbeat serialization/deserialization
    - Compact binary or JSON encoding
    - _Requirements: 3.4_
  
  - [ ]* 5.3 Write property test for heartbeat payload size
    - **Property 10: Heartbeat Payload Size Constraint**
    - **Validates: Requirements 3.4**

- [ ] 6. Transport Layer Checkpoint
  - Ensure Nearby Connections native module works
  - Verify Supabase connection and realtime
  - Test transport routing logic
  - Ask team if questions arise

---

## Person 3: Business Logic Implementation

### Tasks

- [ ] 1. Set up business logic infrastructure
  - [ ] 1.1 Create business logic folder structure and types
    - Define SharePost, InterestAck, InterestResponse, PeerInfo interfaces
    - Define LocalState store structure
    - _Requirements: Data model setup_
  
  - [ ] 1.2 Create user identifier generator
    - Generate pseudonymous IDs like "Neighbor-A3F9"
    - Persist across sessions
    - _Requirements: User_Identifier glossary_

- [ ] 2. Implement TTL Manager
  - [ ] 2.1 Create TTL Manager with post tracking
    - Track posts by ID with expiration timestamps
    - Calculate remaining TTL
    - _Requirements: 5.1, 5.2_
  
  - [ ] 2.2 Implement risk tier to TTL mapping
    - High: 15 min, Medium: 30 min, Low: 60 min
    - Default to medium if not specified
    - _Requirements: 5.3, 6.2, 6.3, 6.4_
  
  - [ ] 2.3 Implement expiration checking and purging
    - isExpired check
    - purgeExpired returns list of removed post IDs
    - _Requirements: 5.2, 5.6_
  
  - [ ] 2.4 Implement expiration event emission
    - Notify subscribers when posts expire
    - _Requirements: 5.2_
  
  - [ ]* 2.5 Write property test for TTL by risk tier
    - **Property 15: TTL by Risk Tier**
    - **Validates: Requirements 5.3, 6.2, 6.3, 6.4**
  
  - [ ]* 2.6 Write property test for expired post removal
    - **Property 14: Expired Post Removal**
    - **Validates: Requirements 5.2**

- [ ] 3. Implement Presence Manager
  - [ ] 3.1 Create Presence Manager with peer tracking
    - Maintain Map of active peers by endpoint ID
    - Track lastSeen timestamps
    - _Requirements: 3.2_
  
  - [ ] 3.2 Implement heartbeat broadcasting
    - Start/stop broadcasting based on mode
    - 15-second interval in foreground
    - _Requirements: 3.1, 3.4_
  
  - [ ] 3.3 Implement peer timeout logic
    - Remove peers after 2 missed intervals (30 seconds)
    - _Requirements: 3.3_
  
  - [ ] 3.4 Implement peer count change notifications
    - Emit events when count changes
    - _Requirements: 3.5_
  
  - [ ]* 3.5 Write property test for peer list addition
    - **Property 8: Peer List Addition on Heartbeat**
    - **Validates: Requirements 3.2**
  
  - [ ]* 3.6 Write property test for peer timeout removal
    - **Property 9: Peer Timeout Removal**
    - **Validates: Requirements 3.3**

- [ ] 4. Implement Interest Manager
  - [ ] 4.1 Create Interest Manager with interest tracking
    - Track outgoing interests (my interests)
    - Track incoming interests by post ID
    - _Requirements: 1.1, 1.5_
  
  - [ ] 4.2 Implement expressInterest with retry logic
    - Create InterestAck
    - Send via Transport Router
    - Non-blocking retries for 30 seconds on failure
    - _Requirements: 1.1, 1.6_
  
  - [ ] 4.3 Implement respondToInterest
    - Create InterestResponse
    - Send via Transport Router
    - _Requirements: 2.4_
  
  - [ ] 4.4 Implement interest queue management
    - Queue multiple interests per post
    - getPendingInterests returns all
    - _Requirements: 1.5_
  
  - [ ]* 4.5 Write property test for interest creation
    - **Property 2: Interest Creation Completeness**
    - **Validates: Requirements 1.1**
  
  - [ ]* 4.6 Write property test for interest queue accumulation
    - **Property 3: Interest Queue Accumulation**
    - **Validates: Requirements 1.5**

- [ ] 5. Implement Permission Manager
  - [ ] 5.1 Create Permission Manager with status tracking
    - Check Bluetooth, Location, Nearby Devices permissions
    - Calculate canUseMesh flag
    - _Requirements: 7.1, 7.6_
  
  - [ ] 5.2 Implement permission request flow
    - Request individual permissions
    - Track explanation shown state
    - _Requirements: 7.2_
  
  - [ ] 5.3 Implement permission change detection
    - Listen for permission state changes
    - Enable mesh dynamically when granted
    - _Requirements: 10.5_
  
  - [ ] 5.4 Implement graceful degradation logic
    - Determine connectivity mode based on permissions
    - Fall back to online-only when mesh unavailable
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 5.5 Write property test for full mesh enablement
    - **Property 20: Full Mesh Enablement**
    - **Validates: Requirements 7.6**
  
  - [ ]* 5.6 Write property test for graceful degradation
    - **Property 26: Graceful Degradation to Online-Only**
    - **Validates: Requirements 10.1, 10.2**

- [ ] 6. Implement Battery Manager
  - [ ] 6.1 Create Battery Manager with lifecycle hooks
    - onAppForeground: resume Nearby
    - onAppBackground: suspend Nearby (unless background mesh enabled)
    - _Requirements: 9.1, 9.2_
  
  - [ ] 6.2 Implement background mesh toggle
    - Store preference
    - Adjust heartbeat interval (60s in background)
    - _Requirements: 9.3_
  
  - [ ] 6.3 Implement low battery detection
    - Monitor battery level
    - Disable background mesh at 15%
    - Emit notification event
    - _Requirements: 9.5_
  
  - [ ]* 6.4 Write property test for background Nearby suspension
    - **Property 22: Background Nearby Suspension**
    - **Validates: Requirements 9.1**
  
  - [ ]* 6.5 Write property test for low battery mesh disable
    - **Property 25: Low Battery Mesh Disable**
    - **Validates: Requirements 9.5**

- [ ] 7. Business Logic Checkpoint
  - Ensure all managers initialize correctly
  - Verify state management works
  - Test manager interactions
  - Ask team if questions arise

---

## Integration Tasks (All Team Members)

- [ ] 8. Wire components together
  - [ ] 8.1 Connect UI components to business logic managers
    - Person 1 integrates with Person 3's managers via hooks
    - _Requirements: All_
  
  - [ ] 8.2 Connect business logic to transport layer
    - Person 3's managers use Person 2's Transport Router
    - _Requirements: All_
  
  - [ ] 8.3 Test end-to-end interest flow
    - Create post → Express interest → Receive notification → Respond
    - _Requirements: 1.1-1.6, 2.1-2.4_
  
  - [ ] 8.4 Test end-to-end presence flow
    - Start app → See peer count → Verify heartbeats
    - _Requirements: 3.1-3.6, 4.1-4.5_

- [ ] 9. Final Integration Checkpoint
  - Ensure all features work together
  - Test online, offline, and hybrid modes
  - Verify permission flow and graceful degradation
  - Ask team if questions arise

## Notes

- Tasks marked with `*` are optional property tests that can be skipped for faster MVP
- Each person can work in parallel on their section
- Integration tasks (8-9) require coordination between all team members
- Checkpoints are sync points where the team should verify progress together
