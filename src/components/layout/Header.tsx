// ============================================================
// PlexifyCaps - Premium Glassmorphism Header Component
// Fixed sticky header with mega menu, animated search overlay,
// cart badge with spring animation, scroll-aware glass effect
// Responsive: desktop mega menu + mobile slide-from-right nav
// ============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PUBLIC_ROUTES, CATEGORIES, catalogCategoryPath, productDetailPath } from '../../config/routes';
import { useCart } from '../../hooks/useCart';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { useWishlist } from '../../hooks/useWishlist';
import { CartDrawer } from '../cart';
import MobileNav from './MobileNav';
import { searchProducts } from '../../data/productDataService';
import { formatCOP } from '../../utils/formatCurrency';

// ── Color tokens ─────────────────────────────────────────────
const C = {
  gold: '#C4A35A',
  goldLight: 'rgba(196, 163, 90, 0.15)',
  goldMedium: 'rgba(196, 163, 90, 0.25)',
  goldSubtle: 'rgba(196, 163, 90, 0.08)',
  goldGlow: 'rgba(196, 163, 90, 0.35)',
  dark: '#0D0D0D',
  darkAlt: '#1A1A2E',
  darkPanel: 'rgba(13, 13, 13, 0.97)',
  darkGlass: 'rgba(13, 13, 13, 0.55)',
  darkGlassScrolled: 'rgba(13, 13, 13, 0.82)',
  white: '#FAFAFA',
  whiteDim: 'rgba(250, 250, 250, 0.55)',
  whiteGhost: 'rgba(250, 250, 250, 0.3)',
  whiteHint: 'rgba(250, 250, 250, 0.07)',
  whiteHover: 'rgba(250, 250, 250, 0.1)',
} as const;

const FONT = {
  heading: "'Barlow Condensed', 'Barlow', sans-serif",
  body: "'Inter', 'Barlow', sans-serif",
} as const;

// ── Premium cubic-bezier easing ──────────────────────────────
const EASE_PREMIUM = 'cubic-bezier(0.23, 1, 0.32, 1)';
const TRANSITION_SMOOTH = `all 0.3s ${EASE_PREMIUM}`;

// ── SVG Icons (Premium stroke-based, refined weights) ────────

const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const ShoppingBagIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const UserIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
  </svg>
);

const ChevronDownIcon = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginLeft: '4px', transition: `transform 0.3s ${EASE_PREMIUM}` }}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const HeartIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CloseIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Category-specific SVG icons (refined outlined style)
const BaseballIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M4.93 4.93c4.08 2.38 4.08 11.76 0 14.14" />
    <path d="M19.07 4.93c-4.08 2.38-4.08 11.76 0 14.14" />
  </svg>
);

const FootballIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(45 12 12)" />
    <path d="m15.54 8.46-7.08 7.08" />
    <path d="m13 7.5 1.5 1.5" />
    <path d="m15 9.5 1.5 1.5" />
    <path d="m7.5 13 1.5 1.5" />
    <path d="m9.5 15 1.5 1.5" />
  </svg>
);

const BasketballIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
    <path d="M4.93 4.93c3.77 3.77 3.77 10.37 0 14.14" />
    <path d="M19.07 4.93c-3.77 3.77-3.77 10.37 0 14.14" />
  </svg>
);

const FireIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-6.5 0 3.5 2 5.5 2 8.5a4 4 0 1 1-8 0c0-1.5.5-4 1.5-5" />
  </svg>
);

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DiamondIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l4 6-10 13L2 9Z" />
    <path d="M11 3 8 9l4 13 4-13-3-6" />
    <path d="M2 9h20" />
  </svg>
);

const GridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const CATEGORY_ICONS: Record<string, React.FC> = {
  mlb: BaseballIcon,
  nfl: FootballIcon,
  nba: BasketballIcon,
  streetwear: FireIcon,
  vintage: ClockIcon,
  exclusivas: DiamondIcon,
};

const CATEGORY_COUNTS: Record<string, number> = {
  mlb: 3,
  nfl: 3,
  nba: 2,
  streetwear: 3,
  vintage: 2,
  exclusivas: 3,
};

// Popular search terms
const POPULAR_SEARCHES = [
  'Yankees', 'Dodgers', 'Snapback', 'Vintage', 'Gold Edition', 'Bulls',
  'Raiders', 'Streetwear', 'Lakers', 'Limited',
];

// ── Framer Motion variants ───────────────────────────────────
const megaMenuVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: { duration: 0.15, ease: [0.55, 0.06, 0.68, 0.19] },
  },
};

const searchOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

const searchContentVariants = {
  hidden: { y: -30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, delay: 0.08, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ── Component ────────────────────────────────────────────────
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { customer, isAuthenticated: isCustomerLoggedIn, logout: customerLogout } = useCustomerAuth();
  const { wishlistCount } = useWishlist();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNavLink, setHoveredNavLink] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const catalogRef = useRef<HTMLDivElement>(null);
  const catalogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevTotalItemsRef = useRef(totalItems);

  // Compute scroll-dependent values
  const scrolled = scrollY > 10;
  const scrollProgress = Math.min(scrollY / 120, 1);
  // Announcement bar hides after 50px scroll — header slides to top: 0
  const announcementVisible = scrollY <= 50;

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    return searchProducts(searchQuery.trim()).slice(0, 5);
  }, [searchQuery]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when overlay opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 120);
    }
    if (!isSearchOpen) {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCatalogOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Prevent body scroll when overlays are open (except cart - CartDrawer handles its own)
  useEffect(() => {
    if (isMobileNavOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!isCartOpen) {
      document.body.style.overflow = '';
    }
    return () => {
      if (!isCartOpen) {
        document.body.style.overflow = '';
      }
    };
  }, [isMobileNavOpen, isSearchOpen, isCartOpen]);

  // Track cart badge changes for animation
  useEffect(() => {
    prevTotalItemsRef.current = totalItems;
  }, [totalItems]);

  const handleCatalogEnter = useCallback(() => {
    if (catalogTimeoutRef.current) {
      clearTimeout(catalogTimeoutRef.current);
      catalogTimeoutRef.current = null;
    }
    setIsCatalogOpen(true);
  }, []);

  const handleCatalogLeave = useCallback(() => {
    catalogTimeoutRef.current = setTimeout(() => {
      setIsCatalogOpen(false);
    }, 250);
  }, []);

  const isActive = (path: string) => {
    if (path === PUBLIC_ROUTES.HOME) return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSearchResultClick = (slug: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(productDetailPath(slug));
  };

  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Get primary image for product
  const getProductImage = (product: { images: { isPrimary: boolean; imageUrl: string }[] }) => {
    const primary = product.images.find((img) => img.isPrimary);
    return primary?.imageUrl || product.images[0]?.imageUrl || '';
  };

  // Get a featured product to spotlight in mega menu
  const featuredProduct = useMemo(() => {
    const allProducts = searchProducts('');
    const featured = allProducts.filter(p => p.isFeatured);
    return featured[0] || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Nav link helper for hover underline effect ─────────────
  const renderNavLink = (to: string, label: string, key: string) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        style={{
          color: active ? C.gold : (hoveredNavLink === key ? C.gold : C.white),
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '1.8px',
          textTransform: 'uppercase',
          fontFamily: FONT.heading,
          transition: `color 0.3s ${EASE_PREMIUM}`,
          position: 'relative',
          padding: '8px 0',
        }}
        onMouseEnter={() => setHoveredNavLink(key)}
        onMouseLeave={() => setHoveredNavLink(null)}
      >
        {label}
        {/* Underline indicator */}
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            borderRadius: '1px',
            width: active ? '100%' : (hoveredNavLink === key ? '70%' : '0%'),
            opacity: active ? 1 : (hoveredNavLink === key ? 0.7 : 0),
            transition: `all 0.3s ${EASE_PREMIUM}`,
          }}
        />
      </Link>
    );
  };

  // ── Action button helper ───────────────────────────────────
  const actionButtonStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid transparent',
    color: C.white,
    cursor: 'pointer',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    transition: TRANSITION_SMOOTH,
    position: 'relative',
  };

  const handleActionHoverEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.color = C.gold;
    el.style.background = C.whiteHint;
    el.style.borderColor = C.goldLight;
  };

  const handleActionHoverLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.color = C.white;
    el.style.background = 'transparent';
    el.style.borderColor = 'transparent';
  };

  return (
    <>
      {/* ── Header Bar ── */}
      <header
        className="header"
        style={{
          position: 'fixed',
          top: announcementVisible ? '28px' : '0',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled
            ? 'rgba(8, 8, 12, 0.92)'
            : 'rgba(8, 8, 12, 0.6)',
          backdropFilter: `blur(${24 + scrollProgress * 12}px) saturate(${1.3 + scrollProgress * 0.4})`,
          WebkitBackdropFilter: `blur(${24 + scrollProgress * 12}px) saturate(${1.3 + scrollProgress * 0.4})`,
          borderBottom: 'none',
          boxShadow: scrolled
            ? `0 12px 48px rgba(0, 0, 0, 0.5), 0 2px 0 rgba(196, 163, 90, 0.12), inset 0 1px 0 rgba(250, 250, 250, 0.04)`
            : `0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(250, 250, 250, 0.03)`,
          transition: `top 0.4s ${EASE_PREMIUM}, background 0.4s ${EASE_PREMIUM}, box-shadow 0.4s ${EASE_PREMIUM}, backdrop-filter 0.4s ${EASE_PREMIUM}`,
        }}
      >
        {/* Premium gold accent line at bottom of header */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 5%, rgba(196,163,90,${0.08 + scrollProgress * 0.15}) 30%, rgba(196,163,90,${0.15 + scrollProgress * 0.2}) 50%, rgba(196,163,90,${0.08 + scrollProgress * 0.15}) 70%, transparent 95%)`,
          transition: `opacity 0.4s ${EASE_PREMIUM}`,
        }} />
        <div
          className="header__inner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: scrolled ? '0 28px' : '0 40px',
            height: scrolled ? '68px' : '84px',
            transition: `all 0.4s ${EASE_PREMIUM}`,
          }}
        >
          {/* ── Logo ── */}
          <Link
            to={PUBLIC_ROUTES.HOME}
            className="header__logo"
            style={{
              fontFamily: FONT.heading,
              fontSize: '24px',
              fontWeight: 800,
              color: C.gold,
              textTransform: 'uppercase',
              letterSpacing: '3.5px',
              textDecoration: 'none',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              transition: TRANSITION_SMOOTH,
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            {/* Logo mark — premium bordered emblem */}
            <span
              style={{
                width: scrolled ? '40px' : '48px',
                height: scrolled ? '40px' : '48px',
                border: `1.5px solid rgba(196, 163, 90, 0.6)`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: scrolled ? '14px' : '17px',
                letterSpacing: '1.5px',
                transition: TRANSITION_SMOOTH,
                flexShrink: 0,
                background: `linear-gradient(135deg, rgba(196, 163, 90, 0.12), rgba(196, 163, 90, 0.03))`,
                boxShadow: `0 0 28px rgba(196, 163, 90, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              PR
            </span>
            {/* Logo text with premium gold gradient */}
            <span
              className="header__logo-text"
              style={{
                background: `linear-gradient(135deg, #E8D5A3 0%, #C4A35A 25%, #D4AF37 50%, #E8D5A3 75%, #C4A35A 100%)`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 800,
                letterSpacing: '5px',
                fontSize: scrolled ? '21px' : '24px',
                transition: `font-size 0.3s ${EASE_PREMIUM}`,
              }}
            >
              PLEXIFYCAPS
            </span>
          </Link>

          {/* ── Desktop Navigation ── */}
          <nav
            className="header__nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
            }}
            role="navigation"
            aria-label="Navegacion principal"
          >
            {renderNavLink(PUBLIC_ROUTES.HOME, 'Inicio', 'home')}

            {/* Catalog dropdown */}
            <div
              ref={catalogRef}
              onMouseEnter={handleCatalogEnter}
              onMouseLeave={handleCatalogLeave}
              style={{ position: 'relative' }}
            >
              <Link
                to={PUBLIC_ROUTES.CATALOG}
                style={{
                  color: isActive(PUBLIC_ROUTES.CATALOG) ? C.gold : (hoveredNavLink === 'catalog' || isCatalogOpen ? C.gold : C.white),
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '1.8px',
                  textTransform: 'uppercase',
                  fontFamily: FONT.heading,
                  transition: `color 0.3s ${EASE_PREMIUM}`,
                  position: 'relative',
                  padding: '8px 0',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={() => setHoveredNavLink('catalog')}
                onMouseLeave={() => setHoveredNavLink(null)}
              >
                Catalogo
                <span
                  style={{
                    display: 'inline-flex',
                    transform: isCatalogOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: `transform 0.3s ${EASE_PREMIUM}`,
                  }}
                >
                  <ChevronDownIcon size={12} />
                </span>
                {/* Underline */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
                    borderRadius: '1px',
                    width: isActive(PUBLIC_ROUTES.CATALOG) ? '100%' : (hoveredNavLink === 'catalog' || isCatalogOpen ? '70%' : '0%'),
                    opacity: isActive(PUBLIC_ROUTES.CATALOG) ? 1 : (hoveredNavLink === 'catalog' || isCatalogOpen ? 0.7 : 0),
                    transition: `all 0.3s ${EASE_PREMIUM}`,
                  }}
                />
              </Link>

              {/* ── Premium Mega Menu ── */}
              {/* Static wrapper handles positioning — Framer Motion won't interfere with transform */}
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                paddingTop: '10px',
                pointerEvents: isCatalogOpen ? 'auto' : 'none',
                zIndex: 100,
              }}>
              <AnimatePresence>
                {isCatalogOpen && (
                  <motion.div
                    className="header__mega-menu"
                    variants={megaMenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                      background: `linear-gradient(180deg, rgba(18, 18, 30, 0.98), rgba(13, 13, 13, 0.99))`,
                      backdropFilter: 'blur(24px) saturate(1.4)',
                      WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                      border: `1px solid rgba(196, 163, 90, 0.12)`,
                      borderRadius: '16px',
                      padding: '0',
                      minWidth: '700px',
                      overflow: 'hidden',
                      boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,163,90,0.06), 0 0 60px rgba(196, 163, 90, 0.04)`,
                    }}
                  >
                    {/* Gold accent line at top */}
                    <div
                      style={{
                        height: '2px',
                        background: `linear-gradient(90deg, transparent 5%, ${C.gold} 50%, transparent 95%)`,
                        width: '100%',
                        opacity: 0.8,
                      }}
                    />

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 270px',
                        minHeight: '380px',
                      }}
                    >
                      {/* Left: Category list */}
                      <div style={{ padding: '24px 28px' }}>
                        <p
                          style={{
                            color: C.whiteGhost,
                            fontSize: '10px',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            fontFamily: FONT.heading,
                            fontWeight: 600,
                            marginBottom: '16px',
                            paddingLeft: '8px',
                          }}
                        >
                          Categorias
                        </p>

                        {/* View All */}
                        <Link
                          to={PUBLIC_ROUTES.CATALOG}
                          onClick={() => setIsCatalogOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '11px 12px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            transition: TRANSITION_SMOOTH,
                            marginBottom: '4px',
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = C.goldSubtle;
                            el.style.boxShadow = `inset 0 0 0 1px ${C.goldLight}`;
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = 'transparent';
                            el.style.boxShadow = 'none';
                          }}
                        >
                          <span
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              background: `linear-gradient(135deg, ${C.whiteHint}, rgba(196, 163, 90, 0.06))`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: C.gold,
                              flexShrink: 0,
                              transition: TRANSITION_SMOOTH,
                            }}
                          >
                            <GridIcon />
                          </span>
                          <div style={{ flex: 1 }}>
                            <span
                              style={{
                                color: C.white,
                                fontSize: '14px',
                                fontWeight: 700,
                                fontFamily: FONT.heading,
                                letterSpacing: '0.8px',
                                display: 'block',
                              }}
                            >
                              Ver Todo
                            </span>
                            <span
                              style={{
                                color: C.whiteDim,
                                fontSize: '11px',
                                fontFamily: FONT.body,
                                lineHeight: 1.4,
                              }}
                            >
                              Explora todo el catalogo
                            </span>
                          </div>
                        </Link>

                        {CATEGORIES.map((cat) => {
                          const IconComp = CATEGORY_ICONS[cat.slug] || GridIcon;
                          const count = CATEGORY_COUNTS[cat.slug] || 0;
                          return (
                            <Link
                              key={cat.slug}
                              to={catalogCategoryPath(cat.slug)}
                              onClick={() => setIsCatalogOpen(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '11px 12px',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                transition: TRANSITION_SMOOTH,
                                marginBottom: '2px',
                              }}
                              onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.background = C.goldSubtle;
                                el.style.boxShadow = `inset 0 0 0 1px ${C.goldLight}`;
                              }}
                              onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.background = 'transparent';
                                el.style.boxShadow = 'none';
                              }}
                            >
                              <span
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  background: `linear-gradient(135deg, ${C.whiteHint}, rgba(196, 163, 90, 0.06))`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: C.gold,
                                  flexShrink: 0,
                                  transition: TRANSITION_SMOOTH,
                                }}
                              >
                                <IconComp />
                              </span>
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <span
                                    style={{
                                      color: C.white,
                                      fontSize: '14px',
                                      fontWeight: 700,
                                      fontFamily: FONT.heading,
                                      letterSpacing: '0.8px',
                                    }}
                                  >
                                    {cat.label}
                                  </span>
                                  <span
                                    style={{
                                      color: C.whiteGhost,
                                      fontSize: '10px',
                                      fontFamily: FONT.body,
                                      fontWeight: 500,
                                      background: `linear-gradient(135deg, ${C.whiteHint}, rgba(196, 163, 90, 0.05))`,
                                      padding: '2px 10px',
                                      borderRadius: '12px',
                                      border: `1px solid ${C.whiteHint}`,
                                    }}
                                  >
                                    {count}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    color: C.whiteDim,
                                    fontSize: '11px',
                                    fontFamily: FONT.body,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {cat.description}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Right: Featured product spotlight */}
                      <div
                        style={{
                          borderLeft: `1px solid ${C.whiteHint}`,
                          padding: '24px',
                          display: 'flex',
                          flexDirection: 'column',
                          background: `linear-gradient(180deg, rgba(196, 163, 90, 0.02), transparent)`,
                        }}
                      >
                        <p
                          style={{
                            color: C.whiteGhost,
                            fontSize: '10px',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            fontFamily: FONT.heading,
                            fontWeight: 600,
                            marginBottom: '16px',
                          }}
                        >
                          Destacado
                        </p>

                        {featuredProduct && (
                          <Link
                            to={productDetailPath(featuredProduct.slug)}
                            onClick={() => setIsCatalogOpen(false)}
                            style={{
                              textDecoration: 'none',
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <div
                              style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                background: C.darkAlt,
                                marginBottom: '14px',
                                position: 'relative',
                                border: `1px solid ${C.whiteHint}`,
                              }}
                            >
                              <img
                                src={getProductImage(featuredProduct)}
                                alt={featuredProduct.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: `transform 0.5s ${EASE_PREMIUM}`,
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)';
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                }}
                              />
                              {featuredProduct.comparePrice && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: `linear-gradient(135deg, ${C.gold}, #A8893E)`,
                                    color: C.dark,
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    fontFamily: FONT.heading,
                                    letterSpacing: '0.8px',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    textTransform: 'uppercase',
                                    boxShadow: `0 4px 12px rgba(196, 163, 90, 0.3)`,
                                  }}
                                >
                                  Oferta
                                </span>
                              )}
                            </div>
                            <span
                              style={{
                                color: C.white,
                                fontSize: '14px',
                                fontWeight: 700,
                                fontFamily: FONT.heading,
                                letterSpacing: '0.8px',
                                marginBottom: '6px',
                              }}
                            >
                              {featuredProduct.name}
                            </span>
                            <span
                              style={{
                                background: `linear-gradient(135deg, ${C.gold}, #E8D5A0)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontSize: '17px',
                                fontWeight: 700,
                                fontFamily: FONT.heading,
                              }}
                            >
                              {formatCOP(featuredProduct.basePrice)}
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Bottom gold accent */}
                    <div
                      style={{
                        height: '1px',
                        background: `linear-gradient(90deg, transparent 10%, rgba(196, 163, 90, 0.1) 50%, transparent 90%)`,
                        width: '100%',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>

            {renderNavLink(PUBLIC_ROUTES.ABOUT, 'Nosotros', 'about')}
            {renderNavLink(PUBLIC_ROUTES.CONTACT, 'Contacto', 'contact')}
            {renderNavLink(PUBLIC_ROUTES.TRACKING, 'Rastrear', 'tracking')}
          </nav>

          {/* ── Actions ── */}
          <div
            className="header__actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            {/* Search button */}
            <button
              className="header__search-btn"
              style={actionButtonStyle}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar productos"
              onMouseEnter={handleActionHoverEnter}
              onMouseLeave={handleActionHoverLeave}
            >
              <SearchIcon size={20} />
            </button>

            {/* Wishlist button */}
            <button
              className="header__wishlist-btn"
              style={actionButtonStyle}
              aria-label={`Favoritos${wishlistCount > 0 ? `, ${wishlistCount} productos` : ''}`}
              onClick={() => navigate(isCustomerLoggedIn ? '/mi-cuenta/favoritos' : '/login')}
              onMouseEnter={handleActionHoverEnter}
              onMouseLeave={handleActionHoverLeave}
            >
              <HeartIcon size={20} />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '0px',
                    background: `linear-gradient(135deg, ${C.gold}, #A8893E)`,
                    color: C.dark,
                    fontSize: '10px',
                    fontWeight: 800,
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: FONT.heading,
                    lineHeight: 1,
                    boxShadow: `0 2px 8px rgba(196, 163, 90, 0.5), 0 0 0 2px ${C.dark}`,
                    pointerEvents: 'none',
                  }}
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Account button with dropdown */}
            <div ref={userMenuRef} style={{ position: 'relative' }} className="header__user-btn">
              <button
                style={actionButtonStyle}
                aria-label="Mi cuenta"
                onClick={() => {
                  if (isCustomerLoggedIn) {
                    setIsUserMenuOpen((prev) => !prev);
                  } else {
                    navigate('/login');
                  }
                }}
                onMouseEnter={handleActionHoverEnter}
                onMouseLeave={handleActionHoverLeave}
              >
                <UserIcon size={20} />
                {isCustomerLoggedIn && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      boxShadow: `0 0 0 2px ${C.dark}`,
                    }}
                  />
                )}
              </button>

              {/* User dropdown menu */}
              <AnimatePresence>
                {isUserMenuOpen && isCustomerLoggedIn && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '200px',
                      background: 'rgba(18, 18, 30, 0.98)',
                      backdropFilter: 'blur(24px)',
                      border: `1px solid rgba(196, 163, 90, 0.15)`,
                      borderRadius: '12px',
                      padding: '8px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: C.white, fontFamily: FONT.heading }}>
                        {customer?.firstName} {customer?.lastName}
                      </div>
                      <div style={{ fontSize: '11px', color: C.whiteDim, fontFamily: FONT.body, marginTop: '2px' }}>
                        {customer?.email}
                      </div>
                    </div>
                    {[
                      { label: 'Mi Cuenta', path: '/mi-cuenta' },
                      { label: 'Mis Pedidos', path: '/mi-cuenta/pedidos' },
                      { label: 'Favoritos', path: '/mi-cuenta/favoritos' },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { setIsUserMenuOpen(false); navigate(item.path); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '9px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: C.white,
                          fontSize: '13px',
                          fontFamily: FONT.body,
                          fontWeight: 500,
                          textAlign: 'left',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: TRANSITION_SMOOTH,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C.whiteHint; e.currentTarget.style.color = C.gold; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.white; }}
                      >
                        {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }}>
                      <button
                        onClick={() => { setIsUserMenuOpen(false); customerLogout(); navigate('/'); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '9px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '13px',
                          fontFamily: FONT.body,
                          fontWeight: 500,
                          textAlign: 'left',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: TRANSITION_SMOOTH,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart button - opens drawer */}
            <button
              className="header__cart-btn"
              style={actionButtonStyle}
              onClick={() => setIsCartOpen(true)}
              aria-label={`Carrito de compras${totalItems > 0 ? `, ${totalItems} articulos` : ''}`}
              onMouseEnter={handleActionHoverEnter}
              onMouseLeave={handleActionHoverLeave}
            >
              <ShoppingBagIcon size={20} />
              <AnimatePresence mode="wait">
                {totalItems > 0 && (
                  <motion.span
                    key={`cart-badge-${totalItems}`}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '0px',
                      background: `linear-gradient(135deg, ${C.gold}, #A8893E)`,
                      color: C.dark,
                      fontSize: '10px',
                      fontWeight: 800,
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: FONT.heading,
                      lineHeight: 1,
                      boxShadow: `0 2px 8px rgba(196, 163, 90, 0.5), 0 0 0 2px ${C.dark}`,
                      pointerEvents: 'none',
                    }}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{
                      scale: [0, 1.3, 1],
                      rotate: [- 90, 10, 0],
                    }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 20,
                      mass: 0.7,
                    }}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Animated Hamburger menu (mobile) */}
            <button
              className="header__hamburger"
              style={{
                background: 'none',
                border: '1px solid transparent',
                color: C.white,
                cursor: 'pointer',
                padding: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                width: '44px',
                height: '44px',
                position: 'relative',
                transition: TRANSITION_SMOOTH,
                /* NOTE: display is controlled solely by CSS media queries below */
              }}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label={isMobileNavOpen ? 'Cerrar menu' : 'Abrir menu de navegacion'}
              aria-expanded={isMobileNavOpen}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = C.whiteHint;
                el.style.borderColor = C.goldLight;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = 'transparent';
                el.style.borderColor = 'transparent';
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '14px',
                  position: 'relative',
                }}
              >
                {/* Top bar */}
                <span
                  style={{
                    position: 'absolute',
                    top: isMobileNavOpen ? '6px' : '0',
                    left: 0,
                    width: isMobileNavOpen ? '20px' : '20px',
                    height: '2px',
                    background: isMobileNavOpen ? C.gold : C.white,
                    borderRadius: '2px',
                    transition: `all 0.35s ${EASE_PREMIUM}`,
                    transform: isMobileNavOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    transformOrigin: 'center',
                  }}
                />
                {/* Middle bar */}
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: 0,
                    width: '14px',
                    height: '2px',
                    background: C.gold,
                    borderRadius: '2px',
                    transition: `all 0.25s ${EASE_PREMIUM}`,
                    opacity: isMobileNavOpen ? 0 : 1,
                    transform: isMobileNavOpen ? 'translateX(10px)' : 'translateX(0)',
                  }}
                />
                {/* Bottom bar */}
                <span
                  style={{
                    position: 'absolute',
                    top: isMobileNavOpen ? '6px' : '12px',
                    left: 0,
                    width: isMobileNavOpen ? '20px' : '17px',
                    height: '2px',
                    background: isMobileNavOpen ? C.gold : C.white,
                    borderRadius: '2px',
                    transition: `all 0.35s ${EASE_PREMIUM}`,
                    transform: isMobileNavOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
                    transformOrigin: 'center',
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ── Cart Drawer ── */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* ── Search Overlay (Full-Screen Premium Glass) ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="search-overlay"
            variants={searchOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(7, 7, 7, 0.92)',
              backdropFilter: 'blur(32px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: '13vh',
              overflowY: 'auto',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsSearchOpen(false);
            }}
          >
            {/* Close button */}
            <motion.button
              onClick={() => setIsSearchOpen(false)}
              aria-label="Cerrar busqueda"
              style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                background: 'rgba(250, 250, 250, 0.04)',
                border: `1px solid rgba(250, 250, 250, 0.12)`,
                color: C.white,
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: TRANSITION_SMOOTH,
                zIndex: 1,
                backdropFilter: 'blur(10px)',
              }}
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              transition={{ delay: 0.12, duration: 0.3 }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = C.gold;
                el.style.color = C.gold;
                el.style.background = C.goldSubtle;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(250, 250, 250, 0.12)';
                el.style.color = C.white;
                el.style.background = 'rgba(250, 250, 250, 0.04)';
              }}
            >
              <CloseIcon size={22} />
            </motion.button>

            <motion.div
              className="search-overlay__container"
              variants={searchContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                width: '100%',
                maxWidth: '660px',
                padding: '0 24px',
              }}
            >
              {/* Search label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                  color: C.whiteGhost,
                }}
              >
                <SearchIcon size={16} />
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '3.5px',
                    textTransform: 'uppercase',
                    fontFamily: FONT.heading,
                    fontWeight: 600,
                  }}
                >
                  Buscar
                </span>
              </div>

              {/* Search input */}
              <div style={{ position: 'relative' }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar gorras, equipos, estilos..."
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid rgba(196, 163, 90, 0.4)`,
                    color: C.white,
                    fontSize: '30px',
                    fontFamily: FONT.heading,
                    fontWeight: 300,
                    letterSpacing: '2px',
                    padding: '18px 0',
                    outline: 'none',
                    caretColor: C.gold,
                    transition: `border-color 0.3s ${EASE_PREMIUM}`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderBottomColor = C.gold;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderBottomColor = 'rgba(196, 163, 90, 0.4)';
                  }}
                  aria-label="Buscar productos"
                />
                {/* Animated glow under input */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
                    opacity: searchQuery.length > 0 ? 0.6 : 0,
                    transition: `opacity 0.3s ${EASE_PREMIUM}`,
                    filter: 'blur(2px)',
                  }}
                />
              </div>

              {/* Search results */}
              <AnimatePresence mode="wait">
                {searchQuery.trim().length >= 2 && searchResults.length > 0 && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    style={{ marginTop: '28px' }}
                  >
                    <p
                      style={{
                        color: C.whiteGhost,
                        fontSize: '10px',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        fontFamily: FONT.heading,
                        fontWeight: 600,
                        marginBottom: '14px',
                      }}
                    >
                      Resultados ({searchResults.length})
                    </p>
                    {searchResults.map((product, index) => (
                      <motion.button
                        key={product.id}
                        onClick={() => handleSearchResultClick(product.slug)}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          width: '100%',
                          background: 'transparent',
                          border: `1px solid transparent`,
                          padding: '12px 12px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: TRANSITION_SMOOTH,
                          marginBottom: '4px',
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          el.style.background = C.whiteHint;
                          el.style.borderColor = C.goldLight;
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget;
                          el.style.background = 'transparent';
                          el.style.borderColor = 'transparent';
                        }}
                      >
                        {/* Thumbnail */}
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            background: C.darkAlt,
                            flexShrink: 0,
                            border: `1px solid ${C.whiteHint}`,
                          }}
                        >
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              color: C.white,
                              fontSize: '15px',
                              fontWeight: 600,
                              fontFamily: FONT.heading,
                              letterSpacing: '0.5px',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {product.name}
                          </span>
                          <span
                            style={{
                              color: C.whiteDim,
                              fontSize: '12px',
                              fontFamily: FONT.body,
                              marginTop: '2px',
                              display: 'block',
                            }}
                          >
                            {product.category?.name}
                          </span>
                        </div>
                        <span
                          style={{
                            background: `linear-gradient(135deg, ${C.gold}, #E8D5A0)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontSize: '15px',
                            fontWeight: 700,
                            fontFamily: FONT.heading,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatCOP(product.basePrice)}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      marginTop: '32px',
                      textAlign: 'center',
                      padding: '24px 0',
                    }}
                  >
                    <p
                      style={{
                        color: C.whiteDim,
                        fontSize: '14px',
                        fontFamily: FONT.body,
                        lineHeight: 1.6,
                      }}
                    >
                      No se encontraron resultados para "<span style={{ color: C.gold }}>{searchQuery}</span>"
                    </p>
                    <p
                      style={{
                        color: C.whiteGhost,
                        fontSize: '12px',
                        fontFamily: FONT.body,
                        marginTop: '8px',
                      }}
                    >
                      Intenta con otro termino de busqueda
                    </p>
                  </motion.div>
                )}

                {searchQuery.trim().length < 2 && (
                  <motion.div
                    key="popular"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    style={{ marginTop: '32px' }}
                  >
                    <p
                      style={{
                        color: C.whiteGhost,
                        fontSize: '10px',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        fontFamily: FONT.heading,
                        fontWeight: 600,
                        marginBottom: '16px',
                      }}
                    >
                      Busquedas populares
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      {POPULAR_SEARCHES.map((term) => (
                        <button
                          key={term}
                          onClick={() => handlePopularSearchClick(term)}
                          style={{
                            background: 'rgba(250, 250, 250, 0.04)',
                            border: `1px solid rgba(250, 250, 250, 0.08)`,
                            color: C.white,
                            fontSize: '13px',
                            fontFamily: FONT.body,
                            fontWeight: 500,
                            padding: '9px 18px',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            transition: TRANSITION_SMOOTH,
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = C.goldSubtle;
                            el.style.borderColor = C.goldMedium;
                            el.style.color = C.gold;
                            el.style.boxShadow = `0 0 16px rgba(196, 163, 90, 0.1)`;
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = 'rgba(250, 250, 250, 0.04)';
                            el.style.borderColor = 'rgba(250, 250, 250, 0.08)';
                            el.style.color = C.white;
                            el.style.boxShadow = 'none';
                          }}
                        >
                          {term}
                        </button>
                      ))}
                    </div>

                    <p
                      style={{
                        color: C.whiteGhost,
                        fontSize: '12px',
                        fontFamily: FONT.body,
                        marginTop: '28px',
                      }}
                    >
                      Presiona{' '}
                      <span
                        style={{
                          color: C.whiteDim,
                          fontWeight: 600,
                          background: C.whiteHint,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          letterSpacing: '0.5px',
                        }}
                      >
                        ESC
                      </span>{' '}
                      para cerrar
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Navigation ── */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* ── Responsive Styles ── */}
      <style>{`
        @media (max-width: 1024px) {
          .header__nav {
            display: none !important;
          }
          .header__hamburger {
            display: flex !important;
          }
          .header__user-btn {
            display: none !important;
          }
          .header__wishlist-btn {
            display: none !important;
          }
          .header__logo-text {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .search-overlay__container input {
            font-size: 22px !important;
            letter-spacing: 1px !important;
          }
        }
        @media (min-width: 1025px) {
          .header__hamburger {
            display: none !important;
          }
        }
        .search-overlay__container input::placeholder {
          color: rgba(250, 250, 250, 0.2);
        }
        /* Premium hover transitions for mega menu images */
        .header__mega-menu img {
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1) !important;
        }
        /* Selection color */
        .header ::selection,
        .search-overlay ::selection {
          background: rgba(196, 163, 90, 0.3);
          color: #FAFAFA;
        }
      `}</style>
    </>
  );
};

export default Header;
