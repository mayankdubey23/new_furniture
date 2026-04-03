'use client';

import { useRef, useEffect, useState } from 'react';
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
  const overlayRef = useRef();
  const orbOneRef = useRef();
  const orbTwoRef = useRef();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Simplified animations
      timeline
        .fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0)
        .from('.hero-piece-left', { x: -180, y: 24, rotate: -9, opacity: 0, duration: 1.05, ease: 'expo.out' }, '-=0.55')
        .from('.hero-piece-right', { x: 190, y: -20, rotate: 8, opacity: 0, duration: 1.05, ease: 'expo.out' }, '-=0.9')
        .from('.hero-piece-top', { y: -140, x: 36, rotate: -6, opacity: 0, duration: 0.95, ease: 'expo.out' }, '-=0.9')
        .from('.hero-piece-bottom', { y: 140, x: -28, rotate: 7, opacity: 0, duration: 0.95, ease: 'expo.out' }, '-=0.88')
        .from('.hero-piece-depth', { scale: 0.5, rotateX: -60, opacity: 0, duration: 1.05, ease: 'expo.out' }, '-=0.82');

      // Only on desktop, with better throttling (50ms intervals instead of per-frame)
      if (!isMobile && container.current) {
        let lastMoveTime = 0;
        const THROTTLE_MS = 50;
        let lastX = 0;
        let lastY = 0;

        const handleMouseMove = (event) => {
          const now = Date.now();
          if (now - lastMoveTime < THROTTLE_MS) return;

          lastMoveTime = now;
          lastX = event.clientX;
          lastY = event.clientY;

          const xPos = (lastX / window.innerWidth - 0.5) * 16;
          const yPos = (lastY / window.innerHeight - 0.5) * 10;

          gsap.to(orbOneRef.current, { x: xPos, y: yPos, duration: 2.5, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(orbTwoRef.current, { x: -xPos * 0.6, y: -yPos * 0.6, duration: 2.8, ease: 'power2.out', overwrite: 'auto' });
        };

        // Use passive listener for better scroll performance
        container.current.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Subtle continuous rotation - only on desktops
        gsap.to(orbOneRef.current, { rotation: 360, duration: 50, repeat: -1, ease: 'linear', overwrite: false });
        gsap.to(orbTwoRef.current, { rotation: -360, duration: 60, repeat: -1, ease: 'linear', overwrite: false });

        return () => {
          container.current?.removeEventListener('mousemove', handleMouseMove);
        };
      }
    },
    { scope: container, dependencies: [isMobile] }
  );

  return (
    <section ref={container} id="hero" className="relative h-[100svh] overflow-hidden bg-theme-ink">
      {/* Video background with lazy loading */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/hero-poster.jpg"
          className="h-full w-full object-cover object-center"
          style={{ objectFit: 'cover' }}
        >
          <source src="/Furniture_Assembles.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Overlay gradient */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.15),transparent_25%),linear-gradient(115deg,rgba(18,14,11,0.6)_10%,rgba(18,14,11,0.2)_45%,rgba(18,14,11,0.65)_100%)]"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[90rem] items-center px-6 pt-24 sm:px-10 md:px-14 md:pt-28 lg:px-20 lg:pt-32">
        <div className="max-w-[34rem] pb-10 sm:pb-12 lg:pb-14">
          {/* Badge - simplified, no backdrop blur */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/12 bg-black/30 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-ivory/80"
          >
            <span className="h-2 w-2 rounded-full bg-theme-bronze" />
            Sculpted Interiors
          </motion.div>

          {/* Title */}
          <div className="space-y-1 font-display text-[2.8rem] leading-[0.86] sm:text-[3.5rem] md:text-[4.25rem] lg:text-[4.9rem] xl:text-[5.3rem]">
            {titleRows.map((piece) => (
              <div key={piece.text}>
                <span className={`inline-block ${piece.className}`}>{piece.text}</span>
              </div>
            ))}
          </div>

          {/* Description */}
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

      {/* Animated orbs - using opacity instead of heavy blur */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={orbOneRef}
          className="absolute left-[-8rem] top-[12rem] h-[20rem] w-[20rem] rounded-full bg-gradient-to-br from-theme-bronze/8 to-theme-bronze/0 shadow-[0_0_60px_rgba(165,106,63,0.12)]"
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={orbTwoRef}
          className="absolute bottom-[-4rem] right-[-2rem] h-[18rem] w-[18rem] rounded-full bg-gradient-to-bl from-theme-olive/6 to-theme-olive/0 shadow-[0_0_50px_rgba(135,145,80,0.1)]"
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
        />
      </div>

      {/* Scroll indicator */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/20 px-5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-theme-ivory/60 md:block"
        >
          Scroll to uncover the collection
        </motion.div>
      </div>
    </section>
  );
}
