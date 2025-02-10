import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookieOptions } from '@/lib/auth/cookies';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (request.nextUrl.pathname === '/login') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!accessToken) {
    if (refreshToken) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });

        if (response.ok) {
          const tokens = await response.json();
          const nextResponse = NextResponse.next();
          nextResponse.cookies.set('access_token', tokens.accessToken, {
            ...cookieOptions,
            maxAge: 60 * 60
          });
          return nextResponse;
        }
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 