import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define protected routes by role
  const adminRoutes = ['/admin', '/admin-dashboard', '/admin-dashboard/students', '/admin-dashboard/hostels', '/admin-dashboard/bookings', '/admin-dashboard/payments', '/admin-dashboard/reports', '/admin-dashboard/settings', '/admin-dashboard/reviews', '/admin-dashboard/users'];

  const studentRoutes = ['/students', '/student/profile', '/student/bookings'];
  const hostelOwnerRoutes = ['/hostel-owner', '/hostel-owner/profile', '/hostel-owner/hostels', '/hostel-owner/bookings', '/hostel-owner/payments', '/hostel-owner/reviews', '/hostel-owner/settings', '/hostel-owner-login', '/hostel-owner-registration'];
  const protectedRoutes = [...adminRoutes, ...studentRoutes, ...hostelOwnerRoutes];
  
  // Define public routes
  const publicRoutes = ['/'];
  
  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // Get the session cookie
  const session = request.cookies.get('connect.sid');
  
  // If the route is protected and there's no session, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // For role-based access, you'll need to verify the session on the server
  // This is a simplified example - in a real app, you'd decode the session or make an API call
  
  // For admin routes
  if (adminRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    // Check if user is admin (this would be a server call in a real app)
    const isAdmin = await checkUserRole(request, 'admin');
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  // For student routes
  if (studentRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    const isStudent = await checkUserRole(request, 'student');
    if (!isStudent) {
      return NextResponse.redirect(new URL('/students', request.url));
    }
  }
  
  // For hostel owner routes
  if (hostelOwnerRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    const isHostelOwner = await checkUserRole(request, 'hostel-owner');
    if (!isHostelOwner) {
      return NextResponse.redirect(new URL('/hostel-owner-login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Helper function to check user role (in a real app, this would verify with your backend)
async function checkUserRole(request, requiredRole) {
  try {
    // Make an API call to your backend to verify the session and role
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: {
        Cookie: request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.user && data.user.role === requiredRole;
  } catch (error) {
    return false;
  }
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, etc.
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};