import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Hook to access cart state and actions from CartContext.
 * Must be used within a <CartProvider>.
 */
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a <CartProvider>');
  }

  return context;
}
