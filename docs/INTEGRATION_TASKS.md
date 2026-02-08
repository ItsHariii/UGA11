# Business Logic Layer Integration - Task List

Based on the comprehensive integration analysis in `MOHINI_INTEGRATION_ANALYSIS.md`.

**Timeline**: 10 weeks (phased approach)  
**Status**: Not Started  
**Last Updated**: February 8, 2026

---

## Pre-Migration Setup

### [ ] 0. Team Alignment & Environment Setup (Week 0)

#### [ ] 0.1 Team Review & Buy-in
- [ ] Schedule team meeting to review integration analysis
- [ ] Present architecture comparison and benefits
- [ ] Discuss concerns and questions
- [ ] Get consensus on phased migration approach
- [ ] Assign roles and responsibilities

#### [ ] 0.2 Environment Configuration
- [ ] Set up feature flags system for gradual rollout
- [ ] Configure monitoring and alerting (error tracking, performance)
- [ ] Prepare staging environment for integration testing
- [ ] Set up performance benchmarking tools
- [ ] Create rollback procedures documentation

#### [ ] 0.3 Documentation & Planning
- [ ] Create architecture decision record (ADR)
- [ ] Document current baseline performance metrics
- [ ] Set up integration test framework
- [ ] Create detailed migration checklist
- [ ] Establish communication channels for migration updates

---

## Phase 1: Foundation (Week 1-2)

**Goal**: Set up infrastructure without breaking existing functionality

### [ ] 1. Transport Layer Implementation

#### [ ] 1.1 Create Transport Interfaces
- [ ] Create `NeighborYield/src/transport/` directory
- [ ] Define `ITransportRouter.ts` interface
  - [ ] `sendPost(post: SharePost): Promise<void>`
  - [ ] `sendInterest(interest: InterestAck): Promise<void>`
  - [ ] `sendResponse(response: InterestResponse): Promise<void>`
  - [ ] `sendHeartbeat(payload: HeartbeatPayload): Promise<void>`
  - [ ] `fetchPosts(): Promise<SharePost[]>`
  - [ ] `onPostReceived(handler): Unsubscribe`
  - [ ] `onInterestReceived(handler): Unsubscribe`
  - [ ] `onResponseReceived(handler): Unsubscribe`
  - [ ] `onHeartbeatReceived(handler): Unsubscribe`

#### [ ] 1.2 Implement SupabaseTransport
- [ ] Create `NeighborYield/src/transport/SupabaseTransport.ts`
- [ ] Implement `sendPost()` using existing posts.service
- [ ] Implement `sendInterest()` using existing interests.service
- [ ] Implement `sendResponse()` using existing interests.service
- [ ] Implement `fetchPosts()` using existing posts.service
- [ ] Implement `onPostReceived()` with real-time subscription
- [ ] Implement `onInterestReceived()` with real-time subscription
- [ ] Implement `onResponseReceived()` with real-time subscription
- [ ] Add error handling and logging
- [ ] Write unit tests for SupabaseTransport

#### [ ] 1.3 Copy Mohini's Managers
- [ ] Create `NeighborYield/src/managers/` directory
- [ ] Copy `BatteryManager.ts` from `src/managers/`
- [ ] Copy `PermissionManager.ts` from `src/managers/`
- [ ] Copy `PresenceManager.ts` from `src/managers/`
- [ ] Copy `TTLManager.ts` from `src/managers/`
- [ ] Copy `InterestManager.ts` from `src/managers/`
- [ ] Copy all interface files (`I*.ts`)
- [ ] Update import paths for React Native environment
- [ ] Verify TypeScript compilation

#### [ ] 1.4 Copy Supporting Utilities
- [ ] Create `NeighborYield/src/utils/` directory (if not exists)
- [ ] Copy `ImageValidator.ts` from `src/utils/`
- [ ] Copy `ImageCompressor.ts` from `src/utils/`
- [ ] Copy `SupabaseMappers.ts` from `src/utils/`
- [ ] Copy `UserIdentifierGenerator.ts` from `src/utils/`
- [ ] Update import paths
- [ ] Test utilities in React Native environment

