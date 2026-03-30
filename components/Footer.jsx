'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
  const container = useRef();
  const bigTextRef = useRef();
  const [time, setTime] = useState('');
  const [timeZone, setTimeZone] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.from(bigTextRef.current, {
      scrollTrigger: {
        trigger: container.current,
        start: 'top 92%',
        end: 'bottom bottom',
        scrub: 1,
      },
      y: 120,
      opacity: 0,
    });
  }, []);

  return (
    <footer
      ref={container}
      id="contact"
      className="relative mt-12 overflow-hidden bg-theme-ink px-6 pb-10 pt-24 text-theme-ivory md:px-10 md:pt-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,140,92,0.15),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Private Appointments</p>
            <h2 className="font-display mt-5 max-w-3xl text-5xl leading-none text-theme-ivory md:text-7xl">
              Build a living room that feels custom from the first glance.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-theme-ivory/72 md:text-lg">
              Speak with our design team for material guidance, room styling support, and delivery planning tailored to
              your home.
            </p>
          </div>

          <div className="premium-surface rounded-[2rem] p-7 text-theme-walnut dark:text-theme-ink md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Studio Contact</p>
            <div className="mt-6 space-y-3 text-base md:text-lg">
              <p>hello@luxedecor.com</p>
              <p>+91 98765 43210</p>
              <p>Mon to Sat, 10 AM - 7 PM</p>
            </div>

            <div className="mt-8 border-t border-theme-line pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-theme-bronze">Local Time</p>
              <p className="font-display mt-3 text-4xl text-theme-ink">{time || '00:00'}</p>
              <p className="mt-2 text-sm text-theme-walnut/70 dark:text-theme-ink/68">{timeZone}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Collections</p>
            <div className="mt-5 flex flex-col gap-3 text-theme-ivory/76">
              <a href="#sofas">Sofas</a>
              <a href="#recliners">Recliners</a>
              <a href="#pouffes">Accent Pouffes</a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Services</p>
            <div className="mt-5 flex flex-col gap-3 text-theme-ivory/76">
              <p>Material sampling</p>
              <p>Layout consultation</p>
              <p>White-glove delivery</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Follow</p>
            <div className="mt-5 flex flex-col gap-3 text-theme-ivory/76">
              <p>Instagram</p>
              <p>Pinterest</p>
              <p>Journal</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden border-t border-white/10 pt-10">
          <h1 ref={bigTextRef} className="font-display text-[19vw] leading-none tracking-[0.12em] text-white/8">
            LUXE
          </h1>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-xs font-semibold uppercase tracking-[0.28em] text-theme-ivory/42 md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} Luxe Decor</p>
          <div className="flex gap-6">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
