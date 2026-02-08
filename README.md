# NeighborYield Resilience Edition - Business Logic Layer

**Person 3 Implementation: Complete ✓**

This repository contains the standalone business logic implementation for the NeighborYield Resilience Edition app. All 5 manager classes have been implemented with full functionality and type safety.

## 📋 What's Implemented

### ✅ Core Managers (All Complete)

1. **TTL Manager** - Post expiration tracking and automatic cleanup
   - Risk-based TTL mapping (15/30/60 minutes for high/medium/low risk)
   - Automatic purging of expired posts every 10 seconds
   - Event emission for expiration notifications
   - Support for custom TTL values

2. **Presence Manager** - Heartbeat broadcasting and peer discovery
   - Periodic heartbeat broadcasting (15s foreground, 60s background)
   - Peer discovery and active peer tracking via Map
   - Automatic peer timeout (30s = 2 missed intervals)
   - Peer count change notifications
   - Configurable heartbeat intervals

3. **Interest Manager** - Claim/interest flow for share posts
   - Interest expression with automatic retry logic (exponential backoff, ~30s total)
   - Interest queue management (multiple interests per post)
   - Bidirectional communication (poster ↔ interested user)
   - Response handling for accepted/declined interests

4. **Permission Manager** - Android runtime permissions
   - Permission status tracking (Bluetooth, Location, Nearby Devices)
   - Permission request flow with user education
   - `canUseMesh` flag calculation
   - Graceful degradation to online-only mode
   - Dynamic permission enablement

5. **Battery Manager** - Lifecycle and battery optimization
   - App foreground/background lifecycle management
   - Background mesh toggle with preference persistence
   - Low battery detection (15% threshold)
   - Automatic Nearby Connections suspension
   - Battery-aware heartbeat interval adjustment

### ✅ AI-Powered Risk Classification (New!)

**Gemini AI Integration** - Automatic food safety risk tier classification
   - **AI-powered classification** using Google Gemini 1.5 Flash (free tier)
   - Analyzes food title and description to determine safety risk
   - **NEW: Image-based classification** - Take a photo and AI detects food type, risk tier, and details
   - Classifies as HIGH (raw/perishable), MEDIUM (cooked), or LOW (shelf-stable)
   - **Graceful fallback** to manual selection if API unavailable
   - **User override** capability - AI suggests, user confirms or changes
   - **No API credits used** - completely free Google AI Studio API
   - Client-side integration (works in both Node.js and React Native)
   - **Multimodal support** - Text-only or combined image + text input

**New Components:**
- `GeminiRiskClassifier` - Service for AI classification (text and image)
- `ImageValidator` - Image validation and size checking utilities
- `ImageCompressor` - Image compression configuration helpers
- `RiskTierPicker` - React Native component with AI suggestions
- `PostCreatorForm` - Complete post creation UI with integrated AI and camera support
- Environment configuration for API key management
- Comprehensive error handling and retry logic

### ✅ Supporting Infrastructure

- **User Identifier Generator** - Pseudonymous IDs (e.g., "Neighbor-A3F9")
- **Mock Transport Router** - Simulates transport layer for testing
- **Complete Type System** - All interfaces and data models from design spec
- **Demo Script** - Comprehensive integration testing

## 🏗️ Project Structure

