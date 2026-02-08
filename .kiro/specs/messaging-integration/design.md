# Design Document: Messaging Integration

## Overview

This design document specifies the implementation of a real-time messaging system for the NeighborYield mobile application. The system enables users to communicate about posts after expressing interest, leveraging Supabase for data persistence and real-time updates. The implementation follows existing service patterns and integrates seamlessly with the current Interest Flow.

The messaging system consists of three main components:
1. **Messaging Service**: A service layer handling all database operations and real-time subscriptions
2. **Messages Tab Screen**: Displays a list of all conversations for the logged-in user
3. **Chat Screen**: Displays messages within a specific conversation and allows sending new messages

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Messages Tab    │         │   Chat Screen    │          │
│  │   Screen         │────────▶│                  │          │
│  │                  │         │                  │          │
│  │ - Conversation   │         │ - Message List   │          │
│  │   List           │         │ - Input Field    │          │
│  │ - Unread Badges  │         │ - Send Button    │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                            │                     │
│           └────────────┬───────────────┘                     │
│                        │                                     │
│                        ▼                                     │
│           ┌────────────────────────┐                         │
│           │  Messaging Service     │                         │
│           │                        │                         │
│           │ - fetchConversations() │                         │
│           │ - fetchMessages()      │                         │
│           │ - sendMessage()        │                         │
│           │ - markAsRead()         │                         │
│           │ - subscribeToMessages()│                         │
│           │ - subscribeToConvs()   │                         │
│           └────────────┬───────────┘                         │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Supabase Backend   │
              │                      │
              │ - conversations      │
              │ - messages           │
              │ - Realtime           │
              │ - RLS Policies       │
              └──────────────────────┘
```

### Data Flow

**Fetching Conversations:**
1. User opens Messages Tab
2. Messages Tab calls `messagingService.fetchConversations(userId)`
3. Service queries Supabase with joins to get post titles and unread counts
4. Service transforms database rows to app types
5. Messages Tab displays conversation list

**Sending a Message:**
1. User types message and presses send in Chat Screen
2. Chat Screen calls `messagingService.sendMessage(conversationId, senderId, senderIdentifier, text)`
3. Service inserts message into Supabase messages table
4. Database trigger updates conversation's `last_message_at`
5. Realtime subscription broadcasts new message to both participants
6. Chat Screen receives update and displays new message

**Real-time Updates:**
1. Chat Screen subscribes to messages for current conversation
2. Messages Tab subscribes to conversation list updates
3. When new message arrives, Supabase Realtime broadcasts to subscribers
4. Subscribers receive payload and update UI immediately
5. Unread counts update automatically via subscription

## Components and Interfaces

### Messaging Service

**File:** `src/services/messaging.service.ts`

**Type Definitions:**

```typescript
export interface Conversation {
  id: string;
  interestId: string;
  postId: string;
  postTitle: string;
  user1Id: string;
  user2Id: string;
  otherUserId: string;
  otherUserIdentifier: string;
  lastMessageAt: number;
  lastMessageText: string | null;
  unreadCount: number;
  createdAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderIdentifier: string;
  messageText: string;
  isRead: boolean;
  createdAt: number;
}

export interface MessagingError {
  message: string;
  code?: string;
}
```

**Service Functions:**

```typescript
/**
 * Fetch all conversations for a user
 * Joins with posts table to get post titles
 * Calculates unread counts for each conversation
 * Determines the "other user" in each conversation
 */
async function fetchConversations(
  userId: string
): Promise<{ conversations: Conversation[]; error: MessagingError | null }>

/**
 * Fetch all messages for a conversation
 * Orders by created_at ascending (oldest first)
 */
async function fetchMessages(
  conversationId: string
): Promise<{ messages: Message[]; error: MessagingError | null }>

/**
 * Send a new message in a conversation
 * Inserts message with sender info and text
 * Database trigger automatically updates conversation's last_message_at
 */
async function sendMessage(
  conversationId: string,
  senderId: string,
  senderIdentifier: string,
  messageText: string
): Promise<{ message: Message | null; error: MessagingError | null }>

