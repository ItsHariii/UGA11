# What Happens When You Click "I'm Interested" 🤔

## The Complete Flow

Here's exactly what happens when you tap the "I'm Interested" button on a post:

### 1. **Button Press** 👆
Location: `DualModeFeedCard.tsx` or `FeedList.tsx`

```typescript
<InterestedButton 
  state={interestState} 
  onPress={handleInterestPress} 
/>
```

The button triggers `handleInterestPress` which calls:
```typescript
onInterestPress(post.id)
```

---

### 2. **Handler in App.tsx** 📱
Location: `App.tsx` - Line ~220

```typescript
const handleInterestPress = useCallback(async (postId: string) => {
  if (!currentUser) {
    Alert.alert('Error', 'You must be logged in to express interest');
    return;
  }

  const { interest, error } = await expressInterest(
    postId, 
    currentUser.id, 
    currentUser.userIdentifier
  );
  
  if (error) {
    Alert.alert('Error', 'Failed to express interest: ' + error.message);
  } else {
    Alert.alert('Success', 'Your interest has been sent to the post author!');
    console.log('Interest expressed:', interest);
  }
}, [currentUser]);
```

**What it does:**
- ✅ Checks if you're logged in
- ✅ Calls the `expressInterest` service function
- ✅ Shows success or error alert
- ✅ Logs the result

---

### 3. **Service Call** 🔧
Location: `src/services/interests.service.ts`

```typescript
export async function expressInterest(
  postId: string,
  userId: string,
  userIdentifier: string
): Promise<{ interest: InterestAck | null; error: InterestsError | null }> {
  try {
    const { data, error } = await supabase
      .from('interests')
      .insert({
        post_id: postId,
        interested_user_id: userId,
        interested_user_identifier: userIdentifier,
        source: 'supabase',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return { interest: null, error: { message: error.message, code: error.code } };
    }

    const interest: InterestAck = {
      id: data.id,
      postId: data.post_id,
      interestedUserId: data.interested_user_id,
      interestedUserIdentifier: data.interested_user_identifier,
      timestamp: new Date(data.created_at).getTime(),
      source: 'supabase',
      status: data.status as 'pending' | 'accepted' | 'declined',
    };

    return { interest, error: null };
  } catch (error) {
    return {
      interest: null,
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}
```

**What it does:**
- 📝 Creates a new row in the `interests` table in Supabase
- 📝 Saves: post_id, your user_id, your user_identifier, status='pending'
- 📝 Returns the created interest object
- ❌ Returns error if something goes wrong

---

### 4. **Database Record Created** 💾
Location: Supabase `interests` table

A new row is inserted:
```sql
INSERT INTO interests (
  post_id,
  interested_user_id,
  interested_user_identifier,
  source,
  status,
  created_at
) VALUES (
  'c138b157-c3c1-4c83-b983-785570ede1aa',  -- The post ID
  '2473f6ed-f6b0-4c86-9b6c-8cc6dc05e71c',  -- Your user ID
  'Neighbor-NVBF',                          -- Your identifier
  'supabase',
  'pending',
  '2026-02-07 21:05:53'
);
```

---

### 5. **Real-time Update** ⚡
Location: Supabase Realtime

Because the app subscribes to interest updates, the post author's app receives a real-time notification:

```typescript
// In App.tsx - Line ~180
const subscription = subscribeToInterestUpdates(
  currentUser.id,
  (newInterest) => {
    console.log('New interest received');
    setInterests(prev => [newInterest, ...prev]);
  },
  (updatedInterest) => {
    console.log('Interest updated');
    setInterests(prev => prev.map(i => i.id === updatedInterest.id ? updatedInterest : i));
  }
);
```

**What happens:**
- 🔔 Post author's app receives the new interest immediately
- 🔔 Interest is added to their interests list
- 🔔 Notification card appears at top of their feed

---

### 6. **Post Author Sees Notification** 👀
Location: `App.tsx` - Feed screen

```typescript
{interests.filter(i => i.status === 'pending').length > 0 && (
  <View style={styles.interestContainer}>
    {interests
      .filter(i => i.status === 'pending')
      .slice(0, 1)
      .map(interest => {
        const post = posts.find(p => p.id === interest.postId);
        return (
          <InterestNotificationCard
            key={interest.id}
            interest={interest}
            postTitle={post?.title || 'Unknown Post'}
            onAccept={async () => {
              const { error } = await updateInterestStatus(interest.id, 'accepted');
              if (error) {
                Alert.alert('Error', 'Failed to accept interest');
              } else {
                Alert.alert('Success', 'Interest accepted!');
                handleRefresh();
              }
            }}
            onDecline={async () => {
              const { error } = await updateInterestStatus(interest.id, 'declined');
              if (error) {
                Alert.alert('Error', 'Failed to decline interest');
              } else {
                Alert.alert('Success', 'Interest declined');
                handleRefresh();
              }
            }}
          />
        );
      })}
  </View>
)}
```

**What they see:**
- 📬 A notification card at the top of the feed
- 📬 Shows: "Neighbor-NVBF is interested in Fresh Garden Tomatoes"
- 📬 Two buttons: "Accept" and "Decline"

---

### 7. **Post Author Responds** ✅ or ❌
Location: `InterestNotificationCard.tsx`

When they tap Accept or Decline:

```typescript
const { error } = await updateInterestStatus(interest.id, 'accepted');
// or
const { error } = await updateInterestStatus(interest.id, 'declined');
```

This updates the database:
```sql
UPDATE interests 
SET 
  status = 'accepted',  -- or 'declined'
  responded_at = NOW()
WHERE id = 'interest-id';
```

---

### 8. **You Get Notified** 🎉
Location: Real-time subscription

Your app receives the update:
```typescript
(updatedInterest) => {
  console.log('Interest updated');
  setInterests(prev => prev.map(i => i.id === updatedInterest.id ? updatedInterest : i));
}
```

**What you see:**
- The interest status changes from 'pending' to 'accepted' or 'declined'
- (Future feature: You could show a notification or message)

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. You tap "I'm Interested" button                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. handleInterestPress() in App.tsx                         │
│    - Checks if logged in                                    │
│    - Calls expressInterest() service                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. expressInterest() in interests.service.ts                │
│    - Inserts row into Supabase 'interests' table            │
│    - Returns interest object                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Supabase Database                                        │
│    - New row created with status='pending'                  │
│    - Triggers real-time event                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Real-time Subscription                                   │
│    - Post author's app receives notification                │
│    - Interest added to their interests list                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Post Author's Feed                                       │
│    - InterestNotificationCard appears                       │
│    - Shows your identifier and post title                   │
│    - Accept/Decline buttons                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Author Responds (Accept/Decline)                         │
│    - updateInterestStatus() called                          │
│    - Database updated                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. You Get Update                                           │
│    - Real-time subscription receives update                 │
│    - Interest status changes in your app                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `interests` Table
```sql
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES share_posts(id) ON DELETE CASCADE,
  interested_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interested_user_identifier TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'supabase',
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'accepted', 'declined'
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);
```

---

## Summary

When you click "I'm Interested":

1. ✅ Your interest is saved to Supabase database
2. ✅ Post author gets real-time notification
3. ✅ They can accept or decline
4. ✅ You get real-time update of their response
5. ✅ All data persists across app restarts

It's a complete, real-time, database-backed interest system! 🎉
