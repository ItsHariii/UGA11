/**
 * Supabase Data Inspector
 * Shows what data exists in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function inspectData() {
  console.log('📊 Inspecting Supabase Database\n');

  try {
    // Check users
    console.log('👥 USERS TABLE:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Error:', usersError.message);
    } else {
      console.log(`   Found ${users.length} users`);
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.user_identifier})`);
      });
    }
    console.log('');

    // Check share_posts
    console.log('📝 SHARE_POSTS TABLE:');
    const { data: posts, error: postsError } = await supabase
      .from('share_posts')
      .select('*')
      .limit(5);
    
    if (postsError) {
      console.log('❌ Error:', postsError.message);
    } else {
      console.log(`   Found ${posts.length} posts`);
      posts.forEach(post => {
        console.log(`   - "${post.title}" (${post.risk_tier}) - expires: ${new Date(post.expires_at).toLocaleDateString()}`);
      });
    }
    console.log('');

    // Check interests
    console.log('❤️  INTERESTS TABLE:');
    const { data: interests, error: interestsError } = await supabase
      .from('interests')
      .select('*')
      .limit(5);
    
    if (interestsError) {
      console.log('❌ Error:', interestsError.message);
    } else {
      console.log(`   Found ${interests.length} interests`);
      interests.forEach(interest => {
        console.log(`   - Status: ${interest.status} (created: ${new Date(interest.created_at).toLocaleDateString()})`);
      });
    }
    console.log('');

    // Check messages
    console.log('💬 MESSAGES TABLE:');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);
    
    if (messagesError) {
      console.log('❌ Error:', messagesError.message);
    } else {
      console.log(`   Found ${messages.length} messages`);
      messages.forEach(msg => {
        console.log(`   - ${msg.is_read ? '✓' : '○'} "${msg.content.substring(0, 30)}..."`);
      });
    }
    console.log('');

    console.log('✅ Inspection complete!');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

inspectData();