/**
 * Mark all unread messages in a conversation as read
 * Updates is_read to true for all messages where sender != current user
 */
async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ error: MessagingError | null }>

/**
 * Subscribe to real-time message updates for a conversation
 * Listens for INSERT events on messages table
 * Returns subscription object that can be unsubscribed
 */
function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void
): RealtimeChannel

/**
 * Subscribe to real-time conversation list updates
 * Listens for INSERT and UPDATE events on conversations and messages tables
 * Returns subscription object that can be unsubscribed
 */
function subscribeToConversations(
  userId: string,
  onConversationUpdate: () => void
): RealtimeChannel
```

**Implementation Notes:**
- Follow existing service patterns from `posts.service.ts` and `interests.service.ts`
- Use try-catch blocks for error handling
- Transform database snake_case to camelCase for app types
- Convert timestamps to milliseconds for consistency
- Return `{ data, error }` pattern for all async functions

### Messages Tab Screen

**File:** `src/screens/MessagesScreen.tsx`

**Component Structure:**

```typescript
interface MessagesScreenProps {
  navigation: NavigationProp;
  userId: string;
  userIdentifier: string;
}

function MessagesScreen({ navigation, userId, userIdentifier }: MessagesScreenProps) {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Effects
  useEffect(() => {
    // Fetch conversations on mount
    loadConversations();
    
    // Subscribe to real-time updates
    const subscription = messagingService.subscribeToConversations(
      userId,
      () => loadConversations()
    );
    
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [userId]);
  
  // Handlers
  async function loadConversations() { ... }
  function handleConversationPress(conversation: Conversation) { ... }
  
  // Render
  return (
    <View>
      {loading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}
      {!loading && conversations.length === 0 && <EmptyState />}
      {!loading && conversations.length > 0 && (
        <FlatList
          data={conversations}
          renderItem={({ item }) => (
            <ConversationListItem
              conversation={item}
              onPress={() => handleConversationPress(item)}
            />
          )}
        />
      )}
    </View>
  );
}
```

**ConversationListItem Component:**

```typescript
interface ConversationListItemProps {
  conversation: Conversation;
  onPress: () => void;
}

function ConversationListItem({ conversation, onPress }: ConversationListItemProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View>
        <Text>{conversation.postTitle}</Text>
        <Text>{conversation.otherUserIdentifier}</Text>
        <Text>{conversation.lastMessageText || 'No messages yet'}</Text>
        <Text>{formatTimestamp(conversation.lastMessageAt)}</Text>
        {conversation.unreadCount > 0 && (
          <Badge count={conversation.unreadCount} />
        )}
      </View>
    </TouchableOpacity>
  );
}
```

### Chat Screen

**File:** `src/screens/ChatScreen.tsx`

**Component Structure:**

```typescript
interface ChatScreenProps {
  route: {
    params: {
      conversationId: string;
      postTitle: string;
      otherUserIdentifier: string;
    };
  };
  userId: string;
  userIdentifier: string;
}

