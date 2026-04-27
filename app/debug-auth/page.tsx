'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-client';
import { useAuth } from '../lib/AuthProvider';
import Link from 'next/link';

export default function DebugAuthPage() {
  const { user, loading } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Session data:', data);
      console.log('Session error:', error);
      setSession(data.session);
    });

    // Check cookies
    if (typeof document !== 'undefined') {
      const allCookies = document.cookie;
      setCookies(allCookies);
      
      // Log specific Supabase cookie
      const supabaseCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('sb-'));
      console.log('Supabase cookie:', supabaseCookie);
    }

    // Check env vars
    setEnvVars({
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">🔍 Auth Debug Page</h1>

          {/* Environment Variables */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-blue-600">Environment Variables</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <pre className="text-sm">{JSON.stringify(envVars, null, 2)}</pre>
            </div>
          </div>

          {/* Auth Context */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-green-600">Auth Context (useAuth)</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}</p>
              {user && (
                <pre className="mt-2 text-sm">{JSON.stringify(user, null, 2)}</pre>
              )}
            </div>
          </div>

          {/* Session */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-purple-600">Supabase Session</h2>
            <div className="bg-gray-50 p-4 rounded border">
              {session ? (
                <>
                  <p className="text-green-600 font-bold mb-2">✅ Session Found</p>
                  <pre className="text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
                </>
              ) : (
                <p className="text-red-600 font-bold">❌ No Session</p>
              )}
            </div>
          </div>

          {/* Cookies */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-orange-600">Browser Cookies</h2>
            <div className="bg-gray-50 p-4 rounded border">
              {cookies ? (
                <pre className="text-sm overflow-auto whitespace-pre-wrap">{cookies}</pre>
              ) : (
                <p className="text-red-600">No cookies found</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
              Go to Login
            </Link>
            <Link href="/dashboard" className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
