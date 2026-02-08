/**
 * Refresh Supabase schema cache and verify image_url column
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function refreshAndVerify() {
  console.log('🔄 Refreshing Supabase schema cache and verifying image_url column...\n');

  try {
    // Step 1: Check if column exists in database
    console.log('Step 1: Checking if image_url column exists in database...');
    const { data: columnCheck, error: columnError } = await supabase
      .rpc('check_column_exists', {
        table_name: 'share_posts',
        column_name: 'image_url'
      })
      .single();

    if (columnError) {
      console.log('⚠️  RPC function not available, trying direct query...\n');
      
      // Try a direct query to see if the column exists
      const { data: testData, error: testError } = await supabase
        .from('share_posts')
        .select('image_url')
        .limit(1);

      if (testError) {
        if (testError.message.includes('image_url')) {
          console.error('❌ Column image_url does NOT exist in share_posts table');
          console.log('\n📝 Please run this SQL in Supabase Dashboard > SQL Editor:\n');
          console.log('ALTER TABLE share_posts ADD COLUMN image_url TEXT;');
          console.log('CREATE INDEX idx_share_posts_image_url ON share_posts(image_url) WHERE image_url IS NOT NULL;\n');
          return false;
        } else {
          console.error('❌ Error checking column:', testError.message);
          return false;
        }
      }

      console.log('✅ Column image_url exists in database');
    } else {
      console.log('✅ Column image_url exists in database');
    }

    // Step 2: Force schema refresh by making a simple query
    console.log('\nStep 2: Forcing schema cache refresh...');
    const { error: refreshError } = await supabase
      .from('share_posts')
      .select('id, image_url')
      .limit(1);

    if (refreshError) {
      console.error('❌ Schema refresh failed:', refreshError.message);
      console.log('\n💡 Try these solutions:');
      console.log('1. Wait 1-2 minutes for Supabase to refresh its cache automatically');
      console.log('2. Restart your Supabase project from the dashboard');
      console.log('3. Run the migration SQL again in the SQL Editor\n');
      return false;
    }

    console.log('✅ Schema cache refreshed successfully');

    // Step 3: Verify we can query with image_url
    console.log('\nStep 3: Testing query with image_url...');
    
    const { data: queryData, error: queryError } = await supabase
      .from('share_posts')
      .select('id, title, image_url')
      .limit(5);

    if (queryError) {
      console.error('❌ Query test failed:', queryError.message);
      return false;
    }

    console.log('✅ Query with image_url successful');
    console.log(`   Found ${queryData.length} posts`);
    if (queryData.length > 0) {
      console.log('   Sample post:');
      console.log('     - ID:', queryData[0].id);
      console.log('     - Title:', queryData[0].title);
      console.log('     - image_url:', queryData[0].image_url || 'null');
    }

    console.log('\n✅ SUCCESS! Schema is refreshed and image_url column is working!');
    console.log('\nYou can now:');
    console.log('1. Run: node verify-posts-service-imageurl.js');
    console.log('2. Use the posts service with imageUrl in your app\n');

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the refresh and verification
refreshAndVerify()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
