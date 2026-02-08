// ============================================================
// Pana Rabbids - Layout Component
// Main layout wrapper for all public-facing pages
// Includes: AnnouncementBar, Header, Content, Footer,
//           WhatsApp button, and scroll-to-top
// ============================================================

import { useEffect, useState, useCallback, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import { CartContext } from '../../context/CartContext';

// ── Page transition config ───────────────────────────────────
const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

// ── ScrollToTop: resets scroll on route change ───────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

// ── BackToTop: floating button that appears on scroll ────────
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="back-to-top"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={scrollToTop}
          aria-label="Volver arriba"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(13, 13, 13, 0.9)',
            border: '1px solid rgba(196, 163, 90, 0.3)',
            color: '#C4A35A',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            backdropFilter: 'blur(8px)',
            transition: 'border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#C4A35A';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196, 163, 90, 0.3)';
          }}
        >
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
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ── WhatsAppButton: floating CTA ─────────────────────────────
const WhatsAppButton = () => {
  const WHATSAPP_NUMBER = '573151573329';
  const WHATSAPP_MESSAGE = encodeURIComponent(
    'Hola! Estoy interesado en los productos de Pana Rabbids.'
  );

  return (
    <motion.a
      className="whatsapp-btn"
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactanos por WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#25D366',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
        zIndex: 50,
        textDecoration: 'none',
        border: 'none',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </motion.a>
  );
};

// ── Cart Toast ──────────────────────────────────────────────
const CartToast = () => {
  const cartCtx = useContext(CartContext);
  const msg = cartCtx?.toastMessage || '';

  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            zIndex: 999,
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(196, 163, 90, 0.25)',
            borderRadius: 12,
            padding: '12px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 320,
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(56,161,105,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#FAFAFA',
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.3,
            }}>
              {msg}
            </div>
            <div style={{
              fontSize: 11, color: 'rgba(250,250,250,0.4)',
              fontFamily: "'Inter', sans-serif",
              marginTop: 1,
            }}>
              Agregado al carrito
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Main Layout ──────────────────────────────────────────────
const Layout = () => {
  const { pathname } = useLocation();

  return (
    <div
      className="layout"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0D0D0D',
        color: '#FAFAFA',
      }}
    >
      <ScrollToTop />
      <AnnouncementBar />
      <Header />

      {/* Main content area with top padding for fixed announcement bar (28px) + header (84px) */}
      <main
        className="layout__main"
        style={{
          flex: 1,
          paddingTop: '112px',
          minHeight: '60vh',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppButton />
      <BackToTop />
      <CartToast />
    </div>
  );
};

export default Layout;
