// ============================================================
// Pana Rabbids - CatalogPage
// Premium luxury catalog with advanced filtering, sorting,
// search, responsive grid/list views, hero banner, glass morphism
// All inline styles - no external SCSS dependency
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '../../components/common';
import { ProductCard } from '../../components/products';
import {
  getProducts,
  getCategories,
  getProductsByCategory,
  searchProducts,
  getAllActiveProducts,
} from '../../data/productDataService';
import type { Product } from '../../types/product';
import { formatCOP } from '../../utils/formatCurrency';

// ── Sort options ─────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'newest', label: 'Mas recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

// ── View mode ────────────────────────────────────────────────
type ViewMode = 'grid' | 'list';

// ── SVG Icons ────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const GridIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#C4A35A' : '#737373'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#C4A35A' : '#737373'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
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

const CapSearchIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 38C12 38 10 36 10 32C10 22 20 14 32 14C44 14 54 22 54 32C54 36 52 38 52 38" stroke="rgba(196,163,90,0.2)" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 38C8 38 6 40 6 42C6 44 8 46 12 46H52C56 46 58 44 58 42C58 40 56 38 56 38H8Z" stroke="rgba(196,163,90,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="44" cy="44" r="10" stroke="rgba(196,163,90,0.25)" strokeWidth="2" />
    <line x1="51" y1="51" x2="58" y2="58" stroke="rgba(196,163,90,0.25)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ── Animation variants ───────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

