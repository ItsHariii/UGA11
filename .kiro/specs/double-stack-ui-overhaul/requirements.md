# Requirements Document

## Introduction

This document defines the requirements for the "Double Stack" UI overhaul of the NeighborYield React Native app. The overhaul introduces a dual-mode visual system: a premium "Abundance UI" for normal operation and an ultra-efficient "Survival UI" for offline/outage scenarios. The design system enables smooth animated transitions between modes, introduces a connectivity-aware Dynamic Island header with radar animations, and modernizes the feed layout with a Bento Grid system.

## Glossary

- **Abundance_UI**: The premium, modern marketplace aesthetic used during normal online operation, featuring rich imagery, lush colors, and smooth animations
- **Survival_UI**: The ultra-efficient tactical interface activated during connectivity outages, featuring dark themes, iconography instead of images, and minimal re-renders
- **Dynamic_Island**: An interactive header component that displays connectivity status with animated visual feedback
- **Radar_Ripple**: A pulsing animation effect that indicates mesh peer discovery activity
- **Bento_Grid**: A modern asymmetric grid layout system for displaying content cards in varying sizes
- **Theme_Transition**: The animated interpolation between Abundance_UI and Survival_UI color schemes
- **Design_Token**: A named value representing a visual property (color, spacing, typography) that varies between UI modes
- **Mesh_Peer**: A nearby device discovered through Bluetooth mesh networking
- **Connectivity_Mode**: The current network state (online, offline, hybrid, disconnected)

## Requirements

### Requirement 1: Dual-Mode Design Token System

**User Story:** As a developer, I want a unified design token system that supports both UI modes, so that components can automatically adapt their appearance based on connectivity state.

#### Acceptance Criteria

1. THE Design_Token_System SHALL define color tokens for both Abundance_UI and Survival_UI modes
2. WHEN the Connectivity_Mode changes to offline or disconnected, THE Design_Token_System SHALL provide Survival_UI token values
3. WHEN the Connectivity_Mode is online or hybrid, THE Design_Token_System SHALL provide Abundance_UI token values
4. THE Design_Token_System SHALL include tokens for background colors, text colors, accent colors, border colors, and shadow properties
5. THE Design_Token_System SHALL define Abundance_UI colors using lush greens, soft earth tones, and warm accents
6. THE Design_Token_System SHALL define Survival_UI colors using dark backgrounds, high-contrast text, and minimal accent colors
7. THE Design_Token_System SHALL export a useTheme hook that returns current token values based on Connectivity_Mode

### Requirement 2: Animated Theme Transitions

**User Story:** As a user, I want smooth visual transitions when the app switches between normal and outage modes, so that the interface change feels natural rather than jarring.

#### Acceptance Criteria

1. WHEN the Connectivity_Mode changes, THE Theme_Transition_System SHALL animate background colors using react-native-reanimated useDerivedValue
2. THE Theme_Transition_System SHALL interpolate colors over a duration of 300-500 milliseconds
3. WHEN transitioning to Survival_UI, THE Theme_Transition_System SHALL create a "bleed" effect where colors gradually darken
4. WHEN transitioning to Abundance_UI, THE Theme_Transition_System SHALL create a "bloom" effect where colors gradually brighten
5. THE Theme_Transition_System SHALL use shared values to synchronize transitions across all visible components
6. IF a transition is interrupted by another mode change, THEN THE Theme_Transition_System SHALL smoothly redirect to the new target state

### Requirement 3: Connectivity Dynamic Island Component

**User Story:** As a user, I want to see an interactive header that shows my connectivity status with visual feedback, so that I always know my network state at a glance.

#### Acceptance Criteria

1. THE Dynamic_Island SHALL display the current Connectivity_Mode with an appropriate icon and label
2. WHEN the Connectivity_Mode is offline or hybrid, THE Dynamic_Island SHALL display the count of connected Mesh_Peers
3. WHEN searching for Mesh_Peers, THE Dynamic_Island SHALL display a Radar_Ripple animation
4. THE Radar_Ripple animation SHALL use react-native-reanimated to create expanding circular pulses
5. THE Dynamic_Island SHALL use Abundance_UI styling when online and Survival_UI styling when offline
6. WHEN the user taps the Dynamic_Island in disconnected state, THE Dynamic_Island SHALL trigger a callback for navigation to settings
7. THE Dynamic_Island SHALL animate its height and content when transitioning between states

### Requirement 4: Dual-Mode Feed Card Component

**User Story:** As a user, I want feed cards that adapt their appearance based on connectivity mode, so that I can efficiently browse content in any network condition.

#### Acceptance Criteria

1. WHEN in Abundance_UI mode, THE Feed_Card SHALL display rich imagery, soft shadows, and rounded corners
2. WHEN in Survival_UI mode, THE Feed_Card SHALL replace images with lucide-react-native icons
3. WHEN in Survival_UI mode, THE Feed_Card SHALL use a compact, data-dense layout with minimal padding
4. WHEN in Survival_UI mode, THE Feed_Card SHALL use high-contrast geometric styling with sharp corners
5. THE Feed_Card SHALL animate its layout changes when transitioning between modes using react-native-reanimated
6. THE Feed_Card SHALL display risk tier, title, description, author, and time information in both modes
7. WHEN in Survival_UI mode, THE Feed_Card SHALL minimize re-renders by avoiding external asset loading

