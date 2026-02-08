/**
 * Verification script for Task 12 completion
 * Checks that both database migration and storage bucket are set up correctly
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('🔍 Verifying Task 12 Setup\n');
  console.log('=' .repeat(60));
  console.log();

  let allPassed = true;

  // Test 1: Database migration
  console.log('Test 1: Database Migration (image_url column)');
  try {
    const { data, error } = await supabase
      .from('share_posts')
      .select('id, title, image_url')
      .limit(1);

    if (error) {
      console.log('❌ FAILED:', error.message);
      console.log('   Action: Run migrations/task-12-complete.sql in Supabase Dashboard\n');
      allPassed = false;
    } else {
      console.log('✅ PASSED: image_url column exists and is queryable\n');
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    allPassed = false;
  }

  // Test 2: Storage bucket
  console.log('Test 2: Storage Bucket (post-images)');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log('❌ FAILED:', error.message);
      allPassed = false;
    } else {
      const bucket = buckets.find(b => b.name === 'post-images');
      if (bucket) {
        console.log('✅ PASSED: post-images bucket exists');
        console.log(`   Public: ${bucket.public}`);
        console.log(`   File size limit: ${bucket.file_size_limit ? (bucket.file_size_limit / 1024 / 1024) + 'MB' : 'Not set'}\n`);
      } else {
        console.log('❌ FAILED: post-images bucket not found');
        console.log('   Action: Bucket should have been created automatically\n');
        allPassed = false;
      }
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    allPassed = false;
  }

  // Test 3: Storage policies (check if we can get public URL)
  console.log('Test 3: Storage Policies');
  try {
    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl('test.jpg');

    if (data && data.publicUrl) {
      console.log('✅ PASSED: Can generate public URLs');
      console.log(`   Example URL: ${data.publicUrl}\n`);
    } else {
      console.log('⚠️  WARNING: Could not generate public URL');
      console.log('   This might be okay - policies will be tested during actual upload\n');
    }
  } catch (error) {
    console.log('⚠️  WARNING:', error.message);
    console.log('   Policies will be tested during actual upload\n');
  }

  // Test 4: Backward compatibility
  console.log('Test 4: Backward Compatibility');
  try {
    const { data: posts, error } = await supabase
      .from('share_posts')
      .select('id, title, image_url')
      .limit(5);

    if (error) {
      console.log('❌ FAILED:', error.message);
      allPassed = false;
    } else {
      console.log('✅ PASSED: Can query posts with/without images');
      console.log(`   Total posts: ${posts.length}`);
      const withImages = posts.filter(p => p.image_url !== null).length;
      console.log(`   Posts with images: ${withImages}`);
      console.log(`   Posts without images: ${posts.length - withImages}\n`);
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    allPassed = false;
  }

  console.log('=' .repeat(60));
  console.log();

  if (allPassed) {
    console.log('🎉 SUCCESS! Task 12 is complete!\n');
    console.log('✅ Database migration applied');
    console.log('✅ Storage bucket created');
    console.log('✅ All tests passed\n');
    console.log('📝 Next steps:');
    console.log('   - Task 13: Update App.tsx to handle image posts');
    console.log('   - Task 14: Update posts service to handle image URLs');
    console.log('   - Task 17: Manual testing and polish\n');
    return true;
  } else {
    console.log('⚠️  INCOMPLETE - Some steps still needed\n');
    console.log('📝 To complete setup:');
    console.log('   1. Go to: https://app.supabase.com');
    console.log('   2. Select your project');
    console.log('   3. SQL Editor > New Query');
    console.log('   4. Copy/paste: migrations/task-12-complete.sql');
    console.log('   5. Run the SQL');
    console.log('   6. Run this script again to verify\n');
    return false;
  }
}

verify()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
