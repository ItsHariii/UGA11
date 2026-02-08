# Error Handling Implementation

## Overview

This document describes the comprehensive error handling implementation for the food scanner post enhancement feature. The implementation covers all failure scenarios with user-friendly messages, logging, and recovery options.

**Requirements Addressed:** 6.1, 6.2, 6.3, 6.4, 6.5

## Architecture

### Centralized Error Handling Utility

**Location:** `src/utils/errorHandling.ts`

The error handling utility provides:
- **Error Type Classification**: Categorizes errors into specific types (permission, validation, AI, upload, etc.)
- **User-Friendly Messages**: Converts technical errors into clear, actionable messages
- **Error Logging**: Maintains an in-memory log of all errors for debugging
- **Alert Management**: Shows appropriate alerts with recovery actions
- **Recovery Actions**: Provides retry, skip, or settings navigation options

### Error Types

```typescript
type ErrorType =
  | 'permission_denied'      // General permission error
  | 'permission_camera'      // Camera permission denied
  | 'permission_library'     // Photo library permission denied
  | 'image_validation'       // Image validation failed
  | 'image_too_large'        // Image exceeds 5MB
  | 'image_invalid_format'   // Not JPEG/PNG
  | 'image_corrupted'        // Corrupted image file
  | 'image_compression'      // Compression failed
  | 'ai_analysis'            // AI analysis failed
  | 'ai_timeout'             // AI analysis timed out
  | 'ai_rate_limit'          // API rate limit exceeded
  | 'ai_network'             // Network error during AI call
  | 'ai_non_food'            // Non-food image detected
  | 'upload_failed'          // Upload failed
  | 'upload_network'         // Network error during upload
  | 'upload_auth'            // Authentication error
  | 'upload_quota'           // Storage quota exceeded
  | 'unknown'                // Unknown error
```

## Implementation Details

### 1. Permission Errors (Requirements 6.3)

**Scenario:** User denies camera or photo library access

**Handling:**
- Detect permission denial in `ImageService.pickImage()`
- Parse error to identify specific permission type
- Show alert with explanation and "Open Settings" button
- Log error with context

**Example:**
```typescript
// In ImagePickerButton.tsx
const errorDetails = handleError(
  error,
  'Image picker (camera)',
  {
    showAlert: true,
    onRetry: () => handleImagePick('camera'),
  }
);
```

**User Experience:**
```
Title: "Permission Required"
Message: "Camera access is needed to take photos. Please enable it in Settings."
Actions: [Cancel] [Open Settings]
```

### 2. Image Validation Errors (Requirements 6.2)

**Scenarios:**
- Image too large (>5MB)
- Invalid format (not JPEG/PNG)
- Corrupted image file

**Handling:**
- Validate in `ImageService.validateImage()`
- Throw specific error messages
- Parse and show user-friendly alert
- Allow retry with different image

**Example:**
```typescript
// In ImageService.ts
if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
  throw new Error('Image is too large. Please select an image under 5MB.');
}
```

**User Experience:**
```
Title: "Image Error"
Message: "Image is too large. Please select an image under 5MB."
Actions: [Cancel] [Retry]
```

### 3. AI Analysis Errors (Requirements 6.1)

**Scenarios:**
- Analysis timeout (>15 seconds)
- Rate limit exceeded
- Network error
- Non-food image detected
- API error

**Handling:**
- Catch errors in `PostCreatorForm.handleImageSelected()`
- Parse error type and show inline error message
- Allow user to continue with manual entry
- Don't block post creation

**Example:**
```typescript
// In PostCreatorForm.tsx
const errorDetails = handleError(
  error,
  'AI analysis',
  { showAlert: false } // Show inline, not alert
);

setAnalysisError(errorDetails.userMessage);
```

**User Experience:**
- Inline error message below image preview
- Form remains editable
- User can proceed with manual entry
- No blocking alert

### 4. Upload Errors (Requirements 6.2)

**Scenarios:**
- Network error during upload
- Authentication error
- Storage quota exceeded
- Upload interrupted

**Handling:**
- Retry up to 3 times with exponential backoff
- Parse final error if all retries fail
- Show alert with three options: Cancel, Retry, Continue Without Image
- Log all attempts

