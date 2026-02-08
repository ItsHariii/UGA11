# Business Logic Layer Integration - Requirements

**Feature**: Integration of Mohini's Business Logic Layer into NeighborYield React Native App  
**Status**: Draft  
**Created**: February 8, 2026  
**Owner**: Development Team

---

## 1. Overview

### 1.1 Purpose

Integrate Mohini's business logic layer into the existing NeighborYield React Native application to achieve:
- Clean separation of concerns between UI and business logic
- Transport abstraction enabling online/offline modes
- Automatic retry logic for network operations
- Automatic post expiration management
- Structured permission handling
- Lifecycle-aware battery optimization

### 1.2 Background

Mohini has implemented a comprehensive business logic layer with 5 core managers (Battery, Permission, Presence, TTL, Interest) that provide interface-driven, event-based architecture. The current React Native app has direct Supabase integration without this abstraction layer.

### 1.3 Goals

- Integrate all 5 managers without breaking existing functionality
- Maintain or improve app performance (within 10% of baseline)
- Enable future offline mode through transport abstraction
- Improve code maintainability and testability
- Complete integration within 10 weeks using phased approach

### 1.4 Non-Goals

- Implementing offline/mesh mode (future enhancement)
- Redesigning UI components
- Changing database schema
- Modifying authentication system

---

## 2. User Stories

### 2.1 As a Developer

**US-1**: As a developer, I want a clean separation between UI and business logic so that I can test and maintain code more easily.

**Acceptance Criteria**:
- Business logic is centralized in manager classes
- UI components delegate to managers via hooks
- Managers are testable in isolation
- Clear interfaces define manager contracts

**US-2**: As a developer, I want automatic retry logic for network operations so that transient failures don't result in lost data.

**Acceptance Criteria**:
- Interest expressions retry automatically on failure
- Retry uses exponential backoff
- Maximum 3 retry attempts
- UI shows retry status to user
- No interests are lost due to network issues

**US-3**: As a developer, I want transport abstraction so that I can add offline mode in the future without major refactoring.

**Acceptance Criteria**:
- ITransportRouter interface defines transport contract
- SupabaseTransport implements online mode
- BluetoothTransport can be added without changing managers
- Managers work with any transport implementation

### 2.2 As an End User

**US-4**: As a user, I want posts to automatically expire based on urgency so that I don't see stale food sharing offers.

**Acceptance Criteria**:
- Low risk posts expire after 24 hours
- Medium risk posts expire after 12 hours
- High risk posts expire after 6 hours
- Expired posts are automatically removed from feed
- UI shows countdown timer for remaining time
- Warning shown when post is expiring soon (< 5 minutes)

**US-5**: As a user, I want a clear permission request flow so that I understand why the app needs certain permissions.

**Acceptance Criteria**:
- Permission explanation screen shown on first launch
- Each permission has clear explanation of why it's needed
- Permissions requested in logical sequence
- Easy access to system settings if permission denied
- App gracefully handles denied permissions

**US-6**: As a user, I want to see how many neighbors are nearby so that I know if anyone can see my posts.

**Acceptance Criteria**:
- Peer count displayed in Dynamic Island
- Count updates in real-time as peers come/go
- Formatted display (e.g., "3 neighbors nearby")
- Tooltip shows additional peer information

**US-7**: As a user, I want the app to optimize battery usage so that it doesn't drain my phone.

**Acceptance Criteria**:
- Heartbeat interval increases when battery is low
- Animations disabled when battery < 20%
- Power save mode activates automatically
- Mesh networking pauses in background (if configured)
- Low battery warning shown to user

**US-8**: As a user, I want my interest expressions to be reliable so that I don't miss out on food shares.

**Acceptance Criteria**:
- Interest is sent even if network is temporarily unavailable
- Automatic retry if first attempt fails
- Confirmation shown when interest is successfully sent
- Error message shown if all retries fail
- No duplicate interests sent

---

## 3. Functional Requirements

