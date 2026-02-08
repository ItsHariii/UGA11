# Design Document: Food Scanner Post Enhancement

## Overview

This feature enhances the existing PostCreatorForm component by integrating AI-powered food scanning capabilities. Users can upload food images via camera or photo library, and the system automatically analyzes the image using Gemini Vision API to identify the food type and estimate freshness. The UI will be redesigned with an earthy, modern aesthetic that matches the app's existing design language.

The enhancement leverages the existing GeminiRiskClassifier service, which already supports multimodal image analysis. The design focuses on seamless integration with minimal disruption to existing functionality while providing a polished, intuitive user experience.

## Architecture

### High-Level Flow

```
User Opens Post Creator
    ↓
[Optional] User Taps "Add Photo"
    ↓
Image Picker Modal (Camera/Library)
    ↓
User Selects/Captures Image
    ↓
Image Preview Displayed
    ↓
AI Analysis Triggered (Gemini Vision API)
    ↓
Loading State with Progress Indicator
    ↓
AI Results Auto-Populate Form Fields
    ↓
User Reviews/Edits (Optional Override)
    ↓
Image Upload to Supabase Storage
    ↓
Post Created with Image URL
```

### Component Architecture

```
PostCreatorForm (Enhanced)
├── ImagePickerButton
│   └── Opens native image picker
├── ImagePreview
│   ├── Displays selected image
│   └── Remove/Replace actions
├── AIAnalysisIndicator
│   ├── Loading spinner
│   └── Success/Error feedback
├── FormFields (Auto-populated)
│   ├── Title (editable)
│   ├── Description (editable)
│   └── Risk Tier Picker (editable)
└── SubmitButton
    └── Handles image upload + post creation
```

### Service Layer

```
ImageService
├── pickImage() → Promise<ImageAsset>
├── compressImage() → Promise<CompressedImage>
└── uploadToSupabase() → Promise<string>

GeminiRiskClassifier (Existing - Enhanced)
├── classifyFoodRisk() → Promise<ClassificationResult>
└── Supports multimodal input (text + image)
```

## Components and Interfaces

### 1. Enhanced PostCreatorForm Component

**Location:** `src/components/post/PostCreatorForm.tsx`

**New Props:**
```typescript
export interface PostCreatorFormProps {
  onSubmit: (data: PostFormData) => void;
  isSubmitting?: boolean;
  // No new props needed - internal enhancement
}

export interface PostFormData {
  title: string;
  description: string;
  riskTier: RiskTier;
  imageUrl?: string; // NEW: Optional image URL
}
```

**New State:**
```typescript
interface PostCreatorState {
  // Existing state
  title: string;
  description: string;
  riskTier: RiskTier;
  errors: string[];
  
  // New state for image handling
  selectedImage: ImageAsset | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  aiSuggestions: AIAnalysisResult | null;
  isUploadingImage: boolean;
  uploadProgress: number;
}
```

### 2. ImagePickerButton Component

**Location:** `src/components/post/ImagePickerButton.tsx`

```typescript
export interface ImagePickerButtonProps {
  onImageSelected: (image: ImageAsset) => void;
  disabled?: boolean;
  testID?: string;
}

export interface ImageAsset {
  uri: string;
  type: string; // 'image/jpeg' | 'image/png'
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  base64?: string; // For AI analysis
}
```

**Functionality:**
- Displays a button with camera icon
- Opens action sheet with "Take Photo" and "Choose from Library" options
- Handles permission requests
- Returns selected image with metadata

### 3. ImagePreview Component

**Location:** `src/components/post/ImagePreview.tsx`

```typescript
export interface ImagePreviewProps {
  image: ImageAsset;
  onRemove: () => void;
  onReplace: () => void;
  isAnalyzing?: boolean;
  testID?: string;
}
```

**Functionality:**
- Displays selected image with rounded corners
- Shows overlay with remove/replace buttons
- Displays loading overlay during AI analysis
- Matches earthy design aesthetic

### 4. AIAnalysisIndicator Component

**Location:** `src/components/post/AIAnalysisIndicator.tsx`

