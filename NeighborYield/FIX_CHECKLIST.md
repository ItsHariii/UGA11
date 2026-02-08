# ✅ Network Fix Checklist

Use this checklist to verify all fixes are applied and working.

## 📋 Pre-Flight Checks

### Files Created:
- [ ] `android/app/src/main/res/xml/network_security_config.xml` exists
- [ ] `test-network-debug.js` exists
- [ ] `rebuild-android.sh` exists and is executable
- [ ] `QUICK_FIX_GUIDE.md` exists
- [ ] `NETWORK_FIX_INSTRUCTIONS.md` exists
- [ ] `NETWORK_FIX_SUMMARY.md` exists

### Files Modified:
- [ ] `android/app/src/main/AndroidManifest.xml` has `networkSecurityConfig`
- [ ] `android/app/src/main/AndroidManifest.xml` has `ACCESS_NETWORK_STATE` permission
- [ ] `src/lib/supabase.ts` has network connectivity tests
- [ ] `src/services/auth.service.ts` has enhanced error logging

### Quick Verification:
```bash
# Check if network security config exists
ls -la NeighborYield/android/app/src/main/res/xml/network_security_config.xml

# Check if rebuild script is executable
ls -la NeighborYield/rebuild-android.sh

# Should see: -rwxr-xr-x (executable)
```

## 🚀 Build & Run Checklist

### Step 1: Clean Build
```bash
cd NeighborYield
./rebuild-android.sh
```
- [ ] Script runs without errors
- [ ] Gradle clean completes
- [ ] Cache cleared
- [ ] Processes stopped

### Step 2: Start Metro
```bash
npm start -- --reset-cache
```
- [ ] Metro starts successfully
- [ ] No errors in console
- [ ] Shows "Metro waiting on port 8081"

### Step 3: Run Android
```bash
# In new terminal
npm run android
```
- [ ] Build completes successfully
- [ ] App installs on emulator/device
- [ ] App launches

## 🔍 Runtime Checks

### Metro Console Logs:
- [ ] `🔧 Supabase Config:` appears
- [ ] `Platform: android` shown
- [ ] `✅ Supabase credentials loaded` appears
- [ ] `🌐 Testing network connectivity...` appears
- [ ] `✅ Network is reachable (Google responded)` appears
- [ ] `✅ Supabase URL is reachable` appears

### App Behavior:
- [ ] App loads to login screen (not crash)
- [ ] Login screen displays correctly
- [ ] Can type in email field
- [ ] Can type in password field
- [ ] "Sign In" button is visible

## 🧪 Authentication Test

### Login Test:
```
Email: test.user3811@gmail.com
Password: SecurePassword123!
```

- [ ] Can enter credentials
- [ ] "Sign In" button becomes enabled
- [ ] Tap "Sign In" button
- [ ] Loading indicator appears
- [ ] Metro console shows: `🔐 Attempting sign in...`
- [ ] Metro console shows: `✅ Auth successful, fetching profile...`
- [ ] Metro console shows: `✅ Profile fetched successfully`
- [ ] App navigates to feed screen
- [ ] No error messages appear

### Settings Tab Test:
- [ ] Tap Settings tab (gear icon)
- [ ] User profile section visible
- [ ] Shows "Signed in as"
- [ ] Shows full name
- [ ] Shows email address
- [ ] Shows user identifier (Neighbor-XXXX)
- [ ] Logout button visible

### Logout Test:
- [ ] Tap "Logout" button
- [ ] Returns to login screen
- [ ] No errors in console

## ❌ Troubleshooting Checklist

### If Network Tests Fail:

**Check Emulator Internet:**
```bash
adb shell ping -c 3 google.com
```
- [ ] Ping succeeds (shows responses)
- [ ] If fails: Emulator has no internet

**Check DNS:**
```bash
adb shell nslookup jmhqkbgygoxlvxokdajv.supabase.co
```
- [ ] Returns IP addresses
- [ ] If fails: DNS issue

**Fix DNS:**
```bash
adb root
adb shell setprop net.dns1 8.8.8.8
adb shell setprop net.dns2 8.8.4.4
adb reboot
```
- [ ] Commands run successfully
- [ ] Emulator reboots
- [ ] Try app again

### If Login Fails:

**Check Metro Logs:**
- [ ] Look for `❌` error indicators
- [ ] Note the error message
- [ ] Check if it's network or auth error

**Common Errors:**

**"Network request failed"**
- [ ] Network tests passed in Metro console?
- [ ] If no: Emulator network issue
- [ ] If yes: Check Supabase status

**"Invalid login credentials"**
- [ ] Using correct email: test.user3811@gmail.com
- [ ] Using correct password: SecurePassword123!
- [ ] No typos in credentials

**"Cannot read property 'supabase' of undefined"**
- [ ] Restart Metro with cache clear
- [ ] Rebuild app
- [ ] Check if supabase.ts loaded

### If Build Fails:

**Gradle Errors:**
```bash
cd android
./gradlew clean
./gradlew assembleDebug --info
```
- [ ] Check error messages
- [ ] Look for XML parsing errors
- [ ] Verify network_security_config.xml syntax

**Metro Errors:**
```bash
npm start -- --reset-cache
```
- [ ] Clear watchman: `watchman watch-del-all`
- [ ] Clear metro: `rm -rf /tmp/metro-*`
- [ ] Clear node_modules: `rm -rf node_modules && npm install`

## 🎯 Success Criteria

All of these should be true:

- [x] Network security config file exists
- [x] AndroidManifest.xml updated
- [x] Network diagnostics added
- [x] Error handling enhanced
- [ ] App builds successfully
- [ ] App runs without crashes
- [ ] Network tests pass in console
- [ ] Login works with test credentials
- [ ] User profile displays in Settings
- [ ] Logout works correctly

## 📊 Final Verification

Run this command to verify all files:
```bash
cd NeighborYield

echo "Checking files..."
test -f android/app/src/main/res/xml/network_security_config.xml && echo "✅ network_security_config.xml" || echo "❌ network_security_config.xml"
test -f test-network-debug.js && echo "✅ test-network-debug.js" || echo "❌ test-network-debug.js"
test -x rebuild-android.sh && echo "✅ rebuild-android.sh (executable)" || echo "❌ rebuild-android.sh"
grep -q "networkSecurityConfig" android/app/src/main/AndroidManifest.xml && echo "✅ AndroidManifest has networkSecurityConfig" || echo "❌ AndroidManifest missing networkSecurityConfig"
grep -q "ACCESS_NETWORK_STATE" android/app/src/main/AndroidManifest.xml && echo "✅ AndroidManifest has ACCESS_NETWORK_STATE" || echo "❌ AndroidManifest missing ACCESS_NETWORK_STATE"
grep -q "testNetworkConnectivity" src/lib/supabase.ts && echo "✅ supabase.ts has network tests" || echo "❌ supabase.ts missing network tests"

echo ""
echo "If all show ✅, you're ready to rebuild!"
```

## 🆘 Need Help?

- **Quick Start:** See `QUICK_FIX_GUIDE.md`
- **Detailed Steps:** See `NETWORK_FIX_INSTRUCTIONS.md`
- **What Changed:** See `NETWORK_FIX_SUMMARY.md`
- **Technical Details:** See `NETWORK_FIX.md`

---

**Ready to test?** Run `./rebuild-android.sh` and follow the prompts!