function ChatScreen({ route, userId, userIdentifier }: ChatScreenProps) {
  const { conversationId, postTitle, otherUserIdentifier } = route.params;
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  
  // Effects
  useEffect(() => {
    // Fetch messages on mount
    loadMessages();
    
    // Mark messages as read
    messagingService.markMessagesAsRead(conversationId, userId);
    
    // Subscribe to real-time updates
    const subscription = messagingService.subscribeToMessages(
      conversationId,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
        
        // Mark as read if not from current user
        if (newMessage.senderId !== userId) {
          messagingService.markMessagesAsRead(conversationId, userId);
        }
      }
    );
    
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [conversationId, userId]);
  
  // Handlers
  async function loadMessages() { ... }
  async function handleSend() { ... }
  function scrollToBottom() { ... }
  
  // Render
  return (
    <View>
      <Header title={postTitle} subtitle={otherUserIdentifier} />
      
      {loading && <LoadingIndicator />}
      
      {!loading && messages.length === 0 && (
        <EmptyState message="No messages yet. Start the conversation!" />
      )}
      
      {!loading && messages.length > 0 && (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwnMessage={item.senderId === userId}
            />
          )}
          onContentSizeChange={scrollToBottom}
        />
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
        />
        <Button
          title="Send"
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        />
      </View>
    </View>
  );
}
```

**MessageBubble Component:**

```typescript
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <View style={[
      styles.bubble,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={styles.senderIdentifier}>
        {message.senderIdentifier}
      </Text>
      <Text style={styles.messageText}>
        {message.messageText}
      </Text>
      <Text style={styles.timestamp}>
        {formatTimestamp(message.createdAt)}
      </Text>
    </View>
  );
}
```

### Integration with Interest Flow

**Modification to Interest Expression:**

When a user expresses interest in a post, a conversation is automatically created by the database trigger. The Interest Flow can optionally allow sending an initial message:

```typescript
// In InterestButton or similar component
async function handleExpressInterest(postId: string) {
  // 1. Express interest (creates conversation via trigger)
  const { interest, error } = await interestsService.expressInterest(
    postId,
    userId,
    userIdentifier
  );
  
  if (error) {
    showError(error.message);
    return;
  }
  
  // 2. Optionally prompt for initial message
  const shouldSendMessage = await promptForInitialMessage();
  
  if (shouldSendMessage) {
    // 3. Fetch the conversation that was just created
    const { conversations } = await messagingService.fetchConversations(userId);
    const conversation = conversations.find(c => c.interestId === interest.id);
    
    if (conversation) {
      // 4. Navigate to chat screen
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        postTitle: conversation.postTitle,
        otherUserIdentifier: conversation.otherUserIdentifier,
      });
    }
  } else {
    // Show success message
    showSuccess('Interest expressed!');
  }
}
```

## Data Models

### Database Schema

The database schema is already created via migration. Key tables:

**conversations table:**
- `id`: UUID primary key
- `interest_id`: UUID (unique, references interests)
- `post_id`: UUID (references share_posts)
- `user1_id`: UUID (references users)
- `user2_id`: UUID (references users)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ
- `last_message_at`: TIMESTAMPTZ

**messages table:**
- `id`: UUID primary key
- `conversation_id`: UUID (references conversations)
- `sender_id`: UUID (references users)
- `sender_identifier`: TEXT
- `message_text`: TEXT (max 1000 chars)
- `is_read`: BOOLEAN
- `read_at`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ

**Database Triggers:**
- `update_conversation_on_message`: Updates `last_message_at` when message is inserted
- `create_conversation_on_interest`: Auto-creates conversation when interest is expressed

**Row Level Security:**
- Users can only view conversations they participate in
- Users can only view messages in their conversations
- Users can only send messages in their conversations
- Users can only mark messages as read in their conversations

### Type Transformations

**Database to App (Conversation):**

```typescript
// Database row
{
  id: string,
  interest_id: string,
  post_id: string,
  user1_id: string,
  user2_id: string,
  created_at: string,
  last_message_at: string,
  post_title: string,
  unread_count: number,
  last_message_text: string | null
}

// App type
{
  id: string,
  interestId: string,
  postId: string,
  postTitle: string,
  user1Id: string,
  user2Id: string,
  otherUserId: string,  // Computed: user1Id === currentUserId ? user2Id : user1Id
  otherUserIdentifier: string,  // Fetched from users table or interests table
  lastMessageAt: number,  // Converted to milliseconds
  lastMessageText: string | null,
  unreadCount: number,
  createdAt: number  // Converted to milliseconds
}
```

**Database to App (Message):**

```typescript
// Database row
{
  id: string,
  conversation_id: string,
  sender_id: string,
  sender_identifier: string,
  message_text: string,
  is_read: boolean,
  created_at: string
}

