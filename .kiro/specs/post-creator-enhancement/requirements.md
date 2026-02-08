# Requirements Document: Post Creator Enhancement

## Introduction

This document defines requirements for enhancing the Knit app's post creation screen. The redesign will create a more elegant, aesthetically pleasing interface with photo upload capability, improved color scheme, better visual hierarchy, and enhanced user experience that matches the earthy design system.

## Current State Analysis

### Identified Problems

1. **Visual Design Issues**
   - Generic gray background (#f5f5f5) doesn't match earthy theme
   - Plain white inputs lack visual interest
   - Hard-coded green button (#2e7d32) doesn't use theme tokens
   - No visual connection to the rest of the app's aesthetic
   - Lacks the premium feel of the auth screens

2. **Missing Features**
   - No photo upload capability (critical for food sharing)
   - No image preview
   - No way to show food condition visually
   - Missing camera/gallery integration

3. **Typography Issues**
   - Generic system fonts
   - Inconsistent with auth screens (which use Georgia)
   - No visual hierarchy in text

4. **Color Inconsistencies**
   - Risk tier colors don't align with theme
   - Submit button uses hard-coded green
   - No use of theme's accentPrimary, accentSecondary
   - Error colors don't match theme's accentDanger

5. **Layout Issues**
   - Flat, uninspiring layout
   - No card-based design like other screens
   - Missing decorative elements
   - No visual breathing room

6. **User Experience**
   - No visual feedback for photo upload
   - Character counts are small and easy to miss
   - Risk tier picker could be more engaging
   - No confirmation or success state

## Glossary

- **Post_Creator**: The form interface for creating food share posts
- **Photo_Upload**: Camera/gallery integration for food photos
- **Risk_Tier**: Perishability classification (high/medium/low)
- **TTL**: Time-to-live, expiration duration
- **Earthy_Theme**: The warm, organic color palette
- **Image_Preview**: Visual display of uploaded photo

## Requirements

### Requirement 1: Photo Upload Integration

**User Story:** As a user, I want to add photos of my food items, so others can see what I'm sharing and make informed decisions.

#### Acceptance Criteria

1. THE Post_Creator SHALL display a prominent photo upload button with camera icon
2. THE photo upload button SHALL be positioned at the top of the form
3. THE photo upload button SHALL support both camera and gallery selection
4. THE Post_Creator SHALL display an image preview after photo selection
5. THE image preview SHALL be 200x200 pixels with rounded corners
6. THE Post_Creator SHALL allow removing the uploaded photo
7. THE photo upload area SHALL have a dashed border when empty
8. THE photo upload area SHALL show a camera icon and "Add Photo" text when empty
9. THE photo upload SHALL be optional (not required)
10. THE image preview SHALL have a small "X" button to remove the photo

### Requirement 2: Earthy Theme Integration

**User Story:** As a user, I want the post creation screen to match the app's beautiful aesthetic, so the experience feels cohesive.

#### Acceptance Criteria

1. THE Post_Creator background SHALL use backgroundPrimary from theme tokens
2. THE form card SHALL use backgroundCard with 60% opacity (matching auth screens)
3. THE form card SHALL have decorative circles in the background
4. THE form card SHALL use 32px border radius
5. THE form card SHALL have enhanced shadow (12px offset, 24px blur)
6. THE submit button SHALL use accentPrimary color from theme
7. THE input fields SHALL use backgroundSecondary color
8. THE input borders SHALL use borderDefault color
9. THE error messages SHALL use accentDanger color
10. THE character counts SHALL use textMuted color

### Requirement 3: Enhanced Typography

**User Story:** As a user, I want the text to be beautiful and easy to read, so the form feels premium and professional.

#### Acceptance Criteria

1. THE header "Share Food" SHALL use Georgia-Bold font (iOS) or serif (Android)
2. THE header SHALL be 32px, weight 800, with -0.5px letter spacing
3. THE header SHALL use accentPrimary color
4. THE labels SHALL use 15px font size with 600 weight
5. THE labels SHALL use textPrimary color
6. THE input text SHALL use 16px font size with 500 weight
7. THE placeholder text SHALL use textMuted color
8. THE character counts SHALL be 13px with textMuted color
9. THE submit button text SHALL be 17px, weight 700
10. THE TTL preview SHALL use italic style with textSecondary color

### Requirement 4: Improved Risk Tier Picker

**User Story:** As a user, I want the risk tier selection to be visually appealing and easy to understand, so I can quickly choose the right option.

#### Acceptance Criteria

1. THE risk tier options SHALL use theme colors:
   - High: accentDanger (#C75B3F)
   - Medium: accentWarning (#D4943A)
   - Low: accentSuccess (#5A8A5E)
2. THE selected option SHALL have a colored left border (4px)
3. THE selected option SHALL have a subtle background tint
4. THE unselected options SHALL have 50% opacity
5. THE risk tier icons SHALL be 28px size
6. THE TTL badges SHALL have rounded corners (20px)
7. THE TTL badges SHALL use the tier color when selected
8. THE risk tier options SHALL have 16px padding
9. THE risk tier options SHALL have smooth press animations
10. THE risk tier container SHALL have 12px gap between options

### Requirement 5: Enhanced Input Fields

**User Story:** As a user, I want input fields that are beautiful and provide clear feedback, so I enjoy filling out the form.

#### Acceptance Criteria

1. THE input fields SHALL have 2px border width
2. THE input fields SHALL have 16px border radius
3. THE input fields SHALL have 16px padding
4. THE focused input SHALL have accentPrimary border color
5. THE input fields SHALL have smooth border color transitions (200ms)
6. THE title input SHALL have a floating character count
7. THE description textarea SHALL have minimum 120px height
8. THE description textarea SHALL have 8px line height
9. THE input fields SHALL have subtle shadow when focused
10. THE input fields SHALL use backgroundSecondary background color

### Requirement 6: Submit Button Enhancement

**User Story:** As a user, I want a prominent, beautiful submit button, so I feel confident sharing my post.

#### Acceptance Criteria

1. THE submit button SHALL use accentPrimary background color
2. THE submit button SHALL have 18px vertical padding
3. THE submit button SHALL have 16px border radius
4. THE submit button SHALL have a subtle shadow (4px offset, 8px blur)
5. THE submit button SHALL scale to 0.98 on press
6. THE submit button SHALL have smooth press animation
7. THE submit button SHALL show loading state with spinner
8. THE submit button SHALL be disabled when form is invalid
9. THE disabled button SHALL have 50% opacity
10. THE button text SHALL be white with 700 weight

### Requirement 7: Visual Polish & Animations

**User Story:** As a user, I want smooth animations and visual polish, so the form feels delightful to use.

#### Acceptance Criteria

1. THE form card SHALL fade in on mount (0 to 1 opacity, 600ms)
2. THE form card SHALL slide up on mount (30px to 0, spring animation)
3. THE photo upload area SHALL have a subtle pulse animation when empty
4. THE risk tier options SHALL have smooth selection transitions
5. THE submit button SHALL have a success animation on completion
6. THE error messages SHALL fade in smoothly
7. THE character counts SHALL change color when approaching limit (90%)
8. THE form SHALL have smooth keyboard handling
9. THE inputs SHALL have smooth focus/blur transitions
10. THE decorative circles SHALL have subtle floating animations

### Requirement 8: Improved Layout & Spacing

**User Story:** As a user, I want the form to have proper spacing and visual hierarchy, so it's easy to scan and complete.

#### Acceptance Criteria

1. THE form card SHALL have 40px padding
2. THE form card SHALL have maximum width of 500px
3. THE form card SHALL be centered horizontally
4. THE input groups SHALL have 24px margin bottom
5. THE header SHALL have 32px margin bottom
6. THE photo upload area SHALL have 24px margin bottom
7. THE submit button SHALL have 32px margin top
8. THE error container SHALL have 20px margin bottom
9. THE form SHALL have 24px horizontal padding on mobile
10. THE form SHALL have proper scroll behavior with keyboard

### Requirement 9: Error Handling & Validation

**User Story:** As a user, I want clear, helpful error messages, so I know how to fix any issues.

#### Acceptance Criteria

1. THE error container SHALL have accentDanger background with 20% opacity
2. THE error container SHALL have 16px border radius
3. THE error container SHALL have 16px padding
4. THE error messages SHALL use accentDanger color
5. THE error messages SHALL have bullet points
6. THE error messages SHALL fade in smoothly
7. THE invalid inputs SHALL have accentDanger border color
8. THE error container SHALL have a warning icon
9. THE errors SHALL be cleared when input is corrected
10. THE form SHALL prevent submission when invalid

### Requirement 10: Accessibility & Responsiveness

**User Story:** As a user on any device, I want the form to work perfectly and be accessible, so everyone can share food easily.

#### Acceptance Criteria

1. THE form SHALL use ScrollView for keyboard handling
2. THE form SHALL auto-scroll to focused input
3. THE form SHALL work on screens from 320px to 768px width
4. THE photo upload SHALL have proper accessibility labels
5. THE risk tier picker SHALL have radio button semantics
6. THE submit button SHALL have proper disabled state
7. THE form SHALL support screen readers
8. THE inputs SHALL have proper keyboard types
9. THE form SHALL handle keyboard appearance smoothly
10. THE form SHALL maintain state during orientation changes

## Success Metrics

- Photo upload usage rate > 70%
- Form completion rate > 85%
- Average time to create post < 60 seconds
- User satisfaction score > 4.5/5
- Zero accessibility violations

## Out of Scope

- Multiple photo uploads (future enhancement)
- Photo editing/filters (future enhancement)
- Location tagging (future enhancement)
- Draft saving (future enhancement)
- Post scheduling (future enhancement)

