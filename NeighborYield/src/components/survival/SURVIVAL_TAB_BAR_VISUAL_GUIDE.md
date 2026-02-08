# SurvivalTabBar Visual Guide

## Component Overview

The `SurvivalTabBar` is a two-tab segmented control designed for survival mode. It provides instant switching between the Community Board and SOS sections with high contrast and minimal animations.

## Visual Layout

### Default State (Community Tab Active)
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Community Board          SOS                             │
│  ────────────                                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### SOS Tab Active (No Unread)
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Community Board          SOS                             │
│                           ───                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### SOS Tab Active (With Unread Badge)
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Community Board          SOS (5)                         │
│                           ───────                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Dimensions

### Height
- **Total Height**: 44px (minimum touch target)
- **Underline Height**: 2px

### Touch Targets
- **Each Tab**: 50% width, 44px height
- **Minimum Touch Target**: ✅ 44px (WCAG AAA compliant)

## Color Scheme

### Survival Mode Colors

#### Active Tab
- **Text Color**: `#E8F5E9` (White/Light Green)
- **Underline Color**: `#4AEDC4` (Mint Green)
- **Font Weight**: 600

#### Inactive Tab
- **Text Color**: `#A5D6A7` (Gray/Muted Green)
- **Font Weight**: 600

#### Background
- **Tab Bar Background**: `#121A16` (Dark Green-Gray)

#### Badge (SOS Unread Count)
- **Background**: `#FF5252` (Red)
- **Text Color**: `#FFFFFF` (White)
- **Font Weight**: 700
- **Size**: 20px diameter (minimum)

## Typography

### Font Specifications
- **Font Family**: System (default)
- **Font Size**: 16px
- **Font Weight**: 600 (semibold)
- **Line Height**: Default

## States

### 1. Community Tab Active
```
State: activeTab = 'community'
Visual:
  - "Community Board" text: White (#E8F5E9)
  - "Community Board" underline: Mint green (#4AEDC4), 2px
  - "SOS" text: Gray (#A5D6A7)
  - "SOS" underline: None
```

### 2. SOS Tab Active (No Unread)
```
State: activeTab = 'sos', sosUnreadCount = 0
Visual:
  - "Community Board" text: Gray (#A5D6A7)
  - "Community Board" underline: None
  - "SOS" text: White (#E8F5E9)
  - "SOS" underline: Mint green (#4AEDC4), 2px
  - Badge: Hidden
```

### 3. SOS Tab Active (With Unread)
```
State: activeTab = 'sos', sosUnreadCount = 5
Visual:
  - "Community Board" text: Gray (#A5D6A7)
  - "Community Board" underline: None
  - "SOS" text: White (#E8F5E9)
  - "SOS (5)" badge: Red circle (#FF5252) with white text
  - "SOS" underline: Mint green (#4AEDC4), 2px
```

### 4. Community Tab Active (SOS Has Unread)
```
State: activeTab = 'community', sosUnreadCount = 3
Visual:
  - "Community Board" text: White (#E8F5E9)
  - "Community Board" underline: Mint green (#4AEDC4), 2px
  - "SOS" text: Gray (#A5D6A7)
  - "SOS (3)" badge: Red circle (#FF5252) with white text
  - "SOS" underline: None
```

## Interactions

### Tab Press Behavior
1. **User taps inactive tab**
   - Instant switch (no animation)
   - Active tab text changes to white
   - Active tab shows mint green underline
   - Previous active tab text changes to gray
   - Previous active tab underline disappears

2. **User taps active tab**
   - No action (already active)
   - No callback fired

### Badge Behavior
- **Shows when**: `sosUnreadCount > 0`
- **Hides when**: `sosUnreadCount === 0`
- **Updates**: Immediately when count changes
- **Position**: Right of "SOS" text, 8px gap

## Accessibility

### Screen Reader Announcements

#### Community Tab
- **Active**: "Community Board tab, selected"
- **Inactive**: "Community Board tab"

#### SOS Tab (No Unread)
- **Active**: "SOS tab, selected"
- **Inactive**: "SOS tab"

#### SOS Tab (With Unread)
- **Active**: "SOS tab, 5 unread, selected"
- **Inactive**: "SOS tab, 5 unread"

