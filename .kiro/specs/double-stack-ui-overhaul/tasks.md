# Implementation Plan: NeighborYield Double Stack UI Overhaul

## Overview

This implementation plan breaks down the Double Stack UI overhaul into incremental coding tasks. The approach prioritizes establishing the theme foundation first, then building animated components, and finally integrating everything with the existing codebase. Property-based tests are included to validate correctness properties from the design document.

## Tasks

- [x] 1. Set up theme foundation and design tokens
  - [x] 1.1 Create design token type definitions and constants
    - Create `src/theme/tokens.ts` with ColorTokens, SpacingTokens, TypographyTokens, AnimationTokens interfaces
    - Define abundanceTokens and survivalTokens color constants
    - Export shared spacing and typography values
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

  - [ ]* 1.2 Write property tests for token structure completeness
    - **Property 2: Token Structure Completeness**
    - **Validates: Requirements 1.4**

  - [ ]* 1.3 Write property tests for survival mode contrast requirements
    - **Property 3: Survival Mode Contrast Requirements**
    - **Validates: Requirements 1.6**

  - [x] 1.4 Create ThemeContext and useTheme hook
    - Create `src/theme/ThemeContext.tsx` with ThemeProvider component
    - Implement useTheme hook returning current tokens based on connectivity mode
    - Integrate with existing AppContext connectivity state
    - _Requirements: 1.2, 1.3, 1.7_

  - [ ]* 1.5 Write property tests for mode-token mapping
    - **Property 1: Mode-Token Mapping Consistency**
    - **Property 4: useTheme Hook Mode Consistency**
    - **Validates: Requirements 1.2, 1.3, 1.7**

- [-] 2. Implement theme animation system
  - [x] 2.1 Create ThemeAnimator with Reanimated integration
    - Create `src/theme/ThemeAnimator.ts` with useThemeAnimator hook
    - Implement color interpolation using useDerivedValue and interpolateColor
    - Add transition progress shared value with 300-500ms duration
    - Handle transition interruption with smooth redirection
    - _Requirements: 2.1, 2.2, 2.5, 2.6_

  - [ ]* 2.2 Write property tests for transition timing
    - **Property 5: Transition Timing Bounds**
    - **Validates: Requirements 2.2**

  - [ ]* 2.3 Write property tests for luminance direction
    - **Property 6: Luminance Direction During Transitions**
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 2.4 Write property tests for transition interruption
    - **Property 7: Transition Interruption Handling**
    - **Validates: Requirements 2.6**

  - [x] 2.5 Create AnimatedThemeProvider combining context and animations
    - Create `src/theme/AnimatedThemeProvider.tsx` wrapping ThemeContext
    - Export animated color values as shared values
    - Trigger transitions on connectivity mode changes
    - _Requirements: 2.1, 2.3, 2.4_

- [x] 3. Checkpoint - Theme system validation
  - Ensure all theme tests pass, ask the user if questions arise.

- [x] 4. Build Radar Ripple animation component
  - [x] 4.1 Create RadarRipple component with Reanimated
    - Create `src/components/animations/RadarRipple.tsx`
    - Implement 3 concentric ripple rings with staggered timing
    - Use withRepeat and withSequence for continuous animation
    - Add peer discovery directional highlight capability
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 4.2 Write property tests for radar peer discovery
    - **Property 19: Radar Peer Discovery Highlight**
    - **Validates: Requirements 6.4**

  - [x] 4.3 Create RadarRipple performance optimizations
    - Implement reduced frame rate option for battery savings
    - Add isActive prop to completely stop animation when inactive
    - Use useAnimatedStyle with minimal dependencies
    - _Requirements: 6.7_

