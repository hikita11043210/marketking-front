import { cookies } from 'next/headers';
import { AuthTokens } from './types';

const ACCESS_TOKEN_NAME = 'access_token';
const REFRESH_TOKEN_NAME = 'refresh_token';

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/',
} as const;

export const authCookies = {
  setTokens: async (tokens: AuthTokens) => {
    const cookieStore = await cookies();
    
    cookieStore.set(ACCESS_TOKEN_NAME, tokens.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 10 // 10時間
    });

    cookieStore.set(REFRESH_TOKEN_NAME, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7 // 7日間
    });
  },

  clearTokens: async () => {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_NAME);
    cookieStore.delete(REFRESH_TOKEN_NAME);
  },

  getAccessToken: async () => {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_NAME)?.value;
  },

  getRefreshToken: async () => {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_NAME)?.value;
  }
}; 