**Example:**
```typescript
// In PostCreatorForm.tsx
Alert.alert(
  'Image Upload Failed',
  errorDetails.userMessage + '\n\nWould you like to create the post without an image?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Retry Upload', onPress: handleSubmit },
    { text: 'Continue Without Image', onPress: () => onSubmit(formData) },
  ]
);
```

**User Experience:**
```
Title: "Upload Error"
Message: "Upload failed due to network error. Please try again.

Would you like to create the post without an image?"
Actions: [Cancel] [Retry Upload] [Continue Without Image]
```

### 5. Error Logging (Requirements 6.5)

**Implementation:**
- All errors logged to in-memory array
- Includes timestamp, type, message, technical details, stack trace
- Maximum 100 entries (FIFO)
- Console logging in development
- Ready for analytics integration

**Example:**
```typescript
logError(
  'upload_failed',
  'Upload failed after 3 attempts',
  error,
  'Bucket: post-images, File size: 2.3MB'
);
```

**Log Entry:**
```json
{
  "timestamp": "2026-02-08T10:30:45.123Z",
  "type": "upload_failed",
  "message": "Upload failed after 3 attempts",
  "technicalDetails": "Bucket: post-images, File size: 2.3MB",
  "stack": "Error: Network timeout\n  at uploadToSupabase..."
}
```

## Error Recovery Flows

### Permission Denial Flow

```
User taps "Add Photo"
  ↓
User selects "Take Photo"
  ↓
Permission denied
  ↓
Alert: "Permission Required"
  ↓
User taps "Open Settings"
  ↓
Settings app opens
  ↓
User enables permission
  ↓
User returns to app
  ↓
User taps "Add Photo" again
  ↓
Success
```

### AI Analysis Failure Flow

```
User selects image
  ↓
AI analysis starts
  ↓
Analysis fails (timeout/error)
  ↓
Inline error message shown
  ↓
Form remains editable
  ↓
User enters details manually
  ↓
User submits post
  ↓
Success (without AI suggestions)
```

### Upload Failure Flow

```
User submits form with image
  ↓
Compression succeeds
  ↓
Upload attempt 1 fails
  ↓
Wait 1 second
  ↓
Upload attempt 2 fails
  ↓
Wait 2 seconds
  ↓
Upload attempt 3 fails
  ↓
Alert: "Upload Failed"
  ↓
User chooses:
  - Cancel: Stay on form, fix issue
  - Retry: Try upload again
  - Continue: Submit without image
```

## Testing Considerations

### Manual Testing Scenarios

1. **Permission Denial**
   - Deny camera permission
   - Deny photo library permission
   - Verify alert shows with "Open Settings" button

2. **Image Validation**
   - Select image >5MB
   - Select non-JPEG/PNG file
   - Verify error messages are clear

3. **AI Analysis**
   - Disconnect network during analysis
   - Wait for timeout (15s)
   - Select non-food image
   - Verify inline error, form still usable

4. **Upload Failure**
   - Disconnect network during upload
   - Verify retry logic (3 attempts)
   - Verify alert with 3 options
   - Test each option

5. **Error Logging**
   - Trigger various errors
   - Check console logs
   - Verify error details are captured

### Unit Testing

Error handling is tested through:
- ImageService tests (validation, compression, upload)
- PostCreatorForm tests (AI analysis, form submission)
- Error utility tests (parsing, logging, alerts)

## Future Enhancements

1. **Analytics Integration**
   - Send error logs to analytics service
   - Track error rates and patterns
   - Monitor user recovery actions

2. **Offline Support**
   - Queue uploads for when online
   - Show offline indicator
   - Retry automatically when connection restored

3. **Error Recovery Suggestions**
   - Suggest image compression for large files
   - Suggest alternative images for non-food
   - Provide troubleshooting tips

4. **User Feedback**
   - Allow users to report errors
   - Collect additional context
   - Improve error messages based on feedback

## Summary

The error handling implementation provides:
- ✅ Comprehensive coverage of all failure scenarios
- ✅ User-friendly error messages with clear actions
- ✅ Graceful degradation (fallback to manual entry)
- ✅ Detailed error logging for debugging
- ✅ Recovery options (retry, skip, settings)
- ✅ Non-blocking errors (AI analysis)
- ✅ Blocking errors with options (upload)
- ✅ Centralized error handling utility
- ✅ Consistent error experience across components

All requirements (6.1, 6.2, 6.3, 6.4, 6.5) are fully addressed.
