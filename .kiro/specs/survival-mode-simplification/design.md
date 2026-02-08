# Design Document: Survival Mode Simplification

## Overview

This document provides the technical design for transforming NeighborYield's offline mode into a simplified, battery-efficient "Digital Bulletin Board" interface. The design focuses on minimal UI, house number-based coordination, and efficient Bluetooth mesh networking.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    App.tsx (Root)                       │
│  - Mode Detection (online/offline)                      │
│  - Theme Switching (abundance/survival)                 │
│  - Navigation Control (5-tab vs 2-tab)                  │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐      ┌──────▼──────┐
        │ Abundance Mode │      │ Survival    │
        │ (5 tabs)       │      │ Mode (2 tab)│
        └────────────────┘      └──────┬──────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
            ┌───────▼────────┐ ┌──────▼──────┐  ┌───────▼────────┐
            │ Connectivity   │ │ Community   │  │ SOS Board      │
            │ Island         │ │ Board       │  │                │
            │ (Simplified)   │ │ (Have/Want) │  │ (Emergency)    │
            └────────────────┘ └─────────────┘  └────────────────┘
```

### Component Hierarchy

```
SurvivalMode/
├── SurvivalConnectivityIsland
│   ├── StatusIndicator (searching/connected)
│   ├── PeerCountBadge
│   └── BatteryIndicator
├── SurvivalTabBar
│   ├── CommunityTab
│   └── SOSTab
├── CommunityBoard
│   ├── HaveSection
│   │   └── HavePostCard[]
│   └── WantSection
│       └── WantPostCard[]
│           └── ComingButton
└── SOSBoard
    └── SOSPostCard[]
        └── RespondingButton
```

## Data Model

### Survival Post Interface

**Requirements: 7.1-7.10**

```typescript
/**
 * Compact post format optimized for Bluetooth transmission
 * Maximum size: 512 bytes when serialized
 */
interface SurvivalPost {
  t: 'h' | 'w' | 's';  // type: have, want, sos
  i: string;            // item description (max 100 chars)
  h: number;            // house number
  ts: number;           // timestamp (Unix seconds)
  id: string;           // unique ID (8 chars, base64)
  r?: string[];         // responders (house numbers as strings)
  c?: string;           // category for SOS ('m'|'s'|'f'|'o')
  resolved?: boolean;   // SOS resolution status
}

/**
 * Example serialized size calculation:
 * {
 *   "t": "h",
 *   "i": "Fresh tomatoes",
 *   "h": 123,
 *   "ts": 1709856000,
 *   "id": "a1b2c3d4",
 *   "r": ["124", "125"]
 * }
 * Size: ~120 bytes (well under 512 byte limit)
 */
```

### Coming ACK Message

**Requirements: 4.3**

```typescript
/**
 * Minimal 1-byte acknowledgment for "Coming" button
 * Sent via Bluetooth when user indicates they're coming
 */
interface ComingAck {
  postId: string;      // 8 chars
  houseNumber: string; // responder's house number
}

// Serialized size: ~30 bytes
```

### Battery Configuration

**Requirements: 6.2**

```typescript
interface BatteryConfig {
  level: number;                    // 0-100
  discoveryInterval: number;        // milliseconds
  animationsEnabled: boolean;
  powerSaveMode: boolean;
}

