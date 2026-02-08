-- ============================================
-- Task 12: Complete Migration Script
-- Run this entire script in Supabase Dashboard > SQL Editor
-- ============================================

-- PART 1: Database Migration (Add image_url column)
-- ============================================

-- Add image_url column to share_posts table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'share_posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE share_posts ADD COLUMN image_url TEXT;
    RAISE NOTICE 'Added image_url column to share_posts table';
  ELSE
    RAISE NOTICE 'image_url column already exists';
  END IF;
END $$;

-- Create index on image_url for faster queries (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_share_posts_image_url 
ON share_posts(image_url) 
WHERE image_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN share_posts.image_url IS 'Public URL of the food image stored in Supabase Storage (post-images bucket)';

-- PART 2: Storage Policies
-- ============================================

-- Public read access (anyone can view images)
CREATE POLICY IF NOT EXISTS "Public Access for Post Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Authenticated upload (users can upload to their own folder)
CREATE POLICY IF NOT EXISTS "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Update own images (users can update their own images)
CREATE POLICY IF NOT EXISTS "Users can update own post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete own images (users can delete their own images)
CREATE POLICY IF NOT EXISTS "Users can delete own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Verification Queries (optional - run separately to verify)
-- ============================================

-- Verify image_url column exists
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'share_posts' AND column_name = 'image_url';

-- Verify storage policies exist
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage'
-- AND policyname LIKE '%Post Images%';

-- ============================================
-- SUCCESS!
-- ============================================
-- If no errors appeared above, Task 12 is complete!
-- Run the verification script to confirm:
-- cd NeighborYield && node test-image-url-migration.js
