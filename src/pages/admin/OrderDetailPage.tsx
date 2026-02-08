import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatCOP } from '../../utils/formatCurrency';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { OrderStatus } from '../../types/order';

const MOCK_ORDER = {
  id: 1,
  referenceCode: 'PAN-2026-00142',
  status: OrderStatus.SHIPPED,
  customerName: 'Carlos Mendoza',
  customerEmail: 'carlos.mendoza@email.com',
  customerPhone: '+57 300 123 4567',
  shippingAddress: 'Calle 85 #15-40, Apto 302',
  shippingCity: 'Bucaramanga',
  shippingDepartment: 'Santander',
  paymentMethod: 'Tarjeta de cr\u00E9dito (Wompi)',
  trackingCode: 'COL-2026-TR-12345',
  subtotal: 378000,
  shippingCost: 0,
  total: 378000,
  items: [
    { id: 1, productName: 'New York Yankees Classic Black', variantName: '7 1/4 - Negro', quantity: 1, unitPrice: 189000, totalPrice: 189000 },
    { id: 2, productName: 'Chicago Bulls Dynasty Red', variantName: 'Adjustable - Rojo', quantity: 1, unitPrice: 175000, totalPrice: 175000 },
    { id: 3, productName: 'Shadow Chrome Dad Hat', variantName: 'Strapback - Negro', quantity: 1, unitPrice: 14000, totalPrice: 14000 },
  ],
  timeline: [
    { status: OrderStatus.PENDING_PAYMENT, date: '2026-02-05T14:23:00', description: 'Pedido recibido - esperando pago' },
    { status: OrderStatus.CONFIRMED, date: '2026-02-05T14:25:00', description: 'Pago confirmado v\u00EDa Wompi' },
    { status: OrderStatus.PREPARING, date: '2026-02-05T16:00:00', description: 'Pedido en preparaci\u00F3n en bodega' },
    { status: OrderStatus.SHIPPED, date: '2026-02-06T09:15:00', description: 'Pedido enviado - Gu\u00EDa: COL-2026-TR-12345' },
  ],
  notes: 'Por favor entregar en porter\u00EDa. Llamar al llegar.',
  createdAt: '2026-02-05T14:23:00',
};

const STATUS_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  [OrderStatus.PENDING_PAYMENT]: { bg: 'rgba(107,114,128,0.2)', color: '#9CA3AF' },
  [OrderStatus.CONFIRMED]: { bg: 'rgba(56,161,105,0.15)', color: '#38A169' },
  [OrderStatus.PREPARING]: { bg: 'rgba(196,163,90,0.15)', color: '#C4A35A' },
  [OrderStatus.SHIPPED]: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  [OrderStatus.IN_TRANSIT]: { bg: 'rgba(14,165,233,0.15)', color: '#0EA5E9' },
  [OrderStatus.DELIVERED]: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  [OrderStatus.CANCELLED]: { bg: 'rgba(229,62,62,0.15)', color: '#E53E3E' },
  [OrderStatus.RETURNED]: { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' },
};

