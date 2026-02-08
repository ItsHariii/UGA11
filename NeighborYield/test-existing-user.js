/**
 * Test with Existing User
 * Since we can't create new users due to rate limits,
 * let's document what credentials would work
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log('📋 Supabase Authentication Status\n');
console.log('Current Issues:');
console.log('  ❌ Email rate limit exceeded');
console.log('  ❌ Email confirmation required');
console.log('  ❌ Strict email validation');
console.log('');

console.log('🔧 To Fix (in Supabase Dashboard):');
console.log('');
console.log('1. Disable Email Confirmation:');
console.log('   → Go to: Authentication > Providers > Email');
console.log('   → Toggle OFF "Confirm email"');
console.log('   → Save changes');
console.log('');

console.log('2. Adjust Rate Limits:');
console.log('   → Go to: Authentication > Rate Limits');
console.log('   → Increase limits or disable for development');
console.log('   → Save changes');
console.log('');

console.log('3. Dashboard URL:');
console.log('   → https://supabase.com/dashboard/project/jmhqkbgygoxlvxokdajv');
console.log('');

console.log('📊 Current Database State:');
console.log('');

async function checkDatabase() {
  try {
    // Check existing users
    const { data: users, error } = await supabase
      .from('users')
      .select('username, user_identifier, email, created_at')
      .limit(10);

    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }

    console.log(`Found ${users.length} existing user(s):`);
    users.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.username} (${user.user_identifier})`);
      console.log(`     Email: ${user.email}`);
      console.log(`     Created: ${new Date(user.created_at).toLocaleDateString()}`);
    });
    console.log('');

    console.log('💡 To test authentication:');
    console.log('   1. Fix the Supabase settings above');
    console.log('   2. Run: node test-register.js');
    console.log('   3. Or create a user manually in Supabase Dashboard');
    console.log('');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkDatabase();
