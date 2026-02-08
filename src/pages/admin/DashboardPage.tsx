import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { getProducts } from '../../data/productDataService';
import { formatCOP } from '../../utils/formatCurrency';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { OrderStatus } from '../../types/order';

// ── Types ─────────────────────────────────────────────────────
interface StoredOrder {
  ref: string;
  items: { name: string; size: string; color: string; quantity: number; price: number; image: string }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  customer: { name: string; email: string; phone: string };
  shipping: { address: string; city: string; department: string };
  date: string;
  status?: string;
  statusHistory?: { status: string; date: string; time: string; description: string }[];
}

const STATUS_COLORS: Record<string, { bg: string; color: string; emoji: string }> = {
  [OrderStatus.PENDING_PAYMENT]: { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', emoji: '\u23F3' },
  [OrderStatus.CONFIRMED]:       { bg: 'rgba(56,161,105,0.15)',  color: '#38A169', emoji: '\u2705' },
  [OrderStatus.PREPARING]:       { bg: 'rgba(196,163,90,0.15)',  color: '#C4A35A', emoji: '\uD83D\uDCE6' },
  [OrderStatus.SHIPPED]:         { bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6', emoji: '\uD83D\uDE9A' },
  [OrderStatus.IN_TRANSIT]:      { bg: 'rgba(14,165,233,0.15)',  color: '#0EA5E9', emoji: '\u2708\uFE0F' },
  [OrderStatus.DELIVERED]:       { bg: 'rgba(34,197,94,0.15)',   color: '#22C55E', emoji: '\uD83C\uDF89' },
  [OrderStatus.CANCELLED]:       { bg: 'rgba(229,62,62,0.15)',   color: '#E53E3E', emoji: '\u274C' },
  [OrderStatus.RETURNED]:        { bg: 'rgba(107,114,128,0.15)', color: '#6B7280', emoji: '\uD83D\uDD04' },
};

// ── Helpers ──────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos dias';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function loadOrders(): StoredOrder[] {
  try {
    const raw = localStorage.getItem('pana_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((o: StoredOrder) => ({
        ...o,
        status: o.status || OrderStatus.CONFIRMED,
      }));
    }
  } catch { /* ignore */ }
  return [];
}

function loadStockValues(): Record<number, number> {
  try {
    const raw = localStorage.getItem('pana_stock');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function getRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  // Handle "8 de feb de 2026" format from toLocaleDateString('es-CO')
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayFormatted = yesterday.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

  if (dateStr === todayFormatted) return 'Hoy';
  if (dateStr === yesterdayFormatted) return 'Ayer';

  // Also check ISO format
  const todayISO = today.toISOString().slice(0, 10);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);
  if (dateStr === todayISO) return 'Hoy';
  if (dateStr === yesterdayISO) return 'Ayer';

  return dateStr;
}

