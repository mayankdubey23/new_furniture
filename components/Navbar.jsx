'use client';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Updated Navigation links array (About removed, Contact added)
  const navLinks = [
    { name: 'Sofas', href: '#sofas' },
    { name: 'Recliners', href: '#recliners' },
    { name: 'Pouffes', href: '#pouffes' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    // Added dark mode backgrounds
    <nav className="fixed top-0 w-full bg-white/70 dark:bg-zinc-950/80 backdrop-blur-xl z-50 border-b border-theme-beige/50 dark:border-white/10 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo Section */}
        <div className="text-3xl font-extrabold tracking-tighter cursor-pointer">
          <Link href="#hero">
            <span className="text-theme-brown dark:text-white hover:text-theme-teal transition-colors">Luxe</span>
            <span className="text-theme-teal hover:text-theme-forest transition-colors">Decor</span>
          </Link>
        </div>
        
        {/* Desktop Navigation Links (Center) */}
        <ul className="hidden md:flex space-x-10 text-lg font-semibold text-theme-brown dark:text-theme-beige/90">
          {navLinks.map((link) => (
            <li key={link.name} className="relative group">
              <Link 
                href={link.href} 
                className="hover:text-theme-forest transition-colors duration-300"
              >
                {link.name}
              </Link>
              {/* Cool Animated Underline Effect */}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-theme-forest transition-all duration-300 ease-out group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        {/* Right Side Icons: Theme, Login, Wishlist, Cart */}
        <div className="hidden md:flex items-center gap-6 text-theme-brown dark:text-white">
          
          {/* Night Mode Button (Untouched) */}
          <ThemeToggle />

          {/* Login Text Link */}
          <Link href="/login" className="font-semibold text-lg hover:text-theme-forest transition-colors">
            Login
          </Link>

          <div className="flex items-center gap-4">
            {/* Wishlist Icon (Heart) */}
            <Link href="/wishlist" className="hover:text-theme-forest hover:scale-110 transition-all duration-300" aria-label="Wishlist">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Cart Icon (Shopping Bag) */}
            <Link href="/cart" className="relative hover:text-theme-forest hover:scale-110 transition-all duration-300" aria-label="Cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {/* Optional: Cart Item Count Badge */}
              <span className="absolute -top-1.5 -right-1.5 bg-theme-teal text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle /> {/* Added theme toggle to mobile header for easy access */}
          
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-theme-brown dark:text-white hover:text-theme-teal focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (Animated Slide-in) */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-theme-beige dark:bg-zinc-900 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] border-b border-theme-teal/20' : 'max-h-0'}`}>
        <ul className="flex flex-col items-center py-6 space-y-6 text-xl font-medium text-theme-brown dark:text-white">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link 
                href={link.href} 
                onClick={() => setIsOpen(false)} 
                className="hover:text-theme-forest transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}
          
          {/* Mobile Divider */}
          <div className="w-1/2 h-px bg-theme-brown/20 dark:bg-white/20 my-2"></div>

          {/* Mobile Login, Wishlist & Cart Links */}
          <li>
            <Link href="/login" onClick={() => setIsOpen(false)} className="hover:text-theme-forest transition-colors">
              Login
            </Link>
          </li>
          <li>
            <Link href="/wishlist" onClick={() => setIsOpen(false)} className="hover:text-theme-forest transition-colors flex items-center gap-2">
              Wishlist
            </Link>
          </li>
          <li>
            <Link href="/cart" onClick={() => setIsOpen(false)} className="hover:text-theme-forest transition-colors flex items-center gap-2">
              Cart (0)
            </Link>
          </li>
        </ul>
      </div>

    </nav>
  );
}