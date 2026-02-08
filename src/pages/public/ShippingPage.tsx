import { motion } from 'framer-motion';
import { SEOHead } from '../../components/common';

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

const shippingInfo = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Tiempos de entrega',
    items: [
      'Bucaramanga y area metropolitana: 1-2 d\u00EDas h\u00E1biles',
      'Principales ciudades: 2-4 d\u00EDas h\u00E1biles',
      'Resto del pa\u00EDs: 4-7 d\u00EDas h\u00E1biles',
      'Los tiempos comienzan a contar desde la confirmaci\u00F3n del pago',
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: 'Costos de env\u00EDo',
    items: [
      'Env\u00EDo est\u00E1ndar: $12.000 – $18.000 COP seg\u00FAn destino',
      'Env\u00EDo gratis en compras superiores a $150.000 COP',
      'Env\u00EDo express disponible por un costo adicional',
      'El costo exacto se calcula en el checkout seg\u00FAn tu ubicaci\u00F3n',
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    title: 'Seguimiento',
    items: [
      'Recibir\u00E1s un c\u00F3digo de seguimiento por WhatsApp y correo',
      'Puedes rastrear tu pedido en nuestra p\u00E1gina de rastreo',
      'Te notificamos cada cambio de estado de tu pedido',
      'Contactanos si tu pedido no llega en el tiempo estimado',
    ],
  },
];

const returnsInfo = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      </svg>
    ),
    title: 'Pol\u00EDtica de devoluciones',
    items: [
      'Tienes 7 d\u00EDas h\u00E1biles desde la recepci\u00F3n para solicitar una devoluci\u00F3n',
      'El producto debe estar sin usar, con etiquetas y empaque original',
      'Las gorras personalizadas o de edici\u00F3n limitada no aplican para devoluci\u00F3n',
      'El reembolso se procesa en 5-10 d\u00EDas h\u00E1biles al m\u00E9todo de pago original',
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
    title: 'Cambios',
    items: [
      'Puedes cambiar tu gorra por otra talla o modelo dentro de los 7 d\u00EDas',
      'El producto debe estar en perfecto estado',
      'Si el nuevo producto tiene un precio mayor, se cobra la diferencia',
      'El env\u00EDo del cambio corre por cuenta del cliente',
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: 'No aplican devoluciones en',
    items: [
      'Gorras usadas, lavadas o con se\u00F1ales de uso',
      'Productos sin empaque original o etiquetas',
      'Gorras con personalizaci\u00F3n o bordado especial',
      'Compras realizadas hace m\u00E1s de 7 d\u00EDas h\u00E1biles',
    ],
  },
];

const ShippingPage = () => {
  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    color: '#C4A35A',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  return (
    <>
      <SEOHead
        title="Env\u00EDos y Devoluciones"
        description="Informaci\u00F3n sobre env\u00EDos, tiempos de entrega, costos y pol\u00EDtica de devoluciones en Pana Rabbids."
      />

      <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
        {/* Hero */}
        <div
          style={{
            position: 'relative',
            minHeight: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 50%, #0D0D0D 100%)',
          }}
        >
          <div style={{ position: 'absolute', top: '20%', left: '5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(196,163,90,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(transparent, #0D0D0D)', pointerEvents: 'none' }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: 'relative', textAlign: 'center', padding: '80px 20px 60px', zIndex: 1 }}
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              style={{ width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 28px', background: 'linear-gradient(135deg, rgba(196,163,90,0.15), rgba(196,163,90,0.05))', border: '1px solid rgba(196,163,90,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(196,163,90,0.1)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </motion.div>
            <motion.div initial={{ width: 0 }} animate={{ width: '50px' }} transition={{ duration: 0.5, delay: 0.4 }} style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)', margin: '0 auto 24px' }} />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, color: '#FAFAFA', letterSpacing: '5px', textTransform: 'uppercase', margin: '0 0 16px' }}>
              ENV{'\u00CD'}OS Y DEVOLUCIONES
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'rgba(250,250,250,0.5)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Todo lo que necesitas saber sobre nuestros envios y politica de devoluciones.
            </p>
          </motion.div>
        </div>

        {/* Shipping Section */}
        <div style={{ maxWidth: '800px', margin: '-20px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <motion.div {...fadeUp} style={sectionTitleStyle}>
            <div style={{ width: '32px', height: '1px', background: '#C4A35A' }} />
            ENV{'\u00CD'}OS
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '64px' }}>
            {shippingInfo.map((section, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                style={{
                  background: 'rgba(26, 26, 46, 0.55)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '14px',
                  border: '1px solid rgba(196,163,90,0.1)',
                  padding: '28px',
                  transition: `all 0.4s ${EASE}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(196,163,90,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(196,163,90,0.1)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(196,163,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {section.icon}
                  </div>
                  <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
                    {section.title}
                  </h3>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.items.map((item, j) => (
                    <li key={j} style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.6)', lineHeight: 1.6 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Returns Section */}
          <motion.div {...fadeUp} style={sectionTitleStyle}>
            <div style={{ width: '32px', height: '1px', background: '#C4A35A' }} />
            DEVOLUCIONES Y CAMBIOS
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {returnsInfo.map((section, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                style={{
                  background: 'rgba(26, 26, 46, 0.55)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '14px',
                  border: '1px solid rgba(196,163,90,0.1)',
                  padding: '28px',
                  transition: `all 0.4s ${EASE}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(196,163,90,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(196,163,90,0.1)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(196,163,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {section.icon}
                  </div>
                  <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
                    {section.title}
                  </h3>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.items.map((item, j) => (
                    <li key={j} style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.6)', lineHeight: 1.6 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ height: '80px' }} />
      </div>
    </>
  );
};

export default ShippingPage;
