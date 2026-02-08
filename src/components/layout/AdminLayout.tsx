// ============================================================
// PlexifyCaps - AdminLayout Component
// Clean admin layout with sidebar + content area
// ============================================================

import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_ROUTES } from '../../config/routes';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

// ── Component ────────────────────────────────────────────────
const AdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(ADMIN_ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0D0D0D',
        color: '#C4A35A',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: '1.25rem',
        letterSpacing: '0.1em',
      }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(196, 163, 90, 0.2)',
            borderTopColor: '#C4A35A',
            borderRadius: '50%',
            animation: 'admin-spin 0.8s linear infinite',
          }}
        />
        <style>{`
          @keyframes admin-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-layout" style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0D0D0D',
      color: '#FAFAFA',
    }}>
      <Sidebar />

      <div className="admin-layout__content" style={{
        flex: 1,
        marginLeft: '240px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column' as const,
        transition: 'margin-left 0.3s ease',
      }}>
        {/* Main content with page transitions */}
        <main className="admin-layout__main" style={{
          flex: 1,
          padding: '28px',
          overflowY: 'auto' as const,
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .admin-layout__content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
