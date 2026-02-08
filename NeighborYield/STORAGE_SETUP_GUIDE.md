# Supabase Storage Setup Guide

## Overview

This guide walks you through setting up Supabase Storage for the Food Scanner Post Enhancement feature. The storage bucket will hold food images uploaded by users.

## Prerequisites

- Supabase project created
- Environment variables configured in `.env`:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

## Setup Methods

### Method 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
cd NeighborYield
node setup-storage-bucket.js
```

This script will:
- ✅ Check if the bucket exists
- ✅ Create the bucket if needed
- ✅ Configure bucket settings (5MB limit, JPEG/PNG only)
- ✅ Test upload functionality
- ✅ Verify configuration

Expected output:
```
🗄️  Setting up Supabase Storage bucket for post images...

Step 1: Checking if bucket exists...
Step 2: Creating "post-images" bucket...
✅ Bucket "post-images" created successfully

Step 3: Verifying bucket configuration...
✅ Bucket configuration:
   Name: post-images
   Public: true
   File size limit: 5MB
   Allowed MIME types: image/jpeg, image/png

Step 4: Testing upload functionality...
✅ Test upload successful
   File path: test-1707408000000.txt
   Public URL: https://[project].supabase.co/storage/v1/object/public/post-images/test-1707408000000.txt
✅ Test file cleaned up

🎉 Storage bucket setup complete!
```

### Method 2: Manual Setup via Supabase Dashboard

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to Storage**
   - Click **Storage** in the left sidebar
   - Click **New Bucket**

3. **Create Bucket**
   - Name: `post-images`
   - Public bucket: ✅ **Enabled**
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/jpeg, image/png`
   - Click **Create bucket**

4. **Apply Storage Policies**
   - Go to **SQL Editor**
   - Copy contents of `migrations/setup-storage-policies.sql`
   - Paste and run the SQL

## Storage Configuration

### Bucket Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| Name | `post-images` | Identifier for the bucket |
| Public | `true` | Allows public read access to images |
| File Size Limit | 5MB (5,242,880 bytes) | Prevents oversized uploads |
| Allowed MIME Types | `image/jpeg`, `image/png` | Restricts to image formats |

### Folder Structure

```
post-images/
├── {userId1}/
│   ├── post_1707408000000.jpg
│   └── post_1707408001000.png
├── {userId2}/
│   └── post_1707408002000.jpg
└── {userId3}/
    └── post_1707408003000.jpg
```

Each user has their own folder (identified by their UUID) to organize their images.

### File Naming Convention

Format: `{userId}/post_{timestamp}.{ext}`

Example: `550e8400-e29b-41d4-a716-446655440000/post_1707408000000.jpg`

Components:
- **userId**: User's UUID from Supabase Auth
- **timestamp**: Unix timestamp in milliseconds
- **ext**: File extension (jpg or png)

## Row-Level Security (RLS) Policies

The storage bucket uses the following RLS policies:

### 1. Public Read Access
```sql
-- Anyone can view/download images
CREATE POLICY "Public Access for Post Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');
```

### 2. Authenticated Upload
```sql
-- Authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Update Own Images
```sql
-- Users can update their own images
CREATE POLICY "Users can update own post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 4. Delete Own Images
```sql
-- Users can delete their own images
CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Testing the Setup

### Test 1: Verify Bucket Exists

```bash
node setup-storage-bucket.js
```

### Test 2: Manual Upload Test

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Upload a test image
const testUpload = async () => {
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload('test-user-id/test.jpg', fileBuffer, {
      contentType: 'image/jpeg'
    });
  
  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Upload successful:', data);
  }
};
```

### Test 3: Get Public URL

```javascript
const { data } = supabase.storage
  .from('post-images')
  .getPublicUrl('test-user-id/test.jpg');

console.log('Public URL:', data.publicUrl);
```

## Troubleshooting

### Error: "Bucket already exists"

✅ This is fine! The bucket is already set up. Verify configuration:

```bash
node setup-storage-bucket.js
```

### Error: "new row violates row-level security policy"

❌ RLS policies not applied correctly. Solutions:

1. Run the storage policies SQL:
   ```bash
   # Copy migrations/setup-storage-policies.sql to SQL Editor and run
   ```

2. Verify policies exist:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'objects' 
   AND schemaname = 'storage';
   ```

### Error: "File size exceeds limit"

❌ Image is larger than 5MB. Solutions:

1. Compress the image before upload (handled by ImageService)
2. Increase bucket limit (not recommended)

### Error: "Invalid MIME type"

❌ File is not JPEG or PNG. Solutions:

1. Convert image to JPEG or PNG
2. Add more MIME types to bucket config (if needed)

## Security Considerations

### ✅ What's Protected

- Users can only upload to their own folder
- Users can only modify/delete their own images
- File size is limited to 5MB
- Only image formats are allowed

### ⚠️ Important Notes

- Images are **publicly readable** by design (for feed display)
- Don't store sensitive information in image filenames
- Consider implementing image moderation for production
- Monitor storage usage to prevent abuse

## Cost Considerations

Supabase Storage pricing (as of 2024):

- **Free tier**: 1GB storage, 2GB bandwidth/month
- **Pro tier**: 100GB storage, 200GB bandwidth/month
- **Additional**: $0.021/GB storage, $0.09/GB bandwidth

### Optimization Tips

1. **Compress images** before upload (handled by ImageService)
2. **Delete old images** when posts expire
3. **Monitor usage** via Supabase Dashboard
4. **Set up alerts** for approaching limits

## Next Steps

After completing storage setup:

1. ✅ Apply database migration (task 12.1)
2. ✅ Set up storage bucket (task 12.2) ← You are here
3. ⏭️ Update posts service to handle image URLs (task 14)
4. ⏭️ Test end-to-end image upload flow (task 17)

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage Best Practices](https://supabase.com/docs/guides/storage/best-practices)
