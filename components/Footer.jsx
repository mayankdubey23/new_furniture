'use client';

import Link from 'next/link';
import FooterBurstOverlay from '@/components/decor/FooterBurstOverlay';
import { DEFAULT_SITE_CONTENT } from '@/lib/content/siteContent';








/**
 * @param {{
 *   collections?: import('@/lib/productCatalog').StorefrontCollectionLink[],
 *   content?: import('@/lib/content/siteContent').FooterContent
 * }} props
 */
export default function Footer({ collections = [], content = DEFAULT_SITE_CONTENT.footer }) {
  return (
    <footer
      data-site-footer
      className="relative mt-20 min-h-[560px] w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(199,140,92,0.16),transparent_28%),linear-gradient(180deg,#1a1613_0%,#120e0c_58%,#0d0a09_100%)]"
    >
      <FooterBurstOverlay
        videoSrc={content.burstVideo.src}
        videoType={content.burstVideo.type}
      />

      <div className="absolute left-1/2 top-8 h-44 w-[38rem] max-w-[72vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(199,140,92,0.1),transparent_72%)] blur-3xl" />

      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(18,14,11,0.08)_0%,rgba(18,14,11,0.7)_50%,rgba(12,9,8,0.94)_100%)]" />

      <div className="relative z-20 mx-auto flex h-full max-w-[96rem] flex-col justify-between px-6 pb-10 pt-24 text-white md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-10 rounded-[2rem] border border-white/10 bg-white/8 p-6 md:grid-cols-4 md:gap-12 md:p-8">
          <div className="md:col-span-1">
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">{content.brandLabel}</p>
            <h2 className="mb-4 font-display text-4xl tracking-[0.08em] text-theme-ivory">{content.brandName}</h2>
            <p className="mb-6 text-sm leading-7 text-white/72">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/78">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-theme-bronze">Collections</h3>
            <ul className="space-y-3 text-sm text-white/68">
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
            <ul className="space-y-3 text-sm text-white/68">
              <li><Link href="/customization" className="transition-colors hover:text-theme-bronze">Customization</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-theme-bronze">Contact</Link></li>
              <li><Link href="/admin" className="transition-colors hover:text-theme-bronze">Admin</Link></li>
              <li><Link href="/#hero" className="transition-colors hover:text-theme-bronze">Back to top</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-theme-bronze">{content.newsletterHeading}</h3>
            <p className="mb-4 text-sm leading-7 text-white/68">{content.newsletterDescription}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-theme-bronze/60"
              />
              <button className="rounded-full bg-theme-bronze px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-ivory hover:text-theme-ink">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/44 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Luxe Furniture. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
