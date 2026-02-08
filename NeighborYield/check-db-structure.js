/**
 * Check Database Structure
 * Verifies what tables exist in Supabase and their structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkDatabaseStructure() {
  console.log('🔍 Checking Supabase Database Structure...\n');

  // Login first
  console.log('Step 1: Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@neighboryield.com',
    password: 'TestPassword123!',
  });

  if (authError) {
    console.log('❌ Login failed:', authError.message);
    console.log('   Continuing anyway to check public tables...\n');
  } else {
    console.log('✅ Logged in as:', authData.user.email);
  }
  console.log('');

  // Check each table
  const tables = [
    'users',
    'share_posts',
    'interests',
    'conversations',
    'messages',
    'peer_activity'
  ];

  console.log('Step 2: Checking tables...\n');

  for (const tableName of tables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${tableName}: Table does NOT exist`);
        } else {
          console.log(`⚠️  ${tableName}: Error - ${error.message}`);
        }
      } else {
        console.log(`✅ ${tableName}: EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: Error checking - ${err.message}`);
    }
  }

  console.log('');
  console.log('Step 3: Checking table structures...\n');

  // Check users table structure
  try {
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (users && users.length > 0) {
      console.log('✅ users table columns:');
      console.log('   ', Object.keys(users[0]).join(', '));
    } else {
      console.log('ℹ️  users table exists but is empty');
    }
  } catch (err) {
    console.log('❌ Could not check users structure');
  }

  console.log('');

  // Check share_posts table structure
  try {
    const { data: posts } = await supabase
      .from('share_posts')
      .select('*')
      .limit(1);
    
    if (posts && posts.length > 0) {
      console.log('✅ share_posts table columns:');
      console.log('   ', Object.keys(posts[0]).join(', '));
    } else {
      console.log('ℹ️  share_posts table exists but is empty');
    }
  } catch (err) {
    console.log('❌ Could not check share_posts structure');
  }

  console.log('');

  // Check interests table structure
  try {
    const { data: interests } = await supabase
      .from('interests')
      .select('*')
      .limit(1);
    
    if (interests && interests.length > 0) {
      console.log('✅ interests table columns:');
      console.log('   ', Object.keys(interests[0]).join(', '));
    } else {
      console.log('ℹ️  interests table exists but is empty');
    }
  } catch (err) {
    console.log('❌ Could not check interests structure');
  }

  console.log('');

  // Check conversations table structure
  try {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (conversations && conversations.length > 0) {
      console.log('✅ conversations table columns:');
      console.log('   ', Object.keys(conversations[0]).join(', '));
    } else if (conversations) {
      console.log('ℹ️  conversations table exists but is empty');
    }
  } catch (err) {
    console.log('❌ Could not check conversations structure:', err.message);
  }

  console.log('');

  // Check messages table structure
  try {
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (messages && messages.length > 0) {
      console.log('✅ messages table columns:');
      console.log('   ', Object.keys(messages[0]).join(', '));
    } else if (messages) {
      console.log('ℹ️  messages table exists but is empty');
    }
  } catch (err) {
    console.log('❌ Could not check messages structure:', err.message);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Summary
  console.log('📊 Summary:\n');
  
  const existingTables = [];
  const missingTables = [];

  for (const tableName of tables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error || error.code !== '42P01') {
        existingTables.push(tableName);
      } else {
        missingTables.push(tableName);
      }
    } catch (err) {
      missingTables.push(tableName);
    }
  }

  console.log(`✅ Existing tables (${existingTables.length}):`);
  existingTables.forEach(t => console.log(`   - ${t}`));
  console.log('');

  if (missingTables.length > 0) {
    console.log(`❌ Missing tables (${missingTables.length}):`);
    missingTables.forEach(t => console.log(`   - ${t}`));
    console.log('');
    console.log('💡 To create missing tables:');
    console.log('   1. Open Supabase Dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Run the migration script:');
    if (missingTables.includes('conversations') || missingTables.includes('messages')) {
      console.log('      - messaging-tables-migration.sql');
    }
    console.log('');
  } else {
    console.log('🎉 All tables exist!');
    console.log('');
  }

  // Check for data
  console.log('📈 Data counts:\n');
  
  for (const tableName of existingTables) {
    try {
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      console.log(`   ${tableName}: ${count || 0} rows`);
    } catch (err) {
      console.log(`   ${tableName}: Could not count`);
    }
  }

  console.log('');
  console.log('✅ Database structure check complete!');
}

checkDatabaseStructure().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
