# Requirements Document

## Introduction

This document defines the requirements for the "Earthy UI Redesign" of the NeighborYield React Native app. The redesign replaces the current bright green theme with a warmer, organic color palette inspired by natural earth tones. It also introduces a floating bottom tab bar to replace the existing top navigation tabs, and updates border radii across components for a softer, more modern aesthetic. The redesign builds on top of the existing dual-mode theme system (Abundance UI / Survival UI) established in the Double Stack UI Overhaul spec.

## Glossary

- **Abundance_Palette**: The set of warm, earthy color values used in Abundance UI mode (online/hybrid), featuring beige backgrounds, forest green accents, and cream card surfaces
- **Survival_Palette**: The set of dark color values used in Survival UI mode (offline/disconnected), featuring near-black backgrounds with cool mint accents
- **Floating_Tab_Bar**: An absolutely positioned, pill-shaped bottom navigation island that replaces the top tab bar
- **Tab_Indicator**: A small dot rendered below the active tab icon in the Floating_Tab_Bar to indicate the selected screen
- **Design_Token_System**: The existing token system in `src/theme/tokens.ts` that provides color, spacing, typography, and animation tokens for both UI modes
- **Feed_Card**: The `DualModeFeedCard` component that displays share posts in the feed
- **Interest_Button**: The `InterestedButton` component that allows users to express interest in a share post
- **Interest_Notification_Card**: The `InterestNotificationCard` component that displays incoming interest notifications
- **Dynamic_Island**: The connectivity status header component
- **Category_Bubble**: The icon container displayed in the top row of a Feed_Card

## Requirements

### Requirement 1: Abundance Palette Color Update

**User Story:** As a user, I want the online mode to use warm, earthy colors, so that the app feels organic, trustworthy, and visually calming.

#### Acceptance Criteria

1. THE Design_Token_System SHALL set the Abundance_Palette backgroundPrimary to `#F5F0E8`
2. THE Design_Token_System SHALL set the Abundance_Palette backgroundSecondary to `#FAF7F2`
3. THE Design_Token_System SHALL set the Abundance_Palette backgroundCard to `#FFFDF8`
4. THE Design_Token_System SHALL set the Abundance_Palette accentPrimary to deep forest green `#2D5A3D`
5. THE Design_Token_System SHALL set the Abundance_Palette accentSecondary to sage green `#6B8F71`
6. THE Design_Token_System SHALL set the Abundance_Palette textPrimary to dark charcoal `#2C2C2C`
7. THE Design_Token_System SHALL set the Abundance_Palette textSecondary to warm gray `#6B6560`
8. THE Design_Token_System SHALL set the Abundance_Palette textMuted to `#A09A93`
9. THE Design_Token_System SHALL set the Abundance_Palette borderDefault to soft tan `#E5DDD3`
10. THE Design_Token_System SHALL set the Abundance_Palette accentDanger to muted terracotta `#C75B3F`
11. THE Design_Token_System SHALL set the Abundance_Palette accentWarning to warm amber `#D4943A`
12. THE Design_Token_System SHALL set the Abundance_Palette accentSuccess to olive green `#5A8A5E`
13. THE Design_Token_System SHALL set the Abundance_Palette shadowColor to `rgba(0, 0, 0, 0.08)` for warm, subtle shadows
14. THE Design_Token_System SHALL set the Abundance_Palette textAccent to match accentPrimary `#2D5A3D`

### Requirement 2: Survival Palette Color Update

**User Story:** As a user, I want the offline mode to use a dark theme with cool mint accents instead of neon green, so that the interface remains readable and battery-efficient while feeling more refined.

#### Acceptance Criteria

