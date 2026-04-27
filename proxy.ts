import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/project');
  const isAuthRoute = path === '/login' || path === '/register';

  // Supabase stores auth token in a cookie with format: sb-{project-ref}-auth-token
  // We need to check all cookies that start with 'sb-' and contain 'auth-token'
  let hasSession = false;
  
  request.cookies.getAll().forEach(cookie => {
    if (cookie.name.includes('auth-token')) {
      hasSession = true;
      console.log('Found auth cookie:', cookie.name);
    }
  });

  console.log('Proxy check:', { path, hasSession, isProtectedRoute, isAuthRoute });

  // TEMPORARILY DISABLED - Using client-side protection instead
  // Redirect to login if accessing protected route without session
  // if (isProtectedRoute && !hasSession) {
  //   console.log('Redirecting to login - no session');
  //   const loginUrl = new URL('/login', request.url);
  //   return NextResponse.redirect(loginUrl);
  // }

  // Redirect to dashboard if accessing auth pages with session
  // if (isAuthRoute && hasSession) {
  //   console.log('Redirecting to dashboard - has session');
  //   const dashboardUrl = new URL('/dashboard', request.url);
  //   return NextResponse.redirect(dashboardUrl);
  // }

  return NextResponse.next();
}

// Configure which routes to run proxy on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/project/:path*',
    '/login',
    '/register',
  ],
};