```typescript
export interface AIAnalysisIndicatorProps {
  isAnalyzing: boolean;
  error: string | null;
  success: boolean;
  testID?: string;
}
```

**Functionality:**
- Shows animated spinner during analysis
- Displays success checkmark when complete
- Shows error message with retry option
- Smooth fade transitions

### 5. ImageService

**Location:** `src/services/image.service.ts`

```typescript
export interface ImageService {
  /**
   * Opens native image picker
   * @param source - 'camera' | 'library'
   * @returns Selected image asset
   */
  pickImage(source: 'camera' | 'library'): Promise<ImageAsset>;
  
  /**
   * Compresses image for upload
   * @param image - Original image asset
   * @param maxWidth - Maximum width (default: 1200)
   * @param quality - JPEG quality 0-1 (default: 0.8)
   * @returns Compressed image
   */
  compressImage(
    image: ImageAsset,
    maxWidth?: number,
    quality?: number
  ): Promise<CompressedImage>;
  
  /**
   * Uploads image to Supabase storage
   * @param image - Image to upload
   * @param bucket - Storage bucket name
   * @returns Public URL of uploaded image
   */
  uploadToSupabase(
    image: CompressedImage,
    bucket: string
  ): Promise<string>;
  
  /**
   * Converts image to base64 for AI analysis
   * @param image - Image asset
   * @returns Base64 string
   */
  convertToBase64(image: ImageAsset): Promise<string>;
}

export interface CompressedImage {
  uri: string;
  type: string;
  fileName: string;
  fileSize: number;
  base64?: string;
}
```

### 6. Enhanced GeminiRiskClassifier

**Location:** `src/services/GeminiRiskClassifier.ts` (Existing)

The existing service already supports image analysis. We'll use it as-is with the multimodal input capability:

```typescript
// Existing interface - already supports images
export interface FoodClassificationInput {
  title: string;
  description: string;
  content?: string;
  image?: {
    data: string; // base64
    mimeType: string;
  };
}

export interface ClassificationResult {
  success: boolean;
  riskTier: RiskTier;
  confidence: number;
  reasoning: string;
  extractedData?: ExtractedFoodData; // NEW: Returned when image provided
  error?: GeminiError;
}

export interface ExtractedFoodData {
  suggestedTitle?: string;
  suggestedDescription?: string;
  observations?: string;
}
```

## Data Models

### Post Data Model (Enhanced)

```typescript
export interface SharePost {
  id: string;
  authorId: string;
  authorIdentifier: string;
  title: string;
  description: string;
  riskTier: RiskTier;
  createdAt: number;
  expiresAt: number;
  source: 'local' | 'supabase';
  imageUrl?: string; // NEW: Optional image URL
  location?: {
    latitude: number;
    longitude: number;
  };
}
```

### Supabase Storage Structure

```
Bucket: post-images
├── {userId}/
│   ├── {postId}_original.jpg
│   └── {postId}_compressed.jpg
```

**Storage Policies:**
- Public read access for all images
- Authenticated write access only
- Max file size: 5MB
- Allowed formats: JPEG, PNG

### Database Schema Update

