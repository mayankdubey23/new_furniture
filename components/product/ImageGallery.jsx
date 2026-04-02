'use client';

import { useEffect, useMemo, useState } from 'react';
import NextImage from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

function ProductImage({ src, alt, className, style }) {
  if (!src) return null;
  if (src.startsWith('http')) {
    return <img src={src} alt={alt} className={className} style={style} />;
  }
  return <NextImage src={src} alt={alt} fill className={className} sizes="(max-width: 768px) 100vw, 75vw" style={style} />;
}

function ThumbImage({ src, alt, className }) {
  if (!src) return null;
  if (src.startsWith('http')) {
    return <img src={src} alt={alt} className={className} />;
  }
  return <NextImage src={src} alt={alt} fill className={className} sizes="120px" />;
}

const FILE_LABELS = {
  main: 'Main',
  cover: 'Cover',
  top: 'Top',
  left: 'Left',
  right: 'Right',
  legs: 'Legs',
  'sofa leg': 'Legs',
  closeup: 'Closeup',
  fabric: 'Fabric',
};

function getImageLabel(src, fallbackIndex) {
  const filename = src?.split('/').pop()?.replace(/\.[^.]+$/, '').toLowerCase() ?? '';
  return FILE_LABELS[filename] ?? `View ${fallbackIndex + 1}`;
}

const overlayVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 24 },
};

export default function ImageGallery({ images, currentImage, onImageChange }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentIndex = useMemo(
    () => Math.max(0, images.findIndex((image) => image === currentImage)),
    [currentImage, images]
  );
  const currentLabel = getImageLabel(currentImage, currentIndex);

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowRight') onImageChange(images[(currentIndex + 1) % images.length]);
      if (event.key === 'ArrowLeft') onImageChange(images[(currentIndex - 1 + images.length) % images.length]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images, lightboxOpen, onImageChange]);

  if (!images || images.length === 0) return null;

  const goToNext = () => onImageChange(images[(currentIndex + 1) % images.length]);
  const goToPrev = () => onImageChange(images[(currentIndex - 1 + images.length) % images.length]);

  return (
    <>
      <div className="space-y-4">
        <div className="group relative overflow-hidden rounded-[1.75rem] border border-theme-line bg-[radial-gradient(circle_at_top,rgba(165,106,63,0.12),rgba(221,208,189,0.18)_45%,rgba(251,247,241,0.28)_100%)] shadow-[0_20px_60px_rgba(49,30,21,0.08)]">
          <motion.button
            type="button"
            onClick={() => setLightboxOpen(true)}
            whileHover={{ scale: 1.01 }}
            className="relative block w-full cursor-pointer"
            aria-label="Open product image lightbox"
          >
            <div className="relative aspect-[3/2]">
              <ProductImage src={currentImage} alt="Product view" className="h-full w-full object-contain transition-transform duration-200 ease-out" />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(26,22,19,0.12)_100%)] opacity-55" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentLabel}
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4"
              >
                <div className="rounded-[1.25rem] border border-white/14 bg-black/32 px-4 py-3 text-left text-white backdrop-blur-md">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-white/70">Gallery View</p>
                  <p className="mt-1 font-display text-2xl tracking-[0.08em] text-white">{currentLabel}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/65">Click to inspect</p>
                </div>

                <div className="rounded-full border border-white/18 bg-black/35 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-sm">
                  Interactive
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {images.map((img, idx) => {
            const isActive = currentImage === img;
            return (
              <motion.button
                key={idx}
                type="button"
                onClick={() => onImageChange(img)}
                aria-label={`View ${getImageLabel(img, idx)}`}
                aria-pressed={isActive}
                whileHover={{ y: -4, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-xl border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze ${
                  isActive ? 'border-theme-bronze shadow-[0_0_0_2px_rgba(165,106,63,0.18)]' : 'border-theme-line'
                }`}
              >
                <div className="relative aspect-square">
                  <ThumbImage src={img} alt={getImageLabel(img, idx)} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                </div>
                <motion.div
                  animate={{
                    backgroundColor: isActive ? 'rgba(165,106,63,1)' : 'rgba(26,22,19,0.4)',
                    color: isActive ? 'rgba(255,255,255,1)' : 'rgba(244,238,229,0.82)',
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 py-0.5 text-center text-[0.55rem] font-semibold uppercase tracking-wide"
                >
                  {getImageLabel(img, idx)}
                </motion.div>
                {isActive ? <motion.div layoutId="active-gallery-thumb" className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-inset ring-theme-bronze/40" /> : null}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.92)] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4 px-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentLabel}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">Lightbox View</p>
                    <p className="mt-1 font-display text-3xl text-theme-ivory">{currentLabel}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={goToPrev} className="rounded-full border border-white/14 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/24 hover:bg-white/10">
                    Prev
                  </button>
                  <button type="button" onClick={goToNext} className="rounded-full border border-white/14 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/24 hover:bg-white/10">
                    Next
                  </button>
                  <button type="button" onClick={() => setLightboxOpen(false)} className="rounded-full border border-white/14 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/24 hover:bg-white/10">
                    Close
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(165,106,63,0.14),rgba(34,27,23,0.18)_55%,rgba(18,14,11,0.18)_100%)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="absolute inset-0"
                  >
                    <ProductImage src={currentImage} alt={currentLabel} className="h-full w-full object-contain" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
