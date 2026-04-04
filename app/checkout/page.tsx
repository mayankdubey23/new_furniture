'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import AnimatedHeading from '@/components/AnimatedHeading';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
}

const initialForm: CustomerForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
  notes: '',
};

type CheckoutStatus = 'form' | 'loading' | 'success' | 'error';

export default function CheckoutPage() {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState<CustomerForm>(initialForm);
  const [status, setStatus] = useState<CheckoutStatus>('form');
  const [orderId, setOrderId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const payload = {
        items: cart.map(item => ({
          productId: String(item.id),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        })),
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
        },
        notes: form.notes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setOrderId(data.orderId);
      clearCart();
      setStatus('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  // Empty cart — redirect
  if (totalItems === 0 && status === 'form') {
    return (
      <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.22),transparent_24%),linear-gradient(115deg,rgba(18,14,11,0.92)_12%,rgba(48,32,23,0.72)_45%,rgba(18,14,11,0.92)_100%)]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="section-shell rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.34)] px-8 py-20 text-theme-ivory backdrop-blur-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Checkout</p>
            <AnimatedHeading as="h1" className="mb-6 font-display text-5xl text-theme-ivory">
              Your cart is empty
            </AnimatedHeading>
            <Link
              href="/#sofas"
              className="inline-block rounded-full bg-theme-bronze px-10 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-white hover:bg-theme-ink transition-all"
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.22),transparent_24%),linear-gradient(115deg,rgba(18,14,11,0.92)_12%,rgba(48,32,23,0.72)_45%,rgba(18,14,11,0.92)_100%)]" />
        <div className="pointer-events-none absolute left-[-8rem] top-[6rem] h-[20rem] w-[20rem] rounded-full bg-theme-bronze/20 blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <div className="section-shell rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.34)] px-8 py-20 text-theme-ivory backdrop-blur-sm shadow-2xl">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-theme-bronze/20 text-theme-bronze text-4xl">
              ✓
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Order Confirmed</p>
            <AnimatedHeading as="h1" className="mt-4 font-display text-5xl text-theme-ivory">
              Thank you!
            </AnimatedHeading>
            <p className="mt-4 text-lg text-theme-ivory/70">
              Your order has been placed successfully. Our team will get in touch with you shortly.
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze">Order Reference</p>
              <p className="mt-1 font-mono text-sm text-theme-ivory/80 break-all">{orderId}</p>
            </div>
            <p className="mt-4 text-sm text-theme-ivory/50">
              Save this reference number to track your order status.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="rounded-full bg-theme-bronze px-8 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white hover:bg-theme-ink transition-all"
              >
                Back to Home
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-theme-line/50 px-8 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-theme-ivory/70 hover:border-theme-bronze hover:text-theme-bronze transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.15),transparent_30%),linear-gradient(115deg,rgba(18,14,11,0.95)_10%,rgba(48,32,23,0.6)_50%,rgba(18,14,11,0.95)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[10rem] h-[30rem] w-[30rem] rounded-full bg-theme-bronze/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Checkout</p>
          <AnimatedHeading as="h1" className="mt-3 font-display text-5xl text-theme-ink dark:text-theme-ivory md:text-6xl">
            Complete Your Order
          </AnimatedHeading>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* LEFT: Customer Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="section-shell rounded-[2rem] border border-theme-line/50 p-8 md:p-10">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-theme-bronze">
                Delivery Details
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
                    Full Name <span className="text-theme-bronze">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
                    Email <span className="text-theme-bronze">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@email.com"
                    className="rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
                    Phone <span className="text-theme-bronze">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    className="rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
                    Delivery Address <span className="text-theme-bronze">*</span>
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="Street, Building, Locality"
                    className="rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
                    City <span className="text-theme-bronze">*</span>
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="Bengaluru"
                    className="rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
                    Pincode <span className="text-theme-bronze">*</span>
                  </label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                    placeholder="560001"
                    maxLength={6}
                    className="rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
                    Special Notes
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Customization preferences, delivery instructions, etc."
                    className="resize-none rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30"
                  />
                </div>
              </div>
            </div>

            {status === 'error' && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="relative w-full overflow-hidden rounded-full bg-theme-ink py-4 text-sm font-bold uppercase tracking-[0.28em] text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)]"
            >
              {status === 'loading' ? 'Placing Order...' : `Place Order · ₹${totalPrice.toLocaleString('en-IN')}`}
            </button>

            <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-theme-walnut/50 dark:text-theme-ivory/40">
              White-Glove Delivery · 5-Year Warranty · Pay on Delivery
            </p>
          </form>

          {/* RIGHT: Order Summary */}
          <div className="premium-surface sticky top-32 self-start rounded-[2rem] border border-white/5 p-8 shadow-2xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-theme-bronze">
              Order Summary
            </p>
            <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-theme-line/40 bg-white/30 p-3 dark:bg-black/20">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-theme-ink dark:text-white">{item.name}</p>
                    <p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/50">Qty: {item.quantity}</p>
                  </div>
                  <p className="flex-shrink-0 text-sm font-bold text-theme-bronze">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-theme-line/40 pt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-theme-walnut/70 dark:text-theme-ivory/60">Subtotal ({totalItems} items)</span>
                <span className="font-semibold text-theme-ink dark:text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-walnut/70 dark:text-theme-ivory/60">Delivery</span>
                <span className="text-xs font-bold uppercase tracking-wider text-theme-olive">Free</span>
              </div>
              <div className="flex justify-between border-t border-theme-line/40 pt-3 text-lg font-display">
                <span className="text-theme-ink dark:text-white">Total</span>
                <span className="text-theme-bronze">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link
              href="/customization"
              className="mt-6 block w-full rounded-full border border-theme-line/50 py-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-theme-walnut hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/70 dark:hover:text-theme-bronze transition-all"
            >
              ← Edit Cart
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