- [x] 5. Build Connectivity Dynamic Island component
  - [x] 5.1 Create DynamicIsland base component
    - Create `src/components/connectivity/DynamicIsland.tsx`
    - Implement mode-specific icon and label rendering
    - Add peer count badge for offline/hybrid modes
    - Integrate RadarRipple for discovery state
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.2 Write property tests for Dynamic Island
    - **Property 8: Dynamic Island Mode Display**
    - **Property 9: Dynamic Island Peer Count Visibility**
    - **Property 10: Dynamic Island Radar Visibility**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 5.3 Add Dynamic Island theme integration and interactions
    - Apply theme tokens for mode-appropriate styling
    - Implement animated height transitions between states
    - Add onDisconnectedPress callback handling
    - _Requirements: 3.5, 3.6, 3.7_

  - [ ]* 5.4 Write property tests for Dynamic Island styling and callbacks
    - **Property 11: Dynamic Island Styling By Mode**
    - **Property 12: Dynamic Island Disconnected Callback**
    - **Validates: Requirements 3.5, 3.6**

- [x] 6. Checkpoint - Animation components validation
  - Ensure all animation component tests pass, ask the user if questions arise.

- [x] 7. Build Dual-Mode Feed Card component
  - [x] 7.1 Create DualModeFeedCard component
    - Create `src/components/feed/DualModeFeedCard.tsx`
    - Implement abundance mode with rich imagery, shadows, rounded corners
    - Implement survival mode with lucide icons, sharp corners, compact layout
    - Reuse existing SharePostCard logic for data display
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

  - [ ]* 7.2 Write property tests for Feed Card styling
    - **Property 13: Feed Card Mode Styling**
    - **Property 14: Feed Card Required Fields**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.6**

  - [x] 7.3 Add Feed Card animated transitions
    - Implement layout animation using Reanimated
    - Animate border radius, shadow, and padding changes
    - Ensure no external asset loading in survival mode
    - _Requirements: 4.5, 4.7_

  - [ ]* 7.4 Write property tests for survival mode asset loading
    - **Property 27: Survival Mode Asset Loading**
    - **Validates: Requirements 9.1**

- [x] 8. Build Bento Grid layout system
  - [x] 8.1 Create BentoGrid component with size calculations
    - Create `src/components/layout/BentoGrid.tsx`
    - Implement card size calculations (small, wide, tall, featured)
    - Create size assignment algorithm based on priority and risk tier
    - Use FlatList with optimized rendering
    - _Requirements: 5.1, 5.2, 5.3, 5.6_

  - [ ]* 8.2 Write property tests for Bento Grid sizing
    - **Property 15: Bento Grid Size Support**
    - **Property 16: Bento Grid Size Assignment**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 8.3 Add Bento Grid survival mode collapse
    - Implement single-column list layout for survival mode
    - Add animated layout transition between grid and list
    - Preserve scroll position during mode transitions
    - _Requirements: 5.4, 5.5, 5.7_

  - [ ]* 8.4 Write property tests for Bento Grid mode behavior
    - **Property 17: Bento Grid Survival Collapse**
    - **Property 18: Bento Grid Scroll Preservation**
    - **Validates: Requirements 5.4, 5.7**

- [x] 9. Checkpoint - Core components validation
  - Ensure all core component tests pass, ask the user if questions arise.

- [x] 10. Build Pantry Scanner UI redesign
  - [x] 10.1 Create dual-mode PantryScanner component
    - Create `src/components/scanner/PantryScanner.tsx`
    - Implement abundance mode with camera viewfinder and decorative overlays
    - Implement survival mode with minimal viewfinder and high-contrast guides
    - Add manual entry fallback interface
    - _Requirements: 7.1, 7.2, 7.5_

  - [ ]* 10.2 Write property tests for Pantry Scanner
    - **Property 20: Pantry Scanner Mode Styling**
    - **Property 21: Pantry Scanner Camera State**
    - **Property 22: Pantry Scanner Manual Entry**
    - **Validates: Requirements 7.3, 7.4, 7.5**

  - [x] 10.3 Add Pantry Scanner camera management
    - Disable camera preview in survival mode for battery conservation
    - Display scan results using DualModeFeedCard
    - Animate transitions between camera and results views
    - _Requirements: 7.3, 7.4, 7.6_

