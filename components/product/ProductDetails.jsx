'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import AnimatedHeading from '../AnimatedHeading';
import ZoomLensImage from './ZoomLensImage';

function ColorSwatch({ color, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(color)}
      aria-label={color.name}
      aria-pressed={isActive}
      title={color.name}
      className={`relative h-11 w-11 overflow-hidden rounded-full border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze ${
        isActive
          ? 'scale-110 border-theme-bronze shadow-[0_0_0_3px_rgba(165,106,63,0.22)]'
          : 'border-theme-line hover:scale-105 hover:border-theme-bronze/50'
      }`}
    >
      <div className="relative h-full w-full">
        {color.image.startsWith('http') ? (
          <img src={color.image} alt={color.name} className="h-full w-full object-contain" />
        ) : (
          <NextImage src={color.image} alt={color.name} fill className="object-contain" sizes="44px" />
        )}
      </div>
      {isActive ? (
        <div className="absolute inset-0 flex items-center justify-center bg-theme-bronze/20">
          <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5 drop-shadow">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
    </button>
  );
}

function HeartIcon({ filled = false, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function ProductDetails({ data, currentColor, currentImage, onColorChange }) {
  const { addToCart } = useCart();
  const { addToWishlist, isWishlisted } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  const displayImage = currentColor?.image || currentImage || data.imageUrl;
  const saved = isWishlisted(data.id);

  const handleAddToCart = () => {
    addToCart(
      {
        id: data.id,
        name: data.name,
        price: data.price,
        image: displayImage || '',
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleAddToWishlist = () => {
    if (saved) return;

    const wasAdded = addToWishlist({
      id: data.id,
      name: currentColor?.name ? `${data.name} - ${currentColor.name}` : data.name,
      price: data.price,
      image: displayImage || '',
    });

    if (!wasAdded) return;

    setWishlistAdded(true);
    setTimeout(() => setWishlistAdded(false), 2200);
  };

  return (
    <div className="premium-surface overflow-hidden rounded-2xl">
      <div className="grid gap-0 md:grid-cols-2">
        <div className="flex flex-col gap-6 p-7 md:p-9">
          <div>
            <AnimatedHeading as="h3" className="font-display text-5xl font-semibold text-theme-bronze">
              {`Rs. ${data.price.toLocaleString('en-IN')}`}
            </AnimatedHeading>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut/50 dark:text-theme-ink/45">
              Free white-glove delivery
            </p>
          </div>

          <p className="text-sm leading-[1.85] text-theme-walnut/72 dark:text-theme-ink/68">
            {data.description}
          </p>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut/65 dark:text-theme-ink/55">
              Quantity
            </p>
            <div className="inline-flex items-center rounded-full border border-theme-line bg-theme-mist/60 dark:bg-theme-mist/25">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-theme-walnut transition-colors hover:text-theme-bronze dark:text-theme-ink"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-10 text-center text-base font-bold text-theme-ink dark:text-theme-ivory">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-theme-walnut transition-colors hover:text-theme-bronze dark:text-theme-ink"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <button
              onClick={handleAddToCart}
              className={`relative w-full overflow-hidden rounded-full py-4 text-sm font-semibold uppercase tracking-[0.28em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze ${
                added
                  ? 'bg-theme-olive text-white shadow-lg'
                  : 'bg-theme-bronze text-white shadow-lg hover:bg-theme-ink hover:shadow-xl active:scale-[0.98]'
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
                <span>Add to Cart - Rs. {(data.price * quantity).toLocaleString('en-IN')}</span>
              )}
            </button>

            <button
              onClick={handleAddToWishlist}
              disabled={saved}
              aria-label={saved || wishlistAdded ? 'Wishlisted' : 'Add to wishlist'}
              title={saved || wishlistAdded ? 'Wishlisted' : 'Add to wishlist'}
              className={`relative flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-full border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze ${
                saved || wishlistAdded
                  ? 'border-theme-bronze bg-theme-bronze text-white shadow-lg'
              : 'border-theme-line bg-white/55 text-theme-walnut hover:border-theme-bronze hover:bg-theme-bronze/10 hover:text-theme-bronze dark:bg-theme-mist/15 dark:text-theme-ink'
              }`}
            >
              <HeartIcon filled={saved || wishlistAdded} className="h-5 w-5" />
            </button>
          </div>

          <p className="text-center text-xs leading-5 text-theme-walnut/40 dark:text-theme-ink/35">
            5-year warranty · Easy returns · Nationwide delivery
          </p>
        </div>

        <div className="flex flex-col gap-6 border-t border-theme-line bg-theme-sand/10 p-7 dark:bg-theme-mist/10 md:border-l md:border-t-0 md:p-9">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut/65 dark:text-theme-ink/55">
              Finish
            </p>
            <AnimatedHeading as="h3" className="font-display text-xl text-theme-ink">
              {currentColor?.name || data.colors?.[0]?.name}
            </AnimatedHeading>
          </div>

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

          <ZoomLensImage
            key={displayImage || data.imageUrl}
            src={displayImage || data.imageUrl}
            alt={currentColor?.name || data.name}
            label={currentColor?.name || data.colors?.[0]?.name || data.name}
            containerClassName="mt-auto aspect-[16/9] rounded-xl border border-theme-line bg-theme-sand/20"
            imageClassName="h-full w-full object-contain transition-all duration-500"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </div>
    </div>
  );
}