```sql
-- Add imageUrl column to posts table
ALTER TABLE posts 
ADD COLUMN image_url TEXT;

-- Add index for faster queries
CREATE INDEX idx_posts_image_url ON posts(image_url) 
WHERE image_url IS NOT NULL;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Image Selection and Preview

*For any* valid image selected from camera or library, the Post_Creator should display a preview of that image.

**Validates: Requirements 1.4**

### Property 2: Permission Request on Image Source Selection

*For any* image source selection (camera or library), if permissions are not already granted, the Image_Picker should request the appropriate permissions.

**Validates: Requirements 1.3**

### Property 3: Image Validation Before Processing

*For any* selected image, the System should validate format and size before proceeding with AI analysis or upload.

**Validates: Requirements 1.5, 3.5**

### Property 4: AI Analysis Round Trip

*For any* food image with valid format, sending it to Gemini_Vision_API should return extracted food data (title, description, observations) and a risk tier classification, which then auto-populates the form fields.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 5: Risk Tier to TTL Mapping

*For any* risk tier (high/medium/low), the System should calculate the corresponding TTL value according to the defined mapping (high=15min, medium=30min, low=60min).

**Validates: Requirements 2.4, 4.3**

### Property 6: Image Upload with Unique Filename

*For any* post with an image, uploading to Supabase_Storage should generate a unique filename and return a public URL that gets stored in the post record.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 7: Upload Retry Logic

*For any* failed image upload, the System should retry up to 3 times before displaying an error to the user.

**Validates: Requirements 3.4**

### Property 8: User Override Persistence

*For any* auto-populated field that a user modifies, the System should preserve the user's changes and use those final values when submitting the post.

**Validates: Requirements 4.1, 4.2, 4.4**

### Property 9: Loading State Management

*For any* async operation (AI analysis or image upload), the Post_Creator should display appropriate loading indicators and disable the submit button until the operation completes.

**Validates: Requirements 5.1, 5.2, 5.3, 5.5**

### Property 10: Error Handling with User Feedback

*For any* error (API failure, upload failure, permission denial, non-food image), the System should display a user-friendly error message and log detailed error information for debugging.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 11: Backward Compatibility

*For any* new post created with the enhanced form, the post data structure should remain compatible with existing post consumers (feed display, storage, etc.).

**Validates: Requirements 8.5**

## Error Handling

### Error Categories

1. **Permission Errors**
   - Camera permission denied
   - Photo library permission denied
   - Storage permission denied (Android)

2. **Image Errors**
   - Invalid image format
   - Image too large (>5MB)
   - Image compression failure
   - Corrupted image file

3. **AI Analysis Errors**
   - Gemini API timeout
   - Gemini API rate limit
   - Invalid API key
   - Network error
   - Non-food image detected
   - Parse error (invalid response)

4. **Upload Errors**
   - Network timeout
   - Supabase authentication error
   - Storage quota exceeded
   - Upload interrupted

### Error Handling Strategy

**Permission Errors:**
```typescript
if (permissionDenied) {
  showAlert({
    title: 'Permission Required',
    message: 'Camera access is needed to take photos. Please enable it in Settings.',
    buttons: [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openAppSettings }
    ]
  });
}
```

**Image Validation Errors:**
```typescript
if (imageSize > MAX_SIZE) {
  showError('Image is too large. Please select an image under 5MB.');
  return;
}

if (!ALLOWED_FORMATS.includes(imageType)) {
  showError('Invalid format. Please select a JPEG or PNG image.');
  return;
}
```

**AI Analysis Errors:**
```typescript
try {
  const result = await geminiClassifier.classifyFoodRisk(input);
  
  if (!result.success) {
    switch (result.error) {
      case 'timeout':
        showError('Analysis timed out. Please try again.');
        break;
      case 'rate_limit':
        showError('Too many requests. Please wait a moment.');
        break;
      case 'network_error':
        showError('Network error. Check your connection.');
        break;
      default:
        showError('Analysis failed. You can still create the post manually.');
    }
    // Allow user to continue with manual entry
  }
} catch (error) {
  logError('AI Analysis Error', error);
  showError('Unexpected error. Please try again.');
}
```

**Upload Errors with Retry:**
```typescript
async function uploadWithRetry(
  image: CompressedImage,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = await imageService.uploadToSupabase(image, 'post-images');
      return url;
    } catch (error) {
      lastError = error;
      logError(`Upload attempt ${attempt} failed`, error);
      
      if (attempt < maxRetries) {
        await delay(1000 * attempt); // Exponential backoff
      }
    }
  }
  
  throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError.message}`);
}
```

**Graceful Degradation:**
- If AI analysis fails, allow manual entry
- If image upload fails, allow post creation without image
- If compression fails, try uploading original (with size check)
- Always provide clear user feedback and recovery options

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of image selection flows
- Edge cases (empty images, corrupted files)
- Error conditions (permission denied, network failures)
- Integration points (Supabase, Gemini API)
- UI component rendering

**Property Tests** focus on:
- Universal properties across all valid inputs
- Image validation for any image format/size
- AI analysis for any food image
- Upload retry logic for any failure scenario
- Form field persistence for any user modification

### Property-Based Testing Configuration