#### [ ] 1.5 Copy Type Definitions
- [ ] Copy `Common.ts` to `NeighborYield/src/types/`
- [ ] Copy `PeerInfo.ts` to `NeighborYield/src/types/`
- [ ] Copy `InterestAck.ts` to `NeighborYield/src/types/`
- [ ] Copy `InterestResponse.ts` to `NeighborYield/src/types/`
- [ ] Copy `SharePost.ts` to `NeighborYield/src/types/`
- [ ] Merge with existing type definitions
- [ ] Resolve any type conflicts
- [ ] Update `NeighborYield/src/types/index.ts` exports

#### [ ] 1.6 Implement Hook Stubs
- [ ] Implement `usePermissions.ts` (basic wrapper, not yet active)
- [ ] Implement `usePeerCount.ts` (basic wrapper, not yet active)
- [ ] Implement `useTTL.ts` (basic wrapper, not yet active)
- [ ] Implement `useConnectivity.ts` (basic wrapper, not yet active)
- [ ] Update `NeighborYield/src/hooks/index.ts` exports
- [ ] Add TypeScript types for all hooks

#### [ ] 1.7 Integration Tests
- [ ] Write tests for SupabaseTransport
  - [ ] Test post sending
  - [ ] Test interest sending
  - [ ] Test real-time subscriptions
  - [ ] Test error handling
- [ ] Write tests for manager instantiation
- [ ] Write tests for hook initialization
- [ ] Run full test suite
- [ ] Verify no regressions in existing features

#### [ ] 1.8 Verification
- [ ] Run app and verify all existing features work
- [ ] Check for TypeScript errors
- [ ] Check for runtime errors
- [ ] Verify performance is unchanged
- [ ] Document any issues found

---

## Phase 2: TTL Integration (Week 3)

**Goal**: Add automatic post expiration

### [ ] 2. TTL Manager Integration

#### [ ] 2.1 Initialize TTLManager in App.tsx
- [ ] Import TTLManager in App.tsx
- [ ] Create TTLManager instance in useEffect
- [ ] Store manager in state or ref
- [ ] Add cleanup in useEffect return

#### [ ] 2.2 Track Posts on Load
- [ ] After fetching posts, call `ttlManager.trackPost()` for each
- [ ] Handle posts loaded from Supabase
- [ ] Handle posts from real-time subscriptions
- [ ] Add logging for tracking

#### [ ] 2.3 Track Posts on Creation
- [ ] When user creates post, call `ttlManager.trackPost()`
- [ ] Ensure TTL is calculated correctly based on risk tier
- [ ] Add logging for new post tracking

#### [ ] 2.4 Subscribe to Expiration Events
- [ ] Add `ttlManager.onPostExpired()` subscription in App.tsx
- [ ] Dispatch `REMOVE_EXPIRED_POST` action when post expires
- [ ] Update AppContext reducer to handle expiration
- [ ] Add logging for expiration events

#### [ ] 2.5 Update AppContext
- [ ] Add `REMOVE_EXPIRED_POST` action type
- [ ] Implement reducer case to filter expired posts
- [ ] Ensure state updates correctly
- [ ] Test with mock expiration

#### [ ] 2.6 Add TTL UI Indicators
- [ ] Update SharePostCard to show remaining TTL
- [ ] Use `useTTL` hook to get remaining time
- [ ] Display countdown timer (e.g., "5h 23m remaining")
- [ ] Show "Expiring Soon" warning when < 5 minutes
- [ ] Style expired posts differently (grayed out)

#### [ ] 2.7 Testing
- [ ] Test post expiration with short TTL
- [ ] Test UI updates when TTL changes
- [ ] Test expiration for all risk tiers (low, medium, high)
- [ ] Test edge cases (post created just before expiration)
- [ ] Verify no memory leaks from timers

