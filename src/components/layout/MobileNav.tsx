// ============================================================
// PlexifyCaps - MobileNav Component
// Full-screen slide-from-left overlay menu for mobile
// Includes navigation links, expandable categories, socials
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PUBLIC_ROUTES, CATEGORIES, catalogCategoryPath } from '../../config/routes';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { useWishlist } from '../../hooks/useWishlist';

// ── Types ──────────────────────────────────────────────────
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Styles ─────────────────────────────────────────────────
const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1999,
  },
  nav: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    maxWidth: '380px',
    background: '#0D0D0D',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
    WebkitOverflowScrolling: 'touch' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(196, 163, 90, 0.15)',
    flexShrink: 0,
  },
  logo: {
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    fontSize: '20px',
    fontWeight: 800,
    color: '#C4A35A',
    textTransform: 'uppercase' as const,
    letterSpacing: '2.5px',
    textDecoration: 'none',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#FAFAFA',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
  },
  links: {
    flex: 1,
    padding: '16px 0',
  },
  linkItem: {
    display: 'block',
    textDecoration: 'none',
    color: '#FAFAFA',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s ease',
  },
  linkItemActive: {
    color: '#C4A35A',
    borderLeftColor: '#C4A35A',
    background: 'rgba(196, 163, 90, 0.05)',
  },
  categoryToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#FAFAFA',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
  },
  categoryList: {
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  categoryItem: {
    display: 'block',
    textDecoration: 'none',
    color: 'rgba(250, 250, 250, 0.7)',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    padding: '12px 24px 12px 40px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'color 0.2s ease',
  },
  socialSection: {
    padding: '24px',
    borderTop: '1px solid rgba(196, 163, 90, 0.15)',
    flexShrink: 0,
  },
  socialTitle: {
    color: 'rgba(250, 250, 250, 0.4)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    marginBottom: '16px',
  },
  socialLinks: {
    display: 'flex',
    gap: '16px',
  },
  socialLink: {
    color: '#FAFAFA',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
    letterSpacing: '1px',
    padding: '8px 16px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
} as const;

// ── Animation Variants ─────────────────────────────────────
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const navVariants = {
  hidden: { x: '-100%' },
  visible: {
    x: 0,
    transition: {
      type: 'tween',
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
      when: 'beforeChildren',
      staggerChildren: 0.04,
    },
  },
  exit: {
    x: '-100%',
    transition: {
      type: 'tween',
      duration: 0.3,
      ease: [0.55, 0.06, 0.68, 0.19],
    },
  },
};

const linkVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.25 } },
};

// ── Chevron Icon ───────────────────────────────────────────
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.2 }}
  >
    <path d="M3 5L7 9L11 5" />
  </motion.svg>
);

