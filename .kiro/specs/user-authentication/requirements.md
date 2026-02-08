# Requirements Document

## Introduction

This spec covers user authentication for the NeighborYield React Native app. The app currently uses pseudonymous identifiers (e.g., "Neighbor-A3F9") for users, but community members need to know who they're interacting with when claiming food shares. This feature adds email/password authentication via Supabase Auth, user profiles with display names, and persistent auth state.

The authentication system integrates with the existing AppContext state management and replaces anonymous identifiers with real display names on posts and interactions.

## Glossary

- **Auth_Service**: The authentication service component wrapping Supabase Auth functionality
- **User_Profile**: A user's account information including display name and email
- **Display_Name**: A user-chosen name shown on posts and interactions (replaces "Neighbor-XXXX")
- **Auth_State**: The current authentication status (authenticated, unauthenticated, loading)
- **Session**: A Supabase Auth session containing access tokens and user information
- **Supabase_Auth**: Supabase's authentication service for email/password login
- **AppContext**: The existing React Context providing global state management

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with my email and a display name, so that other community members can identify me when I share food.

#### Acceptance Criteria

1. WHEN a user navigates to the Register screen, THE Auth_UI SHALL display input fields for email, password, confirm password, and display name
2. WHEN a user submits valid registration data, THE Auth_Service SHALL create a new account via Supabase Auth
3. WHEN registration succeeds, THE Auth_Service SHALL create a user profile record with the provided display name
4. WHEN a user attempts to register with an already-used email, THE Auth_Service SHALL display an appropriate error message
5. WHEN a user enters mismatched passwords, THE Auth_UI SHALL display a validation error before submission
6. WHEN a user enters an invalid email format, THE Auth_UI SHALL display a validation error before submission
7. WHEN a user enters a display name shorter than 2 characters or longer than 30 characters, THE Auth_UI SHALL display a validation error

### Requirement 2: User Login

**User Story:** As a returning user, I want to log in with my email and password, so that I can access my account and participate in the community.

#### Acceptance Criteria

1. WHEN a user navigates to the Login screen, THE Auth_UI SHALL display input fields for email and password
2. WHEN a user submits valid credentials, THE Auth_Service SHALL authenticate via Supabase Auth
3. WHEN login succeeds, THE Auth_Service SHALL store the session and update AppContext with user information
4. WHEN a user enters incorrect credentials, THE Auth_Service SHALL display an appropriate error message
5. WHEN a user enters an invalid email format, THE Auth_UI SHALL display a validation error before submission
6. THE Login screen SHALL provide a link to navigate to the Register screen

### Requirement 3: Persistent Authentication

**User Story:** As a user, I want to stay logged in between app sessions, so that I don't have to re-enter my credentials every time I open the app.

#### Acceptance Criteria

1. WHEN the app launches, THE Auth_Service SHALL check for an existing Supabase session
2. WHEN a valid session exists, THE Auth_Service SHALL restore the authenticated state and load user profile
3. WHEN a session has expired, THE Auth_Service SHALL attempt to refresh the session automatically
4. WHEN session refresh fails, THE Auth_Service SHALL clear the session and redirect to Login screen
5. WHILE the auth state is being determined, THE App SHALL display a loading indicator

### Requirement 4: User Profile Management

**User Story:** As a user, I want to view and edit my display name, so that I can update how I appear to other community members.

#### Acceptance Criteria

1. WHEN a user navigates to the Profile screen, THE Profile_UI SHALL display the user's current display name and email
2. WHEN a user edits their display name and saves, THE Auth_Service SHALL update the profile in Supabase
3. WHEN a display name update succeeds, THE Auth_Service SHALL update AppContext with the new display name
4. WHEN a user enters an invalid display name, THE Profile_UI SHALL display a validation error
5. THE Profile screen SHALL display the user's email as read-only (email changes not supported in MVP)

### Requirement 5: Logout Functionality

**User Story:** As a user, I want to log out of my account, so that I can secure my account or switch to a different account.

#### Acceptance Criteria

1. WHEN a user taps the logout button, THE Auth_Service SHALL sign out via Supabase Auth
2. WHEN logout succeeds, THE Auth_Service SHALL clear the session and reset AppContext user state
3. WHEN logout succeeds, THE App SHALL navigate to the Login screen
4. IF logout fails due to network issues, THEN THE Auth_Service SHALL clear local session data anyway and navigate to Login

### Requirement 6: Display Name on Posts

**User Story:** As a community member, I want to see real display names on posts instead of random identifiers, so that I know who I'm interacting with.

#### Acceptance Criteria

1. WHEN displaying a share post, THE Post_UI SHALL show the author's display name instead of the pseudonymous identifier
2. WHEN displaying an interest notification, THE Interest_UI SHALL show the interested user's display name
3. WHEN a user creates a post, THE Post_System SHALL attach the user's display name from AppContext
4. WHEN a user expresses interest, THE Interest_System SHALL attach the user's display name from AppContext

### Requirement 7: Auth State in AppContext

**User Story:** As a developer, I want auth state managed in AppContext, so that all components can access user information consistently.

#### Acceptance Criteria

1. THE AppContext SHALL include auth state fields: isAuthenticated, isAuthLoading, user (id, email, displayName)
2. WHEN auth state changes, THE AppContext SHALL update and trigger re-renders in consuming components
3. THE AppContext SHALL provide actions: setAuthState, setUser, clearAuth
4. WHEN the app initializes, THE AppContext SHALL default to isAuthLoading: true until auth check completes

### Requirement 8: Navigation Guards

**User Story:** As a user, I want to be redirected to login if I'm not authenticated, so that I can't access protected features without an account.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access the main app, THE Navigation_System SHALL redirect to the Login screen
2. WHEN an authenticated user attempts to access Login or Register screens, THE Navigation_System SHALL redirect to the main app
3. WHILE auth state is loading, THE Navigation_System SHALL display a loading screen instead of redirecting
