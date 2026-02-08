// ============================================================
// Pana Rabbids - Premium Footer Component (v2 Rewrite)
// Newsletter + 4-column layout + Trust strip + Payment methods + Copyright
// Visually alive dark theme with gold accents & dynamic settings
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PUBLIC_ROUTES } from '../../config/routes';
import { loadStoreSettings, formatWhatsApp, getWhatsAppLink } from '../../data/settingsService';
import { formatCOP } from '../../utils/formatCurrency';

// ── SVG Icon Components ─────────────────────────────────────

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.23 8.23 0 005.58 2.17v-3.43a4.85 4.85 0 01-3.58-1.59V6.69h3.58z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const EnvelopeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Payment Method SVG Badges ───────────────────────────────

const PaymentVisa = ({ hovered }: { hovered: boolean }) => (
  <svg width="56" height="36" viewBox="0 0 56 36" fill="none">
    <rect x="0.5" y="0.5" width="55" height="35" rx="3.5"
      stroke={hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}
      fill={hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'}
      style={{ transition: 'all 0.3s ease' }} />
    <text x="28" y="21" textAnchor="middle"
      fill={hovered ? '#1A1F71' : 'rgba(255,255,255,0.4)'}
      fontSize="12" fontWeight="700"
      fontFamily="'Barlow Condensed', sans-serif"
      letterSpacing="1"
      style={{ transition: 'fill 0.3s ease' }}>VISA</text>
  </svg>
);

const PaymentMastercard = ({ hovered }: { hovered: boolean }) => (
  <svg width="56" height="36" viewBox="0 0 56 36" fill="none">
    <rect x="0.5" y="0.5" width="55" height="35" rx="3.5"
      stroke={hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}
      fill={hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'}
      style={{ transition: 'all 0.3s ease' }} />
    {hovered ? (
      <>
        <circle cx="22" cy="18" r="7" fill="#EB001B" opacity="0.85" />
        <circle cx="34" cy="18" r="7" fill="#F79E1B" opacity="0.85" />
        <path d="M28 12.5a6.97 6.97 0 012 5.5 6.97 6.97 0 01-2 5.5 6.97 6.97 0 01-2-5.5 6.97 6.97 0 012-5.5z" fill="#FF5F00" opacity="0.85" />
      </>
    ) : (
      <text x="28" y="21" textAnchor="middle"
        fill="rgba(255,255,255,0.4)" fontSize="8.5" fontWeight="700"
        fontFamily="'Barlow Condensed', sans-serif" letterSpacing="0.5">MC</text>
    )}
  </svg>
);

const PaymentAmex = ({ hovered }: { hovered: boolean }) => (
  <svg width="56" height="36" viewBox="0 0 56 36" fill="none">
    <rect x="0.5" y="0.5" width="55" height="35" rx="3.5"
      stroke={hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}
      fill={hovered ? 'rgba(0,111,207,0.15)' : 'rgba(255,255,255,0.02)'}
      style={{ transition: 'all 0.3s ease' }} />
    <text x="28" y="21" textAnchor="middle"
      fill={hovered ? '#006FCF' : 'rgba(255,255,255,0.4)'}
      fontSize="8.5" fontWeight="700"
      fontFamily="'Barlow Condensed', sans-serif" letterSpacing="0.5"
      style={{ transition: 'fill 0.3s ease' }}>AMEX</text>
  </svg>
);

const PaymentPSE = ({ hovered }: { hovered: boolean }) => (
  <svg width="56" height="36" viewBox="0 0 56 36" fill="none">
    <rect x="0.5" y="0.5" width="55" height="35" rx="3.5"
      stroke={hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}
      fill={hovered ? 'rgba(0,156,222,0.1)' : 'rgba(255,255,255,0.02)'}
      style={{ transition: 'all 0.3s ease' }} />
    <text x="28" y="21" textAnchor="middle"
      fill={hovered ? '#009CDE' : 'rgba(255,255,255,0.4)'}
      fontSize="11" fontWeight="700"
      fontFamily="'Barlow Condensed', sans-serif" letterSpacing="1"
      style={{ transition: 'fill 0.3s ease' }}>PSE</text>
  </svg>
);

const PaymentNequi = ({ hovered }: { hovered: boolean }) => (
  <svg width="56" height="36" viewBox="0 0 56 36" fill="none">
    <rect x="0.5" y="0.5" width="55" height="35" rx="3.5"
      stroke={hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}
      fill={hovered ? 'rgba(200,0,130,0.1)' : 'rgba(255,255,255,0.02)'}
      style={{ transition: 'all 0.3s ease' }} />
    <text x="28" y="21" textAnchor="middle"
      fill={hovered ? '#C80082' : 'rgba(255,255,255,0.4)'}
      fontSize="9" fontWeight="700"
      fontFamily="'Barlow Condensed', sans-serif" letterSpacing="0.5"
      style={{ transition: 'fill 0.3s ease' }}>NEQUI</text>
  </svg>
);

const PaymentEfecty = ({ hovered }: { hovered: boolean }) => (
  <svg width="56" height="36" viewBox="0 0 56 36" fill="none">
    <rect x="0.5" y="0.5" width="55" height="35" rx="3.5"
      stroke={hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}
      fill={hovered ? 'rgba(255,193,7,0.1)' : 'rgba(255,255,255,0.02)'}
      style={{ transition: 'all 0.3s ease' }} />
    <text x="28" y="21" textAnchor="middle"
      fill={hovered ? '#FFC107' : 'rgba(255,255,255,0.4)'}
      fontSize="8" fontWeight="700"
      fontFamily="'Barlow Condensed', sans-serif" letterSpacing="0.5"
      style={{ transition: 'fill 0.3s ease' }}>EFECTY</text>
  </svg>
);

// ── Reusable Payment Badge Wrapper ──────────────────────────

const PaymentBadge = ({ children }: { children: (hovered: boolean) => React.ReactNode }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={{ cursor: 'default', lineHeight: 0 }}
    >
      {children(hovered)}
    </motion.div>
  );
};

// ── Social Icon Wrapper ─────────────────────────────────────

// Social colors per platform with enhanced glow effects
const SOCIAL_COLORS: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  instagram: {
    color: '#E1306C',
    bg: 'rgba(225, 48, 108, 0.12)',
    border: '#E1306C',
    glow: '0 0 24px rgba(225, 48, 108, 0.35), 0 0 8px rgba(131, 58, 180, 0.25)',
  },
  tiktok: {
    color: '#00F2EA',
    bg: 'rgba(0, 242, 234, 0.10)',
    border: '#00F2EA',
    glow: '0 0 24px rgba(0, 242, 234, 0.35), 0 0 8px rgba(0, 242, 234, 0.2)',
  },
  facebook: {
    color: '#1877F2',
    bg: 'rgba(24, 119, 242, 0.12)',
    border: '#1877F2',
    glow: '0 0 24px rgba(24, 119, 242, 0.35), 0 0 8px rgba(24, 119, 242, 0.2)',
  },
  twitter: {
    color: '#FAFAFA',
    bg: 'rgba(250, 250, 250, 0.08)',
    border: 'rgba(250, 250, 250, 0.4)',
    glow: '0 0 24px rgba(250, 250, 250, 0.2), 0 0 8px rgba(250, 250, 250, 0.15)',
  },
};