1. THE Design_Token_System SHALL set the Survival_Palette backgroundPrimary to `#0D1210`
2. THE Design_Token_System SHALL set the Survival_Palette backgroundCard to `#161E1A`
3. THE Design_Token_System SHALL set the Survival_Palette borderDefault to `#2A3A30`
4. THE Design_Token_System SHALL set the Survival_Palette accentPrimary to cool mint `#4AEDC4`
5. THE Design_Token_System SHALL set the Survival_Palette accentSecondary to a lighter mint derived from accentPrimary
6. THE Design_Token_System SHALL set the Survival_Palette textAccent to cool mint `#4AEDC4`
7. THE Design_Token_System SHALL set the Survival_Palette borderFocus to cool mint `#4AEDC4`

### Requirement 3: Border Radius Update

**User Story:** As a user, I want softer, more rounded UI elements, so that the app feels modern and approachable.

#### Acceptance Criteria

1. WHEN in Abundance_UI mode, THE Feed_Card SHALL use a border radius of 20 pixels
2. THE Interest_Button SHALL use a border radius of 14 pixels in all modes
3. WHEN displaying risk tier or warning badges, THE Feed_Card SHALL use a border radius of 10 pixels
4. THE Category_Bubble SHALL use a border radius of 14 pixels
5. THE Interest_Notification_Card SHALL use a border radius of 16 pixels
6. WHEN displaying action buttons, THE Interest_Notification_Card SHALL use a border radius of 12 pixels

### Requirement 4: Floating Bottom Tab Bar

**User Story:** As a user, I want a floating bottom navigation bar, so that I can switch between screens with a modern, thumb-friendly interface.

#### Acceptance Criteria

1. THE Floating_Tab_Bar SHALL be positioned absolutely at the bottom of the SafeAreaView with a bottom offset of 24 pixels
2. THE Floating_Tab_Bar SHALL be centered horizontally and sized to approximately 70 percent of the screen width
3. WHEN in Abundance_UI mode, THE Floating_Tab_Bar SHALL use a semi-transparent background of `rgba(45, 90, 61, 0.92)`
4. WHEN in Survival_UI mode, THE Floating_Tab_Bar SHALL use a semi-transparent background of `rgba(13, 18, 16, 0.95)`
5. THE Floating_Tab_Bar SHALL have a border radius of 28 pixels to form a pill shape
6. THE Floating_Tab_Bar SHALL display a shadow with offset (0, 8), blur radius 32, and color `rgba(0, 0, 0, 0.15)`
7. THE Floating_Tab_Bar SHALL use vertical padding of 8 pixels and horizontal padding of 6 pixels
8. THE Floating_Tab_Bar SHALL display three tabs using lucide-react-native icons: Newspaper for Feed, PlusCircle for Share, and Settings for Settings
9. WHEN a tab is active, THE Floating_Tab_Bar SHALL render the tab icon in white with a small dot Tab_Indicator below the icon
10. WHEN a tab is inactive, THE Floating_Tab_Bar SHALL render the tab icon in white with opacity 0.6
11. THE Floating_Tab_Bar SHALL display icons only without text labels
12. WHEN a tab is pressed, THE Floating_Tab_Bar SHALL apply a subtle scale animation to the pressed icon
13. THE App SHALL remove the existing top navigation tab bar from App.tsx
14. THE App SHALL add paddingBottom of 90 pixels to the main content area to prevent content from being hidden behind the Floating_Tab_Bar

### Requirement 5: Component Color Token Adoption

**User Story:** As a developer, I want all updated components to use the Design_Token_System for colors, so that they automatically adapt when switching between Abundance and Survival modes.

#### Acceptance Criteria

1. THE Interest_Button SHALL use the Design_Token_System accentPrimary color for its background instead of hardcoded `#2e7d32`
2. THE Interest_Notification_Card SHALL use the Design_Token_System color tokens for background, text, border, and button colors instead of hardcoded values
3. THE Dynamic_Island SHALL render using the updated color tokens from the Design_Token_System without additional code changes
4. THE App header SHALL use the updated Abundance_Palette backgroundSecondary and accentPrimary colors for its background and title text

