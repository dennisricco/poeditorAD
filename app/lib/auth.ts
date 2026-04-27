import { supabase } from './supabase-client';

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up dengan email dan password
export async function signUp({ email, password, fullName }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

// Sign in dengan email dan password
export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Reset password - Send OTP to email
export async function resetPassword(email: string) {
  // Use signInWithOtp with email type to get a 6-digit code
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create new user, only send OTP to existing users
      emailRedirectTo: undefined, // Don't include redirect URL to force OTP code instead of magic link
    },
  });
  if (error) throw error;
}

// Verify OTP and update password
export async function verifyOTPAndUpdatePassword(email: string, token: string, newPassword: string) {
  // First, verify the OTP token
  const { data, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (verifyError) throw verifyError;
  if (!data.session) throw new Error('Failed to verify OTP');

  // Then update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) throw updateError;
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}
