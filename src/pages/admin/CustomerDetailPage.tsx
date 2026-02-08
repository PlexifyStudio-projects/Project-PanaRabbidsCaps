// ============================================================
// PlexifyCaps - Customer Detail Page (Admin)
// Edit customer info, reset password, toggle status
// ============================================================

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCOP } from '../../utils/formatCurrency';
import { formatPhone } from '../../utils/helpers';
import { COLOMBIAN_DEPARTMENTS, COLOMBIAN_CITIES } from '../../utils/constants';
import { ADMIN_ROUTES } from '../../config/routes';

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

// ── Styles ──────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'rgba(250,250,250,0.4)',
  letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6, display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', background: 'rgba(250,250,250,0.04)',
  border: '1px solid rgba(250,250,250,0.08)', borderRadius: 10, color: '#FAFAFA',
  fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  fontFamily: "'Inter', sans-serif",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(250,250,250,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 36,
};

// ── Component ────────────────────────────────────────────────
export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState('');

  // Load customer
  const allCustomers = loadCustomers();
  const customerIndex = allCustomers.findIndex(c => c.id === id);
  const customer = customerIndex >= 0 ? allCustomers[customerIndex] : null;

  // Form state
  const [form, setForm] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    department: customer?.department || '',
    city: customer?.city || '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isActive, setIsActive] = useState(customer?.isActive ?? true);

  // Available cities based on department
  const availableCities = useMemo(() => {
    if (!form.department) return [];
    return COLOMBIAN_CITIES[form.department] || [];
  }, [form.department]);

  // Reset city when department changes
  useEffect(() => {
    if (form.city && !availableCities.includes(form.city)) {
      setForm(prev => ({ ...prev, city: '' }));
    }
  }, [availableCities, form.city]);

  // Customer orders
  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return loadOrders().filter(o => o.customer.email.toLowerCase() === customer.email.toLowerCase());
  }, [customer]);

  const totalSpent = useMemo(() => customerOrders.reduce((sum, o) => sum + (o.total || 0), 0), [customerOrders]);

  const handleChange = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (!customer || customerIndex < 0) return;

    const updated: CustomerUser = {
      ...customer,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      department: form.department,
      city: form.city,
      isActive,
    };

    // Handle password change
    if (newPassword) {
      if (newPassword.length < 6) {
        setShowToast('La contrasena debe tener al menos 6 caracteres');
        setTimeout(() => setShowToast(''), 2500);
        return;
      }
      if (newPassword !== confirmPassword) {
        setShowToast('Las contrasenas no coinciden');
        setTimeout(() => setShowToast(''), 2500);
        return;
      }
      updated.passwordHash = btoa(newPassword);
    }

    // Save to pana_customers
    const customers = loadCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx >= 0) {
      customers[idx] = updated;
      saveCustomers(customers);
    }

    // Update session if this customer is currently logged in
    try {
      const sessionRaw = localStorage.getItem('pana_customer_user');
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session.id === id) {
          localStorage.setItem('pana_customer_user', JSON.stringify(updated));
        }
      }
    } catch { /* ignore */ }

    setNewPassword('');
    setConfirmPassword('');
    setShowToast('Cliente actualizado exitosamente');
    setTimeout(() => setShowToast(''), 2500);
  }, [customer, customerIndex, form, isActive, newPassword, confirmPassword, id]);

  // 404 if customer not found
  if (!customer) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>&#128100;</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'rgba(250,250,250,0.5)', marginBottom: 8 }}>
          Cliente no encontrado
        </div>
        <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.3)', marginBottom: 24 }}>
          El cliente que buscas no existe o fue eliminado
        </div>
        <button
          onClick={() => navigate(ADMIN_ROUTES.CUSTOMERS)}
          style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: 'rgba(196,163,90,0.15)', color: '#C4A35A',
          }}
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 1000,
              background: 'rgba(26,26,46,0.95)',
              border: `1px solid ${showToast.includes('no coinciden') || showToast.includes('al menos') ? 'rgba(229,62,62,0.3)' : 'rgba(56,161,105,0.3)'}`,
              borderRadius: 12, padding: '12px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>{showToast.includes('no coinciden') || showToast.includes('al menos') ? '\u274C' : '\u2705'}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <button
        onClick={() => navigate(ADMIN_ROUTES.CUSTOMERS)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: 'rgba(250,250,250,0.45)',
          fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '0 0 16px',
          fontFamily: "'Inter', sans-serif", transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C4A35A'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.45)'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a Clientes
      </button>

      {/* Header with avatar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
          padding: '20px 24px', background: 'rgba(26,26,46,0.4)',
          border: '1px solid rgba(250,250,250,0.06)', borderRadius: 14,
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(196,163,90,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#C4A35A',
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: 1, flexShrink: 0,
        }}>
          {getInitials(customer.firstName, customer.lastName)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', margin: 0, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
            {customer.firstName} {customer.lastName}
          </h1>
          <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)', marginTop: 2 }}>
            Registrado el {new Date(customer.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: isActive ? 'rgba(56,161,105,0.12)' : 'rgba(229,62,62,0.12)',
            color: isActive ? '#38A169' : '#E53E3E',
          }}>
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </motion.div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 16, background: 'rgba(196,163,90,0.06)', borderRadius: 10, border: '1px solid rgba(196,163,90,0.1)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(250,250,250,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>TOTAL PEDIDOS</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace" }}>
            {customerOrders.length}
          </div>
        </div>
        <div style={{ padding: 16, background: 'rgba(196,163,90,0.06)', borderRadius: 10, border: '1px solid rgba(196,163,90,0.1)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(250,250,250,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>TOTAL GASTADO</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace" }}>
            {formatCOP(totalSpent)}
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(250,250,250,0.03)', border: '1px solid rgba(250,250,250,0.06)',
          borderRadius: 14, padding: 24, marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(250,250,250,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 18 }}>
          INFORMACION PERSONAL
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Apellido</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Telefono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Direccion</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Departamento</label>
            <select
              value={form.department}
              onChange={(e) => handleChange('department', e.target.value)}
              style={selectStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            >
              <option value="" style={{ background: '#1A1A2E' }}>Seleccionar departamento</option>
              {COLOMBIAN_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} style={{ background: '#1A1A2E' }}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <select
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={!form.department}
              style={{
                ...selectStyle,
                opacity: form.department ? 1 : 0.5,
                cursor: form.department ? 'pointer' : 'not-allowed',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            >
              <option value="" style={{ background: '#1A1A2E' }}>
                {form.department ? 'Seleccionar ciudad' : 'Primero selecciona departamento'}
              </option>
              {availableCities.map((city) => (
                <option key={city} value={city} style={{ background: '#1A1A2E' }}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Password section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          background: 'rgba(250,250,250,0.03)', border: '1px solid rgba(250,250,250,0.06)',
          borderRadius: 14, padding: 24, marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(250,250,250,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 18 }}>
          CAMBIAR CONTRASENA
        </div>
        <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.3)', marginBottom: 14 }}>
          Deja estos campos vacios si no quieres cambiar la contrasena
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nueva contrasena</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 caracteres"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Confirmar contrasena</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetir contrasena"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            />
          </div>
        </div>
      </motion.div>

      {/* Active toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(250,250,250,0.03)', border: '1px solid rgba(250,250,250,0.06)',
          borderRadius: 14, padding: '18px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA', marginBottom: 2 }}>Estado de la cuenta</div>
          <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)' }}>
            {isActive ? 'El cliente puede iniciar sesion y realizar compras' : 'El cliente no puede iniciar sesion'}
          </div>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: isActive ? '#38A169' : 'rgba(250,250,250,0.15)',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%', background: '#FAFAFA',
            position: 'absolute', top: 3,
            left: isActive ? 25 : 3,
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </button>
      </motion.div>

      {/* Orders section */}
      {customerOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            background: 'rgba(250,250,250,0.03)', border: '1px solid rgba(250,250,250,0.06)',
            borderRadius: 14, padding: 24, marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(250,250,250,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
            HISTORIAL DE PEDIDOS ({customerOrders.length})
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {customerOrders.map((order) => (
              <div key={order.ref} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: 'rgba(250,250,250,0.02)', borderRadius: 10,
              }}>
                <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                  {order.ref}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: 'rgba(250,250,250,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.items.map(it => it.name).join(', ')}
                </span>
                <span style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: 'rgba(196,163,90,0.1)', color: '#C4A35A',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {order.status}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                  {formatCOP(order.total)}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', flexShrink: 0 }}>
                  {order.date}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ display: 'flex', gap: 12, marginBottom: 40 }}
      >
        <button
          onClick={handleSave}
          style={{
            flex: 1, padding: '13px 24px', borderRadius: 10, border: 'none',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: 'linear-gradient(135deg, #C4A35A, #D4B86A)',
            color: '#0D0D0D', fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s', letterSpacing: 0.3,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(196,163,90,0.3)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
        >
          Guardar Cambios
        </button>
        <button
          onClick={() => navigate(ADMIN_ROUTES.CUSTOMERS)}
          style={{
            padding: '13px 24px', borderRadius: 10,
            border: '1px solid rgba(250,250,250,0.1)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            background: 'transparent', color: 'rgba(250,250,250,0.5)',
            fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(250,250,250,0.2)'; (e.currentTarget as HTMLElement).style.color = '#FAFAFA'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(250,250,250,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.5)'; }}
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  );
}
