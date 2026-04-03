'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';

const titleRows = [
  { text: 'Furniture', className: 'hero-piece hero-piece-left text-theme-ivory' },
  { text: 'that', className: 'hero-piece hero-piece-top text-theme-ivory/88' },
  { text: 'arrives', className: 'hero-piece hero-piece-right text-theme-bronze' },
  { text: 'like', className: 'hero-piece hero-piece-bottom text-theme-ivory/88' },
  { text: 'art.', className: 'hero-piece hero-piece-depth text-theme-ivory' },
];

export default function Hero() {
  const container = useRef();
  const mediaRef = useRef();
  const overlayRef = useRef();
  const orbOneRef = useRef();
  const orbTwoRef = useRef();

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .fromTo(
          mediaRef.current,
          { scale: 1.12, opacity: 0, filter: 'blur(10px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power2.out' }
        )
        .fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 1 }, '-=1.3')
        .from('.hero-piece-left', { x: -180, y: 24, rotate: -9, opacity: 0, duration: 1.05, ease: 'expo.out' }, '-=0.55')
        .from('.hero-piece-right', { x: 190, y: -20, rotate: 8, opacity: 0, duration: 1.05, ease: 'expo.out' }, '-=0.9')
        .from('.hero-piece-top', { y: -140, x: 36, rotate: -6, opacity: 0, duration: 0.95, ease: 'expo.out' }, '-=0.9')
        .from('.hero-piece-bottom', { y: 140, x: -28, rotate: 7, opacity: 0, duration: 0.95, ease: 'expo.out' }, '-=0.88')
        .from('.hero-piece-depth', { scale: 0.5, rotateX: -60, opacity: 0, duration: 1.05, ease: 'expo.out' }, '-=0.82');

      const handleMouseMove = (event) => {
        const xPos = (event.clientX / window.innerWidth - 0.5) * 32;
        const yPos = (event.clientY / window.innerHeight - 0.5) * 22;

        gsap.to(orbOneRef.current, { x: xPos, y: yPos, duration: 2.8, ease: 'power2.out' });
        gsap.to(orbTwoRef.current, { x: -xPos * 0.85, y: -yPos * 0.85, duration: 3, ease: 'power2.out' });
      };

      window.addEventListener('mousemove', handleMouseMove);
      gsap.to(orbOneRef.current, { rotation: 360, duration: 28, repeat: -1, ease: 'linear' });
      gsap.to(orbTwoRef.current, { rotation: -360, duration: 34, repeat: -1, ease: 'linear' });

      return () => window.removeEventListener('mousemove', handleMouseMove);
    },
    { scope: container }
  );

  return (
    <section ref={container} id="hero" className="relative h-[100svh] overflow-hidden">
      <div ref={mediaRef} className="absolute inset-0">
        <video autoPlay loop muted playsInline className="h-full w-full object-cover object-center">
          <source src="/Furniture_Assembles.mp4" type="video/mp4" />
        </video>
      </div>

      <div
        ref={overlayRef}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.18),transparent_22%),linear-gradient(115deg,rgba(18,14,11,0.58)_10%,rgba(18,14,11,0.24)_42%,rgba(18,14,11,0.6)_100%)]"
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[90rem] items-center px-6 pt-24 sm:px-10 md:px-14 md:pt-28 lg:px-20 lg:pt-32">
        <div className="max-w-[34rem] pb-10 sm:pb-12 lg:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/14 bg-black/24 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-ivory/82 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-theme-bronze" />
            Sculpted Interiors
          </motion.div>

          <div className="space-y-1 font-display text-[2.8rem] leading-[0.86] sm:text-[3.5rem] md:text-[4.25rem] lg:text-[4.9rem] xl:text-[5.3rem]">
            {titleRows.map((piece) => (
              <div key={piece.text}>
                <span className={`inline-block will-change-transform ${piece.className}`}>{piece.text}</span>
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-6 max-w-md text-sm leading-7 text-theme-ivory/72 md:text-base"
          >
            Discover statement seating, tactile finishes, and gallery-inspired furniture designed to make every room feel curated.
          </motion.p>

        </div>
      </div>

      <div
        ref={orbOneRef}
        className="pointer-events-none absolute left-[-8rem] top-[12rem] h-[24rem] w-[24rem] rounded-full bg-theme-bronze/18 blur-[130px]"
      />
      <div
        ref={orbTwoRef}
        className="pointer-events-none absolute bottom-[-6rem] right-[-3rem] h-[22rem] w-[22rem] rounded-full bg-theme-olive/18 blur-[130px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-white/12 bg-black/22 px-5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-theme-ivory/70 backdrop-blur-md md:block"
      >
        Scroll to uncover the collection
      </motion.div>
    </section>
  );
}
