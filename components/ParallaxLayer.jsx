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

  useLenis(
    () => {
      const element = layerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const translateY = (progress - 0.5) * viewportHeight * speed + offset;

      element.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
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
