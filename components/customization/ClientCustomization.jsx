'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ClientCustomization() {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-transparent px-6 pb-16 pt-32 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze mb-4">Customization Studio</p>
            <h1 className="font-display text-5xl text-theme-ink mb-6 md:text-6xl">Ready to Customize?</h1>
            <p className="mb-10 text-lg text-theme-walnut/70 dark:text-theme-ink/65 max-w-2xl mx-auto">
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
    <main className="min-h-screen px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Your Selections</p>
          <h1 className="font-display mt-3 text-5xl text-theme-ink md:text-6xl">Customize & Checkout</h1>
        </div>

        <div className="grid gap-12 md:grid-cols-[1fr_380px]">
          {/* Customization Content */}
          <div>
            <section className="section-shell rounded-[2rem] px-8 py-12 mb-12">
              <h2 className="font-display text-3xl text-theme-ink mb-6">Personalize Your Selection</h2>
              <p className="text-lg text-theme-walnut/78 dark:text-theme-ink/76 mb-8">
                For the {cart.length} {cart.length === 1 ? 'piece' : 'pieces'} in your cart, choose from premium fabrics, wood stains,
                and custom dimensions. Our team will guide proportions and comfort.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="premium-surface rounded-[1.5rem] p-6">
                  <h3 className="font-semibold text-lg mb-3">Fabric & Upholstery</h3>
                  <ul className="space-y-2 text-sm text-theme-walnut/70">
                    <li>• Velvet (Olive, Taupe, Charcoal)</li>
                    <li>• Full-grain leather (Saddle, Cognac)</li>
                    <li>• Textured boucle (Bronze, Sand)</li>
                  </ul>
                </div>
                <div className="premium-surface rounded-[1.5rem] p-6">
                  <h3 className="font-semibold text-lg mb-3">Dimensions & Details</h3>
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