```
d:\UGA11/
├── src/
│   ├── managers/          # Business logic managers
│   │   ├── TTLManager.ts
│   │   ├── PresenceManager.ts
│   │   ├── InterestManager.ts
│   │   ├── PermissionManager.ts
│   │   ├── BatteryManager.ts
│   │   ├── ITTLManager.ts         (interfaces)
│   │   ├── IPresenceManager.ts
│   │   ├── IInterestManager.ts
│   │   ├── IPermissionManager.ts
│   │   └── IBatteryManager.ts
│   ├── services/          # AI and external services
│   │   ├── GeminiRiskClassifier.ts
│   │   └── IGeminiRiskClassifier.ts
│   ├── types/             # Data models and type definitions
│   │   ├── Common.ts
│   │   ├── SharePost.ts
│   │   ├── InterestAck.ts
│   │   ├── GeminiClassification.ts  # AI types with image support
│   │   └── LocalState.ts
│   ├── utils/             # Utilities
│   │   ├── UserIdentifierGenerator.ts
│   │   ├── EnvConfig.ts
│   │   ├── ImageValidator.ts  # Image validation utilities
│   │   └── ImageCompressor.ts # Image compression helper    # Utilities
│   │   ├── UserIdentifierGenerator.ts
│   │   └── EnvConfig.ts
│   ├── mocks/             # Testing mocks
│   │   └── MockTransportRouter.ts
│   ├── demo.ts            # Demo/test script
│   ├── test-gemini.ts     # Gemini AI classifier tests
│   └── index.ts           # Main exports
├── NeighborYield/
│   └── src/
│       └── components/    # React Native UI components
│           ├── RiskTierPicker.tsx
│           └── PostCreatorForm.tsx
├── .kiro/specs/           # Specification documents
│   └── neighbor-yield-resilience/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── .env                   # Environment variables (add your API key here)
├── .env.example           # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### PConfigure AI (Optional but Recommended):**
   
   To enable AI-powered food safety risk classification, get a free Gemini API key:
   
   a. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   
   b. Click "Create API Key" (it's completely free!)
   
   c. Copy your API key
   
   d. Open the `.env` file in the project root and add your key:
      ```bash
      GEMINI_API_KEY=your_actual_api_key_here
      ```
   
   **Note:** Without an API key, the app will gracefully fall back to manual risk tier selection. AI classification is optional but greatly improves user experience.

3. **Build TypeScript:**
   ```bash
   npm run build
   ```

4. **Run the demo:**
   ```bash
   npm run dev
   ```

5. **Test AI Classification (Optional):**
   ```bash
   npAI-Powered Risk Classification** - Automatically classifies food safety risk using Gemini AI (or falls back to manual)
4. **TTL Manager** - Tracks posts, purges expired ones
5. **Presence Manager** - Receives heartbeats, tracks peers
6. **Interest Manager** - Expresses interest, handles responses
7. **Battery Manager** - Simulates lifecycle and low battery
8. **Connectivity Changes** - Switches between online/offline/hybrid
9  npm install
   ```
Gemini AI configuration status (configured or manual fallback)
- ✓ User identifier generated
- ✓ All permissions granted
- ✓ AI classifying food items (if API key configured) 🤖
- ✓ Posts tracked and expired ones purged
- ✓ Peers discovered and timed out
- ✓ Interests sent and received
- ✓ Battery optimization working
- ✓ All event subscriptions functioning

## 🤖 AI-Powered Risk Classification

### Overview

The system now includes automatic food safety risk classification using Google's Gemini AI. Instead of users manually selecting risk tiers, the AI analyzes food descriptions and automatically determines the appropriate food safety risk level.

### How It Works

1. **User enters food information** (title + description)
2. **AI analyzes the food** using Gemini 1.5 Flash
3. **Risk tier is predicted** (HIGH/MEDIUM/LOW)
4. **User can override** if they disagree with the AI
5. **Graceful fallback** to manual selection if API fails

### Risk Classification Rules

The AI applies food safety guidelines:

- **HIGH RISK** (15 min expiration)
  - Raw/uncooked proteins (fish, meat, poultry, eggs)
  - Fresh seafood and sushi
  - Unpasteurized dairy products
  - Cut fresh fruits/vegetables
  - Prepared foods with raw ingredients

- **MEDIUM RISK** (30 min expiration)
  - Cooked foods and leftovers
  - Reheated dishes
  - Pasteurized dairy products
  - Baked goods with dairy/eggs
  - Cooked vegetables

- **LOW RISK** (60 min expiration)
  - Shelf-stable packaged foods
  - Canned goods (unopened)
  - Dried foods (pasta, rice, beans)
  - Packaged snacks and crackers
  - Bread and cookies (no refrigeration needed)

### Usage Examples

#### In Node.js (Demo/Test Scripts)

```typescript
import { geminiClassifier, setGeminiApiKey } from './services/GeminiRiskClassifier';
import { loadEnvConfig, getGeminiApiKey } from './utils/EnvConfig';

