# 🚀 Quick Fix Guide - Network Error

## The Problem
```
ERROR [TypeError: Network request failed]
```

## The Solution (3 Steps)

### Step 1: Run the Rebuild Script
```bash
cd NeighborYield
./rebuild-android.sh
```

### Step 2: Start Metro (Terminal 1)
```bash
npm start -- --reset-cache
```

### Step 3: Run Android (Terminal 2)
```bash
npm run android
```

## What to Expect

### ✅ Success Indicators:

**In Metro Console:**
```
✅ Supabase credentials loaded
✅ Network is reachable (Google responded)
✅ Supabase URL is reachable
```

**When Logging In:**
```
✅ Auth successful, fetching profile...
✅ Profile fetched successfully
```

**In App:**
- Login screen appears
- Can enter credentials
- Login succeeds
- Navigates to feed
- Settings shows user profile

### ❌ If Still Failing:

**Quick Checks:**
```bash
# 1. Check emulator internet
adb shell ping -c 3 google.com

# 2. Restart emulator
adb reboot

# 3. Try physical device
adb devices
npm run android
```

## Test Credentials
```
Email: test.user3811@gmail.com
Password: SecurePassword123!
```

## Need More Help?
See `NETWORK_FIX_INSTRUCTIONS.md` for detailed troubleshooting.

---

**TL;DR:** Run `./rebuild-android.sh`, then `npm start -- --reset-cache`, then `npm run android`
