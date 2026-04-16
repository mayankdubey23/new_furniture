'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AnimatedHeading from '@/components/AnimatedHeading';
import { getApiUrl } from '@/lib/api/browser';
import { DEFAULT_SITE_SETTING, type SiteSettingRecord } from '@/lib/siteSettings';
import { SITE_NAME } from '@/lib/brand';

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL_FORM_STATE: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeSettingPayload(value: unknown) {
  if (Array.isArray(value) && value.length) {
    return { ...DEFAULT_SITE_SETTING, ...(value[0] as Partial<SiteSettingRecord>) };
  }

  if (isRecord(value) && Array.isArray(value.data) && value.data.length) {
    return { ...DEFAULT_SITE_SETTING, ...(value.data[0] as Partial<SiteSettingRecord>) };
  }

  if (isRecord(value)) {
    return { ...DEFAULT_SITE_SETTING, ...(value as Partial<SiteSettingRecord>) };
  }

  return DEFAULT_SITE_SETTING;
}

export default function ContactPageClient() {
  const [settings, setSettings] = useState<SiteSettingRecord>(DEFAULT_SITE_SETTING);
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const response = await fetch(getApiUrl('/api/settings'), { cache: 'no-store' });
        const payload = (await response.json()) as unknown;

        if (!cancelled) {
          setSettings(normalizeSettingPayload(payload));
        }
      } catch {
        if (!cancelled) {
          setSettings(DEFAULT_SITE_SETTING);
        }
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const contactDetails = [
    { label: 'Studio Email', value: settings.email, href: `mailto:${settings.email}` },
    { label: 'Phone', value: settings.phone, href: `tel:${settings.phone.replace(/\s+/g, '')}` },
    { label: 'Hours', value: 'Mon - Sat, 10:00 AM - 7:00 PM' },
    { label: 'Studio', value: settings.address },
  ];

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatusTone('error');
      setStatusMessage('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    setStatusMessage('');

    try {
      const response = await fetch(getApiUrl('/api/contactus'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          active: true,
        }),
      });

      const payload = (await response.json()) as { error?: string; result?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to send your message right now.');
      }

      setForm(INITIAL_FORM_STATE);
      setStatusTone('success');
      setStatusMessage('Your message has been sent. The studio will get back to you soon.');
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(
        error instanceof Error ? error.message : 'Unable to send your message right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.22),transparent_24%),linear-gradient(115deg,rgba(18,14,11,0.92)_12%,rgba(48,32,23,0.72)_45%,rgba(18,14,11,0.92)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[6rem] h-[20rem] w-[20rem] rounded-full bg-theme-bronze/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[8rem] h-[18rem] w-[18rem] rounded-full bg-theme-olive/14 blur-[110px]" />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="section-shell rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.34)] px-8 py-12 text-theme-ivory backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">
              Contact {settings.siteName || SITE_NAME}
            </p>
            <AnimatedHeading as="h1" className="mt-4 font-display text-5xl text-theme-ivory md:text-6xl">
              Let&apos;s shape your space.
            </AnimatedHeading>
            <p className="mt-6 max-w-2xl text-lg text-theme-ivory/74">
              Reach out for custom furniture consultations, order support, material guidance, or private appointments.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {contactDetails.map((item) => (
                <div key={item.label} className="premium-surface rounded-[1.5rem] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                    {item.label}
                  </p>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="mt-3 block text-lg font-semibold text-theme-ink transition-colors hover:text-theme-bronze"
                    >
                      {item.value}
                    </Link>
                  ) : (
                    <p className="mt-3 text-lg font-semibold text-theme-ink">{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={settings.map1}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/12 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-theme-ivory transition-colors hover:border-theme-bronze hover:text-theme-bronze"
              >
                Open Map 1
              </Link>
              <Link
                href={settings.map2}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/12 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-theme-ivory transition-colors hover:border-theme-bronze hover:text-theme-bronze"
              >
                Open Map 2
              </Link>
            </div>
          </div>

          <div className="premium-surface rounded-[2rem] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">
              Quick Message
            </p>
            <AnimatedHeading as="h2" className="mt-4 font-display text-3xl text-theme-ink">
              How can we help?
            </AnimatedHeading>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full rounded-[1.3rem] border border-theme-line bg-white/70 px-4 py-3 text-sm text-theme-ink outline-none transition-colors focus:border-theme-bronze"
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full rounded-[1.3rem] border border-theme-line bg-white/70 px-4 py-3 text-sm text-theme-ink outline-none transition-colors focus:border-theme-bronze"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full rounded-[1.3rem] border border-theme-line bg-white/70 px-4 py-3 text-sm text-theme-ink outline-none transition-colors focus:border-theme-bronze"
              />
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full rounded-[1.3rem] border border-theme-line bg-white/70 px-4 py-3 text-sm text-theme-ink outline-none transition-colors focus:border-theme-bronze"
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tell us about your project, preferred furniture type, room size, or support request."
                className="w-full rounded-[1.3rem] border border-theme-line bg-white/70 px-4 py-3 text-sm text-theme-ink outline-none transition-colors focus:border-theme-bronze"
              />

              <button
                type="submit"
                disabled={submitting}
                className="block w-full rounded-[1.5rem] bg-theme-bronze px-5 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-theme-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {statusMessage ? (
              <div
                className={`mt-5 rounded-[1.4rem] border px-4 py-3 text-sm ${
                  statusTone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-600'
                }`}
              >
                {statusMessage}
              </div>
            ) : null}

            <div className="mt-10 rounded-[1.5rem] border border-theme-line bg-white/55 p-5 dark:bg-white/5">
              <p className="text-sm leading-7 text-theme-walnut/75 dark:text-theme-ink/70">
                Custom orders usually take 6-8 weeks depending on fabric availability and finish selection. Share your room size,
                preferred materials, and timeline, and the team can recommend the best configuration.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
