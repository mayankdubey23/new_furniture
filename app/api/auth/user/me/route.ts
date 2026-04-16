import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/userAuth';

export async function GET() {
  const user = await getUserFromCookie();

  return NextResponse.json(
    user
      ? {
          authenticated: true,
          user: { name: user.name, email: user.email },
        }
      : {
          authenticated: false,
          user: null,
        },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
