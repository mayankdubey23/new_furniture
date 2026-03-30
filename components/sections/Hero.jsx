'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Hero() {
  const container = useRef();
  
  // Element references
  const title1Ref = useRef();
  const title2Ref = useRef();
  const descRef = useRef();
  const btnRef = useRef();
  const mediaRef = useRef(); // Naya reference Image/Video container ke liye
  const blob1Ref = useRef();
  const blob2Ref = useRef();

  // Helper function: Text split karne ke liye
  const splitText = (text, className) => {
    return text.split('').map((char, index) => (
      <span 
        key={index} 
        className={`inline-block ${className}`}
        style={{ minWidth: char === ' ' ? '0.3em' : 'auto' }}
      >
        {char}
      </span>
    ));
  };

  useGSAP(() => {
    const tl = gsap.timeline();

    // 1. Premium Media Reveal (Video neeche se curtain ki tarah open hogi)
    tl.fromTo(mediaRef.current, 
      { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", scale: 1.1 },
      { 
        clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)", 
        scale: 1, 
        duration: 1.8, 
        ease: "power4.inOut" 
      }
    )

    // 2. Sleek Character Stagger Animation
    .from('.title-char', {
      y: 80, 
      opacity: 0,
      stagger: 0.03, 
      duration: 1.2,
      ease: "expo.out",
    }, "-=1.2")
    
    // 3. Cinematic Description Fade
    .from(descRef.current, {
      y: 20, 
      opacity: 0, 
      duration: 1.2, 
      ease: "power3.out"
    }, "-=0.9")
    
    // 4. Elegant Button Slide
    .from(btnRef.current, {
      opacity: 0, 
      y: 20,
      duration: 1, 
      ease: "power3.out"
    }, "-=0.8");

    // Subtle Mouse Parallax (Blobs)
    const handleMouseMove = (e) => {
      const xPos = (e.clientX / window.innerWidth - 0.5) * 50;
      const yPos = (e.clientY / window.innerHeight - 0.5) * 50;

      gsap.to(blob1Ref.current, { x: xPos, y: yPos, duration: 3, ease: "power2.out" });
      gsap.to(blob2Ref.current, { x: -xPos * 1.2, y: -yPos * 1.2, duration: 3.5, ease: "power2.out" });
    };

    window.addEventListener('mousemove', handleMouseMove);
    gsap.to(blob1Ref.current, { rotation: 360, duration: 30, repeat: -1, ease: "linear" });
    gsap.to(blob2Ref.current, { rotation: -360, duration: 35, repeat: -1, ease: "linear" });

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, { scope: container });

  return (
    <section 
      ref={container}
      id="hero" 
      className="min-h-screen flex items-center pt-24 pb-12 px-6 md:px-16 relative overflow-hidden bg-theme-beige"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col-reverse md:flex-row items-center justify-between z-10 gap-12">
        
        {/* Left Side: Text Content */}
        <div className="w-full md:w-1/2 text-center md:text-left flex flex-col md:items-start items-center">
          
          <h1 className="text-6xl md:text-[5.5rem] lg:text-[7rem] font-extrabold text-theme-brown leading-[1.1] tracking-tight mb-6 flex flex-col overflow-hidden py-2">
            <div ref={title1Ref} className="overflow-hidden">
              {splitText("Luxe", "title-char")}
            </div>
            <div ref={title2Ref} className="text-theme-forest overflow-hidden">
              {splitText("Comfort", "title-char")}
            </div>
          </h1>
          
          <p 
            ref={descRef}
            className="text-lg md:text-2xl text-theme-teal font-medium mb-10 max-w-lg md:mx-0 mx-auto"
          >
            Redefining your living space with minimalist design and nature-inspired elegance.
          </p>

          {/* Luxury Button */}
          <div ref={btnRef}>
            <button 
              className="bg-theme-brown text-theme-beige px-10 py-4 rounded-full font-medium text-lg tracking-wide hover:bg-theme-forest transition-colors duration-500 shadow-lg hover:shadow-xl"
            >
              Explore Collection
            </button>
          </div>
        </div>

        {/* Right Side: Cinematic Video Background */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-[75vh] relative">
          <div 
            ref={mediaRef}
            className="w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl relative"
          >
            {/* HTML5 Video Tag */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline // Mobile devices par auto-play ke liye zaroori hai
              className="w-full h-full object-cover scale-105" // scale-105 edges cover karne ke liye
            >
              <source src="/Furniture_Assembles.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Dark overlay taaki premium feel maintain rahe */}
            <div className="absolute inset-0 bg-black/15 mix-blend-multiply pointer-events-none"></div>
          </div>
        </div>

      </div>

      {/* Subtle Floating Blobs */}
      <div 
        ref={blob1Ref}
        className="absolute top-1/4 left-0 w-[40vw] h-[40vw] bg-theme-teal opacity-[0.08] rounded-full blur-[100px] pointer-events-none -z-0"
      />
      <div 
        ref={blob2Ref}
        className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-theme-forest opacity-[0.05] rounded-full blur-[120px] pointer-events-none -z-0"
      />
    </section>
  );
}