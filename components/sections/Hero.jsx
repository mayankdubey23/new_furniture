'use client';

import { useRef, useEffect, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';
import { DEFAULT_SITE_CONTENT } from '@/lib/content/siteContent';

export default function Hero({ content = DEFAULT_SITE_CONTENT.hero }) {
  const container = useRef();
  const overlayRef = useRef();
  const orbOneRef = useRef();
  const orbTwoRef = useRef();
  const videoRef = useRef();

  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const isMobile = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mediaQuery = window.matchMedia('(max-width: 767px)');
      mediaQuery.addEventListener('change', onStoreChange);
      return () => mediaQuery.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(max-width: 767px)').matches,
    () => false
  );

  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useGSAP(
    () => {
      const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isSlowConnection =
        navigator.connection?.saveData ||
        navigator.connection?.effectiveType === 'slow-2g' ||
        navigator.connection?.effectiveType === '2g';

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (prefersReducedMotion || isSlowConnection) {
        gsap.set([overlayRef.current, '.hero-piece'], { opacity: 1 });
      } else {
        timeline
          .to(overlayRef.current, { opacity: 1, duration: 0.6 }, 0)
          .from('.hero-piece-left', { x: -120, y: 16, rotate: -6, opacity: 0, duration: 0.8, ease: 'expo.out' }, '-=0.3')
          .from('.hero-piece-right', { x: 120, y: -12, rotate: 5, opacity: 0, duration: 0.8, ease: 'expo.out' }, '-=0.65')
          .from('.hero-piece-top', { y: -90, x: 20, rotate: -4, opacity: 0, duration: 0.75, ease: 'expo.out' }, '-=0.7')
          .from('.hero-piece-bottom', { y: 90, x: -16, rotate: 4, opacity: 0, duration: 0.75, ease: 'expo.out' }, '-=0.7')
          .from('.hero-piece-depth', { scale: 0.7, opacity: 0, duration: 0.75, ease: 'expo.out' }, '-=0.65');
      }



      if (!isMobile && container.current) {
        let lastMoveTime = 0;
        const THROTTLE_MS = 50;

        const handleMouseMove = (event) => {
          if (isScrollingRef.current) return;
          const now = Date.now();
          if (now - lastMoveTime < THROTTLE_MS) return;
          lastMoveTime = now;

          const xPos = (event.clientX / window.innerWidth - 0.5) * 12;
          const yPos = (event.clientY / window.innerHeight - 0.5) * 8;

          gsap.to(orbOneRef.current, { x: xPos, y: yPos, duration: 4, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(orbTwoRef.current, { x: -xPos * 0.6, y: -yPos * 0.6, duration: 4.5, ease: 'power2.out', overwrite: 'auto' });
        };

        container.current.addEventListener('mousemove', handleMouseMove, { passive: true });

        gsap.to(orbOneRef.current, { rotation: 360, duration: 40, repeat: -1, ease: 'linear', overwrite: false });
        gsap.to(orbTwoRef.current, { rotation: -360, duration: 50, repeat: -1, ease: 'linear', overwrite: false });

        return () => {
          container.current?.removeEventListener('mousemove', handleMouseMove);
        };
      }
    },

    { scope: container, dependencies: [isMobile] }
  );

  return (
    <section ref={container} id="hero" className="relative h-[100svh] overflow-hidden bg-theme-ink">

      <video
        ref={videoRef}
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        preload={content.video.preload || 'none'}
        disablePictureInPicture
        className="absolute inset-0 block h-full w-full min-h-full min-w-full object-cover object-center"
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0; }}
      >
        <source src={`${content.video.src}#t=0`} type={content.video.type || 'video/mp4'} />
      </video>


      <div
        ref={overlayRef}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.18),transparent_22%),linear-gradient(115deg,rgba(18,14,11,0.58)_10%,rgba(18,14,11,0.24)_42%,rgba(18,14,11,0.6)_100%)]"
      />


      <div className="relative z-10 mx-auto flex h-full w-full max-w-[90rem] items-center px-6 pt-24 sm:px-10 md:px-14 md:pt-28 lg:px-20 lg:pt-32">
        <div className="max-w-[34rem] pb-10 sm:pb-12 lg:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/14 bg-black/30 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-ivory/80"
          >
            <span className="h-2 w-2 rounded-full bg-theme-bronze" />
            {content.eyebrow}
          </motion.div>


          <div className="space-y-1 font-display text-[2.8rem] leading-[0.86] sm:text-[3.5rem] md:text-[4.25rem] lg:text-[4.9rem] xl:text-[5.3rem]">
            {content.titleRows.map((piece) => (
              <div key={piece.text}>
                <span className={`inline-block ${piece.className}`}>{piece.text}</span>
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-md text-sm leading-7 text-theme-ivory/72 md:text-base"
          >
            {content.description}
          </motion.p>
        </div>
      </div>


      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={orbOneRef}
          className="absolute left-[-8rem] top-[12rem] h-[20rem] w-[20rem] rounded-full bg-gradient-to-br from-theme-bronze/8 to-theme-bronze/0 shadow-[0_0_60px_rgba(165,106,63,0.12)]"
          style={{ willChange: 'transform', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={orbTwoRef}
          className="absolute bottom-[-4rem] right-[-2rem] h-[18rem] w-[18rem] rounded-full bg-gradient-to-bl from-theme-olive/6 to-theme-olive/0 shadow-[0_0_50px_rgba(135,145,80,0.1)]"
          style={{ willChange: 'transform', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        />
      </div>


      <div className="pointer-events-none absolute inset-0 z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/25 px-5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-theme-ivory/65 md:block"
        >
          {content.scrollHint}
        </motion.div>
      </div>
    </section>
  );
}
