// ============================================================
// Pana Rabbids - CartItem Component
// Individual cart item row for the CartDrawer
// Premium styling with quantity controls and remove action
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CartItem as CartItemType } from '../../types/cart';
import { useCart } from '../../hooks/useCart';
import { formatCOP } from '../../utils/formatCurrency';
import { getPrimaryImageUrl } from '../../utils/helpers';

// ── Props ─────────────────────────────────────────────────────
interface CartItemProps {
  item: CartItemType;
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  container: {
    display: 'flex',
    gap: '14px',
    padding: '16px 0',
    borderBottom: '1px solid rgba(196, 163, 90, 0.1)',
    position: 'relative' as const,
  },
  imageWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '6px',
    overflow: 'hidden',
    background: '#1A1A2E',
    flexShrink: 0,
    border: '1px solid rgba(196, 163, 90, 0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  details: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  name: {
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    color: '#FAFAFA',
    lineHeight: 1.2,
    margin: 0,
    letterSpacing: '0.3px',
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },
  variant: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'rgba(250, 250, 250, 0.45)',
    marginTop: '2px',
    lineHeight: 1,
    letterSpacing: '0.5px',
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0px',
    border: '1px solid rgba(196, 163, 90, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(196, 163, 90, 0.06)',
    border: 'none',
    color: '#C4A35A',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s ease, color 0.2s ease',
    fontFamily: "'Inter', sans-serif",
  },
  qtyValue: {
    width: '32px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '12px',
    fontWeight: 600,
    color: '#FAFAFA',
    background: 'rgba(13, 13, 13, 0.5)',
    borderLeft: '1px solid rgba(196, 163, 90, 0.15)',
    borderRight: '1px solid rgba(196, 163, 90, 0.15)',
  },
  priceCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '2px',
  },
  lineTotal: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '14px',
    fontWeight: 700,
    color: '#C4A35A',
    lineHeight: 1,
  },
  unitPrice: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    color: 'rgba(250, 250, 250, 0.35)',
    lineHeight: 1,
  },
  removeBtn: {
    position: 'absolute' as const,
    top: '14px',
    right: '0px',
    background: 'none',
    border: 'none',
    color: 'rgba(250, 250, 250, 0.3)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease, transform 0.2s ease',
    borderRadius: '4px',
  },
} as const;

// ── Trash Icon ────────────────────────────────────────────────
const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────
const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const imageUrl = getPrimaryImageUrl(item.product.images);
  const unitPrice = item.variant.priceOverride ?? item.product.basePrice;
  const lineTotal = unitPrice * item.quantity;

  const variantLabel = [item.variant.size, item.variant.color]
    .filter(Boolean)
    .join(' / ');

  const handleRemove = () => {
    setIsRemoving(true);
    // Let the animation play then remove
    setTimeout(() => {
      removeItem(item.variant.id);
    }, 250);
  };

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      handleRemove();
    } else {
      updateQuantity(item.variant.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (item.quantity < item.variant.stock) {
      updateQuantity(item.variant.id, item.quantity + 1);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{
        opacity: isRemoving ? 0 : 1,
        x: isRemoving ? 80 : 0,
        height: isRemoving ? 0 : 'auto',
      }}
      exit={{ opacity: 0, x: 80, height: 0 }}
      transition={{
        duration: 0.25,
        ease: [0.23, 1, 0.32, 1],
      }}
      style={{ overflow: 'hidden' }}
    >
      <div style={s.container}>
        {/* Product Image */}
        <div style={s.imageWrap}>
          <img
            src={imageUrl}
            alt={item.product.name}
            style={s.image}
          />
        </div>

        {/* Details */}
        <div style={s.details}>
          <div style={s.topRow}>
            <div style={{ minWidth: 0, flex: 1, paddingRight: '20px' }}>
              <p style={s.name}>{item.product.name}</p>
              {variantLabel && <p style={s.variant}>{variantLabel}</p>}
            </div>
          </div>

          <div style={s.bottomRow}>
            {/* Quantity Controls */}
            <div style={s.qtyControls}>
              <button
                onClick={handleDecrement}
                style={s.qtyBtn}
                aria-label="Disminuir cantidad"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.06)';
                }}
              >
                -
              </button>
              <span style={s.qtyValue}>{item.quantity}</span>
              <button
                onClick={handleIncrement}
                style={{
                  ...s.qtyBtn,
                  opacity: item.quantity >= item.variant.stock ? 0.4 : 1,
                  cursor: item.quantity >= item.variant.stock ? 'not-allowed' : 'pointer',
                }}
                aria-label="Aumentar cantidad"
                disabled={item.quantity >= item.variant.stock}
                onMouseEnter={(e) => {
                  if (item.quantity < item.variant.stock) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.06)';
                }}
              >
                +
              </button>
            </div>

            {/* Prices */}
            <div style={s.priceCol}>
              <span style={s.lineTotal}>{formatCOP(lineTotal)}</span>
              {item.quantity > 1 && (
                <span style={s.unitPrice}>
                  {formatCOP(unitPrice)} c/u
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          style={s.removeBtn}
          aria-label="Eliminar del carrito"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#E53E3E';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(250, 250, 250, 0.3)';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;
