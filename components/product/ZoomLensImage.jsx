'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';

const ZOOM_FACTOR = 2.35;
const LENS_SIZE = 138;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function ZoomLensImage({
  src,
  alt,
  label,
  containerClassName = '',
  imageClassName = 'h-full w-full object-contain transition-all duration-500',
  sizes = '(max-width: 768px) 100vw, 40vw',
  children,
}) {
  const frameRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoomState, setZoomState] = useState({
    active: false,
    x: 50,
    y: 50,
    pointerType: 'mouse',
    backgroundPositionX: 0,
    backgroundPositionY: 0,
    backgroundSize: '0px 0px',
  });

  const updateZoom = useCallback((clientX, clientY, pointerType = 'mouse') => {
    const frame = frameRef.current;
    if (!frame || !naturalSize.width || !naturalSize.height) {
      return;
    }

    const rect = frame.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    if (containerWidth <= 0 || containerHeight <= 0) {
      return;
    }

    const imageRatio = naturalSize.width / naturalSize.height;
    const frameRatio = containerWidth / containerHeight;

    let renderedWidth = containerWidth;
    let renderedHeight = containerHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imageRatio > frameRatio) {
      renderedHeight = containerWidth / imageRatio;
      offsetY = (containerHeight - renderedHeight) / 2;
    } else {
      renderedWidth = containerHeight * imageRatio;
      offsetX = (containerWidth - renderedWidth) / 2;
    }

    const isInsideRenderedImage =
      localX >= offsetX &&
      localX <= offsetX + renderedWidth &&
      localY >= offsetY &&
      localY <= offsetY + renderedHeight;

    if (!isInsideRenderedImage) {
      setZoomState((current) => ({ ...current, active: false }));
      return;
    }

    const imageX = clamp(localX - offsetX, 0, renderedWidth);
    const imageY = clamp(localY - offsetY, 0, renderedHeight);
    const xPercent = (localX / containerWidth) * 100;
    const yPercent = (localY / containerHeight) * 100;

    setZoomState({
      active: true,
      x: xPercent,
      y: yPercent,
      pointerType,
      backgroundPositionX: LENS_SIZE / 2 - imageX * ZOOM_FACTOR,
      backgroundPositionY: LENS_SIZE / 2 - imageY * ZOOM_FACTOR,
      backgroundSize: `${renderedWidth * ZOOM_FACTOR}px ${renderedHeight * ZOOM_FACTOR}px`,
    });
  }, [naturalSize.height, naturalSize.width]);

  const lensStyle = useMemo(() => ({
    left: `${zoomState.x}%`,
    top: `${zoomState.y}%`,
    width: `${LENS_SIZE}px`,
    height: `${LENS_SIZE}px`,
    backgroundImage: `url("${src}")`,
    backgroundPosition: `${zoomState.backgroundPositionX}px ${zoomState.backgroundPositionY}px`,
    backgroundSize: zoomState.backgroundSize,
    backgroundRepeat: 'no-repeat',
  }), [src, zoomState.backgroundPositionX, zoomState.backgroundPositionY, zoomState.backgroundSize, zoomState.x, zoomState.y]);

  const showLens = zoomState.active;
  const showTouchHint = zoomState.pointerType !== 'mouse';

  if (!src) {
    return null;
  }

  return (
    <div
      ref={frameRef}
      className={`group relative overflow-hidden ${containerClassName}`.trim()}
      onMouseEnter={(event) => updateZoom(event.clientX, event.clientY, 'mouse')}
      onMouseMove={(event) => updateZoom(event.clientX, event.clientY, 'mouse')}
      onMouseLeave={() => setZoomState((current) => ({ ...current, active: false, pointerType: 'mouse' }))}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (!touch) return;
        updateZoom(touch.clientX, touch.clientY, 'touch');
      }}
      onTouchMove={(event) => {
        const touch = event.touches[0];
        if (!touch) return;
        updateZoom(touch.clientX, touch.clientY, 'touch');
      }}
      onTouchEnd={() => setZoomState((current) => ({ ...current, active: false, pointerType: 'touch' }))}
    >
      {src.startsWith('http') ? (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          onLoad={(event) => {
            setNaturalSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            });
          }}
        />
      ) : (
        <NextImage
          src={src}
          alt={alt}
          fill
          className={imageClassName}
          sizes={sizes}
          onLoad={(event) => {
            setNaturalSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            });
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,241,232,0.08),rgba(34,27,23,0.08))]" />

      <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/25 bg-white/60 px-3 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-theme-walnut/72 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        Hover to Zoom
      </div>

      {showTouchHint ? (
        <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border border-white/18 bg-theme-ink/65 px-3 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-theme-ivory/84 backdrop-blur-sm">
          Drag to Zoom
        </div>
      ) : null}

      {showLens ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-20 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 shadow-[0_18px_44px_rgba(49,30,21,0.22)] md:block"
          style={lensStyle}
        >
          <div className="absolute inset-0 rounded-full ring-8 ring-theme-bronze/12" />
        </div>
      ) : null}

      {children}

      {label ? (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-theme-ink/40 to-transparent px-4 py-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-ivory/80">
            {label}
          </p>
        </div>
      ) : null}
    </div>
  );
}
