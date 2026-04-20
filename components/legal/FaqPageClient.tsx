'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedHeading from '@/components/AnimatedHeading';
import PillowDropZone from '@/components/product/PillowDropZone';
import type { LegalFaqEntry } from '@/lib/legalContent';
import type { SiteSettingRecord } from '@/lib/siteSettings';

interface FaqPageClientProps {
  faqs: LegalFaqEntry[];
  siteSetting: SiteSettingRecord;
}

const FAQ_PILLARS = [
  {
    label: 'Orders & Tracking',
    detail: 'How checkout, confirmation emails, live status updates, and tracking references work together.',
  },
  {
    label: 'Payments & Delivery',
    detail: 'Answers for Cash on Delivery, online payment verification, address support, and fulfillment timing.',
  },
  {
    label: 'Customization & Support',
    detail: 'Guidance for design requests, account-linked help, and the fastest way to reach the studio team.',
  },
];

export default function FaqPageClient({ faqs, siteSetting }: FaqPageClientProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <main className="page-strata relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.2),transparent_24%),linear-gradient(115deg,rgba(18,14,11,0.94)_12%,rgba(46,31,23,0.72)_46%,rgba(18,14,11,0.94)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[6rem] h-[20rem] w-[20rem] rounded-full bg-theme-bronze/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[8rem] h-[18rem] w-[18rem] rounded-full bg-theme-olive/14 blur-[110px]" />

      <section className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="section-shell rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.36)] px-8 py-12 text-theme-ivory backdrop-blur-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">
            Frequently Asked Questions
          </p>
          <AnimatedHeading
            as="h1"
            className="mt-4 font-display text-5xl text-theme-ivory md:text-6xl"
          >
            Answers shaped around how this store actually works.
          </AnimatedHeading>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-theme-ivory/74">
            This page covers the live storefront flow you use today: account sign-in, cart and
            wishlist behavior, customization requests, India checkout, Razorpay verification,
            tracking IDs, and support after purchase.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="rounded-full border border-white/12 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-ivory/82 transition-colors hover:border-theme-bronze hover:text-theme-bronze"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="rounded-full border border-white/12 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-ivory/82 transition-colors hover:border-theme-bronze hover:text-theme-bronze"
            >
              Terms & Conditions
            </Link>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FAQ_PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="premium-surface rounded-[1.7rem] p-6"
            >
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                {pillar.label}
              </p>
              <p className="mt-4 text-sm leading-7 text-theme-walnut/72 dark:text-theme-ivory/66">
                {pillar.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="lg:col-span-2">
            <PillowDropZone
              title="A FAQ page with cushions in motion."
              subtitle="Questions about payments, delivery, customization, and tracking now sit alongside a live drop field built from your cushion SVGs, so the support layer still feels like part of the product world."
              totalPillows={18}
              height={330}
            />
          </div>

          <motion.aside
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-5 lg:sticky lg:top-32 lg:self-start"
          >
            <div className="premium-surface rounded-[1.9rem] p-6">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                Quick Support
              </p>
              <p className="mt-4 text-sm leading-7 text-theme-walnut/70 dark:text-theme-ivory/64">
                Use the same email tied to your account or order when you contact the studio. That
                makes it easier to match support requests with order status, customization records,
                and notifications.
              </p>
              <div className="mt-5 space-y-2 text-sm text-theme-ink dark:text-theme-ivory">
                <p>{siteSetting.email}</p>
                <p>{siteSetting.phone}</p>
                <p>{siteSetting.address}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-theme-bronze px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-theme-ink"
                >
                  Contact Studio
                </Link>
                <Link
                  href="/track-order"
                  className="rounded-full border border-theme-line/60 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-theme-walnut transition-colors hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/70"
                >
                  Track Order
                </Link>
              </div>
            </div>

            <div className="section-shell rounded-[1.9rem] border border-theme-line/50 px-6 py-7">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                What You&apos;ll Find Here
              </p>
              <div className="mt-5 space-y-3">
                {faqs.slice(0, 5).map((faq, index) => (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => setOpenId(faq.id)}
                    className={`w-full rounded-[1.2rem] border px-4 py-3 text-left text-sm transition ${
                      openId === faq.id
                        ? 'border-theme-bronze bg-theme-bronze/10 text-theme-bronze'
                        : 'border-theme-line/50 bg-white/45 text-theme-walnut/76 hover:border-theme-bronze/45 dark:bg-white/5 dark:text-theme-ivory/64'
                    }`}
                  >
                    <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-theme-bronze/12 text-[0.68rem] font-semibold text-theme-bronze">
                      {index + 1}
                    </span>
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openId === faq.id;

              return (
                <motion.article
                  key={faq.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.54, ease: 'easeOut', delay: index * 0.03 }}
                  className="premium-surface overflow-hidden rounded-[1.8rem]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left md:px-7"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-theme-bronze/20 bg-theme-bronze/10 text-sm font-semibold uppercase tracking-[0.18em] text-theme-bronze">
                        {index + 1}
                      </span>
                      <div>
                        <h2 className="font-display text-2xl text-theme-ink dark:text-theme-ivory">
                          {faq.question}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/58">
                          Tap to {isOpen ? 'collapse' : 'expand'} this answer.
                        </p>
                      </div>
                    </div>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="mt-1 text-3xl leading-none text-theme-bronze"
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-theme-line/50 px-6 py-5 md:px-7">
                          <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/42 px-5 py-5 text-sm leading-7 text-theme-walnut/78 dark:bg-white/5 dark:text-theme-ivory/66">
                            {faq.answer}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