#### [ ] 2.8 Verification
- [ ] Run app and create posts with different risk tiers
- [ ] Verify TTL countdown displays correctly
- [ ] Wait for expiration and verify post is removed
- [ ] Check performance impact
- [ ] Document any issues

---

## Phase 3: Permission Integration (Week 4)

**Goal**: Structured permission management

### [ ] 3. Permission Manager Integration

#### [ ] 3.1 Initialize PermissionManager in App.tsx
- [ ] Import PermissionManager in App.tsx
- [ ] Create PermissionManager instance in useEffect
- [ ] Store manager in state or ref
- [ ] Add cleanup if needed

#### [ ] 3.2 Implement usePermissions Hook
- [ ] Complete `usePermissions.ts` implementation
- [ ] Add state for permission status
- [ ] Subscribe to permission changes
- [ ] Implement `requestAll()` function
- [ ] Implement `openSettings()` function
- [ ] Add loading states
- [ ] Add error handling

#### [ ] 3.3 Check Permissions on App Launch
- [ ] Call `permissionManager.checkPermissions()` on mount
- [ ] Store result in state
- [ ] Show permission explanation if not granted
- [ ] Log permission status

#### [ ] 3.4 Create Permission Explanation Screen
- [ ] Design permission explanation UI
- [ ] Explain why each permission is needed
  - [ ] Bluetooth: For mesh networking
  - [ ] Location: Required by Android for Bluetooth
  - [ ] Nearby Devices: For peer discovery
- [ ] Add "Grant Permissions" button
- [ ] Add "Learn More" section
- [ ] Add "Skip" option (with consequences explained)

#### [ ] 3.5 Implement Permission Request Flow
- [ ] Call `permissionManager.requestAllPermissions()` when user clicks button
- [ ] Show progress indicator during requests
- [ ] Handle granted permissions
- [ ] Handle denied permissions
- [ ] Handle "never ask again" state
- [ ] Show appropriate messaging for each outcome

#### [ ] 3.6 Add Permission Status Indicators
- [ ] Update PermissionStatusBar component to use manager
- [ ] Show current status for each permission
- [ ] Add "Fix" button for denied permissions
- [ ] Link to system settings when needed
- [ ] Update UI when permissions change

#### [ ] 3.7 Replace Direct Permission Checks
- [ ] Find all direct permission checks in codebase
- [ ] Replace with `permissionManager.checkPermissions()`
- [ ] Update bluetooth.service to use manager
- [ ] Update any other services using permissions

#### [ ] 3.8 Testing
- [ ] Test permission flow on fresh install
- [ ] Test with all permissions granted
- [ ] Test with some permissions denied
- [ ] Test with "never ask again" state
- [ ] Test opening system settings
- [ ] Test permission changes while app is running

#### [ ] 3.9 Verification
- [ ] Run app on fresh device/emulator
- [ ] Go through permission flow
- [ ] Verify mesh works when permissions granted
- [ ] Verify graceful degradation when denied
- [ ] Check for any permission-related crashes

---

## Phase 4: Presence Integration (Week 5)

**Goal**: Standardized peer discovery

### [ ] 4. Presence Manager Integration

#### [ ] 4.1 Initialize PresenceManager in App.tsx
- [ ] Import PresenceManager in App.tsx
- [ ] Create PresenceManager instance with transport
- [ ] Store manager in state or ref
- [ ] Call `startBroadcasting()` after permissions granted
- [ ] Call `stopBroadcasting()` on cleanup

#### [ ] 4.2 Implement usePeerCount Hook
- [ ] Complete `usePeerCount.ts` implementation
- [ ] Add state for peer count and peer list
- [ ] Subscribe to `onPeerCountChange()` events
- [ ] Update state when peers change
- [ ] Implement `formatPeerCount()` helper
- [ ] Add cleanup for subscriptions

#### [ ] 4.3 Connect to Transport Layer
- [ ] Implement heartbeat sending in SupabaseTransport
  - [ ] Consider using Supabase presence channels
  - [ ] Or create heartbeats table
