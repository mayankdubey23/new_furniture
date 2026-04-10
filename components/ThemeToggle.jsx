'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from './ThemeProvider';

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function ThemeToggle({ scrolled = false }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const isDark = resolvedTheme === 'dark';
  const buttonClass = scrolled
    ? 'border-theme-line bg-white/70 text-theme-walnut shadow-[0_8px_24px_rgba(26,22,19,0.08)] hover:border-theme-bronze/35 hover:bg-white hover:text-theme-bronze dark:border-white/12 dark:bg-white/8 dark:text-theme-ivory dark:hover:border-white/25 dark:hover:bg-white/12 dark:hover:text-white'
    : 'border-white/28 bg-white/14 text-white shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:border-white/45 hover:bg-white/20 hover:text-white dark:border-white/18 dark:bg-white/10 dark:text-theme-ivory dark:hover:border-white/30 dark:hover:bg-white/16';



  if (!isMounted) {
    return (
      <button
        type="button"
        className={`rounded-full border p-2.5 transition duration-300 ${buttonClass}`}
        aria-label="Toggle color theme"
      >
        <span className="sr-only">Toggle theme</span>

        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v2.25M12 18.75V21M4.72 4.72l1.6 1.6M17.68 17.68l1.6 1.6M3 12h2.25M18.75 12H21M4.72 19.28l1.6-1.6M17.68 6.32l1.6-1.6M15.75 12A3.75 3.75 0 1 1 8.25 12a3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`rounded-full border p-2.5 transition duration-300 ${buttonClass}`}
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
