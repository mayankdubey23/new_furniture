'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-full border border-white/20 bg-white/6 p-2.5 text-theme-ivory transition duration-300 hover:border-white/40 hover:bg-white/12 hover:text-white"
        aria-label="Toggle color theme"
      >
        <span className="sr-only">Toggle theme</span>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12.8A8.98 8.98 0 0 1 11.2 3a9 9 0 1 0 9.8 9.8Z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      disabled={!mounted}
      className="rounded-full border border-white/20 bg-white/6 p-2.5 text-theme-ivory transition duration-300 hover:border-white/40 hover:bg-white/12 hover:text-white"
      aria-label="Toggle color theme"
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v2.25M12 18.75V21M4.72 4.72l1.6 1.6M17.68 17.68l1.6 1.6M3 12h2.25M18.75 12H21M4.72 19.28l1.6-1.6M17.68 6.32l1.6-1.6M15.75 12A3.75 3.75 0 1 1 8.25 12a3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12.8A8.98 8.98 0 0 1 11.2 3a9 9 0 1 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
