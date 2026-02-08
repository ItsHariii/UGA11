# Design Document: Post Creator Enhancement

## Overview

This design transforms the post creation screen into an elegant, aesthetically pleasing interface that matches the app's earthy theme. The enhancement adds photo upload capability, improves visual hierarchy, integrates theme colors, and creates a premium user experience.

## Architecture

The post creator will be refactored with new components and enhanced styling:

```
src/components/post/
  ├── PostCreatorForm.tsx       (Enhanced main form)
  ├── PhotoUpload.tsx           (New: Photo upload component)
  ├── RiskTierPicker.tsx        (Enhanced with theme colors)
  └── index.ts

src/components/common/
  ├── ThemedTextInput.tsx       (New: Reusable themed input)
  └── index.ts
```

## Component Designs

### 1. PhotoUpload Component

New component for camera/gallery integration.

```typescript
interface PhotoUploadProps {
  onPhotoSelected: (uri: string) => void;
  onPhotoRemoved: () => void;
  photoUri?: string;
  disabled?: boolean;
}
```

**Features:**
- Dashed border placeholder when empty
- Camera icon with "Add Photo" text
- Image preview (200x200px, rounded)
- Remove button (X icon)
- Press animation
- Camera/gallery picker integration

**Styling:**
- Border: 2px dashed borderDefault
- Border radius: 20px
- Background: backgroundSecondary when empty
- Padding: 24px
- Camera icon: 48px, textMuted color
- Remove button: 32px circle, accentDanger background

### 2. Enhanced PostCreatorForm

```typescript
interface PostCreatorFormProps {
  onSubmit: (data: PostFormData) => void;
  isSubmitting?: boolean;
}

interface PostFormData {
  title: string;
  description: string;
  riskTier: RiskTier;
  photoUri?: string;  // New field
}
```

**Layout Structure:**
```
<LinearGradient> (background)
  <DecorativeCircles />
  <ScrollView>
    <AnimatedCard>
      <Header />
      <PhotoUpload />
      <TitleInput />
      <DescriptionInput />
      <RiskTierPicker />
      <TTLPreview />
      <SubmitButton />
    </AnimatedCard>
  </ScrollView>
</LinearGradient>
```

### 3. ThemedTextInput Component

Reusable input component with theme integration.

```typescript
interface ThemedTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
}
```

**Features:**
- Animated border color on focus
- Character count display
- Error state styling
- Theme color integration
- Smooth transitions

### 4. Enhanced RiskTierPicker

Updated with theme colors and better visual feedback.

**Color Mapping:**
```typescript
const RISK_TIER_COLORS = {
  high: {
    color: tokens.colors.accentDanger,    // #C75B3F
    icon: '🔥',
    background: tokens.colors.accentDanger + '10',
  },
  medium: {
    color: tokens.colors.accentWarning,   // #D4943A
    icon: '⏱️',
    background: tokens.colors.accentWarning + '10',
  },
  low: {
    color: tokens.colors.accentSuccess,   // #5A8A5E
    icon: '📦',
    background: tokens.colors.accentSuccess + '10',
  },
};
```

**Enhanced Styling:**
- Selected: 4px left border in tier color
- Selected: Background tint (10% opacity)
- Unselected: 50% opacity
- Smooth transitions (200ms)
- Larger icons (28px)
- Better spacing (16px padding)

## Visual Design

### Color Palette

```typescript
// Background
backgroundPrimary: '#F5F0E8'
backgroundSecondary: '#FAF7F2'
backgroundCard: '#FBF4EE' + '99' (60% opacity)

// Text
textPrimary: '#2C2C2C'
textSecondary: '#6B6560'
textMuted: '#A09A93'

// Accents
accentPrimary: '#2D5A3D'    (Submit button, header)
accentDanger: '#C75B3F'     (High risk, errors)
accentWarning: '#D4943A'    (Medium risk)
accentSuccess: '#5A8A5E'    (Low risk)

// Borders
borderDefault: '#E5DDD3'
borderFocus: '#2D5A3D'
```

### Typography

```typescript
// Header
fontSize: 32px
fontWeight: '800'
fontFamily: 'Georgia-Bold' (iOS) / 'serif' (Android)
color: accentPrimary
letterSpacing: -0.5px

// Labels
fontSize: 15px
fontWeight: '600'
color: textPrimary

// Input Text
fontSize: 16px
fontWeight: '500'
color: textPrimary

// Placeholders
fontSize: 16px
color: textMuted

// Character Counts
fontSize: 13px
color: textMuted
// Warning state (>90%): accentWarning

// Button Text
fontSize: 17px
fontWeight: '700'
color: '#FFFFFF'
```

### Spacing System

```typescript
// Card
padding: 40px
borderRadius: 32px
maxWidth: 500px
margin: 24px horizontal

// Input Groups
marginBottom: 24px

// Inputs
padding: 16px
borderRadius: 16px
borderWidth: 2px

// Buttons
paddingVertical: 18px
paddingHorizontal: 24px
borderRadius: 16px

// Photo Upload
height: 200px
borderRadius: 20px
marginBottom: 24px
```

### Shadows & Elevation

```typescript
// Card Shadow
shadowColor: 'rgba(0, 0, 0, 0.08)'
shadowOffset: { width: 0, height: 12 }
shadowOpacity: 1
shadowRadius: 24
elevation: 12

// Button Shadow
shadowColor: 'rgba(0, 0, 0, 0.1)'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 1
shadowRadius: 8
elevation: 4

// Input Focus Shadow
shadowColor: accentPrimary + '20'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 1
shadowRadius: 4
elevation: 2
```

## Animations

### 1. Card Entrance

