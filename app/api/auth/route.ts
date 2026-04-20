import { NextRequest, NextResponse } from 'next/server';
import { login, setAdminSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { identifier, username, password } = await request.json();
    const cookieStore = await cookies();

    const token = await login(identifier || username, password);
    if (!token) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    setAdminSession(cookieStore, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

