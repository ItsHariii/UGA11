/**
 * Supabase client configuration for NeighborYield.
 * Uses environment variables or defaults for hackathon/demo.
 */

import 'react-native-get-random-values';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getConfig(): { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string } {
  try {
    return require('./supabase.config');
  } catch {
    return {};
  }
}

const { SUPABASE_URL: CONFIG_URL, SUPABASE_ANON_KEY: CONFIG_KEY } = getConfig();

const SUPABASE_URL_RAW =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? CONFIG_URL ?? '';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? CONFIG_KEY ?? '';

// Remove trailing slash (Supabase client can fail with it)
const SUPABASE_URL = SUPABASE_URL_RAW.replace(/\/$/, '');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[NeighborYield] Supabase URL or anon key not set. Add them in backend/lib/supabase.config.ts (copy from supabase.config.example.ts).'
  );
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export { SUPABASE_URL, SUPABASE_ANON_KEY };
