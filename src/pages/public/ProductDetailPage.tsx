// ============================================================
// PlexifyCaps - ProductDetailPage
// Premium luxury product detail with image gallery, variant
// selectors, cart integration, tabs, and related products
// Enhanced: glass morphism, animated CTA, stock urgency,
// premium tabs, better thumbnails
// All inline styles - no external SCSS dependency
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '../../components/common';
import { ProductCard } from '../../components/products';
import {
  getProductBySlug,
  getRelatedProducts,
  getAllActiveProducts,
} from '../../data/productDataService';
import type { ProductVariant } from '../../types/product';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { formatCOP } from '../../utils/formatCurrency';
import { calculateDiscount, getStockLabel } from '../../utils/helpers';
import { getFreeShippingThreshold, loadStoreSettings } from '../../data/settingsService';
import { subscribe, isSubscribed as checkIsSubscribed } from '../../data/stockAlertService';

// ── Tab types ────────────────────────────────────────────────
type TabKey = 'descripcion' | 'detalles' | 'envio';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: 'descripcion',
    label: 'DESCRIPCION',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    key: 'detalles',
    label: 'DETALLES',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  {
    key: 'envio',
    label: 'ENVIO',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

// ── SVG Icons ────────────────────────────────────────────────
const StarIcon = ({ filled, half }: { filled: boolean; half?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? '#C4A35A' : 'none'}
    stroke={filled || half ? '#C4A35A' : 'rgba(250,250,250,0.2)'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {half ? (
      <>
        <defs>
          <linearGradient id="halfStar">
            <stop offset="50%" stopColor="#C4A35A" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill="url(#halfStar)"
        />
      </>
    ) : (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TruckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

const BoltIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const HomeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Animations ───────────────────────────────────────────────
const _fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
};

const _staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const cart = useCart();
  const FREE_SHIPPING_THRESHOLD = useMemo(() => getFreeShippingThreshold(), []);
  const storeSettings = useMemo(() => loadStoreSettings(), []);

  // Find product
  const product = useMemo(() => getProductBySlug(slug || ''), [slug]);

  // ── State ────────────────────────────────────────────────
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>('descripcion');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  // Variant selection
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Wishlist & Stock Alert
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { customer, isAuthenticated: isCustomerLoggedIn } = useCustomerAuth();
  const [alertEmail, setAlertEmail] = useState('');
  const [alertPhone, setAlertPhone] = useState('');
  const [alertSubscribed, setAlertSubscribed] = useState(false);

  // ── Derived data ─────────────────────────────────────────
  const uniqueColors = useMemo(() => {
    if (!product) return [];
    const seen = new Map<string, ProductVariant>();
    product.variants.forEach((v) => {
      if (!seen.has(v.color)) seen.set(v.color, v);
    });
    return Array.from(seen.values());
  }, [product]);

  // Initialize default selections
  useEffect(() => {
    if (!product) return;
    // Find first in-stock variant
    const firstInStock = product.variants.find((v) => v.stock > 0 && v.isActive);
    if (firstInStock) {
      setSelectedColor(firstInStock.color);
      setSelectedSize(firstInStock.size);
    } else if (product.variants.length > 0) {
      setSelectedColor(product.variants[0].color);
      setSelectedSize(product.variants[0].size);
    }
    setSelectedImageIndex(0);
    setQuantity(1);
    setActiveTab('descripcion');
  }, [product]);

  // Available sizes for selected color
  const availableSizes = useMemo(() => {
    if (!product || !selectedColor) return [];
    return product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => ({ size: v.size, stock: v.stock, id: v.id }));
  }, [product, selectedColor]);

  // Selected variant
  const selectedVariant = useMemo(() => {
    if (!product || !selectedSize || !selectedColor) return null;
    return (
      product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      ) || null
    );
  }, [product, selectedSize, selectedColor]);

  const currentPrice = selectedVariant?.priceOverride ?? product?.basePrice ?? 0;
  const discount =
    product?.comparePrice && product.comparePrice > currentPrice
      ? calculateDiscount(currentPrice, product.comparePrice)
      : 0;
  const stockInfo = selectedVariant ? getStockLabel(selectedVariant.stock) : null;

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const related = getRelatedProducts(product.id, 4);
    if (related.length >= 4) return related;
    // Fill with random products from other categories
    const allProducts = getAllActiveProducts().filter(
      (p) => p.id !== product.id && !related.find((r) => r.id === p.id)
    );
    return [...related, ...allProducts.slice(0, 4 - related.length)];
  }, [product]);

  // ── Handlers ─────────────────────────────────────────────
  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color);
      // Select first available size for this color
      if (product) {
        const firstAvailable = product.variants.find(
          (v) => v.color === color && v.stock > 0
        );
        setSelectedSize(firstAvailable?.size || product.variants.find((v) => v.color === color)?.size || null);
      }
      setQuantity(1);
    },
    [product]
  );

  const handleSizeChange = useCallback(
    (size: string, stock: number) => {
      if (stock === 0) return;
      setSelectedSize(size);
      setQuantity(1);
    },
    []
  );

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant || selectedVariant.stock === 0) return;
    setAddingToCart(true);
    // Simulate a brief loading state
    setTimeout(() => {
      cart.addItem(product, selectedVariant, quantity);
      setAddingToCart(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 600);
  }, [product, selectedVariant, quantity, cart]);

  const handleBuyNow = useCallback(() => {
    if (!product || !selectedVariant || selectedVariant.stock === 0) return;
    cart.addItem(product, selectedVariant, quantity);
    navigate('/checkout');
  }, [product, selectedVariant, quantity, cart, navigate]);

  const handleImageZoom = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageZoomed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    [imageZoomed]
  );

  // ── NOT FOUND ────────────────────────────────────────────
  if (!product) {
    return (
      <>
        <SEOHead title="Producto no encontrado" />
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '6rem 2rem',
            textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(196, 163, 90, 0.04), rgba(26, 26, 46, 0.4))',
                border: '1px dashed rgba(196, 163, 90, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              <span
                style={{
                  fontSize: '3rem',
                  color: 'rgba(196, 163, 90, 0.25)',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                }}
              >
                ?
              </span>
            </motion.div>
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '2rem',
                fontWeight: 700,
                color: '#FAFAFA',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Producto no encontrado
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: '#525252',
                marginBottom: '2rem',
                lineHeight: 1.7,
              }}
            >
              El producto que buscas no existe o ya no esta disponible.
            </p>
            <Link
              to="/catalogo"
              style={{
                display: 'inline-block',
                padding: '0.875rem 2.5rem',
                background: 'linear-gradient(135deg, #C4A35A, #D4B76A)',
                border: 'none',
                borderRadius: '8px',
                color: '#0D0D0D',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(196, 163, 90, 0.25)',
              }}
            >
              VER CATALOGO
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  // ── Primary image URL ────────────────────────────────────
  const sortedImages = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentImage = sortedImages[selectedImageIndex] || sortedImages[0];

  // Check stock alert subscription status
  useEffect(() => {
    if (selectedVariant && selectedVariant.stock === 0) {
      const email = isCustomerLoggedIn ? customer?.email || '' : alertEmail;
      if (email) {
        setAlertSubscribed(checkIsSubscribed(selectedVariant.id, email));
      } else {
        setAlertSubscribed(false);
      }
    } else {
      setAlertSubscribed(false);
    }
  }, [selectedVariant, isCustomerLoggedIn, customer, alertEmail]);

  const handleStockAlert = () => {
    if (!product || !selectedVariant) return;
    const email = isCustomerLoggedIn ? customer!.email : alertEmail;
    const phone = isCustomerLoggedIn ? customer!.phone : alertPhone;
    if (!email) return;

    const variantLabel = `${selectedVariant.color} / ${selectedVariant.size}`;
    subscribe({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantLabel,
      email,
      phone: phone || undefined,
      customerId: customer?.id,
    });
    setAlertSubscribed(true);
  };

  // ── Cart button state helpers ────────────────────────────
  const isCartDisabled = !selectedVariant || selectedVariant.stock === 0 || !selectedSize;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <SEOHead
        title={product.metaTitle || product.name}
        description={product.metaDescription || product.description}
        type="product"
      />

      {/* ── Decorative BG ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '-5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196, 163, 90, 0.03) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '-8%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196, 163, 90, 0.02) 0%, transparent 70%)',
          }}
        />
      </div>

      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          padding: '2rem 1.5rem 4rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ══════════════════════════════════════════════════════
            BREADCRUMBS
        ══════════════════════════════════════════════════════ */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '2rem' }}
        >
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              fontSize: '0.8rem',
              fontFamily: "'Inter', sans-serif",
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/"
              style={{
                color: '#525252',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#C4A35A')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#525252')}
            >
              <HomeIcon />
              Inicio
            </Link>
            <span style={{ color: 'rgba(196, 163, 90, 0.3)' }}><ChevronRightIcon /></span>
            <Link
              to="/catalogo"
              style={{ color: '#525252', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#C4A35A')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#525252')}
            >
              Catalogo
            </Link>
            {product.category && (
              <>
                <span style={{ color: 'rgba(196, 163, 90, 0.3)' }}><ChevronRightIcon /></span>
                <Link
                  to={`/catalogo?categoria=${product.category.slug}`}
                  style={{ color: '#525252', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#C4A35A')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#525252')}
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span style={{ color: 'rgba(196, 163, 90, 0.3)' }}><ChevronRightIcon /></span>
            <span style={{ color: '#C4A35A', fontWeight: 600 }}>{product.name}</span>
          </div>
        </motion.nav>

        {/* ══════════════════════════════════════════════════════
            MAIN PRODUCT SECTION
        ══════════════════════════════════════════════════════ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '55% 45%',
            gap: '3.5rem',
            marginBottom: '4rem',
          }}
          className="pana-product-layout"
        >
          {/* ────────────────────────────────────────────────────
              LEFT - IMAGE GALLERY
          ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Main Image */}
            <div
              style={{
                position: 'relative',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid rgba(196, 163, 90, 0.08)',
                background: '#1A1A2E',
                marginBottom: '1rem',
                cursor: imageZoomed ? 'zoom-out' : 'zoom-in',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
              }}
              onClick={() => setImageZoomed(!imageZoomed)}
              onMouseMove={handleImageZoom}
              onMouseLeave={() => setImageZoomed(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    aspectRatio: '1 / 1',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {currentImage && (
                    <img
                      src={currentImage.imageUrl}
                      alt={currentImage.altText || product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        transform: imageZoomed ? 'scale(1.5)' : 'scale(1)',
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Discount badge */}
              {discount > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(229, 62, 62, 0.9)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: '#FAFAFA',
                    fontSize: '13px',
                    fontWeight: 800,
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '1px',
                    zIndex: 2,
                    boxShadow: '0 2px 12px rgba(229, 62, 62, 0.3)',
                  }}
                >
                  -{discount}%
                </motion.span>
              )}

              {/* Image counter */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  background: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  padding: '5px 14px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'rgba(250, 250, 250, 0.7)',
                  letterSpacing: '1px',
                  zIndex: 2,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                {selectedImageIndex + 1} / {sortedImages.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                padding: '0.5rem',
                background: 'rgba(13, 13, 13, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '12px',
                border: '1px solid rgba(196, 163, 90, 0.06)',
              }}
            >
              {sortedImages.map((img, index) => (
                <motion.button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    flex: 1,
                    maxWidth: '90px',
                    aspectRatio: '1 / 1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: `2px solid ${selectedImageIndex === index ? '#C4A35A' : 'rgba(255,255,255,0.04)'}`,
                    cursor: 'pointer',
                    padding: 0,
                    background: '#1A1A2E',
                    transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
                    boxShadow:
                      selectedImageIndex === index
                        ? '0 0 0 3px rgba(196, 163, 90, 0.15), 0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 2px 6px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                  }}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.altText || `Vista ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: selectedImageIndex === index ? 1 : 0.5,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                  {/* Active indicator bar */}
                  {selectedImageIndex === index && (
                    <motion.div
                      layoutId="thumb-indicator"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '15%',
                        right: '15%',
                        height: '3px',
                        background: '#C4A35A',
                        borderRadius: '2px 2px 0 0',
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ────────────────────────────────────────────────────
              RIGHT - PRODUCT INFO
          ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Category */}
            {product.category && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: 'inline-block',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#C4A35A',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                {product.category.name}
              </motion.span>
            )}

            {/* Product Name */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: '#FAFAFA',
                margin: '0 0 0.75rem',
                lineHeight: 1.05,
              }}
            >
              {product.name}
              {/* Wishlist heart inline */}
              <motion.button
                onClick={() => toggleWishlist(product.id)}
                whileTap={{ scale: 0.8 }}
                animate={{ scale: isInWishlist(product.id) ? [1, 1.2, 1] : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isInWishlist(product.id) ? 'rgba(196,163,90,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  marginLeft: '12px',
                  verticalAlign: 'middle',
                  flexShrink: 0,
                  padding: 0,
                }}
                aria-label={isInWishlist(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? '#C4A35A' : 'none'} stroke={isInWishlist(product.id) ? '#C4A35A' : 'rgba(250,250,250,0.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </motion.button>
            </motion.h1>

            {/* Star Rating */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                marginBottom: '1.25rem',
              }}
            >
              {[1, 2, 3, 4].map((star) => (
                <StarIcon key={star} filled={true} />
              ))}
              <StarIcon filled={false} half={true} />
              <span
                style={{
                  fontSize: '13px',
                  color: 'rgba(250, 250, 250, 0.4)',
                  marginLeft: '6px',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                }}
              >
                4.5
              </span>
            </motion.div>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #E8D5A3 0%, #C4A35A 50%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {formatCOP(currentPrice * quantity)}
              </span>
              {quantity > 1 && (
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  color: 'rgba(250,250,250,0.4)',
                  fontWeight: 400,
                  marginLeft: '0.5rem',
                }}>
                  ({formatCOP(currentPrice)} c/u)
                </span>
              )}
              {product.comparePrice && product.comparePrice > currentPrice && (
                <>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '1rem',
                      color: 'rgba(250, 250, 250, 0.3)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {formatCOP(product.comparePrice)}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '11px',
                      fontWeight: 800,
                      background: 'rgba(229, 62, 62, 0.9)',
                      color: '#FAFAFA',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    -{discount}%
                  </span>
                </>
              )}
            </motion.div>

            {/* Free shipping progress */}
            {currentPrice * quantity < FREE_SHIPPING_THRESHOLD && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(196,163,90,0.04)',
                  border: '1px solid rgba(196,163,90,0.08)',
                  marginBottom: '1.25rem',
                }}
              >
                <TruckIcon />
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.78rem',
                    color: '#A3A3A3',
                  }}>
                    Agrega <span style={{ color: '#C4A35A', fontWeight: 600 }}>{formatCOP(FREE_SHIPPING_THRESHOLD - currentPrice * quantity)}</span> mas para envio gratis
                  </span>
                  <div style={{
                    width: '100%',
                    height: '3px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '0.4rem',
                  }}>
                    <div style={{
                      width: `${Math.min(100, ((currentPrice * quantity) / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #C4A35A, #D4AF37)',
                      borderRadius: '2px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              </motion.div>
            )}
            {currentPrice * quantity >= FREE_SHIPPING_THRESHOLD && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(56,161,105,0.06)',
                  border: '1px solid rgba(56,161,105,0.12)',
                }}
              >
                <TruckIcon />
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.78rem',
                  color: '#38A169',
                  fontWeight: 600,
                }}>
                  Envio gratis incluido
                </span>
              </motion.div>
            )}

            {/* Divider */}
            <div
              style={{
                width: '100%',
                height: '1px',
                background: 'linear-gradient(90deg, rgba(196, 163, 90, 0.15), transparent)',
                marginBottom: '1.5rem',
              }}
            />

            {/* ── Color Selector (Glass Morphism Cards) ── */}
            {uniqueColors.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginBottom: '1.5rem' }}
              >
                <p
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#D4D4D4',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '0.75rem',
                  }}
                >
                  COLOR:{' '}
                  <span style={{ color: '#C4A35A', fontWeight: 600 }}>
                    {selectedColor}
                  </span>
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {uniqueColors.map((variant) => {
                    const isActive = selectedColor === variant.color;
                    return (
                      <button
                        key={variant.color}
                        onClick={() => handleColorChange(variant.color)}
                        title={variant.color}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: variant.colorHex,
                          border: `2px solid ${isActive ? '#C4A35A' : 'rgba(255,255,255,0.12)'}`,
                          cursor: 'pointer',
                          outline: isActive ? '3px solid rgba(196, 163, 90, 0.2)' : 'none',
                          outlineOffset: '3px',
                          transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          position: 'relative',
                          boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {isActive && (
                          <span style={{ color: variant.colorHex === '#F5F5F5' || variant.colorHex === '#FAFAFA' || variant.colorHex === '#FDB927' ? '#0D0D0D' : '#FAFAFA' }}>
                            <CheckIcon />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Size Selector (Glass Morphism Cards) ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#D4D4D4',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    margin: 0,
                  }}
                >
                  TALLA:{' '}
                  <span style={{ color: '#C4A35A', fontWeight: 600 }}>
                    {selectedSize || 'Selecciona'}
                  </span>
                </p>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C4A35A',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = '1')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = '0.7')}
                >
                  Guia de tallas
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {availableSizes.map((variant) => {
                  const isActive = selectedSize === variant.size;
                  const isSoldOut = variant.stock === 0;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => handleSizeChange(variant.size, variant.stock)}
                      disabled={isSoldOut}
                      style={{
                        padding: '0.65rem 1.35rem',
                        borderRadius: '8px',
                        border: `2px solid ${
                          isActive
                            ? '#C4A35A'
                            : isSoldOut
                            ? 'rgba(255,255,255,0.03)'
                            : 'rgba(255,255,255,0.08)'
                        }`,
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(196, 163, 90, 0.15), rgba(196, 163, 90, 0.05))'
                          : isSoldOut
                          ? 'rgba(26, 26, 46, 0.2)'
                          : 'rgba(26, 26, 46, 0.3)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        color: isSoldOut
                          ? '#404040'
                          : isActive
                          ? '#C4A35A'
                          : '#D4D4D4',
                        fontSize: '14px',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        textDecoration: isSoldOut ? 'line-through' : 'none',
                        opacity: isSoldOut ? 0.4 : 1,
                        transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
                        position: 'relative',
                        boxShadow: isActive ? '0 2px 8px rgba(196, 163, 90, 0.1)' : 'none',
                      }}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Stock Urgency Indicator with Animation ── */}
            {stockInfo && selectedVariant && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ marginBottom: '1.5rem' }}
              >
                {selectedVariant.stock > 10 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(56, 161, 105, 0.06)',
                      border: '1px solid rgba(56, 161, 105, 0.12)',
                    }}
                  >
                    <span
                      className="pana-stock-pulse-green"
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#38A169',
                        display: 'inline-block',
                        boxShadow: '0 0 6px rgba(56, 161, 105, 0.4)',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        color: '#38A169',
                        fontWeight: 600,
                      }}
                    >
                      En stock - Envio disponible
                    </span>
                  </div>
                )}
                {selectedVariant.stock > 0 && selectedVariant.stock <= 10 && (
                  <motion.div
                    animate={{ scale: [1, 1.01, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: selectedVariant.stock <= 3
                        ? 'rgba(229, 62, 62, 0.06)'
                        : 'rgba(214, 158, 46, 0.06)',
                      border: `1px solid ${
                        selectedVariant.stock <= 3
                          ? 'rgba(229, 62, 62, 0.15)'
                          : 'rgba(214, 158, 46, 0.15)'
                      }`,
                    }}
                  >
                    <span
                      className="pana-stock-pulse"
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: selectedVariant.stock <= 3 ? '#E53E3E' : '#D69E2E',
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        color: selectedVariant.stock <= 3 ? '#E53E3E' : '#D69E2E',
                        fontWeight: 600,
                        flex: 1,
                      }}
                    >
                      {'\u00A1'}Solo quedan {selectedVariant.stock} unidades!
                    </span>
                    {/* Urgency progress bar */}
                    <div
                      style={{
                        width: '60px',
                        height: '4px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.max(10, (selectedVariant.stock / 10) * 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        style={{
                          height: '100%',
                          background: selectedVariant.stock <= 3
                            ? 'linear-gradient(90deg, #E53E3E, rgba(229, 62, 62, 0.5))'
                            : 'linear-gradient(90deg, #D69E2E, rgba(214, 158, 46, 0.5))',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </motion.div>
                )}
                {selectedVariant.stock === 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(107, 114, 128, 0.06)',
                      border: '1px solid rgba(107, 114, 128, 0.12)',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#6B7280',
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        color: '#6B7280',
                        fontWeight: 600,
                      }}
                    >
                      Agotado
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Quantity Selector ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#D4D4D4',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '0.75rem',
                }}
              >
                CANTIDAD
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: 'rgba(26, 26, 46, 0.3)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: quantity <= 1 ? '#404040' : '#FAFAFA',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                >
                  <MinusIcon />
                </button>
                <span
                  style={{
                    padding: '0.75rem 1.5rem',
                    color: '#FAFAFA',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    minWidth: '50px',
                    textAlign: 'center',
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))
                  }
                  disabled={quantity >= (selectedVariant?.stock || 10)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color:
                      quantity >= (selectedVariant?.stock || 10)
                        ? '#404040'
                        : '#FAFAFA',
                    cursor:
                      quantity >= (selectedVariant?.stock || 10)
                        ? 'not-allowed'
                        : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                >
                  <PlusIcon />
                </button>
              </div>
            </motion.div>

            {/* ── Action Buttons (Dramatic Animated CTA) ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              {/* Add to Cart */}
              <motion.button
                onClick={handleAddToCart}
                disabled={isCartDisabled || addingToCart}
                whileHover={!isCartDisabled && !addedToCart ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isCartDisabled && !addedToCart ? { scale: 0.98 } : {}}
                style={{
                  width: '100%',
                  padding: '1.1rem 2rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isCartDisabled
                    ? 'rgba(196, 163, 90, 0.1)'
                    : addedToCart
                    ? 'linear-gradient(135deg, #38A169, #2F855A)'
                    : 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 50%, #C4A35A 100%)',
                  backgroundSize: '200% 100%',
                  color: isCartDisabled
                    ? 'rgba(196, 163, 90, 0.3)'
                    : addedToCart
                    ? '#FAFAFA'
                    : '#0D0D0D',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  cursor: isCartDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  boxShadow: isCartDisabled
                    ? 'none'
                    : addedToCart
                    ? '0 4px 20px rgba(56, 161, 105, 0.3)'
                    : '0 4px 20px rgba(196, 163, 90, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Shimmer effect for enabled state */}
                {!isCartDisabled && !addedToCart && !addingToCart && (
                  <div
                    className="pana-btn-shimmer"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                {addingToCart ? (
                  <span className="pana-spinner" />
                ) : addedToCart ? (
                  <>
                    <CheckIcon /> AGREGADO
                  </>
                ) : (
                  <>
                    <CartIcon /> AGREGAR AL CARRITO
                  </>
                )}
              </motion.button>

              {/* Buy Now */}
              <motion.button
                onClick={handleBuyNow}
                disabled={isCartDisabled}
                whileHover={!isCartDisabled ? { scale: 1.01 } : {}}
                whileTap={!isCartDisabled ? { scale: 0.99 } : {}}
                style={{
                  width: '100%',
                  padding: '1.1rem 2rem',
                  borderRadius: '10px',
                  border: `2px solid ${isCartDisabled ? 'rgba(196, 163, 90, 0.08)' : 'rgba(196, 163, 90, 0.5)'}`,
                  background: 'transparent',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: isCartDisabled ? 'rgba(196, 163, 90, 0.2)' : '#C4A35A',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  cursor: isCartDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                }}
                onMouseEnter={(e) => {
                  if (!isCartDisabled) {
                    (e.currentTarget as HTMLElement).style.background =
                      'rgba(196, 163, 90, 0.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = '#C4A35A';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  if (!isCartDisabled) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196, 163, 90, 0.5)';
                  }
                }}
              >
                <BoltIcon /> COMPRAR AHORA
              </motion.button>

              {/* Stock Alert — shows when selected variant is out of stock */}
              {selectedVariant && selectedVariant.stock === 0 && (
                <div
                  style={{
                    background: 'rgba(26, 26, 46, 0.4)',
                    border: '1px solid rgba(196, 163, 90, 0.12)',
                    borderRadius: '10px',
                    padding: '16px',
                  }}
                >
                  {alertSubscribed ? (
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <span style={{ fontSize: '13px', color: '#4ade80', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                        Te avisaremos cuando esté disponible
                      </span>
                    </div>
                  ) : isCustomerLoggedIn ? (
                    <button
                      onClick={handleStockAlert}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(196, 163, 90, 0.12)',
                        border: '1px solid rgba(196, 163, 90, 0.3)',
                        borderRadius: '8px',
                        color: '#C4A35A',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Avisarme cuando esté disponible
                    </button>
                  ) : (
                    <div>
                      <p style={{ fontSize: '12px', color: 'rgba(250,250,250,0.5)', marginBottom: '10px', fontFamily: "'Inter', sans-serif" }}>
                        Déjanos tu correo y te avisamos cuando haya stock:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <input
                          type="email"
                          value={alertEmail}
                          onChange={(e) => setAlertEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          style={{
                            flex: '1 1 140px',
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(196,163,90,0.2)',
                            borderRadius: '6px',
                            color: '#FAFAFA',
                            fontSize: '13px',
                            fontFamily: "'Inter', sans-serif",
                            outline: 'none',
                          }}
                        />
                        <input
                          type="tel"
                          value={alertPhone}
                          onChange={(e) => setAlertPhone(e.target.value)}
                          placeholder="Teléfono (opcional)"
                          style={{
                            flex: '1 1 120px',
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(196,163,90,0.2)',
                            borderRadius: '6px',
                            color: '#FAFAFA',
                            fontSize: '13px',
                            fontFamily: "'Inter', sans-serif",
                            outline: 'none',
                          }}
                        />
                        <button
                          onClick={handleStockAlert}
                          disabled={!alertEmail}
                          style={{
                            padding: '10px 16px',
                            background: alertEmail ? '#C4A35A' : 'rgba(196,163,90,0.2)',
                            color: alertEmail ? '#0D0D0D' : 'rgba(196,163,90,0.4)',
                            border: 'none',
                            borderRadius: '6px',
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            cursor: alertEmail ? 'pointer' : 'not-allowed',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Avisarme
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* ── Trust Signals ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              style={{
                display: 'flex',
                gap: '0',
                padding: '1rem 0',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                marginBottom: '1rem',
              }}
            >
              {[
                {
                  icon: <TruckIcon />,
                  text: `Envio gratis +${formatCOP(FREE_SHIPPING_THRESHOLD)}`,
                },
                { icon: <RefreshIcon />, text: 'Devolucion 30 dias' },
                { icon: <ShieldIcon />, text: 'Pago seguro' },
              ].map((signal, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.5rem',
                    color: '#737373',
                    textAlign: 'center',
                    borderRight:
                      i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <span style={{ color: '#C4A35A', opacity: 0.7 }}>
                    {signal.icon}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      letterSpacing: '0.3px',
                      lineHeight: 1.3,
                    }}
                  >
                    {signal.text}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* ── SKU ── */}
            {selectedVariant && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: '#404040',
                  letterSpacing: '1px',
                  margin: 0,
                }}
              >
                SKU: {selectedVariant.sku}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════
            TABS SECTION (Premium Design)
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            marginBottom: '5rem',
            background: 'rgba(13, 13, 13, 0.3)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid rgba(196, 163, 90, 0.06)',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Tab Headers */}
          <div
            style={{
              display: 'flex',
              gap: '0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0, 0, 0, 0.15)',
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: '1.25rem 1.5rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: `3px solid ${isActive ? '#C4A35A' : 'transparent'}`,
                    color: isActive ? '#C4A35A' : '#525252',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#A3A3A3';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#525252';
                      (e.currentTarget as HTMLElement).style.background = 'none';
                    }
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.5, display: 'flex', alignItems: 'center' }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem 2.5rem' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{
                  color: '#A3A3A3',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  lineHeight: 1.8,
                  maxWidth: '800px',
                }}
              >
                {activeTab === 'descripcion' && (
                  <div>
                    <p style={{ margin: '0 0 1rem' }}>{product.description}</p>
                    {(product.specs?.['_footerNote'] || storeSettings.productFooterNote) && (
                      <p style={{ margin: 0, color: '#404040', fontSize: '0.85rem' }}>
                        {product.specs?.['_footerNote'] || storeSettings.productFooterNote}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'detalles' && (
                  <div>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        maxWidth: '600px',
                      }}
                    >
                      <tbody>
                        {[
                          ['SKU', product.skuPrefix],
                          ['Categoria', product.category?.name || '-'],
                          ['Material', product.specs?.Material || 'Tela premium / Poliester de alta densidad'],
                          ['Bordado', product.specs?.Bordado || '3D de alta densidad'],
                          ['Visera', product.specs?.Visera || 'Plana / Curva (segun modelo)'],
                          ['Origen', product.specs?.Origen || 'Importada'],
                          ['Disponible desde', new Date(product.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })],
                        ].map(([key, val]) => (
                          <tr
                            key={key}
                            style={{
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                            }}
                          >
                            <td
                              style={{
                                padding: '0.85rem 1rem 0.85rem 0',
                                color: '#404040',
                                width: '40%',
                                fontWeight: 500,
                                fontSize: '0.85rem',
                              }}
                            >
                              {key}
                            </td>
                            <td
                              style={{
                                padding: '0.85rem 0',
                                color: '#D4D4D4',
                                fontSize: '0.85rem',
                              }}
                            >
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'envio' && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'flex-start',
                          padding: '1rem',
                          borderRadius: '10px',
                          background: 'rgba(196, 163, 90, 0.03)',
                          border: '1px solid rgba(196, 163, 90, 0.06)',
                        }}
                      >
                        <span style={{ color: '#C4A35A', marginTop: '2px', flexShrink: 0 }}>
                          <TruckIcon />
                        </span>
                        <div>
                          <p
                            style={{
                              color: '#FAFAFA',
                              fontWeight: 600,
                              margin: '0 0 0.25rem',
                              fontSize: '0.9rem',
                            }}
                          >
                            Envio a todo Colombia
                          </p>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>
                            Envio estandar: 3-5 dias habiles. Envio express disponible a ciudades principales. Envio GRATIS en compras superiores a {formatCOP(FREE_SHIPPING_THRESHOLD)}.
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'flex-start',
                          padding: '1rem',
                          borderRadius: '10px',
                          background: 'rgba(196, 163, 90, 0.03)',
                          border: '1px solid rgba(196, 163, 90, 0.06)',
                        }}
                      >
                        <span style={{ color: '#C4A35A', marginTop: '2px', flexShrink: 0 }}>
                          <RefreshIcon />
                        </span>
                        <div>
                          <p
                            style={{
                              color: '#FAFAFA',
                              fontWeight: 600,
                              margin: '0 0 0.25rem',
                              fontSize: '0.9rem',
                            }}
                          >
                            Politica de devoluciones
                          </p>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>
                            Tienes 30 dias para devolver tu producto. Debe estar en condiciones originales, con etiquetas y empaque. Contactanos por WhatsApp para iniciar el proceso.
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'flex-start',
                          padding: '1rem',
                          borderRadius: '10px',
                          background: 'rgba(196, 163, 90, 0.03)',
                          border: '1px solid rgba(196, 163, 90, 0.06)',
                        }}
                      >
                        <span style={{ color: '#C4A35A', marginTop: '2px', flexShrink: 0 }}>
                          <ShieldIcon />
                        </span>
                        <div>
                          <p
                            style={{
                              color: '#FAFAFA',
                              fontWeight: 600,
                              margin: '0 0 0.25rem',
                              fontSize: '0.9rem',
                            }}
                          >
                            Compra segura
                          </p>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>
                            Todos los pagos son procesados de forma segura. Tus datos estan protegidos con encriptacion SSL de 256 bits.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            RELATED PRODUCTS (Premium Section)
        ══════════════════════════════════════════════════════ */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Section header with decorative elements */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid rgba(196, 163, 90, 0.06)',
              }}
            >
              <div>
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  style={{
                    display: 'block',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'rgba(196, 163, 90, 0.5)',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  RECOMENDADOS
                </motion.span>
                <h2
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#FAFAFA',
                    margin: 0,
                  }}
                >
                  TAMBIEN TE PUEDE GUSTAR
                </h2>
                <motion.span
                  initial={{ width: 0 }}
                  whileInView={{ width: '50px' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    display: 'block',
                    height: '2px',
                    background: 'linear-gradient(90deg, #C4A35A, transparent)',
                    marginTop: '0.5rem',
                  }}
                />
              </div>
              <Link
                to="/catalogo"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#C4A35A',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  opacity: 0.7,
                  transition: 'opacity 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(196, 163, 90, 0.15)',
                  background: 'rgba(196, 163, 90, 0.04)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '0.7';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.04)';
                }}
              >
                VER TODO
                <ArrowRightIcon />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
              }}
              className="pana-related-grid"
            >
              {relatedProducts.map((rp, index) => (
                <ProductCard key={rp.id} product={rp} index={index} />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          RESPONSIVE & ANIMATION STYLES
      ══════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Responsive Layout ── */
        @media (max-width: 960px) {
          .pana-product-layout {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 1200px) {
          .pana-related-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .pana-related-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
        }
        @media (max-width: 560px) {
          .pana-related-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
            max-width: 400px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }

        /* ── Stock Pulse ── */
        @keyframes panaStockPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
          50% { opacity: 0.6; box-shadow: 0 0 8px 2px currentColor; }
        }
        .pana-stock-pulse {
          animation: panaStockPulse 2s ease-in-out infinite;
        }

        @keyframes panaStockPulseGreen {
          0%, 100% { box-shadow: 0 0 6px rgba(56, 161, 105, 0.4); }
          50% { box-shadow: 0 0 12px rgba(56, 161, 105, 0.6); }
        }
        .pana-stock-pulse-green {
          animation: panaStockPulseGreen 3s ease-in-out infinite;
        }

        /* ── Spinner ── */
        @keyframes panaSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .pana-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(13, 13, 13, 0.3);
          border-top-color: #0D0D0D;
          border-radius: 50%;
          animation: panaSpin 0.6s linear infinite;
        }

        /* ── Button Shimmer ── */
        @keyframes panaShimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        .pana-btn-shimmer {
          animation: panaShimmer 3s ease-in-out infinite;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          SIZE GUIDE MODAL
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowSizeGuide(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(26,26,46,0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(196,163,90,0.14)',
                borderRadius: '16px',
                padding: '2rem 2.5rem',
                maxWidth: '560px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,163,90,0.06)',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowSizeGuide(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#A3A3A3',
                  fontSize: '18px',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease',
                  padding: 0,
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLElement).style.color = '#FAFAFA';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.color = '#A3A3A3';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#C4A35A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: '0 0 0.5rem',
                }}
              >
                Guia de Tallas
              </h3>
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #C4A35A, transparent)',
                  marginBottom: '1.5rem',
                }}
              />

              {/* Letter sizes table */}
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#D4D4D4',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '0.75rem',
                }}
              >
                Tallas por letra
              </p>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '1.5rem',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: '0.7rem 1rem',
                        textAlign: 'left',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#C4A35A',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid rgba(196,163,90,0.15)',
                      }}
                    >
                      Talla
                    </th>
                    <th
                      style={{
                        padding: '0.7rem 1rem',
                        textAlign: 'left',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#C4A35A',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid rgba(196,163,90,0.15)',
                      }}
                    >
                      Circunferencia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['S', '54 - 55 cm'],
                    ['M', '56 - 57 cm'],
                    ['L', '58 - 59 cm'],
                    ['XL', '60 - 61 cm'],
                  ].map(([size, circ]) => (
                    <tr key={size}>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: '#FAFAFA',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {size}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.85rem',
                          color: '#A3A3A3',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {circ}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Fitted sizes table */}
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#D4D4D4',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '0.75rem',
                }}
              >
                Tallas Fitted (numericas)
              </p>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '1.5rem',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: '0.7rem 1rem',
                        textAlign: 'left',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#C4A35A',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid rgba(196,163,90,0.15)',
                      }}
                    >
                      Talla
                    </th>
                    <th
                      style={{
                        padding: '0.7rem 1rem',
                        textAlign: 'left',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#C4A35A',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid rgba(196,163,90,0.15)',
                      }}
                    >
                      Circunferencia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['7', '55.8 cm'],
                    ['7 1/8', '56.5 cm'],
                    ['7 1/4', '57.2 cm'],
                    ['7 3/8', '58.7 cm'],
                    ['7 1/2', '59.6 cm'],
                    ['7 5/8', '60.6 cm'],
                  ].map(([size, circ]) => (
                    <tr key={size}>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: '#FAFAFA',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {size}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.85rem',
                          color: '#A3A3A3',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {circ}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Measurement note */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(196,163,90,0.04)',
                  border: '1px solid rgba(196,163,90,0.08)',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C4A35A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.8rem',
                    color: '#A3A3A3',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Mide la circunferencia de tu cabeza justo por encima de las orejas
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetailPage;
