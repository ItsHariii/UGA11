# Implementation Plan: Post Creator Enhancement

## Overview

This plan enhances the post creation screen with photo upload, improved aesthetics, theme integration, and better user experience matching the earthy design system.

## Tasks

- [ ] 1. Install dependencies and setup
  - [ ] 1.1 Install react-native-image-picker
    - Run `npm install react-native-image-picker`
    - Link native modules for Android
    - Add camera/photo permissions to AndroidManifest.xml
    - Add usage descriptions to Info.plist (if iOS exists)
    - _Requirements: 1.1-1.10_

- [ ] 2. Create PhotoUpload component
  - [ ] 2.1 Create PhotoUpload component structure
    - Create `src/components/post/PhotoUpload.tsx`
    - Implement props interface (onPhotoSelected, onPhotoRemoved, photoUri, disabled)
    - Add empty state with dashed border
    - Add camera icon (48px) and "Add Photo" text
    - Export from `src/components/post/index.ts`
    - _Requirements: 1.1-1.4_

  - [ ] 2.2 Implement photo picker integration
    - Import launchCamera and launchImageLibrary
    - Create handlePhotoUpload function
    - Show action sheet for camera/gallery selection
    - Handle photo selection result
    - Optimize image size (max 1024x1024, quality 0.8)
    - _Requirements: 1.2-1.3_

  - [ ] 2.3 Add image preview
    - Display selected image (200x200px)
    - Add rounded corners (20px border radius)
    - Add remove button (X icon, 32px circle)
    - Style remove button with accentDanger background
    - Add press animations
    - _Requirements: 1.4-1.6, 1.10_

  - [ ] 2.4 Add empty state pulse animation
    - Create pulse animation (1.0 to 1.02 scale)
    - Loop animation with 2000ms duration
    - Apply to empty photo upload area
    - _Requirements: 7.3_

- [ ] 3. Create ThemedTextInput component
  - [ ] 3.1 Create ThemedTextInput structure
    - Create `src/components/common/ThemedTextInput.tsx`
    - Implement props interface
    - Add label, input, error message layout
    - Add character count display
    - Export from `src/components/common/index.ts`
    - _Requirements: 5.1-5.10_

  - [ ] 3.2 Add focus/blur animations
    - Create borderColorAnim ref
    - Animate border color on focus (borderDefault → accentPrimary)
    - Animate border color on blur (accentPrimary → borderDefault)
    - Add 200ms transition duration
    - Add subtle shadow on focus
    - _Requirements: 5.4-5.5, 5.9_

  - [ ] 3.3 Add character count logic
    - Display current/max character count
    - Change color to accentWarning at 90% capacity
    - Position at bottom right
    - Use 13px font size with textMuted color
    - _Requirements: 5.6, 7.7_