### 3.1 Transport Layer

**FR-1.1**: The system SHALL implement an ITransportRouter interface that defines all transport operations.

**FR-1.2**: The system SHALL implement SupabaseTransport that wraps existing Supabase services.

**FR-1.3**: SupabaseTransport SHALL support:
- Sending posts
- Sending interests
- Sending responses
- Sending heartbeats
- Fetching posts
- Real-time subscriptions for posts, interests, responses, and heartbeats

**FR-1.4**: The transport layer SHALL handle errors gracefully and throw appropriate exceptions.

**FR-1.5**: The transport layer SHALL log all operations for debugging.

### 3.2 TTL Manager

**FR-2.1**: The system SHALL track TTL for all posts based on risk tier.

**FR-2.2**: TTL durations SHALL be:
- Low risk: 24 hours (86,400,000 ms)
- Medium risk: 12 hours (43,200,000 ms)
- High risk: 6 hours (21,600,000 ms)

**FR-2.3**: The system SHALL automatically remove expired posts from state.

**FR-2.4**: The system SHALL fire expiration events that UI can subscribe to.

**FR-2.5**: The system SHALL provide remaining TTL for any tracked post.

**FR-2.6**: The system SHALL check for expired posts every 30 seconds.

**FR-2.7**: UI SHALL display remaining TTL as countdown timer (e.g., "5h 23m").

**FR-2.8**: UI SHALL show "Expiring Soon" warning when TTL < 5 minutes.

### 3.3 Permission Manager

**FR-3.1**: The system SHALL check all required permissions on app launch.

**FR-3.2**: Required permissions SHALL include:
- Bluetooth
- Location (required by Android for Bluetooth)
- Nearby Devices

**FR-3.3**: The system SHALL request permissions in sequence with explanations.

**FR-3.4**: The system SHALL detect permission state changes.

**FR-3.5**: The system SHALL provide method to open system settings.

**FR-3.6**: The system SHALL determine if mesh networking can be used based on permissions.

**FR-3.7**: UI SHALL show permission explanation screen on first launch if permissions not granted.

**FR-3.8**: UI SHALL show current status for each permission.

**FR-3.9**: UI SHALL provide "Fix" button for denied permissions.

### 3.4 Presence Manager

**FR-4.1**: The system SHALL broadcast presence heartbeats at configurable intervals.

**FR-4.2**: The system SHALL track active peers based on received heartbeats.

**FR-4.3**: The system SHALL remove peers that haven't sent heartbeat in 30 seconds.

**FR-4.4**: The system SHALL provide current peer count.

**FR-4.5**: The system SHALL provide list of active peers with metadata.

**FR-4.6**: The system SHALL fire events when peer count changes.

**FR-4.7**: The system SHALL allow battery manager to adjust heartbeat interval.

**FR-4.8**: UI SHALL display peer count in Dynamic Island.

**FR-4.9**: UI SHALL format peer count appropriately (e.g., "1 neighbor" vs "3 neighbors").

### 3.5 Interest Manager

**FR-5.1**: The system SHALL implement automatic retry for interest expressions.

**FR-5.2**: Retry logic SHALL use exponential backoff (1s, 2s, 4s).

**FR-5.3**: Maximum retry attempts SHALL be 3.

**FR-5.4**: The system SHALL maintain queue of pending interests.

**FR-5.5**: The system SHALL fire events when interests are received.

**FR-5.6**: The system SHALL fire events when responses are received.

**FR-5.7**: The system SHALL prevent duplicate interest expressions.

**FR-5.8**: UI SHALL show retry status during interest expression.

**FR-5.9**: UI SHALL show success confirmation when interest is sent.

**FR-5.10**: UI SHALL show error message if all retries fail.

### 3.6 Battery Manager

**FR-6.1**: The system SHALL monitor device battery level.

**FR-6.2**: The system SHALL handle app lifecycle events (foreground/background).

**FR-6.3**: The system SHALL manage background mesh preference.