// Load API key from .env
loadEnvConfig();
setGeminiApiKey(getGeminiApiKey()!);

// Classify food
const riskTier = await geminiClassifier.classifyFoodRisk(
  'Fresh Sushi Rolls',
  'Raw salmon and tuna, made 2 hours ago'
);
// Returns: 'high'

// Get detailed classification
const result = await geminiClassifier.classifyWithDetails({
  title: 'Leftover Pizza',
  description: 'Cooked pizza from yesterday, refrigerated'
});
// Returns: { riskTier: 'medium', confidence: 0.85, reasoning: '...' }
```

#### In React Native (UI Components)

```typescript
import { RiskTierPicker } from './components/RiskTierPicker';
import { PostCreatorForm } from './components/PostCreatorForm';

// Option 1: Use RiskTierPicker directly
<RiskTierPicker
  title={foodTitle}
  description={foodDescription}
  onRiskTierSelected={(tier) => setRiskTier(tier)}
  apiKey={GEMINI_API_KEY}  // Optional: pass as prop or configure globally
/>

// Option 2: Use complete PostCreatorForm
<PostCreatorForm
  authorId={currentUserId}
  onPostCreated={(post) => handleNewPost(post)}
  apiKey={GEMINI_API_KEY}
/>Image-Based Food Classification (New!)

The AI classifier now supports multimodal input - you can classify food items using images along with or instead of text descriptions.

#### Using Image Classification in React Native

```typescript
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { geminiClassifier, getImagePickerOptions } from '@/business-logic';

const handlePhotoClassify = async () => {
  // Get optimized image picker options (includes compression settings)
  const options = getImagePickerOptions();
  
  // Launch camera or gallery
  const result = await launchCamera(options);
  
  if (!result.assets?.[0]?.base64) {
    console.log('No image captured');
    return;
  }
  
  // Classify with image (title/description can be empty - AI will detect)
  const classification = await geminiClassifier.classifyFoodRisk({
    title: '', // AI will suggest based on image
    description: '', // AI will suggest based on image
    image: {
      data: result.assets[0].base64,
      mimeType: 'image/jpeg'
    }
  });
  
  if (classification.success && classification.extractedData) {
    // Use AI-detected information
    setFoodTitle(classification.extractedData.suggestedTitle || '');
    setDescription(classification.extractedData.suggestedDescription || '');
    setRiskTier(classification.riskTier);
    
    console.log('AI Observations:', classification.extractedData.observations);
    console.log('Confidence:', classification.confidence);
  }
};
```

#### Image + Text Combined Classification

For best results, combine both image and text:

```typescript
const result = await geminiClassifier.classifyFoodRisk({
  title: 'Homemade Sushi',
  description: 'Made 2 hours ago, contains raw salmon',
  image: {
    data: photoBase64,
    mimeType: 'image/jpeg'
  }
});

// AI analyzes both the visual appearance AND text description
// Returns: { riskTier: 'high', confidence: 0.95, extractedData: {...} }
```

#### Image Requirements

- **Supported formats**: JPEG, PNG, WebP
- **Maximum size**: 4MB (Gemini API limit)
- **Recommended size**: < 1MB for optimal performance
- **Compression**: Use `getImagePickerOptions()` for automatic compression
- **Encoding**: Base64 string (without `data:` URI prefix)

#### Image Validation Example

```typescript
import { validateImage, formatBytes } from '@/business-logic';

// Validate before sending to AI
const validation = validateImage(base64Data, 'image/jpeg');

if (!validation.valid) {
  console.error('Invalid image:', validation.error);
} else {
  console.log(`Image size: ${formatBytes(validation.sizeBytes)}`);
}
```

#### Compression Configuration

