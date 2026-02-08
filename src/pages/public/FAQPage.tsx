import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEOHead } from '../../components/common';

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

const categories = [
  {
    title: 'Pedidos y env\u00EDos',
    faqs: [
      { q: '\u00BFCu\u00E1nto tarda el env\u00EDo?', a: 'Bucaramanga y \u00E1rea metropolitana: 1-2 d\u00EDas h\u00E1biles. Principales ciudades: 2-4 d\u00EDas. Resto del pa\u00EDs: 4-7 d\u00EDas h\u00E1biles. Los tiempos comienzan desde la confirmaci\u00F3n del pago.' },
      { q: '\u00BFCu\u00E1nto cuesta el env\u00EDo?', a: 'El env\u00EDo est\u00E1ndar cuesta entre $12.000 y $18.000 COP seg\u00FAn tu ubicaci\u00F3n. \u00A1Env\u00EDo gratis en compras mayores a $150.000 COP!' },
      { q: '\u00BFC\u00F3mo puedo rastrear mi pedido?', a: 'Una vez despachado tu pedido, recibir\u00E1s un c\u00F3digo de seguimiento por WhatsApp y correo electr\u00F3nico. Tambi\u00E9n puedes rastrearlo directamente en nuestra secci\u00F3n de Rastreo de Pedido.' },
      { q: '\u00BFHacen env\u00EDos a todo Colombia?', a: 'S\u00ED, realizamos env\u00EDos a todas las ciudades y municipios de Colombia a trav\u00E9s de transportadoras certificadas.' },
    ],
  },
  {
    title: 'Productos',
    faqs: [
      { q: '\u00BFTodas las gorras son originales?', a: 'Absolutamente. Trabajamos directamente con distribuidores autorizados de marcas como New Era, 47 Brand, Mitchell & Ness y m\u00E1s. Cada gorra viene con sus etiquetas y stickers originales.' },
      { q: '\u00BFC\u00F3mo elijo la talla correcta?', a: 'Consulta nuestra Gu\u00EDa de Tallas donde encontrar\u00E1s una tabla completa con medidas en cent\u00EDmetros y tallas US. Las gorras ajustables (snapback/strapback) son One Size y se adaptan a la mayor\u00EDa de cabezas.' },
      { q: '\u00BFLas gorras vienen con caja?', a: 'S\u00ED, todas nuestras gorras se env\u00EDan en caja protectora para asegurar que lleguen en perfecto estado.' },
      { q: '\u00BFTienen gorras de equipos espec\u00EDficos?', a: 'Manejamos una amplia variedad de gorras de MLB, NFL, NBA y m\u00E1s. Si buscas un equipo espec\u00EDfico que no encuentras en nuestro cat\u00E1logo, cont\u00E1ctanos por WhatsApp y te ayudamos a conseguirla.' },
    ],
  },
  {
    title: 'Pagos',
    faqs: [
      { q: '\u00BFQu\u00E9 m\u00E9todos de pago aceptan?', a: 'Aceptamos tarjeta de cr\u00E9dito/d\u00E9bito (Visa, Mastercard, American Express), PSE, Nequi, Daviplata y transferencia bancaria a trav\u00E9s de nuestra pasarela de pagos segura.' },
      { q: '\u00BFEs seguro comprar en l\u00EDnea?', a: 'Totalmente. Utilizamos encriptaci\u00F3n SSL y procesamos los pagos a trav\u00E9s de Wompi, una pasarela certificada. Nunca almacenamos datos de tarjeta.' },
      { q: '\u00BFPuedo pagar contra entrega?', a: 'Por el momento no manejamos pago contra entrega, pero ofrecemos m\u00FAltiples opciones de pago digital seguras.' },
    ],
  },
  {
    title: 'Devoluciones y cambios',
    faqs: [
      { q: '\u00BFPuedo devolver una gorra?', a: 'S\u00ED, tienes 7 d\u00EDas h\u00E1biles desde la recepci\u00F3n para solicitar una devoluci\u00F3n. El producto debe estar sin usar, con etiquetas y empaque original.' },
      { q: '\u00BFC\u00F3mo solicito un cambio?', a: 'Cont\u00E1ctanos por WhatsApp o email indicando tu n\u00FAmero de pedido y el motivo del cambio. Te daremos instrucciones para el env\u00EDo y procesaremos el cambio lo antes posible.' },
      { q: '\u00BFMe devuelven el dinero?', a: 'S\u00ED, si cumples con la pol\u00EDtica de devoluci\u00F3n, el reembolso se procesa en 5-10 d\u00EDas h\u00E1biles al m\u00E9todo de pago original.' },
    ],
  },
];

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleFaq = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <SEOHead
        title="Preguntas Frecuentes"
        description="Resuelve tus dudas sobre pedidos, env\u00EDos, pagos, devoluciones y productos en Pana Rabbids."
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
          <div style={{ position: 'absolute', top: '10%', right: '15%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(196,163,90,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
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
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </motion.div>
            <motion.div initial={{ width: 0 }} animate={{ width: '50px' }} transition={{ duration: 0.5, delay: 0.4 }} style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)', margin: '0 auto 24px' }} />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, color: '#FAFAFA', letterSpacing: '5px', textTransform: 'uppercase', margin: '0 0 16px' }}>
              PREGUNTAS FRECUENTES
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'rgba(250,250,250,0.5)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Encuentra respuestas r{'\u00E1'}pidas a las dudas m{'\u00E1'}s comunes.
            </p>
          </motion.div>
        </div>

        {/* FAQ Categories */}
        <div style={{ maxWidth: '800px', margin: '-20px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          {categories.map((cat, catIdx) => (
            <div key={catIdx} style={{ marginBottom: '48px' }}>
              <motion.div
                {...fadeUp}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#C4A35A',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ width: '32px', height: '1px', background: '#C4A35A' }} />
                {cat.title}
              </motion.div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cat.faqs.map((faq, faqIdx) => {
                  const key = `${catIdx}-${faqIdx}`;
                  const isOpen = openItems[key] || false;
                  return (
                    <motion.div
                      key={key}
                      {...fadeUp}
                      transition={{ ...fadeUp.transition, delay: faqIdx * 0.06 }}
                      style={{
                        background: isOpen ? 'rgba(26, 26, 46, 0.7)' : 'rgba(26, 26, 46, 0.45)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        border: isOpen ? '1px solid rgba(196,163,90,0.25)' : '1px solid rgba(196,163,90,0.08)',
                        overflow: 'hidden',
                        transition: `all 0.3s ${EASE}`,
                      }}
                    >
                      <button
                        onClick={() => toggleFaq(key)}
                        style={{
                          width: '100%',
                          padding: '20px 24px',
                          background: 'transparent',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          gap: '16px',
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
            </div>
          ))}

          {/* CTA */}
          <motion.div
            {...fadeUp}
            style={{
              background: 'rgba(26, 26, 46, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '16px',
              border: '1px solid rgba(196,163,90,0.15)',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '22px', fontWeight: 800, color: '#FAFAFA', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px' }}>
              {'\u00BF'}No encontraste lo que buscabas?
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(250,250,250,0.5)', margin: '0 0 24px', lineHeight: 1.6 }}>
              Nuestro equipo est{'\u00E1'} listo para ayudarte con cualquier duda adicional.
            </p>
            <Link
              to="/contacto"
              style={{
                display: 'inline-block',
                padding: '14px 40px',
                background: 'linear-gradient(135deg, #C4A35A, #D4B76A)',
                color: '#0D0D0D',
                border: 'none',
                borderRadius: '10px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: `all 0.3s ${EASE}`,
                boxShadow: '0 4px 20px rgba(196,163,90,0.2)',
              }}
            >
              CONTACTANOS
            </Link>
          </motion.div>
        </div>

        <div style={{ height: '80px' }} />
      </div>
    </>
  );
};

export default FAQPage;
