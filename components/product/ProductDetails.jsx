'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { useCart } from '@/context/CartContext';

function ColorSwatch({ color, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(color)}
      aria-label={color.name}
      aria-pressed={isActive}
      title={color.name}
      className={`relative h-11 w-11 rounded-full border-2 overflow-hidden transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze ${
        isActive
          ? 'border-theme-bronze scale-110 shadow-[0_0_0_3px_rgba(165,106,63,0.22)]'
          : 'border-theme-line hover:border-theme-bronze/50 hover:scale-105'
      }`}
    >
      <div className="relative h-full w-full">
        {color.image.startsWith('http') ? (
          <img src={color.image} alt={color.name} className="h-full w-full object-contain" />
        ) : (
          <NextImage src={color.image} alt={color.name} fill className="object-contain" sizes="44px" />
        )}
      </div>
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-theme-bronze/20">
          <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5 drop-shadow">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
}

export default function ProductDetails({ data, currentColor, currentImage, onColorChange }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const displayImage = currentColor?.image || currentImage || data.imageUrl;

  const handleAddToCart = () => {
    addToCart(
      {
        id: data.id,
        name: data.name,
        price: data.price,
        image: displayImage?.startsWith('http') ? displayImage : '',
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="premium-surface rounded-2xl overflow-hidden">
      <div className="grid gap-0 md:grid-cols-2">

        {/* ── Left: Price, Description, Quantity, CTA ── */}
        <div className="flex flex-col gap-6 p-7 md:p-9">

          {/* Price */}
          <div>
            <p className="font-display text-5xl font-semibold text-theme-bronze">
              ₹{data.price.toLocaleString('en-IN')}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut/50 dark:text-theme-ink/45">
              Free white-glove delivery
            </p>
          </div>

          {/* Description */}
          <p className="text-sm leading-[1.85] text-theme-walnut/72 dark:text-theme-ink/68">
            {data.description}
          </p>

          {/* Quantity selector */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut/65 dark:text-theme-ink/55">
              Quantity
            </p>
            <div className="inline-flex items-center rounded-full border border-theme-line bg-theme-mist/60 dark:bg-theme-mist/25">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-theme-walnut hover:text-theme-bronze transition-colors dark:text-theme-ink"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center text-base font-bold text-theme-ivory">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-theme-walnut hover:text-theme-bronze transition-colors dark:text-theme-ink"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className={`relative w-full overflow-hidden rounded-full py-4 text-sm font-semibold uppercase tracking-[0.28em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze ${
              added
                ? 'bg-theme-olive text-white shadow-lg'
                : 'bg-theme-bronze text-white hover:bg-theme-ink shadow-lg hover:shadow-xl active:scale-[0.98]'
            }`}
          >
            {added ? (
              <span className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                  <path d="M4 10l5 5 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Added to Cart
              </span>
            ) : (
              <span>Add to Cart — ₹{(data.price * quantity).toLocaleString('en-IN')}</span>
            )}
          </button>

          {/* Reassurance note */}
          <p className="text-center text-xs text-theme-walnut/40 dark:text-theme-ink/35 leading-5">
            5-year warranty · Easy returns · Nationwide delivery
          </p>
        </div>

        {/* ── Right: Color Selector ── */}
        <div className="flex flex-col gap-6 border-t border-theme-line md:border-t-0 md:border-l p-7 md:p-9 bg-theme-sand/10 dark:bg-theme-mist/10">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut/65 dark:text-theme-ink/55">
              Finish
            </p>
            <p className="font-display text-xl text-theme-ink">
              {currentColor?.name || data.colors?.[0]?.name}
            </p>
          </div>

          {/* Color swatch circles */}
          <div className="flex flex-wrap gap-3">
            {data.colors?.map((color, idx) => (
              <ColorSwatch
                key={idx}
                color={color}
                isActive={currentColor?.name === color.name}
                onClick={onColorChange}
              />
            ))}
          </div>

          {/* Color preview thumbnail */}
          <div className="relative overflow-hidden rounded-xl border border-theme-line bg-theme-sand/20 aspect-[16/9] mt-auto">
            {displayImage?.startsWith('http') ? (
              <img
                src={displayImage}
                alt={currentColor?.name || data.name}
                className="h-full w-full object-contain transition-all duration-500"
              />
            ) : (
              <NextImage
                src={displayImage || data.imageUrl}
                alt={currentColor?.name || data.name}
                fill
                className="object-contain transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-theme-ink/40 to-transparent px-4 py-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-ivory/80">
                {currentColor?.name}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
