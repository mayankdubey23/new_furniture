'use client';

import { motion } from 'framer-motion';
import AnimatedHeading from '../AnimatedHeading';

const SPEC_ICONS = {
  material: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <path d="M3 7l9 4 9-4" />
      <path d="M12 11v10" />
    </svg>
  ),
  foam: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
    </svg>
  ),
  dimensions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 3h18v18H3z" />
      <path d="M3 9h18M9 3v18" strokeLinecap="round" />
    </svg>
  ),
  weight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="3" />
      <path d="M7 8H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2" />
    </svg>
  ),
  warranty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

const SPEC_LABELS = {
  material: 'Material',
  foam: 'Foam & Fill',
  dimensions: 'Dimensions',
  weight: 'Weight',
  warranty: 'Warranty',
};

function getLabel(key) {
  return SPEC_LABELS[key.toLowerCase()] ?? key.replace(/_/g, ' ');
}

function getIcon(key) {
  return (
    SPEC_ICONS[key.toLowerCase()] || (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 3" strokeLinecap="round" />
      </svg>
    )
  );
}

function SpecCard({ children, className = '', delay = 0, tilt = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      whileHover={{ y: -10, scale: 1.015, rotateX: tilt.rotateX ?? 4, rotateY: tilt.rotateY ?? -4, ...tilt }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`group relative overflow-hidden rounded-[1.9rem] border border-theme-bronze/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(248,241,232,0.66))] shadow-[0_18px_44px_rgba(49,30,21,0.07)] dark:bg-[linear-gradient(145deg,rgba(50,39,33,0.44),rgba(24,18,15,0.72))] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.14),transparent_34%)]" />
      <div className="pointer-events-none absolute -right-8 top-0 h-28 w-28 rounded-full bg-theme-bronze/12 blur-[50px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </motion.div>
  );
}

export default function ProductSpecs({ specs }) {
  if (!specs) return null;

  const entries = Object.entries(specs).map(([key, value]) => ({
    key,
    label: getLabel(key),
    value,
    icon: getIcon(key),
  }));

  const heroEntry = entries.find((item) => item.key.toLowerCase() === 'dimensions') || entries[0];
  const supportEntries = entries.filter((item) => item.key !== heroEntry?.key);

  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-white/55 bg-[linear-gradient(165deg,rgba(255,255,255,0.42),rgba(246,238,229,0.78))] p-5 shadow-[0_34px_100px_rgba(49,30,21,0.08)] dark:border-white/10 dark:bg-[linear-gradient(165deg,rgba(43,33,28,0.58),rgba(20,15,12,0.84))] md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(102,114,95,0.1),transparent_22%)]" />
      <motion.div
        className="pointer-events-none absolute right-10 top-6 h-40 w-40 rounded-full bg-theme-bronze/12 blur-[90px]"
        animate={{ x: [0, 18, 0], y: [0, 14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex flex-col justify-between rounded-[2rem] border border-theme-bronze/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.66),rgba(248,241,232,0.42))] p-6 shadow-[0_16px_34px_rgba(49,30,21,0.05)] dark:bg-[linear-gradient(145deg,rgba(48,37,31,0.42),rgba(24,18,15,0.6))] md:p-7"
        >
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.38em] text-theme-bronze">Crafted Detail</p>
            <AnimatedHeading as="h3" className="mt-3 font-display text-[2rem] leading-[0.92] text-theme-ink md:text-[3rem]">
              Spec studio,
              {'\n'}
              not spec sheet.
            </AnimatedHeading>
            <p className="mt-4 max-w-md text-sm leading-7 text-theme-walnut/68 dark:text-theme-ink/58 md:text-base">
              A more architectural composition with stronger proportion, layered depth, and motion-driven cards instead of a common list.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {entries.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
                className="flex items-center gap-4 rounded-[1.3rem] border border-theme-bronze/12 bg-white/38 px-4 py-3 dark:bg-white/4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-theme-bronze/14 bg-white/62 text-theme-bronze dark:bg-white/5">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze/80">{item.label}</p>
                  <p className="mt-1 truncate text-sm text-theme-walnut/70 dark:text-theme-ink/62">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-12 md:auto-rows-[minmax(150px,auto)]">
          {heroEntry ? (
            <SpecCard className="md:col-span-7 md:row-span-2 p-6 md:p-7" delay={0.08} tilt={{ rotateX: 5, rotateY: -5 }}>
              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze/82">{heroEntry.label}</p>
                    <p className="mt-4 max-w-sm font-display text-[2.4rem] leading-[0.95] text-theme-ink dark:text-theme-ivory md:text-[3.6rem]">
                      {heroEntry.value}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-theme-bronze/16 bg-white/66 text-theme-bronze shadow-[0_10px_24px_rgba(49,30,21,0.05)] dark:bg-white/6">
                    {heroEntry.icon}
                  </div>
                </div>

                <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-[1.7rem] border border-theme-bronze/12 bg-[linear-gradient(145deg,rgba(26,22,19,0.96),rgba(56,40,30,0.88))] text-theme-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <motion.div
                    className="absolute h-44 w-44 rounded-full border border-theme-sand/25"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute h-28 w-28 rounded-full border border-theme-bronze/35"
                    animate={{ rotate: -360, scale: [1, 1.04, 1] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute h-3 w-3 rounded-full bg-theme-bronze shadow-[0_0_18px_rgba(165,106,63,0.7)]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '0 56px' }}
                  />
                  <div className="relative z-10 text-center">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-theme-sand/70">Primary Metric</p>
                    <p className="mt-3 font-display text-[2.2rem] leading-none text-theme-ivory md:text-[2.8rem]">{heroEntry.value}</p>
                  </div>
                </div>
              </div>
            </SpecCard>
          ) : null}

          {supportEntries[0] ? (
            <SpecCard className="md:col-span-5 p-5 md:p-6" delay={0.14} tilt={{ rotateX: 4, rotateY: 4 }}>
              <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze/78">{supportEntries[0].label}</p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-theme-bronze/16 bg-white/62 text-theme-bronze dark:bg-white/5">
                    {supportEntries[0].icon}
                  </div>
                </div>
                <p className="font-display text-[2rem] leading-tight text-theme-ink dark:text-theme-ivory md:text-[2.7rem]">
                  {supportEntries[0].value}
                </p>
                <p className="text-xs uppercase tracking-[0.28em] text-theme-walnut/46 dark:text-theme-ink/42">material-led selection</p>
              </div>
            </SpecCard>
          ) : null}

          {supportEntries[1] ? (
            <SpecCard className="md:col-span-5 p-5 md:-mt-3 md:p-6" delay={0.2} tilt={{ rotateX: 4, rotateY: -4 }}>
              <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze/78">{supportEntries[1].label}</p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-theme-bronze/16 bg-white/62 text-theme-bronze dark:bg-white/5">
                    {supportEntries[1].icon}
                  </div>
                </div>
                <p className="font-display text-[1.9rem] leading-tight text-theme-ink dark:text-theme-ivory md:text-[2.5rem]">
                  {supportEntries[1].value}
                </p>
                <p className="text-xs uppercase tracking-[0.28em] text-theme-walnut/46 dark:text-theme-ink/42">comfort architecture</p>
              </div>
            </SpecCard>
          ) : null}

          {supportEntries[2] ? (
            <SpecCard className="md:col-span-7 p-5 md:ml-3 md:p-6" delay={0.26} tilt={{ rotateX: 3, rotateY: 5 }}>
              <div className="relative z-10 flex h-full flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze/78">{supportEntries[2].label}</p>
                  <p className="mt-4 font-display text-[2rem] leading-tight text-theme-ink dark:text-theme-ivory md:text-[2.8rem]">
                    {supportEntries[2].value}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-theme-bronze/16 bg-white/62 text-theme-bronze dark:bg-white/5">
                    {supportEntries[2].icon}
                  </div>
                  <p className="max-w-[180px] text-xs uppercase tracking-[0.26em] text-theme-walnut/46 dark:text-theme-ink/42">
                    long-life service confidence
                  </p>
                </div>
              </div>
            </SpecCard>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[1.9rem] border border-dashed border-theme-bronze/18 bg-white/30 p-4 dark:bg-white/4 md:col-span-12"
          >
            <div className="grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">Studio Readout</p>
              <div className="flex flex-wrap gap-2">
                {entries.map((item) => (
                  <motion.span
                    key={item.key}
                    whileHover={{ y: -3, scale: 1.03 }}
                    className="rounded-full border border-theme-bronze/14 bg-white/58 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-theme-walnut/70 dark:bg-white/5 dark:text-theme-ink/65"
                  >
                    {item.label}
                  </motion.span>
                ))}
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-theme-walnut/45 dark:text-theme-ink/42">precision composed visually</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
