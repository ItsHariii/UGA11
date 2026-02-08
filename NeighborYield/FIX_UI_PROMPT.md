# Prompt to Fix NeighborYield UI Issues

## Current Problems

1. **Missing descriptions** - Post descriptions are not showing on feed cards
2. **Missing author names** - Author identifiers are not visible
3. **Extra spacing** - Too much whitespace between cards and around the layout
4. **Looks the same** - Abundance and Survival modes look nearly identical
5. **Cards look bad** - The overall visual design is poor

## What Should Be Visible

### In Abundance Mode (Online):
- **Large featured cards** for high-risk items with:
  - Post title (large, bold)
  - Full description (2-4 lines)
  - Author name (e.g., "Neighbor-A3F9")
  - Risk tier badge (colored: red for high, orange for medium, green for low)
  - Time remaining
  - Category icon (carrot, bread, etc.)
  - Rounded corners (12px)
  - Soft shadows
  - Rich colors
- **Bento Grid layout** - asymmetric grid with varying card sizes
- **Gradient header** background
- **Smooth animations** between mode changes

### In Survival Mode (Offline/Disconnected):
- **Single column list** - all cards same width
- **Compact cards** with:
  - Title only (no description)
  - Icon instead of images
  - Sharp corners (2px)
  - No shadows
  - High contrast colors
  - Minimal padding
- **Dark theme** with green accents

## Investigation Needed

Please investigate and fix:

1. **Check DualModeFeedCard rendering**:
   - Is the title rendering? 
   - Is the description rendering?
   - Is the author name rendering?
   - What does `isCompact` evaluate to?
   - Are the styles being applied correctly?

2. **Check BentoGrid layout**:
   - What sizes are being assigned to each card?
   - Is the gap too large?
   - Are dimensions calculated correctly?
   - Is it actually using BentoGrid or falling back to FlatList?

3. **Check theme switching**:
   - Is the mode actually changing when tapping Dynamic Island?
   - Are the correct tokens being applied?
   - Is modeConfig returning the right values?

4. **Debug the rendering**:
   - Add console.logs to see what's being rendered
   - Check if posts data is correct
   - Verify all props are being passed correctly

## Files to Check

1. `src/components/feed/DualModeFeedCard.tsx` - Main card component
2. `src/components/layout/BentoGrid.tsx` - Grid layout
3. `src/components/feed/FeedList.tsx` - Feed container
4. `src/theme/tokens.ts` - Design tokens
5. `App.tsx` - Mock data and theme provider

## Expected Fix

After fixing, I should see:
- ✅ Post titles clearly visible
- ✅ Descriptions showing on larger cards in abundance mode
- ✅ Author names visible
- ✅ Risk tier badges with colors
- ✅ Proper spacing (not too much, not too little)
- ✅ Clear visual difference between abundance and survival modes
- ✅ Bento grid with different sized cards in abundance mode
- ✅ Single column in survival mode

## Debug Steps

1. Add console.log in DualModeFeedCard to see:
   ```typescript
   console.log('Card rendering:', {
     title: post.title,
     description: post.description,
     author: post.authorIdentifier,
     mode,
     size,
     isCompact,
   });
   ```

2. Add console.log in BentoGrid to see:
   ```typescript
   console.log('Grid items:', items.map(i => ({ 
     title: i.data.title, 
     size: i.size, 
     priority: i.priority 
   })));
   ```

3. Check if FeedList is using BentoGrid:
   ```typescript
   console.log('Using Bento Layout:', useBentoLayout);
   ```

4. Verify theme mode:
   ```typescript
   console.log('Current theme mode:', themeMode);
   ```

## Quick Fixes to Try

1. **Force show descriptions**: In DualModeFeedCard, temporarily remove the `!isCompact` check
2. **Reduce spacing**: In BentoGrid, change `gap` from 8 to 4
3. **Force larger sizes**: In assignCardSize, make all high-risk items return 'featured'
4. **Check author rendering**: Make sure authorIdentifier is in the JSX

Please investigate these issues systematically and fix the UI so it looks professional and the descriptions/names are visible.
