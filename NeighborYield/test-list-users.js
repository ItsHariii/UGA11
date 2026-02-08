/**
 * List existing users to find valid credentials
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  console.log('📋 Listing Existing Users\n');

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(10);

    if (error) throw error;

    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.username || 'No username'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'No email'}`);
      console.log(`   Identifier: ${user.user_identifier}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listUsers();
