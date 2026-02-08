// ============================================================
// Pana Rabbids - CartDrawer Component (Enhanced)
// Premium glass morphism slide-out cart drawer from the right
// Dark luxury theme with gold accents and smooth animations
// All inline styles - no external SCSS dependency
// ============================================================

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { formatCOP } from '../../utils/formatCurrency';
import CartItem from './CartItem';

// ── Props ─────────────────────────────────────────────────────
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  backdrop: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 9998,
    cursor: 'pointer',
  },
  drawer: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: '440px',
    maxWidth: '100vw',
    background: 'rgba(13, 13, 13, 0.92)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    borderLeft: '1px solid rgba(196, 163, 90, 0.12)',
    boxShadow: '-20px 0 80px rgba(0, 0, 0, 0.7), inset 1px 0 0 rgba(255, 255, 255, 0.03)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(196, 163, 90, 0.1)',
    flexShrink: 0,
    position: 'relative' as const,
  },
  headerGlow: {
    position: 'absolute' as const,
    bottom: '-1px',
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(196, 163, 90, 0.2), transparent)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    fontSize: '18px',
    fontWeight: 800,
    color: '#FAFAFA',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    margin: 0,
    lineHeight: 1,
  },
  itemCount: {
    background: 'linear-gradient(135deg, #C4A35A, #D4B76A)',
    color: '#0D0D0D',
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    fontSize: '11px',
    fontWeight: 800,
    borderRadius: '12px',
    padding: '2px 8px',
    lineHeight: 1.4,
    boxShadow: '0 2px 8px rgba(196, 163, 90, 0.25)',
  },
  closeBtn: {
    background: 'rgba(250, 250, 250, 0.04)',
    border: '1px solid rgba(196, 163, 90, 0.12)',
    borderRadius: '10px',
    color: 'rgba(250, 250, 250, 0.6)',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
    width: '36px',
    height: '36px',
  },
  shippingBar: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(196, 163, 90, 0.06)',
    flexShrink: 0,
    background: 'rgba(26, 26, 46, 0.3)',
  },
  shippingText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'rgba(250, 250, 250, 0.6)',
    marginBottom: '10px',
    lineHeight: 1.4,
    textAlign: 'center' as const,
  },
  shippingTextHighlight: {
    color: '#C4A35A',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  shippingTextGreen: {
    color: '#38A169',
    fontWeight: 700,
  },
  progressTrack: {
    width: '100%',
    height: '5px',
    background: 'rgba(196, 163, 90, 0.08)',
    borderRadius: '3px',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
  itemsList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px 24px',
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(196, 163, 90, 0.15) transparent',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '48px 24px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    marginBottom: '24px',
    opacity: 0.3,
    position: 'relative' as const,
  },
  emptyTitle: {
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    fontSize: '22px',
    fontWeight: 700,
    color: '#FAFAFA',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    margin: '0 0 8px 0',
  },
  emptyDesc: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'rgba(250, 250, 250, 0.4)',
    margin: '0 0 32px 0',
    lineHeight: 1.6,
    maxWidth: '260px',
  },
  emptyCta: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #C4A35A, #D4B76A)',
    color: '#0D0D0D',
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '2.5px',
    textTransform: 'uppercase' as const,
    padding: '14px 36px',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(196, 163, 90, 0.2)',
  },
  summary: {
    borderTop: '1px solid rgba(196, 163, 90, 0.12)',
    padding: '20px 24px 24px',
    flexShrink: 0,
    background: 'rgba(26, 26, 46, 0.4)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    position: 'relative' as const,
  },
  summaryGlow: {
    position: 'absolute' as const,
    top: '-1px',
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(196, 163, 90, 0.2), transparent)',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  summaryLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'rgba(250, 250, 250, 0.5)',
  },
  summaryValue: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '13px',
    color: '#FAFAFA',
    fontWeight: 500,
  },
  summaryFree: {
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    fontSize: '12px',
    color: '#38A169',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(196, 163, 90, 0.12)',
  },
  totalLabel: {
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    fontSize: '16px',
    fontWeight: 800,
    color: '#FAFAFA',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
  },
  totalValue: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '22px',
    fontWeight: 700,
    color: '#C4A35A',
  },
  checkoutBtn: {
    display: 'block',
    width: '100%',
    background: 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)',
    color: '#0D0D0D',
    border: 'none',
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    fontSize: '15px',
    fontWeight: 800,
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    padding: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    textDecoration: 'none',
    marginTop: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(196, 163, 90, 0.2)',
  },
  continueLink: {
    display: 'block',
    textAlign: 'center' as const,
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'rgba(250, 250, 250, 0.45)',
    textDecoration: 'none',
    marginTop: '12px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    width: '100%',
    transition: 'color 0.2s ease',
  },
} as const;