- [x] 11. Build Neighbor Map component
  - [x] 11.1 Create dual-mode NeighborMap component
    - Create `src/components/map/NeighborMap.tsx`
    - Implement abundance mode with full-featured map
    - Implement survival mode with radar-style vector view
    - Display peer markers with distance indicators
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 11.2 Write property tests for Neighbor Map
    - **Property 23: Neighbor Map Mode Rendering**
    - **Property 24: Neighbor Map Peer Markers**
    - **Property 25: Neighbor Map Tile Loading**
    - **Property 26: Neighbor Map Fallback**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.6**

  - [x] 11.3 Add Neighbor Map fallback and animations
    - Implement list view fallback when map data unavailable
    - Use vector graphics in survival mode (no tile loading)
    - Animate marker positions on peer discovery/movement
    - _Requirements: 8.4, 8.5, 8.6_

- [x] 12. Checkpoint - Feature components validation
  - Ensure all feature component tests pass, ask the user if questions arise.

- [x] 13. Implement performance optimizations for Survival UI
  - [x] 13.1 Create performance utilities and hooks
    - Create `src/utils/performance.ts` with render tracking utilities
    - Implement useOptimizedAnimation hook with mode-aware frame rates
    - Add asset preloading for survival mode icons and fonts
    - _Requirements: 9.3, 9.4, 9.6_

  - [ ]* 13.2 Write property tests for survival mode performance
    - **Property 28: Survival Mode Animation Config**
    - **Property 29: Survival Mode Background Processes**
    - **Validates: Requirements 9.3, 9.5**

  - [x] 13.3 Apply React.memo and useMemo optimizations
    - Wrap components with React.memo for survival mode
    - Add useMemo for expensive calculations
    - Disable non-essential background processes in survival mode
    - _Requirements: 9.2, 9.5_

- [x] 14. Implement Quick Win visual enhancements
  - [x] 14.1 Create gradient header component
    - Create `src/components/layout/GradientHeader.tsx`
    - Implement mode-transitioning gradient background
    - Integrate with AnimatedThemeProvider
    - _Requirements: 10.1_

  - [ ]* 14.2 Write property tests for header gradient
    - **Property 30: Header Gradient By Mode**
    - **Validates: Requirements 10.1**

  - [x] 14.3 Add haptic feedback system
    - Create `src/utils/haptics.ts` with mode-aware haptic triggers
    - Add haptic feedback to buttons and interactive elements
    - Disable haptics in survival mode
    - _Requirements: 10.2_

  - [ ]* 14.4 Write property tests for haptic feedback
    - **Property 31: Haptic Feedback By Mode**
    - **Validates: Requirements 10.2**

  - [x] 14.5 Create skeleton loading components
    - Create `src/components/loading/Skeleton.tsx` with mode-aware styling
    - Implement skeleton variants for cards, lists, and headers
    - _Requirements: 10.3_

  - [ ]* 14.6 Write property tests for skeleton styling
    - **Property 32: Skeleton Styling By Mode**
    - **Validates: Requirements 10.3**

  - [x] 14.7 Implement connection restored celebration
    - Create celebration animation triggered on online mode transition
    - Add confetti or pulse effect for visual feedback
    - _Requirements: 10.5_

  - [ ]* 14.8 Write property tests for celebration animation
    - **Property 33: Connection Restored Celebration**
    - **Validates: Requirements 10.5**

- [x] 15. Integration and wiring
  - [x] 15.1 Update App.tsx with AnimatedThemeProvider
    - Wrap app with AnimatedThemeProvider
    - Replace ConnectivityBanner with DynamicIsland in header
    - Update navigation to use theme context
    - _Requirements: All UI requirements_

  - [x] 15.2 Update FeedList to use BentoGrid and DualModeFeedCard
    - Replace existing FeedList with BentoGrid
    - Use DualModeFeedCard for rendering items
    - Maintain existing functionality (refresh, interest handling)
    - _Requirements: 5.1, 4.1_

  - [x] 15.3 Export new components from index files
    - Update `src/components/index.ts` with new exports
    - Create `src/theme/index.ts` for theme exports
    - Ensure backward compatibility with existing imports
    - _Requirements: All requirements_

- [x] 16. Final checkpoint - Full integration validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The implementation builds incrementally: theme → animations → components → integration
