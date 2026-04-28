import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { maybeProxyExternalApiRoute } from '@/lib/api/externalRouteProxy';
import { clearUserSession } from '@/lib/userAuth';

export async function POST(request: NextRequest) {
  const externalResponse = await maybeProxyExternalApiRoute(request);
  if (externalResponse) {
    return externalResponse;
  }

  const cookieStore = await cookies();
  clearUserSession(cookieStore);
  return NextResponse.json({ success: true });
}
