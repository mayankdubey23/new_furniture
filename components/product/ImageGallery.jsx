'use client';

import NextImage from 'next/image';

function ProductImage({ src, alt, className }) {
  if (!src) return null;
  if (src.startsWith('http')) {
    return <img src={src} alt={alt} className={className} />;
  }
  return (
    <NextImage
      src={src}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 768px) 100vw, 75vw"
    />
  );
}

function ThumbImage({ src, alt, className }) {
  if (!src) return null;
  if (src.startsWith('http')) {
    return <img src={src} alt={alt} className={className} />;
  }
  return (
    <NextImage
      src={src}
      alt={alt}
      fill
      className={className}
      sizes="120px"
    />
  );
}

const ANGLE_LABELS = ['Main', 'Cover', 'Top', 'Left', 'Right', 'Detail'];

export default function ImageGallery({ images, currentImage, onImageChange }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Main large image */}
      <div className="relative overflow-hidden rounded-2xl border border-theme-line bg-theme-sand/20 shadow-sm">
        <div className="relative aspect-[3/2]">
          <ProductImage
            src={currentImage}
            alt="Product view"
            className="object-contain transition-all duration-500 h-full w-full"
          />
        </div>
      </div>

      {/* Thumbnail row */}
      <div className="grid grid-cols-6 gap-2">
        {images.map((img, idx) => {
          const isActive = currentImage === img;
          return (
            <button
              key={idx}
              onClick={() => onImageChange(img)}
              aria-label={`View ${ANGLE_LABELS[idx] ?? `angle ${idx + 1}`}`}
              aria-pressed={isActive}
              className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze ${
                isActive
                  ? 'border-theme-bronze shadow-[0_0_0_2px_rgba(165,106,63,0.18)] scale-[1.04]'
                  : 'border-theme-line hover:border-theme-bronze/50 hover:scale-[1.02]'
              }`}
            >
              <div className="relative aspect-square">
                <ThumbImage
                  src={img}
                  alt={ANGLE_LABELS[idx] ?? `Angle ${idx + 1}`}
                  className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {isActive && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-theme-bronze/40 pointer-events-none" />
              )}
              {/* Angle label */}
              <div className={`absolute bottom-0 left-0 right-0 py-0.5 text-center text-[0.55rem] font-semibold uppercase tracking-wide transition-colors ${
                isActive
                  ? 'bg-theme-bronze text-white'
                  : 'bg-theme-ink/40 text-theme-ivory/80'
              }`}>
                {ANGLE_LABELS[idx] ?? idx + 1}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