```typescript
// Fade in
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 600,
  useNativeDriver: true,
})

// Slide up
Animated.spring(slideAnim, {
  toValue: 0,
  tension: 50,
  friction: 8,
  useNativeDriver: true,
})
```

### 2. Photo Upload Pulse

```typescript
// When empty, subtle pulse
Animated.loop(
  Animated.sequence([
    Animated.timing(pulseAnim, {
      toValue: 1.02,
      duration: 2000,
      useNativeDriver: true,
    }),
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }),
  ])
)
```

### 3. Button Press

```typescript
Animated.spring(scaleAnim, {
  toValue: 0.98,
  useNativeDriver: true,
})
```

### 4. Input Focus

```typescript
Animated.timing(borderColorAnim, {
  toValue: 1,
  duration: 200,
  useNativeDriver: false,
})
```

### 5. Success State

```typescript
// On successful submission
Animated.sequence([
  Animated.timing(successAnim, {
    toValue: 1.1,
    duration: 200,
    useNativeDriver: true,
  }),
  Animated.timing(successAnim, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }),
])
```

## Photo Upload Integration

### React Native Image Picker

```bash
npm install react-native-image-picker
```

### Implementation

```typescript
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const handlePhotoUpload = async () => {
  const options = {
    mediaType: 'photo',
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
  };

  // Show action sheet: Camera or Gallery
  const result = await launchImageLibrary(options);
  
  if (result.assets && result.assets[0]) {
    onPhotoSelected(result.assets[0].uri);
  }
};
```

### Permissions

```typescript
// Android: AndroidManifest.xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

// iOS: Info.plist
<key>NSCameraUsageDescription</key>
<string>We need camera access to take photos of food items</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select food images</string>
```

## Form Validation

### Enhanced Validation Rules

```typescript
interface ValidationRules {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Title must be 3-100 characters',
  },
  description: {
    required: false,
    maxLength: 500,
    message: 'Description must be less than 500 characters',
  },
  photo: {
    required: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    message: 'Photo must be less than 5MB',
  },
}
```

### Real-time Validation

```typescript
// Character count warning at 90%
const isNearLimit = title.length > 90;
const charCountColor = isNearLimit ? accentWarning : textMuted;

// Validate on blur
const handleTitleBlur = () => {
  if (title.trim().length < 3) {
    setTitleError('Title must be at least 3 characters');
  } else {
    setTitleError(null);
  }
};
```

## Decorative Elements

### Background Circles

```typescript
<View style={[
  styles.decorativeCircle,
  styles.circle1,
  { backgroundColor: tokens.colors.accentPrimary + '08' }
]} />
<View style={[
  styles.decorativeCircle,
  styles.circle2,
  { backgroundColor: tokens.colors.accentSecondary + '10' }
]} />
<View style={[
  styles.decorativeCircle,
  styles.circle3,
  { backgroundColor: tokens.colors.accentSuccess + '06' }
]} />
```

**Positioning:**
```typescript
circle1: {
  width: 250,
  height: 250,
  top: -80,
  right: -80,
}
circle2: {
  width: 180,
  height: 180,
  bottom: -60,
  left: -60,
}
circle3: {
  width: 120,
  height: 120,
  top: '40%',
  left: -60,
}
```

## Accessibility

### ARIA Labels

```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Upload photo"
  accessibilityHint="Opens camera or photo library"
>
  <Camera />
</Pressable>

<TextInput
  accessibilityLabel="Post title"
  accessibilityHint="Enter a title for your food share"
/>

<RiskTierPicker
  accessibilityRole="radiogroup"
  accessibilityLabel="Select perishability risk"
/>
```

### Keyboard Navigation

- Tab order: Photo → Title → Description → Risk Tier → Submit
- Enter key submits form when valid
- Escape key clears focus

## Error States

### Error Container

```typescript
<View style={styles.errorContainer}>
  <AlertCircle size={20} color={tokens.colors.accentDanger} />
  <View style={styles.errorTextContainer}>
    {errors.map((error, index) => (
      <Text key={index} style={styles.errorText}>
        • {error}
      </Text>
    ))}
  </View>
</View>
```

**Styling:**
```typescript
errorContainer: {
  flexDirection: 'row',
  backgroundColor: accentDanger + '14', // 8% opacity
  borderRadius: 16,
  padding: 16,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: accentDanger + '40',
}
```

## Success State

### Post Creation Success

```typescript
// Show success animation
Animated.sequence([
  Animated.timing(successScale, {
    toValue: 1.1,
    duration: 200,
  }),
  Animated.timing(successScale, {
    toValue: 1,
    duration: 200,
  }),
]).start(() => {
  // Navigate back or show confirmation
  navigation.goBack();
});
```

## Implementation Notes

1. **Photo Upload**: Use `react-native-image-picker` for cross-platform support
2. **Animations**: Use `Animated` API for smooth transitions
3. **Theme Integration**: Import tokens from `src/theme/tokens.ts`
4. **Form State**: Use `useState` hooks for form management
5. **Validation**: Implement real-time validation with debouncing
6. **Keyboard**: Use `KeyboardAvoidingView` for iOS, adjust behavior for Android
7. **Testing**: Write unit tests for validation logic
8. **Accessibility**: Test with screen readers (TalkBack, VoiceOver)

## Performance Considerations

- Optimize image size before upload (max 1024x1024)
- Use `useCallback` for event handlers
- Memoize validation functions
- Lazy load image picker library
- Debounce character count updates (100ms)

## Future Enhancements

- Multiple photo uploads (carousel)
- Photo editing (crop, rotate, filters)
- Location tagging with map
- Draft saving to local storage
- Post scheduling
- Template system for common items
- Barcode scanning for packaged goods

