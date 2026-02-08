// ============================================================
// Pana Rabbids - Orders Page (Admin)
// Real orders from localStorage with full status management
// and inline editing of order details
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCOP } from '../../utils/formatCurrency';
import { formatPhone } from '../../utils/helpers';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { OrderStatus } from '../../types/order';
import type { Order } from '../../types/order';
import { notifyOrderStatusChanged } from '../../services/notificationService';

interface StoredOrder {
  ref: string;
  items: { name: string; size: string; color: string; quantity: number; price: number; image: string }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  customer: { name: string; email: string; phone: string };
  shipping: { address: string; city: string; department: string };
  date: string;
  status: string;
  statusHistory: { status: string; date: string; time: string; description: string }[];
}

const STATUS_COLORS: Record<string, { bg: string; color: string; emoji: string }> = {
  [OrderStatus.PENDING_PAYMENT]: { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF', emoji: '\u23F3' },
  [OrderStatus.CONFIRMED]: { bg: 'rgba(56,161,105,0.12)', color: '#38A169', emoji: '\u2705' },
  [OrderStatus.PREPARING]: { bg: 'rgba(196,163,90,0.12)', color: '#C4A35A', emoji: '\uD83D\uDCE6' },
  [OrderStatus.SHIPPED]: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', emoji: '\uD83D\uDE9A' },
  [OrderStatus.IN_TRANSIT]: { bg: 'rgba(14,165,233,0.12)', color: '#0EA5E9', emoji: '\u2708\uFE0F' },
  [OrderStatus.DELIVERED]: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', emoji: '\uD83C\uDF89' },
  [OrderStatus.CANCELLED]: { bg: 'rgba(229,62,62,0.12)', color: '#E53E3E', emoji: '\u274C' },
  [OrderStatus.RETURNED]: { bg: 'rgba(107,114,128,0.12)', color: '#6B7280', emoji: '\u21A9\uFE0F' },
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'Esperando confirmacion del pago.',
  [OrderStatus.CONFIRMED]: 'Pedido recibido y pago confirmado.',
  [OrderStatus.PREPARING]: 'Pedido en preparacion.',
  [OrderStatus.SHIPPED]: 'Pedido entregado a la transportadora.',
  [OrderStatus.IN_TRANSIT]: 'Pedido en camino hacia la direccion del cliente.',
  [OrderStatus.DELIVERED]: 'Pedido entregado exitosamente.',
  [OrderStatus.CANCELLED]: 'Pedido cancelado.',
  [OrderStatus.RETURNED]: 'Pedido devuelto.',
};

const ALL_STATUSES = Object.values(OrderStatus);

function loadOrders(): StoredOrder[] {
  try {
    const raw = localStorage.getItem('pana_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((o: StoredOrder) => ({
        ...o,
        status: o.status || OrderStatus.CONFIRMED,
        statusHistory: o.statusHistory || [
          { status: OrderStatus.CONFIRMED, date: o.date || '', time: '', description: 'Pedido recibido y pago confirmado.' },
        ],
      }));
    }
  } catch { /* ignore */ }
  return [];
}

function saveOrders(orders: StoredOrder[]) {
  localStorage.setItem('pana_orders', JSON.stringify(orders));
}

function safePrice(price: number | undefined | null, quantity: number): string {
  const p = typeof price === 'number' && !isNaN(price) ? price : 0;
  const q = typeof quantity === 'number' && !isNaN(quantity) ? quantity : 1;
  return formatCOP(p * q);
}

function safeTotal(total: number | undefined | null): string {
  const t = typeof total === 'number' && !isNaN(total) ? total : 0;
  return formatCOP(t);
}

// Recalculate order totals from items
function recalcTotals(items: StoredOrder['items'], shippingCost: number) {
  const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
  return { subtotal, total: subtotal + shippingCost };
}

