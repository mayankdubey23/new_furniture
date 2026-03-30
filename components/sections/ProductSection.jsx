'use client';

import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductSection({ id, data, reverseLayout = false, surfaceClassName = 'bg-transparent' }) {
  const container = useRef();
  const imageRef = useRef();
  const textGroupRef = useRef();

  useGSAP(
    () => {
      gsap.from(imageRef.current, {
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

  if (!data) return null;

  return (
    <section id={id} className={`px-6 py-18 md:px-10 md:py-24 ${surfaceClassName}`}>
      <div
        ref={container}
        className={`section-shell mx-auto grid max-w-7xl gap-10 rounded-[2rem] px-8 py-10 md:grid-cols-2 md:gap-14 md:px-12 md:py-14 ${
          reverseLayout ? 'md:[&>*:first-child]:order-2' : ''
        }`}
        style={{ perspective: 1000 }}
      >
        <div className="flex items-center justify-center">
          <div ref={imageRef} className="premium-surface relative w-full overflow-hidden rounded-[2rem] p-3 md:p-4">
            <div className="relative aspect-[0.95] overflow-hidden rounded-[1.6rem]">
              <Image
                src={data.imageUrl}
                alt={data.name}
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,22,19,0.02),rgba(26,22,19,0.3))]" />
            </div>
            <div className="absolute left-8 top-8 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-white">
              {data.eyebrow}
            </div>
          </div>
        </div>

        <div ref={textGroupRef} className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">{data.eyebrow}</p>
          <h2 className="font-display mt-5 text-5xl leading-none text-theme-ink md:text-6xl">{data.name}</h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-theme-walnut/80 dark:text-theme-ink/76 md:text-lg">{data.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut/70 dark:text-theme-ink/70">
            <span className="rounded-full border border-theme-line px-4 py-2">Hand-finished details</span>
            <span className="rounded-full border border-theme-line px-4 py-2">Made for lounge comfort</span>
          </div>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-theme-walnut/55 dark:text-theme-ink/55">Starting At</p>
              <p className="font-display mt-2 text-5xl text-theme-bronze">Rs. {data.price.toLocaleString('en-IN')}</p>
            </div>

            <a
              href="#contact"
              className="rounded-full bg-theme-ink px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.28em] text-theme-ivory transition duration-300 hover:bg-theme-bronze"
            >
              Book Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
