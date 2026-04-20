import { NextResponse, type NextRequest } from 'next/server';
import {
  getAdminInternalPath,
  getAdminPortalBasePath,
} from '@/lib/adminPortal';

async function readMaintenanceMode(request: NextRequest) {
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

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'no-store',
      },
    });
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
