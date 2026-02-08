# SurvivalModeState Implementation

## Overview

This document describes the implementation of the `SurvivalModeState` interface and associated state management system for the survival mode feature.

## Implementation Details

### SurvivalModeState Interface

The `SurvivalModeState` interface manages all state for survival mode:

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
  batteryConfig: SurvivalBatteryConfig;
  powerSaveMode: boolean;
  
  // User State
  userHouseNumber: number;
}
```

### Action Types

Four categories of actions are defined for state management:

#### 1. PostAction
Manages survival mode posts:
- `ADD_POST` - Add a new post to the list
- `REMOVE_POST` - Remove a post by ID
- `UPDATE_POST` - Update specific fields of a post
- `MERGE_POSTS` - Merge received posts (with deduplication)
- `ADD_RESPONDER` - Add a responder to a Want/SOS post
- `RESOLVE_SOS` - Mark an SOS post as resolved

#### 2. UIAction
Manages UI state:
- `SET_ACTIVE_TAB` - Switch between 'community' and 'sos' tabs
- `TOGGLE_CREATE_FORM` - Toggle the post creation form
- `SET_CREATING` - Set the creating state explicitly

#### 3. NetworkAction
Manages network/mesh state:
- `UPDATE_PEER_COUNT` - Set the number of connected peers
- `SET_DISCOVERING` - Set the discovering state
- `UPDATE_SYNC_TIME` - Update the last sync timestamp
- `PEER_CONNECTED` - Increment peer count when a peer connects
- `PEER_DISCONNECTED` - Decrement peer count when a peer disconnects

#### 4. BatteryAction
Manages battery state:
- `UPDATE_BATTERY` - Update battery level and auto-configure settings
- `TOGGLE_POWER_SAVE` - Toggle power save mode
- `SET_POWER_SAVE` - Set power save mode explicitly
- `UPDATE_BATTERY_CONFIG` - Update battery configuration

### Reducer Function

The `survivalModeReducer` function handles all state transitions:

```typescript
function survivalModeReducer(
  state: SurvivalModeState,
  action: SurvivalModeAction
): SurvivalModeState
```

Key features:
- **Immutable updates** - Always returns a new state object
- **Type-safe** - Uses discriminated unions for actions
- **Comprehensive** - Handles all state management scenarios
- **Deduplication** - Prevents duplicate posts when merging
- **Validation** - Ensures state consistency (e.g., peer count >= 0)

### Helper Functions

#### createInitialSurvivalModeState
Creates the initial state for survival mode:

```typescript
function createInitialSurvivalModeState(
  userHouseNumber: number,
  initialBatteryLevel: number = 100
): SurvivalModeState
```

Features:
- Sets up empty posts array
- Initializes UI to 'community' tab
- Configures battery settings based on initial level
- Sets current timestamp for lastSyncTime

## Usage Examples

### Basic State Management

```typescript
// Create initial state
let state = createInitialSurvivalModeState(123, 75);

// Add a post
const post = createSurvivalPost('h', 'Fresh tomatoes', 123);
state = survivalModeReducer(state, { type: 'ADD_POST', post });

// Switch to SOS tab
state = survivalModeReducer(state, { type: 'SET_ACTIVE_TAB', tab: 'sos' });

// Update network state
state = survivalModeReducer(state, { type: 'UPDATE_PEER_COUNT', count: 3 });

// Update battery
state = survivalModeReducer(state, { type: 'UPDATE_BATTERY', level: 25 });
```

### Post Lifecycle

```typescript
// Create and add a Want post
const wantPost = createSurvivalPost('w', 'Need milk', 123);
state = survivalModeReducer(state, { type: 'ADD_POST', post: wantPost });

// Add responders
state = survivalModeReducer(state, {
  type: 'ADD_RESPONDER',
  postId: wantPost.id,
  houseNumber: '124',
});

