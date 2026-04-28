'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { getApiUrl } from '@/lib/api/browser';
import { SITE_NAME } from '@/lib/brand';

type Tab = 'login' | 'signup';
type LoginMethod = 'password' | 'otp';
 
interface LoginFormProps {
  googleConfigured?: boolean;
}

const inputClass =
  'w-full rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30';

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60';

function sanitizeOtp(value: string) {
  return value.replace(/\D/g, '').slice(0, 6);
}

const ENGLISH_NAME_PATTERN = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeEnglishName(value: string) {
  return value
    .replace(/[^A-Za-z\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/g, '')
    .slice(0, 60);
}

function sanitizeEmail(value: string) {
  return value.replace(/\s+/g, '').toLowerCase().slice(0, 120);
}

function isEnglishName(value: string) {
  return ENGLISH_NAME_PATTERN.test(value.trim());
}

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

function getGoogleAuthErrorMessage(errorCode: string | null) {
  switch (errorCode) {
    case 'google_not_configured':
      return 'Google sign-in is not configured yet.';
    case 'google_cancelled':
      return 'Google sign-in was cancelled before it could finish.';
    case 'google_state_invalid':
      return 'Your Google sign-in session expired. Please try again.';
    case 'google_missing_code':
      return 'Google did not return a sign-in code. Please try again.';
    case 'google_link_existing_account':
      return 'This email already has an account. Please sign in with your password first before using Google.';
    case 'google_verification_failed':
      return 'Google sign-in could not be verified.';
    case 'google_failed':
      return 'Google sign-in failed. Please try again.';
    default:
      return '';
  }
}

function normalizeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }

  return value;
}

type AuthApiPayload = {
  code?: string;
  error?: string;
  enabled?: boolean;
  phone?: string;
};

const BACKEND_UNAVAILABLE_MESSAGE =
  'Customer account login needs the backend API. Start the backend server, or set NEXT_PUBLIC_EXTERNAL_API_BASE_URL to the deployed backend URL and restart Next.js.';

async function readAuthApiPayload(response: Response): Promise<AuthApiPayload> {
  const text = await response.text().catch(() => '');

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as AuthApiPayload;
  } catch {
    return { error: text };
  }
}

function getAuthApiError(
  response: Response,
  payload: AuthApiPayload,
  fallback: string
) {
  const message = String(payload.error || '').trim();

  if (
    response.status === 502 ||
    message.includes('External API is unavailable') ||
    message.includes('Internal Server Error')
  ) {
    return BACKEND_UNAVAILABLE_MESSAGE;
  }

  return message || fallback;
}

