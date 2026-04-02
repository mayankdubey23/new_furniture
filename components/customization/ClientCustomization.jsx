'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import AnimatedHeading from '@/components/AnimatedHeading';

export default function ClientCustomization() {
  const { cart, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-16 pt-32 md:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.22),transparent_24%),linear-gradient(115deg,rgba(18,14,11,0.92)_12%,rgba(48,32,23,0.72)_45%,rgba(18,14,11,0.92)_100%)]" />
        <div className="pointer-events-none absolute left-[-8rem] top-[6rem] h-[20rem] w-[20rem] rounded-full bg-theme-bronze/20 blur-[120px]" />
        <div className="pointer-events-none absolute right-[-4rem] top-[8rem] h-[18rem] w-[18rem] rounded-full bg-theme-olive/14 blur-[110px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="section-shell rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.34)] px-8 py-20 text-center text-theme-ivory backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze mb-4">Customization Studio</p>
            <AnimatedHeading as="h1" className="mb-6 font-display text-5xl text-theme-ivory md:text-6xl">
              Ready to Customize?
            </AnimatedHeading>
            <p className="mb-10 text-lg text-theme-ivory/74 max-w-2xl mx-auto">
              Add pieces to your cart first, then return here to select fabrics, finishes, and perfect the details.
            </p>
            <Link
              href="/#sofas"
              className="rounded-full bg-theme-bronze px-10 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-white hover:bg-theme-ink transition-all"
            >
              Start Shopping →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.22),transparent_24%),linear-gradient(115deg,rgba(18,14,11,0.92)_12%,rgba(48,32,23,0.72)_45%,rgba(18,14,11,0.92)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[6rem] h-[20rem] w-[20rem] rounded-full bg-theme-bronze/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[8rem] h-[18rem] w-[18rem] rounded-full bg-theme-olive/14 blur-[110px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.34)] px-8 py-10 text-theme-ivory backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Your Selections</p>
          <AnimatedHeading as="h1" className="mt-3 font-display text-5xl text-theme-ivory md:text-6xl">
            Customize & Checkout
          </AnimatedHeading>
        </div>

        <div className="grid gap-12 md:grid-cols-[1fr_380px]">
          {/* Customization Content */}
          <div>
            <section className="section-shell rounded-[2rem] px-8 py-12 mb-12">
              <AnimatedHeading as="h2" className="mb-6 font-display text-3xl text-theme-ink">
                Personalize Your Selection
              </AnimatedHeading>
              <p className="text-lg text-theme-walnut/78 dark:text-theme-ink/76 mb-8">
                For the {cart.length} {cart.length === 1 ? 'piece' : 'pieces'} in your cart, choose from premium fabrics, wood stains,
                and custom dimensions. Our team will guide proportions and comfort.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="premium-surface rounded-[1.5rem] p-6">
                  <AnimatedHeading as="h3" className="mb-3 text-lg font-semibold text-theme-ink">
                    Fabric & Upholstery
                  </AnimatedHeading>
                  <ul className="space-y-2 text-sm text-theme-walnut/70">
                    <li>• Velvet (Olive, Taupe, Charcoal)</li>
                    <li>• Full-grain leather (Saddle, Cognac)</li>
                    <li>• Textured boucle (Bronze, Sand)</li>
                  </ul>
                </div>
                <div className="premium-surface rounded-[1.5rem] p-6">
                  <AnimatedHeading as="h3" className="mb-3 text-lg font-semibold text-theme-ink">
                    Dimensions & Details
                  </AnimatedHeading>
                  <ul className="space-y-2 text-sm text-theme-walnut/70">
                    <li>• Seat depth adjustment</li>
                    <li>• Leg finish options</li>
                    <li>• Accent stitching</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Cart Summary */}
          <div>
            <div className="premium-surface sticky top-28 rounded-2xl p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze mb-6">Order Summary</p>

              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-theme-line">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-theme-bronze">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => updateQuantity(item.id, -1)} className="h-6 w-6 rounded-full text-xs font-bold text-theme-walnut hover:bg-theme-sand/50 dark:text-theme-ink">-</button>
                      <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="h-6 w-6 rounded-full text-xs font-bold text-theme-walnut hover:bg-theme-sand/50 dark:text-theme-ink">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm border-t border-theme-line pt-4">
                <div className="flex justify-between">
                  <span className="text-theme-walnut/70 dark:text-theme-ink/60">Subtotal</span>
                  <span className="font-semibold text-theme-ink">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-walnut/70 dark:text-theme-ink/60">Customization</span>
                  <span className="text-theme-olive font-semibold">Included</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-theme-bronze">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button className="mt-6 w-full rounded-full bg-theme-bronze py-4 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-lg hover:bg-theme-ink transition-all">
                Continue to Checkout
              </button>

              <Link
                href="/"
                className="mt-4 block w-full rounded-full border border-theme-line py-3 text-center text-sm font-semibold uppercase tracking-[0.22em] text-theme-walnut hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ink transition-all"
              >
                ← Keep Shopping
              </Link>

              <p className="mt-6 text-center text-xs text-theme-walnut/45 dark:text-theme-ink/40 leading-5">
                Free delivery · 5-year warranty · Custom production 6-8 weeks
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
