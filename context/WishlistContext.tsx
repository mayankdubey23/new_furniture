'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getApiUrl } from '@/lib/api/browser';
import {
  buildCommerceItemId,
  mergeCommerceWishlistItems,
  normalizeCommerceSelection,
  type CommerceWishlistItem,
} from '@/lib/commerce';
import { useUser } from '@/context/UserContext';

export type WishlistItemId = string | number;
export type WishlistItem = CommerceWishlistItem;

interface WishlistContextValue {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => boolean;
  removeFromWishlist: (id: WishlistItemId) => void;
  isWishlisted: (id: WishlistItemId) => boolean;
  totalWishlistItems: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const GUEST_WISHLIST_STORAGE_KEY = 'guest-wishlist-v2';

function normalizeWishlistItem(value: unknown): WishlistItem | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const source = value as Partial<WishlistItem>;
  const productId = String(source.productId || '').trim();
  const name = String(source.name || '').trim();
  const image = String(source.image || '').trim();
  const price = Number(source.price || 0);

  if (!productId || !name || !image || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  const selection = normalizeCommerceSelection(source);
  const id = String(source.id || '').trim() || buildCommerceItemId(productId, selection);

  return {
    id,
    productId,
    name,
    image,
    price,
    ...selection,
  };
}

function readGuestWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(GUEST_WISHLIST_STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as unknown[]) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizeWishlistItem(entry))
      .filter((entry): entry is WishlistItem => Boolean(entry));
  } catch {
    return [];
  }
}

function writeGuestWishlist(wishlist: WishlistItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(GUEST_WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
}

async function fetchServerWishlist() {
  const response = await fetch(getApiUrl('/api/wishlist/current'), {
    cache: 'no-store',
    credentials: 'include',
  });

  const payload = (await response.json().catch(() => null)) as
    | { items?: WishlistItem[]; error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to load wishlist.');
  }

  return Array.isArray(payload?.items)
    ? payload.items
        .map((item) => normalizeWishlistItem(item))
        .filter((item): item is WishlistItem => Boolean(item))
    : [];
}

async function saveWishlistToServer(wishlist: WishlistItem[]) {
  const response = await fetch(getApiUrl('/api/wishlist/current'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ items: wishlist }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { items?: WishlistItem[]; error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to sync wishlist.');
  }

  return Array.isArray(payload?.items)
    ? payload.items
        .map((item) => normalizeWishlistItem(item))
        .filter((item): item is WishlistItem => Boolean(item))
    : wishlist;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const syncSnapshotRef = useRef('');

  useEffect(() => {
    const guestWishlist = readGuestWishlist();
    setWishlist(guestWishlist);
    syncSnapshotRef.current = JSON.stringify(guestWishlist);
    setHasHydrated(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let active = true;

    const syncWishlistMode = async () => {
      if (!user?.id) {
        const guestWishlist = readGuestWishlist();
        if (!active) {
          return;
        }

        setWishlist(guestWishlist);
        syncSnapshotRef.current = JSON.stringify(guestWishlist);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [serverWishlist, guestWishlist] = await Promise.all([
          fetchServerWishlist(),
          Promise.resolve(readGuestWishlist()),
        ]);
        const mergedWishlist = mergeCommerceWishlistItems(serverWishlist, guestWishlist);
        const syncedWishlist = await saveWishlistToServer(mergedWishlist);

        if (!active) {
          return;
        }

        writeGuestWishlist([]);
        setWishlist(syncedWishlist);
        syncSnapshotRef.current = JSON.stringify(syncedWishlist);
      } catch {
        if (!active) {
          return;
        }

        setWishlist(readGuestWishlist());
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void syncWishlistMode();

    return () => {
      active = false;
    };
  }, [hasHydrated, user?.id]);

  useEffect(() => {
    if (!hasHydrated || loading) {
      return;
    }

    if (!user?.id) {
      writeGuestWishlist(wishlist);
      syncSnapshotRef.current = JSON.stringify(wishlist);
      return;
    }

    const nextSnapshot = JSON.stringify(wishlist);

    if (nextSnapshot === syncSnapshotRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveWishlistToServer(wishlist)
        .then((syncedWishlist) => {
          syncSnapshotRef.current = JSON.stringify(syncedWishlist);
          setWishlist(syncedWishlist);
        })
        .catch(() => {
          // Keep local changes and retry after the next update.
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasHydrated, loading, user?.id, wishlist]);

  const value = useMemo(
    () => ({
      wishlist,
      addToWishlist: (item: WishlistItem) => {
        const normalized = normalizeWishlistItem(item);

        if (!normalized) {
          return false;
        }

        let added = false;

        setWishlist((previousWishlist) => {
          if (previousWishlist.some((entry) => entry.id === normalized.id)) {
            return previousWishlist;
          }

          added = true;
          return [...previousWishlist, normalized];
        });

        return added;
      },
      removeFromWishlist: (id: WishlistItemId) => {
        const normalizedId = String(id);
        setWishlist((previousWishlist) =>
          previousWishlist.filter((item) => item.id !== normalizedId)
        );
      },
      isWishlisted: (id: WishlistItemId) =>
        wishlist.some((item) => item.id === String(id)),
      totalWishlistItems: wishlist.length,
      loading,
    }),
    [loading, wishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