const SocialLink = ({ href, label, platform, children }: { href: string; label: string; platform: string; children: React.ReactNode }) => {
  const colors = SOCIAL_COLORS[platform] || SOCIAL_COLORS.twitter;
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        border: '1.5px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '50%',
        color: 'rgba(255, 255, 255, 0.6)',
        textDecoration: 'none',
        transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      whileHover={{ scale: 1.12 }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = colors.border;
        el.style.color = colors.color;
        el.style.background = colors.bg;
        el.style.boxShadow = colors.glow;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        el.style.color = 'rgba(255, 255, 255, 0.6)';
        el.style.background = 'transparent';
        el.style.boxShadow = 'none';
      }}
    >
      {children}
    </motion.a>
  );
};

// ── Footer Link Wrapper with Gold Dot Indicator ─────────────

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{
        color: hovered ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
        textDecoration: 'none',
        fontSize: '14px',
        lineHeight: 1,
        padding: '9px 0',
        paddingLeft: hovered ? '16px' : '0px',
        transition: 'color 0.3s ease, padding-left 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 400,
        letterSpacing: '0.3px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gold dot indicator */}
      <span
        style={{
          position: 'absolute',
          left: '0px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#C4A35A',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scale(1)' : 'scale(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      />
      {children}
    </Link>
  );
};

// ── Column Title Component ──────────────────────────────────

const ColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ marginBottom: '28px' }}>
    <h3
      style={{
        fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
        fontSize: '13px',
        fontWeight: 700,
        color: '#C4A35A',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        margin: 0,
        paddingBottom: '12px',
      }}
    >
      {children}
    </h3>
    <div
      style={{
        width: '40px',
        height: '2px',
        background: 'linear-gradient(90deg, #C4A35A, rgba(196, 163, 90, 0.3))',
        borderRadius: '1px',
      }}
    />
  </div>
);

