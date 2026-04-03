'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import ParallaxLayer from '@/components/ParallaxLayer';

const EthosScene = dynamic(() => import('@/components/canvas/EthosScene'), { ssr: false });

const pillars = [
  {
    number: '01',
    title: 'Material Depth',
    description: 'Velvet, saddle leather, brushed metals, and warm woods chosen for richness you can see and feel.',
  },
  {
    number: '02',
    title: 'Tailored Comfort',
    description: 'Proportions and cushioning designed to feel indulgent in daily life, not just in the showroom.',
  },
  {
    number: '03',
    title: 'Quiet Luxury',
    description: 'Forms that feel sculptural and refined, with enough restraint to live beautifully for years.',
  },
];

const editorialHighlights = [
  { label: 'Curated Rooms', value: '120+' },
  { label: 'Custom Finishes', value: '28' },
  { label: 'Studio-Led Process', value: '01:1' },
];

const titleLines = [
  'A furniture',
  'language built',
  'around warmth,',
  'shape, and',
  'permanence.',
];

function TiltCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className={`relative ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_34%)]" />
      {children}
    </motion.div>
  );
}

export default function About() {
  return (
    <section id="about" className="py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="section-shell before:hidden relative w-full overflow-hidden rounded-none border-y border-theme-line/70 bg-[linear-gradient(180deg,rgba(251,247,241,0.9),rgba(247,240,231,0.82))] px-8 py-10 shadow-[0_28px_100px_rgba(49,30,21,0.1)] dark:bg-[linear-gradient(180deg,rgba(34,27,23,0.88),rgba(24,18,15,0.86))] md:px-12 md:py-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.14),transparent_36%)]" />

        {/* ✅ Replaced animated blur-[80px]/blur-[96px] orbs with static gradients.
            Those blur filters forced GPU repaints every animation frame. */}
        <ParallaxLayer speed={-0.12} className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-gradient-to-br from-theme-bronze/14 to-transparent" />
        </ParallaxLayer>
        <ParallaxLayer speed={-0.18} className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-8 right-6 h-44 w-44 rounded-full bg-gradient-to-bl from-theme-olive/12 to-transparent" />
        </ParallaxLayer>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="space-y-6 lg:pr-8">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze"
            >
              Design Ethos
            </motion.p>

            <div className="space-y-1 font-display text-[3.2rem] leading-[0.9] text-theme-ink dark:text-theme-ivory md:text-[4.4rem]">
              {titleLines.map((line, index) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -26 : 26 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="origin-left"
                >
                  <span className="inline-block drop-shadow-[0_10px_24px_rgba(49,30,21,0.08)]">{line}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              {['Warm Materials', 'Liveable Luxury', 'Spatial Calm'].map((item) => (
                <motion.span
                  key={item}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="rounded-full border border-theme-bronze/22 bg-white/55 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze shadow-[0_8px_24px_rgba(49,30,21,0.06)] dark:bg-white/5"
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
            >
              {editorialHighlights.map((item, index) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -6 }}
                  className="rounded-[1.45rem] border border-theme-bronze/14 bg-white/62 px-4 py-4 shadow-[0_12px_32px_rgba(49,30,21,0.06)] dark:bg-white/5"
                >
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze/78">{item.label}</p>
                  <p className="mt-3 font-display text-3xl text-theme-ink dark:text-theme-ivory">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
            <TiltCard className="rounded-[2rem] lg:row-span-2" delay={0.1}>
              <div className="premium-surface h-full overflow-hidden rounded-[2rem] p-3">
                <div className="grid h-full gap-3 lg:grid-rows-[minmax(310px,1fr)_auto]">
                  <EthosScene />
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">Spatial System</p>
                      <p className="mt-2 font-display text-3xl leading-tight text-theme-ink dark:text-theme-ivory">
                        A sculptural interface for soft living.
                      </p>
                    </div>
                    <p className="max-w-xs text-sm leading-7 text-theme-walnut/72 dark:text-theme-ink/68">
                      Borrowing Jeton&apos;s layered-product rhythm while staying grounded in your furniture identity.
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>

            <TiltCard className="rounded-[1.75rem]" delay={0.18}>
              <div className="premium-surface rounded-[1.75rem] p-6 md:p-7">
                <p className="text-base leading-8 text-theme-walnut/80 dark:text-theme-ink/78 md:text-lg">
                  Luxe Decor is designed like an interior studio rather than a catalog. Every piece is chosen to balance tactile softness,
                  clean architecture, and a collected residential mood.
                </p>
                <p className="mt-6 text-base leading-8 text-theme-walnut/76 dark:text-theme-ink/74 md:text-lg">
                  The result is a home that feels elevated without feeling formal, where the hero pieces are expressive but the atmosphere
                  stays calm and livable.
                </p>
              </div>
            </TiltCard>

            <TiltCard className="rounded-[1.75rem]" delay={0.24}>
              <div className="premium-surface rounded-[1.75rem] p-6 md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">Flow Markers</p>
                  <div className="h-px flex-1 bg-theme-line" />
                </div>
                <div className="mt-6 grid gap-4">
                  {['Intro', '3D Preview', 'Gallery', 'Customization'].map((item, index) => (
                    <div key={item} className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-theme-walnut/62 dark:text-theme-ink/58">
                        0{index + 1}
                      </p>
                      <div className="h-px flex-1 bg-theme-line" />
                      <p className="text-sm text-theme-ink dark:text-theme-ivory">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, delay: 0.24, ease: 'easeOut' }}
          className="relative z-10 mt-8 overflow-hidden rounded-[1.85rem] border border-white/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(247,239,228,0.7))] p-6 shadow-[0_18px_50px_rgba(49,30,21,0.07)] dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(56,42,33,0.44),rgba(28,21,18,0.6))] md:p-7"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.13),transparent_32%)]" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="space-y-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">Studio Signature</p>
              <p className="max-w-2xl font-display text-[2rem] leading-tight text-theme-ink dark:text-theme-ivory md:text-[2.4rem]">
                Rooms composed with tactile calm, sculpted warmth, and a collector&apos;s eye for permanence.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-theme-walnut/76 dark:text-theme-ink/74 md:text-base">
                Each collection is treated like a layered interior story, balancing statement silhouettes with pieces that feel grounded and
                livable every day.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {['Design-led', 'Soft motion', 'Layered layout'].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-[1.35rem] border border-theme-bronze/18 bg-white/72 px-4 py-4 text-center shadow-[0_10px_28px_rgba(49,30,21,0.06)] dark:bg-white/6"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze/82">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 mt-10 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <TiltCard key={pillar.title} className="rounded-[1.75rem]" delay={0.18 + index * 0.1}>
              <div className="premium-surface h-full rounded-[1.75rem] p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">{pillar.number}</p>
                  <motion.div
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    className="h-8 w-8 rounded-full border border-theme-bronze/24 bg-theme-bronze/8"
                  />
                </div>
                <h3 className="mt-5 font-display text-3xl text-theme-ink dark:text-theme-ivory">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-7 text-theme-walnut/76 dark:text-theme-ink/74 md:text-base">
                  {pillar.description}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
