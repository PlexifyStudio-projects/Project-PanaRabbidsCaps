import { createContext, useReducer, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import type { Product, ProductVariant } from '../types/product';
import type { CartItem, CartAction } from '../types/cart';
import { FREE_SHIPPING_THRESHOLD as DEFAULT_THRESHOLD, SHIPPING_COST as DEFAULT_COST } from '../utils/constants';

// ── Storage key ─────────────────────────────────────────────────────
const CART_STORAGE_KEY = 'pana_rabbids_cart';

// Read shipping config from admin settings (localStorage), fall back to constants
function getShippingConfig() {
  try {
    const raw = localStorage.getItem('pana_settings');
    if (raw) {
      const s = JSON.parse(raw);
      return {
        freeThreshold: Number(s.freeShippingThreshold) || DEFAULT_THRESHOLD,
        cost: Number(s.shippingCost) || DEFAULT_COST,
      };
    }
  } catch { /* ignore */ }
  return { freeThreshold: DEFAULT_THRESHOLD, cost: DEFAULT_COST };
}

// ── Context types ───────────────────────────────────────────────────
export interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  freeShippingThreshold: number;
  total: number;
  freeShippingProgress: number;
  amountToFreeShipping: number;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (variantId: number) => boolean;
  getItemQuantity: (variantId: number) => number;
  toastMessage: string;
}

export const CartContext = createContext<CartContextValue | null>(null);

// ── Reducer ─────────────────────────────────────────────────────────

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, quantity } = action.payload;
      const existingIndex = state.findIndex((item) => item.variant.id === variant.id);

      if (existingIndex >= 0) {
        const updated = [...state];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, variant.stock),
        };
        return updated;
      }

      return [...state, { product, variant, quantity: Math.min(quantity, variant.stock) }];
    }

    case 'REMOVE_ITEM':
      return state.filter((item) => item.variant.id !== action.payload.variantId);

    case 'UPDATE_QUANTITY': {
      const { variantId, quantity } = action.payload;
      if (quantity <= 0) {
        return state.filter((item) => item.variant.id !== variantId);
      }
      return state.map((item) =>
        item.variant.id === variantId
          ? { ...item, quantity: Math.min(quantity, item.variant.stock) }
          : item
      );
    }

    case 'CLEAR_CART':
      return [];

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
}

// ── Load initial cart from localStorage ─────────────────────────────
function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CartItem[];
    }
  } catch (error) {
    console.warn('[CartContext] Error loading cart from localStorage:', error);
    localStorage.removeItem(CART_STORAGE_KEY);
  }
  return [];
}

// ── Provider ────────────────────────────────────────────────────────
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  // Persist cart to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('[CartContext] Error saving cart to localStorage:', error);
    }
  }, [items]);

  // Computed values
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = item.variant.priceOverride ?? item.product.basePrice;
        return sum + price * item.quantity;
      }, 0),
    [items]
  );

  const shippingConfig = useMemo(() => getShippingConfig(), []);

  const shippingCost = useMemo(
    () => (items.length === 0 ? 0 : subtotal >= shippingConfig.freeThreshold ? 0 : shippingConfig.cost),
    [subtotal, items.length, shippingConfig]
  );

  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

  const freeShippingProgress = useMemo(
    () => Math.min((subtotal / shippingConfig.freeThreshold) * 100, 100),
    [subtotal, shippingConfig]
  );

  const amountToFreeShipping = useMemo(
    () => Math.max(shippingConfig.freeThreshold - subtotal, 0),
    [subtotal, shippingConfig]
  );

  // Toast state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  }, []);

  // Actions
  const addItem = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } });
    showToast(`${product.name} agregado al carrito`);
  };

  const removeItem = (variantId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { variantId } });
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (variantId: number): boolean => {
    return items.some((item) => item.variant.id === variantId);
  };

  const getItemQuantity = (variantId: number): number => {
    const item = items.find((i) => i.variant.id === variantId);
    return item ? item.quantity : 0;
  };

  const value: CartContextValue = {
    items,
    totalItems,
    subtotal,
    shippingCost,
    freeShippingThreshold: shippingConfig.freeThreshold,
    total,
    freeShippingProgress,
    amountToFreeShipping,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    toastMessage,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