- [ ] Implement `onHeartbeatReceived()` in transport
- [ ] Call `presenceManager.receivedHeartbeat()` when heartbeat arrives
- [ ] Test heartbeat flow end-to-end

#### [ ] 4.4 Update UI Components
- [ ] Update DynamicIsland to use `usePeerCount` hook
- [ ] Update PresenceTooltip to use `usePeerCount` hook
- [ ] Update any other components showing peer count
- [ ] Remove direct peer count state management
- [ ] Test UI updates when peers change

#### [ ] 4.5 Add Peer List Display
- [ ] Create PeerListComponent (optional)
- [ ] Show list of active peers with identifiers
- [ ] Show last seen timestamp
- [ ] Add refresh functionality
- [ ] Style appropriately

#### [ ] 4.6 Battery-Aware Heartbeat Intervals
- [ ] Connect BatteryManager to PresenceManager
- [ ] Call `setHeartbeatInterval()` based on battery level
- [ ] Test interval changes at different battery levels
- [ ] Verify battery optimization works

#### [ ] 4.7 Testing
- [ ] Test heartbeat broadcasting
- [ ] Test peer discovery with multiple devices
- [ ] Test peer timeout (when peer goes offline)
- [ ] Test battery-aware interval adjustment
- [ ] Test UI updates with peer changes

#### [ ] 4.8 Verification
- [ ] Run app on multiple devices
- [ ] Verify peers are discovered
- [ ] Verify peer count is accurate
- [ ] Check heartbeat frequency
- [ ] Monitor battery usage

---

## Phase 5: Interest Integration (Week 6-7)

**Goal**: Reliable interest flow with retry

### [ ] 5. Interest Manager Integration

#### [ ] 5.1 Initialize InterestManager in App.tsx
- [ ] Import InterestManager in App.tsx
- [ ] Create InterestManager instance with transport
- [ ] Store manager in state or ref
- [ ] Add cleanup if needed

#### [ ] 5.2 Subscribe to Interest Events
- [ ] Add `interestManager.onInterestReceived()` subscription
- [ ] Dispatch `INTEREST_RECEIVED` action when interest arrives
- [ ] Add `interestManager.onResponseReceived()` subscription
- [ ] Dispatch `RESPONSE_RECEIVED` action when response arrives
- [ ] Add logging for all events

#### [ ] 5.3 Update AppContext Reducer
- [ ] Add `INTEREST_RECEIVED` action type
- [ ] Implement reducer case to add interest to state
- [ ] Add `RESPONSE_RECEIVED` action type
- [ ] Implement reducer case to update interest with response
- [ ] Add `EXPRESS_INTEREST` action type (if not exists)
- [ ] Update to call manager instead of service directly

#### [ ] 5.4 Refactor Interest Expression
- [ ] Update `handleInterestPress` in App.tsx
- [ ] Call `interestManager.expressInterest(postId)` instead of service
- [ ] Handle `InterestResult` return value
- [ ] Show success/error messages
- [ ] Add retry status indicator in UI

#### [ ] 5.5 Refactor Interest Response
- [ ] Update interest response handlers
- [ ] Call `interestManager.respondToInterest()` instead of service
- [ ] Pass responderId from auth context
- [ ] Handle success/error
- [ ] Update UI appropriately

#### [ ] 5.6 Update Interest Components
- [ ] Update InterestNotificationCard to show retry status
- [ ] Add retry count indicator (if retrying)
- [ ] Add "Sending..." state during transmission
- [ ] Add error state if all retries fail
- [ ] Update styling for different states

#### [ ] 5.7 Add Retry Indicators in UI
- [ ] Show spinner when interest is being sent
- [ ] Show "Retrying..." message if first attempt fails
- [ ] Show retry count (e.g., "Retry 2/3")
- [ ] Show success checkmark when confirmed
- [ ] Show error message if all retries fail

#### [ ] 5.8 Implement Transport Layer Methods
- [ ] Implement `sendInterest()` in SupabaseTransport
- [ ] Implement `sendResponse()` in SupabaseTransport
- [ ] Implement `onInterestReceived()` subscription
- [ ] Implement `onResponseReceived()` subscription
- [ ] Add error handling and retries at transport level