export default function LoginForm({ googleConfigured = false }: LoginFormProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const authErrorCode = searchParams.get('authError');
  const returnTo = normalizeReturnTo(
    searchParams.get('returnTo') || searchParams.get('next')
  );
  const [tab, setTab] = useState<Tab>(initialTab);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [phoneOtpEnabled, setPhoneOtpEnabled] = useState(false);
  const [error, setError] = useState('');
  const [oauthError, setOauthError] = useState(() =>
    getGoogleAuthErrorMessage(authErrorCode)
  );
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleRedirecting, setGoogleRedirecting] = useState(false);
  const [otpSendingFor, setOtpSendingFor] = useState<'login' | 'signup' | null>(null);
  const router = useRouter();
  const { user, refreshUser } = useUser();

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
      router.replace(returnTo || '/');
    }
  }, [returnTo, router, user]);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setOauthError(getGoogleAuthErrorMessage(authErrorCode));
  }, [authErrorCode]);

  useEffect(() => {
    let active = true;

    const loadOtpConfig = async () => {
      try {
        const response = await fetch(getApiUrl('/api/auth/user/otp/config'), {
          cache: 'no-store',
          credentials: 'include',
        });
        const data = await readAuthApiPayload(response);
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
    setOauthError('');
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
        const data = await readAuthApiPayload(res);

        if (!res.ok) {
          setError(getAuthApiError(res, data, 'Unable to send OTP. Please try again.'));
          return;
        }

        if (typeof data.phone === 'string' && onSuccess) {
          onSuccess(data.phone);
        }

        setInfo(`OTP sent to ${data.phone}. Enter the 6-digit code to continue.`);
      } catch {
        setError(BACKEND_UNAVAILABLE_MESSAGE);
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
      const data = await readAuthApiPayload(res);

      if (!res.ok) {
        if (data.code === 'PASSWORD_SETUP_REQUIRED') {
          const normalizedEmail = sanitizeEmail(loginForm.email);

          setSignupForm((current) => ({
            ...current,
            email: normalizedEmail,
          }));
          setLoginForm((current) => ({
            ...current,
            email: normalizedEmail,
            password: '',
          }));
          setTab('signup');
          setInfo(
            'We found this email in our records. Complete account creation below to set your password and continue.'
          );
          return;
        }

        if (data.code === 'USE_OTP_LOGIN' && phoneOtpEnabled) {
          setLoginMethod('otp');
          setInfo('This account uses phone verification. Continue with Phone OTP below.');
          return;
        }

        setError(getAuthApiError(res, data, 'Login failed. Please try again.'));
        return;
      }

      await refreshUser();
      router.push(returnTo || '/');
    } catch {
      setError(BACKEND_UNAVAILABLE_MESSAGE);
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
      const data = await readAuthApiPayload(res);

      if (!res.ok) {
        setError(getAuthApiError(res, data, 'OTP sign-in failed. Please try again.'));
        return;
      }

      await refreshUser();
      router.push(returnTo || '/');
    } catch {
      setError(BACKEND_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedName = sanitizeEnglishName(signupForm.name);
    const normalizedEmail = sanitizeEmail(signupForm.email);

    if (normalizedName !== signupForm.name || normalizedEmail !== signupForm.email) {
      setSignupForm((current) => ({
        ...current,
        name: normalizedName,
        email: normalizedEmail,
      }));
    }

    if (!isEnglishName(normalizedName)) {
      setError('Name must contain English letters only.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

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
          name: normalizedName,
          email: normalizedEmail,
          phone: phoneOtpEnabled ? signupForm.phone : '',
          otpCode: phoneOtpEnabled ? signupForm.otpCode : '',
          password: signupForm.password,
        }),
        credentials: 'include',
      });
      const data = await readAuthApiPayload(res);

      if (!res.ok) {
        setError(getAuthApiError(res, data, 'Registration failed. Please try again.'));
        return;
      }

      await refreshUser();
      router.push(returnTo || '/');
    } catch {
      setError(BACKEND_UNAVAILABLE_MESSAGE);
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

  const googleAuthParams = new URLSearchParams({ intent: tab });
  if (returnTo) {
    googleAuthParams.set('returnTo', returnTo);
  }
  const googleAuthHref = `/api/auth/user/google?${googleAuthParams.toString()}`;

  const handleGoogleRedirect = useCallback(() => {
    if (!googleConfigured) {
      setError(
        'Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.'
      );
      setOauthError('');
      return;
    }

    setGoogleRedirecting(true);
    resetMessages();
    window.location.assign(googleAuthHref);
  }, [googleAuthHref, googleConfigured, resetMessages]);

  const displayError = error || oauthError;

  return (
    <div className="relative z-10 mx-auto max-w-md">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-block font-display text-[1.55rem] font-semibold tracking-[0.08em] text-theme-ink dark:text-theme-ivory md:text-[1.75rem]"
        >
          {SITE_NAME}
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

        {displayError ? (
          <div className="mb-5 rounded-xl border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {displayError}
          </div>
        ) : null}

        {info ? (
          <div className="mb-5 rounded-xl border border-theme-bronze/20 bg-theme-bronze/10 px-4 py-3 text-sm text-theme-walnut dark:text-theme-ivory/80">
            {info}
          </div>
        ) : null}

        {googleConfigured ? (
          <>
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleRedirect}
                disabled={loading || googleRedirecting}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-theme-line/60 bg-white/90 px-5 py-3 text-sm font-semibold text-theme-ink transition hover:border-theme-bronze hover:bg-white disabled:opacity-60 dark:border-white/15 dark:bg-white/10 dark:text-theme-ivory dark:hover:border-theme-bronze dark:hover:bg-white/12"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0"
                >
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h5.879c-.258 1.322-1.551 3.878-5.879 3.878-3.538 0-6.42-2.929-6.42-6.538s2.882-6.538 6.42-6.538c2.014 0 3.364.858 4.136 1.601l2.821-2.727C17.405 2.406 15.091 1.4 12.24 1.4 6.98 1.4 2.72 5.66 2.72 10.9s4.26 9.5 9.52 9.5c5.495 0 9.141-3.861 9.141-9.305 0-.626-.069-1.101-.152-1.572z"
                  />
                  <path
                    fill="#34A853"
                    d="M2.72 10.9c0 1.688.612 3.233 1.626 4.426l3.165-2.438c-.209-.626-.331-1.293-.331-1.988s.122-1.362.331-1.988L4.346 6.474C3.332 7.667 2.72 9.212 2.72 10.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12.24 20.4c2.851 0 5.244-.938 6.992-2.555l-3.399-2.633c-.91.634-2.069 1.066-3.593 1.066-3.364 0-6.217-2.272-7.237-5.329l-3.165 2.438C3.542 17.513 7.546 20.4 12.24 20.4z"
                  />
                  <path
                    fill="#4285F4"
                    d="M19.232 17.845c1.971-1.815 3.149-4.486 3.149-7.75 0-.625-.069-1.101-.152-1.572H12.24V12.64h5.879c-.258 1.322-1.018 2.441-2.286 3.205z"
                  />
                </svg>
                <span>
                  {googleRedirecting
                    ? 'Redirecting to Google...'
                    : tab === 'signup'
                      ? 'Create Account with Google'
                      : 'Sign In with Google'}
                </span>
              </button>
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
                    inputMode="email"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        email: sanitizeEmail(event.target.value),
                      }))
                    }
                    placeholder="name@example.com"
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
                  disabled={loading || googleRedirecting}
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
                    disabled={loading || googleRedirecting || otpSendingFor === 'login'}
                    className="rounded-full border border-theme-line/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-theme-walnut transition hover:border-theme-bronze hover:text-theme-bronze disabled:opacity-60 dark:text-theme-ivory/70 dark:hover:text-theme-bronze"
                  >
                    {otpSendingFor === 'login' ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleRedirecting}
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
                inputMode="text"
                maxLength={60}
                pattern="[A-Za-z]+(?:\\s+[A-Za-z]+)*"
                title="Use English letters only."
                value={signupForm.name}
                onChange={(event) =>
                  setSignupForm((current) => ({
                    ...current,
                    name: sanitizeEnglishName(event.target.value),
                  }))
                }
                placeholder="English letters only"
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
                inputMode="email"
                value={signupForm.email}
                onChange={(event) =>
                  setSignupForm((current) => ({
                    ...current,
                    email: sanitizeEmail(event.target.value),
                  }))
                }
                placeholder="name@example.com"
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
                    disabled={loading || googleRedirecting || otpSendingFor === 'signup'}
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
              disabled={loading || googleRedirecting}
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
