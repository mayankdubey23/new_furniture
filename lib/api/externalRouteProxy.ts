import 'server-only';

import { NextResponse, type NextRequest } from 'next/server';
import { mapLocalApiPathToExternalPath } from '@/lib/api/externalRoutes';
import {
  getServerApiBaseUrl,
  getServerApiHeaders,
  getServerDataSource,
} from '@/lib/api/server';

function hasRequestBody(method: string) {
  return method !== 'GET' && method !== 'HEAD';
}

export async function maybeProxyExternalApiRoute(request: NextRequest) {
  if (getServerDataSource() !== 'external') {
    return null;
  }

  const baseUrl = getServerApiBaseUrl('external');
  if (!baseUrl) {
    return NextResponse.json(
      { error: 'External API base URL is not configured.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const targetPath = mapLocalApiPathToExternalPath(request.nextUrl.pathname);
  const targetUrl = new URL(`${baseUrl}${targetPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: getServerApiHeaders('external', headers),
      body: hasRequestBody(request.method) ? await request.text() : undefined,
      cache: 'no-store',
      redirect: 'manual',
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set('Cache-Control', 'no-store');

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('External API route proxy failed:', targetUrl.toString(), error);

    return NextResponse.json(
      {
        error:
          'External API is unavailable. Check EXTERNAL_API_BASE_URL or start the backend server.',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export function externalApiRequiredResponse(feature = 'This feature') {
  return NextResponse.json(
    {
      error: `${feature} requires the external backend API. Set DATA_SOURCE=external and EXTERNAL_API_BASE_URL, then restart Next.js.`,
    },
    { status: 502, headers: { 'Cache-Control': 'no-store' } }
  );
}
