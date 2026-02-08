// ============================================================
// Pana Rabbids - Admin Sidebar (Simplified & User-Friendly)
// Clean navigation with clear labels and friendly design
// ============================================================

import { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_ROUTES } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';

// ── Navigation Items ─────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: 'Inicio',
    desc: 'Resumen general',
    path: ADMIN_ROUTES.DASHBOARD,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    end: true,
  },
  {
    label: 'Mis Productos',
    desc: 'Agregar y editar gorras',
    path: ADMIN_ROUTES.PRODUCTS,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    end: false,
  },
  {
    label: 'Pedidos',
    desc: 'Ver y gestionar ventas',
    path: ADMIN_ROUTES.ORDERS,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    end: false,
  },
  {
    label: 'Clientes',
    desc: 'Ver y gestionar clientes',
    path: ADMIN_ROUTES.CUSTOMERS,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    end: false,
  },
  {
    label: 'Inventario',
    desc: 'Stock y disponibilidad',
    path: ADMIN_ROUTES.STOCK,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    end: false,
  },
  {
    label: 'Ajustes',
    desc: 'Tienda, envios y pagos',
    path: ADMIN_ROUTES.SETTINGS,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    end: false,
  },
] as const;

// ── Component ────────────────────────────────────────────────
const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    if (logout) logout();
    navigate(ADMIN_ROUTES.LOGIN);
  }, [navigate, logout]);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="sidebar__mobile-toggle"
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 101,
          background: '#111118',
          border: '1px solid rgba(196, 163, 90, 0.2)',
          borderRadius: 10,
          color: '#FAFAFA',
          cursor: 'pointer',
          padding: 10,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? 'Cerrar menu' : 'Abrir menu'}
      >
        {isMobileOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="sidebar__overlay"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 240,
          background: '#0E0E14',
          borderRight: '1px solid rgba(250,250,250,0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform 0.3s ease',
        }}
        role="navigation"
        aria-label="Menu del panel"
      >
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(250,250,250,0.05)' }}>
          <NavLink to={ADMIN_ROUTES.DASHBOARD} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(196,163,90,0.12)',
              border: '1px solid rgba(196,163,90,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C4A35A',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 1,
              flexShrink: 0,
            }}>
              PR
            </div>
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: '#C4A35A',
                letterSpacing: 2,
              }}>
                PANA RABBIDS
              </div>
              <div style={{
                fontSize: 10,
                color: 'rgba(250,250,250,0.3)',
                fontWeight: 500,
                letterSpacing: 0.5,
              }}>
                Panel de administracion
              </div>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
                padding: '11px 14px',
                borderRadius: 10,
                marginBottom: 2,
                transition: 'all 0.2s ease',
                background: isActive ? 'rgba(196,163,90,0.1)' : 'transparent',
                color: isActive ? '#C4A35A' : 'rgba(250,250,250,0.55)',
                borderLeft: isActive ? '3px solid #C4A35A' : '3px solid transparent',
              })}
              onClick={() => setIsMobileOpen(false)}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.5, marginTop: 1 }}>
                  {item.desc}
                </div>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: View store + Logout */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(250,250,250,0.05)' }}>
          {/* View store link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              padding: '10px 12px',
              borderRadius: 8,
              color: 'rgba(250,250,250,0.45)',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.2s ease',
              marginBottom: 6,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C4A35A'; (e.currentTarget as HTMLElement).style.background = 'rgba(196,163,90,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Ver mi tienda
          </a>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              borderRadius: 8,
              color: 'rgba(250,250,250,0.4)',
              fontSize: 13,
              fontWeight: 500,
              padding: '10px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; (e.currentTarget as HTMLElement).style.background = 'rgba(229,62,62,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar {
            transform: ${isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
          .sidebar__mobile-toggle {
            display: flex !important;
          }
        }
        @media (min-width: 1025px) {
          .sidebar__mobile-toggle {
            display: none !important;
          }
          .sidebar__overlay {
            display: none !important;
          }
        }
        .sidebar__nav-item:hover:not(.sidebar__nav-item--active) {
          background: rgba(250, 250, 250, 0.03) !important;
          color: rgba(250,250,250,0.8) !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