```typescript
import {
  getDefaultCompressionConfig,
  calculateScaledDimensions,
  needsCompression
} from '@/business-logic';

// Get default settings (85% quality, 1200px max, 1MB target)
const config = getDefaultCompressionConfig();

// Check if image needs compression
if (needsCompression(base64Image)) {
  console.log('Image is large, recommend compression');
}

// Calculate scaled dimensions while maintaining aspect ratio
const scaled = calculateScaledDimensions(
  { width: 2400, height: 1800 },
  1200
);
// Returns: { width: 1200, height: 900 }
```

### 
```

### Error Handling

The system handles various failure scenarios gracefully:

- **No API key configured**: Falls back to manual selection
- **Network timeout**: Shows manual picker after 5 second timeout
- **API rate limit**: Displays error and shows manual picker
- **Invalid response**: Defaults to 'medium' risk and allows manual override

### Testing AI Accuracy

Run the comprehensive test suite:

```bash
npm run test:gemini
```

This tests 12 different food types across all risk tiers and reports accuracy statistics:
- Overall accuracy percentage
- Per-tier accuracy (HIGH/MEDIUM/LOW)
- Error handling validation

### Cost and API Limits

- **✓ Completely FREE** - Uses Google AI Studio free tier
- **✓ No credit card required**
- **Rate Limits**: 60 requests per minute (more than sufficient)
- **Model Used**: Gemini 1.5 Flash (optimized for speed and cost)
   ```bash
   npm run dev
   ```

### Expected Demo Output

The demo script demonstrates all manager functionality:

1. **User Identifier Generation** - Creates pseudonymous ID
2. **Permission Flow** - Simulates permission requests and grants
3. **TTL Manager** - Tracks posts, purges expired ones
4. **Presence Manager** - Receives heartbeats, tracks peers
5. **Interest Manager** - Expresses interest, handles responses
6. **Battery Manager** - Simulates lifecycle and low battery
7. **Connectivity Changes** - Switches between online/offline/hybrid
8. **Transport Inspection** - Shows all messages sent

You should see detailed console output showing:
- ✓ User identifier generated
- ✓ All permissions granted
- ✓ Posts tracked and expired ones purged
- ✓ Peers discovered and timed out
- ✓ Interests sent and received
- ✓ Battery optimization working
- ✓ All event subscriptions functioning

## 🔗 Integration with Other Team Members

### For Person 1 (Frontend - React Native)

**What you need from Person 3:**
```typescript
import {
  TTLManager,
  PresenceManager,
  InterestManager,
  PermissionManager,
  BatteryManager,
  getUserIdentifier
} from './path-to-person3/src';

