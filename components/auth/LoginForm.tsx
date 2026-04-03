'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

type Tab = 'login' | 'signup';

const inputClass =
  'w-full rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30';

const labelClass =
  'block mb-1.5 text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, refreshUser } = useUser();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }
      await refreshUser();
      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }
      await refreshUser();
      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 mx-auto max-w-md">
      {/* Logo + heading */}
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-block font-display text-[2.2rem] font-semibold tracking-[0.18em] text-theme-ink dark:text-theme-ivory"
        >
          LUXE
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.36em] text-theme-bronze">
          {tab === 'login' ? 'Welcome back' : 'Join the Collection'}
        </p>
        <h1 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">
          {tab === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h1>
      </div>

      {/* Form card */}
      <div className="rounded-[2rem] border border-theme-line/50 bg-white/80 p-8 shadow-[0_25px_80px_rgba(49,30,21,0.12)] backdrop-blur-sm dark:bg-white/5">
        {/* Tabs */}
        <div className="mb-8 flex rounded-xl border border-theme-line/50 bg-theme-ivory/40 p-1 dark:bg-white/5">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 rounded-[0.625rem] py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              tab === 'login'
                ? 'bg-theme-bronze text-white shadow-sm'
                : 'text-theme-walnut/60 hover:text-theme-walnut dark:text-theme-ivory/50 dark:hover:text-theme-ivory'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={`flex-1 rounded-[0.625rem] py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              tab === 'signup'
                ? 'bg-theme-bronze text-white shadow-sm'
                : 'text-theme-walnut/60 hover:text-theme-walnut dark:text-theme-ivory/50 dark:hover:text-theme-ivory'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Login form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-email" className={labelClass}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="login-password" className={labelClass}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((p) => ({ ...p, password: e.target.value }))
                }
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

            <p className="text-center text-xs text-theme-walnut/50 dark:text-theme-ivory/40">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                className="font-semibold text-theme-bronze hover:underline"
              >
                Create one
              </button>
            </p>
          </form>
        )}

        {/* Signup form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="signup-name" className={labelClass}>
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                value={signupForm.name}
                onChange={(e) =>
                  setSignupForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="signup-email" className={labelClass}>
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="signup-password" className={labelClass}>
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                autoComplete="new-password"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="signup-confirm" className={labelClass}>
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={signupForm.confirm}
                onChange={(e) =>
                  setSignupForm((p) => ({ ...p, confirm: e.target.value }))
                }
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-theme-ink py-3.5 text-sm font-bold uppercase tracking-[0.28em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-theme-ink dark:hover:bg-theme-bronze dark:hover:text-white"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>

            <p className="text-center text-xs text-theme-walnut/50 dark:text-theme-ivory/40">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className="font-semibold text-theme-bronze hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
