'use client';

import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';










export default function ParallaxLayer({
  children,
  className = '',
  speed = 0.12,
  offset = 0,
}) {
  const layerRef = useRef(null);
  const tickingRef = useRef(false);

  const rectCacheRef = useRef({ top: 0, height: 0, stamp: 0 });

  useLenis(
    () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        tickingRef.current = false;
        const element = layerRef.current;
        if (!element) return;

        const now = performance.now();
        let { top, height, stamp } = rectCacheRef.current;


        if (now - stamp > 100) {
          const rect = element.getBoundingClientRect();
          top = rect.top;
          height = rect.height;
          rectCacheRef.current = { top, height, stamp: now };
        }

        const viewportHeight = window.innerHeight || 1;
        const progress = (viewportHeight - top) / (viewportHeight + height);
        const translateY = (progress - 0.5) * viewportHeight * speed + offset;

        element.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      });
    },
    [speed, offset],
    1
  );

  useEffect(() => {
    const element = layerRef.current;
    if (!element) return;

    element.style.willChange = 'transform';
    element.style.transform = `translate3d(0, ${offset}px, 0)`;
  }, [offset]);

  return (
    <div ref={layerRef} className={className}>
      {children}
    </div>
  );
}