// ── Debounce hook ────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ── List View Card ───────────────────────────────────────────
const ListProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const discount =
    product.comparePrice && product.comparePrice > product.basePrice
      ? Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)
      : 0;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/producto/${product.slug}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            background: isHovered ? 'rgba(13, 13, 13, 0.85)' : '#0D0D0D',
            borderRadius: '10px',
            overflow: 'hidden',
            border: `1px solid ${isHovered ? 'rgba(196, 163, 90, 0.25)' : 'rgba(196, 163, 90, 0.06)'}`,
            transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
            boxShadow: isHovered
              ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(196, 163, 90, 0.12)'
              : '0 2px 12px rgba(0, 0, 0, 0.2)',
            padding: '0',
            backdropFilter: isHovered ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: isHovered ? 'blur(20px)' : 'none',
          }}
        >
          {/* Image */}
          <div
            style={{
              width: '200px',
              minWidth: '200px',
              height: '200px',
              overflow: 'hidden',
              position: 'relative',
              background: '#1A1A2E',
              flexShrink: 0,
            }}
          >
            {primaryImage && (
              <img
                src={primaryImage.imageUrl}
                alt={product.name}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                }}
              />
            )}
            {discount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(229, 62, 62, 0.9)',
                  color: '#FAFAFA',
                  fontSize: '9px',
                  fontWeight: 800,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  padding: '5px 10px',
                  borderRadius: '4px',
                  letterSpacing: '1.5px',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 8px rgba(229, 62, 62, 0.25)',
                }}
              >
                -{discount}%
              </span>
            )}
          </div>

          {/* Info */}
          <div
            style={{
              flex: 1,
              padding: '1.25rem 1.5rem 1.25rem 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {product.category && (
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'rgba(196, 163, 90, 0.5)',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                }}
              >
                {product.category.name}
              </span>
            )}

            <h3
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                color: '#FAFAFA',
                margin: 0,
                letterSpacing: '0.3px',
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </h3>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: '#737373',
                margin: 0,
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}
            >
              {product.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#C4A35A',
                  letterSpacing: '-0.3px',
                }}
              >
                {formatCOP(product.basePrice)}
              </span>
              {product.comparePrice && product.comparePrice > product.basePrice && (
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                    color: 'rgba(250, 250, 250, 0.3)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatCOP(product.comparePrice)}
                </span>
              )}
              {totalStock > 0 && totalStock < 5 && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    color: '#E53E3E',
                    fontWeight: 600,
                  }}
                >
                  {'\u00A1'}Solo {totalStock}!
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const PRODUCTS = useMemo(() => getProducts(), []);
  const CATEGORIES = useMemo(() => getCategories(), []);

  // ── State ────────────────────────────────────────────────
  const initialCategory = searchParams.get('categoria') || '';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<SortValue>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Sync URL params when category changes
  useEffect(() => {
    if (selectedCategory) {
      setSearchParams({ categoria: selectedCategory }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedCategory, setSearchParams]);

  // Sync from URL when navigating
  useEffect(() => {
    const cat = searchParams.get('categoria') || '';
    if (cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // ── Filtering & Sorting ──────────────────────────────────
  const filteredProducts = useMemo(() => {
    let products: Product[] = getAllActiveProducts();

    // Category filter
    if (selectedCategory) {
      products = products.filter((p) => p.category?.slug === selectedCategory);
    }

    // Search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        products = [...products].sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price_desc':
        products = [...products].sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'name_asc':
        products = [...products].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        products = [...products].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return products;
  }, [selectedCategory, debouncedSearch, sortBy]);

  const totalProducts = getAllActiveProducts().length;
  const hasActiveFilters = !!selectedCategory || !!debouncedSearch.trim();

  // Active category label for hero
  const activeCategoryData = useMemo(
    () => (selectedCategory ? CATEGORIES.find((c) => c.slug === selectedCategory) : null),
    [selectedCategory]
  );

  // ── Handlers ─────────────────────────────────────────────
  const handleCategoryClick = useCallback(
    (slug: string) => {
      setSelectedCategory((prev) => (prev === slug ? '' : slug));
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setSelectedCategory('');
    setSearchQuery('');
  }, []);

  const getCategoryLabel = (slug: string) =>
    CATEGORIES.find((c) => c.slug === slug)?.name || slug;

  // ── Active filter chips data ─────────────────────────────
  const activeFilterChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (selectedCategory) {
    activeFilterChips.push({
      key: 'cat-' + selectedCategory,
      label: getCategoryLabel(selectedCategory),
      onRemove: () => setSelectedCategory(''),
    });
  }
  if (debouncedSearch.trim()) {
    activeFilterChips.push({
      key: 'search-' + debouncedSearch,
      label: `"${debouncedSearch}"`,
      onRemove: () => setSearchQuery(''),
    });
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <SEOHead
        title="Catalogo"
        description="Explora nuestra coleccion completa de gorras premium. MLB, NFL, NBA, Streetwear, Vintage y Exclusivas."
      />

      {/* ── Decorative Background Elements ── */}
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
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196, 163, 90, 0.03) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-15%',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196, 163, 90, 0.02) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════
          CATEGORY HERO BANNER
      ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 50%, #0D0D0D 100%)',
          borderBottom: '1px solid rgba(196, 163, 90, 0.08)',
        }}
      >
        {/* Decorative grid pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(196, 163, 90, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(196, 163, 90, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }}
        />
        {/* Gold accent gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(196, 163, 90, 0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '3.5rem 1.5rem 3rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Breadcrumbs */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                fontSize: '0.8rem',
                fontFamily: "'Inter', sans-serif",
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
              {selectedCategory ? (
                <>
                  <Link
                    to="/catalogo"
                    style={{
                      color: '#525252',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#C4A35A')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#525252')}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategory('');
                    }}
                  >
                    Catalogo
                  </Link>
                  <span style={{ color: 'rgba(196, 163, 90, 0.3)' }}><ChevronRightIcon /></span>
                  <span style={{ color: '#C4A35A', fontWeight: 600 }}>
                    {activeCategoryData?.name || selectedCategory}
                  </span>
                </>
              ) : (
                <span style={{ color: '#C4A35A', fontWeight: 600 }}>Catalogo</span>
              )}
            </div>
          </motion.nav>

          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#FAFAFA',
                margin: 0,
                lineHeight: 1,
                position: 'relative',
              }}
            >
              {activeCategoryData ? activeCategoryData.name : 'CATALOGO'}
            </h1>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '60px' }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              style={{
                display: 'block',
                height: '3px',
                background: 'linear-gradient(90deg, #C4A35A, rgba(196, 163, 90, 0.2))',
                marginTop: '0.75rem',
                borderRadius: '2px',
              }}
            />
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: '#525252',
                margin: '1rem 0 0',
                letterSpacing: '0.02em',
                maxWidth: '500px',
                lineHeight: 1.6,
              }}
            >
              {activeCategoryData
                ? activeCategoryData.description || `Explora nuestra coleccion de ${activeCategoryData.name}`
                : 'Gorras premium importadas. Estilo autentico para quienes marcan tendencia.'}
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem 1.5rem 4rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ══════════════════════════════════════════════════════
            FILTER BAR (Glass Morphism)
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            background: 'rgba(13, 13, 13, 0.5)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '14px',
            border: '1px solid rgba(196, 163, 90, 0.08)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
          }}
        >
          {/* Top Row: Search + Sort + View Toggle + Mobile Filter Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Search */}
            <div
              style={{
                flex: '1 1 280px',
                position: 'relative',
                maxWidth: '400px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#525252',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar gorras..."
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.75rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(26, 26, 46, 0.4)',
                  color: '#FAFAFA',
                  fontSize: '0.85rem',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(196, 163, 90, 0.4)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(196, 163, 90, 0.06)';
                  e.target.style.background = 'rgba(26, 26, 46, 0.6)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(26, 26, 46, 0.4)';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#A3A3A3',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)')
                  }
                >
                  <CloseIcon />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div style={{ position: 'relative', flex: '0 0 auto' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortValue)}
                style={{
                  appearance: 'none',
                  padding: '0.7rem 2.5rem 0.7rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(26, 26, 46, 0.4)',
                  color: '#FAFAFA',
                  fontSize: '0.85rem',
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.3s ease, background 0.3s ease',
                  minWidth: '200px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(196, 163, 90, 0.4)';
                  e.target.style.background = 'rgba(26, 26, 46, 0.6)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.target.style.background = 'rgba(26, 26, 46, 0.4)';
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ background: '#0D0D0D' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#525252',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronDown />
              </div>
            </div>

            {/* View toggle + Results count */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  color: '#525252',
                  marginRight: '0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: '#C4A35A', fontWeight: 600 }}>
                  {filteredProducts.length}
                </span>{' '}
                {filteredProducts.length !== totalProducts && (
                  <>de {totalProducts} </>
                )}
                productos
              </span>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px',
                  background: viewMode === 'grid' ? 'rgba(196, 163, 90, 0.1)' : 'transparent',
                  border: `1px solid ${viewMode === 'grid' ? 'rgba(196, 163, 90, 0.25)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Vista de cuadricula"
              >
                <GridIcon active={viewMode === 'grid'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px',
                  background: viewMode === 'list' ? 'rgba(196, 163, 90, 0.1)' : 'transparent',
                  border: `1px solid ${viewMode === 'list' ? 'rgba(196, 163, 90, 0.25)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Vista de lista"
              >
                <ListIcon active={viewMode === 'list'} />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(196, 163, 90, 0.2)',
                background: mobileFiltersOpen
                  ? 'rgba(196, 163, 90, 0.1)'
                  : 'transparent',
                color: '#FAFAFA',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: "'Barlow Condensed', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
              className="pana-mobile-filter-btn"
            >
              <FilterIcon />
              Filtros
            </button>
          </div>

          {/* Category Chips Row */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            }}
            className="pana-category-chips"
          >
            {/* "Todos" chip */}
            <button
              onClick={() => setSelectedCategory('')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '100px',
                border: `1px solid ${!selectedCategory ? 'rgba(196, 163, 90, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: !selectedCategory
                  ? 'linear-gradient(135deg, rgba(196, 163, 90, 0.15), rgba(196, 163, 90, 0.05))'
                  : 'transparent',
                color: !selectedCategory ? '#C4A35A' : '#737373',
                fontSize: '0.78rem',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
                whiteSpace: 'nowrap',
                boxShadow: !selectedCategory ? '0 2px 8px rgba(196, 163, 90, 0.08)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196, 163, 90, 0.25)';
                  (e.currentTarget as HTMLElement).style.color = '#C4A35A';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#737373';
                }
              }}
            >
              Todos
              <span style={{
                fontSize: '0.65rem',
                fontFamily: "'JetBrains Mono', monospace",
                background: !selectedCategory ? 'rgba(196,163,90,0.2)' : 'rgba(255,255,255,0.06)',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 600,
              }}>
                {totalProducts}
              </span>
            </button>

            {/* Category chips */}
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              const catCount = PRODUCTS.filter(p => p.categoryId === cat.id && p.isActive).length;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '100px',
                    border: `1px solid ${isActive ? 'rgba(196, 163, 90, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(196, 163, 90, 0.15), rgba(196, 163, 90, 0.05))'
                      : 'transparent',
                    color: isActive ? '#C4A35A' : '#737373',
                    fontSize: '0.78rem',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 2px 8px rgba(196, 163, 90, 0.08)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196, 163, 90, 0.25)';
                      (e.currentTarget as HTMLElement).style.color = '#C4A35A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLElement).style.color = '#737373';
                    }
                  }}
                >
                  {cat.name}
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    background: isActive ? 'rgba(196,163,90,0.2)' : 'rgba(255,255,255,0.06)',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 600,
                  }}>
                    {catCount}
                  </span>
                </button>
              );
            })}

            {/* Spacer + Clear button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{
                  marginLeft: 'auto',
                  padding: '0.45rem 1rem',
                  borderRadius: '100px',
                  border: '1px solid rgba(229, 62, 62, 0.15)',
                  background: 'rgba(229, 62, 62, 0.06)',
                  color: '#E53E3E',
                  fontSize: '0.75rem',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(229, 62, 62, 0.12)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229, 62, 62, 0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(229, 62, 62, 0.06)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229, 62, 62, 0.15)';
                }}
              >
                <CloseIcon />
                Limpiar filtros
              </button>
            )}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            ACTIVE FILTER CHIPS
        ══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {activeFilterChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  color: '#404040',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '0.25rem',
                }}
              >
                Filtros activos:
              </span>
              {activeFilterChips.map((chip) => (
                <motion.span
                  key={chip.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.5rem 0.3rem 0.75rem',
                    borderRadius: '100px',
                    background: 'rgba(196, 163, 90, 0.06)',
                    border: '1px solid rgba(196, 163, 90, 0.12)',
                    color: '#C4A35A',
                    fontSize: '0.75rem',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    style={{
                      background: 'rgba(196, 163, 90, 0.12)',
                      border: 'none',
                      color: '#C4A35A',
                      cursor: 'pointer',
                      padding: '2px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '18px',
                      height: '18px',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.25)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = 'rgba(196, 163, 90, 0.12)')
                    }
                  >
                    <CloseIcon />
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════
            PRODUCT GRID / LIST
        ══════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key={`${viewMode}-${selectedCategory}-${debouncedSearch}-${sortBy}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              style={
                viewMode === 'grid'
                  ? {
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '1.5rem',
                    }
                  : {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }
              }
              className={viewMode === 'grid' ? 'pana-catalog-grid' : 'pana-catalog-list'}
            >
              {filteredProducts.map((product, index) =>
                viewMode === 'grid' ? (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ) : (
                  <ListProductCard key={product.id} product={product} index={index} />
                )
              )}
            </motion.div>
          ) : (
            /* ══════════════════════════════════════════════════
               EMPTY STATE
            ══════════════════════════════════════════════════ */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6rem 2rem',
                textAlign: 'center',
              }}
            >
              {/* Empty illustration */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(196, 163, 90, 0.04), rgba(26, 26, 46, 0.4))',
                  border: '1px dashed rgba(196, 163, 90, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                <CapSearchIcon />
              </motion.div>

              <h2
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#FAFAFA',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                }}
              >
                No encontramos productos con esos filtros
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  color: '#525252',
                  marginBottom: '2rem',
                  maxWidth: '420px',
                  lineHeight: 1.7,
                }}
              >
                Intenta con otros filtros o explora todo nuestro catalogo de gorras premium.
              </p>
              <motion.button
                onClick={clearAllFilters}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{
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
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(196, 163, 90, 0.25)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 8px 32px rgba(196, 163, 90, 0.35)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 4px 20px rgba(196, 163, 90, 0.25)';
                }}
              >
                LIMPIAR FILTROS
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════
            RESULTS COUNT FOOTER
        ══════════════════════════════════════════════════════ */}
        {filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              textAlign: 'center',
              marginTop: '3.5rem',
              padding: '2rem 0',
              borderTop: '1px solid rgba(196, 163, 90, 0.04)',
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8rem',
                color: '#404040',
                letterSpacing: '0.05em',
              }}
            >
              Mostrando{' '}
              <span style={{ color: '#737373', fontWeight: 500 }}>{filteredProducts.length}</span>{' '}
              de{' '}
              <span style={{ color: '#737373', fontWeight: 500 }}>{totalProducts}</span>{' '}
              productos
            </p>
          </motion.div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          RESPONSIVE STYLES
      ══════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Responsive Grid ── */
        @media (max-width: 1200px) {
          .pana-catalog-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 900px) {
          .pana-catalog-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          .pana-mobile-filter-btn {
            display: flex !important;
          }
          .pana-category-chips {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 0.5rem !important;
            scrollbar-width: thin;
          }
        }
        @media (max-width: 560px) {
          .pana-catalog-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
            max-width: 400px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .pana-catalog-list > div > a > div {
            flex-direction: column !important;
          }
          .pana-catalog-list > div > a > div > div:first-child {
            width: 100% !important;
            min-width: 100% !important;
            height: 200px !important;
          }
        }

        /* ── Sort dropdown option styles ── */
        select option {
          background: #0D0D0D;
          color: #FAFAFA;
        }

        /* ── Input placeholder ── */
        .pana-catalog-grid input::placeholder,
        input[placeholder="Buscar gorras..."]::placeholder {
          color: rgba(250,250,250,0.25);
        }

        /* ── Scrollbar ── */
        .pana-category-chips::-webkit-scrollbar {
          height: 4px;
        }
        .pana-category-chips::-webkit-scrollbar-track {
          background: transparent;
        }
        .pana-category-chips::-webkit-scrollbar-thumb {
          background: rgba(196, 163, 90, 0.2);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default CatalogPage;
