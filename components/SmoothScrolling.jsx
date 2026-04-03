'use client';

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function LenisBridge() {
  const pathname = usePathname();
  const lenis = useLenis();

  useLenis(() => {
    ScrollTrigger.update();
  }, [pathname]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const refreshId = window.requestAnimationFrame(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
    });

    return () => window.cancelAnimationFrame(refreshId);
  }, [lenis, pathname]);

  return null;
}

export default function SmoothScrolling({ children }) {
  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Detect slow connection
  const isSlowConnection = typeof navigator !== 'undefined' && (
    navigator.connection?.saveData || 
    navigator.connection?.effectiveType === 'slow-2g' ||
    navigator.connection?.effectiveType === '2g'
  );

  const shouldOptimize = prefersReducedMotion || isSlowConnection;

  return (
    <ReactLenis
      root
      options={{
        autoRaf: !shouldOptimize, // Only use RAF if not optimizing
        smoothWheel: !shouldOptimize, // Disable on slow connections
        lerp: shouldOptimize ? 0.15 : 0.08, // Faster lerp for performance
        duration: shouldOptimize ? 0.4 : 0.8, // Reduced duration
        syncTouch: true,
        wheelMultiplier: 0.9, // Slightly reduced  
        touchMultiplier: 1,
        overscroll: false,
        gestureOrientation: 'vertical',
        allowNestedScroll: false,
        stopInertiaOnNavigate: true,
        anchors: {
          offset: -140,
          duration: shouldOptimize ? 0.25 : 0.6, // Faster anchor scrolling
        },
      }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
