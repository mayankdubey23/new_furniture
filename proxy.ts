import { NextResponse, type NextRequest } from 'next/server';
import { mapLocalApiPathToExternalPath } from '@/lib/api/externalRoutes';
import {
  getAdminInternalPath,
  getAdminPortalAliasBasePaths,
  getAdminPortalBasePath,
  getAdminPortalPath,
} from '@/lib/adminPortal';

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = String(process.env[name] || '').trim();
    if (value) {
      return value;
    }
  }

  return '';
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

function getProxyDataSource() {
  return readEnv('DATA_SOURCE', 'NEXT_PUBLIC_DATA_SOURCE').toLowerCase() || 'internal';
}

function getExternalApiBaseUrl() {
  return normalizeBaseUrl(
    readEnv('EXTERNAL_API_BASE_URL', 'NEXT_PUBLIC_EXTERNAL_API_BASE_URL')
  );
}

function getExternalApiPublicKey() {
  return readEnv('PUBLIC_KEY', 'EXTERNAL_API_BEARER_TOKEN', 'API_BEARER_TOKEN');
}

function isLocalAdminAuthPath(pathname: string) {
  if (pathname === '/api/auth') {
    return true;
  }

  if (!pathname.startsWith('/api/auth/')) {
    return false;
  }

  return !pathname.startsWith('/api/auth/user/');
}

async function maybeRewriteExternalApiRequest(request: NextRequest) {
  if (getProxyDataSource() !== 'external') {
    return null;
  }

  const mappedPath = mapLocalApiPathToExternalPath(request.nextUrl.pathname);
  const baseUrl = getExternalApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const targetUrl = new URL(`${baseUrl}${mappedPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('host');
  requestHeaders.delete('content-length');

  const publicKey = getExternalApiPublicKey();
  if (publicKey) {
    requestHeaders.set('authorization', `Bearer ${publicKey}`);
    requestHeaders.set('x-public-key', publicKey);
    requestHeaders.set('public-key', publicKey);
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    try {
      const upstreamResponse = await fetch(targetUrl, {
        method: request.method,
        headers: requestHeaders,
        cache: 'no-store',
        redirect: 'manual',
      });
      const responseHeaders = new Headers(upstreamResponse.headers);
      responseHeaders.set('Cache-Control', 'no-store');

      return new NextResponse(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error('External API request failed:', targetUrl.toString(), error);

      return NextResponse.json(
        {
          error:
            'External API is unavailable. Check EXTERNAL_API_BASE_URL or start the backend server.',
        },
        {
          status: 502,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }
  }

  const response = NextResponse.rewrite(targetUrl, {
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

async function readMaintenanceMode(request: NextRequest) {
  if (getProxyDataSource() === 'external') {
    return false;
  }

  try {
    const response = await fetch(new URL('/api/admin/settings', request.url), {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const settings = (await response.json()) as { maintenanceMode?: boolean };
    return Boolean(settings.maintenanceMode);
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const portalBasePath = getAdminPortalBasePath();
  const legacyPortalBasePath = getAdminPortalAliasBasePaths().find(
    (candidate) =>
      candidate !== portalBasePath &&
      (pathname === candidate || pathname.startsWith(`${candidate}/`))
  );

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'no-store',
      },
    });
  }

  if (legacyPortalBasePath) {
    const redirectUrl = request.nextUrl.clone();
    const suffix = pathname.slice(legacyPortalBasePath.length);
    redirectUrl.pathname = getAdminPortalPath(suffix);

    const response = NextResponse.redirect(redirectUrl);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  if (pathname === portalBasePath || pathname.startsWith(`${portalBasePath}/`)) {
    const rewriteUrl = request.nextUrl.clone();
    const suffix = pathname.slice(portalBasePath.length);
    rewriteUrl.pathname = getAdminInternalPath(suffix);

    const response = NextResponse.rewrite(rewriteUrl);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  if (pathname.startsWith('/api')) {
    if (isLocalAdminAuthPath(pathname)) {
      return NextResponse.next();
    }

    const externalApiResponse = await maybeRewriteExternalApiRequest(request);

    if (externalApiResponse) {
      return externalApiResponse;
    }

    return NextResponse.next();
  }

  const maintenanceMode = await readMaintenanceMode(request);

  if (maintenanceMode && pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  if (!maintenanceMode && pathname === '/maintenance') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