**FR-6.4**: The system SHALL fire low battery events when level < 20%.

**FR-6.5**: The system SHALL provide current Nearby state.

**FR-6.6**: The system SHALL pause mesh networking in background if configured.

**FR-6.7**: The system SHALL resume mesh networking when returning to foreground.

**FR-6.8**: The system SHALL coordinate with existing battery.service for UI optimizations.

**FR-6.9**: UI SHALL show low battery warning.

**FR-6.10**: UI SHALL provide toggle for background mesh preference.

### 3.7 App Context Integration

**FR-7.1**: AppContext SHALL initialize all managers on app launch.

**FR-7.2**: AppContext SHALL subscribe to all manager events.

**FR-7.3**: AppContext SHALL dispatch actions in response to manager events.

**FR-7.4**: AppContext reducer SHALL handle manager-driven state updates.

**FR-7.5**: AppContext SHALL clean up managers on unmount.

**FR-7.6**: AppContext SHALL handle manager initialization errors gracefully.

### 3.8 Hook Implementation

**FR-8.1**: The system SHALL provide usePermissions hook for permission management.

**FR-8.2**: The system SHALL provide usePeerCount hook for presence tracking.

**FR-8.3**: The system SHALL provide useTTL hook for post expiration.

**FR-8.4**: The system SHALL provide useConnectivity hook for transport status.

**FR-8.5**: All hooks SHALL handle subscription cleanup automatically.

**FR-8.6**: All hooks SHALL provide loading states where appropriate.

**FR-8.7**: All hooks SHALL handle errors gracefully.

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-1.1**: App initialization time SHALL NOT increase by more than 10%.

**NFR-1.2**: Post loading time SHALL NOT increase by more than 10%.

**NFR-1.3**: Interest expression time SHALL NOT increase by more than 10%.

**NFR-1.4**: Memory usage SHALL NOT increase by more than 50MB.

**NFR-1.5**: Manager event dispatching SHALL complete within 100ms.

**NFR-1.6**: TTL checking SHALL NOT block UI thread.

### 4.2 Reliability

**NFR-2.1**: The system SHALL NOT lose any user data during migration.

**NFR-2.2**: The system SHALL handle network failures gracefully.

**NFR-2.3**: The system SHALL recover from manager initialization failures.

**NFR-2.4**: The system SHALL prevent memory leaks from subscriptions.

**NFR-2.5**: The system SHALL maintain data consistency across managers.

### 4.3 Maintainability

**NFR-3.1**: All managers SHALL follow interface-driven design.

**NFR-3.2**: All managers SHALL be testable in isolation.

**NFR-3.3**: All managers SHALL have comprehensive unit tests.

**NFR-3.4**: All integration points SHALL be documented.

**NFR-3.5**: All public APIs SHALL have TypeScript type definitions.

**NFR-3.6**: Code SHALL follow existing project style guidelines.

### 4.4 Compatibility

**NFR-4.1**: The system SHALL work on Android API level 21+.

**NFR-4.2**: The system SHALL work with existing Supabase schema.

**NFR-4.3**: The system SHALL work with existing authentication system.

**NFR-4.4**: The system SHALL maintain backward compatibility during migration.

**NFR-4.5**: The system SHALL support gradual rollout via feature flags.

### 4.5 Security

**NFR-5.1**: The system SHALL NOT expose sensitive data in logs.

**NFR-5.2**: The system SHALL validate all data at transport boundaries.

**NFR-5.3**: The system SHALL use existing authentication for all operations.

**NFR-5.4**: The system SHALL handle permission denials securely.

### 4.6 Usability

**NFR-6.1**: Permission explanations SHALL be clear and concise.

**NFR-6.2**: Error messages SHALL be user-friendly.

**NFR-6.3**: Loading states SHALL provide feedback to user.

**NFR-6.4**: Retry operations SHALL be transparent to user.

**NFR-6.5**: UI SHALL remain responsive during background operations.

---

## 5. Technical Requirements

