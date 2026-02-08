/**
 * Test Login Script
 * Tests authentication with Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testLogin() {
  console.log('🔐 Testing Supabase Authentication\n');

  // First, let's try to create a test user
  const testEmail = 'test@neighboryield.com';
  const testPassword = 'TestPassword123!';
  
  console.log('Step 1: Attempting to sign up a new user...');
  console.log(`Email: ${testEmail}`);
  console.log('');

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Test User',
        username: 'testuser123'
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      console.log('ℹ️  User already exists, proceeding to login...\n');
    } else {
      console.log('❌ Sign up error:', signUpError.message);
      console.log('');
    }
  } else {
    console.log('✅ Sign up successful!');
    console.log('User ID:', signUpData.user?.id);
    console.log('Email:', signUpData.user?.email);
    console.log('');
  }

  // Now try to login
  console.log('Step 2: Attempting to login...');
  
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (loginError) {
    console.log('❌ Login failed:', loginError.message);
    console.log('');
    return false;
  }

  console.log('✅ Login successful!');
  console.log('User ID:', loginData.user.id);
  console.log('Email:', loginData.user.email);
  console.log('Session expires:', new Date(loginData.session.expires_at * 1000).toLocaleString());
  console.log('');

  // Check session
  console.log('Step 3: Verifying session...');
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    console.log('✅ Session is active');
    console.log('Access token (first 20 chars):', session.access_token.substring(0, 20) + '...');
    console.log('');
  } else {
    console.log('❌ No active session');
    console.log('');
    return false;
  }

  // Check if user profile exists in users table
  console.log('Step 4: Checking user profile in database...');
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', loginData.user.id)
    .single();

  if (profileError) {
    console.log('⚠️  No profile found in users table:', profileError.message);
    console.log('   (This is expected if the profile creation trigger is not set up)');
    console.log('');
  } else {
    console.log('✅ User profile found:');
    console.log('   Username:', userProfile.username);
    console.log('   User Identifier:', userProfile.user_identifier);
    console.log('   Neighborhood:', userProfile.neighborhood || 'Not set');
    console.log('');
  }

  // Test logout
  console.log('Step 5: Testing logout...');
  const { error: logoutError } = await supabase.auth.signOut();
  
  if (logoutError) {
    console.log('❌ Logout failed:', logoutError.message);
    return false;
  }

  console.log('✅ Logout successful');
  console.log('');

  // Verify session is gone
  const { data: { session: afterLogout } } = await supabase.auth.getSession();
  if (!afterLogout) {
    console.log('✅ Session cleared successfully');
  } else {
    console.log('⚠️  Session still exists after logout');
  }

  console.log('');
  console.log('🎉 All authentication tests completed!');
  return true;
}

testLogin().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
