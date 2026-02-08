# Requirements Document: Survival Mode Simplification

## Introduction

This document defines requirements for simplifying the Knit app's offline/survival mode into a tactical, battery-efficient "Digital Bulletin Board" interface. When internet connectivity is lost, the UI transforms into a high-contrast, minimal interface optimized for mesh networking via Bluetooth with house number-based coordination.

## Design Philosophy

**"Digital Bulletin Board"** - When the internet is down, shift from a rich marketplace to a high-contrast, text-only tactical interface focused on essential community coordination.

## Glossary

- **Survival_Mode**: Offline mode activated when internet connectivity is lost
- **Abundance_Mode**: Normal online mode with full features
- **Connectivity_Island**: Simplified header showing mesh network status
- **Community_Board**: Two-tab interface (Have & Want)
- **SOS_Board**: Emergency help requests
- **House_Number**: Physical address identifier for pickup coordination
- **Coming_ACK**: 1-byte acknowledgment signal sent via Bluetooth
- **Gossip_Protocol**: Peer-to-peer message propagation via Bluetooth
- **Sticky_Message**: High-priority SOS message that persists at top of feed

## Current State Analysis

### What Works
- ✅ Dual mode system (online/offline) already exists
- ✅ Theme switching (abundance/survival) implemented
- ✅ Mesh networking concepts in place
- ✅ Post and interest data structures defined

### What Needs Simplification
- ❌ Complex 5-tab navigation (feed, map, create, messages, settings)
- ❌ Rich UI with animations and images
- ❌ Detailed post cards with descriptions
- ❌ Interest/response flow too complex for offline
- ❌ No battery-aware behavior
- ❌ No house number-based coordination

## Requirements

### Requirement 1: Simplified Connectivity Island

**User Story:** As a user in survival mode, I want a minimal header that shows my mesh network status, so I can quickly see if I'm connected to neighbors.

#### Acceptance Criteria

1. THE Connectivity_Island SHALL replace the full header in survival mode
2. THE Connectivity_Island SHALL show two states:
   - Searching: Slow dim pulse animation (low energy)
   - Connected: Solid indicator with peer count
