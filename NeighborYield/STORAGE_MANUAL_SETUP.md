# Manual Storage Bucket Setup Guide

## Why Manual Setup?

Creating Supabase Storage buckets requires either:
1. **Service Role Key** (admin access) - not recommended for client apps
2. **Supabase Dashboard** (recommended) - secure and user-friendly

This guide walks you through the manual setup process via the Supabase Dashboard.

## Step-by-Step Instructions

### Step 1: Access Supabase Dashboard

1. Go to https://app.supabase.com
2. Sign in to your account
3. Select your **NeighborYield** project

### Step 2: Navigate to Storage

1. Click **Storage** in the left sidebar
2. You'll see a list of existing buckets (if any)

### Step 3: Create New Bucket

1. Click the **New Bucket** button (top right)
2. Fill in the bucket configuration:

   **Bucket Name:**
   ```
   post-images
   ```

   **Public Bucket:**
   - ✅ **Enable** (check the box)
   - This allows public read access to images

   **File Size Limit:**
   ```
   5242880
   ```
   (This is 5MB in bytes)

   **Allowed MIME Types:**
   ```
   image/jpeg
   image/png
   ```
   (Add both types, one per line)

3. Click **Create Bucket**

### Step 4: Verify Bucket Creation

You should see the new `post-images` bucket in your storage list with:
- 🌐 Public badge (indicating public access)
- 📦 0 objects (empty bucket)

### Step 5: Set Up Storage Policies

Storage policies control who can upload, update, and delete files.

1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `migrations/setup-storage-policies.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

You should see:
```
Success. No rows returned
```

### Step 6: Verify Policies

1. Go back to **Storage** > **Policies**
2. Select the `post-images` bucket
3. You should see 4 policies:
   - ✅ Public Access for Post Images (SELECT)
   - ✅ Authenticated users can upload post images (INSERT)
   - ✅ Users can update own post images (UPDATE)
   - ✅ Users can delete own post images (DELETE)

### Step 7: Test the Setup

Run the verification script:

```bash
cd NeighborYield
node setup-storage-bucket.js
```

Expected output:
```
🗄️  Setting up Supabase Storage bucket for post images...

⚠️  Using SUPABASE_ANON_KEY - can only verify existing bucket
   To create bucket, add SUPABASE_SERVICE_ROLE_KEY to .env
   Or create bucket manually via Supabase Dashboard

Step 1: Checking if bucket exists...
✅ Bucket "post-images" already exists

Step 3: Verifying bucket configuration...
✅ Bucket configuration:
   Name: post-images
   Public: true
   File size limit: 5MB
   Allowed MIME types: image/jpeg, image/png

Step 4: Testing upload functionality...
⚠️  Skipping upload test (requires authentication)
   Upload functionality will be tested when users create posts

🎉 Storage bucket setup complete!
```

## Troubleshooting

### Issue: "Bucket name already exists"

✅ **Solution:** The bucket is already created. Skip to Step 5 (Set Up Storage Policies).

### Issue: "Invalid bucket name"

❌ **Problem:** Bucket name contains invalid characters.

✅ **Solution:** Use exactly `post-images` (lowercase, with hyphen).

### Issue: "Policies not working"

❌ **Problem:** RLS policies not applied or incorrect.

✅ **Solution:**
1. Go to **Storage** > **Policies**
2. Check if all 4 policies exist
3. If missing, re-run the SQL from Step 5
4. Verify policy names match exactly

### Issue: "Upload fails with 'new row violates row-level security policy'"

❌ **Problem:** User trying to upload to wrong folder or not authenticated.

✅ **Solution:**
1. Ensure user is authenticated
2. Upload path must be: `{userId}/{filename}`
3. Example: `550e8400-e29b-41d4-a716-446655440000/post_1707408000000.jpg`

## Visual Verification Checklist

After setup, verify these in the Supabase Dashboard:

### Storage Tab
- [ ] Bucket `post-images` exists
- [ ] Bucket shows 🌐 Public badge
- [ ] Bucket shows correct file size limit (5MB)
- [ ] Bucket shows allowed MIME types (image/jpeg, image/png)

### Policies Tab (for post-images bucket)
- [ ] Policy: "Public Access for Post Images" (SELECT)
- [ ] Policy: "Authenticated users can upload post images" (INSERT)
- [ ] Policy: "Users can update own post images" (UPDATE)
- [ ] Policy: "Users can delete own post images" (DELETE)

## Next Steps

After completing manual setup:

1. ✅ Bucket created and configured
2. ✅ Storage policies applied
3. ⏭️ Update image service to use the bucket
4. ⏭️ Test image upload in the app

## Quick Reference

### Bucket Configuration
```
Name: post-images
Public: true
File Size Limit: 5242880 (5MB)
Allowed MIME Types: image/jpeg, image/png
```

### Folder Structure
```
post-images/
  └── {userId}/
      └── post_{timestamp}.{ext}
```

### Example Upload Path
```
550e8400-e29b-41d4-a716-446655440000/post_1707408000000.jpg
```

### Public URL Format
```
https://[project-ref].supabase.co/storage/v1/object/public/post-images/{userId}/post_{timestamp}.{ext}
```

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Security Guide](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage Best Practices](https://supabase.com/docs/guides/storage/best-practices)

## Support

If you encounter issues:
1. Check the [Supabase Discord](https://discord.supabase.com)
2. Review [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
3. Check the project's GitHub issues
