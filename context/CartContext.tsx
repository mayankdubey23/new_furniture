'use client';

import {
  createContext,
  useCallback,
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
  mergeCommerceCartItems,
  normalizeCommerceSelection,
  type CommerceCartItem,
} from '@/lib/commerce';
import { useUser } from '@/context/UserContext';

export type CartItemId = string | number;
export type CartItem = CommerceCartItem;

interface CartContextValue {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (id: CartItemId, delta: number) => void;
  removeFromCart: (id: CartItemId) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const GUEST_CART_STORAGE_KEY = 'guest-cart-v2';

function readGuestCart(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as unknown[]) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizeCartItem(entry))
      .filter((entry): entry is CartItem => Boolean(entry));
  } catch {
    return [];
  }
}

function writeGuestCart(cart: CartItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cart));
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const source = value as Partial<CartItem>;
  const productId = String(source.productId || '').trim();
  const name = String(source.name || '').trim();
  const image = String(source.image || '').trim();
  const price = Number(source.price || 0);
  const quantity = Math.max(1, Number(source.quantity || 1));

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
    quantity,
    ...selection,
  };
}

async function saveCartToServer(cart: CartItem[]) {
  const response = await fetch(getApiUrl('/api/cart/current'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ items: cart }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { items?: CartItem[]; error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to sync cart.');
  }

  return Array.isArray(payload?.items)
    ? payload.items
        .map((item) => normalizeCartItem(item))
        .filter((item): item is CartItem => Boolean(item))
    : cart;
}

async function fetchServerCart() {
  const response = await fetch(getApiUrl('/api/cart/current'), {
    cache: 'no-store',
    credentials: 'include',
  });

  const payload = (await response.json().catch(() => null)) as
    | { items?: CartItem[]; error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to load cart.');
  }

  return Array.isArray(payload?.items)
    ? payload.items
        .map((item) => normalizeCartItem(item))
        .filter((item): item is CartItem => Boolean(item))
    : [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const syncSnapshotRef = useRef('');

  const refreshCart = useCallback(async () => {
    if (!user?.id) {
      const guestCart = readGuestCart();
      setCart(guestCart);
      syncSnapshotRef.current = JSON.stringify(guestCart);
      return;
    }

    const serverCart = await fetchServerCart();
    setCart(serverCart);
    syncSnapshotRef.current = JSON.stringify(serverCart);
  }, [user?.id]);

  useEffect(() => {
    const guestCart = readGuestCart();
    setCart(guestCart);
    syncSnapshotRef.current = JSON.stringify(guestCart);
    setHasHydrated(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let active = true;

    const syncCartMode = async () => {
      if (!user?.id) {
        const guestCart = readGuestCart();
        if (!active) {
          return;
        }

        setCart(guestCart);
        syncSnapshotRef.current = JSON.stringify(guestCart);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [serverCart, guestCart] = await Promise.all([
          fetchServerCart(),
          Promise.resolve(readGuestCart()),
        ]);
        const mergedCart = mergeCommerceCartItems(serverCart, guestCart);
        const syncedCart = await saveCartToServer(mergedCart);

        if (!active) {
          return;
        }

        writeGuestCart([]);
        setCart(syncedCart);
        syncSnapshotRef.current = JSON.stringify(syncedCart);
      } catch {
        if (!active) {
          return;
        }

        setCart(readGuestCart());
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void syncCartMode();

    return () => {
      active = false;
    };
  }, [hasHydrated, user?.id]);

  useEffect(() => {
    if (!hasHydrated || loading) {
      return;
    }

    if (!user?.id) {
      writeGuestCart(cart);
      syncSnapshotRef.current = JSON.stringify(cart);
      return;
    }

    const nextSnapshot = JSON.stringify(cart);

    if (nextSnapshot === syncSnapshotRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveCartToServer(cart)
        .then((syncedCart) => {
          syncSnapshotRef.current = JSON.stringify(syncedCart);
          setCart(syncedCart);
        })
        .catch(() => {
          // Keep the local state and try again on the next meaningful update.
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [cart, hasHydrated, loading, user?.id]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCart((previousCart) => {
      const normalizedItem = normalizeCartItem({ ...item, quantity });

      if (!normalizedItem) {
        return previousCart;
      }

      const existing = previousCart.find((entry) => entry.id === normalizedItem.id);

      if (existing) {
        return previousCart.map((entry) =>
          entry.id === normalizedItem.id
            ? { ...entry, quantity: entry.quantity + normalizedItem.quantity }
            : entry
        );
      }

      return [...previousCart, normalizedItem];
    });
  }, []);

  const updateQuantity = useCallback((id: CartItemId, delta: number) => {
    const normalizedId = String(id);

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === normalizedId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((id: CartItemId) => {
    const normalizedId = String(id);
    setCart((previousCart) => previousCart.filter((item) => item.id !== normalizedId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart,
      totalItems,
      totalPrice,
      loading,
    }),
    [
      addToCart,
      cart,
      clearCart,
      loading,
      refreshCart,
      removeFromCart,
      totalItems,
      totalPrice,
      updateQuantity,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