#### [ ] 5.9 Testing
- [ ] Test interest expression with good network
- [ ] Test interest expression with poor network (simulate failures)
- [ ] Test retry logic (disconnect network, reconnect)
- [ ] Test response flow
- [ ] Test queue management (multiple interests)
- [ ] Test edge cases (post deleted before interest sent)

#### [ ] 5.10 Verification
- [ ] Express interest in posts
- [ ] Verify retry happens on failure
- [ ] Verify UI shows retry status
- [ ] Verify no interests are lost
- [ ] Check for memory leaks from retry timers

---

## Phase 6: Battery Integration (Week 8)

**Goal**: Lifecycle-aware mesh control

### [ ] 6. Battery Manager Integration

#### [ ] 6.1 Initialize BatteryManager in App.tsx
- [ ] Import BatteryManager in App.tsx
- [ ] Create BatteryManager instance with transport
- [ ] Store manager in state or ref
- [ ] Add cleanup in useEffect return

#### [ ] 6.2 Connect App Lifecycle Events
- [ ] Import AppState from React Native
- [ ] Add AppState change listener
- [ ] Call `batteryManager.onAppForeground()` when app becomes active
- [ ] Call `batteryManager.onAppBackground()` when app goes to background
- [ ] Test lifecycle transitions

#### [ ] 6.3 Subscribe to Battery Events
- [ ] Add `batteryManager.onLowBattery()` subscription
- [ ] Dispatch `LOW_BATTERY_WARNING` action
- [ ] Show low battery notice in UI
- [ ] Add logging for battery events

#### [ ] 6.4 Coordinate with Existing battery.service
- [ ] Review responsibilities of each service
  - [ ] BatteryManager: Lifecycle + mesh control
  - [ ] battery.service: UI optimizations
- [ ] Connect battery.service to BatteryManager events
- [ ] Update battery.service to use manager's battery level
- [ ] Remove duplicate functionality
- [ ] Test coordination

#### [ ] 6.5 Add Background Mesh Toggle
- [ ] Update BackgroundMeshToggle component
- [ ] Call `batteryManager.setBackgroundMeshEnabled()` on toggle
- [ ] Show current state from `batteryManager.isBackgroundMeshEnabled()`
- [ ] Add explanation of what this setting does
- [ ] Test toggle functionality

#### [ ] 6.6 Implement Mesh Pause on Background
- [ ] When app goes to background and mesh disabled
  - [ ] Stop presence broadcasting
  - [ ] Pause interest retries
  - [ ] Reduce resource usage
- [ ] When app returns to foreground
  - [ ] Resume presence broadcasting
  - [ ] Resume interest retries
  - [ ] Restore normal operation
- [ ] Test transitions

#### [ ] 6.7 Test Battery Optimization
- [ ] Test with low battery (< 20%)
- [ ] Verify heartbeat interval increases
- [ ] Verify animations disabled
- [ ] Verify power save mode active
- [ ] Monitor actual battery drain

#### [ ] 6.8 Testing
- [ ] Test foreground/background transitions
- [ ] Test background mesh toggle
- [ ] Test low battery scenarios
- [ ] Test battery level changes
- [ ] Test mesh pause/resume

#### [ ] 6.9 Verification
- [ ] Run app and monitor battery usage
- [ ] Test background behavior
- [ ] Verify mesh pauses when configured
- [ ] Check for battery drain issues
- [ ] Verify no crashes during transitions

---

## Phase 7: Cleanup and Optimization (Week 9-10)

**Goal**: Remove legacy code, optimize performance

### [ ] 7. Code Cleanup

#### [ ] 7.1 Remove Direct Service Calls
- [ ] Find all direct calls to posts.service
- [ ] Replace with manager/transport calls
- [ ] Find all direct calls to interests.service
- [ ] Replace with manager/transport calls
- [ ] Remove unused service functions
- [ ] Update imports