### Keyboard Navigation
- **Tab Key**: Moves focus between tabs
- **Enter/Space**: Activates focused tab
- **Focus Indicator**: System default (high contrast)

### ARIA Attributes
- **Role**: `tab`
- **State**: `selected` (true/false)
- **Label**: Descriptive text with count and state

## Animation

### Tab Switch
- **Duration**: 0ms (instant)
- **Easing**: None
- **Reason**: Battery efficiency, survival mode philosophy

### Badge Appearance
- **Duration**: 0ms (instant)
- **Easing**: None
- **Reason**: Immediate feedback for emergency notifications

## Responsive Behavior

### Width
- **Each Tab**: 50% of container width
- **Container**: 100% of parent width

### Height
- **Fixed**: 44px (does not change)

### Text Overflow
- **Behavior**: Text should not overflow
- **Labels**: Short and concise ("Community Board", "SOS")

## Integration Example

### In Survival Mode Screen
```
┌────────────────────────────────────────────────────────────┐
│ 📡 Mesh Active    3 neighbors    🔋 45%  2m               │ ← Connectivity Island (48px)
├────────────────────────────────────────────────────────────┤
│  Community Board          SOS (2)                         │ ← Tab Bar (44px)
│  ────────────                                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Community Board Content]                                │ ← Content Area
│  - Have posts                                             │
│  - Want posts                                             │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Comparison with Abundance Mode

### Survival Mode (This Component)
- **Tabs**: 2 (Community Board, SOS)
- **Style**: High contrast, dark background
- **Animation**: None (instant)
- **Height**: 44px
- **Colors**: Mint green accent, white/gray text

### Abundance Mode (Not This Component)
- **Tabs**: 5 (Feed, Map, Create, Messages, Settings)
- **Style**: Warm earthy tones, light background
- **Animation**: Smooth transitions
- **Height**: Variable
- **Colors**: Forest green accent, dark text

## Performance Characteristics

### Rendering
- **Memoized**: Yes (`React.memo`)
- **Re-renders**: Only when props change
- **Callbacks**: Memoized with `useCallback`

### Memory
- **Footprint**: Minimal (~1KB)
- **Allocations**: Static styles, no dynamic allocations

### Battery Impact
- **Animations**: None (0% battery impact)
- **Repaints**: Minimal (only on tab change)
- **CPU Usage**: Negligible

## Testing Coverage

### Unit Tests (21 tests)
- ✅ Type validation
- ✅ Props handling
- ✅ Tab switching logic
- ✅ Badge display logic
- ✅ Accessibility labels
- ✅ Constants validation
- ✅ Integration scenarios

### Visual Regression Tests
- 🔲 Not yet implemented (future work)

### Accessibility Tests
- ✅ Screen reader labels
- ✅ Keyboard navigation
- ✅ Touch target size
- ✅ Contrast ratios

## Browser/Platform Support

### React Native
- ✅ iOS
- ✅ Android
- ✅ Web (React Native Web)

### Minimum Versions
- React Native: 0.70+
- React: 18.0+
- TypeScript: 4.5+

## Known Limitations

1. **Fixed Labels**: Tab labels are hardcoded ("Community Board", "SOS")
2. **Two Tabs Only**: Not designed for more than 2 tabs
3. **No Custom Styling**: Uses theme tokens exclusively
4. **No Animation**: By design (survival mode requirement)

## Future Enhancements

### Potential Improvements
- [ ] Haptic feedback on tab press
- [ ] Badge animation for new SOS messages
- [ ] Custom tab labels (if needed)
- [ ] Swipe gesture support
- [ ] Visual regression tests

### Not Planned (By Design)
- ❌ More than 2 tabs (survival mode is minimal)
- ❌ Animations (battery efficiency)
- ❌ Custom colors (theme-based only)
- ❌ Vertical orientation (horizontal only)

## Conclusion

The `SurvivalTabBar` component is a production-ready, fully accessible, and battery-efficient two-tab segmented control designed specifically for survival mode. It provides instant tab switching, high contrast visuals, and comprehensive accessibility support while maintaining minimal battery impact.

**Status**: ✅ **Production Ready**
