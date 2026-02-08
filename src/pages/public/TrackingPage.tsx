// ============================================================
// PlexifyCaps - TrackingPage
// Order tracking with lookup by code, email, name, or cedula
// Visual timeline with real order data from localStorage
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '../../components/common';
import { formatCOP } from '../../utils/formatCurrency';

interface OrderItem {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

interface StatusHistoryEntry {
  status: string;
  date: string;
  time: string;
  description: string;
}

interface OrderData {
  ref: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  customer: { name: string; email: string; phone: string };
  shipping: { address: string; city: string; department: string };
  date: string;
  status?: string;
  statusHistory?: StatusHistoryEntry[];
}

interface TrackingStep {
  label: string;
  date: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
  description: string;
}

// Standard order flow steps (happy path)
const STANDARD_FLOW: { key: string; label: string; pendingDesc: string }[] = [
  { key: 'PENDING_PAYMENT', label: 'Pendiente de Pago', pendingDesc: 'Tu pedido esta pendiente de confirmación de pago.' },
  { key: 'CONFIRMED', label: 'Pago Confirmado', pendingDesc: 'Tu pedido sera confirmado una vez se verifique el pago.' },
  { key: 'PREPARING', label: 'En Preparacion', pendingDesc: 'Tu pedido sera preparado con el mayor cuidado.' },
  { key: 'SHIPPED', label: 'Enviado', pendingDesc: 'Tu pedido sera entregado a la transportadora.' },
  { key: 'IN_TRANSIT', label: 'En Camino', pendingDesc: 'Tu pedido estara en camino hacia tu direccion.' },
  { key: 'DELIVERED', label: 'Entregado', pendingDesc: 'Tu pedido sera entregado en tu direccion.' },
];

// Build tracking steps from real statusHistory
function getTrackingSteps(order: OrderData): TrackingStep[] {
  const history = order.statusHistory || [];
  const currentStatus = order.status || 'CONFIRMED';

  // Map status keys to history entries
  const historyMap = new Map<string, StatusHistoryEntry>();
  for (const entry of history) {
    historyMap.set(entry.status, entry);
  }

  // Handle cancelled/returned — show history as-is plus the terminal state
  if (currentStatus === 'CANCELLED' || currentStatus === 'RETURNED') {
    const steps: TrackingStep[] = [];
    for (const entry of history) {
      const isTerminal = entry.status === 'CANCELLED' || entry.status === 'RETURNED';
      steps.push({
        label: entry.status === 'CANCELLED' ? 'Cancelado' : entry.status === 'RETURNED' ? 'Devuelto' :
          STANDARD_FLOW.find(f => f.key === entry.status)?.label || entry.status,
        date: entry.date,
        time: entry.time,
        status: isTerminal ? 'current' : 'completed',
        description: entry.description,
      });
    }
    return steps;
  }

  // Normal flow: map standard steps to completed/current/pending
  const currentIdx = STANDARD_FLOW.findIndex(f => f.key === currentStatus);

  return STANDARD_FLOW.map((flowStep, idx) => {
    const historyEntry = historyMap.get(flowStep.key);

    if (historyEntry) {
      // This step has been reached
      const isCurrent = flowStep.key === currentStatus;
      return {
        label: flowStep.label,
        date: historyEntry.date,
        time: historyEntry.time,
        status: isCurrent ? 'current' as const : 'completed' as const,
        description: historyEntry.description,
      };
    }

    if (idx < currentIdx) {
      // Step before current but no history entry — mark completed with order date
      return {
        label: flowStep.label,
        date: order.date,
        time: '',
        status: 'completed' as const,
        description: flowStep.pendingDesc,
      };
    }

    // Future step
    return {
      label: flowStep.label,
      date: '',
      time: '',
      status: 'pending' as const,
      description: flowStep.pendingDesc,
    };
  });
}

const glassCard: React.CSSProperties = {
  background: 'rgba(26, 26, 46, 0.65)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '16px',
  border: '1px solid rgba(196, 163, 90, 0.14)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
};

const TrackingPage = () => {
  const { referenceCode } = useParams<{ referenceCode?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'codigo' | 'email' | 'telefono'>('codigo');
  const [foundOrder, setFoundOrder] = useState<OrderData | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [focusedSearch, setFocusedSearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if referenceCode is in the URL
  useEffect(() => {
    if (referenceCode) {
      setSearchQuery(referenceCode);
      setSearchType('codigo');
      // Search immediately
      try {
        const raw = localStorage.getItem('pana_orders') || '[]';
        const orders: OrderData[] = JSON.parse(raw);
        const found = orders.find(o => o.ref.toLowerCase() === referenceCode.toLowerCase());
        if (found) {
          setFoundOrder(found);
        } else {
          setSearchError('No se encontró un pedido con ese código.');
        }
        setHasSearched(true);
      } catch { /* ignore */ }
    }
  }, [referenceCode]);

  const searchTypes = [
    { key: 'codigo' as const, label: 'Codigo', placeholder: 'PAN-2026-XXXXX' },
    { key: 'email' as const, label: 'Email', placeholder: 'tu@correo.com' },
    { key: 'telefono' as const, label: 'Telefono', placeholder: '300 123 4567' },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchError(searchType === 'codigo' ? 'Ingresa tu codigo de referencia' : searchType === 'email' ? 'Ingresa tu correo electronico' : 'Ingresa tu numero de telefono');
      setFoundOrder(null);
      return;
    }

    setSearchError('');
    setIsSearching(true);
    setHasSearched(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Search in localStorage
    try {
      const raw = localStorage.getItem('pana_orders') || '[]';
      const orders: OrderData[] = JSON.parse(raw);

      let found: OrderData | undefined;

      if (searchType === 'codigo') {
        found = orders.find(o => o.ref.toLowerCase() === trimmed.toLowerCase());
      } else if (searchType === 'email') {
        found = orders.find(o => o.customer.email.toLowerCase() === trimmed.toLowerCase());
      } else {
        // Search by phone - normalize digits for comparison
        const searchDigits = trimmed.replace(/\D/g, '');
        found = orders.find(o => {
          const phoneDigits = o.customer.phone.replace(/\D/g, '');
          return phoneDigits.includes(searchDigits) || searchDigits.includes(phoneDigits.slice(-10));
        });
      }

      if (found) {
        setFoundOrder(found);
        setSearchError('');
      } else {
        setFoundOrder(null);
        setSearchError('No se encontro ningun pedido. Verifica los datos e intenta de nuevo.');
      }
    } catch {
      setFoundOrder(null);
      setSearchError('Error al buscar. Intenta de nuevo.');
    }

    setIsSearching(false);
  };

  const trackingSteps = useMemo(() => {
    if (!foundOrder) return [];
    return getTrackingSteps(foundOrder);
  }, [foundOrder]);

  const completedSteps = trackingSteps.filter((s) => s.status === 'completed').length;
  const hasCurrent = trackingSteps.some((s) => s.status === 'current');
  const progressPercent = trackingSteps.length > 0 ? ((completedSteps + (hasCurrent ? 0.5 : 0)) / trackingSteps.length) * 100 : 0;

  // Status badge info for current order status
  const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    PENDING_PAYMENT: { label: 'Pendiente de Pago', color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)' },
    CONFIRMED: { label: 'Confirmado', color: '#38A169', bg: 'rgba(56,161,105,0.12)' },
    PREPARING: { label: 'En Preparacion', color: '#C4A35A', bg: 'rgba(196,163,90,0.12)' },
    SHIPPED: { label: 'Enviado', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    IN_TRANSIT: { label: 'En Camino', color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)' },
    DELIVERED: { label: 'Entregado', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
    CANCELLED: { label: 'Cancelado', color: '#E53E3E', bg: 'rgba(229,62,62,0.12)' },
    RETURNED: { label: 'Devuelto', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  };
  const currentBadge = foundOrder ? STATUS_BADGE[foundOrder.status || 'CONFIRMED'] : null;

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
    if (status === 'current') {
      return (
        <div className="tracking-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#C4A35A' }} />
      );
    }
    return (
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'transparent', border: '2px solid rgba(250,250,250,0.15)' }} />
    );
  };

  return (
    <>
      <SEOHead
        title="Rastrear Pedido"
        description="Rastrea tu pedido de PlexifyCaps en tiempo real."
      />

      <div style={{ minHeight: '100vh', background: '#0D0D0D', paddingTop: '40px', paddingBottom: '80px', position: 'relative' }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(196,163,90,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 800,
              color: '#FAFAFA', letterSpacing: '3px', textTransform: 'uppercase',
              margin: '0 0 8px 0',
            }}>
              Rastrear Pedido
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: '14px',
              color: 'rgba(250,250,250,0.45)', margin: 0, lineHeight: 1.5,
            }}>
              Busca tu pedido por codigo, email o telefono
            </p>
          </motion.div>

          {/* Search Type Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', gap: '6px', marginBottom: '14px', justifyContent: 'center' }}
          >
            {searchTypes.map((t) => (
              <button
                key={t.key}
                onClick={() => { setSearchType(t.key); setSearchError(''); setSearchQuery(''); }}
                style={{
                  padding: '7px 18px', borderRadius: '20px', border: 'none',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  background: searchType === t.key ? 'rgba(196,163,90,0.15)' : 'rgba(250,250,250,0.04)',
                  color: searchType === t.key ? '#C4A35A' : 'rgba(250,250,250,0.45)',
                  transition: 'all 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </motion.div>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSearch}
            style={{ marginBottom: '16px' }}
          >
            <div style={{
              display: 'flex', gap: 0, borderRadius: '12px', overflow: 'hidden',
              border: `1px solid ${searchError ? '#E53E3E' : focusedSearch ? '#C4A35A' : 'rgba(196,163,90,0.15)'}`,
              background: '#1A1A2E',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              boxShadow: focusedSearch ? '0 0 0 3px rgba(196,163,90,0.1), 0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 0 20px', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={focusedSearch ? '#C4A35A' : 'rgba(250,250,250,0.3)'} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 0.3s' }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(searchType === 'codigo' ? e.target.value.toUpperCase() : e.target.value);
                  setSearchError('');
                }}
                onFocus={() => setFocusedSearch(true)}
                onBlur={() => setFocusedSearch(false)}
                placeholder={searchTypes.find(t => t.key === searchType)?.placeholder}
                style={{
                  flex: 1, minWidth: '180px', padding: '16px 0', background: 'transparent',
                  border: 'none', color: '#FAFAFA',
                  fontFamily: searchType === 'codigo' || searchType === 'telefono' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
                  fontSize: '15px', fontWeight: 500,
                  letterSpacing: searchType === 'codigo' ? '1.5px' : '0',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />

              <button
                type="submit"
                disabled={isSearching}
                style={{
                  padding: '16px 28px',
                  background: 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)',
                  color: '#0D0D0D', border: 'none',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  opacity: isSearching ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={(e) => { if (!isSearching) (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #D4B76A 0%, #E8D5A3 100%)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)'; }}
              >
                {isSearching ? <span className="tracking-search-spinner" /> : 'BUSCAR'}
              </button>
            </div>
          </motion.form>

          {/* Error message */}
          <AnimatePresence>
            {searchError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#E53E3E', margin: 0 }}>
                  {searchError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state - no search yet */}
          {!hasSearched && !searchError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ textAlign: 'center', padding: '60px 20px' }}
            >
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.15)" strokeWidth="0.8" strokeLinecap="round" style={{ marginBottom: '16px' }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </motion.div>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: '14px',
                color: 'rgba(250,250,250,0.3)', maxWidth: '380px', margin: '0 auto', lineHeight: 1.7,
              }}>
                Ingresa tu codigo de referencia, email o telefono para ver el estado de tu pedido.
              </p>
            </motion.div>
          )}

          {/* Tracking Result */}
          <AnimatePresence>
            {foundOrder && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Reference badge + status */}
                <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    display: 'inline-block', padding: '8px 22px',
                    background: 'rgba(196,163,90,0.08)', border: '1px solid rgba(196,163,90,0.2)',
                    borderRadius: '10px', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '15px', fontWeight: 700, color: '#C4A35A', letterSpacing: '2px',
                  }}>
                    {foundOrder.ref}
                  </span>
                  {currentBadge && (
                    <span style={{
                      display: 'inline-block', padding: '5px 16px',
                      background: currentBadge.bg,
                      border: `1px solid ${currentBadge.color}33`,
                      borderRadius: '20px',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '12px', fontWeight: 700, color: currentBadge.color,
                      letterSpacing: '1.5px', textTransform: 'uppercase',
                    }}>
                      {currentBadge.label}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    marginBottom: '20px', padding: '14px 20px',
                    background: 'rgba(26,26,46,0.4)', borderRadius: '10px',
                    border: '1px solid rgba(196,163,90,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 700,
                      color: 'rgba(250,250,250,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase',
                    }}>
                      PROGRESO DEL ENVIO
                    </span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 700, color: '#C4A35A',
                    }}>
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%', height: '4px', background: 'rgba(250,250,250,0.06)',
                    borderRadius: '2px', overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #38A169, #C4A35A)',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                </motion.div>

                {/* Timeline */}
                <div style={{ ...glassCard, padding: '28px 24px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.2), transparent)',
                  }} />

                  <h2 style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 800,
                    color: '#FAFAFA', letterSpacing: '2px', textTransform: 'uppercase',
                    margin: '0 0 24px 0',
                  }}>
                    ESTADO DEL PEDIDO
                  </h2>

                  {trackingSteps.map((step, idx) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 + idx * 0.08 }}
                      style={{
                        display: 'flex', gap: '16px', position: 'relative',
                        paddingBottom: idx < trackingSteps.length - 1 ? '28px' : '0',
                      }}
                    >
                      {/* Vertical line */}
                      {idx < trackingSteps.length - 1 && (
                        <div style={{
                          position: 'absolute', left: '14px', top: '32px', width: '2px', bottom: '4px',
                          background: step.status === 'completed'
                            ? 'rgba(56,161,105,0.25)'
                            : step.status === 'current'
                            ? 'linear-gradient(180deg, rgba(196,163,90,0.3), rgba(250,250,250,0.06))'
                            : 'rgba(250,250,250,0.06)',
                        }} />
                      )}

                      {/* Status icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
                        style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: step.status === 'completed' ? 'rgba(56,161,105,0.12)' : step.status === 'current' ? 'rgba(196,163,90,0.12)' : 'rgba(250,250,250,0.03)',
                          border: step.status === 'completed' ? '2px solid rgba(56,161,105,0.4)' : step.status === 'current' ? '2px solid rgba(196,163,90,0.4)' : '2px solid rgba(250,250,250,0.08)',
                          boxShadow: step.status === 'current' ? '0 0 14px rgba(196,163,90,0.15)' : 'none',
                        }}
                      >
                        {getStatusIcon(step.status)}
                      </motion.div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px', flexWrap: 'wrap', gap: '6px' }}>
                          <h3 style={{
                            fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, margin: 0, letterSpacing: '0.5px',
                            color: step.status === 'completed' ? '#38A169' : step.status === 'current' ? '#C4A35A' : 'rgba(250,250,250,0.3)',
                          }}>
                            {step.label}
                          </h3>
                          {step.date && (
                            <span style={{
                              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(250,250,250,0.3)',
                            }}>
                              {step.date} - {step.time}
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontFamily: "'Inter', sans-serif", fontSize: '12px', margin: 0, lineHeight: 1.4,
                          color: step.status === 'pending' ? 'rgba(250,250,250,0.2)' : 'rgba(250,250,250,0.5)',
                        }}>
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Order Details */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  style={{ ...glassCard, padding: '24px', position: 'relative', overflow: 'hidden', marginBottom: '20px' }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.15), transparent)',
                  }} />

                  <h2 style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 700,
                    color: 'rgba(250,250,250,0.45)', letterSpacing: '2px', textTransform: 'uppercase',
                    margin: '0 0 18px 0',
                  }}>
                    DETALLES DEL PEDIDO
                  </h2>

                  {foundOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        paddingBottom: idx < foundOrder.items.length - 1 ? '12px' : 0,
                        marginBottom: idx < foundOrder.items.length - 1 ? '12px' : 0,
                        borderBottom: idx < foundOrder.items.length - 1 ? '1px solid rgba(250,250,250,0.05)' : 'none',
                      }}
                    >
                      <div style={{
                        width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden',
                        background: 'rgba(196,163,90,0.06)', border: '1px solid rgba(196,163,90,0.1)', flexShrink: 0,
                      }}>
                        {item.image ? (
                          <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.35)" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 700,
                          color: '#FAFAFA', margin: '0 0 2px 0',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {item.name}
                        </p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(250,250,250,0.4)', margin: 0 }}>
                          Talla: {item.size} / {item.color} - Qty: {item.quantity}
                        </p>
                      </div>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 700,
                        color: '#C4A35A', flexShrink: 0,
                      }}>
                        {formatCOP(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}

                  {/* Totals */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(196,163,90,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(250,250,250,0.5)' }}>Subtotal</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600, color: '#FAFAFA' }}>{formatCOP(foundOrder.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(250,250,250,0.5)' }}>Envio</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600, color: foundOrder.shippingCost === 0 ? '#38A169' : '#FAFAFA' }}>
                        {foundOrder.shippingCost === 0 ? 'GRATIS' : formatCOP(foundOrder.shippingCost)}
                      </span>
                    </div>
                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.2), transparent)', marginBottom: '8px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '1px', textTransform: 'uppercase' }}>Total</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 800, color: '#C4A35A' }}>{formatCOP(foundOrder.total)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Shipping info */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px',
                  }}
                >
                  <div style={{
                    padding: '16px', background: 'rgba(26,26,46,0.4)',
                    borderRadius: '12px', border: '1px solid rgba(196,163,90,0.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.5)" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', fontWeight: 700, color: 'rgba(250,250,250,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        ENVIO
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(250,250,250,0.6)', margin: 0, lineHeight: 1.5 }}>
                      {foundOrder.shipping.address}<br />
                      {foundOrder.shipping.city}, {foundOrder.shipping.department}
                    </p>
                  </div>

                  <div style={{
                    padding: '16px', background: 'rgba(26,26,46,0.4)',
                    borderRadius: '12px', border: '1px solid rgba(196,163,90,0.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.5)" strokeWidth="2" strokeLinecap="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', fontWeight: 700, color: 'rgba(250,250,250,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        CLIENTE
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(250,250,250,0.6)', margin: 0, lineHeight: 1.5 }}>
                      {foundOrder.customer.name}<br />
                      {foundOrder.customer.email}
                    </p>
                  </div>
                </motion.div>

                {/* Help card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  style={{
                    padding: '16px 20px', background: 'rgba(26,26,46,0.3)',
                    borderRadius: '12px', border: '1px solid rgba(196,163,90,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '12px',
                  }}
                >
                  <div>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, color: '#FAFAFA', margin: '0 0 2px 0' }}>
                      Necesitas ayuda?
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(250,250,250,0.4)', margin: 0 }}>
                      Contactanos por WhatsApp
                    </p>
                  </div>
                  <Link
                    to="/contacto"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 18px', background: 'rgba(56,161,105,0.1)',
                      border: '1px solid rgba(56,161,105,0.2)', borderRadius: '8px',
                      textDecoration: 'none', transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(56,161,105,0.15)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(56,161,105,0.1)'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#38A169">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 700, color: '#38A169', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      WhatsApp
                    </span>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes trackingPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196, 163, 90, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(196, 163, 90, 0); }
        }
        .tracking-pulse {
          animation: trackingPulse 2s ease-in-out infinite;
        }
        @keyframes trackingSearchSpin {
          to { transform: rotate(360deg); }
        }
        .tracking-search-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(13, 13, 13, 0.3);
          border-top-color: #0D0D0D;
          border-radius: 50%;
          animation: trackingSearchSpin 0.6s linear infinite;
        }
      `}</style>
    </>
  );
};

export default TrackingPage;
