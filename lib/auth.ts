import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // bcrypt.hashSync('admin', 10)

export async function verifyAdmin(request: NextRequest) {
  try {
    const token = cookies().get('admin-token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { username: string };
    return decoded.username === ADMIN_USERNAME ? decoded : null;
  } catch {
    return null;
  }
}

export function adminMiddleware(request: NextRequest) {
  const user = verifyAdmin(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null; // ok
}

export async function login(username: string, password: string) {
  if (username !== ADMIN_USERNAME) return null;

  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isValid) return null;

  const token = jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return token;
}

