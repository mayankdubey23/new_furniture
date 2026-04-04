'use client';

import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 240;
const SCROLL_DISTANCE = 4000;
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

function getFrameSrc(index) {
  return `/sofa-sequence/ezgif-frame-${String(index).padStart(3, '0')}.jpg`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function SofaReveal() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    let cancelled = false;

    imagesRef.current = [];

    for (let i = 1; i <= FRAME_COUNT; i += 1) {
      const img = new Image();
      img.src = getFrameSrc(i);

      img.onload = async () => {
        try {
          await img.decode();
        } catch {}

        if (cancelled) return;

        loadedCount += 1;
        if (loadedCount >= FRAME_COUNT * 0.9) {
          setImagesLoaded(true);
        }
      };

      img.onerror = () => {
        if (cancelled) return;

        loadedCount += 1;
        if (loadedCount >= FRAME_COUNT * 0.9) {
          setImagesLoaded(true);
        }
      };

      imagesRef.current.push(img);
    }

    return () => {
      cancelled = true;
      imagesRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current || !imagesRef.current[0]) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const drawFrame = (frameIndex) => {
      const image = imagesRef.current[frameIndex];
      if (!image || !image.complete) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    const updateFrame = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const maxScroll = Math.max(section.offsetHeight - window.innerHeight, 1);
      const scrolled = clamp(-rect.top, 0, maxScroll);
      const progress = scrolled / maxScroll;
      const nextFrame = Math.round(progress * (FRAME_COUNT - 1));

      if (nextFrame !== frameRef.current) {
        frameRef.current = nextFrame;
        drawFrame(nextFrame);
        return;
      }

      if (frameRef.current === 0) {
        drawFrame(0);
      }
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(updateFrame);
    };

    drawFrame(0);
    requestUpdate();

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [imagesLoaded]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-zinc-950"
      style={{ height: `calc(100svh + ${SCROLL_DISTANCE}px)` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {!imagesLoaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-theme-bronze border-t-transparent" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-theme-bronze">
                Optimizing Experience...
              </p>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover will-change-transform"
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
        />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-start pt-32">
          <h2 className="text-center font-display text-5xl leading-tight text-white drop-shadow-2xl md:text-[5rem]">
            Unveil The <br /> Masterpiece
          </h2>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-white/80 drop-shadow-md">
            Scroll to uncover
          </p>
        </div>
      </div>
    </section>
  );
}
