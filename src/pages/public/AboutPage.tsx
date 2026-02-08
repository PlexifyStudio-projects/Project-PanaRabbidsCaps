// ============================================================
// Pana Rabbids - AboutPage
// Premium about page with brand story, values, stats
// All inline styles - no external CSS dependencies
// ============================================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SEOHead } from '../../components/common';
import { HERO_IMAGES } from '../../data/productDataService';
import { PRODUCTS } from '../../data/mockProducts';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

const values = [
  {
    title: 'AUTENTICIDAD',
    description:
      'Cada gorra que vendemos es 100% original. Sin copias, sin imitaciones. Solo lo real.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: 'CALIDAD',
    description:
      'Seleccionamos solo las mejores marcas y materiales. Cada pieza pasa por un control riguroso.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: 'ESTILO',
    description:
      'No seguimos tendencias, las creamos. Cada diseno refleja la esencia de la cultura urbana colombiana.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" />
        <line x1="4" y1="21" x2="20" y2="21" />
        <line x1="12" y1="16" x2="12" y2="21" />
      </svg>
    ),
  },
];

function getRealStats() {
  try {
    const raw = localStorage.getItem('pana_orders') || '[]';
    const orders = JSON.parse(raw) as { customer: { email: string }; items: { quantity: number }[] }[];

    const uniqueEmails = new Set<string>();
    let totalGorras = 0;

    for (const order of orders) {
      if (order.customer?.email) uniqueEmails.add(order.customer.email.toLowerCase());
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          totalGorras += item.quantity || 1;
        }
      }
    }

    return { clientes: uniqueEmails.size, gorras: totalGorras };
  } catch {
    return { clientes: 0, gorras: 0 };
  }
}

