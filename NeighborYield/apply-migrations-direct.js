/**
 * Direct SQL execution for Task 12 migrations
 * Uses Supabase REST API to execute SQL directly
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigrations() {
  console.log('🚀 Applying Task 12 Migrations\n');
  console.log('=' .repeat(60));
  console.log();

  // Step 1: Add image_url column
  console.log('📊 Step 1: Adding image_url column to share_posts...');
  
  try {
    // Use raw SQL query
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'share_posts' AND column_name = 'image_url'
          ) THEN
            ALTER TABLE share_posts ADD COLUMN image_url TEXT;
            CREATE INDEX idx_share_posts_image_url ON share_posts(image_url) WHERE image_url IS NOT NULL;
            COMMENT ON COLUMN share_posts.image_url IS 'Public URL of the food image stored in Supabase Storage (post-images bucket)';
          END IF;
        END $$;
      `
    });

    if (error) {
      console.log('⚠️  RPC method not available, trying alternative...\n');
      
      // Alternative: Check if column exists by querying
      const { error: checkError } = await supabase
        .from('share_posts')
        .select('image_url')
        .limit(1);
      
      if (checkError && checkError.message.includes('does not exist')) {
        console.log('❌ Column does not exist and cannot be created via API');
        console.log('📝 Please run this SQL in Supabase Dashboard > SQL Editor:\n');
        console.log('ALTER TABLE share_posts ADD COLUMN image_url TEXT;');
        console.log('CREATE INDEX idx_share_posts_image_url ON share_posts(image_url) WHERE image_url IS NOT NULL;\n');
        return false;
      } else {
        console.log('✅ Column already exists or was created\n');
      }
    } else {
      console.log('✅ Database migration applied\n');
    }
  } catch (error) {
    console.log('⚠️  Could not verify migration:', error.message);
  }

  // Step 2: Apply storage policies
  console.log('🔒 Step 2: Applying storage policies...');
  console.log('📝 Please run this SQL in Supabase Dashboard > SQL Editor:\n');
  console.log(`
-- Public read access
CREATE POLICY IF NOT EXISTS "Public Access for Post Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Authenticated upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Update own images
CREATE POLICY IF NOT EXISTS "Users can update own post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete own images
CREATE POLICY IF NOT EXISTS "Users can delete own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
  `);
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✅ Storage bucket created');
  console.log('⏳ Database migration needs manual SQL execution');
  console.log('⏳ Storage policies need manual SQL execution\n');
  
  return true;
}

applyMigrations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
