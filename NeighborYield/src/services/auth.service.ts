/**
 * Authentication Service
 * Handles all Supabase authentication operations
 */

import { supabase } from '../lib/supabase';
import { RegisterData } from '../screens';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
  userIdentifier: string;
  phoneNumber?: string;
  neighborhood?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: AuthError | null;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    console.log('🔐 Attempting sign in...');
    console.log('  Email:', email);
    console.log('  Supabase URL:', supabase.supabaseUrl);
    
    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      console.log('   Error code:', authError.code);
      console.log('   Error status:', authError.status);
      
      // Provide more helpful error messages
      let userMessage = authError.message;
      if (authError.message.includes('Network request failed')) {
        userMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (authError.message.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password. Please try again.';
      }
      
      return {
        user: null,
        error: { message: userMessage, code: authError.code },
      };
    }

    if (!authData.user) {
      console.log('❌ No user data returned');
      return {
        user: null,
        error: { message: 'No user data returned' },
      };
    }

    console.log('✅ Auth successful, fetching profile...');

    // 2. Fetch user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.log('❌ Profile fetch error:', profileError.message);
      return {
        user: null,
        error: { message: 'Failed to fetch user profile', code: profileError.code },
      };
    }

    console.log('✅ Profile fetched successfully');

    // 3. Update last_seen_at
    await supabase
      .from('users')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    return {
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        username: profile.username,
        userIdentifier: profile.user_identifier,
        phoneNumber: profile.phone_number,
        neighborhood: profile.neighborhood,
      },
      error: null,
    };
  } catch (error) {
    console.log('❌ Unexpected error:', error);
    console.log('   Error type:', typeof error);
    console.log('   Error name:', error instanceof Error ? error.name : 'unknown');
    
    let userMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      console.log('   Error message:', error.message);
      console.log('   Error stack:', error.stack);
      
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        userMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else {
        userMessage = error.message;
      }
    }
    
    return {
      user: null,
      error: { message: userMessage },
    };
  }
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      return {
        user: null,
        error: { message: authError.message, code: authError.code },
      };
    }

    if (!authData.user) {
      return {
        user: null,
        error: { message: 'No user data returned' },
      };
    }

    // 2. Generate user identifier
    const { data: identifier, error: identifierError } = await supabase.rpc(
      'generate_user_identifier'
    );

    const userIdentifier =
      identifier || `Neighbor-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // 3. Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        full_name: data.fullName,
        username: data.username,
        email: data.email,
        phone_number: data.phoneNumber || null,
        neighborhood: data.neighborhood || null,
        user_identifier: userIdentifier,
      })
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        user: null,
        error: { message: 'Failed to create user profile', code: profileError.code },
      };
    }

    return {
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        username: profile.username,
        userIdentifier: profile.user_identifier,
        phoneNumber: profile.phone_number,
        neighborhood: profile.neighborhood,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message, code: error.code } };
    }
    return { error: null };
  } catch (error) {
    return {
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { user: null, error: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      return {
        user: null,
        error: { message: 'Failed to fetch user profile', code: profileError.code },
      };
    }

    return {
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        username: profile.username,
        userIdentifier: profile.user_identifier,
        phoneNumber: profile.phone_number,
        neighborhood: profile.neighborhood,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return { error: { message: error.message, code: error.code } };
    }
    return { error: null };
  } catch (error) {
    return {
      error: { message: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
}
