// ============================================================
// PlexifyCaps - OrderConfirmationPage
// Success page with real order details from localStorage
// ============================================================

import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '../../components/common';
import { formatCOP } from '../../utils/formatCurrency';
import { formatPhone } from '../../utils/helpers';

interface OrderItem {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
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
}

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const referenceCode = searchParams.get('ref') || 'PAN-2026-XXXXX';
  const [copied, setCopied] = useState(false);

  const orderData = useMemo<OrderData | null>(() => {
    try {
      const raw = localStorage.getItem('pana_last_order');
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  }, []);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referenceCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const glassCard: React.CSSProperties = {
    background: 'rgba(26, 26, 46, 0.65)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '16px',
    border: '1px solid rgba(196, 163, 90, 0.14)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
  };

  return (
    <>
      <SEOHead
        title="Pedido Recibido"
        description="Tu pedido ha sido recibido. Pendiente de confirmación de pago."
      />

      <div
        style={{
          minHeight: '100vh',
          background: '#0D0D0D',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '60px 20px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ marginBottom: '28px', position: 'relative' }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '100px', height: '100px', borderRadius: '50%',
              border: '2px solid rgba(245, 158, 11, 0.3)',
            }}
          />
          <svg width="100" height="100" viewBox="0 0 120 120" style={{ display: 'block' }}>
            <motion.circle cx="60" cy="60" r="54" fill="none" stroke="#f59e0b" strokeWidth="3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
              style={{ strokeLinecap: 'round' }}
            />
            <motion.circle cx="60" cy="60" r="48" fill="rgba(245, 158, 11, 0.08)"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }}
            />
            {/* Clock icon - pending payment */}
            <motion.circle cx="60" cy="60" r="18" fill="none" stroke="#f59e0b" strokeWidth="3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.8, ease: 'easeOut' }}
              style={{ strokeLinecap: 'round' }}
            />
            <motion.path d="M60 48 L60 60 L70 66" fill="none" stroke="#f59e0b" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 1.1, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 800,
            color: '#FAFAFA',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
            textAlign: 'center',
          }}
        >
          Pedido Recibido
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '15px',
            color: 'rgba(250, 250, 250, 0.5)',
            margin: '0 0 32px 0',
            textAlign: 'center',
            maxWidth: '480px',
            lineHeight: 1.6,
          }}
        >
          {orderData?.customer.name ? `Gracias ${orderData.customer.name.split(' ')[0]}, t` : 'T'}u pedido ha sido recibido. Queda pendiente la confirmación del pago.
        </motion.p>

        {/* Content container */}
        <div style={{ maxWidth: '560px', width: '100%' }}>

          {/* Reference Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              ...glassCard,
              padding: '28px 32px',
              textAlign: 'center',
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)',
            }} />

            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 700,
              color: 'rgba(250,250,250,0.4)', letterSpacing: '2px', textTransform: 'uppercase',
              margin: '0 0 8px 0',
            }}>
              CODIGO DE REFERENCIA
            </p>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(20px, 4vw, 30px)',
              fontWeight: 800, color: '#C4A35A', margin: '0 0 12px 0', letterSpacing: '2px',
            }}>
              {referenceCode}
            </p>

            <motion.button
              onClick={handleCopyRef}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: copied ? 'rgba(56,161,105,0.15)' : 'rgba(196,163,90,0.1)',
                border: `1px solid ${copied ? 'rgba(56,161,105,0.3)' : 'rgba(196,163,90,0.2)'}`,
                borderRadius: '8px',
                padding: '7px 18px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
              }}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#38A169', fontWeight: 600 }}>Copiado</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#C4A35A', fontWeight: 600 }}>Copiar</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Track Order CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.78 }}
            style={{ marginBottom: '20px' }}
          >
            <Link
              to={`/rastreo?ref=${referenceCode}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 22px',
                background: 'linear-gradient(135deg, rgba(196,163,90,0.1) 0%, rgba(26,26,46,0.6) 100%)',
                borderRadius: '14px',
                border: '1px solid rgba(196,163,90,0.2)',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,163,90,0.4)';
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(196,163,90,0.15) 0%, rgba(26,26,46,0.7) 100%)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,163,90,0.2)';
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(196,163,90,0.1) 0%, rgba(26,26,46,0.6) 100%)';
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: 'rgba(196,163,90,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 700,
                  color: '#C4A35A', letterSpacing: '0.5px',
                }}>
                  RASTREAR MI PEDIDO
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: '12px',
                  color: 'rgba(250,250,250,0.4)', marginTop: 2,
                }}>
                  Consulta el estado de tu pedido en tiempo real
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.5)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </motion.div>

          {/* Order Items */}
          {orderData && orderData.items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              style={{ ...glassCard, padding: '24px 28px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.15), transparent)',
              }} />

              <h3 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700,
                color: 'rgba(250,250,250,0.45)', letterSpacing: '2px', textTransform: 'uppercase',
                margin: '0 0 16px 0',
              }}>
                RESUMEN DEL PEDIDO
              </h3>

              {orderData.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    paddingBottom: idx < orderData.items.length - 1 ? '14px' : 0,
                    marginBottom: idx < orderData.items.length - 1 ? '14px' : 0,
                    borderBottom: idx < orderData.items.length - 1 ? '1px solid rgba(250,250,250,0.05)' : 'none',
                  }}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden',
                    background: 'rgba(196,163,90,0.06)', border: '1px solid rgba(196,163,90,0.1)', flexShrink: 0,
                  }}>
                    {item.image ? (
                      <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.35)" strokeWidth="1.5" strokeLinecap="round">
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
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(250,250,250,0.4)', margin: 0 }}>
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
              <div style={{
                marginTop: '16px', paddingTop: '14px',
                borderTop: '1px solid rgba(196,163,90,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.5)' }}>
                    Subtotal
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>
                    {formatCOP(orderData.subtotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.5)' }}>
                    Envio
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600,
                    color: orderData.shippingCost === 0 ? '#38A169' : '#FAFAFA',
                  }}>
                    {orderData.shippingCost === 0 ? 'GRATIS' : formatCOP(orderData.shippingCost)}
                  </span>
                </div>
                <div style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.2), transparent)',
                  marginBottom: '10px',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700,
                    color: '#FAFAFA', letterSpacing: '1px', textTransform: 'uppercase',
                  }}>
                    Total
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 800, color: '#C4A35A',
                  }}>
                    {formatCOP(orderData.total)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Shipping & Contact Info */}
          {orderData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                marginBottom: '20px',
              }}
            >
              {/* Shipping */}
              <div style={{
                padding: '18px', background: 'rgba(26,26,46,0.4)',
                borderRadius: '12px', border: '1px solid rgba(196,163,90,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.5)" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', fontWeight: 700,
                    color: 'rgba(250,250,250,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase',
                  }}>
                    ENVIO
                  </span>
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: '12px',
                  color: 'rgba(250,250,250,0.6)', margin: 0, lineHeight: 1.6,
                }}>
                  {orderData.shipping.address}<br />
                  {orderData.shipping.city}, {orderData.shipping.department}
                </p>
              </div>

              {/* Contact */}
              <div style={{
                padding: '18px', background: 'rgba(26,26,46,0.4)',
                borderRadius: '12px', border: '1px solid rgba(196,163,90,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.5)" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', fontWeight: 700,
                    color: 'rgba(250,250,250,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase',
                  }}>
                    CONTACTO
                  </span>
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: '12px',
                  color: 'rgba(250,250,250,0.6)', margin: 0, lineHeight: 1.6,
                }}>
                  {orderData.customer.name}<br />
                  {orderData.customer.email}<br />
                  {formatPhone(orderData.customer.phone)}
                </p>
              </div>
            </motion.div>
          )}

          {/* Estimated delivery */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            style={{
              padding: '16px 20px',
              background: 'rgba(56,161,105,0.06)',
              borderRadius: '12px',
              border: '1px solid rgba(56,161,105,0.12)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <div>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700,
                color: '#38A169', margin: '0 0 2px 0', letterSpacing: '0.5px',
              }}>
                Entrega estimada: 3-5 dias habiles
              </p>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: '12px',
                color: 'rgba(250,250,250,0.45)', margin: 0,
              }}>
                Te notificaremos por WhatsApp cuando tu pedido sea enviado
              </p>
            </div>
          </motion.div>

          {/* Next steps */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            style={{ ...glassCard, padding: '24px 28px', marginBottom: '28px' }}
          >
            <h3 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700,
              color: 'rgba(250,250,250,0.45)', letterSpacing: '2px', textTransform: 'uppercase',
              margin: '0 0 14px 0',
            }}>
              PROXIMOS PASOS
            </h3>

            {[
              { num: '1', text: 'Recibiras confirmacion por WhatsApp' },
              { num: '2', text: 'Tu pedido sera preparado con cuidado' },
              { num: '3', text: 'Te notificaremos cuando se envie' },
            ].map((step, idx) => (
              <div
                key={step.num}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: idx < 2 ? '12px' : 0,
                  paddingBottom: idx < 2 ? '12px' : 0,
                  borderBottom: idx < 2 ? '1px solid rgba(250,250,250,0.04)' : 'none',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: 'rgba(196,163,90,0.08)', border: '1px solid rgba(196,163,90,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700,
                  color: '#C4A35A', flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: '13px',
                  color: 'rgba(250,250,250,0.6)', margin: 0,
                }}>
                  {step.text}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35 }}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link
              to="/rastreo"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)',
                color: '#0D0D0D',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
                textDecoration: 'none', padding: '14px 32px', borderRadius: '10px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(196,163,90,0.2)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(196,163,90,0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(196,163,90,0.2)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              RASTREAR PEDIDO
            </Link>

            <Link
              to="/catalogo"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'transparent', color: '#C4A35A',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
                textDecoration: 'none', padding: '13px 32px', borderRadius: '10px',
                border: '1px solid rgba(196,163,90,0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(196,163,90,0.08)';
                (e.currentTarget as HTMLElement).style.borderColor = '#C4A35A';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,163,90,0.3)';
              }}
            >
              SEGUIR COMPRANDO
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;
