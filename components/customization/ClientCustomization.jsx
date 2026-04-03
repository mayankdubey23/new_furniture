'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import AnimatedHeading from '@/components/AnimatedHeading';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Customization Data Options ---
const swatches = {
  fabric: [
    { id: 'f1', name: 'Olive Velvet', hex: '#4B5320' },
    { id: 'f2', name: 'Cognac Leather', hex: '#8B4513' },
    { id: 'f3', name: 'Sand Boucle', hex: '#D2B48C' },
    { id: 'f4', name: 'Charcoal Linen', hex: '#36454F' },
  ],
  wood: [
    { id: 'w1', name: 'Dark Walnut', hex: '#3e2723' },
    { id: 'w2', name: 'Natural Oak', hex: '#8d6e63' },
    { id: 'w3', name: 'Matte Black', hex: '#1a1a1a' },
  ],
  metal: [
    { id: 'm1', name: 'Brushed Brass', hex: '#b5a642' },
    { id: 'm2', name: 'Polished Nickel', hex: '#c0c0c0' },
  ]
};

export default function ClientCustomization() {
  const { cart, updateQuantity, totalPrice } = useCart();
  const containerRef = useRef();

  // Store user customizations per item id: { itemId: { fabric: 'f1', wood: 'w1', extra: 'power' } }
  const [customs, setCustoms] = useState({});

  // GSAP Entrance Animation
  useGSAP(() => {
    if (cart.length > 0 && containerRef.current) {
      gsap.from('.gsap-slide-up', {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
      });
    }
  }, { scope: containerRef, dependencies: [cart.length] });

  const handleSelect = (itemId, type, value) => {
    setCustoms(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [type]: value }
    }));
  };

  // Helper to determine what options to show based on item name
  const getItemType = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('recliner')) return 'recliner';
    if (lowerName.includes('pouffe')) return 'pouffe';
    if (lowerName.includes('chair')) return 'chair';
    return 'sofa'; // Default
  };

  // --- Empty Cart View ---
  if (cart.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-16 pt-32 md:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.22),transparent_24%),linear-gradient(115deg,rgba(18,14,11,0.92)_12%,rgba(48,32,23,0.72)_45%,rgba(18,14,11,0.92)_100%)]" />
        <div className="pointer-events-none absolute left-[-8rem] top-[6rem] h-[20rem] w-[20rem] rounded-full bg-theme-bronze/20 blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="section-shell rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.34)] px-8 py-20 text-center text-theme-ivory backdrop-blur-sm shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze mb-4">Customization Studio</p>
            <AnimatedHeading as="h1" className="mb-6 font-display text-5xl text-theme-ivory md:text-6xl">
              Ready to Customize?
            </AnimatedHeading>
            <p className="mb-10 text-lg text-theme-ivory/74 max-w-2xl mx-auto">
              Add pieces to your cart first, then return here to select fabrics, finishes, and perfect the details.
            </p>
            <Link
              href="/#sofas"
              className="rounded-full bg-theme-bronze px-10 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-white hover:bg-theme-ink transition-all shadow-lg hover:shadow-theme-bronze/30"
            >
              Start Shopping →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --- Customization Studio View ---
  return (
    <main ref={containerRef} className="relative min-h-screen overflow-hidden px-6 pb-20 pt-32 md:px-10 lg:px-20">
      {/* Premium Ambient Backgrounds */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.15),transparent_30%),linear-gradient(115deg,rgba(18,14,11,0.95)_10%,rgba(48,32,23,0.6)_50%,rgba(18,14,11,0.95)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[10rem] h-[30rem] w-[30rem] rounded-full bg-theme-bronze/10 blur-[150px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[20rem] h-[25rem] w-[25rem] rounded-full bg-theme-olive/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="gsap-slide-up mb-12 rounded-[2rem] border border-white/5 bg-[rgba(18,14,11,0.4)] px-10 py-12 text-theme-ivory backdrop-blur-md shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Bespoke Studio</p>
          <AnimatedHeading as="h1" className="mt-4 font-display text-5xl text-theme-ivory md:text-6xl">
            Tailor Your Masterpieces
          </AnimatedHeading>
          <p className="mt-4 text-theme-ivory/60 max-w-2xl text-lg">
            Personalize fabrics, materials, and configurations for each piece in your collection.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* LEFT COLUMN: Interactive Customization Cards */}
          <div className="space-y-8">
            {cart.map((item, index) => {
              const itemType = getItemType(item.name);
              const selectedFabric = customs[item.id]?.fabric || swatches.fabric[0].id;
              const selectedWood = customs[item.id]?.wood || swatches.wood[0].id;
              const selectedExtra = customs[item.id]?.extra || 'standard';

              return (
                <div key={item.id} className="gsap-slide-up section-shell relative overflow-hidden rounded-[2rem] p-8 md:p-10 border border-theme-line/50 hover:border-theme-bronze/30 transition-colors duration-500">
                  <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* Item Thumbnail & Info */}
                    <div className="shrink-0 w-full md:w-48 flex flex-col items-center md:items-start text-center md:text-left">
                      <div className="relative h-40 w-40 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                      <p className="mt-4 font-display text-2xl text-theme-ink dark:text-white leading-tight">{item.name}</p>
                      <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-theme-bronze">Qty: {item.quantity}</p>
                    </div>

                    {/* Customization Controls */}
                    <div className="flex-1 space-y-8">
                      
                      {/* 1. Fabric Selection (All Items) */}
                      <div>
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-theme-walnut dark:text-theme-ivory/80 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-theme-bronze"></span>
                          Upholstery Material
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {swatches.fabric.map((swatch) => (
                            <div key={swatch.id} className="flex flex-col items-center gap-2">
                              <button
                                onClick={() => handleSelect(item.id, 'fabric', swatch.id)}
                                className="relative h-12 w-12 rounded-full outline-none"
                              >
                                {/* Framer Motion active ring */}
                                {selectedFabric === swatch.id && (
                                  <motion.div
                                    layoutId={`ring-fab-${item.id}`}
                                    className="absolute -inset-2 rounded-full border-2 border-theme-bronze"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                                <div className="absolute inset-0 rounded-full shadow-inner" style={{ backgroundColor: swatch.hex }} />
                              </button>
                              <span className={`text-[10px] uppercase tracking-wider ${selectedFabric === swatch.id ? 'text-theme-ink dark:text-white font-bold' : 'text-theme-walnut/60 dark:text-white/40'}`}>
                                {swatch.name.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. Base/Leg Finish (For Sofa & Chair) */}
                      {(itemType === 'sofa' || itemType === 'chair') && (
                        <div>
                          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-theme-walnut dark:text-theme-ivory/80 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-theme-olive"></span>
                            Base Finish
                          </h3>
                          <div className="flex gap-4">
                            {swatches.wood.map((swatch) => (
                              <button
                                key={swatch.id}
                                onClick={() => handleSelect(item.id, 'wood', swatch.id)}
                                className={`relative px-5 py-2.5 rounded-full border text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                                  selectedWood === swatch.id 
                                    ? 'border-theme-bronze bg-theme-bronze/10 text-theme-bronze dark:text-white' 
                                    : 'border-theme-line text-theme-walnut/60 hover:border-theme-bronze/50'
                                }`}
                              >
                                {swatch.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Special Add-ons (Recliners & Pouffes) */}
                      {itemType === 'recliner' && (
                        <div>
                          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-theme-walnut dark:text-theme-ivory/80 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-theme-ink dark:bg-white"></span>
                            Motion Mechanism
                          </h3>
                          <div className="flex gap-4">
                            <button
                              onClick={() => handleSelect(item.id, 'extra', 'standard')}
                              className={`flex-1 px-4 py-3 rounded-xl border text-xs font-semibold uppercase tracking-widest transition-all ${selectedExtra === 'standard' ? 'border-theme-ink bg-theme-ink text-white dark:bg-white dark:text-theme-ink dark:border-white' : 'border-theme-line text-theme-walnut'}`}
                            >
                              Manual Glide
                            </button>
                            <button
                              onClick={() => handleSelect(item.id, 'extra', 'power')}
                              className={`flex-1 px-4 py-3 rounded-xl border text-xs font-semibold uppercase tracking-widest transition-all ${selectedExtra === 'power' ? 'border-theme-ink bg-theme-ink text-white dark:bg-white dark:text-theme-ink dark:border-white' : 'border-theme-line text-theme-walnut'}`}
                            >
                              Power Motor (+₹15,000)
                            </button>
                          </div>
                        </div>
                      )}

                      {itemType === 'pouffe' && (
                        <div>
                          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-theme-walnut dark:text-theme-ivory/80 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-theme-sand"></span>
                            Stitching Detail
                          </h3>
                          <div className="flex gap-4">
                            {['Hidden Seam', 'Contrast Piping'].map((stitch, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSelect(item.id, 'extra', stitch)}
                                className={`px-5 py-2.5 rounded-full border text-xs font-semibold uppercase tracking-widest transition-all ${selectedExtra === stitch ? 'border-theme-bronze bg-theme-bronze/10 text-theme-bronze' : 'border-theme-line text-theme-walnut'}`}
                              >
                                {stitch}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Sticky Cart Summary */}
          <div>
            <div className="gsap-slide-up premium-surface sticky top-32 rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/5">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-theme-bronze mb-8">Studio Summary</p>

              <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-theme-line/50 bg-white/40 dark:bg-black/20"
                    >
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover shrink-0 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-theme-ink dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-theme-walnut/70 dark:text-theme-ivory/50 mt-1 truncate">
                          {customs[item.id]?.fabric ? swatches.fabric.find(f => f.id === customs[item.id].fabric)?.name : 'Standard'} Finish
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="text-sm font-bold text-theme-bronze">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-2 bg-theme-sand/30 dark:bg-white/5 rounded-full px-2 py-0.5 mt-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-xs font-bold text-theme-walnut dark:text-white/70 hover:text-theme-bronze px-1">-</button>
                          <span className="text-xs font-bold w-3 text-center dark:text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-xs font-bold text-theme-walnut dark:text-white/70 hover:text-theme-bronze px-1">+</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="space-y-4 text-sm border-t border-theme-line/50 pt-6">
                <div className="flex justify-between">
                  <span className="text-theme-walnut/70 dark:text-theme-ivory/60 font-medium">Subtotal</span>
                  <span className="font-bold text-theme-ink dark:text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-walnut/70 dark:text-theme-ivory/60 font-medium">Bespoke Adjustments</span>
                  <span className="text-theme-olive font-bold uppercase tracking-wider text-[10px] bg-theme-olive/10 px-2 py-1 rounded-sm">Included</span>
                </div>
                <div className="flex justify-between text-xl font-display pt-4 border-t border-theme-line/50">
                  <span className="text-theme-ink dark:text-white">Total Studio Price</span>
                  <span className="text-theme-bronze">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-8 relative group flex w-full items-center justify-center overflow-hidden rounded-full bg-theme-ink dark:bg-white py-4 text-sm font-bold uppercase tracking-[0.28em] text-white dark:text-theme-ink transition-all hover:scale-[1.02] active:scale-95"
              >
                <span className="relative z-10">Proceed to Checkout</span>
                <div className="absolute inset-0 bg-theme-bronze translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
              </Link>

              <Link
                href="/#sofas"
                className="mt-4 block w-full rounded-full border border-theme-line/50 py-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-theme-walnut hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/70 dark:hover:text-theme-bronze transition-all"
              >
                ← Back to Collections
              </Link>

              <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-widest text-theme-walnut/50 dark:text-theme-ivory/40">
                White-Glove Delivery · 5-Year Warranty
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}