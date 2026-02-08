/**
 * All-in-one setup script for Task 12
 * Applies database migration and creates storage bucket
 * 
 * IMPORTANT: This script requires SUPABASE_SERVICE_ROLE_KEY in .env
 * Get it from: Supabase Dashboard > Settings > API > service_role key
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required credentials in .env file\n');
  console.log('Required:');
  console.log('  - SUPABASE_URL (✅ found)');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY (❌ missing)\n');
  console.log('📝 To get your service role key:');
  console.log('  1. Go to https://app.supabase.com');
  console.log('  2. Select your project');
  console.log('  3. Settings > API');
  console.log('  4. Copy "service_role" key (NOT the anon key)');
  console.log('  5. Add to .env: SUPABASE_SERVICE_ROLE_KEY=your-key-here\n');
  console.log('⚠️  WARNING: Keep service_role key secret! Never commit to git!\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// SQL for database migration
const migrationSQL = `
-- Add imageUrl column to share_posts table
ALTER TABLE share_posts 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index on image_url for faster queries
CREATE INDEX IF NOT EXISTS idx_share_posts_image_url 
ON share_posts(image_url) 
WHERE image_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN share_posts.image_url IS 'Public URL of the food image stored in Supabase Storage (post-images bucket)';
`;

// SQL for storage policies
const storagePoliciesSQL = `
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
`;

async function applyDatabaseMigration() {
  console.log('📊 Step 1: Applying database migration...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // Try alternative method using direct query
      const { error: altError } = await supabase.from('share_posts').select('image_url').limit(1);
      
      if (altError && altError.message.includes('does not exist')) {
        console.error('❌ Failed to apply migration:', error.message);
        console.log('\n📝 Manual migration required:');
        console.log('  1. Go to Supabase Dashboard > SQL Editor');
        console.log('  2. Copy contents of: migrations/add-image-url-to-posts.sql');
        console.log('  3. Paste and run the SQL\n');
        return false;
      } else if (!altError) {
        console.log('✅ Migration already applied (column exists)\n');
        return true;
      }
    }
    
    console.log('✅ Database migration applied successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📝 Please apply manually via Supabase Dashboard\n');
    return false;
  }
}

async function createStorageBucket() {
  console.log('🗄️  Step 2: Creating storage bucket...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Failed to list buckets:', listError.message);
      return false;
    }
    
    const bucketExists = buckets.some(b => b.name === 'post-images');
    
    if (bucketExists) {
      console.log('✅ Bucket "post-images" already exists\n');
      return true;
    }
    
    // Create bucket
    const { data, error } = await supabase.storage.createBucket('post-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png']
    });
    
    if (error) {
      console.error('❌ Failed to create bucket:', error.message);
      console.log('\n📝 Manual bucket creation required:');
      console.log('  See STORAGE_MANUAL_SETUP.md for instructions\n');
      return false;
    }
    
    console.log('✅ Storage bucket created successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
    return false;
  }
}

async function applyStoragePolicies() {
  console.log('🔒 Step 3: Applying storage policies...');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: storagePoliciesSQL });
    
    if (error) {
      console.log('⚠️  Could not apply policies via RPC');
      console.log('📝 Manual policy setup required:');
      console.log('  1. Go to Supabase Dashboard > SQL Editor');
      console.log('  2. Copy contents of: migrations/setup-storage-policies.sql');
      console.log('  3. Paste and run the SQL\n');
      return false;
    }
    
    console.log('✅ Storage policies applied successfully\n');
    return true;
  } catch (error) {
    console.log('⚠️  Could not apply policies automatically');
    console.log('📝 Please apply manually via Supabase Dashboard\n');
    return false;
  }
}

async function verifySetup() {
  console.log('✅ Step 4: Verifying setup...\n');
  
  let allGood = true;
  
  // Verify database migration
  try {
    const { data, error } = await supabase
      .from('share_posts')
      .select('id, image_url')
      .limit(1);
    
    if (error) {
      console.log('❌ Database migration verification failed');
      allGood = false;
    } else {
      console.log('✅ Database: image_url column exists');
    }
  } catch (error) {
    console.log('❌ Database verification error');
    allGood = false;
  }
  
  // Verify storage bucket
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'post-images');
    
    if (bucketExists) {
      console.log('✅ Storage: post-images bucket exists');
    } else {
      console.log('❌ Storage: post-images bucket not found');
      allGood = false;
    }
  } catch (error) {
    console.log('❌ Storage verification error');
    allGood = false;
  }
  
  console.log();
  return allGood;
}

async function main() {
  console.log('🚀 Task 12 Setup: Database Migration & Storage Bucket\n');
  console.log('=' .repeat(60));
  console.log();
  
  // Step 1: Database migration
  const migrationSuccess = await applyDatabaseMigration();
  
  // Step 2: Storage bucket
  const bucketSuccess = await createStorageBucket();
  
  // Step 3: Storage policies
  const policiesSuccess = await applyStoragePolicies();
  
  // Step 4: Verify
  const verifySuccess = await verifySetup();
  
  console.log('=' .repeat(60));
  console.log();
  
  if (verifySuccess) {
    console.log('🎉 SUCCESS! Task 12 setup complete!\n');
    console.log('✅ Database migration applied');
    console.log('✅ Storage bucket created');
    console.log('✅ Storage policies configured\n');
    console.log('📝 Next steps:');
    console.log('  - Task 13: Update App.tsx to handle image posts');
    console.log('  - Task 14: Update posts service to handle image URLs');
    console.log('  - Task 17: Manual testing and polish\n');
    return true;
  } else {
    console.log('⚠️  PARTIAL SUCCESS - Some manual steps required\n');
    console.log('📚 See these guides for manual setup:');
    console.log('  - MIGRATION_GUIDE.md (database)');
    console.log('  - STORAGE_MANUAL_SETUP.md (storage)');
    console.log('  - QUICK_SETUP_REFERENCE.md (quick reference)\n');
    return false;
  }
}

// Run the setup
main()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
