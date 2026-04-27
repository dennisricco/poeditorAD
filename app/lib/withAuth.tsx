'use client';

import { useEffect, ComponentType } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();

    useEffect(() => {
      if (!loading && !user) {
        console.log('No user, redirecting to login');
        // Only redirect to login if not already on a public page
        const publicPages = ['/', '/login', '/register', '/forgot-password', '/learn-more'];
        if (!publicPages.includes(pathname)) {
          router.push('/login');
        }
      }
    }, [user, loading, router, pathname]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-poe-blue border-4 border-poe-black rounded-3xl cartoon-shadow mx-auto flex items-center justify-center animate-bounce">
              <Loader2 className="w-10 h-10 animate-spin" strokeWidth={3} />
            </div>
            <p className="text-xl font-black">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}
