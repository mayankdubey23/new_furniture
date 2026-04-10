'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedHeading from '../AnimatedHeading';
import ImageGallery from '../product/ImageGallery';
import ProductDetails from '../product/ProductDetails';
import ProductSpecs from '../product/ProductSpecs';
import ColorVariants from '../product/ColorVariants';

function FlowPill({ children, onClick, isActive = false }) {
  const toneClassName = isActive
    ? 'border-theme-bronze/22 bg-theme-bronze text-white shadow-[0_16px_34px_rgba(165,106,63,0.22)]'
    : 'border-theme-line/60 bg-white/58 text-theme-walnut hover:border-theme-bronze/45 hover:text-theme-bronze dark:bg-white/6 dark:text-theme-ivory dark:hover:text-theme-bronze';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.24em] transition sm:text-[0.68rem] sm:tracking-[0.28em] ${toneClassName}`}
    >
      {children}
    </button>
  );
}

function SectionFrame({
  blockId,
  step,
  title,
  summary,
  accent,
  children,
}) {
  return (
    <div
      id={blockId}
      className="ps-block relative overflow-hidden rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(248,241,232,0.3))] p-4 shadow-[0_20px_55px_rgba(49,30,21,0.05)] dark:bg-[linear-gradient(180deg,rgba(49,38,32,0.48),rgba(27,20,17,0.36))] sm:p-5 md:rounded-[2.25rem] md:p-6"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-theme-bronze/10 blur-3xl" />

      <div className="relative mb-5 grid gap-5 border-b border-theme-line/45 pb-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:items-end lg:gap-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.2rem] bg-theme-walnut text-sm font-semibold tracking-[0.18em] text-theme-ivory sm:h-12 sm:w-12 sm:rounded-2xl">
            {step}
          </div>
          <div>
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
              {accent}
            </p>
            <AnimatedHeading as="h3" className="mt-2 font-display text-[1.7rem] leading-none text-theme-ink sm:text-[2rem] md:text-[2.3rem]">
              {title}
            </AnimatedHeading>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ink/62 md:text-[0.98rem] lg:justify-self-end">
          {summary}
        </p>
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}

export default function ProductSection({
  id,
  data,
  surfaceClassName = 'bg-transparent',
  showIntroCard = false,
}) {
  const [currentImage, setCurrentImage] = useState(data?.imageUrl ?? data?.images?.[0] ?? null);
  const [currentColor, setCurrentColor] = useState(data?.colors?.[0] ?? null);
  const [activeSection, setActiveSection] = useState('details');
  const specEntries = Object.entries(data?.specs || {}).filter(([, value]) =>
    String(value || '').trim()
  );
  const hasSpecs = specEntries.length > 0;

  const onImageChange = (img) => setCurrentImage(img);
  const onColorChange = (color) => setCurrentColor(color);

  if (!data) return null;

  const renderActiveSection = () => {
    if (activeSection === 'details') {
      return (
        <SectionFrame
          blockId={`${id}-details-panel`}
          step="01"
          title="Details & Purchase"
          accent="Ordering Studio"
          summary="Price, finish selection, quantity, and purchase actions stay together here so the buying flow feels quicker and more intentional."
        >
          <ProductDetails
            data={data}
            currentColor={currentColor}
            currentImage={currentImage}
            onColorChange={onColorChange}
          />
        </SectionFrame>
      );
    }

    if (activeSection === 'gallery') {
      return (
        <SectionFrame
          blockId={`${id}-gallery-panel`}
          step="02"
          title="Gallery"
          accent="Visual Angles"
          summary="Browse the product from multiple viewpoints without the section feeling disconnected from the rest of the page."
        >
          <ImageGallery
            images={data.images}
            currentImage={currentImage}
            onImageChange={onImageChange}
            modelPath={data.modelPath ?? null}
          />
        </SectionFrame>
      );
    }

    if (activeSection === 'colors') {
      return (
        <SectionFrame
          blockId={`${id}-colors-panel`}
          step="03"
          title="Color Variants"
          accent="Finish Library"
          summary="Each finish now lives in a more curated panel so color exploration feels like part of the showroom experience, not a plain list."
        >
          <ColorVariants
            colors={data.colors}
            currentColor={currentColor}
            onColorChange={onColorChange}
          />
        </SectionFrame>
      );
    }

    if (activeSection === 'specs' && hasSpecs) {
      return (
        <SectionFrame
          blockId={`${id}-specs-panel`}
          step="04"
          title="Specifications"
          accent="Specification Studio"
          summary="A dedicated technical view with the full material, size, and construction breakdown for customers who want the deeper product readout."
        >
          <ProductSpecs
            specs={data.specs}
            productName={data.name}
            currentColorName={currentColor?.name || ''}
          />
        </SectionFrame>
      );
    }

    return null;
  };

  return (
    <section
      id={id}
      className={`scroll-mt-36 py-8 md:scroll-mt-40 md:py-12 lg:py-16 ${surfaceClassName}`}
    >
      <div className="mx-auto w-full max-w-[112rem] space-y-5 px-4 sm:px-6 md:space-y-6 md:px-8 lg:px-12">
        {showIntroCard ? (
          <div id={`${id}-start`} className="ps-block scroll-mt-36 rounded-[1.9rem] border border-theme-line/70 bg-white/40 px-5 py-7 text-center shadow-[0_18px_48px_rgba(49,30,21,0.05)] dark:bg-theme-mist/15 sm:px-7 md:rounded-[2.2rem] md:px-10 md:py-10">
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

        <div className="rounded-[1.8rem] border border-theme-line/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(244,236,226,0.38))] p-3 shadow-[0_18px_44px_rgba(49,30,21,0.04)] dark:bg-[linear-gradient(180deg,rgba(44,34,29,0.42),rgba(25,19,16,0.34))] sm:p-4 md:rounded-[2.15rem]">
          <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            <FlowPill
              onClick={() => setActiveSection('details')}
              isActive={activeSection === 'details'}
            >
              01 Details & Purchase
            </FlowPill>
            <FlowPill
              onClick={() => setActiveSection('gallery')}
              isActive={activeSection === 'gallery'}
            >
              02 Gallery
            </FlowPill>
            <FlowPill
              onClick={() => setActiveSection('colors')}
              isActive={activeSection === 'colors'}
            >
              03 Color Variants
            </FlowPill>
            {hasSpecs ? (
              <FlowPill
                onClick={() => setActiveSection('specs')}
                isActive={activeSection === 'specs'}
              >
                04 View More Specs
              </FlowPill>
            ) : null}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeSection ? (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              {renderActiveSection()}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
