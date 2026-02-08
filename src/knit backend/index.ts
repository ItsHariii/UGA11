/**
 * Backend (Person 2): Supabase client, Transport layer (Supabase adapter, Nearby adapter, Router, Heartbeat).
 * Import from here in the app: e.g. import { getPosts, send, start } from './backend';
 */

export { supabase } from './lib/supabase';
export * from './transport';
