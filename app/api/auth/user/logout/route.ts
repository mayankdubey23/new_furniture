import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearUserSession } from '@/lib/userAuth';

export async function POST() {
  const cookieStore = await cookies();
  clearUserSession(cookieStore);
  return NextResponse.json({ success: true });
}
