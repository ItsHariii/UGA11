/**
 * Supabase Client Configuration
 * Handles authentication and database connections
 */

// IMPORTANT: Import URL polyfill for React Native
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Hardcoded credentials (temporary for debugging)
const supabaseUrl = 'https://jmhqkbgygoxlvxokdajv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaHFrYmd5Z294bHZ4b2tkYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTU3ODAsImV4cCI6MjA4NjA3MTc4MH0.JX56gJtYoP6yeYja7-8WoORhirZhsHksFBCMBDISff4';

// Debug logging
console.log('🔧 Supabase Config:');
console.log('  Platform:', Platform.OS);
console.log('  URL:', supabaseUrl);
console.log('  Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

// Test network connectivity
const testNetworkConnectivity = async () => {
  try {
    console.log('🌐 Testing network connectivity...');
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      timeout: 5000 
    });
    console.log('✅ Network is reachable (Google responded)');
    
    // Now test Supabase URL
    console.log('🌐 Testing Supabase URL...');
    const supabaseResponse = await fetch(supabaseUrl, { 
      method: 'HEAD',
      timeout: 5000 
    });
    console.log('✅ Supabase URL is reachable');
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error);
    console.error('   This means the emulator cannot reach external URLs');
    console.error('   Possible fixes:');
    console.error('   1. Check emulator internet connection');
    console.error('   2. Try restarting the emulator');
    console.error('   3. Check firewall/antivirus settings');
    console.error('   4. Try on a physical device');
  }
};

// Run network test on module load
testNetworkConnectivity();

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set');
} else {
  console.log('✅ Supabase credentials loaded');
}

/**
 * Supabase client instance
 * Configured for React Native with AsyncStorage for session persistence
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Helper function to get current user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Helper function to sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error.message);
    throw error;
  }
};
