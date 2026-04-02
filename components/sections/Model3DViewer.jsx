'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedHeading from '../AnimatedHeading';

const ModelViewer = dynamic(() => import('@/components/canvas/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-[1.6rem] bg-[radial-gradient(circle_at_top,_rgba(165,106,63,0.22),_rgba(251,247,241,0.96)_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(199,140,92,0.16),_rgba(34,27,23,0.92)_68%)]">
      <div className="h-16 w-16 rounded-full border-4 border-theme-bronze/20 border-t-theme-bronze animate-spin" />
    </div>
  ),
});

if (typeof window !== 'undefined' && !window.__scrollTriggerRegistered) {
  gsap.registerPlugin(ScrollTrigger);
  window.__scrollTriggerRegistered = true;
}

export default function Model3DViewer({ id, data, reverseLayout = false, surfaceClassName = 'bg-transparent' }) {
  const container = useRef();
  const modelRef = useRef();
  const textGroupRef = useRef();
  const [shouldLoadModel, setShouldLoadModel] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  useGSAP(
    () => {
      gsap.from(modelRef.current, {
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          end: 'top 35%',
          toggleActions: 'play none none reverse',
        },
        x: reverseLayout ? 120 : -120,
        opacity: 0,
        rotationY: reverseLayout ? -12 : 12,
        duration: 1.4,
        ease: 'power3.out',
      });

      if (!textGroupRef.current || !textGroupRef.current.children) return;
      const textElements = gsap.utils.toArray(textGroupRef.current.children);
      gsap.from(textElements, {
        scrollTrigger: {
          trigger: container.current,
          start: 'top 76%',
          toggleActions: 'play none none reverse',
        },
        y: 42,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power2.out',
      });
    },
    { scope: container }
  );

  if (!data?.imageUrl && !data?.modelPath) return null;

  return (
    <section id={id} className={`py-12 md:py-16 ${surfaceClassName}`}>
      <div
        ref={container}
        className={`section-shell before:hidden grid w-full gap-8 rounded-none border-y border-theme-line/70 px-8 py-8 md:grid-cols-[1.08fr_0.92fr] md:gap-10 md:px-12 md:py-10 ${
          reverseLayout ? 'md:[&>*:first-child]:order-2' : ''
        }`}
        style={{ perspective: 1000 }}
      >
        <div className="relative z-10 flex items-center justify-center">
          <motion.div
            ref={modelRef}
            whileHover={{ y: -8, rotateX: 1.2, rotateY: reverseLayout ? -1.2 : 1.2 }}
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
                <div className={`absolute inset-0 transition duration-500 ${modelLoaded ? 'opacity-100' : 'opacity-0'}`}>
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
                      <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-white/84">Loading 3D Model</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(26,22,19,0.02),rgba(26,22,19,0.15))]" />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="absolute bottom-5 left-5 right-5 z-10 grid gap-3 md:grid-cols-[1fr_auto] md:items-end"
              >
                <div className="rounded-[1.25rem] border border-white/20 bg-black/38 px-5 py-4 text-white backdrop-blur-md">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-white/72">
                    {data.modelPath ? 'Interactive 3D View' : 'Product Preview'}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/88">
                    {data.modelPath
                      ? 'Tap to load the live model. Until then, the section stays fast and shows a stable product preview instead of a blank box.'
                      : 'A clean preview stage for this product while the rest of the page handles gallery, finish selection, and purchase details.'}
                  </p>
                </div>
                {data.modelPath ? (
                  <div className="rounded-[1.25rem] border border-white/20 bg-black/38 px-4 py-4 text-white backdrop-blur-md">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-white/68">Live</p>
                    <p className="mt-2 font-display text-3xl leading-none text-white">360</p>
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-white/20 bg-black/38 px-4 py-4 text-white backdrop-blur-md">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-white/68">View</p>
                    <p className="mt-2 font-display text-3xl leading-none text-white">Still</p>
                  </div>
                )}
              </motion.div>
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

        <div ref={textGroupRef} className="relative z-0 flex flex-col justify-center">
          <div className="rounded-[2rem] border border-theme-line/70 bg-white/38 p-6 shadow-[0_16px_46px_rgba(49,30,21,0.05)] backdrop-blur-sm dark:bg-white/4 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">{data.eyebrow}</p>
            <AnimatedHeading as="h2" className="mt-5 font-display text-5xl leading-none text-theme-ink dark:text-white md:text-6xl">
              {data.name}
            </AnimatedHeading>
            <p className="mt-6 max-w-xl text-base leading-8 text-theme-walnut/80 dark:text-theme-ink/76 md:text-lg">{data.description}</p>
            <p className="mt-5 max-w-xl text-sm leading-7 text-theme-walnut/72 dark:text-theme-ink/68 md:text-base">
              This module now follows a more product-story layout: large media stage, clean information stack, and lighter decision points.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Interactive 360 inspection', 'Deferred heavy model loading', 'Large media-first presentation', 'Smoother layered motion'].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -4, scale: 1.02, rotateX: 3, rotateY: -3 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="rounded-[1.25rem] border border-theme-bronze/12 bg-white/58 px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/70 shadow-[0_10px_22px_rgba(49,30,21,0.04)] dark:bg-white/5 dark:text-theme-ink/70"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
            <motion.div
              whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="rounded-[1.7rem] border border-theme-bronze/12 bg-theme-ink px-6 py-6 text-theme-ivory shadow-[0_20px_50px_rgba(26,22,19,0.18)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-theme-sand/70">Starting At</p>
              <p className="mt-3 font-display text-5xl text-theme-ivory">Rs. {data.price.toLocaleString('en-IN')}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, rotateX: 3, rotateY: 4 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="rounded-[1.7rem] border border-theme-line/70 bg-white/42 p-6 shadow-[0_14px_40px_rgba(49,30,21,0.05)] dark:bg-white/4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">Consultation Flow</p>
                  <p className="mt-2 text-sm leading-7 text-theme-walnut/74 dark:text-theme-ink/68">
                    Speak with the studio for finish direction, room planning, and order guidance.
                  </p>
                </div>
                <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/contact"
                    className="rounded-full bg-theme-ink px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.28em] text-theme-ivory transition duration-300 hover:bg-theme-bronze dark:bg-white dark:text-theme-ink dark:hover:bg-theme-bronze dark:hover:text-white"
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
