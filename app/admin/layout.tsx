'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    fetch('/api/auth/verify', { credentials: 'include' }).then((res) => {
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });
  }, [router, isLoginPage]);

  // Login page: skip all auth UI, render standalone
  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-theme-ivory dark:bg-theme-ink">
        <p className="text-sm font-semibold uppercase tracking-widest text-theme-walnut/60 dark:text-theme-ivory/60">
          Verifying…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--theme-mist)_0%,var(--theme-ivory)_100%)] text-theme-walnut dark:bg-[linear-gradient(180deg,#181310_0%,#0f0b09_100%)] dark:text-theme-ivory">
      <nav className="sticky top-0 z-40 border-b border-theme-line/70 bg-[rgba(251,247,241,0.9)] shadow-[0_10px_40px_rgba(49,30,21,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(18,14,11,0.9)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/admin"
              className="font-display text-xl font-semibold tracking-widest text-theme-ink dark:text-theme-ivory"
            >
              LUXE <span className="text-sm font-sans font-medium tracking-normal text-theme-bronze">Admin</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm font-medium text-theme-walnut/80 transition-colors hover:text-theme-bronze dark:text-theme-ivory/80 dark:hover:text-theme-bronze"
              >
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-theme-walnut/80 transition-colors hover:text-theme-bronze dark:text-theme-ivory/80 dark:hover:text-theme-bronze"
              >
                Orders
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-theme-walnut/80 transition-colors hover:text-theme-bronze dark:text-theme-ivory/80 dark:hover:text-theme-bronze"
              >
                ← Store
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-theme-line/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-theme-walnut/80 transition-all hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/80 dark:hover:text-theme-bronze"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