### Requirement 5: Bento Grid Layout System

**User Story:** As a user, I want a modern, visually appealing grid layout for browsing content in normal mode, so that the app feels premium and contemporary.

#### Acceptance Criteria

1. THE Bento_Grid SHALL arrange Feed_Cards in an asymmetric grid with varying card sizes
2. THE Bento_Grid SHALL support card sizes of 1x1 (small), 2x1 (wide), 1x2 (tall), and 2x2 (featured)
3. THE Bento_Grid SHALL automatically assign card sizes based on content priority and risk tier
4. WHEN in Survival_UI mode, THE Bento_Grid SHALL collapse to a single-column list layout for efficiency
5. THE Bento_Grid SHALL animate the layout transition between grid and list modes
6. THE Bento_Grid SHALL use react-native FlatList with optimized rendering for performance
7. THE Bento_Grid SHALL maintain scroll position when transitioning between layout modes

### Requirement 6: Radar Ripple Animation

**User Story:** As a user, I want visual feedback when the app is searching for nearby mesh peers, so that I know the discovery process is active.

#### Acceptance Criteria

1. THE Radar_Ripple SHALL display concentric circles that expand outward from a center point
2. THE Radar_Ripple SHALL use react-native-reanimated withRepeat and withSequence for continuous animation
3. THE Radar_Ripple SHALL display 3 ripple rings with staggered timing
4. WHEN a Mesh_Peer is discovered, THE Radar_Ripple SHALL briefly highlight in the direction of the peer
5. THE Radar_Ripple SHALL use Survival_UI accent colors (cyan/green) for high visibility
6. WHEN mesh discovery is inactive, THE Radar_Ripple SHALL fade out smoothly
7. THE Radar_Ripple SHALL be optimized to minimize battery consumption during animation

### Requirement 7: Pantry Scanner UI Redesign

**User Story:** As a user, I want a pantry scanner interface that works efficiently in both normal and outage modes, so that I can quickly catalog items regardless of connectivity.

#### Acceptance Criteria

1. WHEN in Abundance_UI mode, THE Pantry_Scanner SHALL display a camera viewfinder with decorative overlays
2. WHEN in Survival_UI mode, THE Pantry_Scanner SHALL display a minimal viewfinder with high-contrast guides
3. THE Pantry_Scanner SHALL display scan results using the appropriate Feed_Card styling for the current mode
4. WHEN in Survival_UI mode, THE Pantry_Scanner SHALL disable camera preview to conserve battery
5. THE Pantry_Scanner SHALL provide manual entry fallback with mode-appropriate styling
6. THE Pantry_Scanner SHALL animate transitions between camera and results views

### Requirement 8: Neighbor Map Component

**User Story:** As a user, I want a map view that shows nearby neighbors and adapts to connectivity conditions, so that I can locate food shares spatially.

#### Acceptance Criteria

1. WHEN in Abundance_UI mode, THE Neighbor_Map SHALL display a full-featured map with rich styling
2. WHEN in Survival_UI mode, THE Neighbor_Map SHALL display a simplified radar-style view with peer positions
3. THE Neighbor_Map SHALL display Mesh_Peer locations as markers with distance indicators
4. WHEN in Survival_UI mode, THE Neighbor_Map SHALL use vector graphics instead of map tiles
5. THE Neighbor_Map SHALL animate marker positions when peers move or are discovered
6. IF map data is unavailable, THEN THE Neighbor_Map SHALL display a list view of peers with distance

### Requirement 9: Performance Optimization for Survival UI

**User Story:** As a user, I want the outage mode interface to be highly efficient, so that my device battery lasts longer during emergencies.

#### Acceptance Criteria

1. WHEN in Survival_UI mode, THE App SHALL avoid loading external images or assets
2. WHEN in Survival_UI mode, THE App SHALL minimize component re-renders using React.memo and useMemo
3. WHEN in Survival_UI mode, THE App SHALL use simplified animations with reduced frame rates
4. THE App SHALL preload Survival_UI assets (icons, fonts) during initial app launch
5. WHEN in Survival_UI mode, THE App SHALL disable non-essential background processes
6. THE App SHALL measure and log render performance metrics for optimization

### Requirement 10: Quick Win Visual Enhancements

**User Story:** As a developer, I want immediate visual improvements that demonstrate the new design direction, so that stakeholders can see progress quickly.

#### Acceptance Criteria

1. THE App SHALL implement a gradient header background that transitions with connectivity mode
2. THE App SHALL add subtle haptic feedback on key interactions in Abundance_UI mode
3. THE App SHALL implement skeleton loading states with mode-appropriate styling
4. THE App SHALL add micro-animations to buttons and interactive elements
5. THE App SHALL implement a "connection restored" celebration animation when returning to online mode
