# Requirements Document

## Introduction

This feature enhances the post creator/share page by integrating AI-powered food scanning capabilities. Users can upload food images, and the system will automatically analyze the food to estimate freshness and expiration time using Gemini Vision API. The UI will be redesigned to match the app's earthy, modern aesthetic while providing a smooth, intuitive post creation experience.

## Glossary

- **Post_Creator**: The UI component responsible for creating new food sharing posts
- **Image_Picker**: The native module that allows users to select images from camera or photo library
- **Gemini_Vision_API**: Google's AI service for image analysis and object recognition
- **Freshness_Estimator**: The AI-powered service that analyzes food images to estimate freshness
- **Risk_Tier**: A classification (high/medium/low) indicating food freshness and safety level
- **TTL**: Time-to-live, the duration a post remains active based on food freshness
- **Supabase_Storage**: The cloud storage service for uploaded images
- **Post_Details**: The data structure containing food type, description, risk tier, and TTL

## Requirements

### Requirement 1: Image Upload Capability

**User Story:** As a user, I want to upload photos of food items, so that I can share what I have available with my neighbors.

#### Acceptance Criteria

1. WHEN a user opens the post creator THEN the System SHALL display an option to add a photo
2. WHEN a user taps the photo option THEN the Image_Picker SHALL present choices for camera or photo library
3. WHEN a user selects an image source THEN the Image_Picker SHALL request appropriate permissions if not already granted
4. WHEN a user captures or selects a photo THEN the Post_Creator SHALL display the selected image as a preview
5. WHEN an image is selected THEN the System SHALL validate the image format and size before proceeding

### Requirement 2: AI-Powered Food Analysis

**User Story:** As a user, I want the app to automatically identify food and estimate its freshness, so that I can quickly create accurate posts without manual data entry.

#### Acceptance Criteria

1. WHEN a user selects a food image THEN the Freshness_Estimator SHALL send the image to Gemini_Vision_API for analysis
2. WHEN the Gemini_Vision_API processes the image THEN the System SHALL extract food type and freshness information
3. WHEN freshness is estimated THEN the Freshness_Estimator SHALL map the estimate to a Risk_Tier (high/medium/low)
4. WHEN a Risk_Tier is determined THEN the System SHALL calculate an appropriate TTL value
5. WHEN AI analysis completes THEN the Post_Creator SHALL auto-populate the food type and risk tier fields

### Requirement 3: Image Storage and Management

**User Story:** As a user, I want my food photos to be securely stored, so that other users can view them when browsing posts.

#### Acceptance Criteria

1. WHEN a user confirms a post with an image THEN the System SHALL upload the image to Supabase_Storage
2. WHEN uploading to Supabase_Storage THEN the System SHALL generate a unique filename to prevent collisions
3. WHEN the upload completes THEN the System SHALL store the image URL in the post record
4. IF the upload fails THEN the System SHALL retry up to 3 times before showing an error
5. WHEN an image is uploaded THEN the System SHALL compress the image to optimize storage and bandwidth

### Requirement 4: User Override Capability

**User Story:** As a user, I want to modify AI suggestions, so that I can correct any inaccuracies in the automated analysis.

#### Acceptance Criteria

1. WHEN AI analysis completes THEN the Post_Creator SHALL display all auto-populated fields as editable
2. WHEN a user modifies an auto-populated field THEN the System SHALL preserve the user's changes
3. WHEN a user changes the risk tier THEN the System SHALL recalculate the TTL accordingly
4. WHEN a user submits the post THEN the System SHALL use the final values (AI or user-modified)

### Requirement 5: Loading States and Feedback

**User Story:** As a user, I want clear feedback during image processing, so that I know the app is working and not frozen.

#### Acceptance Criteria

1. WHEN an image is being analyzed THEN the Post_Creator SHALL display a loading indicator with descriptive text
2. WHEN the AI analysis is in progress THEN the Post_Creator SHALL disable the submit button
3. WHEN the analysis completes successfully THEN the Post_Creator SHALL show a success indicator
4. WHEN the loading state changes THEN the System SHALL provide smooth visual transitions
5. WHILE the image is uploading THEN the Post_Creator SHALL display upload progress

### Requirement 6: Error Handling

**User Story:** As a user, I want helpful error messages when something goes wrong, so that I can understand and resolve issues.

#### Acceptance Criteria

1. IF the Gemini_Vision_API fails to analyze an image THEN the System SHALL display a user-friendly error message
2. IF the image upload fails THEN the System SHALL allow the user to retry or continue without an image
3. IF permissions are denied THEN the System SHALL explain why permissions are needed and how to enable them
4. IF the selected image is not food THEN the System SHALL warn the user and allow them to proceed or choose a different image
5. WHEN an error occurs THEN the System SHALL log the error details for debugging while showing a simplified message to the user

### Requirement 7: UI Design Consistency

**User Story:** As a user, I want the post creator to match the app's design language, so that the experience feels cohesive and polished.

#### Acceptance Criteria

1. THE Post_Creator SHALL use the app's earthy color palette (greens, browns, natural tones)
2. THE Post_Creator SHALL use consistent typography and spacing with other app screens
3. THE Post_Creator SHALL include smooth animations and transitions matching the app's style
4. THE Post_Creator SHALL follow the app's modern, nature-inspired design patterns
5. WHEN displaying the image preview THEN the Post_Creator SHALL use rounded corners and subtle shadows consistent with the app's aesthetic

### Requirement 8: Integration with Existing Systems

**User Story:** As a developer, I want the new features to integrate seamlessly with existing code, so that the app remains maintainable and consistent.

#### Acceptance Criteria

1. THE System SHALL use the existing GeminiRiskClassifier service for AI analysis
2. THE System SHALL integrate with the existing PostCreatorForm component
3. THE System SHALL use the existing Supabase client for storage operations
4. THE System SHALL follow the existing risk tier and TTL calculation logic
5. WHEN creating a post THEN the System SHALL maintain compatibility with the existing post data structure
