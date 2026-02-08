// ============================================================
// PlexifyCaps - Customers Page (Admin)
// View, search, filter and manage registered customers
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCOP } from '../../utils/formatCurrency';
import { formatPhone } from '../../utils/helpers';
import { adminCustomerDetailPath } from '../../config/routes';

// ── Types ─────────────────────────────────────────────────────
interface CustomerUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  department: string;
  city: string;
  passwordHash: string;
  createdAt: string;
  isActive: boolean;
}

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
}

// ── Helpers ──────────────────────────────────────────────────
function loadCustomers(): CustomerUser[] {
  try {
    const raw = localStorage.getItem('pana_customers');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveCustomers(customers: CustomerUser[]) {
  localStorage.setItem('pana_customers', JSON.stringify(customers));
}

function loadOrders(): StoredOrder[] {
  try {
    const raw = localStorage.getItem('pana_orders');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}

function formatDate(isoStr: string): string {
  try {
    return new Date(isoStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return isoStr;
  }
}

// ── Component ────────────────────────────────────────────────
export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerUser[]>(loadCustomers);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState('');

  const allOrders = useMemo(() => loadOrders(), []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && c.isActive) ||
        (filter === 'inactive' && !c.isActive);

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [customers, filter, search]);

  const toggleActive = useCallback((id: string) => {
    setCustomers(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
      saveCustomers(updated);

      // Update session if this customer is logged in
      try {
        const sessionRaw = localStorage.getItem('pana_customer_user');
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session.id === id) {
            const updatedCustomer = updated.find(c => c.id === id);
            if (updatedCustomer) {
              localStorage.setItem('pana_customer_user', JSON.stringify(updatedCustomer));
            }
          }
        }
      } catch { /* ignore */ }

      const target = updated.find(c => c.id === id);
      const newState = target?.isActive ? 'activado' : 'desactivado';
      setShowToast(`Cliente ${newState} exitosamente`);
      setTimeout(() => setShowToast(''), 2500);

      return updated;
    });
  }, []);

  const getCustomerOrders = useCallback((email: string) => {
    return allOrders.filter(o => o.customer.email.toLowerCase() === email.toLowerCase());
  }, [allOrders]);

  const activeCount = customers.filter(c => c.isActive).length;
  const inactiveCount = customers.filter(c => !c.isActive).length;

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
          Clientes
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(250,250,250,0.4)', margin: '4px 0 0' }}>
          {customers.length} cliente{customers.length !== 1 ? 's' : ''} registrado{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Empty state */}
      {customers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(250,250,250,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#128100;</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'rgba(250,250,250,0.5)' }}>No hay clientes aun</div>
          <div style={{ fontSize: 13 }}>Los clientes apareceran aqui cuando se registren en tu tienda</div>
        </div>
      )}

      {customers.length > 0 && (
        <>
          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filter === 'all' ? 'rgba(250,250,250,0.15)' : 'rgba(250,250,250,0.04)',
                color: filter === 'all' ? '#FAFAFA' : 'rgba(250,250,250,0.5)',
                transition: 'all 0.2s',
              }}
            >
              Todos ({customers.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filter === 'active' ? 'rgba(56,161,105,0.2)' : 'rgba(56,161,105,0.08)',
                color: filter === 'active' ? '#38A169' : 'rgba(56,161,105,0.7)',
                transition: 'all 0.2s',
              }}
            >
              Activos ({activeCount})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filter === 'inactive' ? 'rgba(229,62,62,0.2)' : 'rgba(229,62,62,0.08)',
                color: filter === 'inactive' ? '#E53E3E' : 'rgba(229,62,62,0.7)',
                transition: 'all 0.2s',
              }}
            >
              Inactivos ({inactiveCount})
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(250,250,250,0.3)" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, email o telefono..."
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

          {/* Customer Cards */}
          <div style={{ display: 'grid', gap: 10 }}>
            {filteredCustomers.map((customer, i) => {
              const isExpanded = expandedId === customer.id;
              const customerOrders = isExpanded ? getCustomerOrders(customer.email) : [];
              const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);

              return (
                <motion.div
                  key={customer.id}
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
                  {/* Customer row (collapsed) */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = 'rgba(250,250,250,0.05)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {/* Avatar with initials */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'rgba(196,163,90,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: '#C4A35A',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      flexShrink: 0, letterSpacing: 1,
                    }}>
                      {getInitials(customer.firstName, customer.lastName)}
                    </div>

                    {/* Name + email */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>
                          {customer.firstName} {customer.lastName}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {customer.email}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                      background: customer.isActive ? 'rgba(56,161,105,0.12)' : 'rgba(229,62,62,0.12)',
                      color: customer.isActive ? '#38A169' : '#E53E3E',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {customer.isActive ? 'Activo' : 'Inactivo'}
                    </span>

                    {/* Registration date */}
                    <div style={{
                      fontSize: 12, color: 'rgba(250,250,250,0.35)',
                      fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                    }}>
                      {formatDate(customer.createdAt)}
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

                          {/* Customer info grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, marginBottom: 16 }}>
                            <div style={{ padding: 12, background: 'rgba(250,250,250,0.02)', borderRadius: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(250,250,250,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>CONTACTO</div>
                              <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.6)', lineHeight: 1.6 }}>
                                {customer.phone ? formatPhone(customer.phone) : 'Sin telefono'}<br />
                                {customer.email}
                              </div>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(250,250,250,0.02)', borderRadius: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(250,250,250,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>DIRECCION</div>
                              <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.6)', lineHeight: 1.6 }}>
                                {customer.address || 'Sin direccion'}<br />
                                {customer.city && customer.department ? `${customer.city}, ${customer.department}` : 'Sin ubicacion'}
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                            <div style={{ padding: 12, background: 'rgba(196,163,90,0.06)', borderRadius: 8, border: '1px solid rgba(196,163,90,0.1)' }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(250,250,250,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>TOTAL PEDIDOS</div>
                              <div style={{ fontSize: 20, fontWeight: 700, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace" }}>
                                {customerOrders.length}
                              </div>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(196,163,90,0.06)', borderRadius: 8, border: '1px solid rgba(196,163,90,0.1)' }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(250,250,250,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>TOTAL GASTADO</div>
                              <div style={{ fontSize: 20, fontWeight: 700, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace" }}>
                                {formatCOP(totalSpent)}
                              </div>
                            </div>
                          </div>

                          {/* Customer orders */}
                          {customerOrders.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(250,250,250,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                                PEDIDOS DEL CLIENTE
                              </div>
                              <div style={{ display: 'grid', gap: 6 }}>
                                {customerOrders.map((order) => (
                                  <div key={order.ref} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                    background: 'rgba(250,250,250,0.02)', borderRadius: 8,
                                  }}>
                                    <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                                      {order.ref}
                                    </span>
                                    <span style={{ flex: 1, fontSize: 12, color: 'rgba(250,250,250,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {order.items.map(it => it.name).join(', ')}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                                      {formatCOP(order.total)}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', flexShrink: 0 }}>
                                      {order.date}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {customerOrders.length === 0 && (
                            <div style={{ marginBottom: 16, padding: '16px 12px', background: 'rgba(250,250,250,0.02)', borderRadius: 8, textAlign: 'center' }}>
                              <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.3)' }}>Este cliente no tiene pedidos aun</div>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(adminCustomerDetailPath(customer.id)); }}
                              style={{
                                padding: '9px 20px', borderRadius: 8, border: 'none',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                background: 'rgba(196,163,90,0.15)', color: '#C4A35A',
                                transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,163,90,0.25)'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,163,90,0.15)'; }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleActive(customer.id); }}
                              style={{
                                padding: '9px 20px', borderRadius: 8, border: 'none',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                background: customer.isActive ? 'rgba(229,62,62,0.1)' : 'rgba(56,161,105,0.1)',
                                color: customer.isActive ? '#E53E3E' : '#38A169',
                                transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = customer.isActive ? 'rgba(229,62,62,0.2)' : 'rgba(56,161,105,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = customer.isActive ? 'rgba(229,62,62,0.1)' : 'rgba(56,161,105,0.1)';
                              }}
                            >
                              {customer.isActive ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {filteredCustomers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(250,250,250,0.3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>&#128100;</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'rgba(250,250,250,0.5)' }}>No se encontraron clientes</div>
              <div style={{ fontSize: 13 }}>Ajusta los filtros para ver resultados</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
