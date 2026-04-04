'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (totalItems === 0) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
          <Link
            href="/#sofas"
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold uppercase tracking-widest rounded-full text-white bg-theme-bronze hover:bg-theme-ink transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-theme-ink dark:text-white mb-8">Shopping Cart</h1>
        <div className="space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex bg-white/70 dark:bg-white/5 rounded-2xl shadow border border-theme-line/40 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-28 h-28 object-cover" />
              <div className="p-5 flex-1">
                <h3 className="text-base font-semibold text-theme-ink dark:text-white">{item.name}</h3>
                <p className="text-lg font-bold text-theme-bronze mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                <div className="flex items-center mt-3 gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 border border-theme-line/60 rounded-full flex items-center justify-center hover:border-theme-bronze hover:text-theme-bronze text-theme-walnut dark:text-white transition-all"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-theme-ink dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 border border-theme-line/60 rounded-full flex items-center justify-center hover:border-theme-bronze hover:text-theme-bronze text-theme-walnut dark:text-white transition-all"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-2 text-xs font-semibold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white/70 dark:bg-white/5 p-6 rounded-2xl shadow border border-theme-line/40">
          <div className="flex justify-between mb-2 text-sm text-theme-walnut/70 dark:text-theme-ivory/60">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-theme-ink dark:text-white border-t border-theme-line/40 pt-4 mt-2">
            <span>Total</span>
            <span className="text-theme-bronze">₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/customization"
              className="w-full text-center rounded-full border border-theme-line/50 py-3 text-xs font-bold uppercase tracking-[0.25em] text-theme-walnut hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/70 dark:hover:text-theme-bronze transition-all"
            >
              Customize Your Pieces
            </Link>
            <Link
              href="/checkout"
              className="w-full text-center rounded-full bg-theme-ink py-3 text-sm font-bold uppercase tracking-[0.28em] text-white hover:bg-theme-bronze transition-all dark:bg-white dark:text-[var(--theme-contrast-ink)]"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