const BATTERY_THRESHOLDS = {
  HIGH: { min: 50, interval: 15000 },      // 15 seconds
  MEDIUM: { min: 20, interval: 30000 },    // 30 seconds
  LOW: { min: 0, interval: 60000 },        // 60 seconds
};
```

## Component Specifications

### 1. SurvivalConnectivityIsland

**Requirements: 1.1-1.10**

**Purpose:** Simplified header showing mesh network status and battery level.

**Props:**
```typescript
interface SurvivalConnectivityIslandProps {
  peerCount: number;
  isDiscovering: boolean;
  batteryLevel: number;
  lastSyncTime: number;
  onPress: () => void;
}
```

**Visual Design:**
- Height: 48px (reduced from 60px)
- Background: #0D1210 (pure black for OLED)
- Two states:
  - **Searching:** Dim pulse animation (< 30fps), "Searching..." text
  - **Connected:** Solid indicator, "3 neighbors" text
- Battery indicator: Icon + percentage
- Last sync: "Synced 2m ago"
- Tappable to show connection details modal

**Layout:**
```
┌────────────────────────────────────────────────┐
│ 📡 Mesh Active    3 neighbors    🔋 45%  2m    │
└────────────────────────────────────────────────┘
```

### 2. SurvivalTabBar

**Requirements: 2.1-2.10**

**Purpose:** Two-tab segmented control for Community Board and SOS.

**Props:**
```typescript
interface SurvivalTabBarProps {
  activeTab: 'community' | 'sos';
  onTabChange: (tab: 'community' | 'sos') => void;
  sosUnreadCount: number;
}
```

**Visual Design:**
- Height: 44px (minimum touch target)
- Background: #121A16
- Active tab: White text + 2px underline (#4AEDC4)
- Inactive tab: Gray text (#A5D6A7)
- Font: System, 16px, weight 600
- No animation on switch (instant)
- SOS badge: Red circle with count

**Layout:**
```
┌────────────────────────────────────────────────┐
│  Community Board          SOS (2)              │
│  ────────────                                  │
└────────────────────────────────────────────────┘
```

### 3. HavePostCard

**Requirements: 3.1-3.10**

**Purpose:** Display "Have" posts with house number for pickup.

**Props:**
```typescript
interface HavePostCardProps {
  post: SurvivalPost;
  onPress: () => void;
}
```

**Visual Design:**
- Format: `[ITEM] - House #[NUMBER] - [TIME]`
- Background: #161E1A
- Text: White (#E8F5E9)
- House number: Monospace font
- Padding: 16px
- Separator: 1px line (#2A3A30)
- Claimed badge: Gray "CLAIMED" text

**Example:**
```
┌────────────────────────────────────────────────┐
│ Fresh Tomatoes - House #123 - 10m ago         │
└────────────────────────────────────────────────┘
```

### 4. WantPostCard

**Requirements: 4.1-4.10**

**Purpose:** Display "Want" posts with "Coming" button.

**Props:**
```typescript
interface WantPostCardProps {
  post: SurvivalPost;
  onComingPress: () => void;
  onReplyPress: () => void;
}
```

**Visual Design:**
- Format: `[ITEM NEEDED] - House #[NUMBER] - [TIME]`
- Background: #161E1A
- Text: White (#E8F5E9)
- "Coming" button: Green (#4AEDC4), 44px height
- Coming count: "2 coming" indicator
- Response list: House numbers of responders

**Example:**
```
┌────────────────────────────────────────────────┐
│ Need Milk - House #124 - 5m ago               │
│ [Coming] 2 coming: #123, #125                 │
└────────────────────────────────────────────────┘
```

### 5. SOSPostCard

**Requirements: 5.1-5.10**

**Purpose:** Display emergency help requests with high priority.

**Props:**
```typescript
interface SOSPostCardProps {
  post: SurvivalPost;
  onRespondPress: () => void;
  onResolvePress: () => void;
}
```

**Visual Design:**
- Format: `⚠️ [EMERGENCY] - House #[NUMBER] - [TIME]`
- Background: #161E1A with red border (#FF5252)
- Text: White (#E8F5E9)
- Alert icon: ⚠️
- Category badge: Medical/Safety/Fire/Other
- "Responding" button: Red (#FF5252), 44px height
- Responder list: House numbers
- Sticky: Always at top of feed

**Example:**
```
┌────────────────────────────────────────────────┐
│ ⚠️ MEDICAL - House #126 - 2m ago    [Medical] │
│ [Responding] 3 responding: #123, #124, #125   │
└────────────────────────────────────────────────┘
```

### 6. SurvivalPostCreator

**Requirements: 8.1-8.10**

**Purpose:** Simplified form for creating posts quickly.

**Props:**
```typescript
interface SurvivalPostCreatorProps {
  onSubmit: (post: Omit<SurvivalPost, 'id' | 'ts'>) => void;
  onCancel: () => void;
}
```

**Visual Design:**
- 3 fields only:
  1. Type dropdown: Have / Want / SOS
  2. Item input: Single line, 100 char max, character count
  3. House number: Numeric input only
- Submit button: Green (#4AEDC4), 48px height
- Cancel button: Gray, 48px height
- No photo upload, no description, no risk tier
- Validation: House number format, item length

**Layout:**
```
┌────────────────────────────────────────────────┐
│ Type: [Have ▼]                                 │
│ Item: [_____________________________] 45/100   │
│ House #: [___]                                 │
│ [Submit]  [Cancel]                             │
└────────────────────────────────────────────────┘
```

## State Management

### Survival Mode State

```typescript
interface SurvivalModeState {
  // Posts
  posts: SurvivalPost[];
  
  // UI State
  activeTab: 'community' | 'sos';
  isCreating: boolean;
  
  // Network State
  peerCount: number;
  isDiscovering: boolean;
  lastSyncTime: number;
  
  // Battery State
  batteryLevel: number;
  batteryConfig: BatteryConfig;
  powerSaveMode: boolean;
  
  // User State
  userHouseNumber: number;
}
```

### Actions

```typescript
// Post Actions
type PostAction =
  | { type: 'ADD_POST'; post: SurvivalPost }
  | { type: 'REMOVE_POST'; postId: string }
  | { type: 'UPDATE_POST'; postId: string; updates: Partial<SurvivalPost> }
  | { type: 'MERGE_POSTS'; posts: SurvivalPost[] };

// UI Actions
type UIAction =
  | { type: 'SET_ACTIVE_TAB'; tab: 'community' | 'sos' }
  | { type: 'TOGGLE_CREATE_FORM' };

// Network Actions
type NetworkAction =
  | { type: 'UPDATE_PEER_COUNT'; count: number }
  | { type: 'SET_DISCOVERING'; isDiscovering: boolean }
  | { type: 'UPDATE_SYNC_TIME'; timestamp: number };

// Battery Actions
type BatteryAction =
  | { type: 'UPDATE_BATTERY'; level: number }
  | { type: 'TOGGLE_POWER_SAVE' };
```

## Bluetooth Mesh Integration

### Gossip Protocol

**Requirements: 9.1-9.10**

**Message Broadcasting:**
```typescript
interface GossipMessage {
  type: 'post_list' | 'post_update' | 'ack';
  payload: SurvivalPost[] | ComingAck;
  hopCount: number;
  timestamp: number;
}

const MAX_HOPS = 5;
const RETRY_BACKOFF = [1000, 2000, 4000, 8000]; // exponential backoff
```

**Priority Queue:**
1. SOS messages (highest priority)
2. Want messages
3. Have messages
4. ACKs

**Deduplication:**
- Track received post IDs in Set
- Ignore duplicates
- Merge new posts with local list

**Network Partition Handling:**
- Track last sync time per peer
- Re-broadcast after partition heals
- Compress post list before transmission

## Battery Management

### Battery Monitoring

**Requirements: 6.1-6.10**

```typescript
function getBatteryConfig(level: number): BatteryConfig {
  if (level > 50) {
    return {
      level,
      discoveryInterval: 15000,
      animationsEnabled: true,
      powerSaveMode: false,
    };
  } else if (level > 20) {
    return {
      level,
      discoveryInterval: 30000,
      animationsEnabled: true,
      powerSaveMode: false,
    };
  } else {
    return {
      level,
      discoveryInterval: 60000,
      animationsEnabled: false,
      powerSaveMode: true,
    };
  }
}
```

**Power Save Actions:**
- Disable all animations
- Use pure black backgrounds (#000000)
- Reduce Bluetooth discovery frequency
- Pause non-critical background tasks
- Show brightness reduction recommendation

## Mode Switching

### Online → Offline (Entering Survival Mode)

**Requirements: Mode Switching Behavior**

```typescript
async function enterSurvivalMode() {
  // 1. Detect connectivity loss
  const isOnline = await checkInternetConnectivity();
  if (isOnline) return;
  
  // 2. Switch theme to survival
  setThemeMode('survival');
  
  // 3. Simplify UI to 2 tabs
  setNavigationMode('survival'); // 2-tab mode
  
  // 4. Enable Bluetooth mesh
  await startBluetoothMesh();
  
  // 5. Show survival mode banner
  showBanner('Survival Mode Active - Mesh Networking Enabled');
  
  // 6. Sync local data to mesh
  await broadcastLocalPosts();
}
```

### Offline → Online (Exiting Survival Mode)

```typescript
async function exitSurvivalMode() {
  // 1. Detect connectivity restored
  const isOnline = await checkInternetConnectivity();
  if (!isOnline) return;
  
  // 2. Sync mesh data to cloud
  await syncMeshDataToSupabase();
  
  // 3. Switch theme to abundance
  setThemeMode('abundance');
  
  // 4. Restore full UI (5 tabs)
  setNavigationMode('abundance'); // 5-tab mode
  
  // 5. Disable Bluetooth mesh (optional)
  // Keep mesh running in background for hybrid mode
  
  // 6. Show sync progress
  showBanner('Syncing with cloud...');
}
```

## Visual Design System

### Color Palette

**Requirements: 10.1-10.10**

```typescript
const SURVIVAL_COLORS = {
  // Backgrounds (OLED-optimized)
  background: '#000000',      // Pure black
  card: '#0D1210',           // Near black
  elevated: '#121A16',       // Slightly elevated
  
  // Text (High contrast)
  textPrimary: '#FFFFFF',    // Pure white
  textSecondary: '#E8E8E8',  // Light gray
  textMuted: '#A5A5A5',      // Medium gray
  
  // Accents
  accentGreen: '#4AEDC4',    // Mint green
  accentRed: '#FF5252',      // Alert red
  accentYellow: '#FFAB00',   // Warning yellow
  
  // Borders
  separator: '#2A2A2A',      // Subtle separator
};
```

### Typography

```typescript
const SURVIVAL_TYPOGRAPHY = {
  // Font Family
  fontFamily: 'System',      // System default only
  
  // Font Sizes
  small: 14,
  body: 16,
  header: 20,
  
  // Line Height
  lineHeight: 1.5,           // For readability
  
  // Font Weights
  normal: '400',
  semibold: '600',
  bold: '700',
};
```

### Spacing

```typescript
const SURVIVAL_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

### Touch Targets

All interactive elements must have minimum 44px touch target (WCAG AAA).

## Testing Strategy

### Unit Tests

1. **Data Serialization**
   - Test SurvivalPost serialization < 512 bytes
   - Test field abbreviation (t, i, h, ts, id)
   - Test UTF-8 encoding

2. **Battery Configuration**
   - Test battery threshold logic
   - Test discovery interval calculation
   - Test power save mode activation

3. **Post Validation**
   - Test house number format
   - Test item length limits
   - Test timestamp generation

### Integration Tests

1. **Mode Switching**
   - Test online → offline transition
   - Test offline → online transition
   - Test data persistence during switch

2. **Gossip Protocol**
   - Test message broadcasting
   - Test deduplication
   - Test hop count limiting
   - Test priority queue

3. **UI Rendering**
   - Test 2-tab navigation
   - Test post card rendering
   - Test "Coming" button interaction

### Property-Based Tests

1. **Post Serialization**
   - Property: All generated posts serialize to < 512 bytes
   - Generator: Random posts with varying field lengths

2. **Battery Thresholds**
   - Property: Discovery interval increases as battery decreases
   - Generator: Random battery levels 0-100

3. **Gossip Deduplication**
   - Property: No duplicate posts in merged list
   - Generator: Random post lists with overlapping IDs

## Performance Considerations

### Bluetooth Optimization

- Message size: 512 bytes max
- Discovery interval: 15-60 seconds (battery-dependent)
- Max concurrent connections: 8 peers
- Broadcast priority: SOS > Want > Have

### UI Optimization

- Pure black backgrounds for OLED power savings
- No shadows or elevation (battery savings)
- Minimal animations (< 30fps when enabled)
- Instant tab switching (no animation)
- Lazy loading for long post lists

### Memory Optimization

- Limit post history to 100 items
- Prune expired posts automatically
- Use efficient data structures (Map for O(1) lookup)

## Accessibility

### WCAG AAA Compliance

**Requirements: 10.10**

- Contrast ratio: 7:1 minimum (white on black)
- Touch targets: 44px minimum
- Keyboard navigation: Full support
- Screen reader: Descriptive labels for all elements
- Focus indicators: High contrast borders

### Accessibility Labels

```typescript
// Example accessibility labels
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Coming button for milk request at house 124"
  accessibilityHint="Tap to indicate you are bringing this item"
>
  <Text>Coming</Text>
</Pressable>
```

## Migration Strategy

### Phase 1: Create Survival Components
- Build SurvivalConnectivityIsland
- Build SurvivalTabBar
- Build HavePostCard, WantPostCard, SOSPostCard
- Build SurvivalPostCreator

### Phase 2: Integrate with App.tsx
- Add mode detection logic
- Add navigation switching (5-tab vs 2-tab)
- Add theme switching integration
- Add battery monitoring

### Phase 3: Bluetooth Integration
- Implement gossip protocol
- Add message broadcasting
- Add deduplication logic
- Add priority queue

### Phase 4: Testing & Polish
- Unit tests for all components
- Integration tests for mode switching
- Property-based tests for data serialization
- Accessibility audit

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
