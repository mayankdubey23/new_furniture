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
  const videoRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  let scrollTimeout;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    // Disable mouse tracking while scrolling
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useGSAP(
    () => {
      // Skip heavy animations on slow connections or prefers-reduced-motion
      const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isSlowConnection = navigator.connection?.saveData || 
                               navigator.connection?.effectiveType === 'slow-2g' ||
                               navigator.connection?.effectiveType === '2g';
      
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (prefersReducedMotion || isSlowConnection) {
        // Minimal animations for reduced motion or slow networks
        gsap.set([overlayRef.current, '.hero-piece'], { opacity: 1 });
      } else {
        // Full animations for normal users
        timeline
          .to(overlayRef.current, { opacity: 1, duration: 0.6 }, 0)
          .from('.hero-piece-left', { x: -120, y: 16, rotate: -6, opacity: 0, duration: 0.8, ease: 'expo.out' }, '-=0.3')
          .from('.hero-piece-right', { x: 120, y: -12, rotate: 5, opacity: 0, duration: 0.8, ease: 'expo.out' }, '-=0.65')
          .from('.hero-piece-top', { y: -90, x: 20, rotate: -4, opacity: 0, duration: 0.75, ease: 'expo.out' }, '-=0.7')
          .from('.hero-piece-bottom', { y: 90, x: -16, rotate: 4, opacity: 0, duration: 0.75, ease: 'expo.out' }, '-=0.7')
          .from('.hero-piece-depth', { scale: 0.7, opacity: 0, duration: 0.75, ease: 'expo.out' }, '-=0.65');
      }

      // Only run mouse tracking on desktop and when not scrolling
      if (!isMobile && container.current) {
        let ticking = false;
        let lastX = 0;
        let lastY = 0;

        const handleMouseMove = (event) => {
          if (isScrolling) return;
          
          lastX = event.clientX;
          lastY = event.clientY;

          if (!ticking) {
            requestAnimationFrame(() => {
              const xPos = (lastX / window.innerWidth - 0.5) * 12;
              const yPos = (lastY / window.innerHeight - 0.5) * 8;

              gsap.to(orbOneRef.current, { x: xPos, y: yPos, duration: 4, ease: 'power2.out', overwrite: 'auto' });
              gsap.to(orbTwoRef.current, { x: -xPos * 0.6, y: -yPos * 0.6, duration: 4.5, ease: 'power2.out', overwrite: 'auto' });
              ticking = false;
            });
            ticking = true;
          }
        };

        // Passive listener for better scroll performance
        container.current.addEventListener('mousemove', handleMouseMove, { passive: true });
        
        // Subtle continuous rotation - use GPU acceleration
        gsap.to(orbOneRef.current, { rotation: 360, duration: 40, repeat: -1, ease: 'linear', overwrite: false });
        gsap.to(orbTwoRef.current, { rotation: -360, duration: 50, repeat: -1, ease: 'linear', overwrite: false });

        return () => {
          container.current?.removeEventListener('mousemove', handleMouseMove);
        };
      }
    },
    { scope: container, dependencies: [isMobile, isScrolling] }
  );

  return (
    <section ref={container} id="hero" className="relative h-[100svh] overflow-hidden bg-theme-ink">
      {/* Ultra-optimized video with lazy loading and restart on refresh */}
      <video 
        key="hero-video"
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline 
        preload="none"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ 
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
        }}
        onLoadedMetadata={(e) => {
          e.currentTarget.currentTime = 0;
        }}
      >
        <source src="/Furniture_Assembles.mp4#t=0" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.18),transparent_22%),linear-gradient(115deg,rgba(18,14,11,0.58)_10%,rgba(18,14,11,0.24)_42%,rgba(18,14,11,0.6)_100%)]"
        style={{ willChange: 'opacity', transform: 'translate3d(0, 0, 0)' }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[90rem] items-center px-6 pt-24 sm:px-10 md:px-14 md:pt-28 lg:px-20 lg:pt-32" style={{ transform: 'translate3d(0, 0, 0)' }}>
        <div className="max-w-[34rem] pb-10 sm:pb-12 lg:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/14 bg-black/30 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-ivory/80"
            style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
          >
            <span className="h-2 w-2 rounded-full bg-theme-bronze" />
            Sculpted Interiors
          </motion.div>

          <div className="space-y-1 font-display text-[2.8rem] leading-[0.86] sm:text-[3.5rem] md:text-[4.25rem] lg:text-[4.9rem] xl:text-[5.3rem]" style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}>
            {titleRows.map((piece) => (
              <div key={piece.text} style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}>
                <span className={`inline-block ${piece.className}`} style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}>{piece.text}</span>
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-md text-sm leading-7 text-theme-ivory/72 md:text-base"
            style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
          >
            Discover statement seating, tactile finishes, and gallery-inspired furniture designed to make every room feel curated.
          </motion.p>
        </div>
      </div>

      {/* Animated orbs - optimized using gradients instead of blur */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ willChange: 'contents' }}>
        <div
          ref={orbOneRef}
          className="absolute left-[-8rem] top-[12rem] h-[20rem] w-[20rem] rounded-full bg-gradient-to-br from-theme-bronze/8 to-theme-bronze/0 shadow-[0_0_60px_rgba(165,106,63,0.12)]"
          style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ willChange: 'contents' }}>
        <div
          ref={orbTwoRef}
          className="absolute bottom-[-4rem] right-[-2rem] h-[18rem] w-[18rem] rounded-full bg-gradient-to-bl from-theme-olive/6 to-theme-olive/0 shadow-[0_0_50px_rgba(135,145,80,0.1)]"
          style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
        />
      </div>

      {/* Scroll indicator */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/25 px-5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-theme-ivory/65 md:block"
          style={{ willChange: 'transform' }}
        >
          Scroll to uncover the collection
        </motion.div>
      </div>
    </section>
  );
}
