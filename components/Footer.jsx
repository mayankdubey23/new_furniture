'use client';
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
  const container = useRef();
  const bigTextRef = useRef();
  
  const [time, setTime] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [timeZoneShort, setTimeZoneShort] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimeZone(detectedTimeZone || 'Local');

      const shortNamePart = new Intl.DateTimeFormat(undefined, {
        timeZoneName: 'short',
      })
        .formatToParts(now)
        .find((part) => part.type === 'timeZoneName');
      setTimeZoneShort(shortNamePart?.value || 'Local');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.from(bigTextRef.current, {
      scrollTrigger: {
        trigger: container.current,
        start: "top 90%",
        end: "bottom bottom",
        scrub: 1, 
      },
      y: 150,
      opacity: 0,
    });
  }, []);

  return (
    // bg-theme-brown ki jagah bg-theme-teak use kiya hai
    <footer 
      ref={container} 
      className="bg-theme-brown text-theme-beige pt-20 pb-8 px-6 md:px-16 overflow-hidden relative"
    >
      {/* WOOD TEXTURE OVERLAY - Yeh isko ekdum real lakdi jaisa look dega */}
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
      ></div>

      {/* Top Section: Newsletter & Links */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16 mb-24 relative z-10">
        
        {/* Left: Newsletter */}
        <div className="w-full md:w-1/3">
          <h3 className="text-3xl font-bold mb-6 text-white tracking-tight">Join the Inner Circle.</h3>
          <p className="text-theme-beige/80 mb-8 font-medium">
            Get exclusive access to new collections, design tips, and private sales.
          </p>
          <form className="relative group">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full bg-transparent border-b border-theme-beige/30 py-3 text-lg outline-none focus:border-white transition-colors duration-300 placeholder:text-theme-beige/50"
            />
            <button 
              type="submit" 
              className="absolute right-0 bottom-3 text-theme-beige/70 group-hover:text-white transition-colors duration-300 flex items-center gap-2 font-semibold tracking-wide uppercase text-sm"
            >
              Subscribe
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
          </form>
        </div>

        {/* Right: Grid Links */}
        <div className="w-full md:w-1/2 grid grid-cols-2 md:grid-cols-3 gap-10">
          
          <div className="flex flex-col space-y-4">
            <h4 className="text-white font-semibold tracking-widest uppercase text-xs mb-2 opacity-50">Explore</h4>
            <a href="#sofas" className="hover:text-white transition-colors w-fit relative group">
              Sofas
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-theme-teal transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#recliners" className="hover:text-white transition-colors w-fit relative group">Recliners</a>
            <a href="#pouffes" className="hover:text-white transition-colors w-fit relative group">Pouffes</a>
          </div>

          <div className="flex flex-col space-y-4">
            <h4 className="text-white font-semibold tracking-widest uppercase text-xs mb-2 opacity-50">Socials</h4>
            <a href="#" className="hover:text-white transition-colors w-fit">Instagram</a>
            <a href="#" className="hover:text-white transition-colors w-fit">Pinterest</a>
            <a href="#" className="hover:text-white transition-colors w-fit">Twitter</a>
          </div>

          <div className="flex flex-col space-y-4">
            <h4 className="text-white font-semibold tracking-widest uppercase text-xs mb-2 opacity-50">Studio</h4>
            <p className="text-theme-beige/80">hello@luxedecor.com</p>
            <p className="text-theme-beige/80">+91 98765 43210</p>
            
            <div className="mt-4 pt-4 border-t border-theme-beige/20">
              <p className="text-xs uppercase tracking-widest opacity-50 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-theme-teal rounded-full animate-pulse"></span>
                Local Time ({timeZone || 'Detecting...'})
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-theme-teal/20 rounded-lg flex items-center justify-center border border-theme-teal/40">
                  <svg className="w-6 h-6 text-theme-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-theme-teal tracking-wider">{time || '00:00:00'}</p>
                  <p className="text-xs text-theme-beige/60 uppercase tracking-wider">{timeZoneShort || 'Local'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Massive Brand Text at the Bottom */}
      <div className="w-full flex justify-center items-center overflow-hidden border-t border-theme-beige/10 pt-10 relative z-10">
        <h1 
          ref={bigTextRef}
          className="text-[18vw] leading-none font-extrabold text-theme-beige/10 tracking-tighter select-none"
        >
          LUXEDECOR
        </h1>
      </div>

      {/* Copyright Bar */}
      <div className="absolute bottom-6 left-0 w-full px-6 md:px-16 flex flex-col md:flex-row justify-between items-center text-xs font-semibold tracking-widest uppercase text-theme-beige/50 z-10">
        <p>© {new Date().getFullYear()} Luxe Decor.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>

    </footer>
  );
}
