'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedHeading from '@/components/AnimatedHeading';
import PillowDropZone from '@/components/product/PillowDropZone';
import type {
  LegalHighlight,
  LegalSection,
} from '@/lib/legalContent';
import type { SiteSettingRecord } from '@/lib/siteSettings';

interface PolicyPageClientProps {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  highlights: LegalHighlight[];
  sections: LegalSection[];
  siteSetting: SiteSettingRecord;
}

const heroTransition = {
  duration: 0.7,
  ease: 'easeOut' as const,
};

export default function PolicyPageClient({
  eyebrow,
  title,
  intro,
  lastUpdated,
  highlights,
  sections,
  siteSetting,
}: PolicyPageClientProps) {
  const isPrivacyPage = eyebrow === 'Privacy Policy';
  const pillowTitle =
    isPrivacyPage
      ? 'A calm space to review your privacy choices.'
      : 'A clearer way to review store terms.';
  const pillowSubtitle =
    isPrivacyPage
      ? 'The layout keeps key sections and support details within easy reach while you read through account, order, and data-use information.'
      : 'Use the section index and support details to move quickly between account rules, payment guidance, delivery updates, and order support.';

  return (
    <main className="page-strata relative min-h-screen overflow-hidden bg-transparent px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 md:px-10 lg:px-16 xl:px-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.22),transparent_24%),linear-gradient(115deg,rgba(18,14,11,0.96)_10%,rgba(46,31,23,0.74)_48%,rgba(18,14,11,0.96)_100%)] sm:h-[32rem]" />
      <div className="pointer-events-none absolute left-[-9rem] top-[7rem] h-[18rem] w-[18rem] rounded-full bg-theme-bronze/22 blur-[110px] sm:top-[8rem] sm:h-[22rem] sm:w-[22rem] sm:blur-[120px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[10rem] h-[16rem] w-[16rem] rounded-full bg-theme-olive/16 blur-[100px] sm:top-[12rem] sm:h-[18rem] sm:w-[18rem] sm:blur-[110px]" />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={heroTransition}
            className="section-shell min-w-0 overflow-hidden rounded-[1.8rem] border border-white/10 bg-[rgba(18,14,11,0.36)] px-5 py-7 text-theme-ivory backdrop-blur-sm sm:px-8 sm:py-10 lg:rounded-[2rem] lg:px-10 lg:py-12"
          >
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze sm:text-xs sm:tracking-[0.35em]">
              {eyebrow}
            </p>
            <AnimatedHeading
              as="h1"
              className="mt-4 max-w-[15ch] font-display text-3xl leading-[1.05] text-balance text-theme-ivory hyphens-none sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {title}
            </AnimatedHeading>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-theme-ivory/78 sm:mt-6 sm:text-lg sm:leading-8">
              {intro}
            </p>

            <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
              <span className="rounded-full border border-white/12 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-theme-ivory/82 sm:text-[0.66rem] sm:tracking-[0.28em]">
                Last updated {lastUpdated}
              </span>
              <Link
                href="/faq"
                className="rounded-full border border-white/12 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-theme-ivory/82 transition-colors hover:border-theme-bronze hover:text-theme-bronze sm:text-[0.66rem] sm:tracking-[0.28em]"
              >
                Common Questions
              </Link>
            </div>
          </motion.div>

          <div className="grid min-w-0 auto-rows-fr gap-4 sm:grid-cols-2">
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="premium-surface flex h-full min-w-0 flex-col rounded-[1.5rem] p-5 sm:rounded-[1.7rem] sm:p-6"
              >
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-theme-bronze sm:text-[0.64rem] sm:tracking-[0.28em]">
                  {highlight.label}
                </p>
                <h2 className="mt-3 font-display text-xl leading-tight text-balance text-theme-ink sm:text-2xl dark:text-theme-ivory">
                  {highlight.value}
                </h2>
                <p className="mt-3 text-pretty text-sm leading-7 text-theme-walnut/72 dark:text-theme-ivory/66">
                  {highlight.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-8">
          <div className="lg:col-span-2">
            <PillowDropZone
              title={pillowTitle}
              subtitle={pillowSubtitle}
              totalPillows={16}
              height={300}
            />
          </div>

          <motion.aside
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="min-w-0 space-y-4 sm:space-y-5 lg:sticky lg:top-28 lg:self-start"
          >
            <div className="premium-surface min-w-0 rounded-[1.7rem] p-5 sm:rounded-[1.9rem] sm:p-6">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-theme-bronze sm:text-[0.66rem] sm:tracking-[0.28em]">
                On This Page
              </p>
              <p className="mt-3 text-pretty text-sm leading-7 text-theme-walnut/70 dark:text-theme-ivory/64">
                Jump straight to the section you need without scanning the full page first.
              </p>
              <div className="mt-5 space-y-3">
                {sections.map((section, index) => (
                  <a
                    key={section.title}
                    href={`#policy-section-${index + 1}`}
                    className="flex min-w-0 items-start gap-3 rounded-[1.2rem] border border-theme-line/50 bg-white/45 px-4 py-3 text-sm text-theme-walnut/76 transition-colors hover:border-theme-bronze/45 hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64 dark:hover:text-theme-bronze"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-theme-bronze/12 text-[0.68rem] font-semibold text-theme-bronze">
                      {index + 1}
                    </span>
                    <span className="min-w-0 break-words text-pretty">{section.title}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="section-shell min-w-0 rounded-[1.7rem] border border-theme-line/50 px-5 py-6 sm:rounded-[1.9rem] sm:px-6 sm:py-7">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-theme-bronze sm:text-[0.66rem] sm:tracking-[0.28em]">
                Need Quick Help?
              </p>
              <p className="mt-4 text-pretty text-sm leading-7 text-theme-walnut/70 dark:text-theme-ivory/64">
                For account questions, delivery issues, customization guidance, or privacy requests,
                contact the studio directly and use the same email tied to your order whenever
                possible.
              </p>
              <div className="mt-5 space-y-3 text-sm text-theme-ink dark:text-theme-ivory">
                <Link
                  href={`mailto:${siteSetting.email}`}
                  className="block break-all transition-colors hover:text-theme-bronze"
                >
                  {siteSetting.email}
                </Link>
                <Link
                  href={`tel:${siteSetting.phone.replace(/\s+/g, '')}`}
                  className="block transition-colors hover:text-theme-bronze"
                >
                  {siteSetting.phone}
                </Link>
                <p className="break-words text-theme-walnut/76 dark:text-theme-ivory/72">
                  {siteSetting.address}
                </p>
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
          </motion.aside>

          <div className="min-w-0 space-y-4 sm:space-y-5">
            {sections.map((section, index) => (
              <motion.article
                id={`policy-section-${index + 1}`}
                key={section.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.58, ease: 'easeOut', delay: index * 0.04 }}
                className="premium-surface scroll-mt-28 min-w-0 rounded-[1.7rem] p-5 sm:rounded-[1.9rem] sm:p-6 md:p-8"
              >
                <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-theme-bronze/20 bg-theme-bronze/10 text-sm font-semibold uppercase tracking-[0.22em] text-theme-bronze">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-theme-bronze sm:text-[0.66rem] sm:tracking-[0.28em]">
                      Section {index + 1}
                    </p>
                    <h2 className="mt-2 font-display text-2xl leading-tight text-balance text-theme-ink hyphens-none sm:text-3xl dark:text-theme-ivory">
                      {section.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-pretty text-base leading-7 text-theme-walnut/74 dark:text-theme-ivory/68">
                      {section.intro}
                    </p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 rounded-[1.25rem] border border-theme-line/50 bg-white/42 px-4 py-4 sm:px-5 dark:bg-white/5"
                    >
                      <span className="mt-2.5 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-theme-bronze" />
                      <p className="min-w-0 text-pretty text-sm leading-7 text-theme-walnut/78 dark:text-theme-ivory/64">
                        {point}
                      </p>
                    </li>
                  ))}
                </ul>

                {section.note ? (
                  <div className="mt-5 rounded-[1.35rem] border border-theme-bronze/20 bg-theme-bronze/8 px-4 py-4 sm:px-5">
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-theme-bronze sm:text-[0.66rem] sm:tracking-[0.28em]">
                      Good To Know
                    </p>
                    <p className="mt-2 text-pretty text-sm leading-7 text-theme-walnut dark:text-theme-ivory/74">
                      {section.note}
                    </p>
                  </div>
                ) : null}
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
