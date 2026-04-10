'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useUser } from '@/context/UserContext';
import { getApiUrl } from '@/lib/api/browser';

type Tab = 'login' | 'signup';
type LoginMethod = 'password' | 'otp';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  ux_mode?: 'popup' | 'redirect';
}

interface GoogleButtonConfiguration {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  shape?: 'pill' | 'rectangular' | 'circle' | 'square';
  text?:
    | 'signin_with'
    | 'signup_with'
    | 'continue_with'
    | 'signin'
    | 'signup';
  width?: number;
  logo_alignment?: 'left' | 'center';
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonConfiguration
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

const inputClass =
  'w-full rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30';

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60';

function sanitizeOtp(value: string) {
  return value.replace(/\D/g, '').slice(0, 6);
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [phoneOtpEnabled, setPhoneOtpEnabled] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSendingFor, setOtpSendingFor] = useState<'login' | 'signup' | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    phone: '',
    otpCode: '',
  });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    otpCode: '',
    password: '',
    confirm: '',
  });

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  useEffect(() => {
    let active = true;

    const loadOtpConfig = async () => {
      try {
        const response = await fetch(getApiUrl('/api/auth/user/otp/config'), {
          cache: 'no-store',
          credentials: 'include',
        });
        const data = (await response.json()) as { enabled?: boolean };
        if (!active) {
          return;
        }
        setPhoneOtpEnabled(Boolean(data.enabled));
      } catch {
        if (!active) {
          return;
        }
        setPhoneOtpEnabled(false);
      }
    };

    void loadOtpConfig();

    return () => {
      active = false;
    };
  }, []);

  const resetMessages = useCallback(() => {
    setError('');
    setInfo('');
  }, []);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    resetMessages();
  };

  const handleLoginMethodChange = (method: LoginMethod) => {
    setLoginMethod(method);
    resetMessages();
  };

  useEffect(() => {
    if (!phoneOtpEnabled && loginMethod === 'otp') {
      setLoginMethod('password');
    }
  }, [loginMethod, phoneOtpEnabled]);

  const handleGoogleSuccess = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError('Google sign-in did not return a valid credential.');
        return;
      }

      setLoading(true);
      resetMessages();

      try {
        const res = await fetch(getApiUrl('/api/auth/user/google'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
          credentials: 'include',
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Google sign-in failed. Please try again.');
          return;
        }

        await refreshUser();
        router.push('/');
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [refreshUser, resetMessages, router]
  );

  const sendOtp = useCallback(
    async (
      phone: string,
      purpose: 'login' | 'signup',
      onSuccess?: (normalizedPhone: string) => void
    ) => {
      setOtpSendingFor(purpose);
      resetMessages();

      try {
        const res = await fetch(getApiUrl('/api/auth/user/otp/send'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, purpose }),
          credentials: 'include',
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Unable to send OTP. Please try again.');
          return;
        }

        if (typeof data.phone === 'string' && onSuccess) {
          onSuccess(data.phone);
        }

        setInfo(`OTP sent to ${data.phone}. Enter the 6-digit code to continue.`);
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setOtpSendingFor(null);
      }
    },
    [resetMessages]
  );

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch(getApiUrl('/api/auth/user/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
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

  const handleOtpLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch(getApiUrl('/api/auth/user/login-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: loginForm.phone,
          otpCode: loginForm.otpCode,
        }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'OTP sign-in failed. Please try again.');
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

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    if (signupForm.password !== signupForm.confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch(getApiUrl('/api/auth/user/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          phone: phoneOtpEnabled ? signupForm.phone : '',
          otpCode: phoneOtpEnabled ? signupForm.otpCode : '',
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

  const handleSendLoginOtp = useCallback(async () => {
    await sendOtp(loginForm.phone, 'login', (normalizedPhone) => {
      setLoginForm((current) => ({ ...current, phone: normalizedPhone }));
    });
  }, [loginForm.phone, sendOtp]);

  const handleSendSignupOtp = useCallback(async () => {
    await sendOtp(signupForm.phone, 'signup', (normalizedPhone) => {
      setSignupForm((current) => ({ ...current, phone: normalizedPhone }));
    });
  }, [sendOtp, signupForm.phone]);

  useEffect(() => {
    if (!googleClientId || !googleReady || !googleButtonRef.current || !window.google) {
      return;
    }

    const buttonRoot = googleButtonRef.current;
    buttonRoot.innerHTML = '';
    const buttonWidth = Math.max(240, Math.min(buttonRoot.clientWidth || 380, 380));

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleSuccess,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: tab === 'signup' ? 'signup' : 'signin',
      ux_mode: 'popup',
    });

    window.google.accounts.id.renderButton(buttonRoot, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: tab === 'signup' ? 'signup_with' : 'signin_with',
      width: buttonWidth,
      logo_alignment: 'left',
    });

    return () => {
      buttonRoot.innerHTML = '';
      window.google?.accounts.id.cancel();
    };
  }, [googleClientId, googleReady, handleGoogleSuccess, tab]);

  return (
    <div className="relative z-10 mx-auto max-w-md">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />

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

      <div className="rounded-[2rem] border border-theme-line/50 bg-white/80 p-8 shadow-[0_25px_80px_rgba(49,30,21,0.12)] backdrop-blur-sm dark:bg-white/5">
        <div className="mb-8 flex rounded-xl border border-theme-line/50 bg-theme-ivory/40 p-1 dark:bg-white/5">
          <button
            type="button"
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
            type="button"
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

        {error ? (
          <div className="mb-5 rounded-xl border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        ) : null}

        {info ? (
          <div className="mb-5 rounded-xl border border-theme-bronze/20 bg-theme-bronze/10 px-4 py-3 text-sm text-theme-walnut dark:text-theme-ivory/80">
            {info}
          </div>
        ) : null}

        {googleClientId ? (
          <>
            <div className="mb-5">
              <div ref={googleButtonRef} className="flex min-h-[44px] justify-center" />
            </div>
            <div className="mb-6 flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-theme-walnut/45 dark:text-theme-ivory/35">
              <span className="h-px flex-1 bg-theme-line/60" />
              Or continue below
              <span className="h-px flex-1 bg-theme-line/60" />
            </div>
          </>
        ) : null}

        {tab === 'login' ? (
          <>
            {phoneOtpEnabled ? (
              <div className="mb-6 flex rounded-xl border border-theme-line/50 bg-theme-ivory/30 p-1 dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => handleLoginMethodChange('password')}
                  className={`flex-1 rounded-[0.625rem] py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    loginMethod === 'password'
                      ? 'bg-theme-bronze text-white shadow-sm'
                      : 'text-theme-walnut/60 hover:text-theme-walnut dark:text-theme-ivory/50 dark:hover:text-theme-ivory'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginMethodChange('otp')}
                  className={`flex-1 rounded-[0.625rem] py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    loginMethod === 'otp'
                      ? 'bg-theme-bronze text-white shadow-sm'
                      : 'text-theme-walnut/60 hover:text-theme-walnut dark:text-theme-ivory/50 dark:hover:text-theme-ivory'
                  }`}
                >
                  Phone OTP
                </button>
              </div>
            ) : null}

            {loginMethod === 'password' ? (
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
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, email: event.target.value }))
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
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="********"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full bg-theme-ink py-3.5 text-sm font-bold uppercase tracking-[0.28em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)] dark:hover:bg-theme-bronze dark:hover:text-white"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpLogin} className="space-y-5">
                <div>
                  <label htmlFor="login-phone" className={labelClass}>
                    Contact Number
                  </label>
                  <input
                    id="login-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={loginForm.phone}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor="login-otp" className={labelClass}>
                      OTP Code
                    </label>
                    <input
                      id="login-otp"
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={loginForm.otpCode}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          otpCode: sanitizeOtp(event.target.value),
                        }))
                      }
                      placeholder="6-digit OTP"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSendLoginOtp()}
                    disabled={loading || otpSendingFor === 'login'}
                    className="rounded-full border border-theme-line/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-theme-walnut transition hover:border-theme-bronze hover:text-theme-bronze disabled:opacity-60 dark:text-theme-ivory/70 dark:hover:text-theme-bronze"
                  >
                    {otpSendingFor === 'login' ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full bg-theme-ink py-3.5 text-sm font-bold uppercase tracking-[0.28em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)] dark:hover:bg-theme-bronze dark:hover:text-white"
                >
                  {loading ? 'Verifying OTP...' : 'Sign In with OTP'}
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-xs text-theme-walnut/50 dark:text-theme-ivory/40">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                className="font-semibold text-theme-bronze hover:underline"
              >
                Create one
              </button>
            </p>
          </>
        ) : (
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
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, name: event.target.value }))
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
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>

            {phoneOtpEnabled ? (
              <>
                <div>
                  <label htmlFor="signup-phone" className={labelClass}>
                    Contact Number
                  </label>
                  <input
                    id="signup-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={signupForm.phone}
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor="signup-otp" className={labelClass}>
                      Verify OTP
                    </label>
                    <input
                      id="signup-otp"
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={signupForm.otpCode}
                      onChange={(event) =>
                        setSignupForm((current) => ({
                          ...current,
                          otpCode: sanitizeOtp(event.target.value),
                        }))
                      }
                      placeholder="6-digit OTP"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSendSignupOtp()}
                    disabled={loading || otpSendingFor === 'signup'}
                    className="rounded-full border border-theme-line/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-theme-walnut transition hover:border-theme-bronze hover:text-theme-bronze disabled:opacity-60 dark:text-theme-ivory/70 dark:hover:text-theme-bronze"
                  >
                    {otpSendingFor === 'signup' ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </>
            ) : null}

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
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="********"
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
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, confirm: event.target.value }))
                }
                placeholder="********"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-theme-ink py-3.5 text-sm font-bold uppercase tracking-[0.28em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)] dark:hover:bg-theme-bronze dark:hover:text-white"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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
