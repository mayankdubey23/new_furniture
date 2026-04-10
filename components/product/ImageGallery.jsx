'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

const Model3DViewer = dynamic(() => import('./Model3DViewer'), { ssr: false });

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

export default function ImageGallery({ images, currentImage, onImageChange, modelPath }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [show3D, setShow3D] = useState(false);

  // 🔥 ZOOM STATE LENS KO HANDLE KARNE KE LIYE
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

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

  // Exit 3D mode when pressing Escape
  useEffect(() => {
    if (!show3D) return undefined;
    const handleKeyDown = (e) => { if (e.key === 'Escape') setShow3D(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show3D]);

  // 🔥 CUSTOM HOVER ZOOM LOGIC
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoom({ active: true, x, y });
  };

  const handleMouseLeave = () => {
    setZoom((prev) => ({ ...prev, active: false }));
  };

  if (!images || images.length === 0) return null;

  const totalImages = images.length;
  const hasMultipleImages = totalImages > 1;
  const goToNext = () => onImageChange(images[(currentIndex + 1) % images.length]);
  const goToPrev = () => onImageChange(images[(currentIndex - 1 + images.length) % images.length]);
  const has3DModel = Boolean(modelPath);

  return (
    <>
      <div className="space-y-4">
        <div className="group relative overflow-hidden rounded-[1.9rem] border border-theme-line/70 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),rgba(245,236,225,0.7)_34%,rgba(225,208,187,0.34)_100%)] p-3 shadow-[0_28px_90px_rgba(49,30,21,0.09)] sm:p-4">
          <div className="pointer-events-none absolute left-8 top-0 h-px w-28 bg-gradient-to-r from-transparent via-theme-bronze/65 to-transparent" />
          <div className="pointer-events-none absolute right-8 top-6 h-24 w-24 rounded-full bg-theme-bronze/12 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-12 h-28 w-28 rounded-full bg-theme-sand/45 blur-3xl" />

          <motion.div className="relative block w-full">
            <div className="relative overflow-hidden rounded-[1.55rem] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.36),rgba(247,239,230,0.14))] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <div className="relative aspect-[5/4] sm:aspect-[16/11] xl:aspect-[3/2] overflow-hidden">


                <AnimatePresence>
                  {show3D && (
                    <motion.div
                      key="viewer-3d"
                      initial={{ opacity: 0, scale: 0.88, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className="absolute inset-0 z-10"
                    >
                      <Model3DViewer modelPath={modelPath} />
                    </motion.div>
                  )}
                </AnimatePresence>


                <AnimatePresence>
                  {!show3D && (
                    <motion.div
                      key="image-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="absolute inset-0 z-10 cursor-crosshair"
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => setLightboxOpen(true)}
                    >
                      <motion.div
                        className="relative h-full w-full"
                        animate={{ scale: zoom.active ? 2.2 : 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }}
                      >
                        <ProductImage
                          src={currentImage}
                          alt="Product view"
                          className="object-contain object-bottom"
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(26,22,19,0.14)_100%)] opacity-55" />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-white/12 to-transparent" />


                <AnimatePresence mode="wait">
                  {!show3D && (
                    <motion.div
                      key={currentLabel}
                      variants={overlayVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="pointer-events-none absolute left-4 bottom-4 z-30 flex flex-col items-start gap-3 sm:left-5 sm:flex-row sm:items-end"
                    >
                      <div className="max-w-[20rem] rounded-[1.35rem] border border-white/14 bg-[linear-gradient(180deg,rgba(17,14,11,0.48),rgba(17,14,11,0.3))] px-4 py-3 text-left text-white backdrop-blur-md sm:px-5 sm:py-4">
                        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-white/68">Gallery View</p>
                        <p className="mt-1 font-display text-[1.75rem] leading-none tracking-[0.06em] text-white sm:text-[2.1rem]">
                          {currentLabel}
                        </p>
                        <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-white/65">
                          Hover to inspect texture
                        </p>
                      </div>


                      {has3DModel ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setShow3D(true); }}
                          className="pointer-events-auto hidden mb-1 rounded-full border border-white/24 bg-black/38 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/88 backdrop-blur-sm transition hover:border-theme-bronze/55 hover:bg-theme-bronze/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze sm:flex sm:items-center sm:gap-2"
                          aria-label="Switch to 3D model view"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-85"
                            aria-hidden="true"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                          3D View
                        </button>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>


                {!show3D && (
                  <div className="absolute inset-x-4 top-4 z-30 flex items-start justify-between gap-3 sm:inset-x-5">
                    <div className="rounded-[1.15rem] border border-theme-line/40 bg-white/72 px-3 py-2 shadow-[0_10px_28px_rgba(49,30,21,0.1)] backdrop-blur-md">
                      <p className="text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-theme-walnut/55">
                        Visual Angles
                      </p>
                      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-theme-ink">
                        {String(currentIndex + 1).padStart(2, '0')} / {String(totalImages).padStart(2, '0')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="rounded-full border border-white/24 bg-black/42 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:border-white/42 hover:bg-black/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze"
                      aria-label="Open product image lightbox"
                    >
                      Full View
                    </button>
                  </div>
                )}


                {show3D && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="absolute inset-x-4 top-4 z-30 flex items-start justify-between gap-3 sm:inset-x-5"
                  >
                    <div className="rounded-[1.15rem] border border-white/18 bg-black/38 px-3 py-2 backdrop-blur-md">
                      <p className="text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-white/55">
                        Interactive
                      </p>
                      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-white">
                        3D Model
                      </p>
                    </div>
                  </motion.div>
                )}


                {!show3D && hasMultipleImages ? (
                  <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2 sm:bottom-5 sm:right-5">
                    <motion.button
                      type="button"
                      onClick={goToPrev}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-full border border-white/16 bg-black/36 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md transition hover:border-white/30 hover:bg-black/48 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze"
                      aria-label="Previous gallery image"
                    >
                      Prev
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={goToNext}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-full border border-theme-bronze/35 bg-theme-bronze/90 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_10px_25px_rgba(165,106,63,0.28)] transition hover:bg-theme-bronze focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze"
                      aria-label="Next gallery image"
                    >
                      Next
                    </motion.button>
                  </div>
                ) : null}


                {show3D && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="absolute bottom-4 right-4 z-40 sm:bottom-5 sm:right-5"
                  >
                    <motion.button
                      type="button"
                      onClick={() => setShow3D(false)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-full border border-white/22 bg-black/42 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md transition hover:border-white/38 hover:bg-black/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze"
                      aria-label="Exit 3D model view"
                    >
                      Exit 3D
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="rounded-[1.65rem] border border-theme-line/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(245,237,228,0.46))] p-3 shadow-[0_18px_48px_rgba(49,30,21,0.05)] sm:p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
                Select an Angle
              </p>
              <p className="mt-1 text-sm leading-6 text-theme-walnut/72">
                Switch between curated views to inspect the silhouette, proportions, and material finish.
              </p>
            </div>
            <div className="rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-theme-walnut/72 shadow-[0_8px_22px_rgba(49,30,21,0.04)]">
              {show3D ? '3D Model' : currentLabel}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {images.map((img, idx) => {
              const isActive = !show3D && currentImage === img;
              return (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => { setShow3D(false); onImageChange(img); }}
                  aria-label={`View ${getImageLabel(img, idx)}`}
                  aria-pressed={isActive}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden rounded-[1.2rem] border p-1.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze ${
                    isActive
                      ? 'border-theme-bronze/45 bg-[linear-gradient(180deg,rgba(165,106,63,0.14),rgba(255,255,255,0.88))] shadow-[0_18px_34px_rgba(165,106,63,0.15)]'
                      : 'border-theme-line/70 bg-white/72 hover:border-theme-bronze/28 hover:bg-white/88'
                  }`}
                >
                  <div className="relative overflow-hidden rounded-[0.95rem] bg-[radial-gradient(circle_at_top,rgba(241,230,216,0.7),rgba(255,255,255,0.16)_70%)]">
                    <div className="relative aspect-square">
                      <ThumbImage src={img} alt={getImageLabel(img, idx)} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-theme-ink/10 via-transparent to-white/8 opacity-80" />
                  </div>

                  <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-2">
                    <div>
                      <p className="text-[0.52rem] font-semibold uppercase tracking-[0.26em] text-theme-walnut/45">
                        View {String(idx + 1).padStart(2, '0')}
                      </p>
                      <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-theme-ink">
                        {getImageLabel(img, idx)}
                      </p>
                    </div>
                    {isActive ? (
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-theme-bronze text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_20px_rgba(165,106,63,0.25)]">
                        On
                      </span>
                    ) : (
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-theme-line/80 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-theme-walnut/55">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {isActive ? (
                    <motion.div
                      layoutId="active-gallery-thumb"
                      className="pointer-events-none absolute inset-0 rounded-[1.2rem] ring-2 ring-inset ring-theme-bronze/45"
                    />
                  ) : null}
                </motion.button>
              );
            })}
          </div>
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
