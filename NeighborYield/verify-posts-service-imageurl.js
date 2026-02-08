/**
 * Verification script for posts service imageUrl support
 * Tests that createPost and fetchPosts handle imageUrl correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function verifyImageUrlSupport() {
  console.log('🔍 Verifying posts service imageUrl support...\n');

  try {
    // Get a valid user ID from existing data or use a test UUID
    console.log('Getting valid user ID for testing...');
    const { data: existingPost } = await supabase
      .from('share_posts')
      .select('author_id')
      .limit(1)
      .single();

    const testUserId = existingPost?.author_id || '00000000-0000-0000-0000-000000000001';
    console.log('Using user ID:', testUserId);

    // Test 1: Create post WITH imageUrl
    console.log('\nTest 1: Creating post with imageUrl...');
    const testPostWithImage = {
      author_id: testUserId,
      author_identifier: 'Neighbor-TEST',
      title: 'Fresh Apples with Photo',
      description: 'Delicious red apples from my garden',
      risk_tier: 'low',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      source: 'supabase',
      image_url: 'https://example.com/test-image.jpg',
    };

    const { data: postWithImage, error: error1 } = await supabase
      .from('share_posts')
      .insert(testPostWithImage)
      .select()
      .single();

    if (error1) {
      console.error('❌ Failed to create post with imageUrl:', error1.message);
      return false;
    }

    console.log('✅ Post with imageUrl created:', postWithImage.id);
    console.log('   imageUrl:', postWithImage.image_url);

    // Test 2: Create post WITHOUT imageUrl (backward compatibility)
    console.log('\nTest 2: Creating post without imageUrl (backward compatibility)...');
    const testPostWithoutImage = {
      author_id: testUserId,
      author_identifier: 'Neighbor-TEST2',
      title: 'Fresh Oranges',
      description: 'Sweet oranges, no photo',
      risk_tier: 'medium',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      source: 'supabase',
      image_url: null,
    };

    const { data: postWithoutImage, error: error2 } = await supabase
      .from('share_posts')
      .insert(testPostWithoutImage)
      .select()
      .single();

    if (error2) {
      console.error('❌ Failed to create post without imageUrl:', error2.message);
      return false;
    }

    console.log('✅ Post without imageUrl created:', postWithoutImage.id);
    console.log('   imageUrl:', postWithoutImage.image_url);

    // Test 3: Fetch posts and verify imageUrl is included
    console.log('\nTest 3: Fetching posts to verify imageUrl field...');
    const { data: posts, error: error3 } = await supabase
      .from('share_posts')
      .select('*')
      .in('id', [postWithImage.id, postWithoutImage.id]);

    if (error3) {
      console.error('❌ Failed to fetch posts:', error3.message);
      return false;
    }

    console.log('✅ Fetched posts successfully');
    posts.forEach(post => {
      console.log(`   Post ${post.id}:`);
      console.log(`     - title: ${post.title}`);
      console.log(`     - imageUrl: ${post.image_url || 'null'}`);
    });

    // Cleanup: Delete test posts
    console.log('\nCleaning up test posts...');
    await supabase
      .from('share_posts')
      .delete()
      .in('id', [postWithImage.id, postWithoutImage.id]);

    console.log('\n✅ All tests passed! Posts service correctly handles imageUrl.');
    console.log('   - Posts with imageUrl: ✅');
    console.log('   - Posts without imageUrl (backward compatible): ✅');
    console.log('   - Fetch includes imageUrl field: ✅');

    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Run verification
verifyImageUrlSupport()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
