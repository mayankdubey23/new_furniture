import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export async function verifyAdmin(request?: NextRequest) {
  try {
    const token =
      request?.cookies.get('admin-token')?.value ??
      (await cookies()).get('admin-token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { username: string };
    return decoded.username === ADMIN_USERNAME ? decoded : null;
  } catch {
    return null;
  }
}

export async function adminMiddleware(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function login(username: string, password: string) {
  if (username !== ADMIN_USERNAME) return null;
  if (password !== ADMIN_PASSWORD) return null;

  const token = jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return token;
}
