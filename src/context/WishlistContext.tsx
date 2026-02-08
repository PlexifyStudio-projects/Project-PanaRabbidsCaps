import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { CustomerAuthContext } from './CustomerAuthContext';
import { useContext } from 'react';

const GUEST_KEY = 'pana_wishlist_guest';
function userKey(customerId: string) {
  return `pana_wishlist_${customerId}`;
}

function loadIds(key: string): number[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIds(key: string, ids: number[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}

export interface WishlistContextValue {
  wishlistIds: number[];
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
}

export const WishlistContext = createContext<WishlistContextValue | null>(null);

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const authCtx = useContext(CustomerAuthContext);
  const customer = authCtx?.customer ?? null;

  const getStorageKey = useCallback(() => {
    return customer ? userKey(customer.id) : GUEST_KEY;
  }, [customer]);

  const [wishlistIds, setWishlistIds] = useState<number[]>(() =>
    loadIds(customer ? userKey(customer.id) : GUEST_KEY)
  );

  // On login: merge guest wishlist into user wishlist
  useEffect(() => {
    if (customer) {
      const guestIds = loadIds(GUEST_KEY);
      const userIds = loadIds(userKey(customer.id));
      const merged = Array.from(new Set([...userIds, ...guestIds]));
      saveIds(userKey(customer.id), merged);
      setWishlistIds(merged);
      // Clear guest list after merge
      localStorage.removeItem(GUEST_KEY);
    } else {
      setWishlistIds(loadIds(GUEST_KEY));
    }
  }, [customer]);

  // Persist on change
  useEffect(() => {
    saveIds(getStorageKey(), wishlistIds);
  }, [wishlistIds, getStorageKey]);

  const addToWishlist = useCallback((productId: number) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const toggleWishlist = useCallback((productId: number) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const value: WishlistContextValue = {
    wishlistIds,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    wishlistCount: wishlistIds.length,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}
