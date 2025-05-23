import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === '/auth' || path === '/auth';

  // Check if session cookie exists (default from express-session)
  const sessionCookie = request.cookies.get('connect.sid');
  const isAuthenticated = !!sessionCookie;

  // If user is logged in and trying to visit login/register page, redirect to /home
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // If user is not logged in and trying to visit protected route, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Otherwise, allow request to continue
  return NextResponse.next();
}

// ✅ Match all pages (you can narrow it if needed)
export const config = {
  matcher: [
    /*
      Protect all routes except static files like /_next, favicon, etc.
    */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
