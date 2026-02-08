# Implementation Plan: Food Scanner Post Enhancement

## Overview

This implementation plan breaks down the food scanner post enhancement feature into discrete, incremental coding tasks. Each task builds on previous work, with testing integrated throughout to catch errors early. The implementation follows a bottom-up approach: services first, then components, then integration.

## Tasks

- [x] 1. Set up dependencies and type definitions
  - Install react-native-image-picker, react-native-image-resizer, and fast-check
  - Add TypeScript type definitions for image assets and AI analysis results
  - Update SharePost interface to include optional imageUrl field
  - Update PostFormData interface to include optional imageUrl field
  - _Requirements: 8.5_

- [x] 2. Implement ImageService for image handling
  - [x] 2.1 Create ImageService with image picker integration
    - Implement pickImage() method with camera and library support
    - Handle platform-specific permission requests
    - Return ImageAsset with metadata (uri, type, size, dimensions)
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 2.2 Write property test for image picker
    - **Property 2: Permission Request on Image Source Selection**
    - **Validates: Requirements 1.3**
  
  - [x] 2.3 Implement image compression functionality
    - Implement compressImage() method using react-native-image-resizer
    - Compress to max 1200px width, 80% quality
    - Return CompressedImage with updated metadata
    - _Requirements: 3.5_
  
  - [x] 2.4 Implement base64 conversion for AI analysis
    - Implement convertToBase64() method
    - Handle both iOS and Android file URIs
    - Return base64 string suitable for Gemini API
    - _Requirements: 2.1_
  
  - [x] 2.5 Implement Supabase upload with retry logic
    - Implement uploadToSupabase() method with 3-retry logic
    - Generate unique filenames using userId and timestamp
    - Return public URL on success
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 2.6 Write property tests for ImageService
    - **Property 3: Image Validation Before Processing**
    - **Property 6: Image Upload with Unique Filename**
    - **Property 7: Upload Retry Logic**
    - **Validates: Requirements 1.5, 3.1, 3.2, 3.3, 3.4, 3.5**
  
  - [ ]* 2.7 Write unit tests for ImageService edge cases
    - Test invalid image formats
    - Test oversized images (>5MB)
    - Test network failures during upload
    - Test permission denial scenarios
    - _Requirements: 1.5, 3.4, 6.2_

- [x] 3. Create ImagePickerButton component
  - [x] 3.1 Implement ImagePickerButton UI component
    - Create button with camera icon and dashed border
    - Implement action sheet with "Take Photo" and "Choose from Library"
    - Apply earthy design styling (colors, spacing, shadows)
    - Handle disabled state
    - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.4_
  
  - [ ]* 3.2 Write unit tests for ImagePickerButton
    - Test button rendering
    - Test action sheet display
    - Test disabled state
    - Test accessibility labels
    - _Requirements: 1.1, 1.2_

- [x] 4. Create ImagePreview component
  - [x] 4.1 Implement ImagePreview UI component
    - Display selected image with rounded corners
    - Add remove and replace button overlays
    - Show loading overlay during AI analysis
    - Apply earthy design styling with shadows
    - _Requirements: 1.4, 5.1, 7.5_
  
  - [ ]* 4.2 Write property test for image preview
    - **Property 1: Image Selection and Preview**
    - **Validates: Requirements 1.4**
  
  - [ ]* 4.3 Write unit tests for ImagePreview
    - Test image display
    - Test remove button action
    - Test replace button action
    - Test loading overlay display
    - _Requirements: 1.4, 5.1_

- [x] 5. Create AIAnalysisIndicator component
  - [x] 5.1 Implement AIAnalysisIndicator UI component
    - Display animated spinner during analysis
    - Show success checkmark with scale animation
    - Display error message with shake animation
    - Apply earthy design styling
    - _Requirements: 5.1, 5.3, 6.1_
  
  - [ ]* 5.2 Write unit tests for AIAnalysisIndicator
    - Test loading state display
    - Test success state display
    - Test error state display
    - Test animations trigger correctly
    - _Requirements: 5.1, 5.3, 6.1_

