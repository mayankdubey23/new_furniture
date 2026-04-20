'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedHeading from '@/components/AnimatedHeading';
import PillowDropZone from '@/components/product/PillowDropZone';
import type { LegalHighlight, LegalSection } from '@/lib/legalContent';
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

// ─── Per-card visual config ───────────────────────────────────────────────────
interface CardExtra {
  points?: string[];
  stats?: { num: string; label: string }[];
  bars?: { label: string; value: string; pct: number }[];
  badge?: string;
  icon?: string;
  wide?: boolean;
}

const CARD_EXTRAS: CardExtra[] = [
  // 0 — Storefront Scope
  {
    points: [
      'All catalog items are subject to availability at time of purchase.',
      'Custom orders require written confirmation before production begins.',
      'Product images are representative; minor variations may occur.',
    ],
    icon: '§',
  },
  // 1 — Payment Paths
  {
    stats: [
      { num: '256', label: 'bit encryption' },
      { num: '3', label: 'gateways' },
      { num: '0', label: 'hidden fees' },
    ],
    badge: 'PCI compliant',
    icon: '₹',
  },
  // 2 — Order Controls
  {
    bars: [
      { label: 'Cancellation window', value: '24 hrs', pct: 90 },
      { label: 'Returns eligibility', value: '14 days', pct: 75 },
      { label: 'Dispute resolution', value: '30 days', pct: 60 },
    ],
    icon: '✦',
  },
  // 3 — Tracking Journey (wide)
  {
    wide: true,
    points: [
      'Email + SMS tracking links sent within 24 hours of dispatch.',
      'Domestic deliveries typically arrive within 5–8 business days.',
      'International shipping timelines vary by destination and customs clearance.',
    ],
    icon: '→',
  },
];

