# NeighborYield Supabase Setup Guide

## 📋 Overview

This guide will help you set up Supabase as the backend for NeighborYield, a hybrid mesh/cloud food sharing app.

## 🗄️ Database Schema Summary

### Core Tables

1. **users** - User profiles and mesh network identities
2. **share_posts** - Food sharing posts with TTL and risk tiers
3. **interests** - User interest expressions on posts
4. **messages** - Direct messaging between users (optional)
5. **peer_activity** - Mesh network activity tracking

## 🚀 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Set project details:
   - **Name**: `neighboryield` (or your preference)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be provisioned (~2 minutes)

### 2. Run Database Schema

1. In your Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `SUPABASE_SCHEMA.sql`
4. Paste into the SQL editor
5. Click "Run" or press `Cmd/Ctrl + Enter`
6. Verify all tables were created successfully

### 3. Configure Authentication

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email settings:
   - **Enable email confirmations**: ON (recommended)
   - **Secure email change**: ON
   - **Secure password change**: ON

4. Go to **Authentication** > **Email Templates**
5. Customize templates (optional):
   - Confirmation email
   - Password reset
   - Magic link

6. Go to **Authentication** > **Policies**
7. Verify Row Level Security (RLS) is enabled on all tables

### 4. Set Up Storage (Optional - for future features)

1. Go to **Storage**
2. Create buckets:
   - **avatars** (public: true) - User profile pictures
   - **post_images** (public: true) - Food post images

3. Set up storage policies:
```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to upload post images
CREATE POLICY "Users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post_images'
  AND auth.uid() IS NOT NULL
);
```

### 5. Enable Realtime

1. Go to **Database** > **Replication**
2. Enable realtime for:
   - ✅ share_posts
   - ✅ interests
   - ✅ messages

### 6. Set Up Scheduled Jobs

1. Go to **Database** > **Extensions**
2. Enable **pg_cron** extension

3. Go to **SQL Editor** and run:
```sql
-- Expire old posts every 5 minutes
SELECT cron.schedule(
  'expire-old-posts',
  '*/5 * * * *',
  'SELECT expire_old_posts()'
);
```

### 7. Get API Credentials

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (keep secret!)

## 📱 React Native Integration

### 1. Install Supabase Client

```bash
cd NeighborYield
npm install @supabase/supabase-js
```

### 2. Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 3. Install AsyncStorage

```bash
npm install @react-native-async-storage/async-storage
```

For Android, also run:
```bash
npx react-native link @react-native-async-storage/async-storage
```

### 4. Create Environment Variables

Create `.env` file in project root:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

Install dotenv:
```bash
npm install react-native-dotenv
```

Update `babel.config.js`:
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
  ],
};
```

### 5. Update Authentication Handlers

Update `App.tsx`:

```typescript
import { supabase } from './src/lib/supabase';

// Login handler
const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Login error:', error.message);
    return;
  }
  
  setIsAuthenticated(true);
};

// Register handler
const handleRegister = async (data: RegisterData) => {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  
  if (authError) {
    console.error('Registration error:', authError.message);
    return;
  }
  
  // 2. Create user profile
  const userIdentifier = await generateUserIdentifier();
  
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user!.id,
      full_name: data.fullName,
      username: data.username,
      email: data.email,
      phone_number: data.phoneNumber,
      neighborhood: data.neighborhood,
      user_identifier: userIdentifier,
    });
  
  if (profileError) {
    console.error('Profile creation error:', profileError.message);
    return;
  }
  
  setIsAuthenticated(true);
};

// Helper function
const generateUserIdentifier = async (): Promise<string> => {
  const { data, error } = await supabase.rpc('generate_user_identifier');
  return data || `Neighbor-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};
```

## 🔐 Security Best Practices

### 1. Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Policies restrict access appropriately
- ✅ Users can only modify their own data

### 2. API Keys
- ⚠️ **NEVER** commit API keys to git
- ✅ Use environment variables
- ✅ Add `.env` to `.gitignore`

### 3. Password Requirements
Configure in **Authentication** > **Policies**:
- Minimum 8 characters
- Require uppercase, lowercase, number

### 4. Rate Limiting
Configure in **Authentication** > **Rate Limits**:
- Sign up: 10 per hour per IP
- Sign in: 30 per hour per IP
- Password reset: 5 per hour per IP

## 📊 Monitoring & Analytics

### 1. Database Performance
- Go to **Database** > **Query Performance**
- Monitor slow queries
- Add indexes as needed

### 2. API Usage
- Go to **Settings** > **Usage**
- Monitor:
  - Database size
  - API requests
  - Bandwidth
  - Storage

### 3. Logs
- Go to **Logs**
- Monitor:
  - API logs
  - Database logs
  - Auth logs

## 🧪 Testing

### Test User Creation

```typescript
// Test in SQL Editor
INSERT INTO users (
  id,
  full_name,
  username,
  email,
  user_identifier
) VALUES (
  gen_random_uuid(),
  'Test User',
  'testuser',
  'test@example.com',
  'Neighbor-TEST'
);
```

### Test Post Creation

```typescript
// Test in SQL Editor
INSERT INTO share_posts (
  author_id,
  author_identifier,
  title,
  description,
  risk_tier,
  expires_at,
  source
) VALUES (
  (SELECT id FROM users WHERE username = 'testuser'),
  'Neighbor-TEST',
  'Fresh Tomatoes',
  'Just picked from my garden',
  'high',
  NOW() + INTERVAL '15 minutes',
  'supabase'
);
```

## 🔄 Data Migration (if needed)

If you have existing data:

```typescript
// Example: Migrate mock data to Supabase
const migrateMockData = async () => {
  for (const post of mockPosts) {
    await supabase.from('share_posts').insert({
      author_id: currentUserId,
      author_identifier: post.authorIdentifier,
      title: post.title,
      description: post.description,
      risk_tier: post.riskTier,
      expires_at: new Date(post.expiresAt).toISOString(),
      source: 'supabase',
    });
  }
};
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

## 🆘 Troubleshooting

### Issue: RLS blocking queries
**Solution**: Check policies in SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'share_posts';
```

### Issue: Auth not persisting
**Solution**: Verify AsyncStorage is properly installed and linked

### Issue: Realtime not working
**Solution**: 
1. Check replication is enabled
2. Verify table is added to publication
3. Check network connectivity

## ✅ Checklist

Before going to production:

- [ ] All tables created successfully
- [ ] RLS enabled on all tables
- [ ] Authentication configured
- [ ] Email templates customized
- [ ] Realtime enabled for required tables
- [ ] Scheduled jobs set up
- [ ] API keys stored securely
- [ ] Environment variables configured
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Test user flows working

---

**Need help?** Check the [Supabase Discord](https://discord.supabase.com) or [GitHub Discussions](https://github.com/supabase/supabase/discussions)
