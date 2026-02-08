# 🔧 Network Error Fix - Complete Instructions

## What We Fixed

The "Network request failed" error was caused by Android's network security configuration blocking HTTPS connections. We've implemented several fixes:

### 1. ✅ Network Security Configuration
- Created `android/app/src/main/res/xml/network_security_config.xml`
- Allows HTTPS connections to Supabase
- Trusts system certificates
- Allows localhost for Metro bundler

### 2. ✅ Android Manifest Updates
- Added `ACCESS_NETWORK_STATE` permission
- Enabled network security config
- Enabled cleartext traffic for Metro

### 3. ✅ Enhanced Debugging
- Network connectivity tests on app startup
- Detailed error logging
- User-friendly error messages

### 4. ✅ Better Error Handling
- Catches network errors specifically
- Shows helpful messages to users
- Logs detailed debugging information

## 🚀 How to Apply the Fixes

### Quick Method (Recommended)

```bash
cd NeighborYield

# Run the rebuild script
./rebuild-android.sh

# Then in Terminal 1:
npm start -- --reset-cache

# Then in Terminal 2:
npm run android
```

### Manual Method

If the script doesn't work, follow these steps:

**Terminal 1 - Clean Build:**
```bash
cd NeighborYield/android
./gradlew clean
cd ..
```

**Terminal 2 - Start Metro:**
```bash
npm start -- --reset-cache
```

**Terminal 3 - Run Android:**
```bash
npm run android
```

## 📊 What to Look For

### In Metro Console (Terminal 2)

You should see these logs when the app starts:

```
🔧 Supabase Config:
  Platform: android
  URL: https://jmhqkbgygoxlvxokdajv.supabase.co
  Key: eyJhbGciOiJIUzI1NiIs...
✅ Supabase credentials loaded

🌐 Testing network connectivity...
✅ Network is reachable (Google responded)
🌐 Testing Supabase URL...
✅ Supabase URL is reachable
```

### When You Try to Login

```
🔐 Attempting sign in...
  Email: test.user3811@gmail.com
  Supabase URL: https://jmhqkbgygoxlvxokdajv.supabase.co
✅ Auth successful, fetching profile...
✅ Profile fetched successfully
```

## 🧪 Test Credentials

```
Email: test.user3811@gmail.com
Password: SecurePassword123!
```

## ❌ If Still Not Working

### Check 1: Emulator Internet Connection

Test if the emulator has internet:

```bash
# Check if emulator can reach Google
adb shell ping -c 3 google.com
```

**Expected:** Should see ping responses  
**If fails:** Emulator has no internet connection

### Check 2: DNS Resolution

```bash
# Check if emulator can resolve Supabase domain
adb shell nslookup jmhqkbgygoxlvxokdajv.supabase.co
```

**Expected:** Should return IP addresses  
**If fails:** DNS issue in emulator

**Fix DNS:**
```bash
adb root
adb shell setprop net.dns1 8.8.8.8
adb shell setprop net.dns2 8.8.4.4
adb reboot
```

### Check 3: Firewall/Antivirus

- Temporarily disable firewall/antivirus
- Check if they're blocking emulator network access
- Add exception for Android emulator

### Check 4: Try Physical Device

Emulator network issues are common. Try on a real device:

```bash
# Connect phone via USB with USB debugging enabled
adb devices  # Should show your device

# Run on physical device
npm run android
```

## 🔍 Advanced Debugging

### View Android Network Logs

```bash
# In a new terminal
adb logcat | grep -i "network\|supabase\|auth"
```

### Test Network from Development Machine

```bash
cd NeighborYield
node test-network-debug.js
```

This will tell you if YOUR machine can reach Supabase (it should).

### Check Emulator Network Mode

In Android Studio:
1. Open AVD Manager
2. Click pencil icon on your emulator
3. Click "Show Advanced Settings"
4. Under "Network", ensure it's set to "NAT" or "Bridged"

## 📱 Alternative: Use Physical Device

If emulator continues to have issues:

1. Enable USB debugging on your Android phone
2. Connect via USB
3. Run `adb devices` to verify connection
4. Run `npm run android`

Physical devices rarely have these network issues.

## 🎯 Expected Final Result

✅ App loads without errors  
✅ Network tests pass in console  
✅ Login works successfully  
✅ User profile displays in Settings tab  
✅ No "Network request failed" errors  

## 📝 Files Changed

### New Files:
- `android/app/src/main/res/xml/network_security_config.xml`
- `test-network-debug.js`
- `rebuild-android.sh`
- `NETWORK_FIX_INSTRUCTIONS.md` (this file)

### Modified Files:
- `android/app/src/main/AndroidManifest.xml`
- `src/lib/supabase.ts`
- `src/services/auth.service.ts`
- `NETWORK_FIX.md`

## 🤔 Still Having Issues?

If you've tried everything and it still doesn't work:

1. **Check Supabase Status:** https://status.supabase.com
2. **Verify Credentials:** Run `node test-supabase-connection.js`
3. **Try Different Emulator:** Create a new AVD in Android Studio
4. **Use Physical Device:** Most reliable option
5. **Check Corporate Network:** Some corporate networks block certain traffic

## 💡 Next Steps After It Works

Once authentication is working:

1. ✅ Test registration flow
2. ✅ Test logout functionality
3. ✅ Test password reset
4. ✅ Move credentials to .env properly
5. ✅ Remove excessive debug logging
6. ✅ Add network connectivity indicator in UI
7. ✅ Add offline mode handling

---

**Need Help?** Check the Metro console logs - they'll tell you exactly what's happening!
