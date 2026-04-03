import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/userAuth';

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ name: user.name, email: user.email });
}