### 5.1 Architecture

**TR-1.1**: The system SHALL use event-driven architecture for manager communication.

**TR-1.2**: The system SHALL use dependency injection for manager initialization.

**TR-1.3**: The system SHALL use TypeScript for all new code.

**TR-1.4**: The system SHALL follow React Native best practices.

**TR-1.5**: The system SHALL use React hooks for state management.

### 5.2 Testing

**TR-2.1**: All managers SHALL have unit tests with >80% coverage.

**TR-2.2**: All transport implementations SHALL have integration tests.

**TR-2.3**: All hooks SHALL have unit tests.

**TR-2.4**: Critical flows SHALL have end-to-end tests.

**TR-2.5**: Performance benchmarks SHALL be established and monitored.

### 5.3 Dependencies

**TR-3.1**: The system SHALL use existing React Native dependencies.

**TR-3.2**: The system SHALL use existing Supabase client.

**TR-3.3**: The system SHALL NOT introduce new major dependencies.

**TR-3.4**: The system SHALL use existing testing framework (Jest).

### 5.4 Migration

**TR-4.1**: Migration SHALL be phased over 10 weeks.

**TR-4.2**: Each phase SHALL be independently testable.

**TR-4.3**: Each phase SHALL maintain backward compatibility.

**TR-4.4**: Feature flags SHALL control rollout of new functionality.

**TR-4.5**: Rollback procedures SHALL be documented and tested.

---

## 6. Constraints

### 6.1 Technical Constraints

**C-1.1**: Must work within React Native environment.

**C-1.2**: Must work with existing Supabase backend.

**C-1.3**: Must not break existing features during migration.

**C-1.4**: Must maintain existing database schema.

**C-1.5**: Must work with existing authentication system.

### 6.2 Resource Constraints

**C-2.1**: Timeline: 10 weeks for complete integration.

**C-2.2**: Team size: 2-3 developers.

**C-2.3**: Testing resources: Existing test infrastructure.

**C-2.4**: No additional budget for new tools or services.

### 6.3 Business Constraints

**C-3.1**: Must not disrupt active users during migration.

**C-3.2**: Must maintain app store rating during migration.

**C-3.3**: Must not increase app size significantly.

**C-3.4**: Must not increase battery usage significantly.

---

## 7. Assumptions

**A-1**: Mohini's managers are production-ready and well-tested.

**A-2**: Existing Supabase services work correctly.

**A-3**: Team has React Native and TypeScript expertise.

**A-4**: Existing test infrastructure is adequate.

**A-5**: Users will accept permission request flow.

**A-6**: Network conditions allow for retry logic to be effective.

**A-7**: Battery optimization will not negatively impact user experience.

---

## 8. Dependencies

### 8.1 Internal Dependencies

**D-1.1**: Mohini's manager implementations (src/managers/).

**D-1.2**: Mohini's utility functions (src/utils/).

**D-1.3**: Mohini's type definitions (src/types/).

**D-1.4**: Existing React Native app (NeighborYield/).

**D-1.5**: Existing Supabase services.

### 8.2 External Dependencies

**D-2.1**: React Native framework.

**D-2.2**: Supabase client library.

**D-2.3**: TypeScript compiler.

**D-2.4**: Jest testing framework.

**D-2.5**: Android Nearby Connections API (for future offline mode).

---

## 9. Success Criteria

### 9.1 Functional Success

**SC-1.1**: All 5 managers are integrated and functional.

**SC-1.2**: All existing features continue to work.

**SC-1.3**: Post expiration works automatically.

**SC-1.4**: Interest retry logic works reliably.

**SC-1.5**: Permission flow is clear and functional.

**SC-1.6**: Peer count displays accurately.

**SC-1.7**: Battery optimization reduces power usage.

### 9.2 Technical Success

**SC-2.1**: All tests pass (unit, integration, e2e).

**SC-2.2**: Performance within 10% of baseline.

**SC-2.3**: No memory leaks detected.

