import { motion } from 'framer-motion';
import { SEOHead } from '../../components/common';

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

const sections = [
  {
    title: '1. Informaci\u00F3n que recopilamos',
    content: 'Recopilamos informaci\u00F3n personal que nos proporcionas voluntariamente al crear una cuenta, realizar una compra o contactarnos. Esto incluye: nombre completo, correo electr\u00F3nico, n\u00FAmero de tel\u00E9fono, direcci\u00F3n de env\u00EDo, departamento y ciudad.',
  },
  {
    title: '2. Uso de la informaci\u00F3n',
    items: [
      'Procesar y entregar tus pedidos correctamente',
      'Enviarte confirmaciones de pedido y actualizaciones de env\u00EDo',
      'Comunicarnos contigo sobre tu cuenta o consultas',
      'Mejorar nuestros productos y servicios',
      'Enviarte informaci\u00F3n sobre ofertas y nuevos lanzamientos (solo si lo autorizas)',
    ],
  },
  {
    title: '3. Protecci\u00F3n de datos',
    content: 'Implementamos medidas de seguridad t\u00E9cnicas y organizativas para proteger tu informaci\u00F3n personal contra acceso no autorizado, alteraci\u00F3n, divulgaci\u00F3n o destrucci\u00F3n. Los pagos se procesan a trav\u00E9s de pasarelas certificadas y nunca almacenamos datos bancarios o de tarjetas de cr\u00E9dito.',
  },
  {
    title: '4. Compartir informaci\u00F3n',
    content: 'No vendemos, alquilamos ni compartimos tu informaci\u00F3n personal con terceros para fines de marketing. Solo compartimos datos con: transportadoras autorizadas (para entregas), pasarelas de pago (para procesar transacciones) y autoridades competentes (cuando sea requerido por ley).',
  },
  {
    title: '5. Cookies y tecnolog\u00EDas similares',
    content: 'Nuestro sitio web utiliza cookies y tecnolog\u00EDas similares para mejorar tu experiencia de navegaci\u00F3n, recordar tus preferencias y analizar el tr\u00E1fico del sitio. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.',
  },
  {
    title: '6. Tus derechos',
    items: [
      'Acceder a la informaci\u00F3n personal que tenemos sobre ti',
      'Solicitar la correcci\u00F3n de datos inexactos',
      'Solicitar la eliminaci\u00F3n de tu cuenta y datos personales',
      'Revocar el consentimiento para comunicaciones de marketing',
      'Presentar una queja ante la autoridad de protecci\u00F3n de datos',
    ],
  },
  {
    title: '7. Retenci\u00F3n de datos',
    content: 'Conservamos tu informaci\u00F3n personal mientras mantengas una cuenta activa con nosotros o mientras sea necesario para cumplir con nuestras obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.',
  },
  {
    title: '8. Menores de edad',
    content: 'Nuestro sitio web no est\u00E1 dirigido a menores de 18 a\u00F1os. No recopilamos intencionalmente informaci\u00F3n personal de menores. Si eres padre o tutor y crees que tu hijo nos ha proporcionado informaci\u00F3n personal, cont\u00E1ctanos para eliminarla.',
  },
  {
    title: '9. Cambios en esta pol\u00EDtica',
    content: 'Podemos actualizar esta Pol\u00EDtica de Privacidad peri\u00F3dicamente. Te notificaremos sobre cambios significativos a trav\u00E9s de un aviso en nuestro sitio web o por correo electr\u00F3nico. Te recomendamos revisar esta pol\u00EDtica regularmente.',
  },
  {
    title: '10. Contacto',
    content: 'Si tienes preguntas sobre esta Pol\u00EDtica de Privacidad o sobre c\u00F3mo manejamos tu informaci\u00F3n personal, puedes contactarnos a trav\u00E9s de nuestro formulario de contacto, por WhatsApp o correo electr\u00F3nico. Responderemos tu solicitud en un plazo m\u00E1ximo de 15 d\u00EDas h\u00E1biles.',
  },
];

const PrivacyPage = () => {
  return (
    <>
      <SEOHead
        title="Pol\u00EDtica de Privacidad"
        description="Conoce c\u00F3mo PlexifyCaps protege y maneja tu informaci\u00F3n personal. Pol\u00EDtica de privacidad y protecci\u00F3n de datos."
      />

      <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
        {/* Hero */}
        <div
          style={{
            position: 'relative',
            minHeight: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 50%, #0D0D0D 100%)',
          }}
        >
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(transparent, #0D0D0D)', pointerEvents: 'none' }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: 'relative', textAlign: 'center', padding: '80px 20px 60px', zIndex: 1 }}
          >
            <motion.div initial={{ width: 0 }} animate={{ width: '50px' }} transition={{ duration: 0.5, delay: 0.3 }} style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)', margin: '0 auto 24px' }} />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#FAFAFA', letterSpacing: '5px', textTransform: 'uppercase', margin: '0 0 12px' }}>
              POL{'\u00CD'}TICA DE PRIVACIDAD
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(250,250,250,0.4)', margin: 0 }}>
              {'\u00DA'}ltima actualizaci{'\u00F3'}n: Febrero 2026
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '750px', margin: '-20px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          {sections.map((section, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.05 }}
              style={{
                marginBottom: '32px',
                padding: '28px',
                background: i % 2 === 0 ? 'rgba(26, 26, 46, 0.35)' : 'transparent',
                borderRadius: '14px',
                border: i % 2 === 0 ? '1px solid rgba(196,163,90,0.06)' : 'none',
                transition: `all 0.4s ${EASE}`,
              }}
            >
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '17px', fontWeight: 700, color: '#C4A35A', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 14px' }}>
                {section.title}
              </h2>
              {section.content ? (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(250,250,250,0.6)', lineHeight: 1.8, margin: 0 }}>
                  {section.content}
                </p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {section.items?.map((item, j) => (
                    <li key={j} style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(250,250,250,0.6)', lineHeight: 1.7 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>

        <div style={{ height: '80px' }} />
      </div>
    </>
  );
};

export default PrivacyPage;
