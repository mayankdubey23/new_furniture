'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return { theme: 'system', resolvedTheme: 'light' };
  }

  try {
    const storedTheme = window.localStorage.getItem('theme-preference');
    const theme = storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system' ? storedTheme : 'system';
    return {
      theme,
      resolvedTheme: theme === 'system' ? getSystemTheme() : theme,
    };
  } catch {
    return { theme: 'system', resolvedTheme: getSystemTheme() };
  }
}

export default function ThemeProvider({ children }) {
  const [{ theme, resolvedTheme }, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (nextTheme) => {
      const nextResolvedTheme = nextTheme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : nextTheme;

      document.documentElement.classList.toggle('dark', nextResolvedTheme === 'dark');

      try {
        window.localStorage.setItem('theme-preference', nextTheme);
      } catch {}

      setThemeState({ theme: nextTheme, resolvedTheme: nextResolvedTheme });
    };

    applyTheme(theme);

    const handleChange = () => {
      setThemeState((current) => {
        if (current.theme !== 'system') return current;
        const nextResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', nextResolvedTheme === 'dark');
        return { ...current, resolvedTheme: nextResolvedTheme };
      });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme) => {
        const validTheme = nextTheme === 'light' || nextTheme === 'dark' || nextTheme === 'system' ? nextTheme : 'system';
        setThemeState((current) => ({
          ...current,
          theme: validTheme,
        }));
      },
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
