import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { useWishlist } from '../../hooks/useWishlist';
import { getCustomerOrders } from '../../services/customerAuthService';
import { PRODUCTS } from '../../data/mockProducts';
import { COLOMBIAN_DEPARTMENTS, COLOMBIAN_CITIES, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import type { Order } from '../../types/order';
import ProductCard from '../../components/products/ProductCard';
import { SEOHead } from '../../components/common';

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

type TabKey = 'cuenta' | 'pedidos' | 'favoritos';

const tabConfig: { key: TabKey; label: string; path: string }[] = [
  { key: 'cuenta', label: 'Mi Cuenta', path: '/mi-cuenta' },
  { key: 'pedidos', label: 'Mis Pedidos', path: '/mi-cuenta/pedidos' },
  { key: 'favoritos', label: 'Mis Favoritos', path: '/mi-cuenta/favoritos' },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, isAuthenticated, isLoading, logout, updateProfile, error, clearError } = useCustomerAuth();
  const { wishlistIds } = useWishlist();

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname]);

  const activeTab: TabKey = location.pathname.includes('/pedidos')
    ? 'pedidos'
    : location.pathname.includes('/favoritos')
      ? 'favoritos'
      : 'cuenta';

  if (isLoading || !customer) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(250,250,250,0.4)', fontFamily: "'Inter', sans-serif" }}>Cargando...</div>
      </div>
    );
  }

  return (
    <>
    <SEOHead
      title="Mi Cuenta"
      description="Gestiona tu cuenta PlexifyCaps. Edita tu perfil, revisa pedidos y favoritos."
    />
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
      <h1
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: '32px',
          color: '#C4A35A',
          textTransform: 'uppercase',
          letterSpacing: '2.5px',
          marginBottom: '28px',
        }}
      >
        Mi Cuenta
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '32px',
          borderBottom: '1px solid rgba(196,163,90,0.15)',
          paddingBottom: '0',
        }}
      >
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #C4A35A' : '2px solid transparent',
              color: activeTab === tab.key ? '#C4A35A' : 'rgba(250,250,250,0.5)',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              transition: `all 0.3s ${EASE}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'cuenta' && (
          <motion.div key="cuenta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <AccountTab
              customer={customer}
              onUpdate={updateProfile}
              onLogout={() => { logout(); navigate('/'); }}
              error={error}
              clearError={clearError}
            />
          </motion.div>
        )}
        {activeTab === 'pedidos' && (
          <motion.div key="pedidos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <OrdersTab email={customer.email} />
          </motion.div>
        )}
        {activeTab === 'favoritos' && (
          <motion.div key="favoritos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <WishlistTab wishlistIds={wishlistIds} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

// ── Account Tab ────────────────────────────────────────────────────

interface AccountTabProps {
  customer: NonNullable<ReturnType<typeof useCustomerAuth>['customer']>;
  onUpdate: (data: Record<string, string>) => Promise<void>;
  onLogout: () => void;
  error: string | null;
  clearError: () => void;
}

function AccountTab({ customer, onUpdate, onLogout, error, clearError }: AccountTabProps) {
  const [form, setForm] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    address: customer.address,
    department: customer.department,
    city: customer.city,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const cities = form.department ? COLOMBIAN_CITIES[form.department] || [] : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    clearError();
    setSaved(false);
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'department') next.city = '';
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // error handled by context
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(196,163,90,0.2)',
    borderRadius: '8px',
    color: '#FAFAFA',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: `all 0.3s ${EASE}`,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    color: 'rgba(250,250,250,0.6)',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
  };

  return (
    <div
      style={{
        background: 'rgba(26, 26, 46, 0.45)',
        borderRadius: '12px',
        border: '1px solid rgba(196,163,90,0.1)',
        padding: '32px',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(250,250,250,0.4)', fontFamily: "'Inter', sans-serif" }}>
          Correo: {customer.email}
        </span>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#f87171', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {saved && (
        <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#4ade80', fontSize: '13px' }}>
          Perfil actualizado correctamente.
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Apellido</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>Teléfono</label>
          <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>Dirección</label>
          <input name="address" value={form.address} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={labelStyle}>Departamento</label>
            <select name="department" value={form.department} onChange={handleChange} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4A35A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
              <option value="" style={{ background: '#1A1A2E', color: '#FAFAFA' }}>Seleccionar</option>
              {COLOMBIAN_DEPARTMENTS.map((d) => (
                <option key={d} value={d} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <select name="city" value={form.city} onChange={handleChange} disabled={!form.department} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4A35A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px', opacity: form.department ? 1 : 0.5 }}>
              <option value="" style={{ background: '#1A1A2E', color: '#FAFAFA' }}>Seleccionar</option>
              {cities.map((c) => (
                <option key={c} value={c} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 32px',
              background: saving ? 'rgba(196,163,90,0.4)' : '#C4A35A',
              color: '#0D0D0D',
              border: 'none',
              borderRadius: '8px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: `all 0.3s ${EASE}`,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>

          <button
            type="button"
            onClick={onLogout}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              transition: `all 0.3s ${EASE}`,
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Orders Tab ─────────────────────────────────────────────────────

function OrdersTab({ email }: { email: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    setOrders(getCustomerOrders(email));
  }, [email]);

  if (orders.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'rgba(250,250,250,0.4)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>&#128230;</div>
        <p style={{ marginBottom: '16px' }}>No tienes pedidos todavía.</p>
        <Link
          to="/catalogo"
          style={{
            color: '#C4A35A',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {orders.map((order) => {
        const isExpanded = expandedId === order.id;
        const statusColor = ORDER_STATUS_COLORS[order.status] || '#888';
        const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;

        return (
          <div
            key={order.id}
            style={{
              background: 'rgba(26, 26, 46, 0.45)',
              borderRadius: '12px',
              border: '1px solid rgba(196,163,90,0.1)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'transparent',
                border: 'none',
                color: '#FAFAFA',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>#{order.referenceCode}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: `${statusColor}22`,
                    color: statusColor,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {statusLabel}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '14px', color: '#C4A35A' }}>
                  ${order.total.toLocaleString('es-CO')}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(250,250,250,0.4)' }}>
                  {new Date(order.createdAt).toLocaleDateString('es-CO')}
                </span>
                <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', fontSize: '12px' }}>
                  &#9660;
                </span>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(196,163,90,0.08)' }}>
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 0',
                          borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          fontSize: '13px',
                          color: 'rgba(250,250,250,0.7)',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <span>{item.productName} — {item.variantName} x{item.quantity}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                          ${item.totalPrice.toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(196,163,90,0.12)' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(250,250,250,0.5)' }}>
                        {order.shippingAddress}, {order.shippingCity}
                      </span>
                      {order.trackingCode && (
                        <Link
                          to={`/rastreo/${order.referenceCode}`}
                          style={{ fontSize: '12px', color: '#C4A35A', textDecoration: 'none', fontWeight: 600 }}
                        >
                          Rastrear pedido
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── Wishlist Tab ────────────────────────────────────────────────────

function WishlistTab({ wishlistIds }: { wishlistIds: number[] }) {
  const products = useMemo(
    () => PRODUCTS.filter((p) => wishlistIds.includes(p.id)),
    [wishlistIds]
  );

  if (products.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'rgba(250,250,250,0.4)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>&#9825;</div>
        <p style={{ marginBottom: '16px' }}>No tienes favoritos todavía.</p>
        <Link
          to="/catalogo"
          style={{
            color: '#C4A35A',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '24px',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProfilePage;
