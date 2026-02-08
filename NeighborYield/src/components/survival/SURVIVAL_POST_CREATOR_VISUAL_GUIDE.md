# SurvivalPostCreator Visual Guide

## Overview

The **SurvivalPostCreator** is a simplified 3-field form for creating posts quickly in survival mode. It follows the tactical UI design with high contrast, minimal animations, and battery-efficient styling.

**Requirements:** 8.1-8.10 (Simplified Post Creation)

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Create Post                                            │
│                                                         │
│  Type                                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Have                                         ▼  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Item                                        45/100     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ What are you sharing or need?                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  House Number                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 123                                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   Submit                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   Cancel                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header
- **Text:** "Create Post"
- **Font Size:** 24px
- **Font Weight:** 700 (Bold)
- **Color:** `textPrimary` (#E8F5E9)
- **Margin Bottom:** 24px

### 2. Type Dropdown
**Requirement 8.2:** Dropdown with options: Have, Want, SOS

- **Label:** "Type"
- **Default Value:** "Have"
- **Options:**
  - Have (h)
  - Want (w)
  - SOS (s)
- **Height:** 48px
- **Background:** `backgroundCard` (#161E1A)
- **Border:** 1px solid `borderDefault` (#2A3A30)
- **Border Radius:** 8px
- **Padding:** 16px horizontal
- **Arrow:** ▼ (dropdown indicator)

**Interaction:**
- Tap to open modal with options
- Selected option highlighted with `accentPrimary` (#4AEDC4)
- Modal overlay with semi-transparent background

### 3. SOS Category Dropdown (Conditional)
**Only shown when Type is "SOS"**

- **Label:** "Category"
- **Options:**
  - Medical (m)
  - Safety (s)
  - Fire (f)
  - Other (o)
- **Same styling as Type dropdown**

### 4. Item Input
**Requirement 8.3:** Single-line text input, max 100 characters

- **Label:** "Item"
- **Character Count:** Displayed as "45/100" (right-aligned)
- **Placeholder:** "What are you sharing or need?"
- **Max Length:** 100 characters
- **Height:** 48px
- **Background:** `backgroundCard` (#161E1A)
- **Border:** 1px solid `borderDefault` (#2A3A30)
- **Border Radius:** 8px
- **Padding:** 16px horizontal
- **Text Color:** `textPrimary` (#E8F5E9)
- **Placeholder Color:** `textMuted` (#4AEDC4)

**Character Count Colors:**
- Normal: `textMuted` (#4AEDC4)
- Over limit: `accentDanger` (#FF5252)

### 5. House Number Input
**Requirement 8.4:** Numeric input only

- **Label:** "House Number"
- **Placeholder:** "123"
- **Keyboard Type:** number-pad
- **Input Filter:** Only numeric characters (0-9)
- **Height:** 48px
- **Same styling as Item input**

**Validation:**
- Must be positive integer
- Shows error message if invalid: "Please enter a valid house number"
- Error text color: `accentDanger` (#FF5252)

### 6. Submit Button
**Requirement 8.6:** Green (#4AEDC4), 48px height

- **Text:** "Submit"
- **Height:** 48px
- **Background (enabled):** `accentPrimary` (#4AEDC4)
- **Background (disabled):** `borderDefault` (#2A3A30)
- **Text Color (enabled):** `backgroundPrimary` (#0D1210)
- **Text Color (disabled):** `textMuted` (#4AEDC4)
- **Border Radius:** 8px
- **Font Size:** 16px
- **Font Weight:** 600

**States:**
- **Enabled:** Form is valid (item not empty, house number valid)
- **Disabled:** Form is invalid

### 7. Cancel Button
**Requirement 8.6:** Gray, 48px height

- **Text:** "Cancel"
- **Height:** 48px
- **Background:** `backgroundCard` (#161E1A)
- **Border:** 1px solid `borderDefault` (#2A3A30)
- **Text Color:** `textSecondary` (#A5D6A7)
- **Border Radius:** 8px
- **Font Size:** 16px
- **Font Weight:** 600

---

## Color Palette (Survival Mode)

```typescript
{
  backgroundPrimary: '#0D1210',    // Main background
  backgroundCard: '#161E1A',       // Input/card background
  textPrimary: '#E8F5E9',          // Main text
  textSecondary: '#A5D6A7',        // Secondary text
  textMuted: '#4AEDC4',            // Muted text
  accentPrimary: '#4AEDC4',        // Submit button, highlights
  accentDanger: '#FF5252',         // Error messages
  borderDefault: '#2A3A30',        // Borders
}
```

---

## Validation Rules

### Item Field
**Requirement 8.3, 8.10:**
- ✅ Must not be empty
- ✅ Must not be whitespace only
- ✅ Maximum 100 characters
- ✅ Whitespace is trimmed
- ✅ Character count displayed
- ✅ Supports special characters and unicode

### House Number Field
**Requirement 8.4, 8.9:**
- ✅ Must be numeric only
- ✅ Must be positive integer
- ✅ Cannot be zero or negative
- ✅ Cannot be decimal
- ✅ Shows error message if invalid

### Form Validity
**Requirement 8.1:**
- Form is valid when:
  - Item is not empty (after trimming)
  - Item is ≤ 100 characters
  - House number is valid positive integer
- Submit button is disabled when form is invalid

---

## Performance

**Requirement 8.8:** Submit in < 1 second

- Post creation is synchronous and fast
- No network calls during creation
- Validation is instant
- All tests confirm < 1 second performance

---

## Accessibility

**Requirement 10.10:** WCAG AAA compliance

### Labels
- All inputs have descriptive labels
- Buttons have clear accessibility labels
- Hints provided for screen readers

### Touch Targets
- All interactive elements are 44px minimum
- Buttons are 48px height (exceeds minimum)

### Keyboard Navigation
- Full keyboard support
- Tab order is logical
- Enter key submits form (when valid)

### Screen Reader Support
```typescript
// Type Dropdown
accessibilityRole="button"
accessibilityLabel="Post type: Have"
accessibilityHint="Tap to select post type"

// Item Input
accessibilityLabel="Item description"
accessibilityHint="Enter what you have or need"

// House Number Input
accessibilityLabel="House number"
accessibilityHint="Enter your house number"

// Submit Button
accessibilityRole="button"
accessibilityLabel="Submit post"
accessibilityHint="Create and share this post"
accessibilityState={{ disabled: !isFormValid }}
```

---

## Removed Features

**Requirement 8.5, 8.6, 8.7:** No complex fields

The following features from abundance mode are **NOT** included:
- ❌ Photo upload
- ❌ Description field (multi-line)
- ❌ Risk tier selection
- ❌ Location picker
- ❌ Tags/categories (except SOS category)
- ❌ Rich text formatting
- ❌ Attachments

This keeps the form simple, fast, and battery-efficient.

---

## Usage Example

```typescript
import { SurvivalPostCreator } from './components/survival';
import { SurvivalPost } from './types';

function MyScreen() {
  const handleSubmit = (post: SurvivalPost) => {
    console.log('Post created:', post);
    // Add to state, broadcast to mesh, etc.
  };

  const handleCancel = () => {
    console.log('Cancelled');
    // Close modal, navigate back, etc.
  };

  return (
    <SurvivalPostCreator
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      userHouseNumber={123}
    />
  );
}
```

---

## Testing

All requirements are covered by unit tests:

- ✅ Post creation validation (8.1)
- ✅ Type dropdown (8.2)
- ✅ Item input with character limit (8.3, 8.10)
- ✅ House number validation (8.4, 8.9)
- ✅ No complex fields (8.5, 8.6, 8.7)
- ✅ Submit performance < 1 second (8.8)

Run tests:
```bash
npm test -- SurvivalPostCreator.test.ts
```

---

## Integration

The component is exported from the survival components index:

```typescript
import { SurvivalPostCreator } from './components/survival';
```

It integrates with:
- **Theme System:** Uses `useTheme()` for colors
- **Type System:** Uses `SurvivalPost` and `createSurvivalPost()`
- **Validation:** Built-in validation with error messages
- **Accessibility:** Full WCAG AAA support

---

## Notes

1. **Battery Efficiency:** No animations, minimal re-renders, pure black background
2. **Simplicity:** Only 3 fields (Type, Item, House Number)
3. **Speed:** Form submits in < 1 second
4. **Validation:** Real-time validation with clear error messages
5. **Accessibility:** Full keyboard and screen reader support
6. **Responsive:** Works on all screen sizes with KeyboardAvoidingView
