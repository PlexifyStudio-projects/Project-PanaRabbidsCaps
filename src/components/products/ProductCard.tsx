// ============================================================
// PlexifyCaps - ProductCard Component
// Ultra-premium product card with dual-image hover swap,
// gold gradient pricing, glass morphism, animated badges,
// quick-add spring animation, and low-stock urgency
// ============================================================

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../../types/product';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatCOP } from '../../utils/formatCurrency';
import { calculateDiscount, getPrimaryImageUrl } from '../../utils/helpers';

interface ProductCardProps {
  product: Product;
  index?: number;
}

// ── Easing ───────────────────────────────────────────────────
const EASE = [0.23, 1, 0.32, 1] as const;

// ── Cap Silhouette SVG for image fallback ────────────────────
const CapSilhouette = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.25 }}>
    <path d="M12 38C12 38 10 36 10 32C10 22 20 14 32 14C44 14 54 22 54 32C54 36 52 38 52 38" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 38C8 38 6 40 6 42C6 44 8 46 12 46H52C56 46 58 44 58 42C58 40 56 38 56 38H8Z" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 14V10" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="32" cy="9" rx="3" ry="2" stroke="#C4A35A" strokeWidth="1.5" />
  </svg>
);

// ── Star SVG ─────────────────────────────────────────────────
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill={filled ? '#C4A35A' : 'none'} stroke={filled ? '#C4A35A' : 'rgba(250,250,250,0.15)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ── Get secondary image (for hover swap) ─────────────────────
function getSecondaryImageUrl(images: Product['images']): string | null {
  if (!images || images.length < 2) return null;
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const primary = sorted.find(img => img.isPrimary);
  const secondary = sorted.find(img => img !== primary);
  return secondary?.imageUrl || null;
}

// ── Component ────────────────────────────────────────────────
const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [secondaryImgError, setSecondaryImgError] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const primaryImage = useMemo(() => getPrimaryImageUrl(product.images), [product.images]);
  const secondaryImage = useMemo(() => getSecondaryImageUrl(product.images), [product.images]);
  const hasSecondary = secondaryImage && !secondaryImgError;

  const totalStock = useMemo(() => product.variants.reduce((sum, v) => sum + v.stock, 0), [product.variants]);
  const discount = useMemo(() => product.comparePrice ? calculateDiscount(product.basePrice, product.comparePrice) : 0, [product.basePrice, product.comparePrice]);

  const isNew = useMemo(() => {
    const created = new Date(product.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created >= thirtyDaysAgo;
  }, [product.createdAt]);

  const isExclusive = useMemo(
    () => product.category?.slug === 'exclusivas' || product.category?.name?.toLowerCase() === 'exclusivas',
    [product.category]
  );

  const isSoldOut = totalStock <= 0;

  const uniqueColors = useMemo(() => {
    const seen = new Set<string>();
    return product.variants
      .filter(v => { if (!v.colorHex || seen.has(v.colorHex)) return false; seen.add(v.colorHex); return true; })
      .map(v => ({ hex: v.colorHex, name: v.color }));
  }, [product.variants]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const availableVariant = product.variants.find(v => v.stock > 0 && v.isActive);
    if (availableVariant) addItem(product, availableVariant, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
      style={{ position: 'relative' }}
    >
      <Link
        to={`/producto/${product.slug}`}
        style={{ textDecoration: 'none', display: 'block' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: '#0D0D0D',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'pointer',
            border: `1px solid ${isHovered ? 'rgba(196, 163, 90, 0.25)' : 'rgba(255, 255, 255, 0.04)'}`,
            transition: `all 0.55s cubic-bezier(0.23, 1, 0.32, 1)`,
            boxShadow: isHovered
              ? '0 24px 64px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(196, 163, 90, 0.1), 0 0 40px rgba(196, 163, 90, 0.04)'
              : '0 2px 12px rgba(0, 0, 0, 0.2)',
            transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          }}
        >
          {/* ── Image Container ── */}
          <div style={{ position: 'relative', width: '100%', paddingBottom: '125%', overflow: 'hidden', background: '#1A1A2E' }}>
            {imgError ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'linear-gradient(145deg, #1A1A2E 0%, #0D0D0D 60%, #1A1A2E 100%)' }}>
                <CapSilhouette />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', fontWeight: 600, color: 'rgba(196, 163, 90, 0.2)', letterSpacing: '2px', textTransform: 'uppercase' }}>PLEXIFYCAPS</span>
              </div>
            ) : (
              <>
                {/* Primary Image */}
                <img
                  src={primaryImage}
                  alt={product.name}
                  loading="lazy"
                  onError={() => setImgError(true)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: `transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s ease`,
                    transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                    opacity: (isHovered && hasSecondary) ? 0 : 1,
                  }}
                />
                {/* Secondary Image (hover swap) */}
                {hasSecondary && (
                  <img
                    src={secondaryImage!}
                    alt={`${product.name} - vista alternativa`}
                    loading="lazy"
                    onError={() => setSecondaryImgError(true)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: `transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s ease`,
                      transform: isHovered ? 'scale(1)' : 'scale(1.06)',
                      opacity: isHovered ? 1 : 0,
                    }}
                  />
                )}
              </>
            )}

            {/* Sold out overlay */}
            {isSoldOut && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13, 13, 13, 0.55)', backdropFilter: 'blur(1px)', zIndex: 3 }} />
            )}

            {/* Bottom gradient overlay on hover */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 40%, rgba(13, 13, 13, 0.85) 100%)',
                opacity: isHovered && !isSoldOut ? 1 : 0,
                transition: 'opacity 0.5s ease',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '24px',
                zIndex: 4,
              }}
            >
              <span
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(196, 163, 90, 0.7)',
                  color: '#C4A35A',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  padding: '10px 28px',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  transform: isHovered ? 'translateY(0)' : 'translateY(12px)',
                  opacity: isHovered ? 1 : 0,
                  backdropFilter: 'blur(8px)',
                }}
              >
                VER PRODUCTO
              </span>
            </div>

            {/* ── Badges Left ── */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 5 }}>
              {isNew && !isSoldOut && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #C4A35A, #D4B76A)',
                    color: '#0D0D0D',
                    boxShadow: '0 2px 8px rgba(196, 163, 90, 0.3)',
                  }}
                >
                  NUEVO
                </motion.span>
              )}
              {discount > 0 && !isSoldOut && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    background: 'rgba(229, 62, 62, 0.9)',
                    color: '#FAFAFA',
                    boxShadow: '0 2px 8px rgba(229, 62, 62, 0.25)',
                  }}
                >
                  -{discount}%
                </motion.span>
              )}
              {isExclusive && !isSoldOut && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    background: 'rgba(196, 163, 90, 0.12)',
                    color: '#C4A35A',
                    border: '1px solid rgba(196, 163, 90, 0.4)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  EXCLUSIVA
                </motion.span>
              )}
            </div>

            {/* ── Wishlist Heart ── */}
            <motion.button
              onClick={handleWishlistToggle}
              aria-label={wishlisted ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
              whileTap={{ scale: 0.8 }}
              animate={{ scale: wishlisted ? [1, 1.3, 1] : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                background: 'rgba(13, 13, 13, 0.6)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${wishlisted ? 'rgba(196, 163, 90, 0.4)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? '#C4A35A' : 'none'} stroke={wishlisted ? '#C4A35A' : 'rgba(250,250,250,0.7)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </motion.button>

            {/* ── Badges Right ── */}
            <div style={{ position: 'absolute', top: '52px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', zIndex: 5 }}>
              {isSoldOut && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    background: 'rgba(107, 114, 128, 0.85)',
                    color: '#FAFAFA',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  AGOTADO
                </motion.span>
              )}
              {!isSoldOut && totalStock > 0 && totalStock < 5 && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    background: 'rgba(229, 62, 62, 0.85)',
                    color: '#FAFAFA',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <span className="pana-pulse-badge">{'\u00A1'}ULTIMAS {totalStock}!</span>
                </motion.span>
              )}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
            {product.category && (
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '9px',
                fontWeight: 600,
                color: 'rgba(196, 163, 90, 0.5)',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}>
                {product.category.name}
              </span>
            )}

            <h3 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              color: '#FAFAFA',
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: '0.3px',
            }}>
              {product.name}
            </h3>

            {/* Price with gold gradient */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '17px',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.3px',
                  ...(isSoldOut
                    ? { color: 'rgba(250, 250, 250, 0.3)' }
                    : {
                        background: 'linear-gradient(135deg, #E8D5A3 0%, #C4A35A 50%, #D4AF37 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }
                  ),
                }}
              >
                {formatCOP(product.basePrice)}
              </span>
              {product.comparePrice && product.comparePrice > product.basePrice && (
                <>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 400, color: 'rgba(250, 250, 250, 0.3)', textDecoration: 'line-through', lineHeight: 1 }}>
                    {formatCOP(product.comparePrice)}
                  </span>
                  {discount > 0 && (
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', fontWeight: 800, color: '#E53E3E', letterSpacing: '0.5px', lineHeight: 1 }}>
                      -{discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Color dots */}
            {uniqueColors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                {uniqueColors.slice(0, 5).map(c => (
                  <span
                    key={c.hex}
                    title={c.name}
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: c.hex,
                      border: '2px solid rgba(250, 250, 250, 0.12)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                ))}
                {uniqueColors.length > 5 && (
                  <span style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'rgba(250, 250, 250, 0.06)',
                    border: '2px solid rgba(250, 250, 250, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: 'rgba(250, 250, 250, 0.4)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                  }}>
                    +{uniqueColors.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Star rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon key={star} filled />
              ))}
              <span style={{ fontSize: '9px', color: 'rgba(250, 250, 250, 0.25)', marginLeft: '4px', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                (5.0)
              </span>
            </div>
          </div>

          {/* ── Quick Add Button (slides up on hover) ── */}
          {!isSoldOut && (
            <motion.button
              onClick={handleQuickAdd}
              aria-label={`Agregar ${product.name} al carrito`}
              initial={{ y: '100%' }}
              animate={{ y: isHovered ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)',
                color: '#0D0D0D',
                border: 'none',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                padding: '14px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #D4B76A 0%, #E8D5A3 100%)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)'; }}
            >
              AGREGAR AL CARRITO
            </motion.button>
          )}
        </div>
      </Link>

      <style>{`
        @keyframes panaPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pana-pulse-badge {
          animation: panaPulse 2s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default ProductCard;
