-- ============================================
-- Storage Policies for post-images bucket
-- Feature: Food Scanner Post Enhancement
-- Date: 2026-02-08
-- ============================================

-- Note: This SQL should be run AFTER creating the storage bucket
-- You can create the bucket via:
-- 1. Supabase Dashboard > Storage > New Bucket
-- 2. Or using the setup-storage-bucket.js script

-- ============================================
-- 1. PUBLIC READ ACCESS
-- ============================================
-- Allow anyone to view/download images from the post-images bucket
-- This enables image URLs to be publicly accessible

CREATE POLICY "Public Access for Post Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- ============================================
-- 2. AUTHENTICATED UPLOAD ACCESS
-- ============================================
-- Allow authenticated users to upload images to their own folder
-- Folder structure: {userId}/{filename}

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 3. USER CAN UPDATE OWN IMAGES
-- ============================================
-- Allow users to update/replace their own images

CREATE POLICY "Users can update own post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 4. USER CAN DELETE OWN IMAGES
-- ============================================
-- Allow users to delete their own images

CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the policies were created:

-- List all policies for storage.objects
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check bucket configuration
-- SELECT * FROM storage.buckets WHERE name = 'post-images';

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To remove these policies:
-- DROP POLICY IF EXISTS "Public Access for Post Images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update own post images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own post images" ON storage.objects;

-- ============================================
-- NOTES
-- ============================================
-- 
-- Folder Structure:
-- post-images/
--   ├── {userId1}/
--   │   ├── {postId1}_original.jpg
--   │   └── {postId1}_compressed.jpg
--   └── {userId2}/
--       └── {postId2}_compressed.jpg
--
-- Security:
-- - Public read ensures images can be displayed in the app
-- - Folder-based isolation prevents users from accessing/modifying others' images
-- - Authentication required for all write operations
--
-- File Naming Convention:
-- - Format: {userId}/{postId}_{timestamp}.{ext}
-- - Example: 550e8400-e29b-41d4-a716-446655440000/post_1707408000000.jpg
--