3. THE Connectivity_Island SHALL display peer count (e.g., "3 neighbors")
4. THE Connectivity_Island SHALL use minimal animations (< 30fps)
5. THE Connectivity_Island SHALL be 48px height (reduced from 60px)
6. THE Connectivity_Island SHALL use system fonts only
7. THE Connectivity_Island SHALL have dark background (#0D1210)
8. THE Connectivity_Island SHALL show last sync time
9. THE Connectivity_Island SHALL be tappable to show connection details
10. THE Connectivity_Island SHALL use OLED-friendly colors (pure black)

### Requirement 2: Two-Tab Interface

**User Story:** As a user in survival mode, I want a simple two-tab interface, so I can quickly switch between community resources and emergency help.

#### Acceptance Criteria

1. THE interface SHALL have exactly 2 tabs: "Community Board" and "SOS"
2. THE tabs SHALL be displayed as a segmented control below the island
3. THE tabs SHALL use high-contrast colors (white text on dark)
4. THE active tab SHALL have a subtle underline indicator
5. THE tabs SHALL have 44px minimum touch target
6. THE tabs SHALL use system font, 16px, weight 600
7. THE tab switch SHALL have no animation (instant)
8. THE tabs SHALL persist scroll position when switching
9. THE tabs SHALL show unread count badges for SOS
10. THE tabs SHALL be keyboard accessible

### Requirement 3: Community Board - Have Section

**User Story:** As a user with resources, I want to post what I have with my house number, so neighbors can come pick it up without complex coordination.

#### Acceptance Criteria

1. THE Have post SHALL display format: "[ITEM] - House #[NUMBER] - [TIME]"
2. THE Have post SHALL be text-only (no images)
3. THE Have post SHALL use monospace font for house numbers
4. THE Have post SHALL show relative time (e.g., "10m ago", "2h ago")
5. THE Have post SHALL be maximum 512 bytes when serialized
6. THE Have post SHALL have white text on dark background
7. THE Have post SHALL have 16px padding
8. THE Have post SHALL have 1px separator line
9. THE Have post SHALL be tappable to show full details
10. THE Have post SHALL show "CLAIMED" badge if taken

### Requirement 4: Community Board - Want Section

**User Story:** As a user who needs something, I want to post what I need with my house number, so neighbors can respond simply.

#### Acceptance Criteria

1. THE Want post SHALL display format: "[ITEM NEEDED] - House #[NUMBER] - [TIME]"
2. THE Want post SHALL have a "Coming" button
3. THE "Coming" button SHALL send 1-byte ACK via Bluetooth
4. THE Want post SHALL allow leaving a reply with house number
5. THE Want post SHALL show count of "Coming" responses
6. THE Want post SHALL highlight when someone is coming (green indicator)
7. THE Want post SHALL be maximum 512 bytes when serialized
8. THE Want post SHALL use high-contrast colors
9. THE Want post SHALL show response house numbers
10. THE Want post SHALL auto-expire after 24 hours

### Requirement 5: SOS / Help Board

**User Story:** As a user with an emergency, I want to post urgent help requests that stay visible to all neighbors, so I can get immediate assistance.

#### Acceptance Criteria

1. THE SOS post SHALL be "sticky" (stays at top of all neighbor feeds)
2. THE SOS post SHALL have red accent color (#FF5252)
3. THE SOS post SHALL display format: "[EMERGENCY] - House #[NUMBER] - [TIME]"
4. THE SOS post SHALL have "Responding" button
5. THE SOS post SHALL show list of responders with house numbers
6. THE SOS post SHALL have highest Bluetooth broadcast priority
7. THE SOS post SHALL be maximum 512 bytes when serialized
8. THE SOS post SHALL persist until marked resolved
9. THE SOS post SHALL have alert icon (⚠️)
10. THE SOS post SHALL support categories: Medical, Safety, Fire, Other

### Requirement 6: Battery-Aware Behavior

**User Story:** As a user in survival mode, I want the app to conserve battery automatically, so my phone lasts longer during an outage.

#### Acceptance Criteria

1. THE app SHALL monitor battery level continuously
2. THE app SHALL adjust Bluetooth discovery interval based on battery:
   - > 50%: 15 second interval
   - 20-50%: 30 second interval
   - < 20%: 60 second interval
3. THE app SHALL disable all animations when battery < 20%
4. THE app SHALL use pure black backgrounds (OLED optimization)
5. THE app SHALL reduce screen brightness recommendation when battery < 30%
6. THE app SHALL show battery level in connectivity island
7. THE app SHALL pause non-critical background tasks when battery < 20%
8. THE app SHALL notify user when entering power-save mode
9. THE app SHALL allow manual override of power-save settings
10. THE app SHALL log battery usage metrics

### Requirement 7: Minimal Data Model

**User Story:** As a developer, I want a simplified data model optimized for Bluetooth transmission, so messages transfer quickly and reliably.

#### Acceptance Criteria

1. EACH post SHALL be under 512 bytes when serialized
2. THE post SHALL use compact JSON format
3. THE post SHALL include: type, item, houseNumber, timestamp, id
4. THE post SHALL use abbreviated field names (t, i, h, ts, id)
5. THE post SHALL compress timestamps to Unix epoch seconds
6. THE post SHALL use UTF-8 encoding
7. THE post SHALL validate size before transmission
8. THE post SHALL truncate item description if needed
9. THE post SHALL use integer house numbers only
10. THE post SHALL include protocol version number

### Requirement 8: Simplified Post Creation

**User Story:** As a user in survival mode, I want to quickly post items without complex forms, so I can share resources fast.

#### Acceptance Criteria

1. THE create post form SHALL have 3 fields: Type, Item, House Number
2. THE Type SHALL be dropdown: "Have" or "Want" or "SOS"
3. THE Item SHALL be single-line text input (max 100 chars)
4. THE House Number SHALL be numeric input only
5. THE form SHALL have no photo upload
6. THE form SHALL have no description field
7. THE form SHALL have no risk tier selection
8. THE form SHALL submit in < 1 second
9. THE form SHALL validate house number format
10. THE form SHALL show character count for item

### Requirement 9: Gossip Protocol Integration

**User Story:** As a user, I want my posts to propagate to all nearby neighbors automatically, so everyone stays informed without manual syncing.

#### Acceptance Criteria

1. THE app SHALL broadcast local post list to all connected peers
2. THE app SHALL merge received posts with local list
3. THE app SHALL deduplicate posts by ID
4. THE app SHALL prioritize SOS messages in broadcast queue
5. THE app SHALL use exponential backoff for retries
6. THE app SHALL track message hop count (max 5 hops)
7. THE app SHALL timestamp last sync per peer
8. THE app SHALL handle network partitions gracefully
9. THE app SHALL compress post list before transmission
10. THE app SHALL validate received posts before merging

### Requirement 10: Visual Design - Tactical UI

**User Story:** As a user in survival mode, I want a high-contrast, readable interface, so I can use the app in any lighting condition.

#### Acceptance Criteria

1. THE background SHALL be pure black (#000000) for OLED
2. THE text SHALL be white (#FFFFFF) or light gray (#E8E8E8)
3. THE accents SHALL be: Green (#4AEDC4), Red (#FF5252), Yellow (#FFAB00)
4. THE fonts SHALL be system default only (no custom fonts)
5. THE font sizes SHALL be: Body 16px, Header 20px, Small 14px
6. THE line height SHALL be 1.5 for readability
7. THE touch targets SHALL be minimum 44px
8. THE separators SHALL be 1px solid #2A2A2A
9. THE cards SHALL have no shadows or elevation
10. THE interface SHALL pass WCAG AAA contrast requirements

## Technical Constraints

### Data Serialization
```typescript
interface SurvivalPost {
  t: 'h' | 'w' | 's';  // type: have, want, sos
  i: string;            // item (max 100 chars)
  h: number;            // house number
  ts: number;           // timestamp (Unix seconds)
  id: string;           // unique ID (8 chars)
  r?: string[];         // responders (house numbers)
}

// Max size: 512 bytes
```

### Battery Thresholds
- **High (>50%)**: Full functionality, 15s discovery
- **Medium (20-50%)**: Reduced animations, 30s discovery
- **Low (<20%)**: Minimal UI, 60s discovery, no animations

### Bluetooth Constraints
- Message size: 512 bytes max
- Discovery interval: 15-60 seconds (battery-dependent)
- Max concurrent connections: 8 peers
- Broadcast priority: SOS > Want > Have

## Success Metrics

- Post creation time < 5 seconds
- Message propagation to 3 hops < 30 seconds
- Battery drain < 5% per hour in survival mode
- UI response time < 100ms
- Zero data loss during mode switching
- 100% offline functionality

## Out of Scope

- Photo uploads in survival mode
- Real-time chat (use simple messages instead)
- Map view (text-only list)
- Complex animations
- Rich media content
- Cloud sync during outage

## Mode Switching Behavior

### Online → Offline (Entering Survival Mode)
1. Detect connectivity loss
2. Switch to survival theme (dark)
3. Simplify UI to 2 tabs
4. Enable Bluetooth mesh
5. Show survival mode banner
6. Sync local data to mesh

### Offline → Online (Exiting Survival Mode)
1. Detect connectivity restored
2. Sync mesh data to cloud
3. Switch to abundance theme
4. Restore full UI (5 tabs)
5. Disable Bluetooth mesh (optional)
6. Show sync progress

## Compatibility

- Must coexist with abundance mode
- Must share same data models (with extensions)
- Must preserve user preferences
- Must handle mode switching gracefully
- Must maintain authentication state