// Update the post
state = survivalModeReducer(state, {
  type: 'UPDATE_POST',
  postId: wantPost.id,
  updates: { i: 'Need milk urgently' },
});

// Remove the post
state = survivalModeReducer(state, {
  type: 'REMOVE_POST',
  postId: wantPost.id,
});
```

### Merging Posts from Mesh Network

```typescript
// Receive posts from a peer
const receivedPosts = [post1, post2, post3];

// Merge with local posts (deduplicates automatically)
state = survivalModeReducer(state, {
  type: 'MERGE_POSTS',
  posts: receivedPosts,
});
```

### Battery-Aware Behavior

```typescript
// Battery drops to 15%
state = survivalModeReducer(state, { type: 'UPDATE_BATTERY', level: 15 });

// State automatically updates:
// - batteryLevel: 15
// - batteryConfig.discoveryInterval: 60000 (60 seconds)
// - batteryConfig.animationsEnabled: false
// - powerSaveMode: true
```

## Integration with React

The state management system is designed to work with React's `useReducer` hook:

```typescript
function SurvivalModeScreen() {
  const [state, dispatch] = useReducer(
    survivalModeReducer,
    createInitialSurvivalModeState(userHouseNumber)
  );

  // Add a post
  const handleAddPost = (post: SurvivalPost) => {
    dispatch({ type: 'ADD_POST', post });
  };

  // Switch tabs
  const handleTabChange = (tab: 'community' | 'sos') => {
    dispatch({ type: 'SET_ACTIVE_TAB', tab });
  };

  // Update battery
  useEffect(() => {
    const interval = setInterval(() => {
      const level = getBatteryLevel(); // Platform-specific
      dispatch({ type: 'UPDATE_BATTERY', level });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <View>
      {/* Render UI based on state */}
    </View>
  );
}
```

## Testing

Comprehensive unit tests cover:
- ✅ Initial state creation
- ✅ All post actions (add, remove, update, merge, responders, resolve)
- ✅ All UI actions (tab switching, form toggling)
- ✅ All network actions (peer count, discovery, sync time)
- ✅ All battery actions (level updates, power save mode)
- ✅ State immutability
- ✅ Complex state transitions
- ✅ Edge cases (duplicate responders, negative peer count, etc.)

**Test Results:** 33/33 tests passing ✅

## Requirements Coverage

This implementation satisfies the following requirements:

- **Requirement 1 (Connectivity Island):** Network state tracking (peerCount, isDiscovering, lastSyncTime)
- **Requirement 2 (Two-Tab Interface):** UI state tracking (activeTab)
- **Requirement 3-5 (Post Management):** Posts array with full CRUD operations
- **Requirement 6 (Battery-Aware):** Battery state tracking with automatic configuration
- **Requirement 7 (Minimal Data Model):** Uses SurvivalPost interface
- **Requirement 9 (Gossip Protocol):** MERGE_POSTS action for peer synchronization
- **All Requirements:** Comprehensive state management for entire survival mode

## Files

- **Interface Definition:** `src/types/index.ts`
- **Unit Tests:** `src/types/SurvivalModeState.test.ts`
- **Documentation:** `src/types/SURVIVAL_MODE_STATE_IMPLEMENTATION.md` (this file)

## Next Steps

With the state management system in place, the next tasks are:

1. **Task 2:** Implement SurvivalConnectivityIsland component
2. **Task 3:** Implement SurvivalTabBar component
3. **Task 4-6:** Implement post card components (Have, Want, SOS)
4. **Task 7:** Implement SurvivalPostCreator component
5. **Task 8:** Implement battery monitoring hook
6. **Task 9:** Implement gossip protocol
7. **Task 10:** Implement mode switching logic
8. **Task 11:** Integrate with App.tsx

## Notes

- The reducer is pure and side-effect free
- All state updates are immutable
- Battery configuration is automatically updated when battery level changes
- Post deduplication happens automatically during merge operations
- The system is designed to work seamlessly with React's useReducer hook