#### [ ] 7.2 Deprecate Old Action Types
- [ ] Identify action types no longer needed
- [ ] Mark as deprecated with comments
- [ ] Plan removal timeline
- [ ] Update documentation

#### [ ] 7.3 Refactor Services as Transport Implementations
- [ ] Move Supabase logic from services into SupabaseTransport
- [ ] Keep services as thin wrappers (if needed)
- [ ] Or remove services entirely
- [ ] Update all imports
- [ ] Test thoroughly

#### [ ] 7.4 Remove Duplicate Code
- [ ] Find duplicate permission checking logic
- [ ] Find duplicate battery logic
- [ ] Find duplicate peer counting logic
- [ ] Consolidate into managers
- [ ] Remove duplicates

### [ ] 8. Performance Optimization

#### [ ] 8.1 Optimize Event Dispatching
- [ ] Profile event callback performance
- [ ] Batch state updates where possible
- [ ] Debounce frequent events (e.g., peer count changes)
- [ ] Optimize re-renders
- [ ] Measure improvement

#### [ ] 8.2 Optimize Manager Initialization
- [ ] Implement lazy initialization where possible
- [ ] Parallelize independent initializations
- [ ] Reduce initialization time
- [ ] Measure startup time

#### [ ] 8.3 Memory Optimization
- [ ] Profile memory usage
- [ ] Check for memory leaks in subscriptions
- [ ] Optimize peer list storage
- [ ] Optimize post tracking
- [ ] Measure memory footprint

#### [ ] 8.4 Add Performance Monitoring
- [ ] Add timing logs for critical operations
- [ ] Track manager initialization time
- [ ] Track post loading time
- [ ] Track interest expression time
- [ ] Set up performance dashboards

### [ ] 9. Testing & Verification

#### [ ] 9.1 Comprehensive Integration Tests
- [ ] Test complete post creation flow
- [ ] Test complete interest flow
- [ ] Test permission flow
- [ ] Test presence flow
- [ ] Test battery optimization flow
- [ ] Test all edge cases

#### [ ] 9.2 Performance Benchmarking
- [ ] Benchmark app initialization time
- [ ] Benchmark post loading time
- [ ] Benchmark interest expression time
- [ ] Compare with baseline metrics
- [ ] Verify within 10% of baseline

#### [ ] 9.3 Regression Testing
- [ ] Run full test suite
- [ ] Test all existing features
- [ ] Test on multiple devices
- [ ] Test on different Android versions
- [ ] Fix any regressions found

#### [ ] 9.4 User Acceptance Testing
- [ ] Deploy to staging environment
- [ ] Test with internal users
- [ ] Gather feedback
- [ ] Fix critical issues
- [ ] Iterate as needed

### [ ] 10. Documentation

#### [ ] 10.1 Update Architecture Documentation
- [ ] Document new architecture
- [ ] Create architecture diagrams
- [ ] Document data flow
- [ ] Document manager responsibilities
- [ ] Document transport layer

#### [ ] 10.2 Update Developer Documentation
- [ ] Update README with new architecture
- [ ] Document how to add new managers
- [ ] Document how to add new transport implementations
- [ ] Document testing strategies
- [ ] Add troubleshooting guide

#### [ ] 10.3 Create Migration Guide
- [ ] Document what changed
- [ ] Document why it changed
- [ ] Document how to work with new architecture
- [ ] Add code examples
- [ ] Add best practices

#### [ ] 10.4 Update API Documentation
- [ ] Document all manager interfaces
- [ ] Document all hook APIs
- [ ] Document transport interface
- [ ] Add usage examples
- [ ] Add TypeScript types

### [ ] 11. Team Training

#### [ ] 11.1 Conduct Training Sessions
- [ ] Schedule training sessions
- [ ] Present new architecture
- [ ] Walk through code examples
- [ ] Answer questions
- [ ] Record sessions for reference

#### [ ] 11.2 Code Review Guidelines
- [ ] Create code review checklist
- [ ] Document patterns to follow
- [ ] Document anti-patterns to avoid
- [ ] Share with team
- [ ] Enforce in reviews

