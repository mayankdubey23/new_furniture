import { type NextRequest } from 'next/server';
import {
  externalApiRequiredResponse,
  maybeProxyExternalApiRoute,
} from '@/lib/api/externalRouteProxy';

export async function POST(request: NextRequest) {
  const externalResponse = await maybeProxyExternalApiRoute(request);
  return externalResponse ?? externalApiRequiredResponse('Customer signup');
}
