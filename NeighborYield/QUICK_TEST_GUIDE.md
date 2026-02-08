# Quick Test Guide

## 🚀 Start the App

```bash
cd NeighborYield
npm start
```

Then in another terminal:
```bash
# For iOS
npm run ios

# For Android
npm run android
```

## ✅ Test Checklist

### 1. Registration Flow (2 minutes)
- [ ] App opens to login screen
- [ ] Click "Create Account"
- [ ] Fill in form:
  - Full Name: Test User
  - Username: testuser999
  - Email: test999@gmail.com
  - Password: Password123!
  - Confirm Password: Password123!
- [ ] Click "Create Account"
- [ ] See welcome alert
- [ ] Automatically logged in to feed

### 2. Logout & Login (1 minute)
- [ ] Go to Settings tab
- [ ] See your user info displayed
- [ ] Click "Logout"
- [ ] Return to login screen
- [ ] Enter email: test999@gmail.com
- [ ] Enter password: Password123!
- [ ] Click "Sign In"
- [ ] Successfully logged in

### 3. Session Persistence (30 seconds)
- [ ] While logged in, close app completely
- [ ] Reopen app
- [ ] Should still be logged in (no login screen)

### 4. Error Handling (1 minute)
- [ ] Logout
- [ ] Try login with wrong password
- [ ] See error message
- [ ] Try login with invalid email format
- [ ] See validation error

## 🎯 Quick Login Credentials

If you don't want to register:
```
Email: test.user3811@gmail.com
Password: SecurePassword123!
```

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check your internet connection
- Verify .env file exists with correct credentials
- Check Supabase project is running

### "Email already exists"
- Use a different email
- Or login with existing credentials

### App crashes on startup
- Clear app data/cache
- Reinstall the app
- Check console logs for errors

## 📊 What to Look For

### ✅ Good Signs
- Smooth animations on login/register screens
- Loading states during auth operations
- Error messages display clearly
- User info shows in settings
- Session persists after app restart

### ❌ Red Flags
- App crashes
- Infinite loading
- No error messages
- Session doesn't persist
- Can't logout

## 🎉 Success Criteria

All of these should work:
1. ✅ Register new user
2. ✅ Login with credentials
3. ✅ Session persists
4. ✅ User info displays
5. ✅ Logout works
6. ✅ Error messages show

If all 6 work, your integration is successful! 🚀
