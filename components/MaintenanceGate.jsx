'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api/browser';
import { isAdminPortalPath } from '@/lib/adminPortal';
import {
  STOREFRONT_SYNC_CHANNEL,
  STOREFRONT_SYNC_STORAGE_KEY,
} from '@/lib/storefrontSync';

export default function MaintenanceGate() {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    const run = async (shouldRefresh = false) => {
      const currentPathname = pathnameRef.current;
      const isAllowedRoute =
        currentPathname === '/maintenance' ||
        isAdminPortalPath(currentPathname);

      try {
        const response = await fetch(getApiUrl('/api/admin/settings'), { cache: 'no-store' });
        if (!response.ok) return;

        const settings = await response.json();
        if (cancelled) return;

        if (settings.maintenanceMode && !isAllowedRoute) {
          window.location.replace('/maintenance');
          return;
        }

        if (!settings.maintenanceMode && currentPathname === '/maintenance') {
          window.location.replace('/');
          return;
        }

        if (shouldRefresh && !isAllowedRoute) {
          router.refresh();
        }
      } catch {

      }
    };

    void run();
    const intervalId = window.setInterval(() => {
      void run();
    }, 3000);
    const handleFocus = () => {
      void run(true);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void run(true);
      }
    };

    const handleStorage = (event) => {
      if (event.key !== STOREFRONT_SYNC_STORAGE_KEY || !event.newValue) {
        return;
      }

      void run(true);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let channel = null;
    if (typeof window.BroadcastChannel === 'function') {
      channel = new window.BroadcastChannel(STOREFRONT_SYNC_CHANNEL);
      channel.onmessage = () => {
        void run(true);
      };
    }

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      channel?.close();
    };
  }, [router]);

  return null;
}