- [ ] 4. Enhance RiskTierPicker component
  - [ ] 4.1 Update risk tier colors
    - Change high risk to accentDanger (#C75B3F)
    - Change medium risk to accentWarning (#D4943A)
    - Change low risk to accentSuccess (#5A8A5E)
    - Update icon sizes to 28px
    - _Requirements: 4.1, 4.5_

  - [ ] 4.2 Add selection visual enhancements
    - Add 4px left border in tier color when selected
    - Add background tint (10% opacity) when selected
    - Set unselected options to 50% opacity
    - Add smooth transitions (200ms)
    - _Requirements: 4.2-4.4, 4.9_

  - [ ] 4.3 Update TTL badge styling
    - Increase border radius to 20px
    - Use tier color for selected badge background
    - Update padding to 10px horizontal, 6px vertical
    - Ensure white text on colored background
    - _Requirements: 4.6-4.7_

  - [ ] 4.4 Improve spacing and layout
    - Set padding to 16px
    - Set gap between options to 12px
    - Ensure proper alignment of icon, text, and badge
    - _Requirements: 4.8, 4.10_

- [ ] 5. Enhance PostCreatorForm component
  - [ ] 5.1 Add gradient background
    - Import LinearGradient from react-native-linear-gradient
    - Add gradient with backgroundPrimary → backgroundSecondary → backgroundPrimary
    - Set diagonal gradient (start: {x: 0, y: 0}, end: {x: 1, y: 1})
    - _Requirements: 2.1_

  - [ ] 5.2 Add decorative circles
    - Create 3 decorative circles with different sizes
    - Position: top-right (-80, -80), bottom-left (-60, -60), middle-left (-60, 40%)
    - Use accentPrimary (8%), accentSecondary (10%), accentSuccess (6%) opacity
    - Add border radius 9999 for perfect circles
    - _Requirements: 2.3, 7.10_

  - [ ] 5.3 Create transparent card container
    - Wrap form in Animated.View
    - Set backgroundColor to #FBF4EE + '99' (60% opacity)
    - Add 32px border radius
    - Add enhanced shadow (12px offset, 24px blur, 0.15 opacity)
    - Add 1px border with rgba(255, 255, 255, 0.2)
    - Set max width to 500px
    - Add 40px padding
    - _Requirements: 2.2, 2.4-2.5, 8.1-8.3_

  - [ ] 5.4 Add card entrance animations
    - Create fadeAnim (0 to 1, 600ms)
    - Create slideAnim (30px to 0, spring animation)
    - Apply to card container
    - Start animations on component mount
    - _Requirements: 7.1-7.2_

  - [ ] 5.5 Update header styling
    - Change font to Georgia-Bold (iOS) / serif (Android)
    - Set size to 32px, weight 800
    - Set color to accentPrimary
    - Add -0.5px letter spacing
    - Add 32px margin bottom
    - _Requirements: 3.1-3.3, 8.5_

  - [ ] 5.6 Integrate PhotoUpload component
    - Add PhotoUpload at top of form
    - Add 24px margin bottom
    - Handle photo selection
    - Handle photo removal
    - Store photo URI in state
    - _Requirements: 1.1-1.10, 8.6_

  - [ ] 5.7 Replace input fields with ThemedTextInput
    - Replace title input with ThemedTextInput
    - Replace description input with ThemedTextInput
    - Set multiline for description
    - Set maxLength (100 for title, 500 for description)
    - Add proper labels and placeholders
    - _Requirements: 5.1-5.10, 8.4_

  - [ ] 5.8 Update submit button styling
    - Use accentPrimary background color
    - Set 18px vertical padding, 24px horizontal padding
    - Set 16px border radius
    - Add shadow (4px offset, 8px blur)
    - Add press animation (scale 0.98)
    - Set button text to 17px, weight 700, white color
    - _Requirements: 6.1-6.10, 8.7_

  - [ ] 5.9 Update error container styling
    - Use accentDanger + '14' background (8% opacity)
    - Add 1px border with accentDanger + '40'
    - Set 16px border radius and padding
    - Add alert icon (20px)
    - Use accentDanger color for error text
    - Add fade-in animation
    - _Requirements: 9.1-9.8, 8.8_

  - [ ] 5.10 Update form validation
    - Add photo size validation (max 5MB)
    - Add real-time validation with debouncing
    - Clear errors when input is corrected
    - Prevent submission when invalid
    - Show validation errors clearly
    - _Requirements: 9.1-9.10_

- [ ] 6. Update theme integration
  - [ ] 6.1 Replace hard-coded colors
    - Replace all hard-coded colors with theme tokens
    - Update background colors
    - Update text colors
    - Update border colors
    - Update accent colors
    - _Requirements: 2.1-2.10_

  - [ ] 6.2 Update typography
    - Apply Georgia font family to header
    - Update font sizes per spec
    - Update font weights per spec
    - Update letter spacing
    - Update line heights
    - _Requirements: 3.1-3.10_

- [ ] 7. Add accessibility features
  - [ ] 7.1 Add accessibility labels
    - Add labels to PhotoUpload
    - Add labels to inputs
    - Add labels to risk tier picker
    - Add labels to submit button
    - Add hints where appropriate
    - _Requirements: 10.4-10.7_

  - [ ] 7.2 Add keyboard handling
    - Implement auto-scroll to focused input
    - Add keyboardShouldPersistTaps="handled"
    - Test keyboard appearance/dismissal
    - Ensure proper tab order
    - _Requirements: 8.8, 10.1-10.2, 10.9_

  - [ ] 7.3 Test responsive behavior
    - Test on small screens (320px width)
    - Test on large screens (768px width)
    - Test keyboard behavior
    - Test scroll behavior
    - Test orientation changes
    - _Requirements: 10.3, 10.10_

- [ ] 8. Testing and polish
  - [ ] 8.1 Test photo upload flow
    - Test camera selection
    - Test gallery selection
    - Test photo preview
    - Test photo removal
    - Test photo size validation
    - Test permissions handling

  - [ ] 8.2 Test form validation
    - Test title validation (min/max length)
    - Test description validation (max length)
    - Test required field validation
    - Test error message display
    - Test error clearing

  - [ ] 8.3 Test animations
    - Test card entrance animation
    - Test photo upload pulse
    - Test button press animation
    - Test input focus animation
    - Test error fade-in

  - [ ] 8.4 Test theme integration
    - Test in abundance mode
    - Test in survival mode (if applicable)
    - Verify all colors use theme tokens
    - Verify typography consistency

  - [ ] 8.5 Test accessibility
    - Test with screen reader
    - Test keyboard navigation
    - Test focus indicators
    - Test disabled states
    - Test error announcements

## Notes

- All components use the earthy theme colors from tokens.ts
- Photo upload is optional but highly encouraged
- Image optimization happens before upload
- Form validation is client-side (server validation needed in production)
- Animations use native driver where possible for performance
- Consider adding success toast/modal after post creation
- Future: Add multiple photo support, photo editing, location tagging

