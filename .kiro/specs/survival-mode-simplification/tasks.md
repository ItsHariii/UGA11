# Implementation Tasks: Survival Mode Simplification

## Task Overview

This document outlines the implementation tasks for building the simplified survival mode interface. Tasks are organized by component and feature area.

---

## 1. Data Model & Types

### 1.1 Create SurvivalPost interface
- [x] Define `SurvivalPost` interface in `src/types/index.ts`
- [x] Add abbreviated field names (t, i, h, ts, id, r, c)
- [x] Add TypeScript type guards for validation
- [x] Add serialization helper functions
- [x] Add size validation (< 512 bytes)
- _Requirements: 7.1-7.10_

### 1.2 Create ComingAck interface
- [x] Define `ComingAck` interface in `src/types/index.ts`
- [x] Add postId and houseNumber fields
- [x] Add serialization helper
- _Requirements: 4.3_

### 1.3 Create BatteryConfig interface
- [x] Define `BatteryConfig` interface in `src/types/index.ts`
- [x] Add battery threshold constants
- [x] Add `getBatteryConfig()` utility function
- _Requirements: 6.1-6.10_

### 1.4 Create SurvivalModeState interface
- [x] Define `SurvivalModeState` interface
- [x] Add posts, activeTab, network state, battery state
- [x] Define action types for state management
- _Requirements: All_

---

## 2. Survival Connectivity Island

