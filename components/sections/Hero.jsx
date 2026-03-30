'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Hero() {
  const container = useRef();
  const eyebrowRef = useRef();
  const titleRef = useRef();
  const descRef = useRef();
  const actionsRef = useRef();
  const mediaRef = useRef();
  const orbOneRef = useRef();
  const orbTwoRef = useRef();

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .fromTo(
          mediaRef.current,
          { clipPath: 'inset(18% 10% 22% 10% round 2rem)', scale: 1.08, opacity: 0 },
          { clipPath: 'inset(0% 0% 0% 0% round 2rem)', scale: 1, opacity: 1, duration: 1.6 }
        )
        .from(eyebrowRef.current, { y: 24, opacity: 0, duration: 0.7 }, '-=1.05')
        .from('.hero-line', { y: 80, opacity: 0, stagger: 0.12, duration: 1 }, '-=0.85')
        .from(descRef.current, { y: 24, opacity: 0, duration: 0.8 }, '-=0.65')
        .from(actionsRef.current, { y: 20, opacity: 0, duration: 0.75 }, '-=0.55');

      const handleMouseMove = (event) => {
        const xPos = (event.clientX / window.innerWidth - 0.5) * 40;
        const yPos = (event.clientY / window.innerHeight - 0.5) * 30;

        gsap.to(orbOneRef.current, { x: xPos, y: yPos, duration: 2.6, ease: 'power2.out' });
        gsap.to(orbTwoRef.current, { x: -xPos, y: -yPos, duration: 3, ease: 'power2.out' });
      };

      window.addEventListener('mousemove', handleMouseMove);
      gsap.to(orbOneRef.current, { rotation: 360, duration: 28, repeat: -1, ease: 'linear' });
      gsap.to(orbTwoRef.current, { rotation: -360, duration: 34, repeat: -1, ease: 'linear' });

      return () => window.removeEventListener('mousemove', handleMouseMove);
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      id="hero"
      className="section-shell relative min-h-screen overflow-hidden px-6 pb-12 pt-32 md:px-10 md:pt-36"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10">
          <div
            ref={eyebrowRef}
            className="mb-7 inline-flex items-center gap-3 rounded-full border border-theme-line bg-white/45 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-theme-bronze dark:bg-white/5"
          >
            <span className="h-2 w-2 rounded-full bg-theme-bronze" />
            Curated Furniture Studio
          </div>

          <div ref={titleRef} className="font-display text-[3.8rem] leading-[0.9] text-theme-ink sm:text-[4.8rem] md:text-[6.5rem] lg:text-[7.5rem]">
            <div className="hero-line">Furniture</div>
            <div className="hero-line text-theme-bronze">with Presence</div>
            <div className="hero-line text-theme-walnut/75 dark:text-theme-ink/70">for Modern Homes</div>
          </div>

          <p
            ref={descRef}
            className="mt-8 max-w-xl text-base leading-8 text-theme-walnut/78 dark:text-theme-ink/78 md:text-lg"
          >
            Discover sculpted seating, tailored textures, and warm material palettes designed to make your living room
            feel collected, elevated, and deeply comfortable.
          </p>

          <div ref={actionsRef} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#sofas"
              className="rounded-full bg-theme-ink px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.28em] text-theme-ivory transition duration-300 hover:bg-theme-bronze"
            >
              Explore Collection
            </a>
            <a
              href="#about"
              className="rounded-full border border-theme-line px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.28em] text-theme-walnut transition duration-300 hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ink"
            >
              Our Design Story
            </a>
          </div>

          <div className="mt-12 grid max-w-2xl gap-6 border-t border-theme-line pt-8 text-sm text-theme-walnut/76 dark:text-theme-ink/72 sm:grid-cols-3">
            <div>
              <div className="font-display text-3xl text-theme-ink">12+</div>
              <p className="mt-2 uppercase tracking-[0.2em]">Signature silhouettes</p>
            </div>
            <div>
              <div className="font-display text-3xl text-theme-ink">48h</div>
              <p className="mt-2 uppercase tracking-[0.2em]">Designer assistance</p>
            </div>
            <div>
              <div className="font-display text-3xl text-theme-ink">100%</div>
              <p className="mt-2 uppercase tracking-[0.2em]">Material transparency</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="premium-surface relative overflow-hidden rounded-[2rem] p-3 md:p-4">
            <div ref={mediaRef} className="relative h-[24rem] overflow-hidden rounded-[1.6rem] md:h-[42rem]">
              <video autoPlay loop muted playsInline className="h-full w-full object-cover scale-[1.04]">
                <source src="/Furniture_Assembles.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,22,19,0.02),rgba(26,22,19,0.28))]" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6 text-theme-ivory md:p-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-theme-ivory/70">Featured Edit</p>
                  <h2 className="font-display mt-2 text-3xl md:text-4xl">Milano Living Series</h2>
                </div>
                <div className="hidden rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.3em] md:block">
                  Hand-finished
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={orbOneRef}
        className="pointer-events-none absolute left-[-10rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-theme-bronze/15 blur-[130px]"
      />
      <div
        ref={orbTwoRef}
        className="pointer-events-none absolute bottom-[-8rem] right-[-4rem] h-[20rem] w-[20rem] rounded-full bg-theme-olive/16 blur-[130px]"
      />
    </section>
  );
}
