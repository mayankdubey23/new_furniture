import { NextResponse, type NextRequest } from 'next/server';
import { maybeProxyExternalApiRoute } from '@/lib/api/externalRouteProxy';
import { isPhoneOtpConfigured } from '@/lib/phoneOtp';

export async function GET(request: NextRequest) {
  const externalResponse = await maybeProxyExternalApiRoute(request);
  if (externalResponse) {
    return externalResponse;
  }

  return NextResponse.json({ enabled: isPhoneOtpConfigured() });
}
