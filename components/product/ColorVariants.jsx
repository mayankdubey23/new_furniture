'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import AnimatedHeading from '../AnimatedHeading';

function ColorImage({ src, alt, className }) {
  if (!src) return null;
  if (src.startsWith('http')) return <img src={src} alt={alt} className={className} />;
  return <NextImage src={src} alt={alt} fill className={className} sizes="(max-width: 768px) 100vw, 50vw" />;
}

function SwatchImage({ src, alt, className }) {
  if (!src) return null;
  if (src.startsWith('http')) return <img src={src} alt={alt} className={className} />;
  return <NextImage src={src} alt={alt} fill className={className} sizes="200px" />;
}

export default function ColorVariants({ colors, currentColor, onColorChange }) {
  const [hovered, setHovered] = useState(null);

  if (!colors || colors.length === 0) return null;

  const activeColor = currentColor ?? colors[0];

  return (
    <div className="space-y-6">
      <div>
        <AnimatedHeading as="h3" className="mb-1 font-display text-2xl text-theme-ink md:text-3xl">
          Choose Your Finish
        </AnimatedHeading>
        <p className="text-sm leading-7 text-theme-walnut/70 dark:text-theme-ink/65">
          Every upholstery variant is sourced to age beautifully. Click to preview each finish.
        </p>
      </div>


      <div className="relative overflow-hidden rounded-2xl border border-theme-line bg-theme-sand/20 aspect-[16/9]">
        <ColorImage
          src={activeColor?.image}
          alt={activeColor?.name}
          className="h-full w-full object-contain transition-all duration-700"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-theme-ink/65 to-transparent px-6 py-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-theme-ivory/70">
            Current Finish
          </p>
          <AnimatedHeading as="h4" className="mt-1 font-display text-2xl text-theme-ivory">
            {activeColor?.name}
          </AnimatedHeading>
        </div>
      </div>


      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {colors.map((color, idx) => {
          const isActive = activeColor?.name === color.name;
          const isHovered = hovered === idx;
          return (
            <button
              key={idx}
              onClick={() => onColorChange(color)}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze ${
                isActive
                  ? 'border-theme-bronze shadow-[0_0_0_3px_rgba(165,106,63,0.22)] scale-[1.03]'
                  : 'border-theme-line hover:border-theme-bronze/60 hover:scale-[1.02]'
              }`}
              aria-label={`Select ${color.name}`}
              aria-pressed={isActive}
            >

              <div className="relative aspect-[4/3] overflow-hidden">
                <SwatchImage
                  src={color.image}
                  alt={color.name}
                  className={`h-full w-full object-contain transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                />
              </div>

              <div className={`px-3 py-2 text-left transition-colors duration-200 ${
                isActive ? 'bg-theme-bronze/12' : 'bg-theme-mist/60 dark:bg-theme-mist/30'
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-wider truncate ${
                  isActive ? 'text-theme-bronze' : 'text-theme-walnut/80 dark:text-theme-ink/75'
                }`}>
                  {color.name}
                </p>
              </div>

              {isActive && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-theme-bronze text-white shadow-md">
                  <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
