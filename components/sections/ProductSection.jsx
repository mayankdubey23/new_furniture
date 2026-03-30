'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// ScrollTrigger ko register karna zaroori hai
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductSection({ id, data, reverseLayout = false, bgColor = "bg-transparent" }) {
  const container = useRef();
  const imageRef = useRef();
  const textGroupRef = useRef();

  useGSAP(() => {
    // 1. Image Parallax Reveal Animation
    gsap.from(imageRef.current, {
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%", // Jab section screen ke 80% hisse par aaye
        end: "top 30%",
        toggleActions: "play none none reverse",
      },
      x: reverseLayout ? 100 : -100,
      opacity: 0,
      rotationY: reverseLayout ? -15 : 15, // 3D Tilt effect
      duration: 1.5,
      ease: "power3.out"
    });

    // 2. Text Stagger Animation
    // Text elements ko gsap.utils se select kar rahe hain
    const textElements = gsap.utils.toArray(textGroupRef.current.children);
    
    gsap.from(textElements, {
      scrollTrigger: {
        trigger: container.current,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.15, // Har line ke baad 0.15s ka gap
      ease: "back.out(1.5)"
    });

  }, { scope: container });

  if (!data) return null;

  return (
    <section 
      ref={container}
      id={id} 
      className={`min-h-screen flex flex-col ${reverseLayout ? 'md:flex-row-reverse' : 'md:flex-row'} items-center p-10 md:p-20 ${bgColor} overflow-hidden`}
      style={{ perspective: 1000 }} // 3D feel ke liye
    >
      {/* Image Section */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-4">
        <div 
          ref={imageRef}
          className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-theme-beige group"
        >
          <img 
            src={data.imageUrl} 
            alt={data.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-theme-brown/10 group-hover:bg-transparent transition-colors duration-500"></div>
        </div>
      </div>
      
      {/* Text Section */}
      <div 
        ref={textGroupRef}
        className={`w-full md:w-1/2 mt-10 md:mt-0 ${reverseLayout ? 'md:pr-20' : 'md:pl-20'}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-theme-forest">
          {data.name}
        </h2>
        <p className="text-theme-brown mb-6 text-lg leading-relaxed font-medium">
          {data.description}
        </p>
        <p className="text-3xl font-bold mb-8 text-theme-teal">
          ₹{data.price.toLocaleString('en-IN')}
        </p>
        <button className="bg-theme-teal text-white px-10 py-4 rounded-full hover:bg-theme-forest transition-colors duration-300 shadow-lg font-semibold text-lg tracking-wide hover:scale-105">
          Explore Collection
        </button>
      </div>
    </section>
  );
}