/**
 * Setup script for Supabase Storage bucket for post images
 * Creates the 'post-images' bucket with appropriate configuration
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL in .env file');
  process.exit(1);
}

// Try to use service role key first, fall back to anon key for verification only
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('   Required: SUPABASE_SERVICE_ROLE_KEY (for bucket creation)');
  console.log('   Or: SUPABASE_ANON_KEY (for verification only)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if we have service role key
const hasServiceRole = !!supabaseServiceKey;
if (!hasServiceRole) {
  console.log('⚠️  Using SUPABASE_ANON_KEY - can only verify existing bucket');
  console.log('   To create bucket, add SUPABASE_SERVICE_ROLE_KEY to .env');
  console.log('   Or create bucket manually via Supabase Dashboard\n');
}

async function setupStorageBucket() {
  console.log('🗄️  Setting up Supabase Storage bucket for post images...\n');

  try {
    // Step 1: Check if bucket already exists
    console.log('Step 1: Checking if bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Failed to list buckets:', listError.message);
      return false;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'post-images');

    if (bucketExists) {
      console.log('✅ Bucket "post-images" already exists\n');
    } else {
      if (!hasServiceRole) {
        console.log('❌ Bucket "post-images" does not exist');
        console.log('   Cannot create bucket without SUPABASE_SERVICE_ROLE_KEY');
        console.log('\n📝 Manual Setup Required:');
        console.log('   1. Go to Supabase Dashboard > Storage');
        console.log('   2. Click "New Bucket"');
        console.log('   3. Name: post-images');
        console.log('   4. Public: ✅ Enabled');
        console.log('   5. File size limit: 5242880 (5MB)');
        console.log('   6. Allowed MIME types: image/jpeg, image/png');
        console.log('   7. Click "Create bucket"');
        console.log('\n   Then run this script again to verify.\n');
        return false;
      }

      // Step 2: Create the bucket
      console.log('Step 2: Creating "post-images" bucket...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('post-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB in bytes
        allowedMimeTypes: ['image/jpeg', 'image/png']
      });

      if (createError) {
        console.error('❌ Failed to create bucket:', createError.message);
        console.log('\n📝 Manual Setup Required:');
        console.log('   Follow the steps in STORAGE_SETUP_GUIDE.md');
        console.log('   Or add SUPABASE_SERVICE_ROLE_KEY to .env\n');
        return false;
      }

      console.log('✅ Bucket "post-images" created successfully\n');
    }

    // Step 3: Verify bucket configuration
    console.log('Step 3: Verifying bucket configuration...');
    const { data: bucket, error: getError } = await supabase.storage.getBucket('post-images');

    if (getError) {
      console.error('❌ Failed to get bucket details:', getError.message);
      return false;
    }

    console.log('✅ Bucket configuration:');
    console.log('   Name:', bucket.name);
    console.log('   Public:', bucket.public);
    console.log('   File size limit:', bucket.file_size_limit ? `${bucket.file_size_limit / 1024 / 1024}MB` : 'Not set');
    console.log('   Allowed MIME types:', bucket.allowed_mime_types || 'Not set');
    console.log();

    // Step 4: Test upload (optional)
    console.log('Step 4: Testing upload functionality...');
    
    if (!hasServiceRole) {
      console.log('⚠️  Skipping upload test (requires authentication)');
      console.log('   Upload functionality will be tested when users create posts\n');
    } else {
      const testFileName = `test-${Date.now()}.txt`;
      const testContent = 'This is a test file for storage bucket verification';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(testFileName, testContent, {
          contentType: 'text/plain',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Failed to upload test file:', uploadError.message);
        console.log('   Note: This might be due to RLS policies. Check your Supabase dashboard.');
        console.log('   See migrations/setup-storage-policies.sql for policy setup\n');
        // Don't return false here as the bucket might still be set up correctly
      } else {
        console.log('✅ Test upload successful');
        console.log('   File path:', uploadData.path);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(testFileName);

        console.log('   Public URL:', urlData.publicUrl);

        // Clean up test file
        const { error: deleteError } = await supabase.storage
          .from('post-images')
          .remove([testFileName]);

        if (!deleteError) {
          console.log('✅ Test file cleaned up\n');
        }
      }
    }

    console.log('🎉 Storage bucket setup complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Verify bucket in Supabase Dashboard > Storage');
    console.log('   2. Check RLS policies if upload test failed');
    console.log('   3. Update image service to use this bucket');
    console.log();

    return true;

  } catch (error) {
    console.error('❌ Unexpected error during setup:', error);
    return false;
  }
}

// Run the setup
setupStorageBucket()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
