'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SofaVideoReveal() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Store the ScrollTrigger instance to kill it on unmount
  const scrollTriggerInstanceRef = useRef(null);

  const setupScrollTrigger = useCallback(() => {
    const video = videoRef.current;
    if (!video || !containerRef.current) return;

    // Kill any existing ScrollTrigger to prevent duplicates
    if (scrollTriggerInstanceRef.current) {
      scrollTriggerInstanceRef.current.kill();
    }

    setIsVideoReady(true);
    
    let ctx = gsap.context(() => {
      // Ek proxy object banayenge video time ko track karne ke liye
      let scrollObject = { time: 0 };

      const tl = gsap.to(scrollObject, {
        time: video.duration, // 0 se lekar video ke total seconds tak jayega
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=3500', // 3500px lamba scroll taaki aaram se reveal ho
          pin: true,
          // 1.5 second ka lag (scrub). Video mp4 formats mein scroll ke sath
          // jhatke (stutter) kha sakti hai. 1.5 use ekdum smooth butter jaisa bana dega.
          scrub: 1.5,
          // Add onLeave to handle unmounting
          onLeave: () => {},
          onLeaveBack: () => {},
        },
        onUpdate: () => {
          // Jab bhi user scroll karega, video ka time update ho jayega
          if (video.readyState >= 2) { 
            video.currentTime = scrollObject.time;
          }
        }
      });

      scrollTriggerInstanceRef.current = tl.scrollTrigger;
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cleanupFn = null;

    // Video ka metadata (duration etc.) load hone ka wait karna zaroori hai
    if (video.readyState >= 1) {
      cleanupFn = setupScrollTrigger();
    } else {
      const handleLoaded = () => {
        cleanupFn = setupScrollTrigger();
      };
      video.addEventListener('loadedmetadata', handleLoaded);
      return () => {
        video.removeEventListener('loadedmetadata', handleLoaded);
        if (cleanupFn) cleanupFn();
      };
    }

    return () => {
      if (cleanupFn) cleanupFn();
      if (scrollTriggerInstanceRef.current) {
        scrollTriggerInstanceRef.current.kill();
      }
    };
  }, [setupScrollTrigger]);

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
      
      {/* Loading state agar video aane mein time lag raha ho */}
      {!isVideoReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-theme-bronze border-t-transparent rounded-full animate-spin"></div>
            <p className="text-theme-bronze text-sm uppercase tracking-widest font-bold">Loading Video...</p>
          </div>
        </div>
      )}

      {/* THE VIDEO ELEMENT */}
      <video
        ref={videoRef}
        src="/sofa-video.mp4" // <-- APNE VIDEO KA SAHI PATH YAHAN DAALEIN
        className="w-full h-full object-cover"
        muted // Mute karna zaroori hai warna browser block kar dega
        playsInline // iPhones ke liye zaroori
        preload="auto"
      />

      {/* Foreground Text Overlay */}
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