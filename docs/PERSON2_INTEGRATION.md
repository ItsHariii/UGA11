# Person 2 Integration Guide - Supabase Transport Layer

This guide explains how to implement the Transport Router so the business logic layer integrates with Supabase and Nearby Connections.

## Overview

Person 3's business logic sends and receives messages through the `ITransportRouter` interface. Your job is to implement a real TransportRouter that:

- **Online mode:** Routes to Supabase (Realtime, inserts)
- **Offline mode:** Routes to Nearby Connections
- **Hybrid mode:** Uses both

## Contract: ITransportRouter

Implement this interface (from `src/mocks/MockTransportRouter.ts`):

```typescript
interface ITransportRouter {
  getMode(): ConnectivityMode;  // 'online' | 'offline' | 'hybrid' | 'disconnected'
  send(message: TransportMessage): Promise<SendResult>;
  subscribe(handler: MessageHandler): Unsubscribe;
  onModeChange(handler: (mode: ConnectivityMode) => void): Unsubscribe;
}

interface TransportMessage {
  type: MessageType;
  payload: unknown;
  targetEndpoint?: string;   // For directed messages (e.g., to specific peer)
  ttl?: number;
}

type MessageType =
  | 'share_post'
  | 'interest_ack'
  | 'interest_response'
  | 'heartbeat'
  | 'peer_discovery';
```

## Message Types and Payloads

| Message Type         | Payload Type     | When Sent                                   | Your Action                    |
|----------------------|------------------|---------------------------------------------|--------------------------------|
| `share_post`         | `SharePost`      | User creates a new food post                 | Insert into `share_posts`      |
| `interest_ack`       | `InterestAck`    | User expresses interest in a post            | Insert into `interests`        |
| `interest_response`  | `InterestResponse` | Poster accepts/declines an interest       | Update `interests.status`      |
| `heartbeat`          | `HeartbeatPayload` | Presence Manager broadcasts periodically   | Not for Supabase (mesh only)   |
| `peer_discovery`     | varies          | Mesh discovery                               | Not for Supabase (mesh only)   |

## Supabase Mapping

Use the mapper utilities from `src/utils/SupabaseMappers.ts`:

```typescript
import {
  postToSupabaseRow,
  supabaseRowToPost,
  interestToSupabaseRow,
  supabaseRowToInterest,
} from 'neighboryield-resilience';  // or your import path
```

**When sending (business logic → Supabase):**

- `share_post` payload → `postToSupabaseRow(payload)` → `supabase.from('share_posts').insert(row)`
- `interest_ack` payload → `interestToSupabaseRow(payload)` → `supabase.from('interests').insert(row)`
- `interest_response` → Update `interests` row: `supabase.from('interests').update({ status: 'accepted'|'declined' }).eq('id', interestId)`

**When receiving (Supabase Realtime → business logic):**

- `share_posts` INSERT/UPDATE → `supabaseRowToPost(row)` → `transport.subscribe` handler with `{ type: 'share_post', payload }`
- `interests` INSERT → `supabaseRowToInterest(row)` → `interestManager.receivedInterest(payload)`
- `interests` UPDATE (status change) → Build `InterestResponse` → `interestManager.receivedResponse(response)`

## User ID Handling (Important)

**Online mode:** Supabase `interests.interested_user_id` must be a UUID (from `auth.uid()`). The business logic may pass a pseudonymous identifier. Your transport layer must override before insert:

```typescript
// When handling interest_ack message for Supabase
const { data: { user } } = await supabase.auth.getUser();
const row = interestToSupabaseRow(payload as InterestAck);
row.interested_user_id = user?.id ?? payload.interestedUserId;  // Prefer auth UUID
await supabase.from('interests').insert(row);
```

**Offline mode:** No auth UUID available. Use the pseudonymous identifier or a placeholder; Person 2 should handle this in the Supabase adapter (e.g., skip Supabase when offline).

**respondToInterest:** When the poster responds, pass their auth UUID for attribution:

```typescript
const { data: { user } } = await supabase.auth.getUser();
interestManager.respondToInterest(interestId, 'accept', message, user?.id);
```

## Manager Callbacks

When Supabase Realtime delivers changes, call these manager methods:

| Source                       | Call                                                            |
|-----------------------------|------------------------------------------------------------------|
| `share_posts` INSERT/UPDATE  | Feed to `subscribe` handler: `{ type: 'share_post', payload: supabaseRowToPost(row) }` |
| `interests` INSERT           | `interestManager.receivedInterest(supabaseRowToInterest(row))`   |
| `interests` UPDATE (status)  | `interestManager.receivedResponse({ interestId, postId, response, ... })` |
| Heartbeat (mesh only)       | `presenceManager.receivedHeartbeat(endpointId, payload)`         |

## Realtime Subscriptions

Subscribe to Supabase Realtime for `share_posts` and `interests`:

```typescript
// Share posts channel
supabase
  .channel('share_posts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'share_posts' }, (payload) => {
    const post = supabaseRowToPost(payload.new);
    // Notify subscribers
    messageHandlers.forEach(h => h({ type: 'share_post', payload: post }));
  })
  .subscribe();

// Interests channel (filter by author if needed)
supabase
  .channel('interests')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interests' }, (payload) => {
    const interest = supabaseRowToInterest(payload.new);
    interestManager.receivedInterest(interest);
  })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'interests' }, (payload) => {
    const { id, post_id, status } = payload.new;
    if (status === 'accepted' || status === 'declined') {
      interestManager.receivedResponse({
        interestId: id,
        postId: post_id,
        response: status === 'accepted' ? 'accept' : 'decline',
        timestamp: Date.now(),
      });
    }
  })
  .subscribe();
```

## References

- **Schema:** [SUPABASE_SCHEMA.sql](../SUPABASE_SCHEMA.sql) – Run in Supabase SQL Editor
- **Transport interface:** [src/mocks/MockTransportRouter.ts](../src/mocks/MockTransportRouter.ts)
- **Mappers:** [src/utils/SupabaseMappers.ts](../src/utils/SupabaseMappers.ts)
- **Types:** [src/types/](../src/types/) – SharePost, InterestAck, InterestResponse

## Data Flow

```
Business Logic (InterestManager, etc.)
    │
    │ send(TransportMessage)
    ▼
TransportRouter
    │
    ├─ online  → SupabaseAdapter → postToSupabaseRow / interestToSupabaseRow → Supabase
    └─ offline → NearbyAdapter → Bluetooth payloads

Supabase Realtime
    │
    ▼
TransportRouter receives INSERT/UPDATE
    │
    │ supabaseRowToPost / supabaseRowToInterest
    ▼
interestManager.receivedInterest() / receivedResponse()
    │
    ▼
UI (Person 1) receives events via manager subscriptions
```