### 2.1 Create SurvivalConnectivityIsland component
- [x] Create `src/components/connectivity/SurvivalConnectivityIsland.tsx`
- [x] Add props interface (peerCount, isDiscovering, batteryLevel, lastSyncTime, onPress)
- [x] Implement basic layout (48px height)
- [x] Add pure black background (#0D1210)
- _Requirements: 1.1, 1.5, 1.6, 1.7_

### 2.2 Implement status indicator
- [x] Add "Searching" state with dim pulse animation
- [x] Add "Connected" state with solid indicator
- [x] Show peer count (e.g., "3 neighbors")
- [x] Use minimal animations (< 30fps)
- _Requirements: 1.2, 1.3, 1.4_

### 2.3 Add battery indicator
- [x] Display battery icon + percentage
- [x] Color code based on level (green/yellow/red)
- [x] Show power save mode indicator
- _Requirements: 1.6, 6.6_

### 2.4 Add last sync time
- [x] Display relative time (e.g., "2m ago")
- [x] Update every minute
- _Requirements: 1.8_

### 2.5 Add tap interaction
- [x] Make island tappable
- [x] Show connection details modal on tap
- [x] Add accessibility labels
- _Requirements: 1.9, 10.10_

---

## 3. Survival Tab Bar

### 3.1 Create SurvivalTabBar component
- [x] Create `src/components/survival/SurvivalTabBar.tsx`
- [x] Add props interface (activeTab, onTabChange, sosUnreadCount)
- [x] Implement segmented control layout
- [x] Set height to 44px (minimum touch target)
- _Requirements: 2.1, 2.5_

### 3.2 Style active/inactive tabs
- [x] Active tab: White text + 2px underline (#4AEDC4)
- [x] Inactive tab: Gray text (#A5D6A7)
- [x] Use system font, 16px, weight 600
- _Requirements: 2.3, 2.4, 2.6_

### 3.3 Add instant tab switching
- [x] No animation on tab change
- [x] Persist scroll position when switching
- _Requirements: 2.7, 2.8_

### 3.4 Add SOS unread badge
- [x] Show red circle with count on SOS tab
- [x] Only show when count > 0
- _Requirements: 2.9_

### 3.5 Add accessibility
- [x] Keyboard navigation support
- [x] Screen reader labels
- _Requirements: 2.10, 10.10_

---

## 4. Have Post Card

### 4.1 Create HavePostCard component
- [x] Create `src/components/survival/HavePostCard.tsx`
- [x] Add props interface (post, onPress)
- [x] Implement text-only layout
- [x] Format: "[ITEM] - House #[NUMBER] - [TIME]"
- _Requirements: 3.1, 3.2_

### 4.2 Style post card
- [x] Background: #161E1A
- [x] Text: White (#E8F5E9)
- [x] Monospace font for house numbers
- [x] 16px padding
- [x] 1px separator line (#2A3A30)
- _Requirements: 3.3, 3.4, 3.6, 3.7, 3.8_

### 4.3 Add relative time display
- [x] Show "10m ago", "2h ago", etc.
- [x] Update every minute
- _Requirements: 3.4_

### 4.4 Add claimed badge
- [x] Show "CLAIMED" badge if taken
- [x] Gray out claimed posts
- _Requirements: 3.10_

### 4.5 Add tap interaction
- [x] Make card tappable to show full details
- [x] Add accessibility labels
- _Requirements: 3.9, 10.10_

---

## 5. Want Post Card

### 5.1 Create WantPostCard component
- [x] Create `src/components/survival/WantPostCard.tsx`
- [x] Add props interface (post, onComingPress, onReplyPress)
- [x] Implement layout with "Coming" button
- [x] Format: "[ITEM NEEDED] - House #[NUMBER] - [TIME]"
- _Requirements: 4.1, 4.2_

### 5.2 Implement "Coming" button
- [x] Add button with 44px height
- [x] Green color (#4AEDC4)
- [x] Send 1-byte ACK on press
- _Requirements: 4.2, 4.3, 4.5_

### 5.3 Show coming count
- [x] Display "2 coming" indicator
- [x] Highlight when someone is coming (green)
- _Requirements: 4.5, 4.6_

### 5.4 Show responder house numbers
- [x] List house numbers of responders
- [x] Format: "#123, #125"
- _Requirements: 4.9_

### 5.5 Add reply functionality
- [x] Allow leaving a reply with house number
- [x] Simple text input modal
- _Requirements: 4.4_

### 5.6 Add auto-expiration
- [x] Expire posts after 24 hours
- [x] Show expiration countdown
- _Requirements: 4.10_

---

## 6. SOS Post Card

### 6.1 Create SOSPostCard component
- [x] Create `src/components/survival/SOSPostCard.tsx`
- [x] Add props interface (post, onRespondPress, onResolvePress)
- [x] Implement sticky layout (always at top)
- [x] Format: "⚠️ [EMERGENCY] - House #[NUMBER] - [TIME]"
- _Requirements: 5.1, 5.3_

### 6.2 Style SOS card
- [x] Red accent color (#FF5252)
- [x] Red border
- [x] Alert icon (⚠️)
- [x] Background: #161E1A
- _Requirements: 5.2, 5.9_

### 6.3 Add category badge
- [x] Support categories: Medical, Safety, Fire, Other
- [x] Color-coded badges
- _Requirements: 5.10_

### 6.4 Implement "Responding" button
- [x] Add button with 44px height
- [x] Red color (#FF5252)
- [x] Show list of responders
- _Requirements: 5.4, 5.5_

### 6.5 Add resolution functionality
- [x] "Mark Resolved" button for post author
- [x] Persist until marked resolved
- _Requirements: 5.8_

### 6.6 Add Bluetooth priority
- [x] Highest broadcast priority for SOS
- [x] Immediate propagation
- _Requirements: 5.6_

---

## 7. Survival Post Creator

### 7.1 Create SurvivalPostCreator component
- [x] Create `src/components/survival/SurvivalPostCreator.tsx`
- [x] Add props interface (onSubmit, onCancel)
- [x] Implement 3-field form layout
- _Requirements: 8.1_

### 7.2 Add Type dropdown
- [x] Dropdown with options: Have, Want, SOS
- [x] Default to "Have"
- _Requirements: 8.2_

### 7.3 Add Item input
- [x] Single-line text input
- [x] Max 100 characters
- [x] Show character count
- _Requirements: 8.3, 8.10_

### 7.4 Add House Number input
- [x] Numeric input only
- [x] Validate format
- _Requirements: 8.4, 8.9_

### 7.5 Remove complex fields
- [x] No photo upload
- [x] No description field
- [x] No risk tier selection
- _Requirements: 8.5, 8.6, 8.7_

### 7.6 Add submit/cancel buttons
- [x] Submit button: Green (#4AEDC4), 48px height
- [x] Cancel button: Gray, 48px height
- [x] Submit in < 1 second
- _Requirements: 8.8_

---

## 8. Battery Management

### 8.1 Create battery monitoring hook
- [x] Create `src/hooks/useBatteryMonitor.ts`
- [x] Monitor battery level continuously
- [x] Return current level and config
- _Requirements: 6.1_

### 8.2 Implement battery-aware discovery
- [x] Adjust Bluetooth discovery interval based on battery
- [x] > 50%: 15 second interval
- [x] 20-50%: 30 second interval
- [x] < 20%: 60 second interval
- _Requirements: 6.2_

### 8.3 Implement power save mode
- [x] Disable animations when battery < 20%
- [x] Use pure black backgrounds
- [x] Pause non-critical tasks
- _Requirements: 6.3, 6.4, 6.7_

### 8.4 Add brightness recommendation
- [x] Show notification when battery < 30%
- [x] Suggest reducing screen brightness
- _Requirements: 6.5_

### 8.5 Add battery indicator to island
- [x] Show battery level in connectivity island
- [x] Color code based on level
- _Requirements: 6.6_

### 8.6 Add manual override
- [x] Allow user to override power-save settings
- [x] Settings toggle in survival mode
- _Requirements: 6.9_

### 8.7 Add battery logging
- [x] Log battery usage metrics
- [x] Track drain rate
- _Requirements: 6.10_

---

## 9. Gossip Protocol

### 9.1 Create gossip message interface
- [x] Define `GossipMessage` interface
- [x] Add type, payload, hopCount, timestamp fields
- _Requirements: 9.1, 9.6_

### 9.2 Implement message broadcasting
- [x] Broadcast local post list to all connected peers
- [x] Compress post list before transmission
- _Requirements: 9.1, 9.9_

### 9.3 Implement post merging
- [x] Merge received posts with local list
- [x] Deduplicate posts by ID
- _Requirements: 9.2, 9.3, 9.10_

### 9.4 Implement priority queue
- [x] Prioritize SOS messages in broadcast queue
- [x] Order: SOS > Want > Have
- _Requirements: 9.4_

### 9.5 Implement retry logic
- [x] Use exponential backoff for retries
- [x] Backoff: 1s, 2s, 4s, 8s
- _Requirements: 9.5_

### 9.6 Implement hop count limiting
- [x] Track message hop count
- [x] Max 5 hops
- _Requirements: 9.6_

### 9.7 Add sync timestamps
- [x] Track last sync time per peer
- [x] Update on successful sync
- _Requirements: 9.7_

### 9.8 Handle network partitions
- [x] Detect partition heals
- [x] Re-broadcast after partition heals
- _Requirements: 9.8_

---

## 10. Mode Switching

### 10.1 Implement connectivity detection
- [x] Create `checkInternetConnectivity()` function
- [x] Poll every 10 seconds
- [x] Detect online/offline transitions
- _Requirements: Mode Switching Behavior_

### 10.2 Implement enterSurvivalMode()
- [x] Switch theme to survival
- [x] Simplify UI to 2 tabs
- [x] Enable Bluetooth mesh
- [x] Show survival mode banner
- [x] Broadcast local posts
- _Requirements: Mode Switching Behavior_

### 10.3 Implement exitSurvivalMode()
- [x] Sync mesh data to Supabase
- [x] Switch theme to abundance
- [x] Restore full UI (5 tabs)
- [x] Show sync progress
- _Requirements: Mode Switching Behavior_

### 10.4 Add mode switching UI
- [x] Show banner when entering survival mode
- [x] Show sync progress when exiting
- [x] Smooth transition animations
- _Requirements: Mode Switching Behavior_

### 10.5 Preserve data during switch
- [x] Ensure zero data loss
- [x] Maintain authentication state
- [x] Preserve user preferences
- _Requirements: Compatibility_

---

## 11. App.tsx Integration

### 11.1 Add survival mode detection
- [x] Detect when connectivity mode is 'offline'
- [x] Switch to survival UI automatically
- _Requirements: All_

### 11.2 Add conditional navigation
- [x] Show 5-tab navigation in abundance mode
- [x] Show 2-tab navigation in survival mode
- _Requirements: 2.1_

### 11.3 Add conditional header
- [x] Show full header in abundance mode
- [x] Show SurvivalConnectivityIsland in survival mode
- _Requirements: 1.1_

### 11.4 Add survival screens
- [x] Add CommunityBoard screen
- [x] Add SOSBoard screen
- [x] Add SurvivalPostCreator screen
- _Requirements: All_

### 11.5 Wire up state management
- [x] Connect survival components to app state
- [x] Handle post creation, updates, deletions
- _Requirements: All_

---

## 12. Testing

### 12.1 Unit tests - Data serialization
- [x] Test SurvivalPost serialization < 512 bytes
- [x] Test field abbreviation
- [x] Test UTF-8 encoding
- _Requirements: 7.1-7.10_

### 12.2 Unit tests - Battery configuration
- [x] Test battery threshold logic
- [x] Test discovery interval calculation
- [x] Test power save mode activation
- _Requirements: 6.1-6.10_

### 12.3 Unit tests - Post validation
- [x] Test house number format validation
- [x] Test item length limits
- [x] Test timestamp generation
- _Requirements: 8.9, 8.10_

### 12.4 Integration tests - Mode switching
- [x] Test online → offline transition
- [x] Test offline → online transition
- [x] Test data persistence during switch
- _Requirements: Mode Switching Behavior_

### 12.5 Integration tests - Gossip protocol
- [x] Test message broadcasting
- [x] Test deduplication
- [x] Test hop count limiting
- [x] Test priority queue
- _Requirements: 9.1-9.10_

### 12.6 Integration tests - UI rendering
- [x] Test 2-tab navigation
- [x] Test post card rendering
- [x] Test "Coming" button interaction
- _Requirements: 2.1-2.10, 4.1-4.10_

### 12.7 Property-based test - Post serialization
- [x] Property: All generated posts serialize to < 512 bytes
- [x] Generator: Random posts with varying field lengths
- _Requirements: 7.1-7.10_

### 12.8 Property-based test - Battery thresholds
- [x] Property: Discovery interval increases as battery decreases
- [x] Generator: Random battery levels 0-100
- _Requirements: 6.2_

### 12.9 Property-based test - Gossip deduplication
- [x] Property: No duplicate posts in merged list
- [x] Generator: Random post lists with overlapping IDs
- _Requirements: 9.3_

---

## 13. Accessibility

### 13.1 Add accessibility labels
- [x] Add labels to all interactive elements
- [x] Add hints for complex interactions
- _Requirements: 10.10_

### 13.2 Test keyboard navigation
- [x] Ensure all elements are keyboard accessible
- [x] Test tab order
- _Requirements: 10.10_

### 13.3 Test screen reader
- [x] Test with VoiceOver (iOS) / TalkBack (Android)
- [x] Ensure all content is readable
- _Requirements: 10.10_

### 13.4 Verify contrast ratios
- [x] Test all text/background combinations
- [x] Ensure 7:1 minimum contrast (WCAG AAA)
- _Requirements: 10.10_

### 13.5 Verify touch targets
- [x] Ensure all interactive elements are 44px minimum
- [x] Test on physical devices
- _Requirements: 10.10_

---

## 14. Polish & Optimization

### 14.1 Optimize Bluetooth performance
- [x] Ensure message size < 512 bytes
- [x] Test discovery intervals
- [x] Test max concurrent connections (8 peers)
- _Requirements: Bluetooth Constraints_

### 14.2 Optimize UI performance
- [x] Ensure UI response time < 100ms
- [x] Test with long post lists
- [x] Implement lazy loading
- _Requirements: Performance Considerations_

### 14.3 Optimize memory usage
- [x] Limit post history to 100 items
- [x] Prune expired posts automatically
- [x] Use efficient data structures
- _Requirements: Performance Considerations_

### 14.4 Test battery drain
- [x] Measure battery drain in survival mode
- [x] Target < 5% per hour
- _Requirements: Success Metrics_

### 14.5 Test message propagation
- [x] Measure time to propagate to 3 hops
- [x] Target < 30 seconds
- _Requirements: Success Metrics_

---

## Task Summary

- **Total Tasks:** 14 major tasks
- **Total Subtasks:** 95 subtasks
- **Estimated Effort:** 3-4 weeks for full implementation
- **Priority Order:**
  1. Data Model & Types (Task 1)
  2. Core Components (Tasks 2-7)
  3. Battery Management (Task 8)
  4. Gossip Protocol (Task 9)
  5. Mode Switching (Task 10)
  6. App Integration (Task 11)
  7. Testing (Task 12)
  8. Accessibility (Task 13)
  9. Polish (Task 14)
