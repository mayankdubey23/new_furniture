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
  const inFlightRef = useRef(false);
  const lastRequestAtRef = useRef(0);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    const run = async ({ shouldRefresh = false, force = false } = {}) => {
      const currentPathname = pathnameRef.current;
      const isAllowedRoute =
        currentPathname === '/maintenance' ||
        isAdminPortalPath(currentPathname);
      const now = Date.now();

      if (cancelled) {
        return;
      }

      if (inFlightRef.current) {
        return;
      }

      if (!force && now - lastRequestAtRef.current < 1200) {
        return;
      }

      inFlightRef.current = true;
      lastRequestAtRef.current = now;

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
      } finally {
        inFlightRef.current = false;
      }
    };

    void run({ force: true });
    const handleFocus = () => {
      void run();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void run();
      }
    };

    const handleStorage = (event) => {
      if (event.key !== STOREFRONT_SYNC_STORAGE_KEY || !event.newValue) {
        return;
      }

      void run({ shouldRefresh: true });
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let channel = null;
    if (typeof window.BroadcastChannel === 'function') {
      channel = new window.BroadcastChannel(STOREFRONT_SYNC_CHANNEL);
      channel.onmessage = () => {
        void run({ shouldRefresh: true });
      };
    }

    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      channel?.close();
    };
  }, [pathname, router]);

  return null;
}
