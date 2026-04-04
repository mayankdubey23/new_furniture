'use client';

import { useState } from 'react';
import AnimatedHeading from '../AnimatedHeading';
import ImageGallery from '../product/ImageGallery';
import ProductDetails from '../product/ProductDetails';
import ProductSpecs from '../product/ProductSpecs';
import ColorVariants from '../product/ColorVariants';

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

export default function ProductSection({ id, data, surfaceClassName = 'bg-transparent', showIntroCard = false }) {
  const [currentImage, setCurrentImage] = useState(data?.imageUrl ?? data?.images?.[0] ?? null);
  const [currentColor, setCurrentColor] = useState(data?.colors?.[0] ?? null);

  const onImageChange = (img) => setCurrentImage(img);
  const onColorChange = (color) => setCurrentColor(color);

  if (!data) return null;

  return (
    <section
      id={id}
      className={`scroll-mt-36 py-14 md:scroll-mt-40 md:py-20 ${surfaceClassName}`}
    >
      <div className="w-full space-y-10 px-8 md:px-12">
        {showIntroCard ? (
          <div id={`${id}-start`} className="ps-block scroll-mt-36 md:scroll-mt-40 rounded-[2.2rem] border border-theme-line/70 bg-white/40 px-6 py-8 text-center shadow-[0_18px_48px_rgba(49,30,21,0.05)] dark:bg-theme-mist/15 md:px-10 md:py-10">
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
        ) : null}

        <SectionDivider />

        <div className="ps-block">
          <SectionLabel label="01 - Details & Purchase" />
          <ProductDetails
            data={data}
            currentColor={currentColor}
            currentImage={currentImage}
            onColorChange={onColorChange}
          />
        </div>

        <SectionDivider />

        <div className="ps-block">
          <SectionLabel label="02 - Gallery" />
          <ImageGallery images={data.images} currentImage={currentImage} onImageChange={onImageChange} />
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