**Library:** fast-check (for TypeScript/React Native)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: food-scanner-post-enhancement, Property {N}: {description}`

**Example Property Test:**
```typescript
import fc from 'fast-check';

describe('Property 4: AI Analysis Round Trip', () => {
  it('should extract food data and classify risk tier for any valid food image', async () => {
    // Feature: food-scanner-post-enhancement, Property 4: AI Analysis Round Trip
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
          imageData: fc.base64String(),
          mimeType: fc.constantFrom('image/jpeg', 'image/png')
        }),
        async (input) => {
          const result = await geminiClassifier.classifyFoodRisk({
            title: input.title,
            description: input.description,
            image: {
              data: input.imageData,
              mimeType: input.mimeType
            }
          });
          
          // Should return a valid risk tier
          expect(['high', 'medium', 'low']).toContain(result.riskTier);
          
          // Should include extracted data when image provided
          expect(result.extractedData).toBeDefined();
          
          // Confidence should be between 0 and 1
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Coverage

**Components:**
- ImagePickerButton: permission handling, action sheet display
- ImagePreview: display, remove/replace actions
- AIAnalysisIndicator: loading states, error display
- PostCreatorForm: form submission, field validation

**Services:**
- ImageService: image picking, compression, upload
- GeminiRiskClassifier: API calls, response parsing (existing tests)

**Integration:**
- End-to-end flow: select image → analyze → populate → submit
- Error recovery flows
- Permission request flows

### Manual Testing Checklist

- [ ] Camera capture on iOS
- [ ] Camera capture on Android
- [ ] Photo library selection on iOS
- [ ] Photo library selection on Android
- [ ] Permission denial handling
- [ ] Large image handling (>5MB)
- [ ] Invalid format handling
- [ ] AI analysis with various food types
- [ ] AI analysis with non-food images
- [ ] Network offline during analysis
- [ ] Network offline during upload
- [ ] Form field override
- [ ] Post creation with image
- [ ] Post creation without image
- [ ] UI matches design system

## UI Design Specifications

### Color Palette (Earthy Theme)

```typescript
const colors = {
  // Primary earthy tones
  primary: '#2e7d32',      // Forest green
  primaryLight: '#4caf50', // Light green
  primaryDark: '#1b5e20',  // Dark green
  
  // Secondary natural tones
  secondary: '#795548',    // Brown
  secondaryLight: '#a1887f', // Light brown
  
  // Neutral earth tones
  background: '#f5f5f5',   // Light gray (existing)
  surface: '#ffffff',      // White
  border: '#e0e0e0',       // Light border
  
  // Accent colors
  accent: '#ff6f00',       // Warm orange
  success: '#66bb6a',      // Success green
  warning: '#ffa726',      // Warning orange
  error: '#ef5350',        // Error red
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#9e9e9e',
};
```

### Typography

```typescript
const typography = {
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
};
```

### Spacing and Layout

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};
```

### Component Styling

**ImagePickerButton:**
```typescript
{
  backgroundColor: colors.surface,
  borderWidth: 2,
  borderColor: colors.primary,
  borderStyle: 'dashed',
  borderRadius: borderRadius.lg,
  padding: spacing.lg,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 120,
}
```

**ImagePreview:**
```typescript
{
  borderRadius: borderRadius.lg,
  overflow: 'hidden',
  ...shadows.md,
  backgroundColor: colors.surface,
}
```

**AIAnalysisIndicator:**
```typescript
{
  backgroundColor: colors.primaryLight,
  borderRadius: borderRadius.md,
  padding: spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
}
```

### Animations

**Loading Spinner:**
- Rotation: 360° in 1s, continuous
- Easing: linear
- Color: primary green

**Success Checkmark:**
- Scale: 0 → 1 in 300ms
- Easing: spring (tension: 100, friction: 10)
- Color: success green

**Error Shake:**
- TranslateX: 0 → 10 → -10 → 0 in 400ms
- Easing: ease-in-out
- Repeat: 2 times

**Image Preview Fade:**
- Opacity: 0 → 1 in 300ms
- Easing: ease-out

## Implementation Notes

### Dependencies

**New Dependencies:**
```json
{
  "react-native-image-picker": "^5.0.0",
  "react-native-image-resizer": "^3.0.0",
  "fast-check": "^3.15.0"
}
```

**Existing Dependencies (Already in project):**
- @google/genai (Gemini API)
- @supabase/supabase-js (Storage)
- react-native (Core)

### Platform-Specific Considerations

**iOS:**
- Add camera usage description to Info.plist
- Add photo library usage description to Info.plist
- Handle permission prompts gracefully

**Android:**
- Add camera permission to AndroidManifest.xml
- Add read external storage permission
- Handle Android 13+ photo picker

### Performance Optimizations

1. **Image Compression:**
   - Compress images before upload (max 1200px width, 80% quality)
   - Reduces upload time and storage costs
   - Maintains acceptable visual quality

2. **Lazy Loading:**
   - Load image picker library only when needed
   - Reduces initial bundle size

3. **Debouncing:**
   - Debounce AI analysis calls (prevent rapid re-analysis)
   - Reduces API costs and improves UX

4. **Caching:**
   - Cache AI analysis results by image hash
   - Avoid re-analyzing same image

### Security Considerations

1. **Image Validation:**
   - Validate file type on client and server
   - Check file size limits
   - Sanitize filenames

2. **Storage Security:**
   - Use authenticated uploads
   - Implement row-level security in Supabase
   - Set appropriate CORS policies

3. **API Key Protection:**
   - Store Gemini API key securely (environment variables)
   - Never expose in client code
   - Use backend proxy if needed

### Accessibility

1. **Screen Reader Support:**
   - Add accessibility labels to all interactive elements
   - Announce loading states and errors
   - Provide text alternatives for images

2. **Keyboard Navigation:**
   - Ensure all actions are keyboard accessible
   - Proper tab order

3. **Color Contrast:**
   - Maintain WCAG AA contrast ratios
   - Don't rely solely on color for information

4. **Touch Targets:**
   - Minimum 44x44pt touch targets
   - Adequate spacing between interactive elements

## Migration and Rollout

### Database Migration

```sql
-- Step 1: Add column (nullable initially)
ALTER TABLE posts 
ADD COLUMN image_url TEXT;

-- Step 2: Add index
CREATE INDEX idx_posts_image_url ON posts(image_url) 
WHERE image_url IS NOT NULL;

-- Step 3: Update existing posts (if needed)
-- No action needed - existing posts will have NULL image_url
```

### Supabase Storage Setup

```typescript
// Create storage bucket
const { data, error } = await supabase.storage.createBucket('post-images', {
  public: true,
  fileSizeLimit: 5242880, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png']
});

// Set up storage policies
await supabase.rpc('create_storage_policies', {
  bucket_name: 'post-images'
});
```

### Feature Flag

```typescript
const FEATURE_FLAGS = {
  imageUpload: true, // Enable/disable image upload feature
  aiAnalysis: true,  // Enable/disable AI analysis
};

// Use in component
if (FEATURE_FLAGS.imageUpload) {
  // Show image picker button
}
```

### Rollout Strategy

1. **Phase 1:** Deploy backend changes (database, storage)
2. **Phase 2:** Deploy app with feature flag disabled
3. **Phase 3:** Enable for beta testers
4. **Phase 4:** Gradual rollout to all users
5. **Phase 5:** Monitor metrics and gather feedback

### Monitoring and Metrics

**Key Metrics:**
- Image upload success rate
- AI analysis success rate
- Average analysis time
- Storage usage
- API costs
- User adoption rate

**Alerts:**
- Upload failure rate > 5%
- AI analysis failure rate > 10%
- Average analysis time > 10s
- Storage quota > 80%

## Future Enhancements

1. **Multiple Images:** Support multiple images per post
2. **Image Editing:** Crop, rotate, filter before upload
3. **Offline Support:** Queue uploads for when online
4. **Image Recognition:** Detect multiple food items in one image
5. **Nutrition Info:** Extract nutritional information from labels
6. **Expiration Date OCR:** Read expiration dates from packaging
7. **Recipe Suggestions:** Suggest recipes based on food items
8. **Social Sharing:** Share posts to social media with images
