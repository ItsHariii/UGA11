# Business Logic Layer Integration - Tasks

**Feature**: Integration of Mohini's Business Logic Layer  
**Status**: In Progress - Phase 1 Complete  
**Timeline**: 10 weeks (phased approach)  
**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` for comprehensive analysis

---

## 🎯 INTEGRATION STATUS SUMMARY

### ✅ What Already Exists in NeighborYield

The NeighborYield React Native app already has significant infrastructure:

1. **Transport Layer** ✅ COMPLETE
   - `ITransportRouter` interface defined
   - `SupabaseTransport` implemented and tested
   - All send/fetch/subscription methods working

2. **Hooks** ✅ COMPLETE
   - `usePermissions` - Full permission management
   - `usePeerCount` - Peer tracking and formatting
   - `useTTL` - TTL tracking with auto-purge
   - `useConnectivity` - Mode switching
   - `useBatteryMonitor` - Battery optimization

3. **AppContext** ✅ COMPLETE
   - Comprehensive state management
   - All required actions (posts, interests, peers, permissions, battery)
   - Reducer handles all state updates
   - Context providers ready

4. **Services** ✅ COMPLETE
   - `posts.service.ts` - Supabase post operations
   - `interests.service.ts` - Supabase interest operations
   - `battery.service.ts` - Battery optimization
   - `auth.service.ts` - Authentication
   - All services working and tested

5. **Types** ✅ COMPLETE
   - All required types in `src/types/index.ts`
   - SharePost, InterestAck, InterestResponse, PeerInfo, etc.
   - No type conflicts

6. **Components** ✅ COMPLETE
   - Permission components exist
   - Interest components exist
   - Presence components exist
   - Feed components exist

### ⚠️ What Needs to Be Done

The main work is **copying and integrating Mohini's manager classes**:

1. **Managers** (from `src/managers/`)
   - TTLManager - Event-driven post expiration
   - PermissionManager - Permission request flow
   - PresenceManager - Heartbeat broadcasting
   - InterestManager - Automatic retry logic
   - BatteryManager - Lifecycle management

2. **Integration Work**
   - Connect managers to existing hooks
   - Connect managers to AppContext
   - Coordinate BatteryManager with existing battery.service
   - Add manager event subscriptions in App.tsx

3. **Testing**
   - Test manager instantiation
   - Test manager integration with existing code
   - Verify no regressions

### 📋 Key Insight

**We're NOT building from scratch!** The app already has:
- Working Supabase integration
- Complete state management
- All necessary hooks
- Comprehensive UI components

**We're ADDING** Mohini's manager layer for:
- Event-driven architecture
- Automatic retry logic
- Better separation of concerns
- Lifecycle management

---

## Phase 0: Pre-Migration Setup (Week 0)

### [ ] 0. Team Alignment & Environment Setup

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 12 for detailed setup requirements

- [ ] 0.1 Schedule team meeting to review integration analysis
- [ ] 0.2 Get consensus on phased migration approach
- [ ] 0.3 Set up feature flags system for gradual rollout
- [ ] 0.4 Configure monitoring and alerting
- [ ] 0.5 Prepare staging environment
- [ ] 0.6 Create architecture decision record (ADR)
- [ ] 0.7 Document current baseline performance metrics

---

## Phase 1: Foundation (Week 1-2)

### [x] 1. Transport Layer Implementation ✅ COMPLETED

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 4.1.3 for transport layer details

- [x] 1.1 Create `NeighborYield/src/transport/` directory
- [x] 1.2 Define `ITransportRouter.ts` interface with all required methods
- [x] 1.3 Implement `SupabaseTransport.ts` wrapping existing services
  - [x] 1.3.1 Implement `sendPost()` method
  - [x] 1.3.2 Implement `sendInterest()` method
  - [x] 1.3.3 Implement `sendResponse()` method
  - [x] 1.3.4 Implement `sendHeartbeat()` method
  - [x] 1.3.5 Implement `fetchPosts()` method
  - [x] 1.3.6 Implement `onPostReceived()` subscription
  - [x] 1.3.7 Implement `onInterestReceived()` subscription
  - [x] 1.3.8 Implement `onResponseReceived()` subscription
  - [x] 1.3.9 Add error handling and logging
- [x] 1.4 Write unit tests for SupabaseTransport

**Note**: Transport layer is complete and tested. Supabase services already exist and work well.

### [ ] 2. Copy Mohini's Managers

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 3 for manager details

- [ ] 2.1 Create `NeighborYield/src/managers/` directory
- [ ] 2.2 Copy all manager files from `src/managers/`
  - [ ] 2.2.1 Copy `TTLManager.ts` and `ITTLManager.ts`
  - [ ] 2.2.2 Copy `PermissionManager.ts` and `IPermissionManager.ts`
  - [ ] 2.2.3 Copy `PresenceManager.ts` and `IPresenceManager.ts`
  - [ ] 2.2.4 Copy `InterestManager.ts` and `IInterestManager.ts`
  - [ ] 2.2.5 Copy `BatteryManager.ts` and `IBatteryManager.ts`
- [ ] 2.3 Update import paths for React Native environment
- [ ] 2.4 Adapt managers to use SupabaseTransport
- [ ] 2.5 Verify TypeScript compilation

**Note**: BatteryManager may need coordination with existing `battery.service.ts`

### [ ] 3. Copy Supporting Utilities (OPTIONAL - Most Already Exist)

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 3.2 for utility details

- [ ]* 3.1 Copy `UserIdentifierGenerator.ts` if needed for manager logic
- [ ]* 3.2 Review if `ImageValidator.ts` and `ImageCompressor.ts` are needed
- [ ]* 3.3 `SupabaseMappers.ts` already exists in `src/utils/` - may not need to copy

**Note**: Most utilities already exist in NeighborYield. Only copy if managers specifically need them.

### [x] 4. Type Definitions ✅ ALREADY EXIST

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 3.3 for type system details

**Status**: All required types already exist in `NeighborYield/src/types/index.ts`:
- ✅ `SharePost` - exists
- ✅ `InterestAck` - exists
- ✅ `InterestResponse` - exists
- ✅ `PeerInfo` - exists
- ✅ `HeartbeatPayload` - exists
- ✅ `PermissionStatus` - exists
- ✅ `ConnectivityMode` - exists
- ✅ `RiskTier` - exists
- ✅ All other common types - exist

**Action**: No work needed. Types are comprehensive and match requirements.

### [x] 5. Hooks ✅ ALREADY IMPLEMENTED

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 4.1.4 for hook implementations

**Status**: All required hooks already exist and are fully implemented:
- ✅ `usePermissions.ts` - Complete with permission checking and management
- ✅ `usePeerCount.ts` - Complete with peer tracking and formatting
- ✅ `useTTL.ts` - Complete with expiration tracking and auto-purge
- ✅ `useConnectivity.ts` - Complete with mode switching
- ✅ `useBatteryMonitor.ts` - Complete with battery optimization

**Action**: No work needed. Hooks are production-ready and integrate with AppContext.

### [ ] 6. Integration Tests & Verification

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 10 for testing strategy

- [x] 6.1 Write tests for SupabaseTransport ✅
- [ ] 6.2 Write tests for manager instantiation (after managers are copied)
- [ ] 6.3 Run full test suite
- [ ] 6.4 Verify no regressions in existing features
- [ ] 6.5 Verify performance is unchanged

---

## Phase 2: TTL Integration (Week 3)

### [ ] 7. TTL Manager Integration

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 5.2 for TTL data flow

**Current Status**: 
- ✅ `useTTL` hook already exists with full TTL tracking
- ✅ AppContext already has `REMOVE_EXPIRED_POSTS` action
- ✅ Auto-purge runs every 30 seconds
- ⚠️ Need to integrate Mohini's TTLManager for consistency

- [ ] 7.1 Copy and adapt TTLManager from `src/managers/`
- [ ] 7.2 Initialize TTLManager in App.tsx
  - [ ] 7.2.1 Import TTLManager
  - [ ] 7.2.2 Create instance in useEffect
  - [ ] 7.2.3 Store in state/ref
- [ ] 7.3 Track posts on load
  - [ ] 7.3.1 Call `trackPost()` for each fetched post
  - [ ] 7.3.2 Add logging for tracking
- [ ] 7.4 Track posts on creation
  - [ ] 7.4.1 Call `trackPost()` when user creates post
  - [ ] 7.4.2 Verify TTL calculation
- [ ] 7.5 Subscribe to expiration events
  - [ ] 7.5.1 Add `onPostExpired()` subscription
  - [ ] 7.5.2 Dispatch `REMOVE_EXPIRED_POST` action (already exists in AppContext)
- [ ] 7.6 Add TTL UI indicators (OPTIONAL - may already exist)
  - [ ] 7.6.1 Check if SharePostCard shows remaining TTL
  - [ ] 7.6.2 Add countdown timer if missing
  - [ ] 7.6.3 Add "Expiring Soon" warning if missing
- [ ] 7.7 Test post expiration flow
- [ ] 7.8 Verify no memory leaks from timers

**Note**: Much of TTL functionality already works via hooks. Focus on integrating TTLManager for event-driven architecture.

---

## Phase 3: Permission Integration (Week 4)

### [ ] 8. Permission Manager Integration

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 5.4 for permission flow

**Current Status**:
- ✅ `usePermissions` hook already exists with full functionality
- ✅ AppContext has permission state management
- ✅ Permission components already exist in `src/components/permission/`
- ⚠️ Need to integrate Mohini's PermissionManager for consistency

- [ ] 8.1 Copy and adapt PermissionManager from `src/managers/`
- [ ] 8.2 Initialize PermissionManager in App.tsx
- [ ] 8.3 Connect PermissionManager to existing usePermissions hook
- [ ] 8.4 Check permissions on app launch
- [ ] 8.5 Review existing Permission Explanation Screen
  - [ ] 8.5.1 Check if `PermissionExplanationScreen.tsx` exists
  - [ ] 8.5.2 Update if needed with manager integration
- [ ] 8.6 Test permission flow
  - [ ] 8.6.1 Test permission request flow
  - [ ] 8.6.2 Test granted/denied states
  - [ ] 8.6.3 Test permission status indicators
- [ ] 8.7 Test on fresh device

**Note**: Permission infrastructure already exists. Focus on integrating PermissionManager for event-driven architecture.

---

## Phase 4: Presence Integration (Week 5)

### [ ] 9. Presence Manager Integration

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 5.3 for presence flow

**Current Status**:
- ✅ `usePeerCount` hook already exists with peer tracking
- ✅ AppContext has peer state management (peers Map, peerCount)
- ✅ DynamicIsland and presence components already exist
- ⚠️ Need to integrate Mohini's PresenceManager for heartbeat broadcasting

- [ ] 9.1 Copy and adapt PresenceManager from `src/managers/`
- [ ] 9.2 Initialize PresenceManager in App.tsx
  - [ ] 9.2.1 Create instance with transport
  - [ ] 9.2.2 Call `startBroadcasting()` after permissions
- [ ] 9.3 Connect to transport layer
  - [ ] 9.3.1 Verify heartbeat sending in SupabaseTransport (already implemented)
  - [ ] 9.3.2 Implement `onHeartbeatReceived()` handler
  - [ ] 9.3.3 Test heartbeat flow
- [ ] 9.4 Connect PresenceManager to existing usePeerCount hook
- [ ] 9.5 Verify UI components work with manager
  - [ ] 9.5.1 Check DynamicIsland displays peer count
  - [ ] 9.5.2 Check PresenceTooltip shows peer info
- [ ] 9.6 Implement battery-aware heartbeat intervals
- [ ] 9.7 Test peer discovery with multiple devices

**Note**: Peer tracking infrastructure exists. Focus on integrating PresenceManager for heartbeat broadcasting.

---

## Phase 5: Interest Integration (Week 6-7)

### [ ] 10. Interest Manager Integration

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 5.2 for interest flow

**Current Status**:
- ✅ Interest services already exist (`interests.service.ts`)
- ✅ AppContext has interest state management
- ✅ Interest components already exist
- ⚠️ Need to add Mohini's InterestManager for retry logic

- [ ] 10.1 Copy and adapt InterestManager from `src/managers/`
- [ ] 10.2 Initialize InterestManager in App.tsx
- [ ] 10.3 Subscribe to interest events
  - [ ] 10.3.1 Add `onInterestReceived()` subscription
  - [ ] 10.3.2 Add `onResponseReceived()` subscription
- [ ] 10.4 Connect to AppContext
  - [ ] 10.4.1 Verify `SET_MY_INTEREST` action works
  - [ ] 10.4.2 Verify `ADD_INCOMING_INTEREST` action works
  - [ ] 10.4.3 Verify `UPDATE_INTEREST_STATUS` action works
- [ ] 10.5 Refactor interest expression to use manager
  - [ ] 10.5.1 Update `handleInterestPress` to use InterestManager
  - [ ] 10.5.2 Handle `InterestResult` return value with retry logic
- [ ] 10.6 Update interest components
  - [ ] 10.6.1 Check if InterestNotificationCard shows retry status
  - [ ] 10.6.2 Add retry count indicator if missing
- [ ] 10.7 Verify transport layer methods
  - [ ] 10.7.1 Verify `sendInterest()` in SupabaseTransport (already implemented)
  - [ ] 10.7.2 Verify `sendResponse()` in SupabaseTransport (already implemented)
- [ ] 10.8 Test interest flow with network failures
- [ ] 10.9 Verify no interests are lost

**Note**: Interest infrastructure exists. Focus on adding InterestManager for automatic retry logic.

---

## Phase 6: Battery Integration (Week 8)

### [ ] 11. Battery Manager Integration

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 6 for battery conflicts

**Current Status**:
- ✅ `battery.service.ts` already exists with comprehensive battery management
- ✅ `useBatteryMonitor` hook already exists
- ✅ AppContext has battery state (batteryLevel, isBackgroundMeshEnabled)
- ✅ BackgroundMeshToggle component already exists
- ⚠️ Need to coordinate Mohini's BatteryManager with existing battery.service

**IMPORTANT**: There are TWO battery implementations that need coordination:
1. Existing `battery.service.ts` - handles UI optimizations, animations, background tasks
2. Mohini's `BatteryManager.ts` - handles app lifecycle, mesh networking pause/resume

**Strategy**: Keep both and coordinate them via events

- [ ] 11.1 Copy and adapt BatteryManager from `src/managers/`
- [ ] 11.2 Initialize BatteryManager in App.tsx
- [ ] 11.3 Connect app lifecycle events
  - [ ] 11.3.1 Add AppState change listener
  - [ ] 11.3.2 Call `onAppForeground()` when active
  - [ ] 11.3.3 Call `onAppBackground()` when background
- [ ] 11.4 Coordinate with existing battery.service
  - [ ] 11.4.1 Review responsibilities of each service
  - [ ] 11.4.2 Connect services via events
  - [ ] 11.4.3 BatteryManager handles mesh networking
  - [ ] 11.4.4 battery.service handles UI optimizations
- [ ] 11.5 Subscribe to battery events
  - [ ] 11.5.1 Add `onLowBattery()` subscription
  - [ ] 11.5.2 Update AppContext battery level
- [ ] 11.6 Verify background mesh toggle works
  - [ ] 11.6.1 Check BackgroundMeshToggle component
  - [ ] 11.6.2 Connect to BatteryManager's `setBackgroundMeshEnabled()`
- [ ] 11.7 Test foreground/background transitions
- [ ] 11.8 Monitor battery usage

**Note**: Coordinate two battery systems - don't replace existing battery.service.

---

## Phase 7: Cleanup and Optimization (Week 9-10)

### [ ] 12. Code Cleanup

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 6.2 for service duplication

- [ ] 12.1 Remove direct service calls from AppContext
- [ ] 12.2 Deprecate old action types
- [ ] 12.3 Refactor services as transport implementations
- [ ] 12.4 Remove duplicate code

### [ ] 13. Performance Optimization

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 7 for optimization strategies

- [ ] 13.1 Optimize event dispatching
  - [ ] 13.1.1 Debounce frequent events
  - [ ] 13.1.2 Batch state updates
- [ ] 13.2 Optimize manager initialization
  - [ ] 13.2.1 Implement lazy initialization
  - [ ] 13.2.2 Parallelize independent initializations
- [ ] 13.3 Memory optimization
  - [ ] 13.3.1 Profile memory usage
  - [ ] 13.3.2 Check for memory leaks
- [ ] 13.4 Add performance monitoring

### [ ] 14. Testing & Verification

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 10 for testing strategy

- [ ] 14.1 Comprehensive integration tests
  - [ ] 14.1.1 Test complete post creation flow
  - [ ] 14.1.2 Test complete interest flow
  - [ ] 14.1.3 Test permission flow
  - [ ] 14.1.4 Test presence flow
- [ ] 14.2 Performance benchmarking
  - [ ] 14.2.1 Benchmark app initialization
  - [ ] 14.2.2 Benchmark post loading
  - [ ] 14.2.3 Compare with baseline
- [ ] 14.3 Regression testing
  - [ ] 14.3.1 Run full test suite
  - [ ] 14.3.2 Test on multiple devices
- [ ] 14.4 User acceptance testing

### [ ] 15. Documentation

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` for complete architecture

- [ ] 15.1 Update architecture documentation
- [ ] 15.2 Update developer documentation
- [ ] 15.3 Create migration guide
- [ ] 15.4 Update API documentation

### [ ] 16. Team Training

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 11 for recommendations

- [ ] 16.1 Conduct training sessions
- [ ] 16.2 Create code review guidelines
- [ ] 16.3 Schedule pair programming sessions

---

## Success Criteria

**Reference**: See `docs/MOHINI_INTEGRATION_ANALYSIS.md` Section 13 for complete criteria

- [ ] All 5 managers integrated and functional
- [ ] All existing features work without regression
- [ ] Performance within 10% of baseline
- [ ] All tests passing (>80% coverage)
- [ ] No memory leaks or critical bugs
- [ ] Team trained and productive
- [ ] Documentation complete
- [ ] User satisfaction maintained

---

**Timeline**: 10 weeks  
**Status**: Ready to Begin  
**Next Phase**: Phase 0 - Team Alignment

**Key References**:
- Comprehensive Analysis: `docs/MOHINI_INTEGRATION_ANALYSIS.md`
- Requirements: `.kiro/specs/business-logic-integration/requirements.md`
- Design: `.kiro/specs/business-logic-integration/design.md`
