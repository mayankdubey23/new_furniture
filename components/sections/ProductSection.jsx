'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined' && !window.__scrollTriggerRegistered) {
  gsap.registerPlugin(ScrollTrigger);
  window.__scrollTriggerRegistered = true;
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
        {/* MEDIA CONTAINER */}
        <div className="flex items-center justify-center relative z-10">
          <div ref={imageRef} className="premium-surface relative w-full rounded-[2rem] p-3 md:p-4">
            <div className="relative aspect-[1.02] min-h-[320px] rounded-[1.6rem] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(165,106,63,0.16),_rgba(251,247,241,0.92)_68%)] dark:bg-[radial-gradient(circle_at_top,_rgba(199,140,92,0.14),_rgba(34,27,23,0.9)_68%)]">
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt={data.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-theme-mist/20" />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,22,19,0.02),rgba(26,22,19,0.22))] pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 z-10 rounded-[1.25rem] border border-white/20 bg-black/38 px-5 py-4 text-white backdrop-blur-md">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-white/72">Product Preview</p>
                <p className="mt-2 text-sm leading-6 text-white/88">
                  A clean image-led section for quick browsing, with the detailed 3D showcase living in its own separate section above.
                </p>
              </div>
            </div>

            <div className="absolute right-8 top-8 rounded-full border border-theme-bronze/30 bg-black/40 backdrop-blur-md px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-white z-20 pointer-events-none">
              {data.eyebrow}
            </div>
          </div>
        </div>

        {/* TEXT CONTAINER */}
        <div ref={textGroupRef} className="flex flex-col justify-center relative z-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">{data.eyebrow}</p>
          <h2 className="font-display mt-5 text-5xl leading-none text-theme-ink dark:text-white md:text-6xl">{data.name}</h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-theme-walnut/80 dark:text-theme-ink/76 md:text-lg">{data.description}</p>
          <p className="mt-5 max-w-xl text-sm leading-7 text-theme-walnut/72 dark:text-theme-ink/68 md:text-base">
            This section stays focused on the product image, pricing, and details so visitors can scan the catalog quickly.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut/70 dark:text-theme-ink/70">
            <span className="rounded-full border border-theme-line px-4 py-2">Hand-finished details</span>
            <span className="rounded-full border border-theme-line px-4 py-2">Made for lounge comfort</span>
            {data.glbPath ? <span className="rounded-full border border-theme-line px-4 py-2">Dedicated 3D section above</span> : null}
          </div>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-theme-walnut/55 dark:text-theme-ink/55">Starting At</p>
              <p className="font-display mt-2 text-5xl text-theme-bronze">Rs. {data.price.toLocaleString('en-IN')}</p>
            </div>

            <a
              href="#contact"
              className="rounded-full bg-theme-ink dark:bg-white dark:text-theme-ink px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.28em] text-theme-ivory transition duration-300 hover:bg-theme-bronze dark:hover:bg-theme-bronze dark:hover:text-white"
            >
              Book Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
