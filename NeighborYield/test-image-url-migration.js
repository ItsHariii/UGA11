/**
 * Test script for image_url column migration
 * Tests that the migration was applied successfully
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMigration() {
  console.log('🔍 Testing image_url column migration...\n');

  try {
    // Test 1: Check if column exists by querying the table
    console.log('Test 1: Checking if image_url column exists...');
    const { data: posts, error: queryError } = await supabase
      .from('share_posts')
      .select('id, title, image_url')
      .limit(1);

    if (queryError) {
      console.error('❌ Failed to query image_url column:', queryError.message);
      console.log('   This likely means the migration has not been applied yet.');
      return false;
    }

    console.log('✅ image_url column exists and is queryable\n');

    // Test 2: Try to insert a post with image_url
    console.log('Test 2: Testing insert with image_url...');
    
    // First, get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('⚠️  No authenticated user - skipping insert test');
      console.log('   (This is expected if running without authentication)\n');
    } else {
      const testPost = {
        author_id: user.id,
        author_identifier: 'Test-User',
        title: 'Test Post with Image',
        description: 'Testing image_url column',
        risk_tier: 'low',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        source: 'supabase',
        image_url: 'https://example.com/test-image.jpg'
      };

      const { data: insertedPost, error: insertError } = await supabase
        .from('share_posts')
        .insert(testPost)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Failed to insert post with image_url:', insertError.message);
        return false;
      }

      console.log('✅ Successfully inserted post with image_url');
      console.log('   Post ID:', insertedPost.id);
      console.log('   Image URL:', insertedPost.image_url);

      // Clean up test post
      await supabase
        .from('share_posts')
        .delete()
        .eq('id', insertedPost.id);

      console.log('✅ Test post cleaned up\n');
    }

    // Test 3: Test backward compatibility (posts without image_url)
    console.log('Test 3: Testing backward compatibility...');
    const { data: allPosts, error: compatError } = await supabase
      .from('share_posts')
      .select('id, title, image_url')
      .limit(5);

    if (compatError) {
      console.error('❌ Failed to query posts:', compatError.message);
      return false;
    }

    console.log('✅ Backward compatibility confirmed');
    console.log(`   Found ${allPosts.length} posts`);
    const postsWithImages = allPosts.filter(p => p.image_url !== null).length;
    console.log(`   Posts with images: ${postsWithImages}`);
    console.log(`   Posts without images: ${allPosts.length - postsWithImages}\n`);

    console.log('🎉 All migration tests passed!\n');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error during migration test:', error);
    return false;
  }
}

// Run the test
testMigration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
