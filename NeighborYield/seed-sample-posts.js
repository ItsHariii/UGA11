/**
 * Seed Sample Posts
 * Adds sample food share posts to Supabase for testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const samplePosts = [
  {
    title: 'Fresh Garden Tomatoes',
    description: 'Just picked from my garden this morning. About 2 lbs of ripe, organic heirloom tomatoes available. Perfect for salads or cooking!',
    risk_tier: 'high',
    expires_minutes: 15,
  },
  {
    title: 'Homemade Sourdough Bread',
    description: 'Baked fresh this morning using my 5-year-old starter. Crusty outside, soft inside. One full loaf available.',
    risk_tier: 'medium',
    expires_minutes: 60,
  },
  {
    title: 'Canned Vegetables',
    description: 'Assorted canned goods - beans, corn, peas. All unopened, best by dates in 2027.',
    risk_tier: 'low',
    expires_minutes: 1440, // 24 hours
  },
  {
    title: 'Fresh Milk',
    description: 'Half gallon of whole milk, unopened. Expires in 3 days.',
    risk_tier: 'high',
    expires_minutes: 20,
  },
  {
    title: 'Pasta & Sauce',
    description: 'Box of spaghetti and jar of marinara sauce. Both unopened.',
    risk_tier: 'low',
    expires_minutes: 180,
  },
];

async function seedPosts() {
  console.log('🌱 Seeding sample posts to Supabase...\n');

  // Login with test credentials
  console.log('Step 1: Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@neighboryield.com',
    password: 'TestPassword123!',
  });

  if (authError || !authData.session) {
    console.log('❌ Login failed:', authError?.message);
    console.log('   Make sure the test user exists (run: node test-login.js)');
    return;
  }

  console.log('✅ Logged in as:', authData.user.email);
  console.log('');

  // Get user profile to get user_identifier
  console.log('Step 2: Fetching user profile...');
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('user_identifier')
    .eq('id', authData.user.id)
    .single();

  let userIdentifier;

  if (profileError || !profileData) {
    console.log('❌ Could not fetch user profile:', profileError?.message);
    console.log('   Creating user profile...');
    
    // Try to create profile
    userIdentifier = `Neighbor-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: 'Test User',
        user_identifier: userIdentifier,
        username: authData.user.email.split('@')[0],
      });
    
    if (insertError) {
      console.log('❌ Failed to create profile:', insertError.message);
      return;
    }
    
    console.log('✅ Profile created with identifier:', userIdentifier);
  } else {
    userIdentifier = profileData.user_identifier;
  }

  console.log('✅ User Identifier:', userIdentifier);
  console.log('');

  // Create posts
  console.log('Step 3: Creating sample posts...');
  console.log('');
  let successCount = 0;
  let errorCount = 0;

  for (const post of samplePosts) {
    const expiresAt = new Date(Date.now() + post.expires_minutes * 60 * 1000);
    
    const { data, error } = await supabase
      .from('share_posts')
      .insert({
        author_id: authData.user.id,
        author_identifier: userIdentifier,
        title: post.title,
        description: post.description,
        risk_tier: post.risk_tier,
        expires_at: expiresAt.toISOString(),
        source: 'supabase',
      })
      .select()
      .single();

    if (error) {
      console.log(`❌ Failed to create: ${post.title}`);
      console.log(`   Error: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ Created: ${post.title}`);
      console.log(`   ID: ${data.id}`);
      console.log(`   Expires: ${expiresAt.toLocaleString()}`);
      successCount++;
    }
    console.log('');
  }

  console.log('📊 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log('');
  console.log('🎉 Done! Check your app to see the posts.');
}

seedPosts().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
