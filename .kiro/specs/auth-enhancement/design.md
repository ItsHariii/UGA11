# Design Document: Authentication Enhancement

## Overview

This design enhances the Knit authentication experience with a more aesthetic, professional interface. The login screen remains simple and clean, while the register screen collects comprehensive user information. Both screens use the earthy design system with improved visual polish.

## Architecture

The authentication screens will be refactored into separate components for better maintainability:

```
src/screens/
  ├── LoginScreen.tsx       (Login interface)
  ├── RegisterScreen.tsx    (Registration interface)
  └── index.ts

src/components/auth/
  ├── AuthInput.tsx         (Reusable form input component)
  ├── AuthButton.tsx        (Primary action button)
  └── index.ts
```

## Components

### 1. AuthInput Component

Reusable form input with label, validation, and error states.

```typescript
interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  onBlur?: () => void;
}
```

**Styling:**
- Label: 14px, weight 600, textSecondary color, 8px margin bottom
- Input: 16px font, 16px padding, 14px border radius
- Border: 1px borderDefault, focus: accentPrimary, error: accentDanger
- Error text: 12px, accentDanger color, 4px margin top

### 2. AuthButton Component

Primary action button with press animation.

```typescript
interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}
```

**Styling:**
- Background: accentPrimary
- Padding: 18px vertical, 24px horizontal
- Border radius: 14px
- Press animation: scale(0.98)
- Loading: ActivityIndicator with white color

### 3. LoginScreen Component

```typescript
interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}
```

**Layout:**
- Logo: 120x120px, centered, 32px margin bottom
- Title: "Welcome Back to Knit", 32px, weight 800
- Subtitle: "Sign in to connect with your community", 16px
- Email input
- Password input
- "Forgot Password?" link (14px, accentPrimary)
- Sign In button
- "New to Knit? Create Account" link

### 4. RegisterScreen Component

```typescript
interface RegisterScreenProps {
  onRegister: (data: RegisterData) => void;
  onSwitchToLogin: () => void;
}

interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
  neighborhood?: string;
}
```

**Layout:**
- Logo: 120x120px, centered, 32px margin bottom
- Title: "Join Knit", 32px, weight 800
- Subtitle: "Connect with neighbors and share resources", 16px
- Full Name input
- Username input (with @ prefix hint)
- Email input
- Phone Number input (optional, with formatting)
- Password input (with strength indicator)
- Confirm Password input
- Neighborhood/Area input (optional)
- Create Account button
- "Already have an account? Sign In" link

## Validation Rules

### Email Validation
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### Password Validation
- Minimum 8 characters
- At least one uppercase letter (optional but recommended)
- At least one number (optional but recommended)

### Username Validation
- 3-20 characters
- Alphanumeric and underscores only
- No spaces

### Phone Number Formatting
- Auto-format as (XXX) XXX-XXXX
- Optional field

## Visual Enhancements

### Gradient Background
```typescript
background: LinearGradient
  colors: [backgroundPrimary, backgroundSecondary]
  start: {x: 0, y: 0}
  end: {x: 0, y: 1}
```

### Card Shadow
```typescript
shadowColor: 'rgba(0, 0, 0, 0.08)'
shadowOffset: {width: 0, height: 8}
shadowOpacity: 1
shadowRadius: 16
elevation: 8
```

### Input Focus Animation
```typescript
Animated.timing(borderColor, {
  toValue: focused ? accentPrimary : borderDefault,
  duration: 200,
  useNativeDriver: false
})
```

## Error Messages

- **Email invalid**: "Please enter a valid email address"
- **Password too short**: "Password must be at least 8 characters"
- **Passwords don't match**: "Passwords do not match"
- **Username invalid**: "Username must be 3-20 characters, letters and numbers only"
- **Required field**: "This field is required"

## Accessibility

- All inputs have proper labels
- Error messages are announced by screen readers
- Buttons have descriptive accessibility labels
- Keyboard navigation works smoothly
- Focus indicators are visible

## Testing Strategy

### Unit Tests
- Validate email format function
- Validate password strength function
- Validate username format function
- Phone number formatting function

### Integration Tests
- Login flow with valid credentials
- Login flow with invalid credentials
- Registration flow with all fields
- Registration flow with only required fields
- Form validation triggers correctly
- Error messages display properly

## Implementation Notes

- Use KeyboardAvoidingView for iOS
- Use ScrollView with keyboardShouldPersistTaps="handled"
- Store form state with useState hooks
- Implement debounced validation (300ms after typing stops)
- Show/hide password toggle icon
- Auto-focus first input on screen mount