- [x] 6. Enhance PostCreatorForm with image upload
  - [x] 6.1 Add image state management to PostCreatorForm
    - Add state for selectedImage, isAnalyzing, analysisError, aiSuggestions
    - Add state for isUploadingImage and uploadProgress
    - Implement handleImageSelected callback
    - Implement handleImageRemove callback
    - _Requirements: 1.4, 5.1, 5.2, 5.5_
  
  - [x] 6.2 Integrate ImagePickerButton into form layout
    - Add ImagePickerButton at top of form
    - Position below header, above title input
    - Handle image selection callback
    - _Requirements: 1.1, 1.2_
  
  - [x] 6.3 Integrate ImagePreview into form layout
    - Show ImagePreview when image is selected
    - Replace ImagePickerButton when image exists
    - Handle remove and replace actions
    - _Requirements: 1.4_
  
  - [x] 6.4 Integrate AIAnalysisIndicator into form layout
    - Show indicator below image preview during analysis
    - Display success/error states
    - _Requirements: 5.1, 5.3, 6.1_

- [x] 7. Implement AI analysis integration
  - [x] 7.1 Add AI analysis trigger on image selection
    - Call ImageService.convertToBase64() when image selected
    - Call GeminiRiskClassifier.classifyFoodRisk() with image data
    - Set isAnalyzing state during API call
    - Handle timeout (15 seconds)
    - _Requirements: 2.1, 2.2, 5.1, 5.2_
  
  - [x] 7.2 Implement form auto-population from AI results
    - Extract suggestedTitle, suggestedDescription from AI response
    - Extract riskTier from AI response
    - Auto-populate title, description, and risk tier fields
    - Maintain fields as editable after population
    - _Requirements: 2.3, 2.4, 2.5, 4.1_
  
  - [ ]* 7.3 Write property test for AI analysis round trip
    - **Property 4: AI Analysis Round Trip**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
  
  - [ ]* 7.4 Write unit tests for AI analysis integration
    - Test successful analysis flow
    - Test timeout handling
    - Test rate limit error
    - Test network error
    - Test non-food image warning
    - _Requirements: 2.1, 2.2, 6.1, 6.4_

- [x] 8. Implement user override and TTL recalculation
  - [x] 8.1 Add user override tracking
    - Track which fields user has manually edited
    - Preserve user edits over AI suggestions
    - Update TTL when risk tier changes
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ]* 8.2 Write property tests for user overrides
    - **Property 5: Risk Tier to TTL Mapping**
    - **Property 8: User Override Persistence**
    - **Validates: Requirements 2.4, 4.1, 4.2, 4.3, 4.4**
  
  - [ ]* 8.3 Write unit tests for TTL recalculation
    - Test TTL updates when risk tier changes
    - Test high tier → 15 minutes
    - Test medium tier → 30 minutes
    - Test low tier → 60 minutes
    - _Requirements: 2.4, 4.3_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement image upload on form submission
  - [x] 10.1 Add image upload to form submission flow
    - Compress image before upload
    - Call ImageService.uploadToSupabase() with retry logic
    - Show upload progress indicator
    - Disable submit button during upload
    - _Requirements: 3.1, 3.5, 5.2, 5.5_
  
  - [x] 10.2 Update post creation to include image URL
    - Add imageUrl to PostFormData
    - Pass imageUrl to onSubmit callback
    - Handle upload failure gracefully (allow post without image)
    - _Requirements: 3.3, 6.2_
  
  - [ ]* 10.3 Write property test for loading state management
    - **Property 9: Loading State Management**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5**
  
  - [ ]* 10.4 Write unit tests for upload integration
    - Test successful upload flow
    - Test upload with compression
    - Test upload failure with retry
    - Test post creation with image URL
    - Test post creation without image (upload failed)
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 6.2_