// ── Contact Item Wrapper ────────────────────────────────────

const ContactItem = ({
  href,
  target,
  rel,
  icon,
  children,
  isLink = false,
}: {
  href?: string;
  target?: string;
  rel?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isLink?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const sharedStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: hovered ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '10px 12px',
    margin: '0 -12px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontFamily: "'Barlow', sans-serif",
    background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
    cursor: isLink ? 'pointer' : 'default',
  };

  const iconSpan = (
    <span style={{ color: '#C4A35A', flexShrink: 0, display: 'flex' }}>
      {icon}
    </span>
  );

  if (isLink && href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        style={sharedStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {iconSpan}
        {children}
      </a>
    );
  }

  return (
    <div
      style={sharedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {iconSpan}
      {children}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN FOOTER COMPONENT
// ══════════════════════════════════════════════════════════════

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load settings from service (reads from localStorage with defaults)
  const settings = useMemo(() => loadStoreSettings(), []);

  // Format free shipping threshold
  const freeShippingFormatted = useMemo(
    () => formatCOP(Number(settings.freeShippingThreshold)),
    [settings.freeShippingThreshold]
  );

  const handleSubscribe = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || isSubmitting) return;
      setIsSubmitting(true);
      // Simulate subscription API call
      setTimeout(() => {
        setIsSubscribed(true);
        setIsSubmitting(false);
      }, 1200);
    },
    [email, isSubmitting]
  );

  return (
    <footer
      style={{
        background: '#0F0F0F',
        fontFamily: "'Barlow', sans-serif",
        // Subtle noise texture via repeating gradient
        backgroundImage:
          'radial-gradient(ellipse at 20% 50%, rgba(196,163,90,0.015) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(196,163,90,0.01) 0%, transparent 50%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.003) 2px, rgba(255,255,255,0.003) 4px)',
      }}
    >
      {/* ── Gold Gradient Top Border (thicker 2px) ── */}
      <div
        style={{
          height: '2px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(196,163,90,0.15) 15%, #C4A35A 50%, rgba(196,163,90,0.15) 85%, transparent 100%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════
          NEWSLETTER SECTION
          ═══════════════════════════════════════════════════════ */}
      <div
        className="footer-newsletter"
        style={{
          background: 'rgba(196,163,90,0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div
          className="footer-newsletter__inner"
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '60px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '48px',
          }}
        >
          {/* Left: Heading + Description */}
          <div style={{ flex: '0 1 auto' }}>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#FAFAFA',
                textTransform: 'uppercase',
                letterSpacing: '5px',
                margin: '0 0 10px 0',
              }}
            >
              MANTENTE CONECTADO
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '14px',
                lineHeight: 1.6,
                margin: 0,
                letterSpacing: '0.3px',
                maxWidth: '420px',
              }}
            >
              Ofertas exclusivas, nuevos lanzamientos y noticias directamente a tu inbox
            </motion.p>
          </div>

          {/* Right: Email Form / Success */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ flex: '0 1 520px', minWidth: 0 }}
          >
            <AnimatePresence mode="wait">
              {!isSubscribed ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubscribe}
                  className="footer-newsletter__form"
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: '0',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s ease',
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196, 163, 90, 0.3)';
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo electr&#243;nico"
                    required
                    className="footer-newsletter__input"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#FAFAFA',
                      fontSize: '14px',
                      padding: '16px 20px',
                      fontFamily: "'Barlow', sans-serif",
                      letterSpacing: '0.5px',
                      minWidth: 0,
                    }}
                  />
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ backgroundColor: '#D4B86A' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: '#C4A35A',
                      border: 'none',
                      color: '#0A0A0A',
                      fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '2.5px',
                      padding: '16px 32px',
                      cursor: isSubmitting ? 'wait' : 'pointer',
                      transition: 'background 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #0A0A0A',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                        }}
                      />
                    ) : (
                      <>
                        SUSCRIBIRME
                        <ArrowRightIcon />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 24px',
                    background: 'rgba(196, 163, 90, 0.08)',
                    border: '1px solid rgba(196, 163, 90, 0.2)',
                    borderRadius: '4px',
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(196, 163, 90, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#C4A35A',
                      flexShrink: 0,
                    }}
                  >
                    <CheckIcon />
                  </motion.div>
                  <div>
                    <p
                      style={{
                        color: '#C4A35A',
                        fontSize: '14px',
                        fontWeight: 600,
                        margin: '0 0 2px 0',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {'\u00A1'}Gracias por suscribirte!
                    </p>
                    <p
                      style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '13px',
                        margin: 0,
                      }}
                    >
                      Pronto recibir{'\u00E1'}s las mejores ofertas en tu inbox
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN FOOTER - 4 COLUMN GRID
          ═══════════════════════════════════════════════════════ */}
      <div
        className="footer-main"
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '72px 48px 56px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '48px',
        }}
      >
        {/* ── Column 1: Brand ── */}
        <div className="footer-col footer-brand" style={{ display: 'flex', flexDirection: 'column' }}>
          <Link
            to={PUBLIC_ROUTES.HOME}
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
              fontSize: '24px',
              fontWeight: 800,
              color: '#C4A35A',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              marginBottom: '20px',
              textDecoration: 'none',
              display: 'inline-block',
              lineHeight: 1,
            }}
          >
            {settings.storeName.toUpperCase()}
          </Link>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: '14px',
              lineHeight: 1.7,
              maxWidth: '280px',
              margin: '0 0 32px 0',
              letterSpacing: '0.2px',
            }}
          >
            Las gorras m{'\u00E1'}s exclusivas de Colombia. Estilo, calidad y actitud.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <SocialLink href={settings.instagram} label="Instagram" platform="instagram">
              <InstagramIcon />
            </SocialLink>
            <SocialLink href={settings.tiktok} label="TikTok" platform="tiktok">
              <TikTokIcon />
            </SocialLink>
            <SocialLink href={settings.facebook} label="Facebook" platform="facebook">
              <FacebookIcon />
            </SocialLink>
            <SocialLink href={settings.twitter} label="Twitter / X" platform="twitter">
              <TwitterXIcon />
            </SocialLink>
          </div>
        </div>

        {/* ── Column 2: Tienda ── */}
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column' }}>
          <ColumnTitle>Tienda</ColumnTitle>
          <FooterLink to={PUBLIC_ROUTES.CATALOG}>
            Cat{'\u00E1'}logo
          </FooterLink>
          <FooterLink to={`${PUBLIC_ROUTES.CATALOG}?sort=newest`}>
            Nuevos Lanzamientos
          </FooterLink>
          <FooterLink to={`${PUBLIC_ROUTES.CATALOG}?sort=popular`}>
            Los M{'\u00E1'}s Vendidos
          </FooterLink>
          <FooterLink to={`${PUBLIC_ROUTES.CATALOG}?sale=true`}>
            Ofertas
          </FooterLink>
          <FooterLink to={PUBLIC_ROUTES.SIZE_GUIDE}>
            Gu{'\u00ED'}a de Tallas
          </FooterLink>
        </div>

        {/* ── Column 3: Informacion ── */}
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column' }}>
          <ColumnTitle>Informaci{'\u00F3'}n</ColumnTitle>
          <FooterLink to={PUBLIC_ROUTES.ABOUT}>
            Sobre Nosotros
          </FooterLink>
          <FooterLink to={PUBLIC_ROUTES.CONTACT}>
            Contacto
          </FooterLink>
          <FooterLink to={PUBLIC_ROUTES.SHIPPING}>
            Env{'\u00ED'}os y Devoluciones
          </FooterLink>
          <FooterLink to={PUBLIC_ROUTES.FAQ}>
            Preguntas Frecuentes
          </FooterLink>
          <FooterLink to={PUBLIC_ROUTES.TRACKING}>
            Rastreo de Pedido
          </FooterLink>
        </div>

        {/* ── Column 4: Contacto (dynamic from settings) ── */}
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column' }}>
          <ColumnTitle>Contacto</ColumnTitle>

          {/* WhatsApp */}
          <ContactItem
            href={getWhatsAppLink(settings.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            icon={<WhatsAppIcon />}
            isLink
          >
            {formatWhatsApp(settings.whatsapp)}
          </ContactItem>

          {/* Email */}
          <ContactItem
            href={`mailto:${settings.email}`}
            icon={<EnvelopeIcon />}
            isLink
          >
            {settings.email}
          </ContactItem>

          {/* Horario */}
          <ContactItem icon={<ClockIcon />}>
            {settings.schedule}
          </ContactItem>

          {/* Ubicacion */}
          <ContactItem icon={<LocationIcon />}>
            {settings.location} {'\uD83C\uDDE8\uD83C\uDDF4'}
          </ContactItem>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TRUST STRIP
          ═══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}>
        <div
          className="footer-trust-strip"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            flexWrap: 'wrap',
          }}
        >
          {/* Trust item 1 */}
          <span
            style={{
              color: '#C4A35A',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              fontFamily: "'Barlow Condensed', sans-serif",
              padding: '4px 0',
            }}
          >
            ENVIO GRATIS +{freeShippingFormatted}
          </span>
          {/* Gold dot separator */}
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#C4A35A',
              display: 'inline-block',
              margin: '0 24px',
              opacity: 0.6,
            }}
          />
          {/* Trust item 2 */}
          <span
            style={{
              color: '#C4A35A',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              fontFamily: "'Barlow Condensed', sans-serif",
              padding: '4px 0',
            }}
          >
            PAGO 100% SEGURO
          </span>
          {/* Gold dot separator */}
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#C4A35A',
              display: 'inline-block',
              margin: '0 24px',
              opacity: 0.6,
            }}
          />
          {/* Trust item 3 */}
          <span
            style={{
              color: '#C4A35A',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              fontFamily: "'Barlow Condensed', sans-serif",
              padding: '4px 0',
            }}
          >
            DEVOLUCIONES GRATIS
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PAYMENT METHODS BAR
          ═══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}>
        <div
          style={{
            padding: '28px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '6px',
            margin: '8px 0',
          }}
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontFamily: "'Barlow Condensed', sans-serif",
              marginRight: '8px',
            }}
          >
            Pagos seguros
          </span>
          <PaymentBadge>{(h) => <PaymentVisa hovered={h} />}</PaymentBadge>
          <PaymentBadge>{(h) => <PaymentMastercard hovered={h} />}</PaymentBadge>
          <PaymentBadge>{(h) => <PaymentAmex hovered={h} />}</PaymentBadge>
          <PaymentBadge>{(h) => <PaymentPSE hovered={h} />}</PaymentBadge>
          <PaymentBadge>{(h) => <PaymentNequi hovered={h} />}</PaymentBadge>
          <PaymentBadge>{(h) => <PaymentEfecty hovered={h} />}</PaymentBadge>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          COPYRIGHT BAR
          ═══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}>
        <div
          className="footer-copyright"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '24px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '12px',
              margin: 0,
              letterSpacing: '0.5px',
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            {'\u00A9'} {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to={PUBLIC_ROUTES.TERMS}
              style={{
                color: 'rgba(255, 255, 255, 0.3)',
                textDecoration: 'none',
                fontSize: '12px',
                transition: 'color 0.3s ease',
                fontFamily: "'Barlow', sans-serif",
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
            >
              T{'\u00E9'}rminos y Condiciones
            </Link>
            <span style={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: '12px' }}>|</span>
            <Link
              to={PUBLIC_ROUTES.PRIVACY}
              style={{
                color: 'rgba(255, 255, 255, 0.3)',
                textDecoration: 'none',
                fontSize: '12px',
                transition: 'color 0.3s ease',
                fontFamily: "'Barlow', sans-serif",
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
            >
              Pol{'\u00ED'}tica de Privacidad
            </Link>
          </div>
        </div>
      </div>

      {/* ── Responsive Styles ── */}
      <style>{`
        /* Newsletter responsive */
        @media (max-width: 900px) {
          .footer-newsletter__inner {
            flex-direction: column !important;
            text-align: center !important;
            padding: 48px 24px !important;
            gap: 28px !important;
          }
          .footer-newsletter__inner > div:first-child p {
            max-width: 100% !important;
          }
          .footer-newsletter__inner > div:last-child {
            flex: 1 1 100% !important;
            width: 100% !important;
          }
        }

        /* Main footer: 4 cols -> 2 cols (tablet) */
        @media (max-width: 1024px) {
          .footer-main {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 48px 40px !important;
            padding: 56px 32px 48px !important;
          }
        }

        /* Main footer: 2 cols -> 1 col (mobile) */
        @media (max-width: 640px) {
          .footer-main {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            padding: 48px 24px 40px !important;
          }
          .footer-brand {
            align-items: center !important;
            text-align: center !important;
          }
          .footer-brand p {
            max-width: 100% !important;
          }
          .footer-brand > div:last-child {
            justify-content: center !important;
          }
          .footer-copyright {
            justify-content: center !important;
            text-align: center !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .footer-trust-strip {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .footer-trust-strip > span[style*="border-radius: 50%"] {
            display: none !important;
          }
        }

        /* Newsletter input placeholder */
        .footer-newsletter__input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .footer-newsletter__input:focus {
          outline: none;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
