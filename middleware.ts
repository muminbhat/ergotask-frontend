import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set(['/login', '/signup', '/api/auth/login', '/api/auth/refresh', '/api/auth/logout', '/api/auth/register']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get('access_token')?.value;
  // If visiting login or signup with an access token, redirect to dashboard
  if ((pathname === '/login' || pathname === '/signup') && access) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.startsWith('/public')) {
    return NextResponse.next();
  }
  if (!access) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico).*)'],
};