#### [ ] 11.3 Pair Programming
- [ ] Schedule pair programming sessions
- [ ] Work through examples together
- [ ] Share knowledge
- [ ] Build confidence
- [ ] Rotate pairs

---

## Post-Migration Tasks

### [ ] 12. Monitoring & Maintenance

#### [ ] 12.1 Set Up Monitoring
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Monitor battery usage
- [ ] Set up alerts for anomalies
- [ ] Create dashboards

#### [ ] 12.2 Gather Metrics
- [ ] Track app initialization time
- [ ] Track post loading time
- [ ] Track interest success rate
- [ ] Track permission grant rate
- [ ] Track peer discovery rate

#### [ ] 12.3 User Feedback
- [ ] Collect user feedback
- [ ] Monitor app store reviews
- [ ] Track support tickets
- [ ] Identify pain points
- [ ] Prioritize improvements

#### [ ] 12.4 Iterate & Improve
- [ ] Review metrics regularly
- [ ] Identify optimization opportunities
- [ ] Fix bugs promptly
- [ ] Add improvements
- [ ] Document learnings

---

## Future Enhancements

### [ ] 13. Offline Mode (Future)

#### [ ] 13.1 Implement BluetoothTransport
- [ ] Create `BluetoothTransport.ts`
- [ ] Wrap existing bluetooth.service
- [ ] Wrap existing gossip.service
- [ ] Implement all ITransportRouter methods
- [ ] Test mesh networking

#### [ ] 13.2 Add Transport Switching
- [ ] Detect online/offline state
- [ ] Switch between SupabaseTransport and BluetoothTransport
- [ ] Handle transition smoothly
- [ ] Sync data when coming back online
- [ ] Test switching

#### [ ] 13.3 Add Offline Indicators
- [ ] Show offline mode in UI
- [ ] Indicate which posts are local only
- [ ] Show sync status
- [ ] Add manual sync button
- [ ] Test UI

#### [ ] 13.4 Handle Sync Conflicts
- [ ] Detect conflicts when syncing
- [ ] Implement conflict resolution strategy
- [ ] Show conflicts to user if needed
- [ ] Test conflict scenarios
- [ ] Document behavior

---

## Rollback Plan

### [ ] 14. Rollback Procedures (If Needed)

#### [ ] 14.1 Feature Flag Rollback
- [ ] Disable feature flags for new architecture
- [ ] Verify app works with old code paths
- [ ] Monitor for issues
- [ ] Document rollback reason

#### [ ] 14.2 Code Rollback
- [ ] Revert commits if needed
- [ ] Deploy previous version
- [ ] Verify functionality restored
- [ ] Communicate to team

#### [ ] 14.3 Post-Rollback Analysis
- [ ] Analyze what went wrong
- [ ] Document issues
- [ ] Plan fixes
- [ ] Schedule retry

---

## Success Criteria

### [ ] 15. Verification Checklist

- [ ] All existing features work correctly
- [ ] Performance within 10% of baseline
- [ ] No critical bugs
- [ ] Team is productive with new architecture
- [ ] Documentation is complete
- [ ] Tests are passing
- [ ] User satisfaction maintained or improved
- [ ] Battery usage acceptable
- [ ] Memory usage acceptable
- [ ] Integration complete within timeline

---

**Total Tasks**: 200+  
**Estimated Effort**: 10 weeks  
**Team Size**: 2-3 developers recommended  
**Risk Level**: Medium (mitigated by phased approach)

---

## Notes

- Tasks can be parallelized where dependencies allow
- Each phase should be completed and verified before moving to next
- Feature flags should be used throughout for safe rollback
- Regular team sync-ups recommended (daily or every other day)
- Document any deviations from plan
- Adjust timeline if needed based on actual progress

---

**Document Version**: 1.0  
**Based On**: MOHINI_INTEGRATION_ANALYSIS.md  
**Last Updated**: February 8, 2026
