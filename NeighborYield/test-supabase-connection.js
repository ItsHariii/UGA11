/**
 * Supabase Connection Test Script
 * Run with: node test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic Connection');
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connected successfully!');
    console.log('');

    // Test 2: Check tables exist
    console.log('Test 2: Checking Tables');
    const tables = ['users', 'share_posts', 'interests', 'messages', 'peer_activity'];
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count', { count: 'exact', head: true });
      
      if (tableError) {
        console.log(`❌ Table '${table}': ${tableError.message}`);
      } else {
        console.log(`✅ Table '${table}': exists`);
      }
    }
    console.log('');

    // Test 3: Auth status
    console.log('Test 3: Auth Status');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ User authenticated:', session.user.email);
    } else {
      console.log('ℹ️  No active session (not logged in)');
    }
    console.log('');

    console.log('🎉 All tests completed!');
    return true;
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
