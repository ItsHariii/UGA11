# Scroll Position Persistence Implementation

## Overview

This document explains the scroll position persistence implementation for the SurvivalTabBar component, fulfilling **Requirements 2.7 and 2.8** from the Survival Mode Simplification specification.

## Requirements

### Requirement 2.7: Instant Tab Switching
> THE tab switch SHALL have no animation (instant)

**Implementation:** All tab switches and scroll restorations use `animated: false` to ensure instant transitions without any animation delays.

### Requirement 2.8: Scroll Position Persistence
> THE tabs SHALL persist scroll position when switching

**Implementation:** Each tab maintains its own independent scroll position that is automatically saved and restored when switching between tabs.

## Components

### SurvivalTabBar
The base tab bar component that provides the UI for switching between Community and SOS tabs.

**Location:** `src/components/survival/SurvivalTabBar.tsx`

**Features:**
- Two-tab segmented control
- High-contrast design for survival mode
- SOS unread badge
- Accessibility support
- Instant tab switching (no animation)

### SurvivalTabBarWithScroll
A wrapper component that adds scroll position persistence to the SurvivalTabBar.

**Location:** `src/components/survival/SurvivalTabBarWithScroll.tsx`

**Features:**
- Automatic scroll position tracking
- Independent scroll positions for each tab
- Instant scroll restoration (no animation)
- Seamless integration with any scrollable content

## Usage

### Basic Usage

```typescript
import { SurvivalTabBarWithScroll } from './components/survival/SurvivalTabBarWithScroll';

function SurvivalModeScreen() {
  return (
    <SurvivalTabBarWithScroll
      communityContent={<CommunityBoard />}
      sosContent={<SOSBoard />}
      sosUnreadCount={3}
    />
  );
}
```

### With Tab Change Callback

```typescript
import { SurvivalTabBarWithScroll } from './components/survival/SurvivalTabBarWithScroll';

function SurvivalModeScreen() {
  const handleTabChange = (tab: 'community' | 'sos') => {
    console.log('Switched to', tab);
    
    // Clear unread count when viewing SOS
    if (tab === 'sos') {
      clearSOSUnreadCount();
    }
  };

  return (
    <SurvivalTabBarWithScroll
      communityContent={<CommunityBoard />}
      sosContent={<SOSBoard />}
      sosUnreadCount={sosUnreadCount}
      onTabChange={handleTabChange}
    />
  );
}
```

### With Custom Initial Tab

```typescript
<SurvivalTabBarWithScroll
  communityContent={<CommunityBoard />}
  sosContent={<SOSBoard />}
  sosUnreadCount={0}
  initialTab="sos"  // Start on SOS tab
/>
```

## How It Works

### 1. Scroll Position Tracking

Each tab has its own scroll position state:

```typescript
const [communityScrollPosition, setCommunityScrollPosition] = useState({ x: 0, y: 0 });
const [sosScrollPosition, setSosScrollPosition] = useState({ x: 0, y: 0 });
```

### 2. Scroll Event Handling

Scroll events are captured and saved:

```typescript
const handleCommunityScroll = (event) => {
  const { x, y } = event.nativeEvent.contentOffset;
  setCommunityScrollPosition({ x, y });
};
```

### 3. Tab Switching

When switching tabs, the scroll position is restored:

```typescript
const handleTabChange = (tab) => {
  setActiveTab(tab);
  
  // Restore scroll position after render
  setTimeout(() => {
    if (tab === 'community') {
      communityScrollRef.current?.scrollTo({
        x: communityScrollPosition.x,
        y: communityScrollPosition.y,
        animated: false,  // Requirement 2.7: No animation
      });
    }
  }, 0);
};
```

### 4. Independent Positions

Each tab maintains its own scroll position independently:

- Community tab scrolled to Y=100
- Switch to SOS tab (starts at Y=0)
- Scroll SOS tab to Y=200
- Switch back to Community tab → **Restored to Y=100**
- Switch back to SOS tab → **Restored to Y=200**

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         SurvivalTabBarWithScroll (Wrapper)              │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         SurvivalTabBar (UI Component)             │ │
│  │  [Community Board]  [SOS]                         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         ScrollView (Community Content)            │ │
│  │  - Tracks scroll position                         │ │
│  │  - Restores position on tab switch                │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         ScrollView (SOS Content)                  │ │
│  │  - Tracks scroll position                         │ │
│  │  - Restores position on tab switch                │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## State Management

### State Variables

```typescript
// Active tab
const [activeTab, setActiveTab] = useState<'community' | 'sos'>('community');

// Scroll positions
const [communityScrollPosition, setCommunityScrollPosition] = useState({ x: 0, y: 0 });
const [sosScrollPosition, setSosScrollPosition] = useState({ x: 0, y: 0 });

// Refs for ScrollView components
const communityScrollRef = useRef<ScrollView>(null);
const sosScrollRef = useRef<ScrollView>(null);

// Flag to track if restoration is needed
const shouldRestoreScroll = useRef(false);
```

### State Flow

1. **User scrolls Community tab**
   - `handleCommunityScroll` is called
   - `communityScrollPosition` is updated to `{ x: 0, y: 100 }`

2. **User switches to SOS tab**
   - `handleTabChange('sos')` is called
   - `shouldRestoreScroll.current = true`
   - `activeTab` is set to `'sos'`
   - Component re-renders with SOS content
   - `setTimeout` restores SOS scroll position (Y=0 initially)

3. **User scrolls SOS tab**
   - `handleSOSScroll` is called
   - `sosScrollPosition` is updated to `{ x: 0, y: 200 }`

