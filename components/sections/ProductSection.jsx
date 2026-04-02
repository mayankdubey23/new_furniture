'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ImageGallery from '../product/ImageGallery';
import ProductDetails from '../product/ProductDetails';
import ProductSpecs from '../product/ProductSpecs';
import ColorVariants from '../product/ColorVariants';
import AnimatedHeading from '../AnimatedHeading';

if (typeof window !== 'undefined' && !window.__scrollTriggerRegistered) {
  gsap.registerPlugin(ScrollTrigger);
  window.__scrollTriggerRegistered = true;
}

function SectionLabel({ label }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">{label}</p>;
}

function SectionDivider() {
  return (
    <div className="relative flex items-center gap-4 py-2">
      <div className="flex-1 border-t border-theme-line" />
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-theme-bronze/40" />
        <div className="h-1.5 w-1.5 rounded-full bg-theme-bronze/22" />
      </div>
      <div className="flex-1 border-t border-theme-line" />
    </div>
  );
}

export default function ProductSection({ id, data, surfaceClassName = 'bg-transparent' }) {
  const container = useRef(null);
  const [currentImage, setCurrentImage] = useState(data?.images?.[0] ?? data?.imageUrl ?? null);
  const [currentColor, setCurrentColor] = useState(data?.colors?.[0] ?? null);

  const onImageChange = (img) => setCurrentImage(img);
  const onColorChange = (color) => setCurrentColor(color);

  useGSAP(
    () => {
      const blocks = container.current?.querySelectorAll('.ps-block');
      if (!blocks?.length) return;

      blocks.forEach((block) => {
        gsap.from(block, {
          scrollTrigger: {
            trigger: block,
            start: 'top 88%',
          },
          y: 48,
          opacity: 0,
          duration: 1.4,
          ease: 'power3.out',
        });
      });
    },
    { scope: container }
  );

  if (!data) return null;

  return (
    <section id={id} className={`py-14 md:py-20 ${surfaceClassName}`}>
      <div ref={container} className="w-full space-y-10 px-8 md:px-12">
        <div className="ps-block rounded-[2.2rem] border border-theme-line/70 bg-white/34 px-6 py-8 text-center shadow-[0_18px_48px_rgba(49,30,21,0.05)] backdrop-blur-sm dark:bg-white/4 md:px-10 md:py-10">
          <span className="inline-block rounded-full border border-theme-bronze/30 bg-theme-bronze/8 px-5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.36em] text-theme-bronze">
            {data.eyebrow}
          </span>
          <AnimatedHeading as="h2" className="mt-4 font-display text-4xl text-theme-ink md:text-5xl lg:text-6xl">
            {data.name}
          </AnimatedHeading>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-theme-walnut/70 dark:text-theme-ink/65 md:text-base">
            {data.description}
          </p>
        </div>

        <SectionDivider />

        <div className="ps-block">
          <SectionLabel label="01 - Gallery" />
          <ImageGallery images={data.images} currentImage={currentImage} onImageChange={onImageChange} />
        </div>

        <SectionDivider />

        <div className="ps-block">
          <SectionLabel label="02 - Details & Purchase" />
          <ProductDetails
            data={data}
            currentColor={currentColor}
            currentImage={currentImage}
            onColorChange={onColorChange}
          />
        </div>

        <SectionDivider />

        <div className="ps-block">
          <SectionLabel label="03 - Color Variants" />
          <ColorVariants colors={data.colors} currentColor={currentColor} onColorChange={onColorChange} />
        </div>

        <SectionDivider />

        <div className="ps-block">
          <SectionLabel label="04 - Specifications" />
          <ProductSpecs specs={data.specs} />
        </div>
      </div>
    </section>
  );
}
