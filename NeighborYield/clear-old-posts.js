/**
 * Clear Old Posts
 * Removes expired or old posts from Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function clearOldPosts() {
  console.log('🧹 Clearing old posts from Supabase...\n');

  // Login with test credentials
  console.log('Step 1: Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@neighboryield.com',
    password: 'TestPassword123!',
  });

  if (authError || !authData.session) {
    console.log('❌ Login failed:', authError?.message);
    return;
  }

  console.log('✅ Logged in as:', authData.user.email);
  console.log('');

  // Get all posts
  console.log('Step 2: Fetching posts...');
  const { data: posts, error: fetchError } = await supabase
    .from('share_posts')
    .select('id, title, created_at, expires_at, author_id')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.log('❌ Failed to fetch posts:', fetchError.message);
    return;
  }

  console.log(`Found ${posts.length} total posts`);
  console.log('');

  if (posts.length === 0) {
    console.log('✅ No posts to clear');
    return;
  }

  // Show posts
  console.log('Posts:');
  posts.forEach((post, i) => {
    const expired = new Date(post.expires_at) < new Date();
    const isMine = post.author_id === authData.user.id;
    console.log(`  ${i + 1}. ${post.title}`);
    console.log(`     Created: ${new Date(post.created_at).toLocaleString()}`);
    console.log(`     Expires: ${new Date(post.expires_at).toLocaleString()}`);
    console.log(`     Status: ${expired ? '❌ Expired' : '✅ Active'}`);
    console.log(`     Owner: ${isMine ? 'You' : 'Other user'}`);
  });
  console.log('');

  // Ask what to delete
  console.log('Options:');
  console.log('  1. Delete all expired posts');
  console.log('  2. Delete all your posts');
  console.log('  3. Delete all posts (requires admin)');
  console.log('');

  // For now, just delete expired posts
  const expiredPosts = posts.filter(p => new Date(p.expires_at) < new Date());
  
  if (expiredPosts.length === 0) {
    console.log('✅ No expired posts to delete');
    return;
  }

  console.log(`Deleting ${expiredPosts.length} expired posts...`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const post of expiredPosts) {
    const { error } = await supabase
      .from('share_posts')
      .delete()
      .eq('id', post.id);

    if (error) {
      console.log(`❌ Failed to delete: ${post.title}`);
      console.log(`   Error: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ Deleted: ${post.title}`);
      successCount++;
    }
  }

  console.log('');
  console.log('📊 Summary:');
  console.log(`   ✅ Deleted: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log('');
  console.log('🎉 Done!');
}

clearOldPosts().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