// Use in React hooks or Context providers
const ttlManager = new TTLManager();
const presenceManager = new PresenceManager(transportRouter);
// etc.
```

**Integration points:**
- Create React Context providers wrapping each manager
- Create custom hooks: `useTTL()`, `usePresence()`, `useInterests()`, `usePermissions()`, `useBattery()`
- Subscribe to manager events in `useEffect()` hooks
- Display UI based on manager state (peer count, permission status, etc.)

### For Person 2 (Transport Layer)

**What Person 3 needs from you:**
```typescript
// Implement the ITransportRouter interface
interface ITransportRouter {
  getMode(): ConnectivityMode;
  send(message: TransportMessage): Promise<SendResult>;
  subscribe(handler: MessageHandler): Unsubscribe;
  onModeChange(handler: (mode: ConnectivityMode) => void): Unsubscribe;
}
```

**Integration points:**
- Replace `MockTransportRouter` with your real `TransportRouter`
- Route messages to Supabase (online) or Nearby Connections (offline)
- Call `presenceManager.receivedHeartbeat()` when heartbeats arrive
- Call `interestManager.receivedInterest()` when interests arrive
- Call `interestManager.receivedResponse()` when responses arrive

## 📊 Technical Details

### Design Principles

- **Interface-first design** - All managers implement interfaces for testability
- **Event-driven architecture** - Subscribe/unsubscribe pattern for reactive updates
- **Dependency injection** - Managers accept dependencies via constructor
- **Graceful degradation** - App remains functional with limited permissions
- **Battery optimization** - Automatic lifecycle management and interval adjustment

### State Management

- Uses plain JavaScript `Map` objects for state storage
- No external state management library (Redux/Zustand)
- Easy to integrate with React Context or any state solution

### TTL Configuration

```typescript
const TTL_VALUES = {
  high: 15 * 60 * 1000,    // 900,000ms = 15 minutes
  medium: 30 * 60 * 1000,  // 1,800,000ms = 30 minutes
  low: 60 * 60 * 1000,     // 3,600,000ms = 60 minutes
};
```

### Battery Configuration

```typescript
const BATTERY_CONFIG = {
  foregroundHeartbeatInterval: 15000,  // 15 seconds
  backgroundHeartbeatInterval: 60000,  // 60 seconds
  lowBatteryThreshold: 15,             // 15%
};
```

## ✅ Implementation Checklist

All tasks from [tasks.md](.kiro/specs/neighbor-yield-resilience/tasks.md) completed:

### Infrastructure (✓ Complete)
- [x] 1.1 Create business logic folder structure and types
- [x] 1.2 Create user identifier generator

### TTL Manager (✓ Complete)
- [x] 2.1 Create TTL Manager with post tracking
- [x] 2.2 Implement risk tier to TTL mapping
- [x] 2.3 Implement expiration checking and purging
- [x] 2.4 Implement expiration event emission

### Presence Manager (✓ Complete)
- [x] 3.1 Create Presence Manager with peer tracking
- [x] 3.2 Implement heartbeat broadcasting
- [x] 3.3 Implement peer timeout logic
- [x] 3.4 Implement peer count change notifications

### Interest Manager (✓ Complete)
- [x] 4.1 Create Interest Manager with interest tracking
- [x] 4.2 Implement expressInterest with retry logic
- [x] 4.3 Implement respondToInterest
- [x] 4.4 Implement interest queue management

### Permission Manager (✓ Complete)
- [x] 5.1 Create Permission Manager with status tracking
- [x] 5.2 Implement permission request flow
- [x] 5.3 Implement permission change detection
- [x] 5.4 Implement graceful degradation logic

### Battery Manager (✓ Complete)
- [x] 6.1 Create Battery Manager with lifecycle hooks
- [x] 6.2 Implement background mesh toggle
- [x] 6.3 Implement low battery detection

### Testing (✓ Complete)
- [x] 7. Business Logic Checkpoint - All managers verified via demo

## 🎯 Next Steps

### For Team Coordination

1. **Person 1 (Frontend):** 
   - Initialize React Native project with TypeScript
   - Create Context providers for managers
   - Build UI components consuming manager state

2. **Person 2 (Transport):**
   - Implement real `TransportRouter` with Supabase + Nearby Connections
   - Replace `MockTransportRouter` in manager instantiation
   - Wire up message routing logic

3. **Integration:**
   - Connect UI → Business Logic → Transport Layer
   - Test end-to-end flows (create post → express interest → respond)
   - Test mode transitions (online ↔ offline ↔ hybrid)

### Future Enhancements

- Add property-based tests (fast-check) for comprehensive validation
- Implement persistence layer (AsyncStorage) for user identifier
- Add React Native-specific battery and permission APIs
- Integrate with real Android Nearby Connections API
- Add analytics and error reporting

## 📝 Notes

- This is a **standalone TypeScript implementation** for rapid development
- Business logic is **platform-agnostic** and can be ported to React Native
- All managers are **fully tested** via the demo script
- Code follows **strict TypeScript** with comprehensive type safety
- Ready for integration with Person 1's UI and Person 2's transport layer

## 🔍 Validation

Run the demo to verify:
```bash
npm run dev
```

Expected results:
- ✓ All managers initialize successfully
- ✓ TTL expiration works correctly
- ✓ Peer discovery and timeout functioning
- ✓ Interest flow complete (send → receive → respond)
- ✓ Permission flow grants all permissions
- ✓ Battery manager handles lifecycle transitions
- ✓ No errors or warnings in console

---

**Implementation Status: COMPLETE ✓**

All Person 3 (Business Logic) tasks from the implementation plan have been successfully completed. Ready for integration with Person 1 and Person 2's work.