4. **User switches back to Community tab**
   - `handleTabChange('community')` is called
   - `shouldRestoreScroll.current = true`
   - `activeTab` is set to `'community'`
   - Component re-renders with Community content
   - `setTimeout` restores Community scroll position to Y=100

## Performance Considerations

### Scroll Event Throttling

```typescript
<ScrollView
  onScroll={handleScroll}
  scrollEventThrottle={16}  // ~60fps
>
```

The `scrollEventThrottle` is set to 16ms (approximately 60 frames per second) to balance smooth tracking with performance.

### Instant Restoration

Scroll restoration uses `animated: false` to ensure instant positioning without animation overhead:

```typescript
scrollRef.current.scrollTo({
  x: savedPosition.x,
  y: savedPosition.y,
  animated: false,  // Instant, no animation
});
```

### Conditional Rendering

Only the active tab's content is rendered, reducing memory usage:

```typescript
{activeTab === 'community' && (
  <ScrollView>{communityContent}</ScrollView>
)}

{activeTab === 'sos' && (
  <ScrollView>{sosContent}</ScrollView>
)}
```

## Testing

### Unit Tests

Location: `src/components/survival/SurvivalTabBarWithScroll.test.ts`

**Test Coverage:**
- ✅ Type validation
- ✅ Scroll position state management
- ✅ Tab switching logic
- ✅ Scroll restoration logic
- ✅ Integration flows
- ✅ Edge cases
- ✅ Requirements validation

**Key Tests:**
- Scroll positions are saved correctly
- Scroll positions are restored correctly
- Each tab maintains independent scroll position
- No animation is used (instant switching)
- Rapid tab switching is handled correctly

### Running Tests

```bash
npm test -- SurvivalTabBarWithScroll.test.ts
```

## Edge Cases Handled

### 1. Rapid Tab Switching
Multiple rapid tab switches are handled gracefully without losing scroll positions.

### 2. Zero Scroll Position
Tabs starting at the top (Y=0) are handled correctly.

### 3. Large Scroll Positions
Very large scroll positions (e.g., Y=5000) are preserved accurately.

### 4. Fractional Positions
Fractional scroll positions (e.g., Y=123.456) are maintained precisely.

### 5. Horizontal Scrolling
Both X and Y scroll positions are tracked and restored.

## Integration with Survival Mode

### Mode Switching

When entering survival mode:

```typescript
function enterSurvivalMode() {
  // Switch to survival theme
  setThemeMode('survival');
  
  // Show survival UI with scroll persistence
  return (
    <SurvivalTabBarWithScroll
      communityContent={<CommunityBoard />}
      sosContent={<SOSBoard />}
      sosUnreadCount={sosCount}
    />
  );
}
```

### Data Persistence

Scroll positions are maintained in memory during the session. If you need to persist across app restarts, consider using AsyncStorage:

```typescript
// Save scroll positions
await AsyncStorage.setItem('community_scroll', JSON.stringify(communityScrollPosition));
await AsyncStorage.setItem('sos_scroll', JSON.stringify(sosScrollPosition));

// Restore scroll positions
const savedCommunityScroll = await AsyncStorage.getItem('community_scroll');
if (savedCommunityScroll) {
  setCommunityScrollPosition(JSON.parse(savedCommunityScroll));
}
```

## Accessibility

The scroll position persistence feature maintains full accessibility:

- **Screen Readers:** Scroll position changes are transparent to screen readers
- **Keyboard Navigation:** Tab switching via keyboard preserves scroll positions
- **Focus Management:** Focus is maintained when switching tabs

## Future Enhancements

Potential improvements for future iterations:

1. **Smooth Scroll Restoration:** Option to animate scroll restoration for better UX
2. **Scroll Position Persistence:** Save positions to AsyncStorage for cross-session persistence
3. **Scroll Position Indicators:** Visual indicators showing saved scroll positions
4. **Scroll Position Reset:** Option to reset scroll positions to top
5. **Scroll Position Sharing:** Share scroll positions across devices via sync

## Troubleshooting

### Scroll Position Not Restoring

**Problem:** Scroll position is not restored when switching tabs.

**Solution:** Ensure the ScrollView ref is properly attached:

```typescript
<ScrollView ref={communityScrollRef}>
```

### Scroll Restoration Delayed

**Problem:** There's a visible delay before scroll position is restored.

**Solution:** The `setTimeout` with 0ms delay is necessary to ensure the ScrollView is mounted. This is a React Native limitation.

### Scroll Position Jumps

**Problem:** Scroll position jumps or flickers when switching tabs.

**Solution:** Ensure `animated: false` is set in the `scrollTo` call to prevent animation.

## References

- **Requirements:** `.kiro/specs/survival-mode-simplification/requirements.md`
- **Design:** `.kiro/specs/survival-mode-simplification/design.md`
- **Tasks:** `.kiro/specs/survival-mode-simplification/tasks.md`
- **Component:** `src/components/survival/SurvivalTabBarWithScroll.tsx`
- **Tests:** `src/components/survival/SurvivalTabBarWithScroll.test.ts`
- **Examples:** `src/components/survival/SurvivalTabBar.example.tsx`

## Summary

The scroll position persistence implementation provides a seamless user experience when switching between Community and SOS tabs in survival mode. By maintaining independent scroll positions for each tab and restoring them instantly without animation, users never lose their place in the feed when navigating between tabs.

**Key Benefits:**
- ✅ Instant tab switching (no animation)
- ✅ Scroll positions preserved across tab switches
- ✅ Independent scroll positions for each tab
- ✅ Smooth scroll tracking (60fps)
- ✅ Handles edge cases gracefully
- ✅ Fully tested and documented
- ✅ Accessible and performant
