import { NextResponse } from "next/server"

export async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/auth/login" || path === "/auth/register"

  // Check if user is authenticated by making a request to the API
  const response = await fetch("http://localhost:5000/api/auth/me", {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  })

  const isAuthenticated = response.ok

  // If the path is public and user is authenticated, redirect to home
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // If the path is not public and user is not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Otherwise, continue with the request
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/auth/login", "/auth/register", "/home", "/admin-dashboard", "/hostel-owners-dashboard", "/profile"],
}
