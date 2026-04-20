import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAdminSession } from '@/lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  clearAdminSession(cookieStore);
  return NextResponse.json({ success: true });
}
