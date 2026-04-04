'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Box,
  LogOut,
  Menu,
  Sparkles,
  ShoppingBag,
  Store,
  Users,
  X,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin#products', label: 'Products', icon: Box },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin#customers', label: 'Customers', icon: Users },
  { href: '/admin/customizations', label: 'Customizations', icon: Sparkles },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hash, setHash] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    fetch('/api/auth/verify', { credentials: 'include' }).then((res) => {
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });
  }, [router, isLoginPage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncHash = () => setHash(window.location.hash);
    syncHash();

    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [pathname]);

  const currentSection = useMemo(() => {
    if (pathname === '/admin/orders') return 'Orders';
    if (pathname === '/admin/customizations') return 'Customizations';
    if (pathname === '/admin' && hash === '#products') return 'Products';
    if (pathname === '/admin' && hash === '#customers') return 'Customers';
    return 'Dashboard';
  }, [hash, pathname]);

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8f2e8_0%,#efe2d0_100%)] dark:bg-[linear-gradient(180deg,#181310_0%,#0f0b09_100%)]">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-theme-walnut/60 dark:text-theme-ivory/60">
          Verifying Access
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.12),transparent_24%),linear-gradient(180deg,#fbf7f1_0%,#f2e7d7_100%)] text-theme-walnut dark:bg-[radial-gradient(circle_at_top_left,rgba(199,140,92,0.14),transparent_20%),linear-gradient(180deg,#181310_0%,#0f0b09_100%)] dark:text-theme-ivory">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(79,53,40,0.03)_1px,transparent_1px),linear-gradient(rgba(79,53,40,0.03)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40" />

      <div className="relative mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className={`fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] border-r border-theme-line/60 bg-[rgba(251,247,241,0.92)] p-6 shadow-[0_30px_80px_rgba(49,30,21,0.16)] backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-[rgba(18,14,11,0.92)] lg:static lg:w-auto lg:max-w-none lg:translate-x-0 lg:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between">
            <Link href="/admin" className="font-display text-[2rem] tracking-[0.18em] text-theme-ink dark:text-theme-ivory">
              LUXE
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="rounded-full border border-theme-line/50 p-2 lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-theme-bronze">
            Atelier Control Room
          </p>

          <div className="mt-10 rounded-[2rem] border border-theme-line/50 bg-white/65 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.08)] dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-theme-bronze">Administrator</p>
            <p className="mt-3 font-display text-2xl text-theme-ink dark:text-theme-ivory">Studio Access</p>
            <p className="mt-2 text-sm leading-7 text-theme-walnut/70 dark:text-theme-ivory/62">
              Manage collections, customers, orders, and storefront controls from one refined workspace.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.label === 'Overview'
                  ? pathname === '/admin'
                  : item.label === 'Products'
                    ? pathname === '/admin' && hash === '#products'
                    : item.label === 'Customers'
                      ? pathname === '/admin' && hash === '#customers'
                      : item.href === '/admin/orders'
                        ? pathname.startsWith('/admin/orders')
                        : item.href === '/admin/customizations'
                          ? pathname.startsWith('/admin/customizations')
                          : false;

              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-theme-ink text-white shadow-[0_14px_34px_rgba(26,22,19,0.18)] dark:bg-white dark:text-[var(--theme-contrast-ink)]'
                      : 'text-theme-walnut/75 hover:bg-white/70 hover:text-theme-bronze dark:text-theme-ivory/72 dark:hover:bg-white/6'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[1.8rem] border border-theme-line/50 bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(247,239,228,0.78))] p-5 dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.72))]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">Permissions</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Products', 'Orders', 'Customers', 'Customizations', 'Settings'].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-theme-line/60 bg-white/72 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-theme-walnut/70 dark:bg-white/6 dark:text-theme-ivory/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/70 transition hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/70"
            >
              <Store className="h-3.5 w-3.5" />
              Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-bronze dark:bg-white dark:text-[var(--theme-contrast-ink)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </aside>

        {menuOpen ? (
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-black/35 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}

        <div className="relative min-w-0">
          <header className="sticky top-0 z-30 border-b border-theme-line/60 bg-[rgba(251,247,241,0.72)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(18,14,11,0.72)]">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="rounded-full border border-theme-line/60 p-2 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
                    {currentSection}
                  </p>
                  <h1 className="font-display text-2xl text-theme-ink dark:text-theme-ivory">
                    LUXE Admin Panel
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/70 dark:bg-white/6 dark:text-theme-ivory/70 md:block">
                  Secure Session Active
                </div>
                <ThemeToggle scrolled />
              </div>
            </div>
          </header>

          <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
