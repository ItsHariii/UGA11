# NeighborYield Backend (Person 2)

This folder contains the transport layer and Supabase integration for NeighborYield.

## Contents

- **lib/** – Supabase client and config. Add `supabase.config.ts` (copy from `supabase.config.example.ts`) with your URL and anon key. If you had config in `src/lib/supabase.config.ts`, copy it to `backend/lib/supabase.config.ts`.
- **transport/** – Supabase adapter, Nearby adapter, Transport Router, Heartbeat serialization, types, schema SQL, and tests.

## App usage

The app imports from `./backend`:

```ts
import { getPosts, subscribeToPostsChannel, send, start, attachNearbyPayloadHandler, onModeChange, getMode, setCanUseMesh, subscribe } from './backend';
```

## Dependencies

- **App** must have: `src/types` (shared types), `react-native`, `@supabase/supabase-js`, `@react-native-community/netinfo`, `react-native-get-random-values`.
- **Android** native module for Nearby lives in `android/app/src/main/java/.../NearbyConnectionsModule.kt` (outside this folder).

## Teammates

1. Copy this **backend** folder into your NeighborYield app (same level as `src`, `App.tsx`).
2. Add `backend/lib/supabase.config.ts` (copy from `backend/lib/supabase.config.example.ts`) with your Supabase URL and anon key.
3. Ensure `src/types` exists and exports `SharePost`, `ConnectivityMode`, `RiskTier`, etc.
4. Point app imports to `./backend` (or `./backend/transport`, `./backend/transport/supabaseAdapter` as needed).
