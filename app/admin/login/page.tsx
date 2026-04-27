'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, KeyRound, Loader2, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import { getApiUrl } from '@/lib/api/browser';
import { getAdminPortalPath } from '@/lib/adminPortal';
import { SITE_NAME } from '@/lib/brand';

type Tab = 'login' | 'create' | 'forgot';
type RecoveryChannel = 'email' | 'phone';

type RecoveryOption = {
  available: boolean;
  maskedDestination: string;
  reason: string;
};

type AdminAuthStatus = {
  hasPassword: boolean;
  passwordPolicy: string;
  guidance: string;
  recovery: {
    email: RecoveryOption;
    phone: RecoveryOption;
  };
};

const adminHomeHref = getAdminPortalPath();

function getPreferredChannel(status: AdminAuthStatus | null): RecoveryChannel {
  if (status?.recovery.email.available) return 'email';
  if (status?.recovery.phone.available) return 'phone';
  return 'email';
}

export default function AdminLogin() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const [status, setStatus] = useState<AdminAuthStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [channel, setChannel] = useState<RecoveryChannel>('email');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const channelOptions = useMemo(
    () => [
      {
        key: 'email' as const,
        label: 'Email',
        icon: Mail,
        option: status?.recovery.email,
      },
      {
        key: 'phone' as const,
        label: 'Contact Number',
        icon: Smartphone,
        option: status?.recovery.phone,
      },
    ],
    [status]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatusLoading(true);

      try {
        const [verifyResponse, statusResponse] = await Promise.all([
          fetch(getApiUrl('/api/auth/verify'), { credentials: 'include' }),
          fetch(getApiUrl('/api/auth/status'), { cache: 'no-store' }),
        ]);

        if (verifyResponse.ok) {
          router.replace(adminHomeHref);
          return;
        }

        const payload = statusResponse.ok
          ? ((await statusResponse.json()) as AdminAuthStatus)
          : null;

        if (!cancelled) {
          setStatus(payload);
          setChannel(getPreferredChannel(payload));
          setTab(payload?.hasPassword ? 'login' : 'create');
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load admin access settings right now.');
        }
      } finally {
        if (!cancelled) {
          setStatusLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    setChannel(getPreferredChannel(status));
  }, [status]);

  const resetMessages = () => {
    setError('');
    setInfo('');
  };

  const handleTabChange = (nextTab: Tab) => {
    resetMessages();
    setTab(nextTab);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (!status?.hasPassword) {
      setError(
        status?.guidance ||
          'No admin password is active yet. Create one first using email or contact number recovery.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(getApiUrl('/api/auth'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error || 'Unable to sign in. Please verify your credentials.');
        return;
      }

      router.replace(adminHomeHref);
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCode = async () => {
    resetMessages();

    const activeChannel = channelOptions.find((item) => item.key === channel);
    if (!activeChannel?.option?.available) {
      setError('That recovery method is not available yet.');
      return;
    }

    setSendingCode(true);

    try {
      const response = await fetch(getApiUrl('/api/auth/password/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; destination?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error || 'Unable to send a verification code right now.');
        return;
      }

      const channelLabel = channel === 'email' ? 'email' : 'contact number';
      setInfo(
        `Verification code sent to ${payload?.destination || `your ${channelLabel}`}.`
      );
    } catch {
      setError('Unable to send a verification code right now.');
    } finally {
      setSendingCode(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

    const activeChannel = channelOptions.find((item) => item.key === channel);
    if (!activeChannel?.option?.available) {
      setError('That recovery method is not available yet.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(getApiUrl('/api/auth/password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          channel,
          code,
          password: newPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error || 'Unable to secure the admin password.');
        return;
      }

      router.replace(adminHomeHref);
      router.refresh();
    } catch {
      setError('Unable to secure the admin password right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30';
  const labelClass =
    'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-theme-ivory px-4 dark:bg-theme-ink">
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-[28rem] w-[28rem] rounded-full bg-theme-bronze/14 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-4rem] right-[-4rem] h-[22rem] w-[22rem] rounded-full bg-theme-olive/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="inline-block font-display text-[1.5rem] font-semibold tracking-[0.08em] text-theme-ink dark:text-theme-ivory md:text-[1.65rem]"
          >
            {SITE_NAME}
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">
            Protected Admin Access
          </p>
          <h1 className="mt-2 font-display text-2xl text-theme-ink dark:text-theme-ivory">
            Secure the control room
          </h1>
          <p className="mt-3 text-sm leading-7 text-theme-walnut/70 dark:text-theme-ivory/62">
            Sign in with your admin password using email, username, or contact number, or verify ownership through the registered recovery channels.
          </p>
        </div>

        <div className="rounded-[2rem] border border-theme-line/50 bg-white/80 p-8 shadow-[0_25px_80px_rgba(49,30,21,0.12)] dark:bg-white/5">
          {statusLoading ? (
            <div className="flex items-center justify-center gap-3 py-10 text-sm font-semibold text-theme-walnut/70 dark:text-theme-ivory/65">
              <Loader2 className="h-4 w-4 animate-spin text-theme-bronze" />
              Checking admin security settings
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { key: 'login', label: 'Sign In', icon: KeyRound },
                  { key: 'create', label: 'Create Password', icon: ShieldCheck },
                  { key: 'forgot', label: 'Forgot Password', icon: CheckCircle2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleTabChange(item.key as Tab)}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? 'border-theme-bronze bg-theme-bronze/12 text-theme-bronze'
                          : 'border-theme-line/60 bg-theme-ivory/55 text-theme-walnut/72 hover:border-theme-bronze/40 dark:bg-white/6 dark:text-theme-ivory/66'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {status?.guidance ? (
                <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-50/80 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                  {status.guidance}
                </div>
              ) : null}

              {error ? (
                <div className="mt-5 rounded-xl border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              ) : null}

              {info ? (
                <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {info}
                </div>
              ) : null}

              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="identifier" className={labelClass}>
                      Email, Username, Or Contact Number
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="admin, owner@example.com, or +91..."
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
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="********"
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full rounded-full bg-theme-ink py-3.5 text-sm font-bold uppercase tracking-[0.28em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)] dark:hover:bg-theme-bronze dark:hover:text-white"
                  >
                    {submitting ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
                  <div>
                    <p className={labelClass}>Recovery Method</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {channelOptions.map((item) => {
                        const Icon = item.icon;
                        const active = channel === item.key;
                        const available = Boolean(item.option?.available);

                        return (
                          <button
                            key={item.key}
                            type="button"
                            disabled={!available}
                            onClick={() => setChannel(item.key)}
                            className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
                              active && available
                                ? 'border-theme-bronze bg-theme-bronze/10'
                                : 'border-theme-line/60 bg-theme-ivory/55 dark:bg-white/6'
                            } ${!available ? 'cursor-not-allowed opacity-60' : 'hover:border-theme-bronze/40'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-2xl border border-theme-line/50 bg-white/80 p-2 dark:bg-white/10">
                                <Icon className="h-4 w-4 text-theme-bronze" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">
                                  {item.label}
                                </p>
                                <p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/56">
                                  {item.option?.available
                                    ? item.option.maskedDestination
                                    : item.option?.reason || 'Unavailable'}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-theme-line/60 bg-theme-ivory/55 p-4 dark:bg-white/6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">
                          Send verification code
                        </p>
                        <p className="text-xs leading-6 text-theme-walnut/62 dark:text-theme-ivory/58">
                          {tab === 'create'
                            ? 'Verify the registered admin contact before setting the first password.'
                            : 'Verify the registered admin contact before resetting the password.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={sendingCode || !channelOptions.find((item) => item.key === channel)?.option?.available}
                        className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/75 transition hover:border-theme-bronze hover:text-theme-bronze disabled:opacity-60 dark:bg-white/10 dark:text-theme-ivory/70"
                      >
                        {sendingCode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        {sendingCode ? 'Sending...' : 'Send Code'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="code" className={labelClass}>
                      Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit code"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="new-password" className={labelClass}>
                      New Password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Create a stronger admin password"
                      className={inputClass}
                    />
                    {status?.passwordPolicy ? (
                      <p className="mt-2 text-xs text-theme-walnut/58 dark:text-theme-ivory/54">
                        {status.passwordPolicy}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className={labelClass}>
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat the new password"
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full rounded-full bg-theme-ink py-3.5 text-sm font-bold uppercase tracking-[0.28em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)] dark:hover:bg-theme-bronze dark:hover:text-white"
                  >
                    {submitting
                      ? 'Securing Access...'
                      : tab === 'create'
                        ? 'Create Password'
                        : 'Reset Password'}
                  </button>
                </form>
              )}

              <div className="mt-6 rounded-[1.6rem] border border-theme-line/60 bg-theme-ivory/50 p-4 dark:bg-white/6">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-theme-line/50 bg-white/80 p-2 dark:bg-white/10">
                    <ShieldCheck className="h-4 w-4 text-theme-bronze" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">
                      Hardening updates are active
                    </p>
                    <p className="mt-1 text-xs leading-6 text-theme-walnut/62 dark:text-theme-ivory/58">
                      Verified recovery is available for long-term admin security, and bootstrap credentials can still be used during local setup.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-theme-walnut/50 dark:text-theme-ivory/40">
          <Link href="/" className="text-theme-bronze transition-colors hover:underline">
            Return to store
          </Link>
        </p>
      </div>
    </div>
  );
}
