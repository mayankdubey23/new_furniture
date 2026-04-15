'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useOptimizePerformance } from '@/hooks/useOptimizePerformance';

function ScrollResetOnReload() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();

    const frameId = window.requestAnimationFrame(resetScroll);
    const timeoutId = window.setTimeout(resetScroll, 80);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return null;
}

function LenisBridge() {
  const pathname = usePathname();
  const lenis = useLenis();
  const hasResetInitialScroll = useRef(false);

  useLenis(() => {
    ScrollTrigger.update();
  }, [pathname]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const refreshId = window.requestAnimationFrame(() => {
      if (!hasResetInitialScroll.current) {
        lenis?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        hasResetInitialScroll.current = true;
      }

      lenis?.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshId);
    };
  }, [lenis, pathname]);

  return null;
}

export default function SmoothScrolling({ children }) {
  const { shouldReduceAnimations } = useOptimizePerformance();
  const allowDesktopSmoothScroll = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mediaQuery = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
      mediaQuery.addEventListener('change', onStoreChange);
      return () => mediaQuery.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches,
    () => false
  );

  if (!allowDesktopSmoothScroll || shouldReduceAnimations) {
    return (
      <>
        <ScrollResetOnReload />
        {children}
      </>
    );
  }

  return (
    <>
      <ScrollResetOnReload />
      <ReactLenis
        root
        options={{
          autoRaf: true,
          smoothWheel: true,
          smoothTouch: false,
          lerp: 0.1,
          duration: 0.45,
          wheelMultiplier: 0.85,
          touchMultiplier: 1,
          infinite: false,
          overscroll: false,
          syncTouch: false,
          gestureOrientation: 'vertical',
          allowNestedScroll: true,
          stopInertiaOnNavigate: true,
          anchors: {
            offset: -140,
            duration: 0.35,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          },
          touchInertiaMultiplier: 35,
          normalizeWheel: false,
          prevent: null,
        }}
      >
        <LenisBridge />
        {children}
      </ReactLenis>
    </>
  );
}