const AboutPage = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const realStats = useMemo(() => getRealStats(), []);
  const totalDesigns = PRODUCTS.filter(p => p.isActive).length;

  const stats = [
    { value: realStats.clientes.toLocaleString('es-CO'), label: 'Clientes satisfechos' },
    { value: realStats.gorras.toLocaleString('es-CO'), label: 'Gorras vendidas' },
    { value: `+${totalDesigns}`, label: 'Diseños disponibles' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <>
      <SEOHead
        title="Sobre Nosotros"
        description="Conoce la historia de Pana Rabbids. Nacimos de la pasion por las gorras y la cultura urbana colombiana."
      />

      <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
        {/* Hero Section */}
        <div
          style={{
            position: 'relative',
            height: '60vh',
            minHeight: '400px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={HERO_IMAGES.brand}
            alt="Pana Rabbids - Sobre Nosotros"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.3)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(13, 13, 13, 0.3) 0%, rgba(13, 13, 13, 0.8) 100%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'relative',
              textAlign: 'center',
              padding: '0 20px',
              zIndex: 1,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                height: '2px',
                background: '#C4A35A',
                margin: '0 auto 24px auto',
              }}
            />
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '52px',
                fontWeight: 800,
                color: '#FAFAFA',
                letterSpacing: '6px',
                textTransform: 'uppercase',
                margin: '0 0 16px 0',
              }}
            >
              SOBRE NOSOTROS
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                color: 'rgba(250, 250, 250, 0.6)',
                maxWidth: '500px',
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              La historia detras de tu marca de gorras favorita
            </p>
          </motion.div>
        </div>

        {/* Brand Story */}
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '80px 20px',
          }}
        >
          <motion.div {...fadeInUp} style={{ textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                color: '#C4A35A',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              NUESTRA HISTORIA
            </span>
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '36px',
                fontWeight: 800,
                color: '#FAFAFA',
                letterSpacing: '2px',
                margin: '0 0 32px 0',
                lineHeight: 1.2,
              }}
            >
              NACIMOS DE LA PASION POR LAS GORRAS Y LA CULTURA URBANA COLOMBIANA
            </h2>
            <div
              style={{
                width: '60px',
                height: '2px',
                background: '#C4A35A',
                margin: '0 auto 32px auto',
              }}
            />
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                color: 'rgba(250, 250, 250, 0.65)',
                lineHeight: 1.8,
                maxWidth: '700px',
                margin: '0 auto 24px auto',
              }}
            >
              Pana Rabbids nacio en las calles de Bucaramanga, donde la moda urbana se mezcla con la identidad latina. Lo que empezo como una pasion por coleccionar gorras se convirtio en una mision: traer las mejores gorras del mundo a Colombia, con el estilo y la actitud que nos define.
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                color: 'rgba(250, 250, 250, 0.65)',
                lineHeight: 1.8,
                maxWidth: '700px',
                margin: '0 auto',
              }}
            >
              Cada gorra que ofrecemos es cuidadosamente seleccionada. Trabajamos con las marcas mas reconocidas del mundo y creamos nuestras propias ediciones limitadas que no encontraras en ningun otro lugar. Porque para nosotros, una gorra no es solo un accesorio. Es una declaracion.
            </p>
          </motion.div>
        </div>

        {/* Mission & Vision */}
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 20px 80px 20px',
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap',
          }}
        >
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0 }}
            style={{
              flex: '1 1 48%',
              minWidth: '300px',
              background: '#1A1A2E',
              borderRadius: '12px',
              border: '1px solid rgba(196, 163, 90, 0.1)',
              padding: '40px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #C4A35A, transparent)',
              }}
            />
            <h3
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#C4A35A',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                margin: '0 0 16px 0',
              }}
            >
              NUESTRA MISION
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                color: 'rgba(250, 250, 250, 0.65)',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Democratizar el acceso a gorras premium en Colombia, ofreciendo productos originales de las mejores marcas del mundo con un servicio excepcional, envios rapidos y la mejor experiencia de compra online para los amantes de la cultura urbana.
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.15 }}
            style={{
              flex: '1 1 48%',
              minWidth: '300px',
              background: '#1A1A2E',
              borderRadius: '12px',
              border: '1px solid rgba(196, 163, 90, 0.1)',
              padding: '40px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #C4A35A)',
              }}
            />
            <h3
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#C4A35A',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                margin: '0 0 16px 0',
              }}
            >
              NUESTRA VISION
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                color: 'rgba(250, 250, 250, 0.65)',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Convertirnos en la referencia numero uno de gorras premium en Latinoamerica, siendo reconocidos por nuestra autenticidad, calidad y compromiso con la cultura streetwear. Queremos que cada persona que use una gorra Pana Rabbids sienta que lleva algo unico.
            </p>
          </motion.div>
        </div>

        {/* Values Section */}
        <div
          style={{
            background: '#1A1A2E',
            padding: '80px 20px',
          }}
        >
          <div
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
            }}
          >
            <motion.div
              {...fadeInUp}
              style={{ textAlign: 'center', marginBottom: '60px' }}
            >
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#C4A35A',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                }}
              >
                LO QUE NOS DEFINE
              </span>
              <h2
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#FAFAFA',
                  letterSpacing: '2px',
                  margin: '16px 0 0 0',
                }}
              >
                NUESTROS VALORES
              </h2>
            </motion.div>

            <div
              style={{
                display: 'flex',
                gap: '32px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {values.map((val, idx) => (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  style={{
                    flex: '1 1 280px',
                    maxWidth: '340px',
                    background: '#0D0D0D',
                    borderRadius: '12px',
                    border: '1px solid rgba(196, 163, 90, 0.1)',
                    padding: '40px 32px',
                    textAlign: 'center',
                    transition: 'border-color 0.3s ease, transform 0.3s ease',
                    cursor: 'default',
                  }}
                  whileHover={{
                    y: -8,
                    borderColor: 'rgba(196, 163, 90, 0.3)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                  } as any}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: 'rgba(196, 163, 90, 0.06)',
                      border: '1px solid rgba(196, 163, 90, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px auto',
                    }}
                  >
                    {val.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#C4A35A',
                      letterSpacing: '3px',
                      margin: '0 0 12px 0',
                    }}
                  >
                    {val.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: 'rgba(250, 250, 250, 0.55)',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {val.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '80px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  flex: '1 1 200px',
                  maxWidth: '250px',
                  textAlign: 'center',
                  padding: '32px 20px',
                  background: '#1A1A2E',
                  borderRadius: '12px',
                  border: '1px solid rgba(196, 163, 90, 0.08)',
                }}
              >
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '36px',
                    fontWeight: 800,
                    color: '#C4A35A',
                    margin: '0 0 8px 0',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '13px',
                    color: 'rgba(250, 250, 250, 0.5)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Workshop Image Break */}
        <div
          style={{
            position: 'relative',
            height: '300px',
            overflow: 'hidden',
          }}
        >
          <img
            src={HERO_IMAGES.workshop}
            alt="Taller Pana Rabbids"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.3) saturate(0.8)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, #0D0D0D 0%, transparent 30%, transparent 70%, #0D0D0D 100%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '28px',
                fontWeight: 800,
                color: '#FAFAFA',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              HECHO CON{' '}
              <span style={{ color: '#C4A35A' }}>PASION</span>
              {' '}EN COLOMBIA
            </p>
          </motion.div>
        </div>

        {/* Newsletter CTA */}
        <div
          style={{
            maxWidth: '700px',
            margin: '0 auto',
            padding: '80px 20px',
            textAlign: 'center',
          }}
        >
          <motion.div {...fadeInUp}>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                color: '#C4A35A',
                letterSpacing: '3px',
                textTransform: 'uppercase',
              }}
            >
              MANTENTE CONECTADO
            </span>
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '32px',
                fontWeight: 800,
                color: '#FAFAFA',
                letterSpacing: '2px',
                margin: '16px 0 12px 0',
              }}
            >
              UNETE A LA FAMILIA
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                color: 'rgba(250, 250, 250, 0.5)',
                margin: '0 0 32px 0',
                lineHeight: 1.6,
              }}
            >
              Recibe novedades, lanzamientos exclusivos y descuentos antes que nadie.
            </p>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '20px',
                  background: 'rgba(56, 161, 105, 0.08)',
                  borderRadius: '8px',
                  border: '1px solid rgba(56, 161, 105, 0.2)',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '15px',
                    color: '#38A169',
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  Gracias por suscribirte. Pronto recibiras noticias.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                style={{
                  display: 'flex',
                  gap: '12px',
                  maxWidth: '500px',
                  margin: '0 auto',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  style={{
                    flex: 1,
                    minWidth: '250px',
                    padding: '14px 20px',
                    background: '#1A1A2E',
                    border: '1px solid rgba(196, 163, 90, 0.15)',
                    borderRadius: '8px',
                    color: '#FAFAFA',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#C4A35A';
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196, 163, 90, 0.15)';
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '14px 32px',
                    background: '#C4A35A',
                    color: '#0D0D0D',
                    border: 'none',
                    borderRadius: '8px',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#D4B76A';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#C4A35A';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  SUSCRIBIRME
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
