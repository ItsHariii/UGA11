# NeighborYield App - Complete Walkthrough Script

**Version:** 1.0  
**Date:** February 8, 2026  
**Purpose:** Comprehensive guide explaining every component, screen, and feature

---

## Table of Contents

1. [App Entry Point](#app-entry-point)
2. [Authentication Flow](#authentication-flow)
3. [Main App Screens](#main-app-screens)
4. [Core Components](#core-components)
5. [Services Layer](#services-layer)
6. [State Management](#state-management)
7. [Transport Layer](#transport-layer)
8. [User Journeys](#user-journeys)

---

## App Entry Point

### App.tsx - The Root Component

**Location:** `NeighborYield/App.tsx`

**What it does:**
- Wraps the entire app with providers (AppProvider, AnimatedThemeProvider)
- Manages authentication state
- Handles session restoration on app launch
- Coordinates all screens and navigation

**Key Features:**
- Session check on startup (restores logged-in users)
- Dual-mode theme support (abundance/survival)
- Floating tab bar navigation
- Real-time data subscriptions

**Flow:**
1. App loads → Check for existing session
2. If session exists → Restore user, show main app
3. If no session → Show login/register screen
4. Once authenticated → Load posts, interests, start subscriptions

---


## Authentication Flow

### 1. LoginScreen.tsx

**Location:** `NeighborYield/src/screens/LoginScreen.tsx`

**Purpose:** Allow returning users to sign in

**Visual Design:**
- Warm beige card with glassmorphism effect
- Animated logo with subtle pulse
- Decorative gradient circles in background
- Clean, modern input fields

**Features:**
- Email validation (checks format)
- Password validation (minimum 6 characters)
- Real-time error display
- "Forgot Password" link
- Switch to registration
- Server error handling

**User Flow:**
1. User enters email and password
2. Fields validate on blur (when user leaves field)
3. Submit button enables when form is valid
4. On submit → Calls auth.service.signIn()
5. Success → Navigate to main app
6. Error → Display error message

**Animations:**
- Fade in on mount
- Slide up entrance
- Logo scale and pulse
- Button press feedback

---

### 2. RegisterScreen.tsx

**Location:** `NeighborYield/src/screens/RegisterScreen.tsx`

**Purpose:** New user account creation

**Fields:**
- Full Name (required, 2+ characters)
- Email (required, valid format)
- Password (required, 6+ characters)
- Confirm Password (must match)

**Features:**
- Real-time validation
- Password strength indicator
- Password visibility toggle
- Terms acceptance checkbox
- Switch to login

**User Flow:**
1. User fills out all fields
2. Each field validates on blur
3. Password confirmation checks match
4. Submit button enables when all valid
5. On submit → Calls auth.service.register()
6. Success → Auto-login, show welcome message
7. Error → Display error message

**What happens on registration:**
- Creates Supabase auth user
- Generates unique user identifier (e.g., "Neighbor-A3F9")
- Stores user profile in database
- Auto-signs in user
- Navigates to main app

---


## Main App Screens

### 1. Feed Screen (Default)

**What you see:**
- Dynamic Island (connectivity status)
- Interest notifications (if any pending)
- Scrollable list of food share posts
- Floating tab bar at bottom

**Components:**
- `DynamicIsland` - Shows online/offline status, peer count
- `InterestNotificationCard` - Pending interest requests
- `FeedList` - Scrollable post feed
- `DualModeFeedCard` - Individual post cards

**Features:**
- Pull-to-refresh
- Real-time post updates
- "I'm Interested" button on each post
- Post expiration countdown
- Risk tier badges (HIGH/MEDIUM/LOW)

**User Actions:**
- Tap "I'm Interested" → Express interest in post
- Pull down → Refresh feed
- Tap Dynamic Island → Cycle connectivity mode (demo)
- Accept/Decline interest notifications

---

### 2. Create Screen

**What you see:**
- Post creation form
- AI-powered risk classification
- Image upload option
- Submit button

**Component:** `PostCreatorForm`

**Features:**
- Title input (required)
- Description textarea (required)
- Photo picker (optional)
  - Camera capture
  - Gallery selection
  - Image compression
- AI risk classification
  - Analyzes food description
  - Suggests risk tier (HIGH/MEDIUM/LOW)
  - User can override
- Manual risk tier picker (fallback)

**User Flow:**
1. Enter food title (e.g., "Fresh Tomatoes")
2. Enter description (e.g., "Picked this morning")
3. Optionally add photo
4. AI analyzes and suggests risk tier
5. User confirms or changes tier
6. Tap "Share Food"
7. Post created → Navigate to feed

**What happens behind the scenes:**
- Image uploaded to Supabase Storage
- Post saved to database with:
  - Title, description, image URL
  - Risk tier → TTL mapping (15/30/60 min)
  - Author ID and identifier
  - Expiration timestamp
- Real-time broadcast to all users
- Post appears in feed immediately

---

### 3. Map Screen

**What you see:**
- Placeholder for map view
- Peer count display
- General area indicators

**Status:** Placeholder (future feature)

**Planned Features:**
- Show general areas of food shares (privacy-preserving)
- Cluster markers for nearby posts
- Filter by risk tier
- Distance indicators

---

### 4. Messages Screen

**Location:** `NeighborYield/src/screens/MessagesScreen.tsx`

**What you see:**
- List of active conversations
- Each conversation shows:
  - Post title
  - Other user's identifier
  - Last message preview
  - Unread count badge
  - Timestamp

**Features:**
- Auto-created when interest accepted
- Real-time message updates
- Unread message indicators
- Tap conversation → Open chat

**User Flow:**
1. Interest gets accepted
2. Conversation auto-created
3. Appears in messages list
4. Tap to open chat screen

---

### 5. Chat Screen

**Location:** `NeighborYield/src/screens/ChatScreen.tsx`

**What you see:**
- Message history (scrollable)
- Message input at bottom
- Send button
- Back button

**Features:**
- Real-time messaging
- Message timestamps
- Sender identification (You vs. Other user)
- Auto-scroll to latest message
- Message persistence

**User Flow:**
1. Type message in input
2. Tap send button
3. Message saved to database
4. Real-time broadcast to other user
5. Message appears in chat
6. Other user receives notification

**Message Structure:**
- Sender ID and identifier
- Message content
- Timestamp
- Conversation ID
- Read status

---

### 6. Settings Screen

**What you see:**
- Permissions status
- Battery & mesh controls
- Demo controls
- Account information
- Logout button

**Sections:**

**A. Permissions**
- Component: `PermissionStatusBar`
- Shows status of:
  - Bluetooth (granted/denied)
  - Location (granted/denied)
  - Nearby Devices (granted/denied)
- Tap to request permission

**B. Battery & Mesh**
- Component: `BackgroundMeshToggle`
- Enable/disable background mesh networking
- Battery optimization settings

**C. Demo Controls**
- Toggle low battery notice
- Toggle mesh discovery
- Toggle Bluetooth permission
- Cycle connectivity modes

**D. Account**
- Display user info:
  - Full name
  - Email
  - User identifier
- Logout button

---


## Core Components

### Connectivity Components

#### 1. DynamicIsland

**Location:** `NeighborYield/src/components/connectivity/DynamicIsland.tsx`

**Purpose:** iPhone-inspired connectivity status indicator

**Visual States:**
- **Online Mode:** Green gradient, cloud icon
- **Offline Mode:** Orange gradient, mesh icon
- **Discovering:** Animated radar ripple

**Displays:**
- Connectivity mode text
- Peer count (when offline)
- Discovery animation

**Interactions:**
- Tap to cycle modes (demo)
- Expands on tap
- Smooth animations

---

#### 2. LowBatteryNotice

**Location:** `NeighborYield/src/components/connectivity/LowBatteryNotice.tsx`

**Purpose:** Alert user when battery is low

**Triggers:**
- Battery level < 15%
- Mesh networking active

**Features:**
- Dismissible banner
- Battery percentage display
- Recommendation to disable mesh
- Auto-dismiss option

---

#### 3. BackgroundMeshToggle

**Location:** `NeighborYield/src/components/connectivity/BackgroundMeshToggle.tsx`

**Purpose:** Control mesh networking in background

**Features:**
- Toggle switch
- Explanation text
- Battery impact warning
- Persists preference

**What it does:**
- Enables/disables mesh when app backgrounded
- Adjusts heartbeat intervals
- Manages battery optimization

---

### Feed Components

#### 1. FeedList

**Location:** `NeighborYield/src/components/feed/FeedList.tsx`

**Purpose:** Scrollable list of food share posts

**Features:**
- Pull-to-refresh
- Optimized rendering (FlatList)
- Empty state handling
- Loading indicators

**Props:**
- `posts` - Array of SharePost objects
- `refreshing` - Boolean for refresh state
- `onRefresh` - Callback for pull-to-refresh
- `onInterestPress` - Callback when user taps "I'm Interested"

---

#### 2. DualModeFeedCard

**Location:** `NeighborYield/src/components/feed/DualModeFeedCard.tsx`

**Purpose:** Individual post card with dual-mode styling

**Visual Elements:**
- Post image (if available)
- Food title
- Description
- Author identifier
- Risk tier badge
- Expiration countdown
- "I'm Interested" button

**Risk Tier Badges:**
- **HIGH:** Red badge, 15 min expiration
- **MEDIUM:** Orange badge, 30 min expiration
- **LOW:** Green badge, 60 min expiration

**Button States:**
- **Default:** "I'm Interested" (green)
- **Pending:** "Interest Sent" (yellow)
- **Accepted:** "Accepted!" (green)
- **Declined:** "Declined" (gray)

**Animations:**
- Fade in on mount
- Scale on press
- Countdown updates every second

---

#### 3. InterestedButton

**Location:** `NeighborYield/src/components/feed/InterestedButton.tsx`

**Purpose:** Action button for expressing interest

**States:**
- `none` - Default, ready to press
- `pending` - Interest sent, waiting for response
- `accepted` - Interest accepted by poster
- `declined` - Interest declined by poster

**Visual Feedback:**
- Color changes per state
- Icon changes per state
- Haptic feedback on press
- Disabled when not in `none` state

---

### Interest Components

#### InterestNotificationCard

**Location:** `NeighborYield/src/components/interest/InterestNotificationCard.tsx`

**Purpose:** Show pending interest requests to post authors

**Displays:**
- Interested user's identifier
- Post title
- Timestamp
- Accept/Decline buttons

**User Actions:**
- Tap "Accept" → Update interest status, create conversation
- Tap "Decline" → Update interest status, no conversation

**What happens on Accept:**
1. Interest status → 'accepted'
2. Conversation auto-created in database
3. Both users can now message
4. Notification disappears from feed

**What happens on Decline:**
1. Interest status → 'declined'
2. No conversation created
3. Notification disappears from feed
4. Interested user sees "Declined" status

---

### Post Creation Components

#### 1. PostCreatorForm

**Location:** `NeighborYield/src/components/post/PostCreatorForm.tsx`

**Purpose:** Complete post creation interface

**Sections:**
- Title input
- Description textarea
- Image picker button
- AI analysis indicator
- Risk tier picker
- Submit button

**Features:**
- Real-time validation
- Character limits
- Image preview
- AI classification
- Error handling

---

#### 2. ImagePickerButton

**Location:** `NeighborYield/src/components/post/ImagePickerButton.tsx`

**Purpose:** Photo capture/selection

**Options:**
- Take Photo (camera)
- Choose from Gallery

**Features:**
- Image compression (< 1MB)
- Format validation (JPEG, PNG, WebP)
- Size validation (< 4MB)
- Preview display
- Remove option

**Technical:**
- Uses `react-native-image-picker`
- Compresses to 85% quality
- Scales to max 1200px
- Converts to base64 for upload

---

#### 3. AIAnalysisIndicator

**Location:** `NeighborYield/src/components/post/AIAnalysisIndicator.tsx`

**Purpose:** Show AI classification status

**States:**
- **Analyzing:** Spinner animation
- **Success:** Checkmark, confidence score
- **Error:** Error icon, fallback message

**Displays:**
- AI-suggested risk tier
- Confidence percentage
- Reasoning (optional)

---

### Permission Components

#### PermissionStatusBar

**Location:** `NeighborYield/src/components/permission/PermissionStatusBar.tsx`

**Purpose:** Display and request permissions

**Permissions Tracked:**
- Bluetooth
- Location
- Nearby Devices

**Visual Indicators:**
- ✓ Green checkmark - Granted
- ✗ Red X - Denied
- ? Yellow question - Not determined

**Interactions:**
- Tap permission → Request if denied
- Shows explanation before request
- Updates status in real-time

---

### Presence Components

#### PresenceTooltip

**Location:** `NeighborYield/src/components/presence/PresenceTooltip.tsx`

**Purpose:** Explain peer count and connectivity

**Displays:**
- Current connectivity mode
- Number of nearby peers
- What it means
- How it works

**Triggered by:**
- Tapping Dynamic Island
- First-time user education

---

### Animation Components

#### 1. ConnectionCelebration

**Location:** `NeighborYield/src/components/animations/ConnectionCelebration.tsx`

**Purpose:** Celebrate when connection restored

**Triggers:**
- Connectivity changes from offline → online
- First peer discovered

**Animation:**
- Confetti burst
- Success message
- Auto-dismiss after 3 seconds

---

#### 2. RadarRipple

**Location:** `NeighborYield/src/components/animations/RadarRipple.tsx`

**Purpose:** Animated radar effect for discovery

**Used in:**
- Dynamic Island (when discovering)
- Survival mode connectivity island

**Animation:**
- Expanding circles
- Fade out
- Continuous loop

---

### Layout Components

#### 1. GradientHeader

**Location:** `NeighborYield/src/components/layout/GradientHeader.tsx`

**Purpose:** Branded header with logo

**Features:**
- Gradient background
- Logo image
- Rounded corners
- Shadow effect

---

#### 2. BentoGrid

**Location:** `NeighborYield/src/components/layout/BentoGrid.tsx`

**Purpose:** Grid layout for dashboard items

**Status:** Placeholder (future feature)

---

### Loading Components

#### Skeleton

**Location:** `NeighborYield/src/components/loading/Skeleton.tsx`

**Purpose:** Loading placeholder animations

**Types:**
- Text skeleton
- Card skeleton
- Image skeleton

**Animation:**
- Shimmer effect
- Pulse animation

---


## Services Layer

### 1. Authentication Service

**Location:** `NeighborYield/src/services/auth.service.ts`

**Functions:**

**signIn(email, password)**
- Authenticates user with Supabase
- Returns user object or error
- Stores session automatically

**register(data)**
- Creates new Supabase auth user
- Generates unique user identifier
- Creates user profile in database
- Auto-signs in user
- Returns user object or error

**getCurrentUser()**
- Checks for existing session
- Returns current user or null
- Used on app startup

**signOut()**
- Signs out current user
- Clears session
- Returns success or error

**resetPassword(email)**
- Sends password reset email
- Returns success or error

---

### 2. Posts Service

**Location:** `NeighborYield/src/services/posts.service.ts`

**Functions:**

**fetchPosts()**
- Retrieves all active posts from Supabase
- Filters out expired posts
- Sorts by creation date (newest first)
- Returns array of SharePost objects

**createPost(data, userId, userIdentifier)**
- Uploads image to Supabase Storage (if provided)
- Calculates expiration time based on risk tier
- Inserts post into database
- Returns created post object

**subscribeToPostUpdates(onInsert, onUpdate, onDelete)**
- Sets up real-time subscription
- Listens for new posts
- Listens for post updates
- Listens for post deletions
- Returns unsubscribe function

**Risk Tier → TTL Mapping:**
- HIGH → 15 minutes
- MEDIUM → 30 minutes
- LOW → 60 minutes

---

### 3. Interests Service

**Location:** `NeighborYield/src/services/interests.service.ts`

**Functions:**

**expressInterest(postId, userId, userIdentifier)**
- Creates interest record in database
- Status: 'pending'
- Returns interest object or error

**fetchMyPostsInterests(userId)**
- Fetches interests for user's posts
- Returns array of InterestAck objects

**updateInterestStatus(interestId, status)**
- Updates interest status ('accepted' or 'declined')
- If accepted, triggers conversation creation
- Returns success or error

**subscribeToInterestUpdates(userId, onInsert, onUpdate)**
- Real-time subscription for interests
- Listens for new interests on user's posts
- Listens for status updates
- Returns unsubscribe function

---

### 4. Messaging Service

**Location:** `NeighborYield/src/services/messaging.service.ts`

**Functions:**

**fetchConversations(userId)**
- Retrieves all conversations for user
- Includes post title, other user info
- Sorted by last message time
- Returns array of conversations

**fetchMessages(conversationId)**
- Retrieves all messages in conversation
- Sorted by timestamp (oldest first)
- Returns array of messages

**sendMessage(conversationId, senderId, senderIdentifier, content)**
- Creates message in database
- Updates conversation last_message_at
- Returns message object or error

**subscribeToConversations(userId, onInsert, onUpdate)**
- Real-time subscription for conversations
- Listens for new conversations
- Listens for conversation updates
- Returns unsubscribe function

**subscribeToMessages(conversationId, onInsert)**
- Real-time subscription for messages
- Listens for new messages in conversation
- Returns unsubscribe function

---

### 5. Image Service

**Location:** `NeighborYield/src/services/image.service.ts`

**Functions:**

**uploadImage(base64Data, mimeType)**
- Validates image size and format
- Generates unique filename
- Uploads to Supabase Storage bucket
- Returns public URL or error

**deleteImage(imageUrl)**
- Extracts filename from URL
- Deletes from Supabase Storage
- Returns success or error

**Validation:**
- Max size: 4MB
- Formats: JPEG, PNG, WebP
- Compression: 85% quality
- Max dimensions: 1200px

---

### 6. Gemini Risk Classifier

**Location:** `NeighborYield/src/services/GeminiRiskClassifier.ts`

**Purpose:** AI-powered food safety risk classification

**Functions:**

**classifyFoodRisk(input)**
- Accepts text or image input
- Calls Google Gemini 1.5 Flash API
- Analyzes food safety risk
- Returns risk tier (HIGH/MEDIUM/LOW)
- Returns confidence score
- Returns reasoning

**Input Types:**
- Text only: title + description
- Image only: photo of food
- Combined: text + image (best accuracy)

**Classification Logic:**
- HIGH: Raw/perishable (raw meat, seafood, cut fruits)
- MEDIUM: Cooked foods (leftovers, reheated dishes)
- LOW: Shelf-stable (canned goods, dried foods)

**Error Handling:**
- Network timeout → Fallback to manual
- API error → Fallback to manual
- Invalid response → Default to MEDIUM

---

### 7. Mode Switching Service

**Location:** `NeighborYield/src/services/mode-switching.service.ts`

**Purpose:** Manage connectivity mode transitions

**Functions:**

**checkConnectivity()**
- Checks internet connection
- Checks mesh capability
- Determines mode (online/offline/hybrid)
- Returns connectivity mode

**enterAbundanceMode()**
- Activates online features
- Connects to Supabase
- Disables mesh networking

**enterSurvivalMode()**
- Activates offline features
- Starts mesh networking
- Enables gossip protocol

**enterHybridMode()**
- Activates both transports
- Sends messages via both
- Maximum resilience

---

### 8. Gossip Service

**Location:** `NeighborYield/src/services/gossip.service.ts`

**Purpose:** Mesh network message propagation

**Functions:**

**broadcastMessage(message)**
- Compresses message
- Sends to all connected peers
- Tracks message IDs (prevent duplicates)

**receiveMessage(message, fromPeer)**
- Validates message
- Checks for duplicates
- Processes message
- Re-broadcasts to other peers

**Protocol:**
- Anti-entropy: Periodic sync
- Rumor mongering: Immediate broadcast
- TTL: Message expiration

---

### 9. Bluetooth Service

**Location:** `NeighborYield/src/services/bluetooth.service.ts`

**Status:** Stub (to be replaced with nearbyAdapter)

**Purpose:** Bluetooth mesh networking

**Planned Functions:**
- startAdvertising()
- startDiscovery()
- sendPayload()
- onPayloadReceived()

---

### 10. Battery Service

**Location:** `NeighborYield/src/services/battery.service.ts`

**Purpose:** Battery monitoring and optimization

**Functions:**

**getBatteryLevel()**
- Returns current battery percentage

**isLowBattery()**
- Returns true if < 15%

**optimizeForBattery()**
- Reduces heartbeat frequency
- Disables background mesh
- Limits discovery

---


## State Management

### AppContext

**Location:** `NeighborYield/src/context/AppContext.tsx`

**Purpose:** Central state management for entire app

**State Properties:**

**Connectivity:**
- `connectivityMode` - 'online' | 'offline' | 'hybrid'

**Permissions:**
- `permissions` - Object with bluetooth, location, nearbyDevices status
- `isBluetoothEnabled` - Boolean

**Presence:**
- `peerCount` - Number of nearby peers
- `peers` - Map of peer information

**Posts:**
- `posts` - Array of SharePost objects

**Interests:**
- `myInterests` - Map of interests user expressed
- `incomingInterests` - Array of interests on user's posts

**User:**
- `userId` - Supabase user ID
- `userIdentifier` - Pseudonymous identifier (e.g., "Neighbor-A3F9")

**Battery:**
- `batteryLevel` - Percentage (0-100)
- `isBackgroundMeshEnabled` - Boolean

**UI:**
- `isRefreshing` - Boolean for pull-to-refresh

**Actions:**

All state updates go through actions:
- `setConnectivityMode(mode)`
- `setPermissions(permissions)`
- `setPeerCount(count)`
- `addPost(post)`
- `removePost(postId)`
- `setMyInterest(interest)`
- `updateInterestStatus(id, status)`
- etc.

**Usage:**
```typescript
const { state, setConnectivityMode } = useAppContext();
```

---

### Theme Context

**Location:** `NeighborYield/src/theme/ThemeContext.tsx`

**Purpose:** Manage app theme (abundance/survival modes)

**Modes:**
- **Abundance:** Light, colorful, full-featured
- **Survival:** Dark, minimal, battery-optimized

**Theme Tokens:**
- Colors (primary, secondary, accent, etc.)
- Typography (font sizes, weights, families)
- Spacing (margins, paddings)
- Shadows
- Border radius

**Animated Theme:**
- Smooth transitions between modes
- Animated color changes
- No jarring switches

---


## Transport Layer

### Overview

The transport layer handles message routing between online (Supabase) and offline (Nearby Connections) modes.

---

### 1. SupabaseTransport

**Location:** `NeighborYield/src/transport/SupabaseTransport.ts`

**Purpose:** Online transport via Supabase

**Features:**
- Database operations (CRUD)
- Real-time subscriptions
- Storage operations
- Authentication

**Methods:**
- `send(message)` - Send message via Supabase
- `subscribe(handler)` - Subscribe to real-time updates
- `getMode()` - Returns 'online'

---

### 2. Nearby Adapter

**Location:** `NeighborYield/src/transport/nearbyAdapter.ts`

**Purpose:** Offline transport via Android Nearby Connections

**Features:**
- Peer discovery
- Payload broadcasting
- Targeted messaging
- Connection management

**Methods:**
- `startAdvertising()` - Make device discoverable
- `startDiscovery()` - Find nearby devices
- `broadcastPayload(data)` - Send to all peers
- `sendPayload(endpointId, data)` - Send to specific peer
- `onPayloadReceived(handler)` - Listen for messages

**Native Module:**
- `NearbyConnectionsModule.kt` - Android implementation
- Uses Google Nearby Connections API
- Bluetooth + WiFi Direct

---

### 3. Message Utils

**Location:** `NeighborYield/src/transport/messageUtils.ts`

**Purpose:** Message serialization and chunking

**Functions:**

**serializeMessage(message)**
- Converts message object to string
- Compresses if needed
- Returns serialized string

**deserializeMessage(data)**
- Parses string to message object
- Decompresses if needed
- Validates structure

**chunkMessage(data, maxSize)**
- Splits large messages into chunks
- Max chunk size: 512 bytes
- Returns array of chunks

**reassembleChunks(chunks)**
- Combines chunks back into message
- Validates completeness
- Returns original message

---

### 4. Heartbeat System

**Location:** `NeighborYield/src/transport/heartbeat.ts`

**Purpose:** Peer presence tracking

**Heartbeat Message:**
```typescript
{
  type: 'heartbeat',
  deviceId: string,
  timestamp: number,
  batteryLevel: number,
  peerCount: number
}
```

**Intervals:**
- Foreground: 15 seconds
- Background: 60 seconds
- Low battery: 120 seconds

**Timeout:**
- Peer considered offline after 30 seconds (2 missed heartbeats)

---

### 5. Transport Error Handler

**Location:** `NeighborYield/src/transport/transportErrorHandler.ts`

**Purpose:** Unified error handling

**Error Types:**
- Network errors
- Timeout errors
- Permission errors
- Serialization errors

**Strategies:**
- Retry with exponential backoff
- Fallback to alternative transport
- User notification
- Error logging

---


## User Journeys

### Journey 1: New User Registration

**Steps:**

1. **App Launch**
   - App checks for session
   - No session found
   - Shows LoginScreen

2. **Switch to Register**
   - User taps "Create Account"
   - RegisterScreen appears

3. **Fill Form**
   - Enter full name: "John Doe"
   - Enter email: "john@example.com"
   - Enter password: "secure123"
   - Confirm password: "secure123"
   - Accept terms

4. **Submit**
   - Tap "Create Account"
   - auth.service.register() called
   - User created in Supabase
   - Identifier generated: "Neighbor-A3F9"
   - Auto-login

5. **Welcome**
   - Success alert shown
   - Navigate to main app
   - Feed screen appears

**Time:** ~2 minutes

---

### Journey 2: Creating a Food Share Post

**Steps:**

1. **Navigate to Create**
   - User taps "+" icon in tab bar
   - Create screen appears

2. **Enter Details**
   - Title: "Fresh Garden Tomatoes"
   - Description: "Picked this morning, organic"

3. **Add Photo (Optional)**
   - Tap "Add Photo"
   - Choose "Take Photo"
   - Camera opens
   - Take picture
   - Photo appears in preview

4. **AI Classification**
   - AI analyzes: "Fresh tomatoes, cut"
   - Suggests: HIGH risk (15 min)
   - Shows confidence: 92%
   - User confirms

5. **Submit**
   - Tap "Share Food"
   - Image uploaded to storage
   - Post created in database
   - Navigate to feed
   - Post appears at top

6. **Real-time Broadcast**
   - All users receive update
   - Post appears in their feeds
   - Expiration countdown starts

**Time:** ~1-2 minutes

---

### Journey 3: Expressing Interest in a Post

**Steps:**

1. **Browse Feed**
   - User scrolls through posts
   - Sees "Fresh Garden Tomatoes"
   - Reads description

2. **Express Interest**
   - Taps "I'm Interested" button
   - Button changes to "Interest Sent"
   - Alert: "Would you like to send a message?"

3. **Choose Action**
   - Option A: "Not Now" → Interest sent, no message
   - Option B: "Send Message" → Navigate to chat

4. **Post Author Notified**
   - Interest appears in author's feed
   - InterestNotificationCard shown
   - Shows: "Neighbor-B7K2 is interested in Fresh Garden Tomatoes"

5. **Author Responds**
   - Taps "Accept"
   - Interest status → 'accepted'
   - Conversation auto-created
   - Both users can now message

6. **Interested User Notified**
   - Button changes to "Accepted!"
   - Can navigate to messages
   - Conversation appears in list

**Time:** ~30 seconds

---

### Journey 4: Messaging After Interest Accepted

**Steps:**

1. **Navigate to Messages**
   - User taps message icon in tab bar
   - MessagesScreen appears
   - Sees conversation: "Fresh Garden Tomatoes"

2. **Open Chat**
   - Taps conversation
   - ChatScreen appears
   - Shows conversation history (if any)

3. **Send Message**
   - Types: "Hi! When can I pick up the tomatoes?"
   - Taps send
   - Message appears in chat
   - Timestamp shown

4. **Other User Receives**
   - Real-time update
   - Message appears in their chat
   - Unread badge on messages tab

5. **Conversation Continues**
   - Other user replies: "Anytime today! I'm at 123 Main St"
   - Messages appear in real-time
   - Coordinate pickup details

6. **Complete Exchange**
   - Users arrange pickup
   - Food shared successfully
   - Conversation remains for future reference

**Time:** ~2-5 minutes

---

### Journey 5: Handling Permissions

**Steps:**

1. **Navigate to Settings**
   - User taps settings icon
   - Settings screen appears

2. **View Permissions**
   - PermissionStatusBar shown
   - Bluetooth: ✗ Denied
   - Location: ✗ Denied
   - Nearby Devices: ✗ Denied

3. **Request Permission**
   - Taps "Bluetooth"
   - Explanation shown: "Needed for mesh networking"
   - System permission dialog appears

4. **Grant Permission**
   - User taps "Allow"
   - Status updates: ✓ Granted
   - canUseMesh flag set to true

5. **Enable Mesh**
   - Mesh networking now available
   - Can switch to offline mode
   - Peer discovery starts

**Time:** ~1 minute

---

### Journey 6: Offline Mode (Future)

**Steps:**

1. **Lose Internet**
   - WiFi disconnects
   - App detects connectivity change
   - Mode switches to 'offline'

2. **Dynamic Island Updates**
   - Shows "Offline - Mesh Active"
   - Displays peer count
   - Radar animation appears

3. **Browse Local Posts**
   - Feed shows cached posts
   - Posts from nearby peers
   - Gossip protocol syncs data

4. **Create Post Offline**
   - User creates post
   - Stored locally
   - Broadcast via mesh
   - Syncs to Supabase when online

5. **Express Interest Offline**
   - Tap "I'm Interested"
   - Interest sent via mesh
   - Queued for Supabase sync

6. **Regain Internet**
   - WiFi reconnects
   - Mode switches to 'online'
   - Queued actions sync
   - ConnectionCelebration animation

**Time:** Varies

---


## Technical Architecture

### Data Flow

**Post Creation Flow:**
```
User Input
  ↓
PostCreatorForm
  ↓
AI Classification (Gemini)
  ↓
Image Upload (if photo)
  ↓
posts.service.createPost()
  ↓
Supabase Database
  ↓
Real-time Broadcast
  ↓
All Users' Feeds
```

**Interest Expression Flow:**
```
User Taps "I'm Interested"
  ↓
handleInterestPress()
  ↓
interests.service.expressInterest()
  ↓
Supabase Database (status: pending)
  ↓
Real-time Notification
  ↓
Post Author's Feed
  ↓
InterestNotificationCard
```

**Message Flow:**
```
User Types Message
  ↓
ChatScreen
  ↓
messaging.service.sendMessage()
  ↓
Supabase Database
  ↓
Real-time Broadcast
  ↓
Other User's Chat
```

---

### Database Schema

**Tables:**

**1. auth.users** (Supabase Auth)
- id (UUID, primary key)
- email (unique)
- encrypted_password
- created_at

**2. user_profiles**
- id (UUID, primary key, references auth.users)
- full_name
- user_identifier (unique, e.g., "Neighbor-A3F9")
- created_at

**3. share_posts**
- id (UUID, primary key)
- author_id (references auth.users)
- author_identifier
- title
- description
- image_url (nullable)
- risk_tier ('high' | 'medium' | 'low')
- expires_at (timestamp)
- latitude (nullable)
- longitude (nullable)
- source ('supabase' | 'mesh')
- created_at

**4. interests**
- id (UUID, primary key)
- post_id (references share_posts)
- interested_user_id (references auth.users)
- interested_user_identifier
- status ('pending' | 'accepted' | 'declined')
- source ('supabase' | 'mesh')
- response_message (nullable)
- created_at
- responded_at (nullable)

**5. conversations**
- id (UUID, primary key)
- interest_id (references interests, unique)
- post_id (references share_posts)
- post_title
- user1_id (references auth.users)
- user1_identifier
- user2_id (references auth.users)
- user2_identifier
- last_message_at
- created_at

**6. messages**
- id (UUID, primary key)
- conversation_id (references conversations)
- sender_id (references auth.users)
- sender_identifier
- content
- is_read (boolean)
- created_at

**7. Storage Bucket: post-images**
- Public bucket
- Stores uploaded food images
- Max size: 4MB per file

---

### Real-time Subscriptions

**1. Posts Channel**
```typescript
supabase
  .channel('posts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'share_posts'
  }, handleNewPost)
  .subscribe()
```

**2. Interests Channel**
```typescript
supabase
  .channel('interests')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'interests',
    filter: `post_id=in.(${userPostIds})`
  }, handleNewInterest)
  .subscribe()
```

**3. Messages Channel**
```typescript
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleNewMessage)
  .subscribe()
```

---

### Security

**Row Level Security (RLS):**

**share_posts:**
- Anyone can read
- Only authenticated users can insert
- Only author can update/delete

**interests:**
- Users can read interests on their posts
- Users can read their own interests
- Only authenticated users can insert
- Only post author can update status

**conversations:**
- Only participants can read
- Auto-created by trigger on interest acceptance

**messages:**
- Only conversation participants can read
- Only participants can insert

**Storage:**
- Public read access
- Authenticated write access
- File size limits enforced

---

### Performance Optimizations

**1. Image Optimization**
- Compression to 85% quality
- Max dimensions: 1200px
- Target size: < 1MB
- Lazy loading in feed

**2. Feed Rendering**
- FlatList with optimized rendering
- Item key extraction
- Window size optimization
- Remove clipped subviews

**3. Real-time Subscriptions**
- Single channel per resource type
- Automatic reconnection
- Debounced updates

**4. State Management**
- Memoized selectors
- Optimized re-renders
- Batched updates

**5. Network**
- Request deduplication
- Retry with exponential backoff
- Timeout handling
- Error recovery

---


## Component Hierarchy

### App Structure

```
App (Root)
├── AppProvider (State Management)
│   └── AnimatedThemeProvider (Theme)
│       └── AppContent
│           ├── LoginScreen (if not authenticated)
│           │   ├── AuthInput (email)
│           │   ├── AuthInput (password)
│           │   └── AuthButton
│           │
│           ├── RegisterScreen (if not authenticated)
│           │   ├── AuthInput (name)
│           │   ├── AuthInput (email)
│           │   ├── AuthInput (password)
│           │   ├── AuthInput (confirm password)
│           │   └── AuthButton
│           │
│           └── Main App (if authenticated)
│               ├── Header
│               │   └── GradientHeader
│               │
│               ├── DynamicIsland
│               │   └── RadarRipple (if discovering)
│               │
│               ├── ConnectionCelebration
│               │
│               ├── LowBatteryNotice (if low battery)
│               │
│               ├── Screen Content
│               │   ├── Feed Screen
│               │   │   ├── InterestNotificationCard (if pending)
│               │   │   └── FeedList
│               │   │       └── DualModeFeedCard (multiple)
│               │   │           ├── Image (if available)
│               │   │           ├── Risk Badge
│               │   │           └── InterestedButton
│               │   │
│               │   ├── Create Screen
│               │   │   └── PostCreatorForm
│               │   │       ├── AuthInput (title)
│               │   │       ├── AuthInput (description)
│               │   │       ├── ImagePickerButton
│               │   │       ├── AIAnalysisIndicator
│               │   │       ├── RiskTierPicker
│               │   │       └── AuthButton (submit)
│               │   │
│               │   ├── Map Screen
│               │   │   └── Placeholder
│               │   │
│               │   ├── Messages Screen
│               │   │   └── Conversation List
│               │   │       └── Conversation Card (multiple)
│               │   │
│               │   ├── Chat Screen
│               │   │   ├── Message List
│               │   │   │   └── Message Bubble (multiple)
│               │   │   └── Message Input
│               │   │
│               │   └── Settings Screen
│               │       ├── PermissionStatusBar
│               │       ├── BackgroundMeshToggle
│               │       ├── Demo Controls
│               │       └── Account Info
│               │
│               └── FloatingTabBar
│                   ├── Feed Tab
│                   ├── Map Tab
│                   ├── Create Tab
│                   ├── Messages Tab
│                   └── Settings Tab
```

---

## Key Concepts

### 1. Pseudonymous Identifiers

**Why?**
- Privacy protection
- No real names exposed
- Community trust

**Format:**
- "Neighbor-" + 4 random characters
- Example: "Neighbor-A3F9"

**Generation:**
- Created on registration
- Stored in user_profiles table
- Used in all public interactions

---

### 2. Risk-Based TTL

**Purpose:**
- Food safety compliance
- Automatic expiration
- Reduce food waste

**Tiers:**
- **HIGH:** 15 minutes (raw/perishable)
- **MEDIUM:** 30 minutes (cooked)
- **LOW:** 60 minutes (shelf-stable)

**Implementation:**
- Calculated on post creation
- Stored as expires_at timestamp
- Countdown shown in UI
- Auto-removed when expired

---

### 3. Interest Flow

**States:**
1. **None:** No interest expressed
2. **Pending:** Interest sent, awaiting response
3. **Accepted:** Post author accepted
4. **Declined:** Post author declined

**Conversation Creation:**
- Triggered on interest acceptance
- Auto-created via database trigger
- Links interest, post, and users
- Enables messaging

---

### 4. Dual-Mode Architecture

**Abundance Mode:**
- Full internet connectivity
- Rich UI with animations
- All features enabled
- Real-time sync

**Survival Mode:**
- Offline-first
- Minimal UI
- Battery optimized
- Mesh networking

**Hybrid Mode:**
- Both transports active
- Maximum resilience
- Redundant messaging
- Seamless transitions

---

### 5. Mesh Networking

**Technology:**
- Android Nearby Connections
- Bluetooth + WiFi Direct
- Peer-to-peer

**Discovery:**
- Advertising (make discoverable)
- Discovery (find peers)
- Connection establishment

**Messaging:**
- Broadcast (all peers)
- Targeted (specific peer)
- Gossip protocol (propagation)

**Heartbeats:**
- Periodic presence signals
- Peer timeout detection
- Network health monitoring

---

### 6. AI Classification

**Model:**
- Google Gemini 1.5 Flash
- Free tier (no cost)
- Multimodal (text + image)

**Input:**
- Food title
- Description
- Photo (optional)

**Output:**
- Risk tier (HIGH/MEDIUM/LOW)
- Confidence score (0-1)
- Reasoning text

**Fallback:**
- Manual selection if AI fails
- User can override AI suggestion
- Graceful degradation

---


## Testing & Debugging

### Demo Controls

**Location:** Settings Screen

**Available Controls:**

1. **Toggle Low Battery Notice**
   - Simulates low battery state
   - Shows/hides LowBatteryNotice
   - Tests battery optimization UI

2. **Toggle Mesh Discovery**
   - Simulates peer discovery
   - Shows/hides radar animation
   - Tests discovery indicators

3. **Toggle Bluetooth Permission**
   - Simulates permission grant/deny
   - Updates PermissionStatusBar
   - Tests permission flow

4. **Cycle Connectivity Mode**
   - Tap Dynamic Island
   - Switches: online → offline → online
   - Tests mode transitions

5. **Cycle Peer Count**
   - Tap peer count in Dynamic Island
   - Increments: 0 → 1 → 2 → 3 → 4 → 5 → 0
   - Tests peer display

---

### Test Accounts

**Create test accounts for:**
- Post author
- Interested user
- Message recipient

**Test Flow:**
1. Register Account A
2. Create post as Account A
3. Register Account B
4. Express interest as Account B
5. Accept interest as Account A
6. Send messages between accounts

---

### Common Issues & Solutions

**Issue 1: Posts not appearing**
- Check internet connection
- Verify Supabase credentials
- Check RLS policies
- Refresh feed

**Issue 2: Images not uploading**
- Check file size (< 4MB)
- Verify storage bucket exists
- Check storage policies
- Validate image format

**Issue 3: Real-time not working**
- Check Supabase realtime enabled
- Verify subscription setup
- Check network connectivity
- Restart app

**Issue 4: Interests not showing**
- Verify user is post author
- Check interest status filter
- Refresh feed
- Check database records

**Issue 5: Messages not sending**
- Verify conversation exists
- Check user permissions
- Validate message content
- Check network

---


## Future Features

### Planned Enhancements

**1. Full Offline Mode**
- Complete mesh networking
- Offline post creation
- Offline interest expression
- Sync when online

**2. Location Features**
- Map view of posts
- Distance indicators
- Geofencing
- Privacy-preserving clustering

**3. Enhanced Messaging**
- Image sharing in chat
- Voice messages
- Read receipts
- Typing indicators

**4. Notifications**
- Push notifications
- Interest alerts
- Message notifications
- Post expiration warnings

**5. User Profiles**
- Profile pictures
- Bio/description
- Rating system
- Share history

**6. Advanced Search**
- Filter by risk tier
- Search by food type
- Sort by distance
- Sort by expiration

**7. Community Features**
- Neighborhood groups
- Recurring shares
- Event coordination
- Community guidelines

**8. Analytics**
- Food saved statistics
- Carbon footprint reduction
- Community impact metrics
- Personal sharing history

---

## Glossary

**Terms:**

**Abundance Mode:** Online mode with full features and rich UI

**Dynamic Island:** iPhone-inspired connectivity status indicator

**Gemini:** Google's AI model used for risk classification

**Gossip Protocol:** Mesh network message propagation algorithm

**Heartbeat:** Periodic presence signal in mesh network

**Interest:** Expression of desire to claim a food share post

**Mesh Networking:** Peer-to-peer offline communication

**Nearby Connections:** Google's API for local device communication

**Pseudonymous Identifier:** Privacy-preserving username (e.g., "Neighbor-A3F9")

**Risk Tier:** Food safety classification (HIGH/MEDIUM/LOW)

**RLS:** Row Level Security in Supabase database

**SharePost:** A food sharing post in the feed

**Supabase:** Backend-as-a-Service platform (database, auth, storage, realtime)

**Survival Mode:** Offline mode with minimal UI and battery optimization

**TTL:** Time-To-Live, expiration duration for posts

**Transport Layer:** Abstraction for message routing (online/offline)

---

## Quick Reference

### File Locations

**Screens:**
- Login: `src/screens/LoginScreen.tsx`
- Register: `src/screens/RegisterScreen.tsx`
- Messages: `src/screens/MessagesScreen.tsx`
- Chat: `src/screens/ChatScreen.tsx`

**Key Components:**
- Feed: `src/components/feed/FeedList.tsx`
- Post Card: `src/components/feed/DualModeFeedCard.tsx`
- Post Creator: `src/components/post/PostCreatorForm.tsx`
- Dynamic Island: `src/components/connectivity/DynamicIsland.tsx`

**Services:**
- Auth: `src/services/auth.service.ts`
- Posts: `src/services/posts.service.ts`
- Interests: `src/services/interests.service.ts`
- Messaging: `src/services/messaging.service.ts`
- AI: `src/services/GeminiRiskClassifier.ts`

**State:**
- AppContext: `src/context/AppContext.tsx`
- Theme: `src/theme/ThemeContext.tsx`

**Transport:**
- Supabase: `src/transport/SupabaseTransport.ts`
- Nearby: `src/transport/nearbyAdapter.ts`

---

### Environment Variables

**Required:**
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# Gemini AI (optional)
GEMINI_API_KEY=your_gemini_key
```

**Setup:**
1. Copy `.env.example` to `.env`
2. Fill in your credentials
3. Restart app

---

### Database Setup

**Steps:**
1. Create Supabase project
2. Run schema migration: `SUPABASE_SCHEMA.sql`
3. Enable realtime on tables
4. Create storage bucket: `post-images`
5. Set up RLS policies
6. Configure authentication

**Verification:**
```bash
node check-db-structure.js
```

---

### Running the App

**Development:**
```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

**Testing:**
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

---

## Support & Resources

**Documentation:**
- Supabase Docs: https://supabase.com/docs
- React Native: https://reactnative.dev/docs
- Gemini AI: https://ai.google.dev/docs

**Internal Docs:**
- Interest Flow: `INTEREST_FLOW_EXPLAINED.md`
- Messaging Setup: `MESSAGING_SETUP_GUIDE.md`
- Supabase Setup: `SUPABASE_SETUP_GUIDE.md`
- Integration Analysis: `docs/INTEGRATION_SUMMARY.md`

**Troubleshooting:**
- Network Issues: `NETWORK_FIX_SUMMARY.md`
- Auth Issues: `AUTH_INTEGRATION_COMPLETE.md`
- Database Issues: `DATABASE_STATUS.md`

---

## Conclusion

This walkthrough covers all major components, screens, and features of the NeighborYield app. Use it as a reference for:

- Understanding app architecture
- Onboarding new team members
- Debugging issues
- Planning new features
- Creating documentation

For specific implementation details, refer to the source code and inline comments.

---

**Document Version:** 1.0  
**Last Updated:** February 8, 2026  
**Maintained By:** Development Team

