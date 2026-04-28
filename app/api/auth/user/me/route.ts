import { NextResponse, type NextRequest } from 'next/server';
import { maybeProxyExternalApiRoute } from '@/lib/api/externalRouteProxy';
import { getUserFromCookie } from '@/lib/userAuth';

export async function GET(request: NextRequest) {
  const externalResponse = await maybeProxyExternalApiRoute(request);
  if (externalResponse) {
    return externalResponse;
  }

  const user = await getUserFromCookie();

  return NextResponse.json(
    user
      ? {
          authenticated: true,
          user: { id: user.userId, name: user.name, email: user.email },
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
