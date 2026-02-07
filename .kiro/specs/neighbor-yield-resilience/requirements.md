# Requirements Document

## Introduction

NeighborYield: Resilience Edition is a React Native Android app implementing a hybrid resilience network for community food sharing. The app operates in two modes: online (Supabase citywide sync) and offline (Google Nearby Connections local mesh). This spec covers four core features: Claim/Interest Flow, Heartbeat/Presence Indicator, Message TTL, and Battery/Permission Management.

The core innovation is seamless hybrid sync—users can share food and express interest whether connected to the internet or operating purely through local mesh networking with nearby devices.

## Glossary

- **Share_Post**: A broadcast message announcing available food items for sharing
- **Interest_Acknowledgment**: A response from a nearby user expressing desire to claim a share post
- **Nearby_Connections**: Google's peer-to-peer networking API for offline communication
- **Supabase_Client**: The cloud backend client for online synchronization
- **Heartbeat**: A periodic presence broadcast to indicate active listening status
- **Peer_Count**: The number of nearby devices actively participating in the mesh network
- **TTL (Time_To_Live)**: The duration a post remains valid before auto-expiration
- **Risk_Tier**: Classification of food items by perishability (high risk = shorter TTL)
- **Permission_Manager**: Component handling Android runtime permissions for Bluetooth, Location, and Nearby
- **Connectivity_Mode**: Current network state (online, offline, or hybrid)
- **NetInfo**: React Native library for detecting network connectivity status
- **User_Identifier**: A short, locally generated pseudonymous ID (e.g., "Neighbor-A3F9") not tied to personal information

## Requirements

### Requirement 1: Express Interest in Share Posts

**User Story:** As a community member, I want to express interest in available food shares, so that the poster knows someone wants to claim their offering.

#### Acceptance Criteria

1. WHEN a user views a share post and taps the "I'm interested" button, THE Interest_System SHALL create an Interest_Acknowledgment and transmit it to the original poster
2. WHEN the app is in online mode, THE Interest_System SHALL send the Interest_Acknowledgment via Supabase Realtime
3. WHEN the app is in offline mode, THE Interest_System SHALL send the Interest_Acknowledgment via Nearby_Connections to the original poster's device
4. WHEN an Interest_Acknowledgment is received, THE Interest_System SHALL display a notification to the original poster showing the interested user's identifier
5. WHEN multiple users express interest in the same post, THE Interest_System SHALL queue and display all acknowledgments to the poster
6. IF the original poster's device is unreachable in offline mode, THEN THE Interest_System SHALL perform non-blocking retries for up to 30 seconds before notifying the user of failure

### Requirement 2: Two-Way Communication Channel

**User Story:** As a food sharer, I want to receive and respond to interest from nearby users, so that I can coordinate handoff of my shared items.

#### Acceptance Criteria

1. WHEN an Interest_Acknowledgment is received, THE Communication_Channel SHALL establish a bidirectional connection between poster and interested party
2. WHEN a bidirectional connection is established in offline mode, THE Communication_Channel SHALL use Nearby_Connections payload messaging
3. WHEN a bidirectional connection is established in online mode, THE Communication_Channel SHALL use Supabase Realtime channels
4. WHEN the poster responds to an interest, THE Communication_Channel SHALL deliver the response to the interested user
5. IF connectivity mode changes during an active conversation, THEN THE Communication_Channel SHALL attempt best-effort continuity by re-establishing the channel on the available transport

### Requirement 3: Nearby Peer Discovery and Counting

**User Story:** As a user in offline mode, I want to see how many neighbors are actively listening nearby, so that I feel confident my broadcasts will reach someone.

#### Acceptance Criteria

1. WHEN the app enters offline or hybrid mode, THE Presence_System SHALL begin broadcasting periodic heartbeat messages via Nearby_Connections
2. WHEN a heartbeat is received from a nearby device, THE Presence_System SHALL add that device to the active peer list
3. WHEN no heartbeat is received from a device for 2 consecutive intervals, THE Presence_System SHALL remove that device from the active peer list
4. THE Presence_System SHALL broadcast heartbeats every 15 seconds while active, with minimal payload size (<1KB)
5. WHEN the peer count changes, THE Presence_System SHALL update the UI indicator within 1 second
6. THE UI SHALL display the peer count as "X neighbors in range" where X is the current count

### Requirement 4: Presence Indicator Display

**User Story:** As a user, I want to see a visual indicator of nearby active peers, so that the mesh network feels real and trustworthy.

#### Acceptance Criteria

1. WHEN peers are detected, THE Presence_Indicator SHALL display a visible count badge in the main UI
2. WHEN no peers are detected, THE Presence_Indicator SHALL display "No neighbors in range" with a muted visual style
3. WHEN the peer count increases, THE Presence_Indicator SHALL briefly animate to draw attention
4. WHILE the app is in online-only mode, THE Presence_Indicator SHALL be hidden or show "Online mode"
5. WHEN tapped, THE Presence_Indicator SHALL show a tooltip explaining the mesh network status

