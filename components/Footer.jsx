'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FooterBurstOverlay from '@/components/decor/FooterBurstOverlay';
import { DEFAULT_SITE_CONTENT } from '@/lib/content/siteContent';
import { getApiUrl } from '@/lib/api/browser';








/**
 * @param {{
 *   collections?: import('@/lib/productCatalog').StorefrontCollectionLink[],
 *   content?: import('@/lib/content/siteContent').FooterContent
 * }} props
 */
export default function Footer({ collections = [], content = DEFAULT_SITE_CONTENT.footer }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('success');
  const pathname = usePathname();

  const handleBackToTop = useCallback((event) => {
    if (pathname !== '/') {
      return;
    }

    event.preventDefault();

    const cleanUrl = `${window.location.pathname}${window.location.search}` || '/';
    if (window.location.hash === '#hero') {
      window.history.replaceState(null, '', cleanUrl);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setStatusTone('error');
      setStatusMessage('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setStatusMessage('');

    try {
      const response = await fetch(getApiUrl('/api/newsletters'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          active: true,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to subscribe right now.');
      }

      setEmail('');
      setStatusTone('success');
      setStatusMessage('You are subscribed. We will keep you posted.');
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(
        error instanceof Error ? error.message : 'Unable to subscribe right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      data-site-footer
      className="relative mt-20 min-h-[560px] w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(165,106,63,0.14),transparent_30%),linear-gradient(180deg,rgba(251,247,241,0.98)_0%,rgba(243,233,221,0.98)_58%,rgba(234,220,200,1)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(199,140,92,0.16),transparent_28%),linear-gradient(180deg,#1a1613_0%,#120e0c_58%,#0d0a09_100%)]"
    >
      <FooterBurstOverlay
        videoSrc={content.burstVideo.src}
        videoType={content.burstVideo.type}
        videoPreload={content.burstVideo.preload}
      />

      <div className="absolute left-1/2 top-8 h-44 w-[38rem] max-w-[72vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(165,106,63,0.14),transparent_72%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(199,140,92,0.1),transparent_72%)]" />

      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.52),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(246,238,229,0.36)_52%,rgba(232,219,203,0.68)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(18,14,11,0.08)_0%,rgba(18,14,11,0.7)_50%,rgba(12,9,8,0.94)_100%)]" />

      <div className="relative z-20 mx-auto flex h-full max-w-[96rem] flex-col justify-between px-6 pb-10 pt-24 text-theme-walnut md:px-10 lg:px-16 dark:text-white">
        <div className="grid grid-cols-1 gap-10 rounded-[2rem] border border-theme-line/60 bg-white/62 p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] backdrop-blur-xl md:grid-cols-4 md:gap-12 md:p-8 dark:border-white/10 dark:bg-white/8 dark:shadow-none">
          <div className="md:col-span-1">
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">{content.brandLabel}</p>
            <h2 className="mb-4 font-display text-4xl tracking-[0.08em] text-theme-ink dark:text-theme-ivory">{content.brandName}</h2>
            <p className="mb-6 text-sm leading-7 text-theme-walnut/72 dark:text-white/72">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-theme-line/60 bg-white/72 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-theme-walnut/72 dark:border-white/12 dark:bg-white/8 dark:text-white/78">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-theme-bronze">Collections</h3>
            <ul className="space-y-3 text-sm text-theme-walnut/68 dark:text-white/68">
              {collections.length ? collections.map((collection) => (
                <li key={collection.key}>
                  <Link href={collection.href} className="transition-colors hover:text-theme-bronze">
                    {collection.name}
                  </Link>
                </li>
              )) : (
                <li><Link href="/#collections" className="transition-colors hover:text-theme-bronze">Collections</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-theme-bronze">Experience</h3>
            <ul className="space-y-3 text-sm text-theme-walnut/68 dark:text-white/68">
              <li><Link href="/customization" className="transition-colors hover:text-theme-bronze">Customization</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-theme-bronze">Contact</Link></li>
              <li><Link href="/" onClick={handleBackToTop} className="transition-colors hover:text-theme-bronze">Back to top</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-theme-bronze">{content.newsletterHeading}</h3>
            <p className="mb-4 text-sm leading-7 text-theme-walnut/68 dark:text-white/68">{content.newsletterDescription}</p>
            <form onSubmit={handleNewsletterSubmit}>
              <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="w-full rounded-full border border-theme-line/60 bg-white/78 px-4 py-3 text-sm text-theme-ink placeholder:text-theme-walnut/35 focus:outline-none focus:ring-1 focus:ring-theme-bronze/60 dark:border-white/12 dark:bg-white/8 dark:text-white dark:placeholder:text-white/35"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-theme-bronze px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-ink disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-theme-ivory dark:hover:text-theme-ink"
              >
                {submitting ? 'Sending...' : 'Subscribe'}
              </button>
              </div>
              {statusMessage ? (
                <p
                  className={`mt-3 text-xs ${
                    statusTone === 'success'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-red-600 dark:text-red-300'
                  }`}
                >
                  {statusMessage}
                </p>
              ) : null}
            </form>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-theme-line/50 pt-6 text-sm text-theme-walnut/52 dark:border-white/10 dark:text-white/44 md:flex-row">
          <p>&copy; {new Date().getFullYear()} {content.brandName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-theme-ink dark:hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-theme-ink dark:hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