// App type
{
  id: string,
  conversationId: string,
  senderId: string,
  senderIdentifier: string,
  messageText: string,
  isRead: boolean,
  createdAt: number  // Converted to milliseconds
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Conversation Fetching Completeness

*For any* user with conversations in the database, fetching conversations should return all conversations where the user is a participant, with complete data including post title, other user identifier, last message preview, timestamp, and correct unread count.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.2, 7.3**

### Property 2: Conversation Sorting

*For any* list of conversations returned by fetchConversations, the conversations should be sorted by last_message_at in descending order (most recent first).

**Validates: Requirements 1.7**

### Property 3: Message Chronological Ordering

*For any* conversation, fetching messages should return all messages sorted by created_at in ascending order (oldest first).

**Validates: Requirements 2.1, 7.4**

### Property 4: Message Creation Completeness

*For any* valid message text, conversation ID, sender ID, and sender identifier, sending a message should create a message in the database with all required fields (conversation_id, sender_id, sender_identifier, message_text, created_at) correctly populated.

**Validates: Requirements 2.6, 7.1**

### Property 5: Mark as Read Updates Status

*For any* conversation with unread messages, calling markMessagesAsRead should update all messages from the other user to have is_read = true.

**Validates: Requirements 3.1, 3.2**

### Property 6: Unread Count After Marking Read

*For any* conversation, after marking messages as read, the unread count should be zero for messages from the other user.

**Validates: Requirements 3.3**

### Property 7: Real-time Message Delivery

*For any* conversation with an active subscription, when a new message is inserted into the database, the subscription callback should be invoked with the new message data.

**Validates: Requirements 4.1**

### Property 8: Real-time Conversation Updates

*For any* user with an active conversation list subscription, when a new message is inserted into any of their conversations, the subscription callback should be invoked.

**Validates: Requirements 4.2, 4.3**

### Property 9: Unread Count Increment

*For any* conversation, when a new message arrives from the other user (not the current user), the unread count should increase by one.

**Validates: Requirements 4.4**

### Property 10: Interest Creates Conversation

*For any* interest expressed on a post, a conversation should be created between the interested user and the post author.

**Validates: Requirements 6.1**

### Property 11: Error Handling Returns Error Objects

*For any* service function that encounters a database error, the function should return an error object with a message field rather than throwing an exception.

**Validates: Requirements 7.5**

## Error Handling

### Service Layer Error Handling

All service functions follow a consistent error handling pattern:

```typescript
try {
  // Supabase operation
  const { data, error } = await supabase.from('table').select();
  
  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }
  
  return { data: transformedData, error: null };
} catch (error) {
  return {
    data: null,
    error: { message: error instanceof Error ? error.message : 'Unknown error occurred' }
  };
}
```

### UI Error Handling

**Messages Tab Screen:**
- Display error message if conversation fetch fails
- Show retry button
- Log errors for debugging

**Chat Screen:**
- Display error message if message fetch fails
- Show error toast if message send fails
- Disable send button during sending
- Log errors for debugging

### Network Error Handling

- Handle offline scenarios gracefully
- Show appropriate error messages for network failures
- Retry failed operations when connection is restored

### Validation Errors

**Message Text Validation:**
- Minimum length: 1 character (after trimming)
- Maximum length: 1000 characters
- Show validation error before attempting to send

**Conversation Validation:**
- Ensure conversation exists before sending message
- Ensure user is a participant in the conversation

## Testing Strategy

### Dual Testing Approach

The messaging integration will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests:**
- Test specific examples of conversation and message transformations
- Test edge cases (empty conversations, empty messages, etc.)
- Test error conditions (network failures, invalid data, etc.)
- Test UI component rendering with specific data
- Test navigation flows

**Property-Based Tests:**
- Test universal properties across all inputs
- Generate random conversations and messages
- Verify data transformations are correct for all inputs
- Verify sorting and ordering properties hold for all data
- Verify real-time subscriptions work for all scenarios

### Property-Based Testing Configuration

**Library:** Use `fast-check` for TypeScript property-based testing

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: messaging-integration, Property {N}: {property_text}`

**Example Property Test:**

```typescript
import fc from 'fast-check';

// Feature: messaging-integration, Property 2: Conversation Sorting
test('conversations are sorted by most recent activity', () => {
  fc.assert(
    fc.property(
      fc.array(conversationArbitrary()),
      (conversations) => {
        const sorted = sortConversations(conversations);
        
        // Verify sorted order
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].lastMessageAt).toBeGreaterThanOrEqual(
            sorted[i + 1].lastMessageAt
          );
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Requirements

**Service Layer:**
- All service functions must have unit tests
- All service functions must have property tests for their core behavior
- Error handling paths must be tested

**UI Components:**
- All components must have rendering tests
- User interaction flows must be tested
- Empty states must be tested

**Integration:**
- End-to-end flow from expressing interest to sending messages
- Real-time update flows
- Navigation flows

### Testing Files

```
src/services/__tests__/
  messaging.service.test.ts          # Unit tests
  messaging.service.properties.test.ts  # Property tests

src/screens/__tests__/
  MessagesScreen.test.tsx            # Unit tests
  ChatScreen.test.tsx                # Unit tests

src/components/__tests__/
  ConversationListItem.test.tsx      # Unit tests
  MessageBubble.test.tsx             # Unit tests
```

## Implementation Notes

### Performance Considerations

**Conversation List:**
- Use FlatList with proper keyExtractor for efficient rendering
- Implement pagination if conversation count grows large
- Cache conversation list in memory

**Chat Screen:**
- Use FlatList with inverted prop for chat-style rendering
- Implement pagination for message history
- Auto-scroll only when user is at bottom

**Real-time Subscriptions:**
- Unsubscribe when components unmount to prevent memory leaks
- Use single subscription per screen (don't create multiple)
- Debounce rapid updates to prevent excessive re-renders

### Security Considerations

**Row Level Security:**
- All database access is protected by RLS policies
- Users can only access their own conversations
- Users can only send messages in their conversations

**Input Validation:**
- Sanitize message text before sending
- Validate message length on client and server
- Prevent XSS attacks in message display

**Authentication:**
- Verify user is authenticated before accessing messaging
- Use authenticated user ID from Supabase session
- Don't trust client-provided user IDs

### Accessibility

**Screen Readers:**
- Add proper accessibility labels to all interactive elements
- Announce new messages to screen reader users
- Provide text alternatives for icons

**Keyboard Navigation:**
- Support tab navigation through conversation list
- Support enter key to send messages
- Support escape key to close screens

**Visual Accessibility:**
- Ensure sufficient color contrast for message bubbles
- Support system font size preferences
- Provide visual feedback for all interactions

### Styling

Follow existing theme system patterns:

```typescript
import { useTheme } from '../theme/ThemeContext';

function MessagesScreen() {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    conversationItem: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    // ... more styles
  });
  
  return <View style={styles.container}>...</View>;
}
```

### Future Enhancements

Potential future improvements (not in current scope):

- Image/file attachments
- Message reactions (emoji)
- Typing indicators
- Message editing/deletion
- Push notifications for new messages
- Message search
- Conversation archiving
- Group conversations (more than 2 participants)
- Read receipts (show when other user has read)
- Message delivery status indicators

## Dependencies

### Existing Dependencies

- `@supabase/supabase-js`: Already installed for database access
- `react-native`: Already installed for UI components
- `react-navigation`: Already installed for navigation

### New Dependencies

- `fast-check`: For property-based testing (dev dependency)

```bash
npm install --save-dev fast-check
```

## Migration and Deployment

### Database Migration

The database migration has already been run (messaging-tables-migration.sql). Verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages');

-- Check triggers exist
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('update_conversation_on_message', 'create_conversation_on_interest');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages');
```

### Deployment Steps

1. Verify database migration is complete
2. Install new dependencies (`fast-check`)
3. Implement messaging service
4. Implement UI components
5. Write tests (unit and property)
6. Run all tests
7. Test manually on device
8. Deploy to production

### Rollback Plan

If issues arise:
1. Revert code changes
2. Database tables can remain (they don't affect existing functionality)
3. Remove navigation to Messages tab if needed
4. Fix issues and redeploy

## Conclusion

This design provides a complete, type-safe messaging system that integrates seamlessly with the existing NeighborYield application. The implementation follows established patterns, includes comprehensive testing, and provides a solid foundation for future enhancements.
