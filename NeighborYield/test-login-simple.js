/**
 * Simple Login Test
 * Tests basic auth functionality
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testAuth() {
  console.log('🔐 Testing Supabase Auth Configuration\n');

  // Check if auth is enabled
  console.log('Step 1: Checking auth endpoint...');
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Auth endpoint is accessible');
    console.log('Current session:', data.session ? 'Active' : 'None');
    console.log('');
  } catch (err) {
    console.log('❌ Auth endpoint error:', err.message);
    return;
  }

  // Try to sign up with a very simple email
  console.log('Step 2: Testing sign up...');
  const testEmail = 'user@example.com';
  const testPassword = 'password123456';
  
  console.log(`Attempting signup with: ${testEmail}`);
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.log('❌ Sign up error:', signUpError.message);
    console.log('Error details:', JSON.stringify(signUpError, null, 2));
    console.log('');
    
    // Check if it's because user exists
    if (signUpError.message.includes('already') || signUpError.status === 422) {
      console.log('ℹ️  User might already exist, trying login...\n');
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (loginError) {
        console.log('❌ Login also failed:', loginError.message);
        console.log('');
        console.log('📋 Possible issues:');
        console.log('   1. Email confirmation might be required in Supabase settings');
        console.log('   2. Auth providers might not be enabled');
        console.log('   3. Email validation rules might be too strict');
        console.log('');
        console.log('🔧 To fix:');
        console.log('   1. Go to Supabase Dashboard > Authentication > Providers');
        console.log('   2. Enable Email provider');
        console.log('   3. Disable "Confirm email" if testing locally');
        console.log('   4. Check "Email Auth" settings');
      } else {
        console.log('✅ Login successful!');
        console.log('User:', loginData.user.email);
        console.log('Session active:', !!loginData.session);
      }
    }
  } else {
    console.log('✅ Sign up successful!');
    console.log('User ID:', signUpData.user?.id);
    console.log('Email:', signUpData.user?.email);
    console.log('Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No (check email)');
    console.log('');
    
    if (signUpData.session) {
      console.log('✅ Session created automatically');
    } else {
      console.log('⚠️  No session - email confirmation may be required');
    }
  }
}

testAuth().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
