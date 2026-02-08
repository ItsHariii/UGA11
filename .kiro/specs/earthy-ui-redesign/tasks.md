# Implementation Plan: Earthy UI Redesign

## Overview

This plan updates the NeighborYield color palette, border radii, and navigation layout. It builds on the existing Double Stack UI theme system — only token values and component styles change, plus a new floating bottom tab bar replaces the top tabs.

## Tasks

- [x] 1. Update design token color values
  - [x] 1.1 Update abundance token colors in tokens.ts
    - In `src/theme/tokens.ts`, update `abundanceTokens` with the new earthy palette values
    - backgroundPrimary: `#F5F0E8`, backgroundSecondary: `#FAF7F2`, backgroundCard: `#FFFDF8`
    - accentPrimary: `#2D5A3D`, accentSecondary: `#6B8F71`, accentSuccess: `#5A8A5E`
    - accentWarning: `#D4943A`, accentDanger: `#C75B3F`
    - textPrimary: `#2C2C2C`, textSecondary: `#6B6560`, textMuted: `#A09A93`, textAccent: `#2D5A3D`
    - borderDefault: `#E5DDD3`, borderFocus: `#2D5A3D`, shadowColor: `rgba(0, 0, 0, 0.08)`
    - _Requirements: 1.1-1.14_

  - [x] 1.2 Update survival token colors in tokens.ts
    - In `src/theme/tokens.ts`, update `survivalTokens` with cool mint accent values
    - backgroundPrimary: `#0D1210`, backgroundSecondary: `#121A16`, backgroundCard: `#161E1A`
    - accentPrimary: `#4AEDC4`, accentSecondary: `#7AF2D4`, accentSuccess: `#4AEDC4`
    - textAccent: `#4AEDC4`, textMuted: `#4AEDC4`
    - borderDefault: `#2A3A30`, borderFocus: `#4AEDC4`
    - _Requirements: 2.1-2.7_

  - [ ]* 1.3 Write property tests for token values
    - **Property 1: Abundance Palette Values**
    - **Property 2: Survival Palette Values**
    - **Validates: Requirements 1.1-1.14, 2.1-2.7**

- [x] 2. Update border radii across components
  - [x] 2.1 Update DualModeFeedCard border radii
    - In `src/components/feed/DualModeFeedCard.tsx`, update `abundanceModeConfig.borderRadius` from 16 to 20
    - Update `categoryBubble` borderRadius from 10 to 14
    - Update `riskBadge` borderRadius from 6 to 10
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 2.2 Update InterestedButton border radius
    - In `src/components/feed/InterestedButton.tsx`, update button borderRadius from 8 to 14
    - _Requirements: 3.2_

  - [x] 2.3 Update InterestNotificationCard border radii
    - In `src/components/interest/InterestNotificationCard.tsx`, update container borderRadius from 12 to 16
    - Update button borderRadius from 8 to 12
    - _Requirements: 3.5, 3.6_

  - [ ]* 2.4 Write property tests for feed card border radius
    - **Property 3: Feed Card Border Radius By Mode**
    - **Validates: Requirements 3.1**

- [x] 3. Adopt design tokens in components with hardcoded colors
  - [x] 3.1 Update InterestedButton to use theme tokens
    - In `src/components/feed/InterestedButton.tsx`, import and use `useTheme` hook
    - Replace hardcoded `#2e7d32` background with `tokens.colors.accentPrimary`
    - Replace hardcoded `#1b5e20` success background with a darker variant of accentPrimary
    - Replace hardcoded `#c62828` error background with `tokens.colors.accentDanger`
    - _Requirements: 5.1_

  - [x] 3.2 Update InterestNotificationCard to use theme tokens
    - In `src/components/interest/InterestNotificationCard.tsx`, import and use `useTheme` hook
    - Replace hardcoded `#ffffff` container background with `tokens.colors.backgroundCard`
    - Replace hardcoded `#2e7d32` border and text colors with `tokens.colors.accentPrimary`
    - Replace hardcoded `#9e9e9e` timestamp color with `tokens.colors.textMuted`
    - Replace hardcoded `#616161` message color with `tokens.colors.textSecondary`
    - Replace hardcoded `#212121` post title color with `tokens.colors.textPrimary`
    - Replace hardcoded button colors with token values
    - Replace hardcoded shadow color with `tokens.colors.shadowColor`
    - _Requirements: 5.2_

  - [ ]* 3.3 Write property tests for token adoption
    - **Property 6: Interest Button Token Adoption**
    - **Property 7: Interest Notification Card Token Adoption**
    - **Validates: Requirements 5.1, 5.2**

- [x] 4. Replace top tabs with floating bottom tab bar
  - [x] 4.1 Create FloatingTabBar in App.tsx
    - In `App.tsx`, create a FloatingTabBar component using lucide-react-native icons (Newspaper, PlusCircle, Settings)
    - Position absolutely at bottom 24px, centered, ~70% screen width
    - borderRadius 28, shadow offset(0,8) blur 32 rgba(0,0,0,0.15)
    - Padding: 8 vertical, 6 horizontal
    - Abundance background: `rgba(45, 90, 61, 0.92)`, Survival: `rgba(13, 18, 16, 0.95)`
    - Active tab: white icon + dot indicator below, Inactive: white icon opacity 0.6
    - Icons only, no text labels
    - Add subtle scale animation on press using Animated
    - _Requirements: 4.1-4.12_

  - [x] 4.2 Remove top tab bar and update layout
    - In `App.tsx`, remove the `<View style={styles.tabs}>` section and related tab styles
    - Add `paddingBottom: 90` to the main content area (`screenContent` style)
    - Render FloatingTabBar as last child inside SafeAreaView
    - _Requirements: 4.13, 4.14_

  - [ ]* 4.3 Write property tests for floating tab bar
    - **Property 4: Floating Tab Bar Mode Background**
    - **Property 5: Floating Tab Bar Active Tab Indicator**
    - **Validates: Requirements 4.3, 4.4, 4.9, 4.10**

- [ ] 5. Final validation
  - Verify the app renders correctly with the new palette in both modes
  - Ensure all existing tests still pass
  - Confirm the floating tab bar navigates between screens correctly

## Notes

- Tasks marked with `*` are optional property-based tests
- The existing theme infrastructure (ThemeContext, AnimatedThemeProvider, ThemeAnimator) requires no changes
- DynamicIsland already uses `useTheme` so it picks up the new colors automatically (Requirement 5.3)
- The App header already uses `animatedColors` so it picks up the new palette automatically (Requirement 5.4)
