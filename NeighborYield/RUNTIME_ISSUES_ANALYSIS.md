# Runtime Issues Analysis & Fix Plan

## Date: 2026-02-07

## Summary of Issues

The app is experiencing multiple runtime errors after implementing the Double Stack UI overhaul. This document analyzes the root causes and provides a comprehensive fix plan.

---

## Issue 1: "Cannot read property 'AnimatedView' of undefined"

### Error Location
- Component: `AnimatedGridItem` in `BentoGrid.tsx`
- Stack: BentoGrid → FeedList → AppContent

### Root Cause Analysis
The `BentoGrid` component is trying to use `Animated.View` from `react-native-reanimated`, but the Reanimated library is not properly initialized or imported.

**Likely causes:**
1. Missing Reanimated plugin configuration in `babel.config.js`
2. Incorrect import statement for Reanimated components
3. Version mismatch between Reanimated and React Native

### Evidence
- Error: `Cannot read property 'AnimatedView' of undefined`
- This indicates `Animated` object exists but doesn't have `AnimatedView` property
- Reanimated 3.x requires proper Babel plugin setup

---

## Issue 2: Theme Context Provider Hierarchy

### Root Cause Analysis
The `AnimatedThemeProvider` was updated to wrap children with `ThemeProvider`, but this creates a nested provider structure that may cause issues.

**Current structure:**
```
AnimatedThemeProvider
  └─ ThemeProvider (added in fix)
      └─ children
```

**Problem:**
- Both providers try to access `useAppContext`
- Potential double-rendering of context
- May cause performance issues

---

## Issue 3: Reanimated Version Compatibility

### Current Versions
- React Native: 0.73.6
- React Native Reanimated: 3.6.3 (downgraded from 3.8.1)
- React Native SVG: 14.1.0

### Compatibility Matrix
- RN 0.73.6 supports Reanimated 3.3.x - 3.6.x
- Reanimated 3.6.3 requires specific Babel plugin configuration
- Must have `react-native-reanimated/plugin` in babel.config.js

---

## Fix Plan

### Phase 1: Verify Babel Configuration (CRITICAL)

**Action:** Check and update `babel.config.js`

**Required configuration:**
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // MUST be last
  ],
};
```

**Why:** Reanimated 3.x requires the Babel plugin to transform animated components at build time.

---

### Phase 2: Fix BentoGrid Reanimated Usage

**Action:** Review and fix `BentoGrid.tsx` imports and usage

**Check for:**
1. Correct import: `import Animated from 'react-native-reanimated'`
2. Proper component usage: `Animated.View` not `Animated.AnimatedView`
3. Worklet functions properly marked with `'worklet'` directive

**Files to review:**
- `src/components/layout/BentoGrid.tsx`
- Any component using Reanimated animations

---

### Phase 3: Simplify Theme Provider Architecture

**Action:** Refactor theme provider to avoid double-wrapping

**Options:**
1. Make `AnimatedThemeProvider` provide both contexts internally
2. Remove `ThemeProvider` wrapper and have `AnimatedThemeProvider` provide `ThemeContext` directly
3. Update components to use `useAnimatedTheme` consistently

**Recommended:** Option 2 - Single provider that exposes both contexts

---

### Phase 4: Clear Build Cache

**Action:** Clear all caches and rebuild

**Commands:**
```bash
# Clear Metro bundler cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Clear React Native cache
npx react-native start --reset-cache

# Clear Android build cache
cd android && ./gradlew clean && cd ..

# Reinstall node_modules
rm -rf node_modules
npm install
```

---

### Phase 5: Verify All Reanimated Components

**Action:** Audit all components using Reanimated

**Components to check:**
1. `BentoGrid.tsx` - AnimatedGridItem
2. `RadarRipple.tsx` - Animated circles
3. `ThemeAnimator.ts` - Color interpolation
4. `AnimatedThemeProvider.tsx` - Shared values
5. `ConnectionCelebration.tsx` - Celebration animation
6. `GradientHeader.tsx` - Gradient transitions
7. `DualModeFeedCard.tsx` - Layout animations

**Verify each has:**
- Correct imports
- Proper worklet directives
- Compatible API usage for Reanimated 3.6.3

---

## Priority Order

1. **CRITICAL:** Fix Babel configuration (Phase 1)
2. **HIGH:** Fix BentoGrid Reanimated usage (Phase 2)
3. **MEDIUM:** Clear build cache (Phase 4)
4. **MEDIUM:** Verify all Reanimated components (Phase 5)
5. **LOW:** Simplify theme provider (Phase 3)

---

## Expected Outcomes

After implementing all fixes:
1. ✅ App builds without errors
2. ✅ No runtime errors on launch
3. ✅ Animations work smoothly
4. ✅ Theme transitions function correctly
5. ✅ All components render properly

---

## Rollback Plan

If fixes don't work:
1. Revert to pre-Double-Stack-UI state
2. Implement UI overhaul incrementally
3. Test each component individually before integration

---

## Next Steps

1. Read and verify `babel.config.js`
2. Read and fix `BentoGrid.tsx`
3. Clear caches and rebuild
4. Test app launch
5. Verify animations work
6. Document any remaining issues

