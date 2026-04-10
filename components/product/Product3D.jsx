'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedHeading from '../AnimatedHeading';
import { PRODUCT_SVG_MOTIFS } from '@/lib/productSvgMotifs';

const ModelViewer = dynamic(() => import('@/components/canvas/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-[1.6rem] bg-[radial-gradient(circle_at_top,_rgba(165,106,63,0.22),_rgba(251,247,241,0.96)_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(199,140,92,0.16),_rgba(34,27,23,0.92)_68%)]">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-theme-bronze/20 border-t-theme-bronze" />
    </div>
  ),
});

export default function Product3D({ id, data, reverseLayout = false, surfaceClassName = 'bg-transparent', showIntroCard = true }) {
  const [shouldLoadModel, setShouldLoadModel] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const showHeadingChairMotif = String(data?.category || '').trim().toLowerCase() === 'chair';

  if (!data?.imageUrl && !data?.modelPath) return null;

  return (
    <section
      id={id}
      className={`relative z-[20] isolate overflow-hidden scroll-mt-36 py-12 md:scroll-mt-40 md:py-16 ${surfaceClassName}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,29,23,0.76),rgba(40,29,23,0.58))]" />
        <div className="absolute left-1/2 top-6 h-36 w-[28rem] max-w-[64vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(166,124,91,0.12),transparent_72%)] blur-3xl" />
        <div className="absolute inset-y-[18%] right-[3%] hidden w-[42%] rounded-[2.3rem] bg-[linear-gradient(180deg,rgba(26,20,16,0.22),rgba(26,20,16,0.12))] md:block" />
      </div>

      <div
        className={`relative z-10 section-shell before:hidden grid w-full gap-8 rounded-none border-y border-theme-line/70 px-8 py-8 md:grid-cols-[1.08fr_0.92fr] md:gap-10 md:px-12 md:py-10 ${
          reverseLayout ? 'md:[&>*:first-child]:order-2' : ''
        }`}
        style={{ perspective: 1000 }}
      >
        {showIntroCard ? (
          <div
            id={`${id}-start`}
            className="ps-block relative overflow-hidden scroll-mt-36 md:scroll-mt-40 md:col-span-2 rounded-[2.2rem] border border-theme-line/70 bg-white/50 px-6 py-8 text-center shadow-[0_18px_48px_rgba(49,30,21,0.05)] dark:bg-theme-mist/15 md:px-10 md:py-10"
          >
            {showHeadingChairMotif ? (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-1.5rem] top-[-1rem] hidden h-32 w-32 opacity-[0.14] md:block lg:right-6 lg:top-1/2 lg:h-52 lg:w-52 lg:-translate-y-1/2"
                animate={{ x: [0, -50, 0], y: [0, -24, 0], rotate: [6, 11, 6], scale: [1, 1.04, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(165,106,63,0.2),transparent_72%)] blur-2xl" />
                <Image
                  src={PRODUCT_SVG_MOTIFS.chair}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 13rem, 8rem"
                  className="object-contain mix-blend-multiply saturate-[0.82]"
                />
              </motion.div>
            ) : null}

            <div className="relative z-10">
              <span className="inline-block rounded-full border border-theme-bronze/30 bg-theme-bronze/8 px-5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.36em] text-theme-bronze">
                {data.eyebrow}
              </span>
              <AnimatedHeading as="h2" className="mt-4 font-display text-4xl text-theme-ink md:text-5xl lg:text-6xl">
                {data.name}
              </AnimatedHeading>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-theme-walnut/70 dark:text-theme-ink/65 md:text-base">
                {data.description}
              </p>
            </div>
          </div>
        ) : null}

        <div className="relative z-10 flex items-center justify-center md:col-span-1">
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="premium-surface relative w-full rounded-[2rem] p-3 md:p-4"
          >
            <div className="relative min-h-[320px] aspect-[1.02] overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_top,_rgba(165,106,63,0.16),_rgba(251,247,241,0.92)_68%)] dark:bg-[radial-gradient(circle_at_top,_rgba(199,140,92,0.14),_rgba(34,27,23,0.9)_68%)]">
              {data.imageUrl ? (
                <Image
                  src={data.imageUrl}
                  alt={`${data.name} preview`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-contain transition duration-500 ${modelLoaded ? 'opacity-0' : 'opacity-100'}`}
                />
              ) : null}

              {!shouldLoadModel && data.modelPath ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/12 backdrop-blur-[2px]">
                  <motion.button
                    type="button"
                    onClick={() => setShouldLoadModel(true)}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-full border border-white/25 bg-theme-ink/86 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-theme-ivory transition hover:bg-theme-bronze"
                  >
                    Load 3D View
                  </motion.button>
                </div>
              ) : null}

              {shouldLoadModel && data.modelPath ? (
                <div className="absolute inset-0 transition duration-500 opacity-100">
                  <ModelViewer glbPath={data.modelPath} onLoaded={() => setModelLoaded(true)} />
                </div>
              ) : null}

              <AnimatePresence>
                {shouldLoadModel && data.modelPath && !modelLoaded ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/18 backdrop-blur-[3px]"
                  >
                    <div className="flex flex-col items-center gap-4 rounded-[1.5rem] border border-white/20 bg-black/42 px-6 py-5 text-center text-white">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-white/84">Loading 3D Model</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(26,22,19,0.02),rgba(26,22,19,0.15))]" />

              <div className="absolute bottom-5 left-5 z-10 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-white/80">
                {data.modelPath ? 'Interactive 3D View' : 'Product Preview'}
              </div>
            </div>

            {data.eyebrow ? (
              <div className="pointer-events-none absolute left-8 top-8 z-20 rounded-full border border-theme-bronze/30 bg-black/40 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-white backdrop-blur-md">
                {data.eyebrow}
              </div>
            ) : null}

            {data.name ? (
              <div className="pointer-events-none absolute bottom-8 right-8 z-20 rounded-full border border-theme-bronze/30 bg-black/40 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-white backdrop-blur-md">
                {data.name}
              </div>
            ) : null}
          </motion.div>
        </div>

        <div className="relative z-0 flex flex-col justify-center md:col-span-1">
          <div className="rounded-[2rem] border border-theme-line/70 bg-white/55 p-6 shadow-[0_16px_46px_rgba(49,30,21,0.05)] dark:bg-theme-mist/15 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">3D View</p>
            <p className="mt-4 max-w-xl text-base leading-8 text-theme-walnut/80 dark:text-theme-ink/76 md:text-lg">
              Tap the model to load the live 3D experience, then continue through the product details below.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
            <motion.div
              whileHover={{ y: -6 }}
              className="rounded-[1.7rem] border border-theme-bronze/12 bg-theme-ink px-6 py-6 text-theme-ivory shadow-[0_20px_50px_rgba(26,22,19,0.18)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-theme-sand/70">Starting At</p>
              <p className="mt-3 font-display text-5xl text-theme-ivory">Rs. {data.price.toLocaleString('en-IN')}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-[1.7rem] border border-theme-line/70 bg-white/55 p-6 shadow-[0_14px_40px_rgba(49,30,21,0.05)] dark:bg-theme-mist/15"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">Consultation Flow</p>
                  <p className="mt-2 text-sm leading-7 text-theme-walnut/74 dark:text-theme-ink/68">
                    Speak with the studio for finish direction, room planning, and order guidance.
                  </p>
                </div>
                <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/contact"
                    className="inline-flex w-fit rounded-full bg-theme-ink px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-theme-ivory transition duration-300 hover:bg-theme-bronze dark:bg-white dark:text-[var(--theme-contrast-ink)] dark:hover:bg-theme-bronze dark:hover:text-white"
                  >
                    Book Consultation
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
