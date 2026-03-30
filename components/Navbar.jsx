'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  // localStorage sync
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    const savedCart = localStorage.getItem("cart");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [wishlist, cart]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToWishlist = (item) => setWishlist(prev => prev.find(p => p.id === item.id) ? prev : [...prev, item]);
  const removeFromWishlist = (id) => setWishlist(prev => prev.filter(p => p.id !== id));
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? {...p, quantity: p.quantity + 1} : p);
      }
      return [...prev, {...item, quantity: 1}];
    });
  };
  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(p => p.id === id ? {...p, quantity: Math.max(1, p.quantity + delta)} : p).filter(p => p.quantity > 0));
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));

  const sampleProducts = [
    { id: 1, name: "Milano Sofa", price: 45000, image: "/images/sofa.jpg" },
    { id: 2, name: "Verona Chair", price: 18500, image: "/images/chair.jpg" },
    { id: 3, name: "Aurelian Recliner", price: 32000, image: "/images/recliner.jpg" }
  ];

  const navLinks = [
    { name: "Sofas", href: "#sofas" },
    { name: "Chairs", href: "#chairs" },
    { name: "Recliners", href: "#recliners" },
    { name: "Pouffes", href: "#pouffes" },
    { name: "Customization", href: "/customization" },
    { name: "Contact", href: "#contact" }
  ];

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const HeartIcon = ({ filled, ...props }) => (
    <svg {...props} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );

  const ShoppingBagIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );

  const UserIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

  const XIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const MenuIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="8" x2="20" y2="8"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="16" x2="20" y2="16"/>
    </svg>
  );

  const TrashIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2s2 1 2 2v2m-4 0h8"/>
    </svg>
  );

  const MinusIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );

  const PlusIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50">
        {/* Navbar main bar */}
        <div className={`mx-auto mt-4 flex w-[calc(100%-1.5rem)] max-w-[90rem] items-center justify-between rounded-full border px-5 py-3 shadow-[0_16px_60px_rgba(18,14,11,0.16)] backdrop-blur-md transition-all duration-300 md:mt-5 md:w-[calc(100%-3rem)] md:px-6 lg:px-7 ${
          scrolled
            ? "border-theme-line bg-[rgba(251,247,241,0.92)] text-theme-walnut dark:border-white/10 dark:bg-[rgba(18,14,11,0.92)] dark:text-theme-ink"
            : "border-white/18 bg-[rgba(255,255,255,0.08)] text-theme-ivory dark:border-white/10 dark:bg-[rgba(0,0,0,0.14)] dark:text-theme-ivory"
        }`}>
          <Link href="#hero" scroll={true} className="shrink-0">
            <span className="font-display text-3xl font-semibold tracking-[0.16em]">LUXE</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden flex-1 items-center justify-center gap-6 px-6 text-[0.82rem] font-semibold uppercase tracking-[0.22em] lg:gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} scroll={true} className={`whitespace-nowrap transition-colors duration-300 ${scrolled ? "opacity-80 hover:opacity-100" : "opacity-88 hover:opacity-100"}`}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Icons: Theme + Wishlist + Cart + Account */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Wishlist */}
            <button onClick={() => setWishlistOpen(true)} className="relative p-2 transition-all hover:scale-110" title="Wishlist">
              <HeartIcon className={`h-5 w-5 ${scrolled ? "text-theme-walnut" : "text-theme-ivory"}`} filled={wishlist.length > 0} />
              {wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-xs font-bold text-white flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="relative p-2 transition-all hover:scale-110" title="Cart">
              <ShoppingBagIcon className={`h-5 w-5 ${scrolled ? "text-theme-walnut" : "text-theme-ivory"}`} />
              {totalCartItems > 0 && (
                <span className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] rounded-full bg-red-500 text-xs font-bold text-white flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
            {/* Account */}
            <div className="relative">
              <button onClick={() => setAccountOpen(!accountOpen)} className="p-2 transition-all hover:scale-110" title="Account">
                <UserIcon className={`h-5 w-5 ${scrolled ? "text-theme-walnut" : "text-theme-ivory"}`} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white/95 p-2 shadow-2xl backdrop-blur-md dark:bg-gray-800/95">
                  <div className="p-3 text-sm">
                    <p className="font-semibold">John Doe</p>
                    <p className="text-gray-500">john@example.com</p>
                  </div>
                  <div className="border-t border-gray-200 p-2">
                    <button className="w-full rounded-lg p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700">Profile</button>
                    <button className="w-full rounded-lg p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700">Orders</button>
                    <button className="w-full rounded-lg p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
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
        <div className={`mx-auto mt-3 w-[calc(100%-1.5rem)] overflow-hidden rounded-[1.75rem] border shadow-[0_16px_60px_rgba(18,14,11,0.16)] backdrop-blur-md transition-all duration-500 md:hidden ${
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
          <div className="mt-6 flex gap-4 pt-4">
            <button onClick={() => setWishlistOpen(true)} className="flex-1 p-3 text-left">
              <HeartIcon className="inline h-5 w-5" filled={false} /> Wishlist ({wishlist.length})
            </button>
            <button onClick={() => setCartOpen(true)} className="flex-1 p-3 text-left">
              <ShoppingBagIcon className="inline h-5 w-5" /> Cart ({totalCartItems})
            </button>
          </div>
        </div>
      </nav>

      {/* Wishlist Modal */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setWishlistOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Wishlist</h3>
              <button onClick={() => setWishlistOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 max-h-96 overflow-auto">
              {wishlist.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items in wishlist. <button onClick={() => addToWishlist(sampleProducts[0])} className="text-blue-600 hover:underline">Add sample sofa</button></p>
              ) : (
                wishlist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <img src={item.image || "https://via.placeholder.com/64"} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Rs. {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => addToCart(item)} className="p-2 hover:bg-blue-100 rounded-lg">
                        <ShoppingBagIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeFromWishlist(item.id)} className="p-2 hover:bg-red-100 rounded-lg">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {wishlist.length > 0 && (
              <button className="mt-6 w-full rounded-xl bg-gray-900 py-3 text-white font-semibold hover:bg-gray-800 transition-colors">
                Add all to cart
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Shopping Cart</h3>
              <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 max-h-96 overflow-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty. <button onClick={() => addToCart(sampleProducts[1])} className="text-blue-600 hover:underline">Add sample chair</button></p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <img src={item.image || "https://via.placeholder.com/64"} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 rounded">
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 rounded">
                        <PlusIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 hover:bg-red-100 rounded-lg">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl dark:bg-gray-700">
                <div className="flex justify-between text-lg font-bold mb-2">
                  Total: Rs. {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                </div>
                <button className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition-colors">
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

