# Implementation Plan: User Authentication

## Overview

This implementation adds user authentication to NeighborYield using Supabase Auth. The approach is incremental: first set up the auth infrastructure, then implement screens, then integrate with existing components.

## Tasks

- [ ] 1. Set up auth infrastructure
  - [ ] 1.1 Install Supabase client dependencies
    - Add @supabase/supabase-js to package.json
    - Create Supabase client configuration file
    - _Requirements: 1.2, 2.2_

  - [ ] 1.2 Create Supabase user_profiles table
    - Create SQL migration for user_profiles table
    - Add RLS policies for read/write access
    - Add index on user_id column
    - _Requirements: 1.3, 4.2_

  - [ ] 1.3 Extend AppContext with auth state
    - Add isAuthenticated, isAuthLoading, user fields to AppState
    - Add SET_AUTH_LOADING, SET_AUTH_USER, CLEAR_AUTH actions
    - Add setAuthLoading, setAuthUser, clearAuth methods
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 1.4 Write property test for context auth state updates
    - **Property 14: Context Re-render on Auth Change**
    - **Validates: Requirements 7.2**

- [ ] 2. Implement validation utilities
  - [ ] 2.1 Create validation functions
    - Implement validateEmail with regex pattern
    - Implement validatePassword with min length check
    - Implement validateDisplayName with length bounds
    - Implement validatePasswordMatch for confirm password
    - _Requirements: 1.5, 1.6, 1.7, 2.5, 4.4_

  - [ ]* 2.2 Write property tests for validation functions
    - **Property 1: Email Validation**
    - **Property 2: Display Name Validation**
    - **Property 3: Password Mismatch Detection**
    - **Validates: Requirements 1.5, 1.6, 1.7, 2.5, 4.4**

- [ ] 3. Implement Auth Service
  - [ ] 3.1 Create AuthService module
    - Implement initialize() to check existing session
    - Implement signUp() with Supabase Auth
    - Implement signIn() with Supabase Auth
    - Implement signOut() with Supabase Auth
    - Implement onAuthStateChange() listener
    - _Requirements: 1.2, 2.2, 3.1, 5.1_

  - [ ] 3.2 Implement session management
    - Implement getSession() to retrieve current session
    - Handle session refresh for expired sessions
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ]* 3.3 Write property tests for auth service
    - **Property 4: Registration Creates Account and Profile**
    - **Property 5: Login Updates Auth State**
    - **Property 9: Logout Clears State**
    - **Validates: Requirements 1.2, 1.3, 2.2, 2.3, 5.1, 5.2**

- [ ] 4. Implement Profile Service
  - [ ] 4.1 Create ProfileService module
    - Implement getProfile() to fetch user profile by ID
    - Implement createProfile() for new user registration
    - Implement updateProfile() for display name changes
    - _Requirements: 1.3, 4.2, 4.3_

  - [ ]* 4.2 Write property test for profile updates
    - **Property 8: Profile Update Propagation**
    - **Validates: Requirements 4.2, 4.3**

- [ ] 5. Checkpoint - Auth infrastructure complete
  - Ensure Supabase client connects successfully
  - Verify auth state flows through AppContext
  - Test validation functions work correctly
  - Ask the user if questions arise

- [ ] 6. Implement auth screens
  - [ ] 6.1 Create Login screen
    - Build form with email and password inputs
    - Add validation error display
    - Connect to AuthService.signIn()
    - Add navigation link to Register screen
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 6.2 Create Register screen
    - Build form with email, password, confirm password, display name inputs
    - Add validation error display for all fields
    - Connect to AuthService.signUp()
    - Add navigation link to Login screen
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ] 6.3 Create Profile screen
    - Display current user email (read-only) and display name
    - Add edit functionality for display name
    - Connect to ProfileService.updateProfile()
    - Add logout button connected to AuthService.signOut()
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3_

  - [ ] 6.4 Create AuthLoading screen
    - Display loading indicator during auth state check
    - _Requirements: 3.5_

  - [ ]* 6.5 Write unit tests for auth screens
    - Test Login screen renders required fields
    - Test Register screen renders required fields
    - Test Profile screen displays user data
    - Test error messages display correctly

- [ ] 7. Implement navigation guards
  - [ ] 7.1 Create auth navigation logic
    - Redirect unauthenticated users to Login
    - Redirect authenticated users away from auth screens
    - Show loading screen during auth check
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 7.2 Write property tests for navigation guards
    - **Property 12: Navigation Guard - Unauthenticated Access**
    - **Property 13: Navigation Guard - Authenticated Access to Auth Screens**
    - **Validates: Requirements 8.1, 8.2**

- [ ] 8. Checkpoint - Auth screens complete
  - Test full registration flow end-to-end
  - Test full login flow end-to-end
  - Test profile editing works
  - Test logout clears state and redirects
  - Ask the user if questions arise

- [ ] 9. Integrate display names with existing components
  - [ ] 9.1 Update SharePostCard to show display name
    - Replace authorIdentifier with display name from profile
    - Handle case where profile is not loaded
    - _Requirements: 6.1_

  - [ ] 9.2 Update PostCreatorForm to attach display name
    - Get display name from AppContext user
    - Include in post creation payload
    - _Requirements: 6.3_

  - [ ] 9.3 Update InterestNotificationCard to show display name
    - Replace interestedUserIdentifier with display name
    - Handle case where profile is not loaded
    - _Requirements: 6.2_

  - [ ] 9.4 Update interest expression to attach display name
    - Get display name from AppContext user
    - Include in interest payload
    - _Requirements: 6.4_

  - [ ]* 9.5 Write property tests for display name integration
    - **Property 10: Posts Display Author Name**
    - **Property 11: Interests Display User Name**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 10. Implement session persistence
  - [ ] 10.1 Add session restoration on app launch
    - Check for existing session in AuthService.initialize()
    - Load user profile if session exists
    - Update AppContext with restored auth state
    - _Requirements: 3.1, 3.2_

  - [ ]* 10.2 Write property test for session restoration
    - **Property 6: Session Restoration**
    - **Validates: Requirements 3.2**

  - [ ] 10.3 Handle session expiration
    - Detect expired sessions
    - Attempt automatic refresh
    - Clear state and redirect if refresh fails
    - _Requirements: 3.3, 3.4_

  - [ ]* 10.4 Write property test for session refresh
    - **Property 7: Expired Session Refresh**
    - **Validates: Requirements 3.3**

- [ ] 11. Wire auth into App.tsx
  - [ ] 11.1 Add auth initialization to App component
    - Call AuthService.initialize() on mount
    - Set up auth state change listener
    - _Requirements: 3.1, 7.4_

  - [ ] 11.2 Add navigation structure for auth flow
    - Conditionally render auth screens vs main app
    - Handle loading state during auth check
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 11.3 Add Profile tab to settings
    - Add Profile screen access from settings tab
    - Wire logout button
    - _Requirements: 4.1, 5.3_

- [ ] 12. Final checkpoint - All tests pass
  - Run all unit tests
  - Run all property tests
  - Verify complete auth flow works
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout for type safety
