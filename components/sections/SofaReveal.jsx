'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SofaReveal() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // 1. SEQUENCE SETTINGS (Updated for 240 Ezgif frames)
  const frameCount = 240; 
  
  // Naming format: ezgif-frame-001.jpg, ezgif-frame-002.jpg, etc.
  const currentFrame = (index) => `/sofa-sequence/ezgif-frame-${String(index).padStart(3, '0')}.jpg`; 

  const imagesRef = useRef([]);

  // 2. PRELOAD IMAGES
  useEffect(() => {
    let loadedCount = 0;
    
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImagesLoaded(true);
        }
      };
      // Agar koi image load hone mein fail ho jaye tab bhi counter aage badhe
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === frameCount) setImagesLoaded(true);
      };
      imagesRef.current.push(img);
    }
  }, [frameCount]);

  // 3. GSAP CANVAS ANIMATION
  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Canvas resolution (Aap isko apni images ke actual resolution se match kar sakte hain)
    canvas.width = 1920;
    canvas.height = 1080;

    // Pehli image ko canvas par paint karna
    if (imagesRef.current[0]) {
      context.drawImage(imagesRef.current[0], 0, 0, canvas.width, canvas.height);
    }

    let ctx = gsap.context(() => {
      const playhead = { frame: 0 };

      gsap.to(playhead, {
        frame: frameCount - 1,
        snap: 'frame', 
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          // Distance badha diya hai taaki 240 frames aaram se smooth play hon
          end: '+=3500', 
          pin: true,
          scrub: 0.5, 
        },
        onUpdate: () => {
          if (imagesRef.current[playhead.frame]) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(imagesRef.current[playhead.frame], 0, 0, canvas.width, canvas.height);
          }
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [imagesLoaded, frameCount]);

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
      
      {/* Loading State */}
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-theme-bronze border-t-transparent rounded-full animate-spin"></div>
            <p className="text-theme-bronze text-sm uppercase tracking-widest font-bold">Loading Experience...</p>
          </div>
        </div>
      )}

      {/* The Magic Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover" 
      />

      {/* Foreground Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-32 pointer-events-none z-10">
        <h2 className="text-5xl md:text-[5rem] font-display text-white drop-shadow-2xl text-center leading-tight">
          Unveil The <br/> Masterpiece
        </h2>
        <p className="mt-6 text-sm uppercase tracking-[0.3em] font-bold text-white/80">
          Scroll to uncover
        </p>
      </div>

    </section>
  );
}