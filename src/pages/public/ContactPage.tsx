// ============================================================
// Pana Rabbids - ContactPage (Premium Redesign)
// Full-screen hero, glassmorphism form, animated contact cards,
// FAQ accordion, social grid, and location section
// ============================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '../../components/common';
import { loadStoreSettings, formatWhatsApp } from '../../data/settingsService';
import { buildWhatsAppUrl } from '../../utils/helpers';

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

const subjects = [
  'Consulta general',
  'Estado de mi pedido',
  'Cambio o devolucion',
  'Problema con mi producto',
  'Colaboraciones',
  'Venta mayorista',
  'Otro',
];

const faqs = [
  {
    q: 'Cuanto tarda el envio?',
    a: 'Realizamos envios a toda Colombia. Bucaramanga y area metropolitana: 1-2 dias habiles. Principales ciudades: 2-4 dias habiles. Resto del pais: 4-7 dias habiles. Envio gratis en compras superiores a $150.000 COP.',
  },
  {
    q: 'Puedo cambiar o devolver mi gorra?',
    a: 'Si, tienes 7 dias habiles desde la recepcion para solicitar un cambio o devolucion. El producto debe estar en perfecto estado con su empaque original.',
  },
  {
    q: 'Todas las gorras son originales?',
    a: 'Absolutamente. Trabajamos directamente con distribuidores autorizados. Cada gorra viene con su certificado de autenticidad y etiquetas originales.',
  },
  {
    q: 'Que metodos de pago aceptan?',
    a: 'Aceptamos tarjeta de credito/debito, PSE, Nequi, Daviplata y transferencia bancaria a traves de nuestra pasarela de pagos segura.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

const ContactPage = () => {
  const settings = useMemo(() => loadStoreSettings(), []);
  const WHATSAPP_NUMBER = settings.whatsapp;
  const COMPANY_EMAIL = settings.email;

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  const focusHandler = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = '#C4A35A';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 163, 90, 0.12)';
  };
  const blurHandler = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = 'rgba(196, 163, 90, 0.18)';
    e.currentTarget.style.boxShadow = 'none';
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(196, 163, 90, 0.18)',
    borderRadius: '10px',
    color: '#FAFAFA',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    outline: 'none',
    transition: `border-color 0.3s ${EASE}, box-shadow 0.3s ${EASE}`,
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '11px',
    fontWeight: 700,
    color: 'rgba(250, 250, 250, 0.5)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  };

  return (
    <>
      <SEOHead
        title="Contacto"
        description="Contacta al equipo de Pana Rabbids. Estamos aqui para ayudarte con cualquier consulta."
      />

      <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
        {/* ── Hero Section ── */}
        <div
          style={{
            position: 'relative',
            minHeight: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 50%, #0D0D0D 100%)',
          }}
        >
          {/* Animated decorative elements */}
          <div style={{ position: 'absolute', top: '15%', left: '8%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(196,163,90,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(196,163,90,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          {/* Grid pattern overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(196,163,90,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(196,163,90,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(transparent, #0D0D0D)', pointerEvents: 'none' }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: 'relative', textAlign: 'center', padding: '80px 20px 60px', zIndex: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 28px',
                background: 'linear-gradient(135deg, rgba(196,163,90,0.15), rgba(196,163,90,0.05))',
                border: '1px solid rgba(196,163,90,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(196,163,90,0.1)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </motion.div>
            <motion.div initial={{ width: 0 }} animate={{ width: '50px' }} transition={{ duration: 0.5, delay: 0.4 }} style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)', margin: '0 auto 24px' }} />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, color: '#FAFAFA', letterSpacing: '5px', textTransform: 'uppercase', margin: '0 0 16px' }}>
              CONTACTANOS
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'rgba(250,250,250,0.5)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Tienes preguntas? Estamos aqui para ayudarte. Escribenos y te responderemos lo antes posible.
            </p>
          </motion.div>
        </div>

        {/* ── Quick Contact Cards ── */}
        <div style={{ maxWidth: '1100px', margin: '-40px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* WhatsApp Card */}
            <motion.a
              {...fadeUp}
              href={buildWhatsAppUrl(WHATSAPP_NUMBER, 'Hola! Me gustaria obtener mas informacion.')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                background: 'rgba(26, 26, 46, 0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '14px', border: '1px solid rgba(56, 161, 105, 0.2)',
                padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '18px',
                transition: `all 0.4s ${EASE}`, cursor: 'pointer',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.border = '1px solid rgba(56,161,105,0.5)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 48px rgba(56,161,105,0.12)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.border = '1px solid rgba(56,161,105,0.2)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(56,161,105,0.2), rgba(56,161,105,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#38A169">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, color: '#38A169', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>WHATSAPP</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'rgba(250,250,250,0.7)', margin: 0 }}>{formatWhatsApp(WHATSAPP_NUMBER)}</p>
              </div>
            </motion.a>

            {/* Email Card */}
            <motion.a
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              href={`mailto:${COMPANY_EMAIL}`}
              style={{
                textDecoration: 'none',
                background: 'rgba(26, 26, 46, 0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '14px', border: '1px solid rgba(196,163,90,0.15)',
                padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '18px',
                transition: `all 0.4s ${EASE}`, cursor: 'pointer',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.border = '1px solid rgba(196,163,90,0.4)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 48px rgba(196,163,90,0.08)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.border = '1px solid rgba(196,163,90,0.15)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(196,163,90,0.15), rgba(196,163,90,0.03))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, color: '#C4A35A', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>EMAIL</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.7)', margin: 0 }}>{COMPANY_EMAIL}</p>
              </div>
            </motion.a>

            {/* Schedule Card */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              style={{
                background: 'rgba(26, 26, 46, 0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '14px', border: '1px solid rgba(196,163,90,0.15)',
                padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '18px',
                transition: `all 0.4s ${EASE}`,
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.border = '1px solid rgba(196,163,90,0.4)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 48px rgba(196,163,90,0.08)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.border = '1px solid rgba(196,163,90,0.15)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(196,163,90,0.15), rgba(196,163,90,0.03))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, color: '#C4A35A', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>HORARIO</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.7)', margin: 0 }}>{settings.schedule}</p>
              </div>
            </motion.div>

            {/* Location Card */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.3 }}
              style={{
                background: 'rgba(26, 26, 46, 0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '14px', border: '1px solid rgba(196,163,90,0.15)',
                padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '18px',
                transition: `all 0.4s ${EASE}`,
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.border = '1px solid rgba(196,163,90,0.4)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 48px rgba(196,163,90,0.08)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.border = '1px solid rgba(196,163,90,0.15)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(196,163,90,0.15), rgba(196,163,90,0.03))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, color: '#C4A35A', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>UBICACION</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.7)', margin: 0 }}>Bucaramanga, Colombia</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Main Content: Form + FAQ ── */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 20px 0' }}>
          <div className="pana-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>

            {/* ── Contact Form ── */}
            <motion.div {...fadeUp} style={{ minWidth: 0 }}>
              <div
                style={{
                  background: 'rgba(26, 26, 46, 0.55)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  borderRadius: '16px', border: '1px solid rgba(196,163,90,0.12)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                  padding: '40px', position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Top gold accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)' }} />

                {sent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 10px' }}>
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(56,161,105,0.1)', border: '2px solid rgba(56,161,105,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '26px', fontWeight: 800, color: '#FAFAFA', letterSpacing: '2px', margin: '0 0 12px' }}>MENSAJE ENVIADO</h3>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(250,250,250,0.5)', margin: '0 0 28px', lineHeight: 1.6 }}>
                      Gracias por contactarnos. Te responderemos en las proximas 24 horas.
                    </p>
                    <button
                      onClick={() => { setSent(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                      style={{
                        padding: '12px 32px', background: 'transparent', border: '1px solid rgba(196,163,90,0.4)', borderRadius: '10px',
                        color: '#C4A35A', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700,
                        letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', transition: `all 0.3s ${EASE}`,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,163,90,0.1)'; e.currentTarget.style.borderColor = '#C4A35A'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(196,163,90,0.4)'; }}
                    >
                      Enviar otro mensaje
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 800, color: '#C4A35A', letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0 }}>
                        ENVIAR MENSAJE
                      </h2>
                    </div>

                    <div className="pana-contact-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={labelStyle}>Nombre *</label>
                        <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} onFocus={focusHandler as any} onBlur={blurHandler as any} placeholder="Tu nombre" required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Telefono</label>
                        <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} onFocus={focusHandler as any} onBlur={blurHandler as any} placeholder="300 123 4567" style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Correo electronico *</label>
                      <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} onFocus={focusHandler as any} onBlur={blurHandler as any} placeholder="tu@email.com" required style={inputStyle} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Asunto *</label>
                      <select
                        value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} onFocus={focusHandler as any} onBlur={blurHandler as any} required
                        style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4A35A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '40px', cursor: 'pointer' }}
                      >
                        <option value="" style={{ background: '#1A1A2E', color: '#FAFAFA' }}>Seleccionar asunto</option>
                        {subjects.map((s) => (<option key={s} value={s} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>{s}</option>))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '28px' }}>
                      <label style={labelStyle}>Mensaje *</label>
                      <textarea
                        value={formData.message} onChange={(e) => handleChange('message', e.target.value)} onFocus={focusHandler as any} onBlur={blurHandler as any}
                        placeholder="Cuentanos en que podemos ayudarte..." required rows={5}
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                      />
                    </div>

                    <button
                      type="submit" disabled={sending}
                      style={{
                        width: '100%', padding: '16px 0',
                        background: sending ? 'rgba(196,163,90,0.4)' : 'linear-gradient(135deg, #C4A35A, #D4B76A)',
                        color: '#0D0D0D', border: 'none', borderRadius: '10px',
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 800,
                        letterSpacing: '3px', textTransform: 'uppercase',
                        cursor: sending ? 'not-allowed' : 'pointer', transition: `all 0.3s ${EASE}`,
                        boxShadow: sending ? 'none' : '0 4px 20px rgba(196,163,90,0.2)',
                      }}
                      onMouseEnter={(e) => { if (!sending) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(196,163,90,0.3)'; }}}
                      onMouseLeave={(e) => { if (!sending) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(196,163,90,0.2)'; }}}
                    >
                      {sending ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* ── FAQ Section ── */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} style={{ minWidth: 0 }}>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 800, color: '#C4A35A', letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0 }}>
                    PREGUNTAS FRECUENTES
                  </h2>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.4)', margin: 0, lineHeight: 1.6 }}>
                  Encuentra respuestas rapidas a las dudas mas comunes.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      style={{
                        background: isOpen ? 'rgba(26, 26, 46, 0.7)' : 'rgba(26, 26, 46, 0.45)',
                        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        border: isOpen ? '1px solid rgba(196,163,90,0.25)' : '1px solid rgba(196,163,90,0.08)',
                        overflow: 'hidden', transition: `all 0.3s ${EASE}`,
                      }}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        style={{
                          width: '100%', padding: '20px 24px', background: 'transparent', border: 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          cursor: 'pointer', gap: '16px',
                        }}
                      >
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: isOpen ? '#C4A35A' : '#FAFAFA', textAlign: 'left', transition: `color 0.3s ${EASE}` }}>
                          {faq.q}
                        </span>
                        <motion.svg
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#C4A35A' : 'rgba(250,250,250,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ flexShrink: 0 }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </motion.svg>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 24px 20px', borderTop: '1px solid rgba(196,163,90,0.08)' }}>
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.55)', lineHeight: 1.7, margin: '16px 0 0' }}>
                                {faq.a}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Social Media Section */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} style={{ marginTop: '32px' }}>
                <div
                  style={{
                    background: 'rgba(26, 26, 46, 0.55)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '16px', border: '1px solid rgba(196,163,90,0.12)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
                    padding: '32px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                    </svg>
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
                      SIGUENOS
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {[
                      { name: 'Instagram', href: 'https://instagram.com/panarabbids', color: '#E1306C', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                      { name: 'TikTok', href: 'https://tiktok.com/@panarabbids', color: '#00F2EA', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg> },
                      { name: 'Facebook', href: 'https://facebook.com/panarabbids', color: '#1877F2', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
                    ].map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                          padding: '18px 12px', borderRadius: '12px',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                          textDecoration: 'none', color: 'rgba(250,250,250,0.6)',
                          transition: `all 0.3s ${EASE}`, cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = social.color; e.currentTarget.style.borderColor = social.color + '40'; e.currentTarget.style.background = social.color + '10'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(250,250,250,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {social.icon}
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                          {social.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: '80px' }} />
      </div>

      {/* ── Responsive Styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .pana-contact-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .pana-contact-form-row {
            grid-template-columns: 1fr !important;
          }
          .pana-contact-form input,
          .pana-contact-form textarea,
          .pana-contact-form select {
            font-size: 16px !important;
          }
        }
        input::placeholder, textarea::placeholder {
          color: rgba(250,250,250,0.25) !important;
        }
      `}</style>
    </>
  );
};

export default ContactPage;
