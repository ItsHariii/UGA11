# Database Migration Guide: Add Image URL Support

## Overview

This migration adds support for storing image URLs in the `share_posts` table, enabling the Food Scanner Post Enhancement feature.

## Migration Details

- **File**: `migrations/add-image-url-to-posts.sql`
- **Changes**:
  - Adds `image_url` column (TEXT, nullable)
  - Creates index on `image_url` for performance
  - Maintains backward compatibility with existing posts

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `migrations/add-image-url-to-posts.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push migrations/add-image-url-to-posts.sql
```

### Option 3: Using psql (Direct Database Connection)

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i migrations/add-image-url-to-posts.sql
```

## Testing the Migration

After applying the migration, run the test script to verify:

```bash
cd NeighborYield
node test-image-url-migration.js
```

Expected output:
```
🔍 Testing image_url column migration...

Test 1: Checking if image_url column exists...
✅ image_url column exists and is queryable

Test 2: Testing insert with image_url...
✅ Successfully inserted post with image_url
   Post ID: [uuid]
   Image URL: https://example.com/test-image.jpg
✅ Test post cleaned up

Test 3: Testing backward compatibility...
✅ Backward compatibility confirmed
   Found X posts
   Posts with images: 0
   Posts without images: X

🎉 All migration tests passed!
```

## Rollback Instructions

If you need to rollback this migration:

```sql
-- Remove the index
DROP INDEX IF EXISTS idx_share_posts_image_url;

-- Remove the column
ALTER TABLE share_posts DROP COLUMN IF EXISTS image_url;
```

## Backward Compatibility

✅ **This migration is fully backward compatible:**

- Existing posts will have `image_url = NULL`
- All existing queries will continue to work
- The column is nullable, so no data migration is required
- Posts without images will function exactly as before

## Next Steps

After applying this migration:

1. ✅ Set up Supabase Storage bucket (see task 12.2)
2. ✅ Update the posts service to handle image URLs
3. ✅ Test image upload functionality in the app

## Troubleshooting

### Error: "column already exists"

The migration has already been applied. You can verify by running:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'share_posts' AND column_name = 'image_url';
```

### Error: "permission denied"

Make sure you're using a database user with sufficient privileges (typically the `postgres` user or service role key).

### Test script fails with authentication error

This is expected if you're not logged in. The test will skip the insert test but still verify the column exists.
