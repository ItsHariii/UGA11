# ✅ Supabase Integration Complete

## Files Created

### 1. Environment Configuration
- ✅ **`.env`** - Your Supabase credentials (DO NOT COMMIT)
- ✅ **`.env.example`** - Template for other developers
- ✅ **`src/types/env.d.ts`** - TypeScript declarations for env variables

### 2. Supabase Client
- ✅ **`src/lib/supabase.ts`** - Configured Supabase client with:
  - AsyncStorage for session persistence
  - Auto token refresh
  - Helper functions (isAuthenticated, getCurrentUser, signOut)

### 3. Babel Configuration
- ✅ Updated **`babel.config.js`** to load environment variables via `react-native-dotenv`

## Your Supabase Credentials

```
Project URL: https://jmhqkbgygoxlvxokdajv.supabase.co
Anon Key: eyJhbGc... (configured in .env)
```

## Next Steps

### 1. Install Required Packages

```bash
cd NeighborYield
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-dotenv
```

### 2. Link AsyncStorage (if needed)

```bash
npx react-native link @react-native-async-storage/async-storage
```

### 3. Restart Metro Bundler

After installing packages, restart your development server:

```bash
# Stop current server (Ctrl+C)
# Clear cache and restart
npm start -- --reset-cache
```

### 4. Set Up Database Schema

If you haven't already:
1. Go to your Supabase Dashboard: https://jmhqkbgygoxlvxokdajv.supabase.co
2. Navigate to **SQL Editor**
3. Run the contents of `SUPABASE_SCHEMA.sql`

### 5. Test the Connection

Add this to your `App.tsx` to test:

```typescript
import { supabase, isAuthenticated } from './src/lib/supabase';

// Test connection on app load
useEffect(() => {
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count');
      if (error) {
        console.error('Supabase connection error:', error);
      } else {
        console.log('✅ Supabase connected successfully!');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
    }
  };
  
  testConnection();
}, []);
```

## Usage Examples

### Authentication

```typescript
import { supabase } from './src/lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
import { signOut } from './src/lib/supabase';
await signOut();
```

### Database Queries

```typescript
import { supabase } from './src/lib/supabase';

// Fetch posts
const { data: posts, error } = await supabase
  .from('share_posts')
  .select('*')
  .order('created_at', { ascending: false });

// Create post
const { data, error } = await supabase
  .from('share_posts')
  .insert({
    title: 'Fresh Tomatoes',
    description: 'Just picked from my garden',
    risk_tier: 'high',
  });

// Update post
const { data, error } = await supabase
  .from('share_posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId);
```

### Realtime Subscriptions

```typescript
import { supabase } from './src/lib/supabase';

// Subscribe to new posts
const subscription = supabase
  .channel('posts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'share_posts' },
    (payload) => {
      console.log('New post:', payload.new);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## Security Notes

- ✅ `.env` is already in `.gitignore` - your credentials are safe
- ✅ Using `anon` key (public) - safe for client-side use
- ✅ Row Level Security (RLS) should be enabled in Supabase Dashboard
- ⚠️ Never commit `.env` to version control
- ⚠️ Never share your `service_role` key (not used here)

## Troubleshooting

### Issue: "Cannot find module '@env'"
**Solution**: 
1. Restart Metro bundler with cache clear: `npm start -- --reset-cache`
2. Rebuild the app: `npx react-native run-android` or `npx react-native run-ios`

### Issue: "AsyncStorage is not defined"
**Solution**: 
1. Install: `npm install @react-native-async-storage/async-storage`
2. Link: `npx react-native link @react-native-async-storage/async-storage`
3. Rebuild the app

### Issue: "Network request failed"
**Solution**: 
1. Check your internet connection
2. Verify Supabase URL is correct in `.env`
3. Check Supabase project is active in dashboard

## Resources

- [Supabase Dashboard](https://jmhqkbgygoxlvxokdajv.supabase.co)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [Your Setup Guide](./SUPABASE_SETUP_GUIDE.md)

---

**Status**: ✅ Configuration complete! Install packages and restart Metro to start using Supabase.
