import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/students/signin' || 
    path === '/students/signup' || 
    path === '/hostel-owners/signin' || 
    path === '/hostel-owners/signup' || 
    path === '/admin' ||
    path.startsWith('/api/');

  // Get the token from the cookies
  const hasCookie = request.cookies.has('connect.sid');

  // If the path is not public and there's no cookie, redirect to login
  if (!isPublicPath && !hasCookie) {
    return NextResponse.redirect(new URL('/students/signin', request.url));
  }

  // If the path is a login/signup page and the user is already logged in, redirect to dashboard
  if (isPublicPath && hasCookie) {
    try {
      // Check the user's role to determine where to redirect
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userRole = data.user.role;

        if (userRole === 'student') {
          return NextResponse.redirect(new URL('/students/dashboard', request.url));
        } else if (userRole === 'hostel-owner') {
          return NextResponse.redirect(new URL('/hostel-owners/dashboard', request.url));
        } else if (userRole === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      }
    } catch (error) {
      // If there's an error checking the role, just continue
      console.error('Error checking user role:', error);
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};