// ── Component ──────────────────────────────────────────────
const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  const location = useLocation();
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const { customer, isAuthenticated: isCustomerLoggedIn, logout: customerLogout } = useCustomerAuth();
  const { wishlistCount } = useWishlist();

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // Only trigger on pathname change, not onClose/isOpen to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === PUBLIC_ROUTES.HOME) return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="mobile-nav__overlay"
            style={styles.overlay}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Nav panel */}
          <motion.nav
            className="mobile-nav"
            style={styles.nav}
            variants={navVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="navigation"
            aria-label="Menu de navegacion movil"
          >
            {/* Header */}
            <div className="mobile-nav__header" style={styles.header}>
              <Link to={PUBLIC_ROUTES.HOME} style={styles.logo} onClick={onClose}>
                PLEXIFYCAPS
              </Link>
              <button
                style={styles.closeButton}
                onClick={onClose}
                aria-label="Cerrar menu"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <div className="mobile-nav__links" style={styles.links}>
              <motion.div variants={linkVariants}>
                <Link
                  to={PUBLIC_ROUTES.HOME}
                  style={{
                    ...styles.linkItem,
                    ...(isActive(PUBLIC_ROUTES.HOME) ? styles.linkItemActive : {}),
                  }}
                  onClick={onClose}
                >
                  Inicio
                </Link>
              </motion.div>

              {/* Catalog with expandable categories */}
              <motion.div variants={linkVariants}>
                <button
                  style={{
                    ...styles.categoryToggle,
                    ...(isActive(PUBLIC_ROUTES.CATALOG) ? { color: '#C4A35A' } : {}),
                  }}
                  onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                  aria-expanded={isCategoriesExpanded}
                >
                  <span>Catalogo</span>
                  <ChevronIcon isOpen={isCategoriesExpanded} />
                </button>

                <AnimatePresence>
                  {isCategoriesExpanded && (
                    <motion.div
                      style={styles.categoryList}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <Link
                        to={PUBLIC_ROUTES.CATALOG}
                        style={{
                          ...styles.categoryItem,
                          color: '#C4A35A',
                          fontWeight: 600,
                        }}
                        onClick={onClose}
                      >
                        Ver Todo
                      </Link>
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={catalogCategoryPath(cat.slug)}
                          style={styles.categoryItem}
                          onClick={onClose}
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={linkVariants}>
                <Link
                  to={PUBLIC_ROUTES.ABOUT}
                  style={{
                    ...styles.linkItem,
                    ...(isActive(PUBLIC_ROUTES.ABOUT) ? styles.linkItemActive : {}),
                  }}
                  onClick={onClose}
                >
                  Nosotros
                </Link>
              </motion.div>

              <motion.div variants={linkVariants}>
                <Link
                  to={PUBLIC_ROUTES.CONTACT}
                  style={{
                    ...styles.linkItem,
                    ...(isActive(PUBLIC_ROUTES.CONTACT) ? styles.linkItemActive : {}),
                  }}
                  onClick={onClose}
                >
                  Contacto
                </Link>
              </motion.div>

              <motion.div variants={linkVariants}>
                <Link
                  to={PUBLIC_ROUTES.TRACKING}
                  style={{
                    ...styles.linkItem,
                    ...(isActive(PUBLIC_ROUTES.TRACKING) ? styles.linkItemActive : {}),
                  }}
                  onClick={onClose}
                >
                  Seguimiento de Pedido
                </Link>
              </motion.div>

              {/* Auth section divider */}
              <div style={{ height: '1px', background: 'rgba(196,163,90,0.12)', margin: '8px 24px' }} />

              {isCustomerLoggedIn ? (
                <>
                  <motion.div variants={linkVariants}>
                    <Link
                      to="/mi-cuenta"
                      style={{
                        ...styles.linkItem,
                        ...(isActive('/mi-cuenta') && !location.pathname.includes('pedidos') && !location.pathname.includes('favoritos') ? styles.linkItemActive : {}),
                      }}
                      onClick={onClose}
                    >
                      Mi Cuenta
                      <span style={{ fontSize: '11px', color: 'rgba(250,250,250,0.4)', marginLeft: '8px', fontWeight: 400, letterSpacing: '0.5px', textTransform: 'none' }}>
                        {customer?.firstName}
                      </span>
                    </Link>
                  </motion.div>
                  <motion.div variants={linkVariants}>
                    <Link
                      to="/mi-cuenta/pedidos"
                      style={{
                        ...styles.linkItem,
                        ...(location.pathname.includes('/mi-cuenta/pedidos') ? styles.linkItemActive : {}),
                      }}
                      onClick={onClose}
                    >
                      Mis Pedidos
                    </Link>
                  </motion.div>
                  <motion.div variants={linkVariants}>
                    <Link
                      to="/mi-cuenta/favoritos"
                      style={{
                        ...styles.linkItem,
                        ...(location.pathname.includes('/mi-cuenta/favoritos') ? styles.linkItemActive : {}),
                      }}
                      onClick={onClose}
                    >
                      Favoritos
                      {wishlistCount > 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', color: '#C4A35A', fontWeight: 700 }}>
                          ({wishlistCount})
                        </span>
                      )}
                    </Link>
                  </motion.div>
                  <motion.div variants={linkVariants}>
                    <button
                      style={{
                        ...styles.categoryToggle,
                        color: '#ef4444',
                      }}
                      onClick={() => { customerLogout(); onClose(); }}
                    >
                      Cerrar Sesión
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div variants={linkVariants}>
                    <Link
                      to="/login"
                      style={{
                        ...styles.linkItem,
                        color: '#C4A35A',
                      }}
                      onClick={onClose}
                    >
                      Iniciar Sesión
                    </Link>
                  </motion.div>
                  <motion.div variants={linkVariants}>
                    <Link
                      to="/registro"
                      style={styles.linkItem}
                      onClick={onClose}
                    >
                      Registrarse
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Social section */}
            <div className="mobile-nav__social" style={styles.socialSection}>
              <p style={styles.socialTitle}>Siguenos</p>
              <div style={styles.socialLinks}>
                <a
                  href="https://instagram.com/plexifycaps"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialLink}
                >
                  Instagram
                </a>
                <a
                  href="https://tiktok.com/@plexifycaps"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialLink}
                >
                  TikTok
                </a>
                <a
                  href="https://facebook.com/plexifycaps"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialLink}
                >
                  Facebook
                </a>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
