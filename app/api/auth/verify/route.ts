import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, username: user.username });
}