const TIMELINE_DOT_COLORS: Record<string, string> = {
  [OrderStatus.PENDING_PAYMENT]: '#9CA3AF',
  [OrderStatus.CONFIRMED]: '#38A169',
  [OrderStatus.PREPARING]: '#C4A35A',
  [OrderStatus.SHIPPED]: '#3B82F6',
  [OrderStatus.IN_TRANSIT]: '#0EA5E9',
  [OrderStatus.DELIVERED]: '#22C55E',
  [OrderStatus.CANCELLED]: '#E53E3E',
  [OrderStatus.RETURNED]: '#6B7280',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedStatus, setSelectedStatus] = useState(MOCK_ORDER.status);
  const [statusUpdated, setStatusUpdated] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<string[]>([MOCK_ORDER.notes]);
  const [noteAdded, setNoteAdded] = useState(false);

  const handleUpdateStatus = () => {
    setStatusUpdated(true);
    setTimeout(() => setStatusUpdated(false), 2500);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [...prev, newNote.trim()]);
    setNewNote('');
    setNoteAdded(true);
    setTimeout(() => setNoteAdded(false), 2500);
  };

  const currentBadge = STATUS_BADGE_COLORS[MOCK_ORDER.status];

  const cardStyle: React.CSSProperties = {
    background: 'rgba(26,26,46,0.6)',
    border: '1px solid rgba(250,250,250,0.06)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: '#C4A35A', textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 16,
  };

  const infoLabelStyle: React.CSSProperties = {
    fontSize: 11, color: 'rgba(250,250,250,0.4)', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.5,
  };

  const infoValueStyle: React.CSSProperties = {
    fontSize: 14, color: '#FAFAFA', marginBottom: 14,
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, color: 'rgba(250,250,250,0.4)',
    textTransform: 'uppercase' as const, letterSpacing: 1, borderBottom: '1px solid rgba(250,250,250,0.08)',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px', fontSize: 14, color: '#FAFAFA', borderBottom: '1px solid rgba(250,250,250,0.04)',
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      {/* Back + Header */}
      <Link
        to="/admin/orders"
        style={{ color: 'rgba(250,250,250,0.4)', textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, transition: 'color 0.2s' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C4A35A'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.4)'; }}
      >
        &larr; Volver a pedidos
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#C4A35A', margin: 0, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2 }}>
          {MOCK_ORDER.referenceCode}
        </h1>
        <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: currentBadge.bg, color: currentBadge.color }}>
          {ORDER_STATUS_LABELS[MOCK_ORDER.status]}
        </span>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.4)', marginBottom: 32 }}>
        Creado el {new Date(MOCK_ORDER.createdAt).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Left Column */}
        <div>
          {/* Customer Info */}
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Informaci&oacute;n del Cliente</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div><div style={infoLabelStyle}>Nombre</div><div style={infoValueStyle}>{MOCK_ORDER.customerName}</div></div>
              <div><div style={infoLabelStyle}>Email</div><div style={infoValueStyle}>{MOCK_ORDER.customerEmail}</div></div>
              <div><div style={infoLabelStyle}>Tel&eacute;fono</div><div style={infoValueStyle}>{MOCK_ORDER.customerPhone}</div></div>
              <div><div style={infoLabelStyle}>Direcci&oacute;n</div><div style={infoValueStyle}>{MOCK_ORDER.shippingAddress}</div></div>
              <div><div style={infoLabelStyle}>Ciudad</div><div style={infoValueStyle}>{MOCK_ORDER.shippingCity}, {MOCK_ORDER.shippingDepartment}</div></div>
              <div><div style={infoLabelStyle}>C&oacute;digo de Gu&iacute;a</div><div style={{ ...infoValueStyle, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{MOCK_ORDER.trackingCode}</div></div>
            </div>
          </div>

          {/* Items */}
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Art&iacute;culos del Pedido</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Producto</th>
                  <th style={thStyle}>Cant.</th>
                  <th style={thStyle}>Precio</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDER.items.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{item.productName}</div>
                      <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.4)', marginTop: 2 }}>{item.variantName}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{formatCOP(item.unitPrice)}</td>
                    <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: '#C4A35A', textAlign: 'right' }}>{formatCOP(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '1px solid rgba(250,250,250,0.08)', marginTop: 8, paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(250,250,250,0.5)' }}>Subtotal</span>
                <span style={{ fontSize: 13, color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace" }}>{formatCOP(MOCK_ORDER.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'rgba(250,250,250,0.5)' }}>Env&iacute;o</span>
                <span style={{ fontSize: 13, color: '#38A169', fontWeight: 600 }}>{MOCK_ORDER.shippingCost === 0 ? 'GRATIS' : formatCOP(MOCK_ORDER.shippingCost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(250,250,250,0.06)' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#FAFAFA' }}>TOTAL</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#C4A35A', fontFamily: "'JetBrains Mono', monospace" }}>{formatCOP(MOCK_ORDER.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Informaci&oacute;n de Pago</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div><div style={infoLabelStyle}>M&eacute;todo</div><div style={infoValueStyle}>{MOCK_ORDER.paymentMethod}</div></div>
              <div><div style={infoLabelStyle}>Estado</div><div style={{ ...infoValueStyle, color: '#38A169', fontWeight: 600 }}>Pago confirmado</div></div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Status Update */}
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Actualizar Estado</div>
            {statusUpdated && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(56,161,105,0.15)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#38A169', fontSize: 12, fontWeight: 600 }}
              >
                Estado actualizado correctamente
              </motion.div>
            )}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              style={{
                width: '100%', padding: '12px 14px', background: 'rgba(13,13,13,0.6)', border: '1px solid rgba(250,250,250,0.1)',
                borderRadius: 8, color: '#FAFAFA', fontSize: 14, outline: 'none', marginBottom: 12, cursor: 'pointer', boxSizing: 'border-box' as const,
              }}
            >
              {Object.values(OrderStatus).map((s) => (
                <option key={s} value={s} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>{ORDER_STATUS_LABELS[s]}</option>
              ))}
            </select>
            <motion.button
              onClick={handleUpdateStatus}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '12px', background: 'linear-gradient(135deg, #C4A35A, #D4B86A)', border: 'none',
                borderRadius: 8, color: '#0D0D0D', fontSize: 13, fontWeight: 700, letterSpacing: 1, cursor: 'pointer',
              }}
            >
              Actualizar
            </motion.button>
          </div>

          {/* Timeline */}
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Historial de Estado</div>
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              <div style={{ position: 'absolute', left: 8, top: 8, bottom: 8, width: 2, background: 'rgba(250,250,250,0.06)', borderRadius: 1 }} />
              {MOCK_ORDER.timeline.map((event, i) => {
                const isLast = i === MOCK_ORDER.timeline.length - 1;
                const dotColor = TIMELINE_DOT_COLORS[event.status] || '#C4A35A';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ position: 'relative', marginBottom: isLast ? 0 : 24 }}
                  >
                    <div style={{
                      position: 'absolute', left: -28, top: 2, width: 18, height: 18, borderRadius: '50%',
                      background: isLast ? dotColor : 'transparent', border: `2px solid ${dotColor}`,
                      zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isLast && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FAFAFA' }} />}
                    </div>
                    <div style={{ fontSize: 13, color: '#FAFAFA', fontWeight: 600, marginBottom: 2 }}>{ORDER_STATUS_LABELS[event.status]}</div>
                    <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.5)', marginBottom: 2 }}>{event.description}</div>
                    <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(event.date).toLocaleString('es-CO')}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Notas</div>
            {noteAdded && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(56,161,105,0.15)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#38A169', fontSize: 12, fontWeight: 600 }}
              >
                Nota agregada correctamente
              </motion.div>
            )}
            <div style={{ marginBottom: 16 }}>
              {notes.map((note, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'rgba(13,13,13,0.4)', borderRadius: 8, marginBottom: 8, fontSize: 13, color: 'rgba(250,250,250,0.7)', lineHeight: 1.5 }}>
                  {note}
                  <div style={{ fontSize: 10, color: 'rgba(250,250,250,0.3)', marginTop: 6 }}>
                    {i === 0 ? 'Nota del cliente' : 'Admin'}
                  </div>
                </div>
              ))}
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Agregar una nota..."
              style={{
                width: '100%', padding: '12px 14px', background: 'rgba(13,13,13,0.6)', border: '1px solid rgba(250,250,250,0.1)',
                borderRadius: 8, color: '#FAFAFA', fontSize: 13, outline: 'none', minHeight: 80, resize: 'vertical' as const,
                fontFamily: 'inherit', marginBottom: 12, boxSizing: 'border-box' as const,
              }}
              onFocus={(e) => { e.target.style.borderColor = '#C4A35A'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.1)'; }}
            />
            <button
              onClick={handleAddNote}
              style={{
                width: '100%', padding: '10px', background: 'rgba(250,250,250,0.06)', border: '1px solid rgba(250,250,250,0.1)',
                borderRadius: 8, color: '#FAFAFA', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(250,250,250,0.1)'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(250,250,250,0.06)'; }}
            >
              Agregar Nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
