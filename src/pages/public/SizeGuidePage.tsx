import { motion } from 'framer-motion';
import { SEOHead } from '../../components/common';

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

const sizes = [
  { label: 'S', head: '54 – 55 cm', us: '6 3/4 – 6 7/8' },
  { label: 'M', head: '56 – 57 cm', us: '7 – 7 1/8' },
  { label: 'L', head: '58 – 59 cm', us: '7 1/4 – 7 3/8' },
  { label: 'XL', head: '60 – 61 cm', us: '7 1/2 – 7 5/8' },
  { label: 'One Size', head: '56 – 62 cm', us: 'Ajustable' },
];

const tips = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: 'Como medir tu cabeza',
    desc: 'Usa una cinta metrica flexible. Coloca la cinta alrededor de tu cabeza, justo por encima de las cejas y las orejas, donde normalmente usarias una gorra.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Ajuste perfecto',
    desc: 'Las gorras con snapback y strapback son ajustables (One Size). Las gorras fitted vienen en tallas especificas S, M, L y XL.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    title: 'Entre dos tallas?',
    desc: 'Si estas entre dos tallas, te recomendamos elegir la talla mas grande para mayor comodidad. Las gorras tienden a ajustarse con el uso.',
  },
];

const SizeGuidePage = () => {
  const cellStyle: React.CSSProperties = {
    padding: '16px 20px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'rgba(250,250,250,0.8)',
    borderBottom: '1px solid rgba(196,163,90,0.08)',
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '11px',
    fontWeight: 700,
    color: '#C4A35A',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    background: 'rgba(196,163,90,0.06)',
  };

  return (
    <>
      <SEOHead
        title="Gu\u00EDa de Tallas"
        description="Encuentra tu talla perfecta de gorra. Gu\u00EDa de medidas y consejos para elegir la talla correcta en PlexifyCaps."
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
          <div style={{ position: 'absolute', top: '15%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(196,163,90,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
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
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </motion.div>
            <motion.div initial={{ width: 0 }} animate={{ width: '50px' }} transition={{ duration: 0.5, delay: 0.4 }} style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)', margin: '0 auto 24px' }} />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, color: '#FAFAFA', letterSpacing: '5px', textTransform: 'uppercase', margin: '0 0 16px' }}>
              GU{'\u00CD'}A DE TALLAS
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'rgba(250,250,250,0.5)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Encuentra la talla perfecta para tu nueva gorra.
            </p>
          </motion.div>
        </div>

        {/* Size Table */}
        <div style={{ maxWidth: '700px', margin: '-20px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <motion.div {...fadeUp}>
            <div
              style={{
                background: 'rgba(26, 26, 46, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '16px',
                border: '1px solid rgba(196,163,90,0.12)',
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)' }} />
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={headerCellStyle}>Talla</th>
                      <th style={headerCellStyle}>Circunferencia</th>
                      <th style={headerCellStyle}>Talla US</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((s, i) => (
                      <tr
                        key={s.label}
                        style={{
                          background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                          transition: `background 0.3s ${EASE}`,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,163,90,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'; }}
                      >
                        <td style={{ ...cellStyle, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: '#C4A35A', letterSpacing: '1px' }}>
                          {s.label}
                        </td>
                        <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
                          {s.head}
                        </td>
                        <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
                          {s.us}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tips */}
        <div style={{ maxWidth: '700px', margin: '48px auto 0', padding: '0 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                style={{
                  background: 'rgba(26, 26, 46, 0.5)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '14px',
                  border: '1px solid rgba(196,163,90,0.1)',
                  padding: '24px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                  transition: `all 0.4s ${EASE}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(196,163,90,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(196,163,90,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(196,163,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {tip.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 8px' }}>
                    {tip.title}
                  </h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250,250,250,0.55)', lineHeight: 1.7, margin: 0 }}>
                    {tip.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ height: '80px' }} />
      </div>
    </>
  );
};

export default SizeGuidePage;
