/**
 * Test Registration Script
 * Tests user registration with the auth service
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testRegistration() {
  console.log('📝 Testing User Registration\n');

  // Test data - using a more standard email format
  const randomNum = Math.floor(Math.random() * 10000);
  const testUser = {
    email: `test.user${randomNum}@gmail.com`,
    password: 'SecurePassword123!',
    fullName: 'Test User',
    username: `testuser${randomNum}`,
    phoneNumber: '555-0123',
    neighborhood: 'Downtown'
  };

  console.log('Registration Data:');
  console.log('  Email:', testUser.email);
  console.log('  Username:', testUser.username);
  console.log('  Full Name:', testUser.fullName);
  console.log('  Neighborhood:', testUser.neighborhood);
  console.log('');

  try {
    // Step 1: Create auth user
    console.log('Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
    });

    if (authError) {
      console.log('❌ Auth signup failed:', authError.message);
      console.log('   Error code:', authError.code);
      console.log('   Status:', authError.status);
      return false;
    }

    if (!authData.user) {
      console.log('❌ No user data returned from signup');
      return false;
    }

    console.log('✅ Auth user created');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);
    console.log('   Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('');

    // Step 2: Generate user identifier
    console.log('Step 2: Generating user identifier...');
    let userIdentifier;
    
    try {
      const { data: identifier, error: identifierError } = await supabase.rpc(
        'generate_user_identifier'
      );
      
      if (identifierError) {
        console.log('⚠️  RPC function not available, generating locally');
        userIdentifier = `Neighbor-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      } else {
        userIdentifier = identifier;
      }
    } catch (err) {
      console.log('⚠️  RPC error, generating locally');
      userIdentifier = `Neighbor-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }

    console.log('✅ User identifier:', userIdentifier);
    console.log('');

    // Step 3: Create user profile
    console.log('Step 3: Creating user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        full_name: testUser.fullName,
        username: testUser.username,
        email: testUser.email,
        phone_number: testUser.phoneNumber,
        neighborhood: testUser.neighborhood,
        user_identifier: userIdentifier,
      })
      .select()
      .single();

    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
      console.log('   Error code:', profileError.code);
      console.log('   Details:', profileError.details);
      console.log('   Hint:', profileError.hint);
      
      // Try to clean up auth user
      console.log('');
      console.log('⚠️  Attempting to clean up auth user...');
      await supabase.auth.signOut();
      
      return false;
    }

    console.log('✅ User profile created successfully!');
    console.log('');
    console.log('📋 Complete User Profile:');
    console.log('   ID:', profile.id);
    console.log('   Email:', profile.email);
    console.log('   Username:', profile.username);
    console.log('   Full Name:', profile.full_name);
    console.log('   User Identifier:', profile.user_identifier);
    console.log('   Neighborhood:', profile.neighborhood);
    console.log('   Phone:', profile.phone_number);
    console.log('   Created:', new Date(profile.created_at).toLocaleString());
    console.log('');

    // Step 4: Verify we can fetch the profile
    console.log('Step 4: Verifying profile retrieval...');
    const { data: fetchedProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (fetchError) {
      console.log('❌ Failed to fetch profile:', fetchError.message);
      return false;
    }

    console.log('✅ Profile retrieved successfully');
    console.log('');

    // Step 5: Test login with new credentials
    console.log('Step 5: Testing login with new credentials...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      return false;
    }

    console.log('✅ Login successful!');
    console.log('   Session active:', !!loginData.session);
    console.log('');

    // Step 6: Sign out
    console.log('Step 6: Signing out...');
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');
    console.log('');

    console.log('🎉 Registration test completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Auth user created');
    console.log('  ✅ User profile created in database');
    console.log('  ✅ Profile can be retrieved');
    console.log('  ✅ Login works with new credentials');
    console.log('  ✅ Logout works');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testRegistration().then(success => {
  process.exit(success ? 0 : 1);
});
