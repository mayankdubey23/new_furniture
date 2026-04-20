import { NextResponse } from 'next/server';
import { getAdminAuthStatus } from '@/lib/auth';

export async function GET() {
  try {
    const status = await getAdminAuthStatus();
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Admin auth status failed:', error);
    return NextResponse.json(
      { error: 'Unable to load admin security status.' },
      { status: 500 }
    );
  }
}

