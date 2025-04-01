// middleware.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Paths that require authentication
const PROTECTED_PATHS = [
  '/hostel-owner/dashboard',
  '/hostel-owner/profile',
  '/hostel-owner/manage-hostel',
  '/api/hostel-owner/'
];

// Paths exempt from authentication
const PUBLIC_PATHS = [
  '/api/auth/register/hostel-owner',
  '/api/auth/login',
  '/hostel-owner/signin',
  '/registration-success'
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedRoute = PROTECTED_PATHS.some(path => 
    pathname.startsWith(path)
  );
  
  // Check if the path is public
  const isPublicRoute = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path)
  );
  
  // If it's not a protected route, allow access
  if (!isProtectedRoute || isPublicRoute) {
    return NextResponse.next();
  }
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If no token, redirect to login
  if (!token) {
    const url = new URL('/hostel-owner/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Verify token
  const decoded = verifyToken(token);
  
  // If token is invalid, redirect to login
  if (!decoded) {
    const url = new URL('/hostel-owner/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Token is valid, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/hostel-owner/:path*', 
    '/api/hostel-owner/:path*'
  ]
};