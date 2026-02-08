# Implementation Plan: Authentication Enhancement

## Overview

This plan enhances the authentication screens with better aesthetics, proper form fields, validation, and visual polish using the earthy design system.

## Tasks

- [x] 1. Create reusable auth components
  - [x] 1.1 Create AuthInput component
    - Create `src/components/auth/AuthInput.tsx`
    - Implement label, input, error message layout
    - Add focus/blur animations for border color
    - Add error state styling
    - Export from `src/components/auth/index.ts`
    - _Requirements: 4.1-4.10, 6.4-6.7_

  - [x] 1.2 Create AuthButton component
    - Create `src/components/auth/AuthButton.tsx`
    - Implement button with loading state
    - Add press animation (scale 0.98)
    - Style with earthy theme colors
    - Export from `src/components/auth/index.ts`
    - _Requirements: 5.4, 5.5_

- [x] 2. Create validation utilities
  - [x] 2.1 Create validation functions
    - Create `src/utils/validation.ts`
    - Implement `validateEmail(email: string): string | null`
    - Implement `validatePassword(password: string): string | null`
    - Implement `validateUsername(username: string): string | null`
    - Implement `validatePasswordMatch(password: string, confirm: string): string | null`
    - Implement `formatPhoneNumber(phone: string): string`
    - _Requirements: 6.1-6.3_

- [ ] 3. Create LoginScreen component
  - [x] 3.1 Create LoginScreen structure
    - Create `src/screens/LoginScreen.tsx`
    - Add ScrollView with KeyboardAvoidingView
    - Add gradient background (optional enhancement)
    - Add logo at 120x120px
    - Add title "Welcome Back to Knit"
    - Add subtitle "Sign in to connect with your community"
    - Export from `src/screens/index.ts`
    - _Requirements: 1.1-1.4, 2.1-2.2, 7.1-7.2_

  - [x] 3.2 Add LoginScreen form fields
    - Add Email AuthInput with email keyboard type
    - Add Password AuthInput with secure entry
    - Add "Forgot Password?" link
    - Add Sign In AuthButton
    - Add "New to Knit? Create Account" link
    - _Requirements: 2.3-2.6_

  - [x] 3.3 Add LoginScreen validation
    - Implement email validation on blur
    - Implement password validation on blur
    - Show error messages below inputs
    - Disable button when form invalid
    - _Requirements: 6.1-6.7_

- [x] 4. Create RegisterScreen component
  - [x] 4.1 Create RegisterScreen structure
    - Create `src/screens/RegisterScreen.tsx`
    - Add ScrollView with KeyboardAvoidingView
    - Add gradient background (optional enhancement)
    - Add logo at 120x120px
    - Add title "Join Knit"
    - Add subtitle "Connect with neighbors and share resources"
    - Export from `src/screens/index.ts`
    - _Requirements: 1.1-1.4, 3.1-3.2, 7.1-7.2_

  - [x] 4.2 Add RegisterScreen form fields
    - Add Full Name AuthInput
    - Add Username AuthInput with @ hint
    - Add Email AuthInput with email keyboard type
    - Add Phone Number AuthInput (optional) with formatting
    - Add Password AuthInput with secure entry
    - Add Confirm Password AuthInput with secure entry
    - Add Neighborhood/Area AuthInput (optional)
    - Add Create Account AuthButton
    - Add "Already have an account? Sign In" link
    - _Requirements: 3.3-3.11_

  - [x] 4.3 Add RegisterScreen validation
    - Implement full name validation (required)
    - Implement username validation (alphanumeric, 3-20 chars)
    - Implement email validation
    - Implement phone number formatting
    - Implement password validation (min 8 chars)
    - Implement confirm password matching
    - Show error messages below inputs
    - Disable button when form invalid
    - _Requirements: 6.1-6.7_

- [x] 5. Update App.tsx to use new screens
  - [x] 5.1 Import new screen components
    - Import LoginScreen and RegisterScreen
    - Remove inline auth UI from App.tsx
    - _Requirements: All_

  - [x] 5.2 Integrate LoginScreen
    - Replace inline login UI with LoginScreen component
    - Pass onLogin handler
    - Pass onSwitchToRegister handler
    - Pass onForgotPassword handler (console.log for now)
    - _Requirements: 2.1-2.7_

  - [x] 5.3 Integrate RegisterScreen
    - Replace inline register UI with RegisterScreen component
    - Pass onRegister handler
    - Pass onSwitchToLogin handler
    - Update state to handle new registration fields
    - _Requirements: 3.1-3.11_

- [ ] 6. Visual polish and enhancements
  - [ ] 6.1 Update auth card styling
    - Increase padding to 40px
    - Increase shadow blur to 16px
    - Add max width of 400px for larger screens
    - Add 24px horizontal margin
    - _Requirements: 5.2, 5.3, 7.3, 7.4_

  - [ ] 6.2 Add keyboard handling
    - Implement auto-scroll to focused input
    - Add keyboardShouldPersistTaps="handled"
    - Test keyboard appearance/dismissal
    - _Requirements: 5.7, 7.1, 7.2_

  - [ ] 6.3 Add show/hide password toggle (optional)
    - Add eye icon to password fields
    - Toggle secureTextEntry on press
    - Update icon based on state
    - _Requirements: Enhancement_

- [ ] 7. Testing and validation
  - [ ] 7.1 Test login flow
    - Test with valid credentials
    - Test with invalid email
    - Test with short password
    - Test forgot password link
    - Test switch to register

  - [ ] 7.2 Test register flow
    - Test with all fields filled
    - Test with only required fields
    - Test username validation
    - Test password matching
    - Test phone number formatting
    - Test switch to login

  - [ ] 7.3 Test responsive behavior
    - Test on small screens (iPhone SE)
    - Test on large screens (iPad)
    - Test keyboard appearance
    - Test scroll behavior

## Notes

- All components use the earthy theme colors from tokens.ts
- Validation is client-side only (server validation needed in production)
- Phone number formatting is US-format only
- Forgot password functionality is placeholder (needs backend)
- Consider adding password strength indicator in future iteration
