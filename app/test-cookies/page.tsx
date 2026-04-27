'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-client';

export default function TestCookiesPage() {
  const [cookies, setCookies] = useState<string[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get all cookies
    const allCookies = document.cookie.split('; ');
    setCookies(allCookies);

    // Get session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  const handleLogin = async () => {
    const email = prompt('Enter email:');
    const password = prompt('Enter password:');
    
    if (!email || !password) {
      alert('Email and password required');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Login result:', data);
      
      // Wait and check cookies
      setTimeout(() => {
        const newCookies = document.cookie.split('; ');
        setCookies(newCookies);
        console.log('Cookies after login:', newCookies);
        
        // Refresh session
        supabase.auth.getSession().then(({ data }) => {
          setSession(data.session);
        });
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const handleRedirect = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">🍪 Cookie Test Page</h1>

        {/* Session Info */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Session Status</h2>
          <div className="bg-gray-50 p-4 rounded border">
            {session ? (
              <div>
                <p className="text-green-600 font-bold mb-2">✅ Session Active</p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>User ID:</strong> {session.user.id}</p>
              </div>
            ) : (
              <p className="text-red-600 font-bold">❌ No Session</p>
            )}
          </div>
        </div>

        {/* Cookies */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Browser Cookies ({cookies.length})</h2>
          <div className="bg-gray-50 p-4 rounded border max-h-96 overflow-auto">
            {cookies.length > 0 ? (
              <ul className="space-y-2">
                {cookies.map((cookie, index) => (
                  <li key={index} className="font-mono text-sm">
                    {cookie.includes('auth-token') ? (
                      <span className="text-green-600 font-bold">✅ {cookie}</span>
                    ) : (
                      <span>{cookie}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No cookies found</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            Test Login
          </button>
          <button
            onClick={handleRedirect}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
          >
            Try Redirect to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700"
          >
            Refresh Page
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <h3 className="font-bold mb-2">📝 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Test Login" to login</li>
            <li>Check if auth-token cookie appears (green ✅)</li>
            <li>Click "Try Redirect to Dashboard"</li>
            <li>Should redirect to dashboard if cookie exists</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