- [x] 11. Implement comprehensive error handling
  - [x] 11.1 Add error handling for all failure scenarios
    - Handle permission denial with explanation dialog
    - Handle image validation errors with user-friendly messages
    - Handle AI analysis errors with fallback to manual entry
    - Handle upload errors with retry/skip options
    - Log all errors for debugging
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 11.2 Write property test for error handling
    - **Property 10: Error Handling with User Feedback**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
  
  - [ ]* 11.3 Write unit tests for error scenarios
    - Test permission denial flow
    - Test invalid image format error
    - Test oversized image error
    - Test AI timeout error
    - Test upload failure error
    - Test error logging
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Update database schema and Supabase storage
  - [x] 12.1 Create database migration for imageUrl column
    - Add imageUrl column to posts table (nullable)
    - Create index on imageUrl for faster queries
    - Test migration on development database
    - _Requirements: 8.5_
  
  - [x] 12.2 Set up Supabase storage bucket
    - Create 'post-images' bucket with public read access
    - Set max file size to 5MB
    - Configure allowed MIME types (image/jpeg, image/png)
    - Set up row-level security policies
    - _Requirements: 3.1, 3.2_

- [x] 13. Update App.tsx to handle image posts
  - [x] 13.1 Update handlePostSubmit to process image URL
    - Accept imageUrl from PostFormData
    - Pass imageUrl to posts service
    - Handle posts with and without images
    - _Requirements: 3.3, 8.5_
  
  - [ ]* 13.2 Write property test for backward compatibility
    - **Property 11: Backward Compatibility**
    - **Validates: Requirements 8.5**
  
  - [ ]* 13.3 Write integration tests for post creation flow
    - Test end-to-end flow: select image → analyze → populate → submit
    - Test post creation with image
    - Test post creation without image
    - Test existing post display compatibility
    - _Requirements: 8.5_

- [x] 14. Update posts service to handle image URLs
  - [x] 14.1 Update createPost to include imageUrl
    - Add imageUrl field to Supabase insert
    - Ensure backward compatibility with posts without images
    - _Requirements: 3.3, 8.5_
  
  - [x] 14.2 Update fetchPosts to include imageUrl
    - Select imageUrl field in queries
    - Handle null imageUrl for existing posts
    - _Requirements: 8.5_

- [ ] 15. Add platform-specific configurations
  - [ ] 15.1 Update iOS Info.plist
    - Add NSCameraUsageDescription
    - Add NSPhotoLibraryUsageDescription
    - Add descriptive permission messages
    - _Requirements: 1.3, 6.3_
  
  - [ ] 15.2 Update Android AndroidManifest.xml
    - Add CAMERA permission
    - Add READ_EXTERNAL_STORAGE permission
    - Add WRITE_EXTERNAL_STORAGE permission (for older Android)
    - _Requirements: 1.3, 6.3_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Manual testing and polish
  - [ ] 17.1 Test on iOS device
    - Test camera capture
    - Test photo library selection
    - Test permission flows
    - Test AI analysis
    - Test image upload
    - Verify UI matches design
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 7.1, 7.2, 7.4, 7.5_
  
  - [ ] 17.2 Test on Android device
    - Test camera capture
    - Test photo library selection
    - Test permission flows
    - Test AI analysis
    - Test image upload
    - Verify UI matches design
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 7.1, 7.2, 7.4, 7.5_
  
  - [ ] 17.3 Accessibility testing
    - Test with screen reader (VoiceOver/TalkBack)
    - Verify all interactive elements have labels
    - Test keyboard navigation
    - Verify color contrast ratios
    - Test touch target sizes
    - _Requirements: 7.1, 7.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: services → components → integration
- Image compression and validation happen before upload to optimize performance
- AI analysis is non-blocking - users can continue with manual entry if it fails
- All error scenarios provide clear user feedback and recovery options
