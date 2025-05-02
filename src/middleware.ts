import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookieOptions } from '@/lib/auth/cookies';

const API_BASE = process.env.BACKEND_URL?.replace('localhost', '127.0.0.1');

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (request.nextUrl.pathname === '/login') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!accessToken) {
    if (refreshToken) {
      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/refresh/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (response.ok) {
          const tokens = await response.json();
          const nextResponse = NextResponse.next();
          nextResponse.cookies.set('accessToken', tokens.accessToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 10
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