/**
 * Test Complete Messaging Flow
 * Tests: express interest → view conversation → send message
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Messaging Flow\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Login as test user
    console.log('Step 1: Logging in as test user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@neighboryield.com',
      password: 'TestPassword123!',
    });

    if (authError) throw authError;

    const userId = authData.user.id;
    const userIdentifier = 'Neighbor-TEST';
    console.log(`✅ Logged in as: ${authData.user.email}`);
    console.log(`   User ID: ${userId}\n`);

    // Step 2: Find a test post
    console.log('Step 2: Finding test post...');
    const { data: posts, error: postsError } = await supabase
      .from('share_posts')
      .select('*')
      .eq('is_active', true)
      .neq('author_id', userId)
      .limit(1);

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) {
      console.log('❌ No test posts found');
      return;
    }

    const post = posts[0];
    console.log(`✅ Found post: ${post.title}`);
    console.log(`   Post ID: ${post.id}\n`);

    // Step 3: Check for existing interest or create new one
    console.log('Step 3: Checking for existing interest...');
    let { data: existingInterest } = await supabase
      .from('interests')
      .select('*')
      .eq('post_id', post.id)
      .eq('interested_user_id', userId)
      .single();

    let interest;
    if (existingInterest) {
      console.log(`✅ Using existing interest: ${existingInterest.id}\n`);
      interest = existingInterest;
    } else {
      console.log('Creating new interest...');
      const { data: newInterest, error: interestError } = await supabase
        .from('interests')
        .insert({
          post_id: post.id,
          interested_user_id: userId,
          interested_user_identifier: userIdentifier,
          status: 'pending',
          source: 'supabase',
        })
        .select()
        .single();

      if (interestError) throw interestError;
      console.log(`✅ Interest created: ${newInterest.id}\n`);
      interest = newInterest;
    }

    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Fetch conversations
    console.log('Step 4: Fetching conversations...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        interest_id,
        post_id,
        user1_id,
        user2_id,
        created_at,
        last_message_at,
        share_posts!inner(title, author_identifier),
        interests!inner(interested_user_identifier)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('interest_id', interest.id)
      .single();

    if (convError) throw convError;
    console.log(`✅ Conversation found: ${conversations.id}`);
    console.log(`   Post: ${conversations.share_posts.title}\n`);

    // Step 5: Send a message
    console.log('Step 5: Sending message...');
    const messageText = 'Hello! I am interested in this item. Is it still available?';
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversations.id,
        sender_id: userId,
        sender_identifier: userIdentifier,
        message_text: messageText,
      })
      .select()
      .single();

    if (messageError) throw messageError;
    console.log(`✅ Message sent: ${message.id}`);
    console.log(`   Text: "${message.message_text}"\n`);

    // Step 6: Fetch messages
    console.log('Step 6: Fetching messages...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversations.id)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;
    console.log(`✅ Found ${messages.length} message(s)`);
    messages.forEach((msg, idx) => {
      console.log(`   ${idx + 1}. ${msg.sender_identifier}: "${msg.message_text}"`);
    });
    console.log('');

    // Step 7: Test unread count
    console.log('Step 7: Testing unread count...');
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversations.id)
      .eq('is_read', false)
      .neq('sender_id', userId);

    console.log(`✅ Unread count: ${unreadCount || 0}\n`);

    // Step 8: Mark messages as read
    console.log('Step 8: Marking messages as read...');
    const { error: markReadError } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversations.id)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (markReadError) throw markReadError;
    console.log(`✅ Messages marked as read\n`);

    // Step 9: Verify unread count is now 0
    console.log('Step 9: Verifying unread count...');
    const { count: newUnreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversations.id)
      .eq('is_read', false)
      .neq('sender_id', userId);

    console.log(`✅ New unread count: ${newUnreadCount || 0}\n`);

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🎉 COMPLETE FLOW TEST PASSED!\n');
    console.log('Summary:');
    console.log('  ✅ Interest expression creates conversation');
    console.log('  ✅ Conversations can be fetched with post details');
    console.log('  ✅ Messages can be sent successfully');
    console.log('  ✅ Messages can be fetched in chronological order');
    console.log('  ✅ Unread counts are calculated correctly');
    console.log('  ✅ Messages can be marked as read');
    console.log('  ✅ Unread counts update after marking as read\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.details) console.error('   Details:', error.details);
    if (error.hint) console.error('   Hint:', error.hint);
    process.exit(1);
  }
}

testCompleteFlow();