### Requirement 5: Post Expiration with TTL

**User Story:** As a user browsing shares, I want stale posts to automatically disappear, so that I only see currently available offerings.

#### Acceptance Criteria

1. WHEN a share post is created, THE TTL_System SHALL assign a default TTL of 30 minutes for local broadcasts
2. WHEN a share post's TTL expires, THE TTL_System SHALL remove it from the local feed
3. THE TTL_System SHALL support configurable TTL values: 15 minutes (high risk), 30 minutes (medium risk), 60 minutes (low risk)
4. WHEN displaying a post, THE UI SHALL show a "posted X min ago" indicator
5. WHEN a post has less than 5 minutes remaining, THE UI SHALL display a visual warning indicator (e.g., color change or countdown)
6. WHEN the app resumes from background, THE TTL_System SHALL immediately purge all expired posts
7. FOR online posts synced via Supabase, TTL SHALL be enforced client-side; backend cleanup policies are a future enhancement

### Requirement 6: Risk-Based TTL Configuration

**User Story:** As a food sharer, I want to set appropriate expiration times based on food perishability, so that high-risk items don't linger in the feed.

#### Acceptance Criteria

1. WHEN creating a share post, THE Post_Creator SHALL allow selection of risk tier (High, Medium, Low)
2. WHEN High risk tier is selected, THE TTL_System SHALL set TTL to 15 minutes
3. WHEN Medium risk tier is selected, THE TTL_System SHALL set TTL to 30 minutes
4. WHEN Low risk tier is selected, THE TTL_System SHALL set TTL to 60 minutes
5. THE UI SHALL display the risk tier alongside the TTL indicator on each post

### Requirement 7: Permission Request Flow

**User Story:** As a new user, I want clear guidance through permission requests, so that I understand why each permission is needed and can make informed choices.

#### Acceptance Criteria

1. WHEN the app launches for the first time, THE Permission_Manager SHALL check current permission status for Bluetooth, Location, and Nearby Devices
2. WHEN a required permission is not granted, THE Permission_Manager SHALL display an explanatory screen before requesting the permission
3. WHEN requesting Bluetooth permission, THE Permission_Manager SHALL explain it enables device-to-device communication
4. WHEN requesting Location permission, THE Permission_Manager SHALL explain it is required by Android for Nearby Connections discovery
5. WHEN requesting Nearby Devices permission, THE Permission_Manager SHALL explain it enables finding neighbors for food sharing
6. WHEN all permissions are granted, THE Permission_Manager SHALL enable full offline mesh functionality

### Requirement 8: Permission Status Indicators

**User Story:** As a user, I want to see which permissions are active, so that I understand the app's current capabilities.

#### Acceptance Criteria

1. THE Permission_Status_UI SHALL display icons indicating granted/denied status for each permission
2. WHEN a permission is denied, THE Permission_Status_UI SHALL show a warning indicator and explain reduced functionality
3. WHEN tapped, THE Permission_Status_UI SHALL navigate to the permission settings or re-request flow
4. WHEN Bluetooth is disabled at system level, THE Permission_Status_UI SHALL prompt user to enable it

### Requirement 9: Battery-Optimized Nearby Connections

**User Story:** As a user, I want the app to conserve battery while still participating in the mesh network, so that I can use it throughout the day.

#### Acceptance Criteria

1. WHEN the app moves to background, THE Battery_Manager SHALL stop Nearby_Connections advertising and discovery by default
2. WHEN the app returns to foreground, THE Battery_Manager SHALL resume Nearby_Connections within 2 seconds
3. WHERE the user enables "Background Mesh" option, THE Battery_Manager SHALL maintain Nearby_Connections in background with reduced heartbeat frequency (every 60 seconds)
4. THE Battery_Manager SHALL use Nearby_Connections STRATEGY_P2P_CLUSTER for optimal battery usage
5. WHEN battery level falls below 15%, THE Battery_Manager SHALL automatically disable background mesh and notify the user

### Requirement 10: Graceful Degradation

**User Story:** As a user with limited permissions, I want the app to still function in a reduced capacity, so that I can participate even without full mesh capabilities.

#### Acceptance Criteria

1. IF Bluetooth permission is denied, THEN THE App SHALL operate in online-only mode and display a notice
2. IF Location permission is denied, THEN THE App SHALL operate in online-only mode and display a notice
3. IF all mesh permissions are denied but internet is available, THEN THE App SHALL function fully via Supabase
4. IF all mesh permissions are denied and internet is unavailable, THEN THE App SHALL display an offline notice with instructions to enable permissions or connect to internet
5. WHEN permissions are later granted, THE App SHALL automatically enable mesh functionality without requiring restart
