'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface WishlistContextValue {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => boolean;
  removeFromWishlist: (id: number) => void;
  isWishlisted: (id: number) => boolean;
  totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('wishlist');
      setWishlist(saved ? (JSON.parse(saved) as WishlistItem[]) : []);
    } catch {
      setWishlist([]);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist, hasHydrated]);

  const value = useMemo(
    () => ({
      wishlist,
      addToWishlist: (item: WishlistItem) => {
        let added = false;
        setWishlist((prev) => {
          if (prev.some((entry) => entry.id === item.id)) return prev;
          added = true;
          return [...prev, item];
        });
        return added;
      },
      removeFromWishlist: (id: number) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
      },
      isWishlisted: (id: number) => wishlist.some((item) => item.id === id),
      totalWishlistItems: wishlist.length,
    }),
    [wishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
