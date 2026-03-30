'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Sofas', href: '#sofas' },
    { name: 'Recliners', href: '#recliners' },
    { name: 'Pouffes', href: '#pouffes' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full px-4 pt-4 md:px-6">
      <div className="premium-surface mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3 md:px-7">
        <Link href="#hero" className="flex items-center gap-3">
          <span className="font-display text-3xl font-semibold tracking-[0.16em] text-theme-walnut dark:text-theme-ink">
            LUXE
          </span>
          <span className="hidden rounded-full border border-theme-line px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-theme-bronze md:inline-flex">
            Atelier Living
          </span>
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-[0.24em] text-theme-walnut/80 dark:text-theme-ink/75 md:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href} className="transition-colors duration-300 hover:text-theme-bronze">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="#sofas"
            className="rounded-full border border-theme-line px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut transition-colors duration-300 hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ink"
          >
            View Collection
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="rounded-full border border-theme-line p-2 text-theme-walnut dark:text-theme-ink"
            aria-label="Toggle Menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`premium-surface mx-auto mt-3 max-w-7xl overflow-hidden rounded-[1.75rem] transition-all duration-500 md:hidden ${
          isOpen ? 'max-h-80 p-5' : 'max-h-0 p-0'
        }`}
      >
        <div className={`${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-theme-bronze">Navigation</div>
          <div className="flex flex-col gap-4 text-base font-medium text-theme-walnut dark:text-theme-ink">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>
            ))}
            <Link href="#sofas" onClick={() => setIsOpen(false)} className="pt-3 text-sm uppercase tracking-[0.25em] text-theme-bronze">
              View Collection
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
