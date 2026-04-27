import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/app/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client untuk browser (menggunakan anon key)
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Client untuk server-side dengan service role (untuk operasi admin)
export const supabaseAdmin = createSupabaseClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

/**
 * Create a Supabase client for server-side operations (API routes, Server Components)
 * This client reads the auth token from cookies
 */
export async function createClient() {
  const cookieStore = await cookies();
  
  // Get all Supabase auth cookies
  const allCookies = cookieStore.getAll();
  
  // Find the access token cookie
  const accessTokenCookie = allCookies.find(cookie => 
    cookie.name.includes('access-token') || cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  );
  
  const refreshTokenCookie = allCookies.find(cookie => 
    cookie.name.includes('refresh-token')
  );

  return createSupabaseClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: accessTokenCookie ? {
          Authorization: `Bearer ${accessTokenCookie.value}`,
        } : {},
      },
    }
  );
}