**SC-2.4**: No critical bugs in production.

**SC-2.5**: Code coverage >80% for new code.

### 9.3 Team Success

**SC-3.1**: Team understands new architecture.

**SC-3.2**: Team can work productively with managers.

**SC-3.3**: Documentation is complete and clear.

**SC-3.4**: Code reviews are smooth and efficient.

### 9.4 User Success

**SC-4.1**: User satisfaction maintained or improved.

**SC-4.2**: No increase in support tickets.

**SC-4.3**: App store rating maintained.

**SC-4.4**: No user-reported data loss.

**SC-4.5**: Battery life acceptable to users.

---

## 10. Risks and Mitigation

### 10.1 Technical Risks

**Risk**: Breaking existing features during integration.  
**Severity**: High  
**Mitigation**: Phased approach, feature flags, comprehensive testing.

**Risk**: Performance degradation.  
**Severity**: Medium  
**Mitigation**: Benchmarking, profiling, optimization.

**Risk**: Memory leaks from subscriptions.  
**Severity**: Medium  
**Mitigation**: Careful cleanup, memory profiling, testing.

**Risk**: Integration bugs.  
**Severity**: High  
**Mitigation**: Extensive testing, staged rollout, monitoring.

### 10.2 Team Risks

**Risk**: Team resistance to new architecture.  
**Severity**: Medium  
**Mitigation**: Training, documentation, pair programming.

**Risk**: Knowledge silos.  
**Severity**: Low  
**Mitigation**: Code reviews, knowledge sharing, documentation.

**Risk**: Timeline overrun.  
**Severity**: Medium  
**Mitigation**: Realistic estimates, buffer time, regular reviews.

### 10.3 User Risks

**Risk**: User confusion with permission flow.  
**Severity**: Low  
**Mitigation**: Clear explanations, user testing, feedback.

**Risk**: Increased battery drain.  
**Severity**: Medium  
**Mitigation**: Battery optimization, monitoring, user controls.

---

## 11. Out of Scope

The following are explicitly out of scope for this integration:

**OS-1**: Implementing offline/mesh networking mode (future enhancement).

**OS-2**: Redesigning UI components or visual design.

**OS-3**: Changing database schema or backend architecture.

**OS-4**: Modifying authentication or authorization system.

**OS-5**: Adding new features beyond manager integration.

**OS-6**: Supporting iOS platform (Android only for now).

**OS-7**: Implementing AI risk classification (already exists).

**OS-8**: Adding new transport implementations beyond Supabase.

---

## 12. Acceptance Criteria Summary

The integration will be considered complete and successful when:

1. ✅ All 5 managers (Battery, Permission, Presence, TTL, Interest) are integrated
2. ✅ All existing app features work without regression
3. ✅ Post expiration works automatically based on risk tier
4. ✅ Interest expressions retry automatically on failure
5. ✅ Permission flow is clear and functional
6. ✅ Peer count displays accurately in real-time
7. ✅ Battery optimization reduces power usage
8. ✅ Performance is within 10% of baseline
9. ✅ All tests pass (>80% coverage)
10. ✅ No memory leaks or critical bugs
11. ✅ Team is trained and productive
12. ✅ Documentation is complete
13. ✅ User satisfaction maintained
14. ✅ Integration completed within 10 weeks

---

## 13. References

- **Integration Analysis**: `docs/MOHINI_INTEGRATION_ANALYSIS.md`
- **Integration Summary**: `docs/INTEGRATION_SUMMARY.md`
- **Task List**: `docs/INTEGRATION_TASKS.md`
- **Mohini's Code**: `src/managers/`, `src/utils/`, `src/types/`
- **Existing App**: `NeighborYield/`

---

**Document Status**: Ready for Design Phase  
**Next Steps**: Create design document with detailed architecture and implementation plan  
**Approval Required**: Development Team Lead, Product Owner

---

**Version**: 1.0  
**Last Updated**: February 8, 2026  
**Author**: Development Team