// ── Inline edit input style ──────────────────────────────────
const editInputStyle: React.CSSProperties = {
  padding: '6px 10px', background: 'rgba(250,250,250,0.06)',
  border: '1px solid rgba(196,163,90,0.25)', borderRadius: 6, color: '#FAFAFA',
  fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box',
  fontFamily: "'Inter', sans-serif",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>(loadOrders);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [expandedRef, setExpandedRef] = useState<string | null>(null);
  const [showToast, setShowToast] = useState('');

  // Editing state
  const [editingRef, setEditingRef] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    customerName: string; customerEmail: string; customerPhone: string;
    address: string; city: string; department: string;
    items: { name: string; quantity: number; price: number }[];
  } | null>(null);

  const startEditing = useCallback((order: StoredOrder) => {
    setEditingRef(order.ref);
    setEditForm({
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      address: order.shipping.address,
      city: order.shipping.city,
      department: order.shipping.department,
      items: order.items.map(it => ({ name: it.name, quantity: it.quantity, price: it.price })),
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingRef(null);
    setEditForm(null);
  }, []);

  const saveEditing = useCallback(() => {
    if (!editingRef || !editForm) return;

    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.ref !== editingRef) return o;
        const updatedItems = o.items.map((it, idx) => ({
          ...it,
          name: editForm.items[idx]?.name ?? it.name,
          quantity: editForm.items[idx]?.quantity ?? it.quantity,
          price: editForm.items[idx]?.price ?? it.price,
        }));
        const { subtotal, total } = recalcTotals(updatedItems, o.shippingCost);
        return {
          ...o,
          customer: { name: editForm.customerName, email: editForm.customerEmail, phone: editForm.customerPhone },
          shipping: { address: editForm.address, city: editForm.city, department: editForm.department },
          items: updatedItems,
          subtotal,
          total,
        };
      });
      saveOrders(updated);
      return updated;
    });

    setEditingRef(null);
    setEditForm(null);
    setShowToast('Pedido actualizado exitosamente');
    setTimeout(() => setShowToast(''), 2500);
  }, [editingRef, editForm]);

  const updateOrderStatus = useCallback((ref: string, newStatus: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });

    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.ref !== ref) return o;
        return {
          ...o,
          status: newStatus,
          statusHistory: [
            ...o.statusHistory,
            { status: newStatus, date: dateStr, time: timeStr, description: STATUS_DESCRIPTIONS[newStatus] || '' },
          ],
        };
      });
      saveOrders(updated);
      return updated;
    });

    // Fire notification (fire-and-forget)
    try {
      const order = orders.find((o) => o.ref === ref);
      if (order) {
        const notifOrder: Order = {
          id: Date.now(),
          referenceCode: order.ref,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          customerPhone: order.customer.phone,
          shippingAddress: order.shipping.address,
          shippingCity: order.shipping.city,
          shippingDepartment: order.shipping.department,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          total: order.total,
          status: newStatus as OrderStatus,
          paymentMethod: 'Wompi',
          trackingCode: null,
          notes: null,
          items: order.items.map((it, i) => ({
            id: i + 1,
            orderId: Date.now(),
            variantId: 0,
            productName: it.name,
            variantName: `${it.color} / ${it.size}`,
            quantity: it.quantity,
            unitPrice: it.price,
            totalPrice: it.price * it.quantity,
          })),
          createdAt: order.date,
          updatedAt: new Date().toISOString(),
        };
        notifyOrderStatusChanged(notifOrder, newStatus as OrderStatus);
      }
    } catch { /* ignore */ }

    setShowToast(`Estado actualizado a "${ORDER_STATUS_LABELS[newStatus as OrderStatus] || newStatus}"`);
    setTimeout(() => setShowToast(''), 2500);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === '' || o.status === statusFilter;
      const matchesSearch = !search || o.ref.toLowerCase().includes(search.toLowerCase()) || o.customer.name.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 1000,
              background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(56,161,105,0.3)',
              borderRadius: 12, padding: '12px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>&#9989;</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', margin: 0, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
          Pedidos
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(250,250,250,0.4)', margin: '4px 0 0' }}>
          {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
        </p>
      </div>

      {/* Empty state if no orders */}
      {orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(250,250,250,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#128230;</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'rgba(250,250,250,0.5)' }}>No hay pedidos aun</div>
          <div style={{ fontSize: 13 }}>Los pedidos apareceran aqui cuando los clientes compren</div>
        </div>
      )}

      {orders.length > 0 && (
        <>
          {/* Status Filter Chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <button
              onClick={() => setStatusFilter('')}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: statusFilter === '' ? 'rgba(250,250,250,0.15)' : 'rgba(250,250,250,0.04)',
                color: statusFilter === '' ? '#FAFAFA' : 'rgba(250,250,250,0.5)',
                transition: 'all 0.2s',
              }}
            >
              Todos ({orders.length})
            </button>
            {Object.entries(statusCounts).map(([status, count]) => {
              const s = STATUS_COLORS[status] || STATUS_COLORS[OrderStatus.PENDING_PAYMENT];
              const isSelected = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(isSelected ? '' : status)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: isSelected ? s.color : s.bg,
                    color: isSelected ? '#0D0D0D' : s.color,
                    transition: 'all 0.2s',
                  }}
                >
                  {s.emoji} {ORDER_STATUS_LABELS[status as OrderStatus] || status} ({count})
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(250,250,250,0.3)" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por referencia o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px 11px 40px', background: 'rgba(250,250,250,0.04)',
                border: '1px solid rgba(250,250,250,0.08)', borderRadius: 10, color: '#FAFAFA',
                fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            />
          </div>

          {/* Order Cards */}
          <div style={{ display: 'grid', gap: 10 }}>
            {filteredOrders.map((order, i) => {
              const badge = STATUS_COLORS[order.status] || STATUS_COLORS[OrderStatus.PENDING_PAYMENT];
              const isExpanded = expandedRef === order.ref;
              const isEditing = editingRef === order.ref;
              const availableStatuses = ALL_STATUSES.filter(s => s !== order.status);

              return (
                <motion.div
                  key={order.ref}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    background: 'rgba(250,250,250,0.03)',
                    border: `1px solid ${isExpanded ? 'rgba(196,163,90,0.15)' : 'rgba(250,250,250,0.06)'}`,
                    borderRadius: 12, overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Order row */}
                  <div
                    onClick={() => { if (!isEditing) setExpandedRef(isExpanded ? null : order.ref); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', cursor: isEditing ? 'default' : 'pointer',
                    }}
                    onMouseEnter={(e) => { if (!isExpanded && !isEditing) (e.currentTarget as HTMLElement).style.background = 'rgba(250,250,250,0.05)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {/* Status Emoji */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: badge.bg, fontSize: 18, flexShrink: 0,
                    }}>
                      {badge.emoji}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>{order.customer.name}</span>
                        <span style={{ fontSize: 10, color: 'rgba(250,250,250,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>{order.ref}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.4)', marginTop: 2 }}>
                        {order.items.map(it => it.name).join(', ')} - {order.date}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                      background: badge.bg, color: badge.color, whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status}
                    </span>

                    {/* Total */}
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: '#C4A35A',
                      fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                    }}>
                      {safeTotal(order.total)}
                    </div>

                    {/* Arrow */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(250,250,250,0.2)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(250,250,250,0.04)' }}>
                          {/* Items */}
                          <div style={{ marginTop: 14, marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(250,250,250,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                              PRODUCTOS
                            </div>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: idx < order.items.length - 1 ? 8 : 0 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: 'rgba(13,13,13,0.5)', flexShrink: 0 }}>
                                  {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                {isEditing && editForm ? (
                                  <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input
                                      value={editForm.items[idx]?.name ?? item.name}
                                      onChange={(e) => {
                                        const items = [...editForm.items];
                                        items[idx] = { ...items[idx], name: e.target.value };
                                        setEditForm({ ...editForm, items });
                                      }}
                                      style={{ ...editInputStyle, flex: 1 }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', flexShrink: 0 }}>x</span>
                                    <input
                                      type="number"
                                      min="1"
                                      value={editForm.items[idx]?.quantity ?? item.quantity}
                                      onChange={(e) => {
                                        const items = [...editForm.items];
                                        items[idx] = { ...items[idx], quantity: Math.max(1, parseInt(e.target.value) || 1) };
                                        setEditForm({ ...editForm, items });
                                      }}
                                      style={{ ...editInputStyle, width: 50, textAlign: 'center' }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', flexShrink: 0 }}>$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={editForm.items[idx]?.price ?? item.price}
                                      onChange={(e) => {
                                        const items = [...editForm.items];
                                        items[idx] = { ...items[idx], price: Math.max(0, parseInt(e.target.value) || 0) };
                                        setEditForm({ ...editForm, items });
                                      }}
                                      style={{ ...editInputStyle, width: 90, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div style={{ flex: 1, fontSize: 13, color: 'rgba(250,250,250,0.6)' }}>
                                      {item.name} <span style={{ color: 'rgba(250,250,250,0.3)' }}>({item.size} / {item.color} x{item.quantity})</span>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace" }}>
                                      {safePrice(item.price, item.quantity)}
                                    </span>
                                  </>
                                )}
                              </div>
                            ))}

                            {/* Order totals */}
                            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(250,250,250,0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 12, color: 'rgba(250,250,250,0.4)' }}>Subtotal</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace" }}>{safeTotal(order.subtotal)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 12, color: 'rgba(250,250,250,0.4)' }}>Envio</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: order.shippingCost === 0 ? '#38A169' : '#FAFAFA', fontFamily: "'JetBrains Mono', monospace" }}>
                                  {order.shippingCost === 0 ? 'GRATIS' : safeTotal(order.shippingCost)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid rgba(196,163,90,0.15)' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA' }}>Total</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace" }}>{safeTotal(order.total)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Customer & Shipping */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                            <div style={{ padding: 12, background: 'rgba(250,250,250,0.02)', borderRadius: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(250,250,250,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>CLIENTE</div>
                              {isEditing && editForm ? (
                                <div style={{ display: 'grid', gap: 6 }}>
                                  <input
                                    value={editForm.customerName}
                                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                                    placeholder="Nombre"
                                    style={editInputStyle}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <input
                                    value={editForm.customerEmail}
                                    onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })}
                                    placeholder="Email"
                                    style={editInputStyle}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <input
                                    value={editForm.customerPhone}
                                    onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                                    placeholder="Telefono"
                                    style={editInputStyle}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              ) : (
                                <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.6)', lineHeight: 1.5 }}>
                                  {order.customer.name}<br />{order.customer.email}<br />{formatPhone(order.customer.phone)}
                                </div>
                              )}
                            </div>
                            <div style={{ padding: 12, background: 'rgba(250,250,250,0.02)', borderRadius: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(250,250,250,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>ENVIO</div>
                              {isEditing && editForm ? (
                                <div style={{ display: 'grid', gap: 6 }}>
                                  <input
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    placeholder="Direccion"
                                    style={editInputStyle}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <input
                                    value={editForm.city}
                                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                    placeholder="Ciudad"
                                    style={editInputStyle}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <input
                                    value={editForm.department}
                                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                    placeholder="Departamento"
                                    style={editInputStyle}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              ) : (
                                <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.6)', lineHeight: 1.5 }}>
                                  {order.shipping.address}<br />{order.shipping.city}, {order.shipping.department}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Edit / Save buttons */}
                          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); saveEditing(); }}
                                  style={{
                                    padding: '8px 18px', borderRadius: 8, border: 'none',
                                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #C4A35A, #D4B86A)',
                                    color: '#0D0D0D', transition: 'all 0.2s',
                                  }}
                                >
                                  Guardar Cambios
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); cancelEditing(); }}
                                  style={{
                                    padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(250,250,250,0.1)',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    background: 'transparent', color: 'rgba(250,250,250,0.5)',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); startEditing(order); }}
                                style={{
                                  padding: '8px 18px', borderRadius: 8, border: 'none',
                                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                  background: 'rgba(196,163,90,0.12)', color: '#C4A35A',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,163,90,0.22)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,163,90,0.12)'; }}
                              >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  Editar Pedido
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Status History */}
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(250,250,250,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                              HISTORIAL
                            </div>
                            {order.statusHistory.map((h, idx) => {
                              const hBadge = STATUS_COLORS[h.status] || STATUS_COLORS[OrderStatus.CONFIRMED];
                              return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: idx < order.statusHistory.length - 1 ? 8 : 0 }}>
                                  <div style={{
                                    width: 8, height: 8, borderRadius: '50%', background: hBadge.color, flexShrink: 0, marginTop: 4,
                                  }} />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: hBadge.color }}>
                                        {ORDER_STATUS_LABELS[h.status as OrderStatus] || h.status}
                                      </span>
                                      <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>
                                        {h.date}{h.time ? ` - ${h.time}` : ''}
                                      </span>
                                    </div>
                                    {h.description && (
                                      <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.35)', marginTop: 2 }}>{h.description}</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Change Status - ALL statuses available */}
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(250,250,250,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                              CAMBIAR ESTADO
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {availableStatuses.map((ns) => {
                                const nsBadge = STATUS_COLORS[ns] || STATUS_COLORS[OrderStatus.CONFIRMED];
                                const isDanger = ns === OrderStatus.CANCELLED || ns === OrderStatus.RETURNED;
                                return (
                                  <button
                                    key={ns}
                                    onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.ref, ns); }}
                                    style={{
                                      padding: '7px 14px', borderRadius: 8, border: 'none',
                                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                      background: isDanger ? 'rgba(229,62,62,0.1)' : nsBadge.bg,
                                      color: isDanger ? '#E53E3E' : nsBadge.color,
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      (e.currentTarget as HTMLElement).style.background = isDanger ? 'rgba(229,62,62,0.2)' : `${nsBadge.color}22`;
                                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.currentTarget as HTMLElement).style.background = isDanger ? 'rgba(229,62,62,0.1)' : nsBadge.bg;
                                      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                    }}
                                  >
                                    {nsBadge.emoji} {ORDER_STATUS_LABELS[ns as OrderStatus] || ns}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(250,250,250,0.3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>&#128230;</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'rgba(250,250,250,0.5)' }}>No se encontraron pedidos</div>
              <div style={{ fontSize: 13 }}>Ajusta los filtros para ver resultados</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
