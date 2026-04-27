'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  buildCommerceItemId,
  getDefaultMaterialForProduct,
  getDefaultSizeForProduct,
} from '@/lib/commerce';
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

function OptionPill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
        active
          ? 'border-theme-bronze bg-theme-bronze text-white'
          : 'border-theme-line bg-white/55 text-theme-walnut hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/75'
      }`}
    >
      {children}
    </button>
  );
}

export default function ProductDetails({ data, currentColor, currentImage, onColorChange }) {
  const { addToCart } = useCart();
  const { addToWishlist, isWishlisted } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(getDefaultSizeForProduct(data));
  const selectedMaterial = getDefaultMaterialForProduct(data);
  const selectedFinish = '';
  const selectedAddons = [];
  const configurationNotes = '';

  const displayImage = currentColor?.image || currentImage || data.imageUrl;
  const selectedItemId = buildCommerceItemId(String(data.id), {
    selectedColor: currentColor?.name || '',
    selectedColorImage: displayImage || '',
    selectedSize,
    selectedMaterial,
    selectedFinish,
    selectedAddons,
    configurationNotes,
  });
  const saved = isWishlisted(selectedItemId);
  const stockQuantity = Number(data.stockQuantity ?? data.stock ?? 0);
  const isOutOfStock = data.inStock === false || stockQuantity <= 0;
  const maxQuantity = stockQuantity > 0 ? stockQuantity : 1;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart(
      {
        id: selectedItemId,
        productId: String(data.id),
        name: data.name,
        price: data.price,
        image: displayImage || '',
        selectedColor: currentColor?.name || '',
        selectedColorImage: displayImage || '',
        selectedSize,
        selectedMaterial,
        selectedFinish,
        selectedAddons,
        configurationNotes: configurationNotes.trim(),
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleAddToWishlist = () => {
    if (saved) return;

    const wasAdded = addToWishlist({
      id: selectedItemId,
      productId: String(data.id),
      name: data.name,
      price: data.price,
      image: displayImage || '',
      selectedColor: currentColor?.name || '',
      selectedColorImage: displayImage || '',
      selectedSize,
      selectedMaterial,
      selectedFinish,
      selectedAddons,
      configurationNotes: configurationNotes.trim(),
    });

    if (!wasAdded) return;

    setWishlistAdded(true);
    setTimeout(() => setWishlistAdded(false), 2200);
  };

  return (
    <div className="premium-surface overflow-hidden rounded-2xl">
      <div className="grid gap-0 md:grid-cols-2">
        <div className="flex flex-col gap-8 p-8 sm:gap-6 sm:p-7 md:p-9">
          <div>
            <AnimatedHeading as="h3" className="font-display text-4xl font-semibold text-theme-bronze sm:text-5xl">
              {`Rs. ${data.price.toLocaleString('en-IN')}`}
            </AnimatedHeading>
            <p className="mt-2 text-[0.75rem] font-semibold uppercase tracking-wider text-theme-walnut/50 dark:text-theme-ivory/62 sm:text-xs sm:tracking-[0.28em]">
              Free white-glove delivery
            </p>
            <div className="mt-4 flex flex-wrap gap-3 sm:gap-2">
              <span className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] sm:px-3 sm:text-[0.62rem] ${
                isOutOfStock
                  ? 'border-red-300/70 bg-red-50 text-red-600'
                  : 'border-emerald-300/60 bg-emerald-50 text-emerald-700'
              }`}>
                {isOutOfStock ? 'Out of Stock' : `${stockQuantity} Ready to Order`}
              </span>
            </div>
          </div>

          <p className="text-base leading-7 text-theme-walnut/72 dark:text-theme-ivory/76 sm:text-sm sm:leading-[1.85]">
            {data.description}
          </p>

          <div className="rounded-[1.6rem] border border-theme-line/60 bg-white/60 px-4 py-4 shadow-[0_12px_34px_rgba(49,30,21,0.05)] dark:border-white/12 dark:bg-white/8 dark:shadow-[0_16px_42px_rgba(0,0,0,0.2)]">
            <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-theme-walnut/65 dark:text-theme-ivory/82 sm:text-xs sm:tracking-[0.28em]">
              View More Specs
            </p>
            <p className="mt-2 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/72">
              Material options, base finishes, add-ons, and configuration guidance now live in the
              {' '}
              <span className="font-semibold text-theme-bronze">View More Specs</span>
              {' '}
              panel for this product.
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`relative w-full overflow-hidden rounded-full py-5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-bronze sm:py-4 sm:text-sm sm:tracking-[0.28em] ${
                isOutOfStock
                  ? 'cursor-not-allowed bg-theme-line/80 text-theme-walnut/55 shadow-none dark:bg-white/10 dark:text-theme-ivory/45'
                  : added
                    ? 'bg-theme-olive text-white shadow-lg'
                    : 'bg-theme-bronze text-white shadow-lg hover:bg-theme-ink hover:shadow-xl active:scale-[0.98]'
              }`}
            >
              {isOutOfStock ? (
                <span>Out of Stock</span>
              ) : added ? (
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
                  : 'border-theme-line bg-white/55 text-theme-walnut hover:border-theme-bronze hover:bg-theme-bronze/10 hover:text-theme-bronze dark:bg-white/8 dark:text-theme-ivory'
              }`}
            >
              <HeartIcon filled={saved || wishlistAdded} className="h-5 w-5" />
            </button>
          </div>

          <p className="text-center text-xs leading-5 text-theme-walnut/40 dark:text-theme-ivory/50">
            {isOutOfStock
              ? 'This piece is currently unavailable to order. Re-enable it from the admin panel when stock returns.'
              : '5-year warranty · Easy returns · Nationwide delivery'}
          </p>
        </div>

        <div className="flex flex-col gap-8 border-t border-theme-line bg-theme-sand/10 p-8 sm:gap-6 sm:p-7 dark:bg-theme-mist/10 md:border-l md:border-t-0 md:p-9">
          <div>
            <p className="mb-1 text-[0.75rem] font-semibold uppercase tracking-wider text-theme-walnut/65 dark:text-theme-ivory/70 sm:text-xs sm:tracking-[0.28em]">
              Finish
            </p>
            <AnimatedHeading as="h3" className="font-display text-xl text-theme-ink dark:text-theme-ivory">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={data.size?.length ? "rounded-[1.4rem] border border-theme-line/60 bg-white/60 p-4 dark:bg-white/5" : "rounded-[1.4rem] border border-theme-line/60 bg-white/60 p-4 dark:bg-white/5 sm:col-span-2"}>
              <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-walnut/62 dark:text-theme-ivory/68">
                Quantity
              </p>
              <div className="inline-flex items-center rounded-full border border-theme-line bg-theme-mist/60 dark:bg-theme-mist/25">
                <button
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-theme-walnut transition-colors hover:text-theme-bronze disabled:cursor-not-allowed disabled:opacity-35 dark:text-theme-ivory"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center text-base font-bold text-theme-ink dark:text-theme-ivory">{quantity}</span>
                <button
                  onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                  disabled={isOutOfStock || quantity >= maxQuantity}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-theme-walnut transition-colors hover:text-theme-bronze disabled:cursor-not-allowed disabled:opacity-35 dark:text-theme-ivory"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {data.size?.length ? (
              <div className="rounded-[1.4rem] border border-theme-line/60 bg-white/60 p-4 dark:bg-white/5">
                <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-walnut/62 dark:text-theme-ivory/68">
                  Size / Configuration
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.size.map((size) => (
                    <OptionPill
                      key={size}
                      active={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </OptionPill>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <ZoomLensImage
            key={displayImage || data.imageUrl}
            src={displayImage || data.imageUrl}
            alt={currentColor?.name || data.name}
            label={currentColor?.name || data.colors?.[0]?.name || data.name}
            containerClassName="min-h-[18rem] flex-1 rounded-2xl border border-theme-line bg-theme-sand/20"
            imageClassName="h-full w-full object-contain transition-all duration-500"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </div>
    </div>
  );
}
