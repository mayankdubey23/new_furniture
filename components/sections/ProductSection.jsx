'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ImageGallery from '../product/ImageGallery';
import Product3D from '../product/Product3D';
import ProductDetails from '../product/ProductDetails';
import ProductSpecs from '../product/ProductSpecs';
import ColorVariants from '../product/ColorVariants';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function SectionLabel({ label }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze mb-3">
      {label}
    </p>
  );
}

function SectionDivider() {
  return (
    <div className="relative flex items-center gap-4 py-2">
      <div className="flex-1 border-t border-theme-line" />
      <div className="h-1.5 w-1.5 rounded-full bg-theme-bronze/40" />
      <div className="flex-1 border-t border-theme-line" />
    </div>
  );
}

export default function ProductSection({ id, data, surfaceClassName = 'bg-transparent' }) {
  const container = useRef(null);
  const [currentImage, setCurrentImage] = useState(data?.imageUrl);
  const [currentColor, setCurrentColor] = useState(data?.colors?.[0]);

  const onImageChange = (img) => setCurrentImage(img);
  const onColorChange = (color) => {
    setCurrentColor(color);
    setCurrentImage(color.image);
  };

  useGSAP(() => {
    const blocks = container.current?.querySelectorAll('.ps-block');
    if (!blocks?.length) return;

    blocks.forEach((block, i) => {
      gsap.from(block, {
        scrollTrigger: {
          trigger: block,
          start: 'top 88%',
        },
        y: 48,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.04,
        ease: 'power3.out',
      });
    });
  }, { scope: container });

  if (!data) return null;

  return (
    <section id={id} className={`px-5 py-20 md:px-10 md:py-28 ${surfaceClassName}`}>
      <div ref={container} className="mx-auto max-w-5xl space-y-12">

        {/* ── Product Header ── */}
        <div className="ps-block text-center space-y-4 pb-4">
          <span className="inline-block rounded-full border border-theme-bronze/30 bg-theme-bronze/8 px-5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.36em] text-theme-bronze">
            {data.eyebrow}
          </span>
          <h2 className="font-display text-4xl text-theme-ink md:text-5xl lg:text-6xl">
            {data.name}
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-7 text-theme-walnut/70 dark:text-theme-ink/65">
            {data.description}
          </p>
        </div>

        <SectionDivider />

        {/* ── 1. 3D View ── */}
        <div className="ps-block space-y-2">
          <SectionLabel label="01 — Interactive 3D View" />
          <Product3D modelPath={data.modelPath} />
        </div>

        <SectionDivider />

        {/* ── 2. Image Gallery ── */}
        <div className="ps-block">
          <SectionLabel label="02 — Gallery" />
          <ImageGallery
            images={data.images}
            currentImage={currentImage}
            onImageChange={onImageChange}
          />
        </div>

        <SectionDivider />

        {/* ── 3. Details & Add to Cart ── */}
        <div className="ps-block">
          <SectionLabel label="03 — Details & Purchase" />
          <ProductDetails
            data={data}
            currentColor={currentColor}
            currentImage={currentImage}
            onColorChange={onColorChange}
          />
        </div>

        <SectionDivider />

        {/* ── 4. Color Variants ── */}
        <div className="ps-block">
          <SectionLabel label="04 — Color Variants" />
          <ColorVariants
            colors={data.colors}
            currentColor={currentColor}
            onColorChange={onColorChange}
          />
        </div>

        <SectionDivider />

        {/* ── 5. Specifications ── */}
        <div className="ps-block">
          <SectionLabel label="05 — Specifications" />
          <ProductSpecs specs={data.specs} />
        </div>

      </div>
    </section>
  );
}
