ghts too much in text colors so i cant write'use client';

import { useEffect, useRef } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function LenisBridge() {
  const pathname = usePathname();
  const lenis = useLenis();
  const frameIdRef = useRef(0);

  useLenis(() => {
    ScrollTrigger.update();
  }, [pathname]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const refreshId = window.requestAnimationFrame(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshId);
      window.cancelAnimationFrame(frameIdRef.current);
    };
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

  // ✅ Performance-optimized Lenis configuration
  return (
    <ReactLenis
      root
      options={{
        // ✅ Core performance settings
        autoRaf: true, // Always use RAF for smooth scrolling
        smoothWheel: true,
        smoothTouch: false, // ✅ Disable smooth touch scrolling for better mobile performance
        
        // ✅ Reduced interpolation for snappier feel and better performance
        lerp: shouldOptimize ? 0.1 : 0.07,
        duration: shouldOptimize ? 0.3 : 0.6,
        
        // ✅ Optimized multipliers
        wheelMultiplier: 0.85,
        touchMultiplier: 1,
        
        // ✅ Disable features that cause lag
        infinite: false, // ✅ Important: disable infinite scrolling
        overscroll: false,
        syncTouch: false, // ✅ Disable sync touch for performance
        
        // ✅ Basic settings
        gestureOrientation: 'vertical',
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        
        // ✅ Anchor scroll optimization
        anchors: {
          offset: -140,
          duration: shouldOptimize ? 0.2 : 0.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ✅ Performance-optimized easing
        },
        
        // ✅ Touch settings for mobile
        touchInertiaMultiplier: 35,
        normalizeWheel: false, // ✅ Disable wheel normalization for performance
        prevent: null, // ✅ Don't prevent any default behavior
      }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
