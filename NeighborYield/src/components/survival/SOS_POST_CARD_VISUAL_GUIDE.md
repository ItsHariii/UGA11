# SOS Post Card - Visual Guide

## Overview

The **SOSPostCard** component displays emergency help requests with high priority, red accent styling, and sticky positioning. It supports responding functionality, resolution tracking, and category badges.

**Requirements:** 5.1-5.10 (SOS / Help Board)

---

## Component Structure

```
┌────────────────────────────────────────────────────────────┐
│ ⚠️ [Medical] [RESOLVED]                                    │ ← Header with icon, category, status
│ ⚠️ Medical emergency - House #126 - 2m ago                │ ← Emergency text (bold)
│ [Responding] 3 responding: #123, #124, #125               │ ← Action button + responders
│ [Mark Resolved]                                            │ ← Author-only button
└────────────────────────────────────────────────────────────┘
```

---

## Visual Specifications

### Layout
- **Padding:** 16px all sides
- **Background:** #161E1A (dark card)
- **Border:** 2px solid #FF5252 (red)
- **Separator:** 1px line #2A3A30

### Colors
- **Red Accent:** #FF5252 (border, button, highlights)
- **Text Primary:** #FFFFFF (white)
- **Text Secondary:** #E8E8E8 (light gray)
- **Category Colors:**
  - Medical: #FF5252 (red)
  - Safety: #FFAB00 (yellow)
  - Fire: #FF6B35 (orange-red)
  - Other: #9E9E9E (gray)

### Typography
- **Post Text:** 16px, bold (600), line-height 24px
- **Category Badge:** 12px, bold (600)
- **Button Text:** 16px, bold (600)
- **Responder Text:** 12px, regular
- **Font Family:** System

### Touch Targets
- **Responding Button:** 44px height (minimum)
- **Mark Resolved Button:** 44px height (minimum)

---

## Component States

### 1. Active SOS (No Responders)
```
┌────────────────────────────────────────────────────────────┐
│ ⚠️ [Safety]                                                │
│ ⚠️ Suspicious activity - House #130 - 10m ago             │
│ [Responding]                                               │
│ [Mark Resolved]                                            │ ← Only if author
└────────────────────────────────────────────────────────────┘
```

### 2. Active SOS (With Responders)
```
┌────────────────────────────────────────────────────────────┐
│ ⚠️ [Medical]                                               │
│ ⚠️ Medical emergency - House #126 - 2m ago                │
│ [Responding] 3 responding: #123, #124, #125               │
│ [Mark Resolved]                                            │ ← Only if author
└────────────────────────────────────────────────────────────┘
```

### 3. Resolved SOS
```
┌────────────────────────────────────────────────────────────┐
│ ⚠️ [Other] [RESOLVED]                                      │
│ ⚠️ Power line down - House #150 - 1h ago                  │ ← Dimmed (60% opacity)
│ (No buttons shown)                                         │
└────────────────────────────────────────────────────────────┘
```

---

## Category Badges

### Medical
```
┌──────────┐
│ Medical  │ ← White text on #FF5252 (red)
└──────────┘
```

### Safety
```
┌──────────┐
│ Safety   │ ← White text on #FFAB00 (yellow)
└──────────┘
```

### Fire
```
┌──────────┐
│ Fire     │ ← White text on #FF6B35 (orange-red)
└──────────┘
```

### Other
```
┌──────────┐
│ Other    │ ← White text on #9E9E9E (gray)
└──────────┘
```

---

## Button Styles

### Responding Button
```
┌──────────────┐
│ Responding   │ ← White text on #FF5252 (red), 44px height
└──────────────┘
```

### Mark Resolved Button
```
┌──────────────────┐
│ Mark Resolved    │ ← Gray text, 1px gray border, 44px height
└──────────────────┘
```

---

## Props Interface

```typescript
interface SOSPostCardProps {
  post: SurvivalPost;           // The SOS post to display
  onRespondPress: () => void;   // Called when "Responding" is pressed
  onResolvePress: () => void;   // Called when "Mark Resolved" is pressed
  isAuthor?: boolean;           // Whether current user is post author
  testID?: string;              // Test identifier
}
```

---

## Usage Examples

### Basic SOS Post
```tsx
<SOSPostCard
  post={{
    t: 's',
    i: 'Medical emergency - need help',
    h: 126,
    ts: Math.floor(Date.now() / 1000) - 120,
    id: 'sos12345',
    c: 'm',
  }}
  onRespondPress={() => console.log('Responding')}
  onResolvePress={() => console.log('Resolved')}
  isAuthor={false}
/>
```

### SOS Post with Responders
```tsx
<SOSPostCard
  post={{
    t: 's',
    i: 'House fire - evacuating',
    h: 145,
    ts: Math.floor(Date.now() / 1000) - 300,
    id: 'sos67890',
    c: 'f',
    r: ['140', '141', '142'],
  }}
  onRespondPress={() => console.log('Responding')}
  onResolvePress={() => console.log('Resolved')}
  isAuthor={true}
/>
```

