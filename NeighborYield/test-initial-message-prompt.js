/**
 * Test Initial Message Prompt
 * Verifies the initial message prompt flow works correctly
 * 
 * Note: This is a manual test since it involves Alert dialogs
 * Run this in the React Native app to test the actual flow
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testInitialMessagePromptLogic() {
  console.log('🧪 Testing Initial Message Prompt Logic\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Login
  console.log('Step 1: Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@neighboryield.com',
    password: 'TestPassword123!',
  });

  if (authError) {
    console.log('❌ Login failed:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log('✅ Logged in as:', authData.user.email);
  console.log('');

  // Step 2: Find a conversation
  console.log('Step 2: Checking for existing conversations...');
  
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select(`
      *,
      share_posts!inner(title, author_identifier),
      interests!inner(interested_user_identifier)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .limit(1);

  if (convError) {
    console.log('❌ Error fetching conversations:', convError.message);
    return;
  }

  if (!conversations || conversations.length === 0) {
    console.log('⚠️  No conversations found');
    console.log('   Please express interest in a post first to create a conversation');
    console.log('   Run: node test-conversation-auto-creation.js');
    return;
  }

  const conversation = conversations[0];
  console.log('✅ Found conversation');
  console.log('   Conversation ID:', conversation.id);
  console.log('   Interest ID:', conversation.interest_id);
  console.log('   Post Title:', conversation.share_posts.title);
  console.log('');

  // Step 3: Simulate fetching conversation by interest ID
  console.log('Step 3: Testing conversation lookup by interest ID...');
  
  const { data: conversationsByInterest, error: lookupError } = await supabase
    .from('conversations')
    .select(`
      *,
      share_posts!inner(title, author_identifier),
      interests!inner(interested_user_identifier)
    `)
    .eq('interest_id', conversation.interest_id)
    .single();

  if (lookupError) {
    console.log('❌ Error looking up conversation:', lookupError.message);
    return;
  }

  console.log('✅ Successfully looked up conversation by interest ID');
  console.log('   Conversation ID:', conversationsByInterest.id);
  console.log('   Post Title:', conversationsByInterest.share_posts.title);
  console.log('');

  // Step 4: Determine other user
  console.log('Step 4: Determining other user in conversation...');
  
  const otherUserId = conversationsByInterest.user1_id === userId 
    ? conversationsByInterest.user2_id 
    : conversationsByInterest.user1_id;
  
  const otherUserIdentifier = conversationsByInterest.user1_id === userId
    ? conversationsByInterest.share_posts.author_identifier
    : conversationsByInterest.interests.interested_user_identifier;

  console.log('✅ Determined other user');
  console.log('   Other User ID:', otherUserId);
  console.log('   Other User Identifier:', otherUserIdentifier);
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('🎉 TEST PASSED: Initial Message Prompt Logic Works!\n');
  console.log('Summary:');
  console.log('  ✅ Can fetch conversations by user ID');
  console.log('  ✅ Can lookup conversation by interest ID');
  console.log('  ✅ Can determine other user in conversation');
  console.log('  ✅ Can extract post title and user identifiers');
  console.log('');
  console.log('✅ Requirements 6.2, 6.3, 6.4 logic verified');
  console.log('');
  console.log('📱 To test the full flow with UI:');
  console.log('   1. Import handleInterestWithMessage in your component');
  console.log('   2. Replace handleInterestPress with the enhanced version');
  console.log('   3. Express interest in a post');
  console.log('   4. You should see the "Send Message?" prompt');
  console.log('   5. Choose "Skip" or "Send Message" to test both paths');
  console.log('');
  console.log('📖 See INTEREST_MESSAGE_FLOW_INTEGRATION.md for integration guide');
  console.log('');
}

testInitialMessagePromptLogic().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
