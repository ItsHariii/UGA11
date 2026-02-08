-- ============================================
-- Migration: Add imageUrl column to share_posts table
-- Feature: Food Scanner Post Enhancement
-- Date: 2026-02-08
-- ============================================

-- Add imageUrl column to share_posts table (nullable for backward compatibility)
ALTER TABLE share_posts 
ADD COLUMN image_url TEXT;

-- Add index on image_url for faster queries when filtering posts with images
CREATE INDEX idx_share_posts_image_url ON share_posts(image_url) 
WHERE image_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN share_posts.image_url IS 'Public URL of the food image stored in Supabase Storage (post-images bucket)';

-- ============================================
-- Rollback Instructions (if needed)
-- ============================================
-- To rollback this migration, run:
-- DROP INDEX IF EXISTS idx_share_posts_image_url;
-- ALTER TABLE share_posts DROP COLUMN IF EXISTS image_url;