function HighlightCard({
  highlight,
  index,
  extra,
}: {
  highlight: LegalHighlight;
  index: number;
  extra: CardExtra;
}) {
  const [barsVisible, setBarsVisible] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      onViewportEnter={() => setBarsVisible(true)}
      className={`premium-surface relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-theme-line/40 bg-white p-6 shadow-sm sm:rounded-[1.7rem] sm:p-8 ${
        extra.wide ? 'sm:col-span-2' : ''
      }`}
    >
      {/* Accent bar sliding in from left */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.08 + 0.2 }}
        style={{ transformOrigin: 'left' }}
        className="absolute left-8 top-0 h-[2px] w-10 rounded-b bg-theme-bronze"
      />

      {/* Label */}
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-theme-bronze">
        {highlight.label}
      </span>

      {/* Value — uses dark ink so it's readable on white/cream card bg */}
      {highlight.value && (
        <p className="mt-3 font-display text-2xl leading-snug text-theme-ink dark:text-theme-ivory">
          {highlight.value}
        </p>
      )}

      {/* Detail */}
      {highlight.detail && (
        <p className="mt-3 text-sm leading-relaxed text-theme-walnut/80 dark:text-theme-ivory/60">
          {highlight.detail}
        </p>
      )}

      {/* ── TREATMENT A: bullet points ── */}
      {extra.points && extra.points.length > 0 && (
        <ul className="mt-5 flex flex-col gap-3">
          {extra.points.map((pt, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.38,
                ease: 'easeOut',
                delay: index * 0.08 + 0.3 + i * 0.12,
              }}
              className="flex items-start gap-3 text-sm leading-relaxed text-theme-walnut dark:text-theme-ivory/70"
            >
              <span className="mt-[6px] h-[5px] w-[5px] shrink-0 rounded-full bg-theme-bronze" />
              {pt}
            </motion.li>
          ))}
        </ul>
      )}

      {/* ── TREATMENT B: stat numbers ── */}
      {extra.stats && extra.stats.length > 0 && (
        <div className="mt-5 flex gap-6">
          {extra.stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.38,
                ease: 'easeOut',
                delay: index * 0.08 + 0.3 + i * 0.1,
              }}
              className="flex flex-col gap-0.5"
            >
              <span className="font-display text-2xl font-semibold text-theme-ink dark:text-theme-ivory">
                {s.num}
              </span>
              <span className="text-[0.62rem] uppercase tracking-[0.15em] text-theme-walnut/60 dark:text-theme-ivory/40">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── TREATMENT C: progress bars ── */}
      {extra.bars && extra.bars.length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          {extra.bars.map((bar, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-theme-walnut/70 dark:text-theme-ivory/50">{bar.label}</span>
                <span className="font-medium text-theme-bronze">{bar.value}</span>
              </div>
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-theme-line/40 dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: barsVisible ? `${bar.pct}%` : 0 }}
                  transition={{
                    duration: 1,
                    ease: [0.22, 0.68, 0, 1.2],
                    delay: 0.35 + i * 0.15,
                  }}
                  className="h-full rounded-full bg-theme-bronze"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badge */}
      {extra.badge && (
        <span className="mt-5 inline-block w-fit rounded-full border border-theme-bronze/30 bg-theme-bronze/5 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-theme-bronze">
          {extra.badge}
        </span>
      )}

      {/* Watermark icon — very subtle, won't overpower */}
      {extra.icon && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-5 right-6 select-none font-display text-[5rem] leading-none text-theme-bronze/[0.07] dark:text-theme-bronze/[0.06]"
        >
          {extra.icon}
        </span>
      )}
    </motion.div>
  );
}

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
  const pillowTitle = isPrivacyPage
    ? 'A calm space to review your privacy choices.'
    : 'A clearer way to review store terms.';
  const pillowSubtitle = isPrivacyPage
    ? 'The layout keeps key sections and support details within easy reach while you read through account, order, and data-use information.'
    : 'Use the section index and support details to move quickly between account rules, payment guidance, delivery updates, and order support.';

  const sectionAnchors = useMemo(
    () =>
      sections.map((section, index) => ({
        ...section,
        anchorId: `policy-section-${index + 1}`,
      })),
    [sections]
  );

  const [activeSectionId, setActiveSectionId] = useState(
    sectionAnchors[0]?.anchorId ?? ''
  );

  useEffect(() => {
    if (!sectionAnchors.length) return;

    let frameId = 0;

    const updateActiveSection = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const triggerLine = window.innerHeight * 0.28;
        let nextActiveId = sectionAnchors[0].anchorId;

        for (const section of sectionAnchors) {
          const element = document.getElementById(section.anchorId);
          if (!element) continue;

          const rect = element.getBoundingClientRect();
          if (rect.top <= triggerLine) {
            nextActiveId = section.anchorId;
          }
        }

        setActiveSectionId((current) =>
          current === nextActiveId ? current : nextActiveId
        );
      });
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [sectionAnchors]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 py-12">

      {/* 1. HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={heroTransition}
        className="section-shell relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[rgba(18,14,11,0.36)] px-6 py-10 text-theme-ivory backdrop-blur-sm sm:px-10 sm:py-14 lg:rounded-[2rem] lg:px-14 lg:py-16"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-theme-bronze">
          {eyebrow}
        </span>

        <AnimatedHeading
          as="h1"
          className="mt-6 max-w-[18ch] font-display text-4xl leading-[1.1] text-balance text-theme-ivory sm:text-5xl lg:text-7xl"
        >
          {title}
        </AnimatedHeading>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-theme-ivory/70 sm:text-lg">
          {intro}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
          <p className="text-sm font-medium text-theme-ivory/50">
            Last updated: {lastUpdated}
          </p>
          <Link
            href="/faq"
            className="rounded-full border border-white/12 px-5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-theme-ivory/82 transition-colors hover:border-theme-bronze hover:text-theme-bronze"
          >
            Common Questions
          </Link>
        </div>
      </motion.section>

      {/* 2. HIGHLIGHTS GRID */}
      {highlights && highlights.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((highlight, index) => (
            <HighlightCard
              key={highlight.label}
              highlight={highlight}
              index={index}
              extra={CARD_EXTRAS[index] ?? {}}
            />
          ))}
        </div>
      )}

      {/* 3. INTERACTIVE PILLOW ZONE */}
      <div className="mt-8">
        <PillowDropZone
          title={pillowTitle}
          subtitle={pillowSubtitle}
          totalPillows={16}
          height={300}
        />
      </div>

      {/* 4. MAIN CONTENT AREA */}
      <div className="mt-16 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16 xl:gap-20">

        {/* LEFT SIDEBAR */}
        <motion.aside
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex w-full flex-col gap-8 lg:sticky lg:top-32 lg:w-[320px] lg:shrink-0 xl:w-[360px]"
        >
          {/* Index Menu */}
          <div className="rounded-[1.8rem] border border-theme-line/50 bg-white/40 p-6 dark:border-white/10 dark:bg-white/5">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-theme-ink dark:text-theme-ivory">
              On This Page
            </h3>
            <p className="mt-2 text-sm text-theme-walnut/70 dark:text-theme-ivory/50">
              Jump straight to the section you need without scanning the full page.
            </p>

            <nav className="mt-6 flex flex-col gap-2">
              {sectionAnchors.map((section, index) => {
                const isActive = section.anchorId === activeSectionId;
                return (
                  <Link
                    key={section.title}
                    href={`#${section.anchorId}`}
                    aria-current={isActive ? 'location' : undefined}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-theme-bronze text-white shadow-md'
                        : 'text-theme-walnut hover:bg-white/60 hover:text-theme-bronze dark:text-theme-ivory/70 dark:hover:bg-white/10'
                    }`}
                  >
                    <span
                      className={`text-[0.65rem] font-bold ${
                        isActive ? 'text-white/70' : 'text-theme-bronze'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {section.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Help Block */}
          <div className="rounded-[1.8rem] border border-theme-bronze/20 bg-theme-bronze/5 p-6 dark:bg-theme-bronze/10">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-theme-bronze">
              Need Quick Help?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-theme-walnut/80 dark:text-theme-ivory/70">
              For account questions, delivery issues, customization guidance, or privacy requests,
              contact the studio directly.
            </p>
            <div className="mt-5 space-y-2 text-sm font-medium text-theme-ink dark:text-theme-ivory">
              <a
                href={`mailto:${siteSetting.email}`}
                className="block transition-colors hover:text-theme-bronze"
              >
                {siteSetting.email}
              </a>
              <a
                href={`tel:${siteSetting.phone.replace(/\s+/g, '')}`}
                className="block transition-colors hover:text-theme-bronze"
              >
                {siteSetting.phone}
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-theme-ink px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-theme-bronze dark:bg-white dark:text-theme-ink dark:hover:bg-theme-bronze dark:hover:text-white"
              >
                Contact Studio
              </Link>
            </div>
          </div>
        </motion.aside>

        {/* RIGHT CONTENT */}
        <main className="flex-1 min-w-0 flex flex-col gap-10 lg:gap-14">
          {sectionAnchors.map((section, index) => (
            <motion.section
              id={section.anchorId}
              key={section.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.58, ease: 'easeOut', delay: index * 0.04 }}
              className="scroll-mt-32 rounded-[2rem] border border-theme-line/40 bg-white/60 p-6 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 sm:p-10"
            >
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-theme-bronze">
                Section {String(index + 1).padStart(2, '0')}
              </span>

              <h2 className="mt-4 font-display text-3xl text-theme-ink dark:text-theme-ivory sm:text-4xl">
                {section.title}
              </h2>

              <p className="mt-5 text-base leading-relaxed text-theme-walnut/80 dark:text-theme-ivory/70 sm:text-lg">
                {section.intro}
              </p>

              <div className="mt-8 flex flex-col gap-4">
                {section.points.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-4 rounded-[1.25rem] border border-theme-line/50 bg-white px-5 py-4 dark:border-white/10 dark:bg-[rgba(255,255,255,0.02)]"
                  >
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-theme-bronze" />
                    <p className="text-sm leading-relaxed text-theme-walnut dark:text-theme-ivory/80 sm:text-base">
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              {section.note ? (
                <div className="mt-8 rounded-[1.25rem] bg-theme-sand/30 p-5 dark:bg-white/5 sm:p-6">
                  <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-theme-ink dark:text-theme-ivory/90">
                    Good To Know
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-theme-walnut/80 dark:text-theme-ivory/70">
                    {section.note}
                  </p>
                </div>
              ) : null}
            </motion.section>
          ))}
        </main>
      </div>
    </div>
  );
}