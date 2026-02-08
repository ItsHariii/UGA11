# Implementation Plan: Knit Backend Integration

## Overview

This plan implements the core knit backend integration to enable functional offline mesh networking in NeighborYield. The focus is on MVP functionality: getting mesh networking working with automatic mode switching.

## Tasks

- [x] 1. Set up Android Native Module for Nearby Connections
  - Create `android/app/src/main/java/com/neighboryield/NearbyConnectionsModule.kt`
  - Implement `startAdvertising`, `startDiscovery`, `stopAll` methods
  - Implement `sendPayload` and `broadcastPayload` methods
  - Set up event emitters for `onPayloadReceived`, `onEndpointFound`, `onEndpointLost`
  - Register module in `MainApplication.kt`
  - Add required permissions to `AndroidManifest.xml`
  - _Requirements: 1.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ] 2. Integrate nearbyAdapter from knit backend
  - [x] 2.1 Copy nearbyAdapter.ts to NeighborYield
    - Copy `src/knit backend/transport/nearbyAdapter.ts` to `NeighborYield/src/transport/nearbyAdapter.ts`
    - Copy `src/knit backend/transport/types.ts` to `NeighborYield/src/transport/types.ts`
    - Copy `src/knit backend/transport/constants.ts` to `NeighborYield/src/transport/constants.ts`
    - Update import paths to match NeighborYield structure
    - _Requirements: 1.1_

  - [x] 2.2 Replace bluetooth.service.ts stub with nearbyAdapter
    - Update `gossip.service.ts` to import and use nearbyAdapter
    - Replace `sendViaBluetooth` stub with `nearbyAdapter.broadcastPayload`
    - Initialize nearbyAdapter in `gossip.service.initialize()`
    - Set up payload received handler to call `gossip.service.receiveMessage`
    - _Requirements: 1.3, 1.4_

- [ ] 3. Implement message size management
  - [x] 3.1 Add message size calculation
    - Create `calculateMessageSize(message: string): number` function
    - Use TextEncoder to get accurate byte size
    - _Requirements: 10.1_

  - [x] 3.2 Add message compression
    - Install compression library (e.g., `lz-string` or `pako`)
    - Create `compressMessage(message: string): string` function
    - Create `decompressMessage(compressed: string): string` function
    - Apply compression when message exceeds 512 bytes
    - _Requirements: 10.2_

  - [x] 3.3 Add message chunking
    - Create `splitIntoChunks(message: string, maxSize: number): MessageChunk[]` function
    - Create `reassembleChunks(chunks: MessageChunk[]): string` function
    - Add chunk metadata (messageId, chunkIndex, totalChunks)
    - Handle chunk reassembly with timeout
    - _Requirements: 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 4. Enhance mode-switching.service.ts for hybrid mode
  - [x] 4.1 Add hybrid mode support
    - Update `AppMode` type to include 'hybrid'
    - Update `checkConnectivity()` to detect hybrid mode (both online and mesh available)
    - Implement `enterHybridMode()` method
    - Update mode transition logic to handle hybrid mode
    - _Requirements: 2.1, 2.3_

  - [x] 4.2 Integrate nearbyAdapter lifecycle
    - Update `startBluetoothMesh()` to use nearbyAdapter instead of bluetoothService
    - Call `nearbyAdapter.startAdvertising()` and `nearbyAdapter.startDiscovery()`
    - Call `nearbyAdapter.stopAll()` in `stopBluetoothMesh()`
    - _Requirements: 1.3_

  - [x] 4.3 Add NetInfo integration
    - Install `@react-native-community/netinfo`
    - Subscribe to NetInfo state changes
    - Update mode based on connectivity changes
    - _Requirements: 3.4, 7.1, 7.2, 7.3_

- [ ] 5. Implement hybrid mode message routing
  - [x] 5.1 Update posts.service.ts for hybrid routing
    - Check current mode before sending posts
    - In hybrid mode, send via both Supabase and mesh
    - In online mode, send via Supabase only
    - In offline mode, send via mesh only
    - _Requirements: 2.2, 5.1_

  - [x] 5.2 Update interests.service.ts for hybrid routing
    - Check current mode before expressing interest
    - Route interests through appropriate transport(s)
    - _Requirements: 5.2_

- [ ] 6. Implement heartbeat system
  - [x] 6.1 Copy heartbeat module from knit backend
    - Copy `src/knit backend/transport/heartbeat.ts` to `NeighborYield/src/transport/heartbeat.ts`
    - Update imports to match NeighborYield structure
    - _Requirements: 4.2_

  - [x] 6.2 Add heartbeat broadcasting
    - Create heartbeat interval timer (30s foreground, 60s background)
    - Broadcast heartbeat with device ID, timestamp, battery level, peer count
    - _Requirements: 11.1, 11.2_

  - [x] 6.3 Add heartbeat processing
    - Listen for incoming heartbeat messages
    - Update peer last-seen timestamps
    - Mark peers inactive after 60s timeout
    - _Requirements: 11.3, 11.4, 11.5_

- [ ] 7. Implement data synchronization
  - [x] 7.1 Add mesh-to-cloud sync
    - Identify mesh-only posts when transitioning to online mode
    - Upload posts to Supabase in priority order (SOS, WANT, HAVE)
    - Mark synced posts as cloud-backed
    - _Requirements: 7.5, 12.1, 12.2, 12.4_

  - [x] 7.2 Add sync error handling
    - Implement retry with exponential backoff for failed syncs
    - Save sync progress for resumption after interruption
    - Deduplicate posts by ID before uploading
    - _Requirements: 12.5, 12.6, 12.7_

- [ ] 8. Add error handling and resilience
  - [ ] 8.1 Add transport failure handling
    - Implement retry logic with exponential backoff (1s, 2s, 4s, 8s)
    - Queue messages when transport unavailable
    - Log errors with context for debugging
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 8.2 Add graceful degradation
    - Detect when native module is unavailable
    - Fall back to online-only mode if mesh unavailable
    - Handle permission denied scenarios
    - _Requirements: 6.8_

- [ ] 9. Add battery-aware discovery intervals
  - Update discovery interval based on battery level
  - Use 15s for >50%, 30s for 20-50%, 60s for <20%
  - Integrate with existing `useBatteryMonitor` hook
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 10. Add configuration support
  - Create configuration file for knit backend settings
  - Add mesh enable/disable flag
  - Add configurable discovery intervals, max connections, message size limits
  - Load configuration at app startup
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 11. Update UI indicators
  - Update connectivity island to show hybrid mode
  - Show peer count in survival mode
  - Display sync progress during mesh-to-cloud sync
  - _Requirements: 7.7, 11.6, 12.3_

- [ ] 12. Integration and testing
  - Test mesh networking with 2+ Android devices
  - Test mode transitions (online ↔ offline ↔ hybrid)
  - Test message transmission and reception
  - Verify backward compatibility with existing features
  - _Requirements: 13.1, 13.2, 13.7, 14.1_

## Notes

- This is an MVP implementation focused on core functionality
- Property-based tests are optional for MVP
- Focus on getting mesh networking working reliably
- Hybrid mode provides resilience but can be refined later
- Configuration allows easy enable/disable of mesh features