### Resolved SOS Post
```tsx
<SOSPostCard
  post={{
    t: 's',
    i: 'Power line down',
    h: 150,
    ts: Math.floor(Date.now() / 1000) - 3600,
    id: 'sos11111',
    c: 'o',
    r: ['151', '152'],
    resolved: true,
  }}
  onRespondPress={() => console.log('Responding')}
  onResolvePress={() => console.log('Resolved')}
  isAuthor={false}
/>
```

---

## Accessibility

### Labels
- **Card:** "SOS emergency post: [item] at house number [number], posted [time], category: [category], [count] people responding"
- **Responding Button:** "Responding button" with hint "Tap to indicate you are responding to this emergency"
- **Mark Resolved Button:** "Mark resolved button" with hint "Tap to mark this emergency as resolved"

### Features
- Minimum 44px touch targets
- High contrast colors (WCAG AAA)
- Descriptive labels for screen readers
- Keyboard navigation support

---

## Requirements Mapping

| Requirement | Implementation |
|-------------|----------------|
| 5.1 | Sticky positioning (handled by parent component sorting) |
| 5.2 | Red accent color (#FF5252) and red border |
| 5.3 | Format: "⚠️ [EMERGENCY] - House #[NUMBER] - [TIME]" |
| 5.4 | "Responding" button with 44px height, red color |
| 5.5 | Show list of responders with house numbers |
| 5.6 | Highest Bluetooth priority (handled by parent) |
| 5.7 | Maximum 512 bytes when serialized |
| 5.8 | Persist until marked resolved |
| 5.9 | Alert icon (⚠️) |
| 5.10 | Support categories: Medical, Safety, Fire, Other |

---

## Testing

### Unit Tests
- ✅ Format relative time correctly
- ✅ Format responder list
- ✅ Get category information
- ✅ Display SOS post with correct format
- ✅ Show responding count and responders
- ✅ Handle resolution status
- ✅ Validate post size under 512 bytes
- ✅ Support all category types
- ✅ Provide accessibility labels

### Integration Tests
- ✅ Handle complete SOS post lifecycle
- ✅ Maintain data integrity with multiple responders

---

## Performance Considerations

### Optimizations
- Memoized component with React.memo
- Memoized computed values (useMemo)
- Efficient responder list formatting
- Minimal re-renders

### Size Constraints
- Post serialization < 512 bytes
- Efficient JSON structure
- Abbreviated field names

---

## Sticky Behavior

**Requirement 5.1:** SOS posts should always appear at the top of the feed.

This is implemented at the **parent component level** by:
1. Filtering posts by type (`post.t === 's'`)
2. Sorting SOS posts to the top
3. Rendering unresolved SOS posts first

Example sorting logic:
```typescript
const sortedPosts = posts.sort((a, b) => {
  // SOS posts first
  if (a.t === 's' && b.t !== 's') return -1;
  if (a.t !== 's' && b.t === 's') return 1;
  
  // Unresolved before resolved
  if (a.t === 's' && b.t === 's') {
    if (!a.resolved && b.resolved) return -1;
    if (a.resolved && !b.resolved) return 1;
  }
  
  // Then by timestamp (newest first)
  return b.ts - a.ts;
});
```

---

## Bluetooth Priority

**Requirement 5.6:** SOS messages have highest broadcast priority.

This is implemented at the **gossip protocol level** by:
1. Priority queue: SOS > Want > Have
2. Immediate propagation for SOS messages
3. Retry with exponential backoff

Example priority logic:
```typescript
function getPriority(post: SurvivalPost): number {
  if (post.t === 's') return 3; // Highest
  if (post.t === 'w') return 2;
  if (post.t === 'h') return 1;
  return 0;
}
```

---

## File Structure

```
src/components/survival/
├── SOSPostCard.tsx           # Main component
├── SOSPostCard.test.ts       # Unit tests
├── SOSPostCard.example.tsx   # Usage examples
└── SOS_POST_CARD_VISUAL_GUIDE.md  # This file
```

---

## Related Components

- **HavePostCard** - Display "Have" posts
- **WantPostCard** - Display "Want" posts with "Coming" button
- **SurvivalTabBar** - Two-tab navigation (Community Board / SOS)
- **SurvivalConnectivityIsland** - Simplified header with mesh status

---

## Notes

1. **Sticky Positioning:** Handled by parent component sorting, not CSS
2. **Bluetooth Priority:** Handled by gossip protocol, not component
3. **Resolution:** Only post author can mark as resolved
4. **Categories:** All four categories supported with distinct colors
5. **Size Validation:** All posts validated to be under 512 bytes
6. **Accessibility:** Full WCAG AAA compliance with descriptive labels

---

## Future Enhancements

- [ ] Add sound/vibration alert for new SOS posts
- [ ] Add distance indicator to SOS posts
- [ ] Add estimated response time
- [ ] Add SOS history view
- [ ] Add SOS analytics (response times, resolution rates)
