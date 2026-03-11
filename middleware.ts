import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Note: Middleware runs on server, so we can't access localStorage
  // Client-side auth check is handled in page components
  // This middleware is a basic layer - full auth check happens on client
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/subscriptions/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ],
};

