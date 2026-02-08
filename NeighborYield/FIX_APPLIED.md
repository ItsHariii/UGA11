# Fix Applied: URL Polyfill for React Native

## Problem
```
ERROR: URL.protocol is not implemented, js engine: hermes
```

React Native's Hermes engine doesn't have the `URL` API that Supabase needs.

## Solution Applied

### 1. Installed URL Polyfill
```bash
npm install react-native-url-polyfill
```

### 2. Updated `src/lib/supabase.ts`
- Added `import 'react-native-url-polyfill/auto';` at the top
- Changed from `process.env` to `@env` imports for React Native
- Added proper TypeScript types

### 3. Created `src/types/env.d.ts`
- Type definitions for environment variables

## How to Apply the Fix

### Step 1: Stop the app
Press `Ctrl+C` in the terminal running Metro

### Step 2: Clear cache and restart
```bash
cd NeighborYield

# Clear Metro cache
npm start -- --reset-cache
```

### Step 3: In a new terminal, rebuild the app
```bash
# For Android
npm run android

# For iOS (if on Mac)
npm run ios
```

## What Changed

**Before:**
```typescript
const supabaseUrl = process.env.SUPABASE_URL || '';
```

**After:**
```typescript
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const supabaseUrl = SUPABASE_URL || '';
```

## Verification

After restarting, you should see:
- ✅ No "URL.protocol is not implemented" error
- ✅ App loads to login screen
- ✅ Can register/login successfully

## If Still Having Issues

1. **Clear all caches:**
```bash
cd NeighborYield
rm -rf node_modules
npm install
npm start -- --reset-cache
```

2. **Rebuild the app:**
```bash
npm run android
```

3. **Check .env file exists** with correct values:
```
SUPABASE_URL=https://jmhqkbgygoxlvxokdajv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Files Modified

1. `src/lib/supabase.ts` - Added polyfill and fixed env vars
2. `src/types/env.d.ts` - Created type definitions
3. `package.json` - Added react-native-url-polyfill dependency
