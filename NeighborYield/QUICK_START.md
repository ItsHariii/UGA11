# Quick Start Guide

## Your App Now Uses Real Supabase Data! 🎉

Everything is connected and working. Here's how to use it:

## 1. Login to the App

Use these test credentials:
```
Email: test@neighboryield.com
Password: TestPassword123!
```

Or create a new account using the Register screen.

## 2. View Real Posts

The feed now shows posts from your Supabase database. If you see "No posts yet", add some sample data:

```bash
cd NeighborYield
node seed-sample-posts.js
```

This adds 5 sample food share posts to your database.

## 3. Create a Post

1. Tap the **+** icon in the bottom tab bar
2. Fill in the form:
   - Title (e.g., "Fresh Apples")
   - Description (e.g., "5 lbs of organic apples from my tree")
   - Risk Tier (High/Medium/Low)
3. Tap "Share Food"
4. Your post is saved to Supabase and appears in the feed!

## 4. Express Interest

1. Browse the feed
2. Tap "I'm Interested" on any post
3. Your interest is saved to Supabase
4. The post author will see your interest notification

## 5. Manage Interests (Post Authors)

If someone expresses interest in YOUR post:
1. You'll see an interest notification at the top of the feed
2. Tap "Accept" to approve the interest
3. Or tap "Decline" to reject it
4. The status updates in Supabase

## 6. Refresh Data

Pull down on the feed to refresh and load the latest posts and interests from Supabase.

## Useful Scripts

### Add Sample Posts
```bash
node seed-sample-posts.js
```

### Clear Expired Posts
```bash
node clear-old-posts.js
```

### Test Login
```bash
node test-login.js
```

### Create New User
```bash
node test-register.js
```

## What's Connected

✅ **Authentication** - Login/Register/Logout via Supabase Auth  
✅ **Posts** - Create, view, and manage food share posts  
✅ **Interests** - Express interest and respond to interests  
✅ **Real-time Updates** - Feed updates automatically when data changes  
✅ **User Profiles** - Each user has a unique identifier  

## Troubleshooting

### "Network request failed"
- Make sure your emulator has internet access
- Try cold booting the emulator
- Or use a physical device

### "No posts yet"
- Run `node seed-sample-posts.js` to add sample data
- Or create posts manually in the app

### "Login failed"
- Check your credentials
- Make sure Supabase is configured correctly
- Check `.env` file has correct SUPABASE_URL and SUPABASE_ANON_KEY

### Posts not appearing
- Pull down to refresh
- Check if posts are expired (they auto-expire based on risk tier)
- Check Supabase dashboard to verify data exists

## Next Steps

1. **Test with multiple users** - Create different accounts and share posts between them
2. **Test real-time** - Open app on two devices, create a post on one, see it appear on the other
3. **Customize** - Modify the UI, add features, or change the data model

Enjoy your fully-connected food sharing app! 🍎🥖🥫
