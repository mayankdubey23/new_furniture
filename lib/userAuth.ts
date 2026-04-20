import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const USER_SESSION_COOKIE = 'user-token';
export const USER_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error('JWT_SECRET is missing. Add it to .env.local and restart the dev server.');
  }

  return secret;
}

export interface UserTokenPayload {
  userId: string;
  name: string;
  email: string;
}

export function createUserToken(userId: string, name: string, email: string): string {
  return jwt.sign({ userId, name, email }, getJwtSecret(), { expiresIn: `${USER_SESSION_MAX_AGE}s` });
}

function getUserSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: USER_SESSION_MAX_AGE,
    path: '/',
    priority: 'high' as const,
  };
}

export function setUserSession(cookieStore: CookieStore, token: string) {
  cookieStore.set(USER_SESSION_COOKIE, token, getUserSessionCookieOptions());
}

export function clearUserSession(cookieStore: CookieStore) {
  cookieStore.set(USER_SESSION_COOKIE, '', {
    ...getUserSessionCookieOptions(),
    maxAge: 0,
  });
}

export async function getUserFromCookie(): Promise<UserTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, getJwtSecret()) as UserTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
