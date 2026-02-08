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
    title: '1. Aceptaci\u00F3n de t\u00E9rminos',
    content: 'Al acceder y utilizar el sitio web de PlexifyCaps (plexifycaps.com), aceptas estos T\u00E9rminos y Condiciones en su totalidad. Si no est\u00E1s de acuerdo con alguno de estos t\u00E9rminos, te pedimos que no utilices nuestro sitio web ni realices compras a trav\u00E9s del mismo.',
  },
  {
    title: '2. Informaci\u00F3n de la empresa',
    content: 'PlexifyCaps es una marca colombiana dedicada a la comercializaci\u00F3n de gorras premium originales. Operamos desde Bucaramanga, Santander, Colombia. Para cualquier consulta puedes contactarnos a trav\u00E9s de nuestros canales oficiales.',
  },
  {
    title: '3. Productos y precios',
    content: 'Todos nuestros productos son 100% originales y provienen de distribuidores autorizados. Los precios est\u00E1n expresados en Pesos Colombianos (COP) e incluyen IVA. Nos reservamos el derecho de modificar precios sin previo aviso. El precio aplicable ser\u00E1 el vigente al momento de realizar tu compra.',
  },
  {
    title: '4. Proceso de compra',
    content: 'Al realizar un pedido a trav\u00E9s de nuestra tienda en l\u00EDnea, declaras que eres mayor de edad y que la informaci\u00F3n proporcionada es veraz y completa. Una vez confirmado el pago, recibir\u00E1s una confirmaci\u00F3n por correo electr\u00F3nico y WhatsApp con los detalles de tu pedido.',
  },
  {
    title: '5. M\u00E9todos de pago',
    content: 'Aceptamos pagos a trav\u00E9s de tarjeta de cr\u00E9dito y d\u00E9bito (Visa, Mastercard, American Express), PSE, Nequi, Daviplata y transferencia bancaria. Todos los pagos son procesados de forma segura a trav\u00E9s de nuestra pasarela de pagos certificada. No almacenamos datos bancarios de nuestros clientes.',
  },
  {
    title: '6. Env\u00EDos',
    content: 'Realizamos env\u00EDos a todo el territorio colombiano. Los tiempos de entrega var\u00EDan seg\u00FAn la ubicaci\u00F3n: Bucaramanga y \u00E1rea metropolitana (1-2 d\u00EDas h\u00E1biles), principales ciudades (2-4 d\u00EDas), resto del pa\u00EDs (4-7 d\u00EDas h\u00E1biles). Los env\u00EDos son gratuitos en compras superiores a $150.000 COP.',
  },
  {
    title: '7. Devoluciones y cambios',
    content: 'Tienes 7 d\u00EDas h\u00E1biles desde la recepci\u00F3n del producto para solicitar una devoluci\u00F3n o cambio. El producto debe estar sin usar, con etiquetas originales y en su empaque. Las gorras personalizadas o de edici\u00F3n limitada no aplican para devoluci\u00F3n. El reembolso se procesa en 5-10 d\u00EDas h\u00E1biles al m\u00E9todo de pago original.',
  },
  {
    title: '8. Propiedad intelectual',
    content: 'Todo el contenido del sitio web de PlexifyCaps, incluyendo textos, im\u00E1genes, logos, dise\u00F1os y c\u00F3digo, est\u00E1 protegido por derechos de autor. Queda prohibida su reproducci\u00F3n, distribuci\u00F3n o uso sin autorizaci\u00F3n previa por escrito.',
  },
  {
    title: '9. Cuenta de usuario',
    content: 'Al crear una cuenta en PlexifyCaps, eres responsable de mantener la confidencialidad de tus credenciales. Nos reservamos el derecho de suspender o eliminar cuentas que infrinjan estos t\u00E9rminos o que muestren actividad sospechosa.',
  },
  {
    title: '10. Modificaciones',
    content: 'PlexifyCaps se reserva el derecho de modificar estos T\u00E9rminos y Condiciones en cualquier momento. Los cambios entrar\u00E1n en vigor desde su publicaci\u00F3n en el sitio web. Es responsabilidad del usuario revisar peri\u00F3dicamente estos t\u00E9rminos.',
  },
];

const TermsPage = () => {
  return (
    <>
      <SEOHead
        title="T\u00E9rminos y Condiciones"
        description="T\u00E9rminos y condiciones de uso del sitio web y compras en PlexifyCaps. Lee nuestras pol\u00EDticas de compra, env\u00EDos y devoluciones."
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
              T{'\u00C9'}RMINOS Y CONDICIONES
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
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(250,250,250,0.6)', lineHeight: 1.8, margin: 0 }}>
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div style={{ height: '80px' }} />
      </div>
    </>
  );
};

export default TermsPage;