// ── SVG Icons ─────────────────────────────────────────────────
const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg
    width="72"
    height="72"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(196, 163, 90, 0.25)"
    strokeWidth="0.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#38A169"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: '6px', flexShrink: 0 }}
  >
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────
const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const {
    items,
    totalItems,
    subtotal,
    shippingCost,
    total,
    freeShippingProgress,
    amountToFreeShipping,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  const isFreeShipping = amountToFreeShipping <= 0 && items.length > 0;
  const hasItems = items.length > 0;

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={s.backdrop}
            onClick={onClose}
          />

          {/* ── Drawer Panel ── */}
          <motion.div
            ref={drawerRef}
            key="cart-drawer"
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 32,
              mass: 0.7,
            }}
            style={s.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
          >
            {/* ── Header ── */}
            <div style={s.header}>
              <div style={s.headerGlow} />
              <div style={s.headerLeft}>
                <h2 style={s.title}>Tu Carrito</h2>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    style={s.itemCount}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </div>
              <motion.button
                onClick={onClose}
                style={s.closeBtn}
                aria-label="Cerrar carrito"
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196, 163, 90, 0.35)';
                  (e.currentTarget as HTMLElement).style.color = '#FAFAFA';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(250, 250, 250, 0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196, 163, 90, 0.12)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(250, 250, 250, 0.6)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(250, 250, 250, 0.04)';
                }}
              >
                <CloseIcon />
              </motion.button>
            </div>

            {/* ── Free Shipping Progress ── */}
            {hasItems && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                style={s.shippingBar}
              >
                <p style={s.shippingText}>
                  {isFreeShipping ? (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircleIcon />
                      <span style={s.shippingTextGreen}>
                        {'\u00A1'}TIENES ENV{'\u00CD'}O GRATIS!
                      </span>
                    </span>
                  ) : (
                    <>
                      Te faltan{' '}
                      <span style={s.shippingTextHighlight}>
                        {formatCOP(amountToFreeShipping)}
                      </span>{' '}
                      para env{'\u00ED'}o{' '}
                      <span style={s.shippingTextGreen}>GRATIS</span>
                    </>
                  )}
                </p>
                <div style={s.progressTrack}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(freeShippingProgress, 100)}%` }}
                    transition={{
                      duration: 0.8,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    style={{
                      ...s.progressFill,
                      background: isFreeShipping
                        ? 'linear-gradient(90deg, #38A169, #48BB78)'
                        : 'linear-gradient(90deg, #C4A35A, #E8D5A3, #C4A35A)',
                      backgroundSize: isFreeShipping ? '100% 100%' : '200% 100%',
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Cart Items or Empty State ── */}
            {hasItems ? (
              <div style={s.itemsList}>
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartItem key={item.variant.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                style={s.emptyState}
              >
                <div style={s.emptyIcon}>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '120px',
                      height: '120px',
                      background: 'radial-gradient(circle, rgba(196, 163, 90, 0.08) 0%, transparent 70%)',
                      borderRadius: '50%',
                    }}
                  />
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ShoppingBagIcon />
                  </motion.div>
                </div>
                <h3 style={s.emptyTitle}>Tu carrito est{'\u00E1'} vac{'\u00ED'}o</h3>
                <p style={s.emptyDesc}>
                  Descubre nuestras gorras premium y encuentra tu estilo
                </p>
                <Link
                  to="/catalogo"
                  style={s.emptyCta}
                  onClick={onClose}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(196, 163, 90, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(196, 163, 90, 0.2)';
                  }}
                >
                  IR AL CAT{'\u00C1'}LOGO
                </Link>
              </motion.div>
            )}

            {/* ── Summary (only when items exist) ── */}
            {hasItems && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                style={s.summary}
              >
                <div style={s.summaryGlow} />

                {/* Subtotal */}
                <div style={s.summaryRow}>
                  <span style={s.summaryLabel}>Subtotal</span>
                  <span style={s.summaryValue}>{formatCOP(subtotal)}</span>
                </div>

                {/* Shipping */}
                <div style={s.summaryRow}>
                  <span style={s.summaryLabel}>Env{'\u00ED'}o</span>
                  {isFreeShipping ? (
                    <span style={s.summaryFree}>GRATIS</span>
                  ) : (
                    <span style={s.summaryValue}>{formatCOP(shippingCost)}</span>
                  )}
                </div>

                {/* Total */}
                <div style={s.totalRow}>
                  <span style={s.totalLabel}>Total</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 0.9, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    style={s.totalValue}
                  >
                    {formatCOP(total)}
                  </motion.span>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  style={s.checkoutBtn}
                  onClick={onClose}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 32px rgba(196, 163, 90, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(196, 163, 90, 0.2)';
                  }}
                >
                  IR AL CHECKOUT
                </Link>

                {/* Continue shopping */}
                <button
                  onClick={onClose}
                  style={s.continueLink}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = '#C4A35A';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(250, 250, 250, 0.45)';
                  }}
                >
                  Seguir comprando
                </button>

                {/* Security note */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '16px',
                    opacity: 0.5,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '10px',
                      color: '#38A169',
                      fontWeight: 500,
                    }}
                  >
                    Compra segura
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* ── Custom scrollbar styles ── */}
          <style>{`
            @media (max-width: 480px) {
              [aria-label="Carrito de compras"] {
                width: 100vw !important;
              }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
