'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import AnimatedHeading from "./AnimatedHeading";

function HeartIcon({ filled, ...props }) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function ShoppingBagIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="8" x2="20" y2="8"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="16" x2="20" y2="16"/>
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2s2 1 2 2v2m-4 0h8"/>
    </svg>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const { wishlist, removeFromWishlist, totalWishlistItems } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Sofas", href: "/#sofas" },
    { name: "Chairs", href: "/#chairs" },
    { name: "Recliners", href: "/#recliners" },
    { name: "Pouffes", href: "/#pouffes" },
    { name: "Customization", href: "/customization" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50">
        <div className={`mx-auto mt-3 flex w-[calc(100%-1rem)] max-w-[96rem] items-center justify-between rounded-[2rem] border px-5 py-3 shadow-[0_18px_60px_rgba(18,14,11,0.12)] backdrop-blur-xl transition-all duration-300 md:mt-4 md:w-[calc(100%-2rem)] md:px-6 lg:px-8 ${
          scrolled
            ? "border-theme-line/70 bg-[rgba(251,247,241,0.88)] text-theme-walnut dark:border-white/10 dark:bg-[rgba(18,14,11,0.88)] dark:text-theme-ink"
            : "border-white/14 bg-[rgba(18,14,11,0.16)] text-theme-ivory dark:border-white/10 dark:bg-[rgba(0,0,0,0.16)] dark:text-theme-ivory"
        }`}>
          <Link href="/#hero" scroll={true} className="shrink-0">
            <span className="font-display text-[1.9rem] font-semibold tracking-[0.18em] md:text-[2.15rem]">LUXE</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden flex-1 items-center justify-center gap-6 px-6 text-[0.75rem] font-semibold uppercase tracking-[0.28em] lg:gap-8 md:flex">
{[...navLinks, { name: "Admin", href: "/admin" }].map((link) => (
              <li key={link.name}>
                <Link href={link.href} scroll={true} className={`whitespace-nowrap transition-colors duration-300 ${scrolled ? "opacity-78 hover:opacity-100" : "opacity-84 hover:opacity-100"}`}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Icons */}
          <div className="flex items-center gap-3">
            <ThemeToggle scrolled={scrolled} />

            {/* Wishlist */}
            <button onClick={() => setWishlistOpen(true)} className="relative rounded-full p-2 transition-all hover:scale-110 hover:bg-white/8" title="Wishlist">
              <HeartIcon className={`h-5 w-5 ${scrolled ? "text-theme-walnut" : "text-theme-ivory"}`} filled={wishlist.length > 0} />
              {totalWishlistItems > 0 && (
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-xs font-bold text-white flex items-center justify-center">
                  {totalWishlistItems}
                </span>
              )}
            </button>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="relative rounded-full p-2 transition-all hover:scale-110 hover:bg-white/8" title="Cart">
              <ShoppingBagIcon className={`h-5 w-5 ${scrolled ? "text-theme-walnut" : "text-theme-ivory"}`} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] rounded-full bg-theme-bronze text-xs font-bold text-white flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Account */}
            <div className="relative">
              <button onClick={() => setAccountOpen(!accountOpen)} className="rounded-full p-2 transition-all hover:scale-110 hover:bg-white/8" title="Account">
                <UserIcon className={`h-5 w-5 ${scrolled ? "text-theme-walnut" : "text-theme-ivory"}`} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white/95 p-2 shadow-2xl backdrop-blur-md dark:bg-[rgba(34,27,23,0.95)]">
                  <div className="p-3 text-sm">
                    <p className="font-semibold text-theme-ink">Guest User</p>
                    <p className="text-theme-walnut/50 dark:text-theme-ink/50 text-xs mt-0.5">Not signed in</p>
                  </div>
                  <div className="border-t border-theme-line p-2 space-y-1">
                    {["Profile", "Orders", "Sign In"].map(item => (
                      <button key={item} className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-theme-walnut hover:bg-theme-sand/30 transition-colors dark:text-theme-ink dark:hover:bg-theme-mist/30">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsOpen(true)} className={`rounded-full border p-2 ${scrolled ? "border-theme-walnut/30 bg-theme-walnut/8 dark:border-white/20 dark:bg-white/6" : "border-white/20 bg-white/6"}`}>
              <MenuIcon className={`h-6 w-6 ${scrolled ? "text-theme-walnut" : "text-theme-ivory"}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`mx-auto mt-3 w-[calc(100%-1rem)] overflow-hidden rounded-[1.75rem] border shadow-[0_16px_60px_rgba(18,14,11,0.16)] backdrop-blur-md transition-all duration-500 md:hidden ${
          isOpen ? "border-white/18 bg-[rgba(18,14,11,0.38)] max-h-96 p-5 text-theme-ivory" : "max-h-0 p-0"
        }`}>
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-theme-ivory/65">Navigation</div>
            <button onClick={() => setIsOpen(false)} className="p-1">
              <XIcon className="h-5 w-5 text-theme-ivory" />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-4 text-base font-medium">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} scroll={true} onClick={() => setIsOpen(false)} className="hover:opacity-80">
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 flex gap-4 pt-4 border-t border-white/10">
            <button onClick={() => { setWishlistOpen(true); setIsOpen(false); }} className="flex-1 p-3 text-left text-sm">
              <HeartIcon className="inline h-4 w-4 mr-2" filled={false} /> Wishlist ({totalWishlistItems})
            </button>
            <button onClick={() => { setCartOpen(true); setIsOpen(false); }} className="flex-1 p-3 text-left text-sm">
              <ShoppingBagIcon className="inline h-4 w-4 mr-2" /> Cart ({totalItems})
            </button>
          </div>
        </div>
      </nav>

      {/* Wishlist Modal */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setWishlistOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[rgba(34,27,23,0.98)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-theme-bronze">Saved Items</p>
                <AnimatedHeading as="h3" className="mt-1 font-display text-2xl text-theme-ink">
                  Wishlist
                </AnimatedHeading>
              </div>
              <button onClick={() => setWishlistOpen(false)} className="rounded-full p-2 hover:bg-theme-sand/30 transition-colors">
                <XIcon className="h-5 w-5 text-theme-walnut dark:text-theme-ink" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto space-y-3">
              {wishlist.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-theme-walnut/50 dark:text-theme-ink/45 text-sm">No saved items yet.</p>
                </div>
              ) : (
                wishlist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-theme-line">
                    <img src={item.image || ""} alt={item.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-theme-ink truncate">{item.name}</p>
                      <p className="text-xs text-theme-bronze font-semibold mt-0.5">₹{item.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => removeFromWishlist(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-theme-walnut/40 hover:text-red-500 transition-colors">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[rgba(34,27,23,0.98)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-theme-bronze">Your Bag</p>
                <AnimatedHeading as="h3" className="mt-1 font-display text-2xl text-theme-ink">
                  Shopping Cart
                </AnimatedHeading>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-full p-2 hover:bg-theme-sand/30 transition-colors">
                <XIcon className="h-5 w-5 text-theme-walnut dark:text-theme-ink" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-auto space-y-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-theme-walnut/50 dark:text-theme-ink/45 text-sm">Your cart is empty.</p>
                  <Link href="/#sofas" onClick={() => setCartOpen(false)} className="mt-4 inline-block text-sm font-semibold text-theme-bronze hover:underline">
                    Browse collection →
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-theme-line">
                    <img src={item.image || ""} alt={item.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-theme-ink truncate">{item.name}</p>
                      <p className="text-xs text-theme-bronze font-semibold mt-0.5">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-theme-sand/40 text-theme-walnut dark:text-theme-ink transition-colors">
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-theme-ink">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-theme-sand/40 text-theme-walnut dark:text-theme-ink transition-colors">
                        +
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-1 h-7 w-7 flex items-center justify-center rounded-full hover:bg-red-50 text-theme-walnut/40 hover:text-red-500 transition-colors dark:text-theme-ink/40">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-base font-bold border-t border-theme-line pt-4">
                  <span className="text-theme-walnut dark:text-theme-ink">Total</span>
                  <span className="text-theme-bronze">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <Link
                  href="/customization"
                  onClick={() => setCartOpen(false)}
                  className="block w-full rounded-full bg-theme-bronze py-3.5 text-center text-sm font-semibold uppercase tracking-[0.22em] text-white hover:bg-theme-ink transition-all"
                >
                  Customize & Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
