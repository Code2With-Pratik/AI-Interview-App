import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register']

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const authToken = request.cookies.get('auth_token')

  // If user is trying to access protected route without token, redirect to login
  if (!authToken && (pathname.startsWith('/dashboard') || pathname.startsWith('/interview'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If user has token and is trying to access auth pages, redirect to dashboard
  if (authToken && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
