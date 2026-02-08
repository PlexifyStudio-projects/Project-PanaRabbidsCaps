// ============================================================
// PlexifyCaps - CartPage (Enhanced)
// Full-page cart with premium dark theme, gold accents,
// glassmorphism order summary, animated shipping bar
// All inline styles - no external CSS dependencies
// ============================================================

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '../../components/common';
import { useCart } from '../../hooks/useCart';
import { formatCOP } from '../../utils/formatCurrency';
import { getFreeShippingThreshold } from '../../data/settingsService';
import { getPrimaryImageUrl } from '../../utils/helpers';

// ── Reusable inline style helpers ────────────────────────────
const glassCard: React.CSSProperties = {
  background: 'rgba(26, 26, 46, 0.65)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '16px',
  border: '1px solid rgba(196, 163, 90, 0.14)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
};

const goldGradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #C4A35A 0%, #E8D5A3 50%, #C4A35A 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const CartPage = () => {
  const {
    items,
    totalItems,
    subtotal,
    shippingCost,
    total,
    freeShippingProgress,
    amountToFreeShipping,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const FREE_SHIPPING_THRESHOLD = useMemo(() => getFreeShippingThreshold(), []);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const isEmpty = items.length === 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -40, scale: 0.97 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <>
      <SEOHead
        title="Tu Carrito"
        description="Revisa los productos en tu carrito de compras en PlexifyCaps."
      />

      <div
        style={{
          minHeight: '100vh',
          background: '#0D0D0D',
          paddingTop: '40px',
          paddingBottom: '80px',
          position: 'relative',
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '500px',
            background: 'radial-gradient(ellipse, rgba(196, 163, 90, 0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Container */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '40px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <h1
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '42px',
                  fontWeight: 800,
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  margin: 0,
                  ...goldGradientText,
                }}
              >
                TU CARRITO
              </h1>
              {!isEmpty && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    color: 'rgba(250, 250, 250, 0.5)',
                  }}
                >
                  ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
                </motion.span>
              )}
            </div>
            {!isEmpty && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={clearCart}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(229, 62, 62, 0.4)',
                  color: '#E53E3E',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  padding: '8px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(229, 62, 62, 0.1)';
                  (e.currentTarget as HTMLElement).style.borderColor = '#E53E3E';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229, 62, 62, 0.4)';
                }}
              >
                Vaciar carrito
              </motion.button>
            )}
          </motion.div>

          {/* ── Empty State ────────────────────────────────────── */}
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 20px',
                textAlign: 'center',
              }}
            >
              {/* Animated bag icon */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{ position: 'relative', marginBottom: '32px' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(196, 163, 90, 0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                  }}
                />
                <motion.svg
                  width="140"
                  height="140"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(196, 163, 90, 0.25)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </motion.svg>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#FAFAFA',
                  letterSpacing: '3px',
                  margin: '0 0 12px 0',
                  textTransform: 'uppercase',
                }}
              >
                Tu carrito esta vacio
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '15px',
                  color: 'rgba(250, 250, 250, 0.5)',
                  marginBottom: '40px',
                  maxWidth: '420px',
                  lineHeight: 1.7,
                }}
              >
                Descubre nuestra coleccion de gorras premium y encuentra tu estilo unico.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
              >
                <Link
                  to="/catalogo"
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)',
                    color: '#0D0D0D',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '14px',
                    fontWeight: 800,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    padding: '18px 56px',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(196, 163, 90, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(196, 163, 90, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(196, 163, 90, 0.2)';
                  }}
                >
                  EXPLORAR CATALOGO
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* ── Cart Content ──────────────────────────────────── */}
          {!isEmpty && (
            <div
              style={{
                display: 'flex',
                gap: '40px',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              {/* Left - Cart Items (65%) */}
              <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
                {/* Free shipping progress bar - top of items */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    marginBottom: '24px',
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: 'rgba(26, 26, 46, 0.5)',
                    border: '1px solid rgba(196, 163, 90, 0.1)',
                  }}
                >
                  {amountToFreeShipping > 0 ? (
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        color: 'rgba(250, 250, 250, 0.7)',
                        margin: '0 0 12px 0',
                        lineHeight: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C4A35A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ verticalAlign: 'middle', marginRight: '8px' }}
                      >
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      Agrega{' '}
                      <span style={{ color: '#C4A35A', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatCOP(amountToFreeShipping)}
                      </span>{' '}
                      mas para envio{' '}
                      <span style={{ color: '#38A169', fontWeight: 700 }}>GRATIS</span>
                    </p>
                  ) : (
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        color: '#38A169',
                        margin: '0 0 12px 0',
                        fontWeight: 600,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Tienes envio gratis
                    </p>
                  )}
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(250, 250, 250, 0.08)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                      style={{
                        height: '100%',
                        background: freeShippingProgress >= 100
                          ? 'linear-gradient(90deg, #38A169, #4ADE80)'
                          : 'linear-gradient(90deg, #C4A35A, #E8D5A3, #C4A35A)',
                        backgroundSize: freeShippingProgress >= 100 ? '100% 100%' : '200% 100%',
                        borderRadius: '3px',
                        position: 'relative',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '10px',
                        color: 'rgba(250, 250, 250, 0.3)',
                      }}
                    >
                      {formatCOP(0)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '10px',
                        color: 'rgba(250, 250, 250, 0.3)',
                      }}
                    >
                      {formatCOP(FREE_SHIPPING_THRESHOLD)}
                    </span>
                  </div>
                </motion.div>

                {/* Cart item cards */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => {
                      const price = item.variant.priceOverride ?? item.product.basePrice;
                      const lineTotal = price * item.quantity;
                      const imageUrl = getPrimaryImageUrl(item.product.images);
                      const isHovered = hoveredItem === item.variant.id;

                      return (
                        <motion.div
                          key={item.variant.id}
                          layout
                          variants={itemVariants}
                          exit={{
                            opacity: 0,
                            x: -120,
                            scale: 0.8,
                            height: 0,
                            marginBottom: 0,
                            padding: 0,
                            transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                          }}
                          onMouseEnter={() => setHoveredItem(item.variant.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            padding: '20px 24px',
                            marginBottom: '12px',
                            background: isHovered
                              ? 'rgba(26, 26, 46, 0.8)'
                              : 'rgba(26, 26, 46, 0.5)',
                            borderRadius: '12px',
                            border: isHovered
                              ? '1px solid rgba(196, 163, 90, 0.2)'
                              : '1px solid rgba(196, 163, 90, 0.06)',
                            position: 'relative',
                            flexWrap: 'wrap',
                            transition: 'background 0.3s ease, border-color 0.3s ease',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Gold accent line at left */}
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '3px',
                              height: isHovered ? '60%' : '0%',
                              background: 'linear-gradient(180deg, #C4A35A, #E8D5A3)',
                              borderRadius: '0 2px 2px 0',
                              transition: 'height 0.3s ease',
                            }}
                          />

                          {/* Image */}
                          <Link to={`/producto/${item.product.slug}`}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '1px solid rgba(196, 163, 90, 0.1)',
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt={item.product.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                            </motion.div>
                          </Link>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: '150px' }}>
                            <Link
                              to={`/producto/${item.product.slug}`}
                              style={{ textDecoration: 'none' }}
                            >
                              <h3
                                style={{
                                  fontFamily: "'Barlow Condensed', sans-serif",
                                  fontSize: '17px',
                                  fontWeight: 700,
                                  color: '#FAFAFA',
                                  margin: '0 0 4px 0',
                                  letterSpacing: '0.5px',
                                  transition: 'color 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLElement).style.color = '#C4A35A';
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.color = '#FAFAFA';
                                }}
                              >
                                {item.product.name}
                              </h3>
                            </Link>
                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '13px',
                                color: 'rgba(250, 250, 250, 0.45)',
                                margin: '0 0 8px 0',
                              }}
                            >
                              Talla: {item.variant.size} / Color: {item.variant.color}
                            </p>
                            <span
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'rgba(250, 250, 250, 0.6)',
                              }}
                            >
                              {formatCOP(price)} c/u
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0',
                              border: '1px solid rgba(196, 163, 90, 0.2)',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: 'rgba(13, 13, 13, 0.4)',
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                              style={{
                                width: '38px',
                                height: '38px',
                                background: 'rgba(196, 163, 90, 0.06)',
                                border: 'none',
                                color: '#C4A35A',
                                fontSize: '18px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.15)';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.06)';
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                width: '46px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#FAFAFA',
                                background: 'transparent',
                                borderLeft: '1px solid rgba(196, 163, 90, 0.15)',
                                borderRight: '1px solid rgba(196, 163, 90, 0.15)',
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                              disabled={item.quantity >= item.variant.stock}
                              style={{
                                width: '38px',
                                height: '38px',
                                background: 'rgba(196, 163, 90, 0.06)',
                                border: 'none',
                                color: item.quantity >= item.variant.stock
                                  ? 'rgba(196, 163, 90, 0.3)'
                                  : '#C4A35A',
                                fontSize: '18px',
                                fontWeight: 700,
                                cursor: item.quantity >= item.variant.stock ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s ease',
                              }}
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

                          {/* Line Total */}
                          <div style={{ minWidth: '110px', textAlign: 'right' }}>
                            <motion.span
                              key={lineTotal}
                              initial={{ scale: 0.9, opacity: 0.7 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '17px',
                                fontWeight: 700,
                                color: '#C4A35A',
                                display: 'block',
                              }}
                            >
                              {formatCOP(lineTotal)}
                            </motion.span>
                          </div>

                          {/* Remove Button */}
                          <motion.button
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(item.variant.id)}
                            style={{
                              width: '34px',
                              height: '34px',
                              background: 'transparent',
                              border: '1px solid rgba(229, 62, 62, 0.25)',
                              borderRadius: '8px',
                              color: '#E53E3E',
                              fontSize: '16px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'rgba(229, 62, 62, 0.1)';
                              (e.currentTarget as HTMLElement).style.borderColor = '#E53E3E';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229, 62, 62, 0.25)';
                            }}
                            title="Eliminar producto"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* ── Right - Order Summary (35%) with glass morphism ── */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  flex: '0 0 35%',
                  minWidth: '300px',
                  position: 'sticky',
                  top: '100px',
                }}
              >
                <div
                  style={{
                    ...glassCard,
                    padding: '32px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Gold accent top border */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)',
                    }}
                  />

                  <h2
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#FAFAFA',
                      letterSpacing: '2.5px',
                      textTransform: 'uppercase',
                      margin: '0 0 24px 0',
                    }}
                  >
                    RESUMEN DEL PEDIDO
                  </h2>

                  {/* Mini item list */}
                  <div
                    style={{
                      marginBottom: '20px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(196, 163, 90, 0.2) transparent',
                    }}
                  >
                    {items.map((item) => {
                      const price = item.variant.priceOverride ?? item.product.basePrice;
                      return (
                        <div
                          key={item.variant.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 0',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '12px',
                              color: 'rgba(250, 250, 250, 0.55)',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.product.name} x{item.quantity}
                          </span>
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'rgba(250, 250, 250, 0.7)',
                              flexShrink: 0,
                            }}
                          >
                            {formatCOP(price * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(196, 163, 90, 0.2), transparent)',
                      marginBottom: '16px',
                    }}
                  />

                  {/* Subtotal */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        color: 'rgba(250, 250, 250, 0.6)',
                      }}
                    >
                      Subtotal
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#FAFAFA',
                      }}
                    >
                      {formatCOP(subtotal)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        color: 'rgba(250, 250, 250, 0.6)',
                      }}
                    >
                      Envio
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '14px',
                        fontWeight: 600,
                        color: shippingCost === 0 ? '#38A169' : '#FAFAFA',
                      }}
                    >
                      {shippingCost === 0 ? 'GRATIS' : formatCOP(shippingCost)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(196, 163, 90, 0.3), transparent)',
                      marginBottom: '20px',
                    }}
                  />

                  {/* Total */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '28px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#FAFAFA',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Total
                    </span>
                    <motion.span
                      key={total}
                      initial={{ scale: 0.9, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '26px',
                        fontWeight: 800,
                        color: '#C4A35A',
                      }}
                    >
                      {formatCOP(total)}
                    </motion.span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    style={{
                      display: 'block',
                      width: '100%',
                      background: 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)',
                      color: '#0D0D0D',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '15px',
                      fontWeight: 800,
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      textAlign: 'center',
                      padding: '16px 0',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      boxShadow: '0 4px 20px rgba(196, 163, 90, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 36px rgba(196, 163, 90, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(196, 163, 90, 0.2)';
                    }}
                  >
                    IR AL CHECKOUT
                  </Link>

                  {/* Continue shopping */}
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Link
                      to="/catalogo"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        color: 'rgba(250, 250, 250, 0.5)',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = '#C4A35A';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = 'rgba(250, 250, 250, 0.5)';
                      }}
                    >
                      Seguir comprando
                    </Link>
                  </div>

                  {/* Security note */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '24px',
                      padding: '12px',
                      background: 'rgba(56, 161, 105, 0.06)',
                      borderRadius: '8px',
                      border: '1px solid rgba(56, 161, 105, 0.12)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        color: '#38A169',
                        fontWeight: 500,
                      }}
                    >
                      Compra 100% segura
                    </span>
                  </div>

                  {/* Accepted payments with pill badges */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {['Visa', 'Mastercard', 'PSE', 'Nequi'].map((method) => (
                        <div
                          key={method}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '9px',
                            color: 'rgba(250,250,250,0.4)',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}>
                            {method}
                          </span>
                        </div>
                      ))}
                    </div>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '9px',
                      color: 'rgba(250,250,250,0.25)',
                      letterSpacing: '0.5px',
                    }}>
                      Pagos procesados por Wompi
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive + gold shimmer animation */}
      <style>{`
        @media (max-width: 768px) {
          .cart-content-wrapper > div:first-child {
            flex: 1 1 100% !important;
          }
          .cart-content-wrapper > div:last-child {
            flex: 1 1 100% !important;
            position: static !important;
          }
        }
        @keyframes goldShimmer {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
      `}</style>
    </>
  );
};

export default CartPage;
