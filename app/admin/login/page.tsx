'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    fetch('/api/auth/verify', { credentials: 'include' }).then((res) => {
      if (res.ok) router.replace('/admin');
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  const inputClass =
    'w-full rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30';
  const labelClass =
    'block mb-1.5 text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-theme-ivory px-4 dark:bg-theme-ink">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-[28rem] w-[28rem] rounded-full bg-theme-bronze/14 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-4rem] right-[-4rem] h-[22rem] w-[22rem] rounded-full bg-theme-olive/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="inline-block font-display text-[2.1rem] font-semibold tracking-[0.18em] text-theme-ink dark:text-theme-ivory"
          >
            LUXE
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">
            Admin Portal
          </p>
          <h1 className="mt-2 font-display text-2xl text-theme-ink dark:text-theme-ivory">
            Welcome back
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-[2rem] border border-theme-line/50 bg-white/80 p-8 shadow-[0_25px_80px_rgba(49,30,21,0.12)] dark:bg-white/5">
          {error && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className={labelClass}>
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-theme-ink py-3.5 text-sm font-bold uppercase tracking-[0.28em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-theme-ink dark:hover:bg-theme-bronze dark:hover:text-white"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-theme-walnut/40 dark:text-theme-ivory/30">
            Default:{' '}
            <strong className="font-semibold text-theme-bronze">admin / admin</strong>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-theme-walnut/50 dark:text-theme-ivory/40">
          <Link href="/" className="text-theme-bronze transition-colors hover:underline">
            ← Return to store
          </Link>
        </p>
      </div>
    </div>
  );
}
