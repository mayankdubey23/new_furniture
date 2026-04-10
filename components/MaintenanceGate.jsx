'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api/browser';

const ALLOWED_PREFIXES = ['/admin'];

export default function MaintenanceGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const isAllowedRoute =
        pathname === '/maintenance' || ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

      try {
        const response = await fetch(getApiUrl('/api/admin/settings'), { cache: 'no-store' });
        if (!response.ok) return;

        const settings = await response.json();
        if (cancelled) return;

        if (settings.maintenanceMode && !isAllowedRoute) {
          router.replace('/maintenance');
          return;
        }

        if (!settings.maintenanceMode && pathname === '/maintenance') {
          router.replace('/');
        }
      } catch {

      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
