# UI Integration Issues

## Issues Identified

### 1. Missing Description on High-Risk Items
**Problem:** High-risk items don't show their description text

**Root Cause:** 
- High-risk items with high priority should get 'featured' or 'wide' size
- But they're being assigned 'small' size
- Small cards hide descriptions (`isCompact = true` when `size === 'small'`)

**Fix Needed:**
- Verify `assignCardSize` function is correctly prioritizing high-risk items
- High risk + high priority should = 'featured' (2x2)
- High risk OR high priority should = 'wide' (2x1)

### 2. Extra Space in Layout
**Problem:** There's extra spacing in the feed

**Possible Causes:**
1. BentoGrid gap settings
2. Card padding in different modes
3. Container margins
4. Empty space from grid layout algorithm

**Fix Needed:**
- Check BentoGrid gap prop (default is 8)
- Verify card dimensions calculation
- Check for unnecessary container padding

### 3. UI Looks Similar Between Modes
**Problem:** Abundance and Survival modes look too similar

**Expected Differences:**

**Abundance Mode:**
- Rounded corners (12px)
- Soft shadows
- Rich colors
- Asymmetric Bento Grid layout
- Full descriptions visible
- Gradient backgrounds

**Survival Mode:**
- Sharp corners (2px)
- No shadows
- High contrast
- Single column list
- Compact layout
- Icons instead of images
- Minimal padding

**Fix Needed:**
- Verify theme is actually switching
- Check if modeConfig is being applied correctly
- Ensure BentoGrid collapses to single column in survival mode

## Action Plan

### Step 1: Fix Size Assignment
Check and fix the `assignCardSize` function to ensure high-risk items get larger sizes.

### Step 2: Verify Theme Switching
Add console logs or visual indicators to confirm theme mode is changing.

### Step 3: Adjust Spacing
Reduce gap and padding values if needed.

### Step 4: Enhance Visual Differences
Make mode differences more pronounced:
- Increase border radius difference
- Add more color contrast
- Ensure grid vs list layout is obvious

