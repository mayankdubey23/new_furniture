import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface UserTokenPayload {
  userId: string;
  name: string;
  email: string;
}

export function createUserToken(userId: string, name: string, email: string): string {
  return jwt.sign({ userId, name, email }, JWT_SECRET, { expiresIn: '7d' });
}

export async function getUserFromCookie(): Promise<UserTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user-token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as UserTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