// ── Animations ───────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Component ────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const allProducts = useMemo(() => getProducts(), []);

  // Real data from localStorage
  const orders = useMemo(() => loadOrders(), []);
  const stockValues = useMemo(() => loadStockValues(), []);

  const pendingOrders = useMemo(() =>
    orders.filter(o =>
      o.status === OrderStatus.PENDING_PAYMENT ||
      o.status === OrderStatus.CONFIRMED ||
      o.status === OrderStatus.PREPARING
    ),
    [orders]
  );

  // Customers from localStorage
  const customers = useMemo(() => {
    try {
      const raw = localStorage.getItem('pana_customers');
      if (raw) return JSON.parse(raw) as { id: string; createdAt: string }[];
    } catch { /* ignore */ }
    return [];
  }, []);

  const newCustomersCount = useMemo(() => {
    const dayAgo = Date.now() - 86400000;
    return customers.filter(c => {
      try { return new Date(c.createdAt).getTime() > dayAgo; } catch { return false; }
    }).length;
  }, [customers]);

  // Low stock count: use saved stock values, fallback to mock defaults
  const lowStockCount = useMemo(() => {
    let count = 0;
    allProducts.forEach(p => {
      p.variants.forEach(v => {
        const stock = stockValues[v.id] !== undefined ? stockValues[v.id] : v.stock;
        if (stock < 5) count++;
      });
    });
    return count;
  }, [stockValues]);

  // Calculate real week total from orders
  const weekTotal = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    return orders.reduce((sum, o) => {
      // Exclude cancelled/returned
      if (o.status === OrderStatus.CANCELLED || o.status === OrderStatus.RETURNED) return sum;
      return sum + (o.total || 0);
    }, 0);
  }, [orders]);

  const totalOrders = orders.length;
  const deliveredCount = orders.filter(o => o.status === OrderStatus.DELIVERED).length;

  // Recent 4 orders
  const recentOrders = orders.slice(0, 4);

  // ── Quick Action Cards config ──────────────────────────────
  const quickActions = [
    {
      to: '/admin/pedidos',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
      title: 'Pedidos',
      subtitle: pendingOrders.length > 0
        ? `${pendingOrders.length} necesitan atencion`
        : totalOrders > 0 ? `${totalOrders} pedidos en total` : 'Sin pedidos aun',
      badge: pendingOrders.length > 0 ? String(pendingOrders.length) : null,
      badgeColor: '#F59E0B',
      accent: '#F59E0B',
    },
    {
      to: '/admin/clientes',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      title: 'Clientes',
      subtitle: customers.length > 0
        ? `${customers.length} cliente${customers.length !== 1 ? 's' : ''} registrado${customers.length !== 1 ? 's' : ''}`
        : 'Sin clientes aun',
      badge: newCustomersCount > 0 ? String(newCustomersCount) : null,
      badgeColor: '#38A169',
      accent: '#38A169',
    },
    {
      to: '/admin/productos',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
      title: 'Productos',
      subtitle: `${allProducts.length} productos en tu tienda`,
      badge: null,
      badgeColor: '',
      accent: '#C4A35A',
    },
    {
      to: '/admin/inventario',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      title: 'Inventario',
      subtitle: lowStockCount > 0
        ? `${lowStockCount} con stock bajo`
        : 'Stock saludable',
      badge: lowStockCount > 0 ? String(lowStockCount) : null,
      badgeColor: '#E53E3E',
      accent: lowStockCount > 0 ? '#E53E3E' : '#38A169',
    },
    {
      to: '/admin/configuracion',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
      title: 'Configuracion',
      subtitle: 'Tienda, envios y pagos',
      badge: null,
      badgeColor: '',
      accent: '#8B5CF6',
    },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Welcome Banner ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, rgba(196,163,90,0.1) 0%, rgba(26,26,46,0.5) 100%)',
          border: '1px solid rgba(196,163,90,0.15)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#FAFAFA',
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.5px',
            marginBottom: 6,
          }}>
            {getGreeting()}, {user?.username || 'Admin'}!
          </div>
          <div style={{ fontSize: 14, color: 'rgba(250,250,250,0.45)', fontFamily: "'Inter', sans-serif" }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.4)', fontWeight: 500, letterSpacing: 0.5, marginBottom: 4 }}>
            {totalOrders > 0 ? 'VENTAS TOTALES' : 'VENTAS'}
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            background: weekTotal > 0
              ? 'linear-gradient(135deg, #E8D5A3, #C4A35A)'
              : 'linear-gradient(135deg, rgba(250,250,250,0.3), rgba(250,250,250,0.15))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {formatCOP(weekTotal)}
          </div>
          {totalOrders > 0 && (
            <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', marginTop: 2 }}>
              {totalOrders} pedido{totalOrders !== 1 ? 's' : ''} &middot; {deliveredCount} entregado{deliveredCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Quick Actions — Big Clickable Cards ───────────────── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(250,250,250,0.35)',
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 14,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          Que quieres hacer?
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 36,
      }}>
        {quickActions.map((action, i) => (
          <Link key={action.to} to={action.to} style={{ textDecoration: 'none' }}>
            <motion.div
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'rgba(26,26,46,0.55)',
                border: '1px solid rgba(250,250,250,0.06)',
                borderRadius: 14,
                padding: '24px 22px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: action.accent,
                borderRadius: '14px 14px 0 0',
                opacity: 0.7,
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ color: action.accent, opacity: 0.8 }}>
                  {action.icon}
                </div>
                {action.badge && (
                  <span style={{
                    background: action.badgeColor,
                    color: '#0D0D0D',
                    fontSize: 12,
                    fontWeight: 800,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {action.badge}
                  </span>
                )}
              </div>

              <div style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#FAFAFA',
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.5px',
                marginBottom: 4,
              }}>
                {action.title}
              </div>
              <div style={{
                fontSize: 13,
                color: action.badge ? action.badgeColor : 'rgba(250,250,250,0.4)',
                fontFamily: "'Inter', sans-serif",
                fontWeight: action.badge ? 500 : 400,
              }}>
                {action.subtitle}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* ── Add Product CTA ───────────────────────────────────── */}
      <Link to="/admin/productos/nuevo" style={{ textDecoration: 'none', display: 'block', marginBottom: 36 }}>
        <motion.div
          whileHover={{ scale: 1.01, boxShadow: '0 8px 32px rgba(196,163,90,0.2)' }}
          whileTap={{ scale: 0.99 }}
          style={{
            background: 'linear-gradient(135deg, rgba(196,163,90,0.12), rgba(196,163,90,0.04))',
            border: '1px dashed rgba(196,163,90,0.35)',
            borderRadius: 14,
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'pointer',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #C4A35A, #D4B86A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0D0D0D',
            fontSize: 24,
            fontWeight: 300,
            flexShrink: 0,
          }}>
            +
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#C4A35A', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.5px' }}>
              Agregar Nuevo Producto
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)' }}>
              Sube fotos, precios y variantes de una nueva gorra
            </div>
          </div>
        </motion.div>
      </Link>

      {/* ── Recent Orders (Real from localStorage) ─────────────── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(250,250,250,0.35)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>
            Ultimos pedidos
          </div>
          {orders.length > 0 && (
            <Link to="/admin/pedidos" style={{
              fontSize: 12,
              color: '#C4A35A',
              textDecoration: 'none',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
            }}>
              Ver todos &rarr;
            </Link>
          )}
        </div>
      </div>

      {recentOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'rgba(26,26,46,0.3)',
            border: '1px solid rgba(250,250,250,0.05)',
            borderRadius: 14,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>&#128230;</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(250,250,250,0.5)', marginBottom: 4 }}>
            No hay pedidos aun
          </div>
          <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.3)' }}>
            Los pedidos apareceran aqui cuando los clientes compren
          </div>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {recentOrders.map((order, i) => {
            const status = order.status || OrderStatus.CONFIRMED;
            const st = STATUS_COLORS[status] || STATUS_COLORS[OrderStatus.PENDING_PAYMENT];
            return (
              <motion.div
                key={order.ref}
                custom={i + 4}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Link
                  to="/admin/pedidos"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div
                    style={{
                      background: 'rgba(26,26,46,0.45)',
                      border: '1px solid rgba(250,250,250,0.05)',
                      borderRadius: 12,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease, border-color 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(26,26,46,0.7)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,163,90,0.15)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(26,26,46,0.45)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(250,250,250,0.05)';
                    }}
                  >
                    {/* Status emoji */}
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: st.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}>
                      {st.emoji}
                    </div>

                    {/* Customer + ref */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#FAFAFA',
                        fontFamily: "'Inter', sans-serif",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {order.customer.name}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: 'rgba(250,250,250,0.35)',
                        fontFamily: "'JetBrains Mono', monospace",
                        marginTop: 2,
                      }}>
                        {order.ref}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: st.bg,
                      color: st.color,
                      whiteSpace: 'nowrap',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {ORDER_STATUS_LABELS[status as OrderStatus] || status}
                    </span>

                    {/* Total + date */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#FAFAFA',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {formatCOP(order.total)}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: 'rgba(250,250,250,0.3)',
                        marginTop: 2,
                      }}>
                        {getRelativeDate(order.date)}
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(250,250,250,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Low Stock Alert (real data) ──────────────────────── */}
      {lowStockCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: 28 }}
        >
          <Link to="/admin/inventario" style={{ textDecoration: 'none', display: 'block' }}>
            <div
              style={{
                background: 'rgba(229,62,62,0.06)',
                border: '1px solid rgba(229,62,62,0.2)',
                borderRadius: 14,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(229,62,62,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(229,62,62,0.06)'; }}
            >
              <div style={{ fontSize: 22 }}>{'\u26A0\uFE0F'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E53E3E' }}>
                  {lowStockCount} productos con stock bajo
                </div>
                <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.4)', marginTop: 2 }}>
                  Toca aqui para revisar y reabastecer tu inventario
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
