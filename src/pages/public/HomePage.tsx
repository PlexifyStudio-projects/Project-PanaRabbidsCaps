import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import SEOHead from '../../components/common/SEOHead';
import { getProducts, getCategories, getHeroImages, getFeaturedProducts } from '../../data/productDataService';
import type { Product } from '../../types/product';
import { useCart } from '../../hooks/useCart';
import { formatCOP } from '../../utils/formatCurrency';

/* ================================================================
   PLEXIFYCAPS - ULTRA PREMIUM HOMEPAGE
   Colombian Luxury Streetwear Cap E-Commerce
   Dark luxury theme with glassmorphism, noise textures, gold accents
   ================================================================ */

// ── Keyframe injection (runs once) ──────────────────────────────────
const STYLE_ID = 'pana-home-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes panaMarquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes panaPulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.4; }
    }
    @keyframes panaShimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes panaBorderGlow {
      0%, 100% { border-color: rgba(196,163,90,0.2); box-shadow: 0 0 15px rgba(196,163,90,0.05); }
      50%      { border-color: rgba(196,163,90,0.6); box-shadow: 0 0 25px rgba(196,163,90,0.15); }
    }
    @keyframes panaFloat {
      0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
      50%      { transform: translateY(-20px) rotate(1.5deg); }
    }
    @keyframes panaBounce {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(10px); }
    }
    @keyframes panaGradientBorder {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes panaRotateGlow {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes panaDriftParticle {
      0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translateY(-120vh) translateX(30px) scale(0.3); opacity: 0; }
    }
    @keyframes panaLineExpand {
      0%   { width: 0; }
      100% { width: 100%; }
    }
    @keyframes panaTextReveal {
      0%   { clip-path: inset(0 100% 0 0); }
      100% { clip-path: inset(0 0% 0 0); }
    }
    @keyframes panaScanline {
      0%   { top: -10%; }
      100% { top: 110%; }
    }
    @keyframes panaBreath {
      0%, 100% { opacity: 0.03; }
      50%      { opacity: 0.06; }
    }
    @keyframes panaCountdownPulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

// ── Noise texture as inline SVG data URI ────────────────────────────
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

// ── Animation variants ──────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 70 },
  visible: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0 },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.15 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── Helpers ─────────────────────────────────────────────────────────
function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

function isNew(product: Product): boolean {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  return new Date(product.createdAt) >= twoWeeksAgo;
}

function getDiscountPercent(product: Product): number | null {
  if (!product.comparePrice) return null;
  return Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100);
}

function getPrimaryImage(product: Product): string {
  const primary = product.images.find(img => img.isPrimary);
  return primary ? primary.imageUrl : product.images[0]?.imageUrl || '';
}

// ── Reusable inline style fragments ─────────────────────────────────
const GLASS = {
  background: 'rgba(26,26,46,0.35)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
} as React.CSSProperties;

const GLASS_STRONG = {
  background: 'rgba(26,26,46,0.55)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255,255,255,0.08)',
} as React.CSSProperties;

const GOLD_GRADIENT = 'linear-gradient(135deg, #E8D5A3 0%, #C4A35A 30%, #D4AF37 50%, #B8942F 70%, #C4A35A 100%)';
const GOLD_GRADIENT_ANIMATED = 'linear-gradient(135deg, #E8D5A3 0%, #C4A35A 25%, #D4AF37 50%, #E8D5A3 75%, #C4A35A 100%)';

// ── Section heading sub-component ───────────────────────────────────
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', marginBottom: '5rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.25rem' }}>
        <div style={{ width: '80px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.6))' }} />
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#C4A35A',
          }}
        >
          {eyebrow}
        </span>
        <div style={{ width: '80px', height: '1px', background: 'linear-gradient(90deg, rgba(196,163,90,0.6), transparent)' }} />
      </div>
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#FAFAFA',
          margin: 0,
          lineHeight: 1.05,
        }}
      >
        {title}
      </h2>
      {/* Decorative underline */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
        <div style={{ width: '60px', height: '2px', background: GOLD_GRADIENT, borderRadius: '1px' }} />
      </div>
    </motion.div>
  );
}

// ── Component ───────────────────────────────────────────────────────
const HomePage = () => {
  const { addItem } = useCart();
  const PRODUCTS = useMemo(() => getProducts(), []);
  const CATEGORIES = useMemo(() => getCategories(), []);
  const HERO_IMAGES = useMemo(() => getHeroImages(), []);
  const featuredProducts = useMemo(() => getFeaturedProducts(), []);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Find the Pana Gold Edition Limited product for the exclusive banner
  const goldProduct = useMemo(
    () => PRODUCTS.find(p => p.slug === 'pana-gold-edition-limited'),
    [PRODUCTS]
  );
  const goldTotalStock = goldProduct ? getTotalStock(goldProduct) : 0;

  // Parallax for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 900], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 700], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 700], [1, 1.1]);

  // Countdown urgency timer (fake)
  const [countdown, setCountdown] = useState({ h: 2, m: 47, s: 33 });
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailSubmitted(true);
      setEmail('');
    }
  };

  return (
    <>
      <SEOHead
        title="Inicio"
        description="PlexifyCaps - Las gorras mas exclusivas de Colombia. Streetwear premium, gorras originales MLB, NFL, NBA y ediciones limitadas."
      />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO - Full viewport cinematic luxury
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: '#0D0D0D',
          marginTop: '-112px',
        }}
      >
        {/* Background image with parallax + zoom */}
        <motion.div
          style={{
            position: 'absolute',
            inset: '-15%',
            y: heroY,
            opacity: heroOpacity,
            scale: heroScale,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${HERO_IMAGES.main})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              filter: 'brightness(0.2) saturate(0.6) contrast(1.15)',
            }}
          />
        </motion.div>

        {/* Multi-layer gradient overlays for depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(13,13,13,0.85) 0%, rgba(13,13,13,0.2) 35%, rgba(13,13,13,0.1) 50%, rgba(13,13,13,0.6) 75%, rgba(13,13,13,0.95) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 15% 50%, rgba(196,163,90,0.07) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 85% 30%, rgba(26,26,46,0.5) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 70% 80%, rgba(196,163,90,0.04) 0%, transparent 40%)',
            pointerEvents: 'none',
          }}
        />

        {/* Noise texture overlay with breathing animation */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage: NOISE_SVG,
            backgroundSize: '200px 200px',
            pointerEvents: 'none',
            animation: 'panaBreath 8s ease-in-out infinite',
          }}
        />

        {/* Floating particle dots */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              bottom: '-5%',
              left: `${8 + i * 7.5}%`,
              width: i % 3 === 0 ? '3px' : '2px',
              height: i % 3 === 0 ? '3px' : '2px',
              borderRadius: '50%',
              background: i % 2 === 0 ? 'rgba(196,163,90,0.4)' : 'rgba(250,250,250,0.15)',
              animation: `panaDriftParticle ${12 + i * 2}s linear ${i * 1.5}s infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Subtle scan line effect */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.08), transparent)',
            animation: 'panaScanline 8s linear infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Content container */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '10rem 3.5rem 3rem',
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            alignItems: 'center',
            gap: '3rem',
          }}
          className="pana-hero-grid"
        >
          {/* Left: Text content */}
          <div>
            {/* Eyebrow with animated line + diamond accent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="pana-hero-eyebrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ height: '1px', background: GOLD_GRADIENT, overflow: 'hidden' }}
              />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.45em',
                  textTransform: 'uppercase',
                  color: '#C4A35A',
                }}
              >
                <span style={{ width: '4px', height: '4px', background: '#C4A35A', transform: 'rotate(45deg)', display: 'inline-block', opacity: 0.7 }} />
                STREETWEAR PREMIUM COLOMBIANO
                <span style={{ width: '4px', height: '4px', background: '#C4A35A', transform: 'rotate(45deg)', display: 'inline-block', opacity: 0.7 }} />
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                style={{ height: '1px', background: GOLD_GRADIENT, overflow: 'hidden' }}
              />
            </motion.div>

            {/* Main headline - line 1: DEFINE */}
            <div style={{ overflow: 'hidden', marginBottom: '0.15rem' }}>
              <motion.h1
                initial={{ y: '120%', rotateX: -15 }}
                animate={{ y: '0%', rotateX: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(3.5rem, 8vw, 8rem)',
                  fontWeight: 900,
                  lineHeight: 0.9,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.03em',
                  color: '#FAFAFA',
                  margin: 0,
                  textShadow: '0 4px 40px rgba(0,0,0,0.3)',
                }}
              >
                DEFINE
              </motion.h1>
            </div>

            {/* Main headline - line 2: TU ESTILO with gold shimmer */}
            <div style={{ overflow: 'hidden', marginBottom: '0.15rem' }}>
              <motion.h1
                initial={{ y: '120%', rotateX: -15 }}
                animate={{ y: '0%', rotateX: 0 }}
                transition={{ duration: 1, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(3.5rem, 8vw, 8rem)',
                  fontWeight: 900,
                  lineHeight: 0.9,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.03em',
                  margin: 0,
                  background: GOLD_GRADIENT_ANIMATED,
                  backgroundSize: '300% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'panaShimmer 5s linear infinite',
                  filter: 'drop-shadow(0 4px 30px rgba(196,163,90,0.15))',
                }}
              >
                TU ESTILO
              </motion.h1>
            </div>

            {/* Main headline - line 3: CON PANA — italic accent */}
            <div style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              <motion.h1
                initial={{ y: '120%', rotateX: -15 }}
                animate={{ y: '0%', rotateX: 0 }}
                transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(2rem, 4vw, 4rem)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.25em',
                  color: 'rgba(250,250,250,0.35)',
                  margin: 0,
                }}
              >
                CON PLEXIFYCAPS
              </motion.h1>
            </div>

            {/* Decorative accent line under headline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '140px',
                height: '2px',
                background: GOLD_GRADIENT,
                marginBottom: '1.5rem',
                transformOrigin: 'left',
                boxShadow: '0 0 20px rgba(196,163,90,0.2)',
              }}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                color: 'rgba(180,180,180,0.85)',
                lineHeight: 1.85,
                marginBottom: '2rem',
                maxWidth: '480px',
                letterSpacing: '0.015em',
              }}
            >
              Las gorras mas exclusivas de Colombia. Originales, con estilo
              urbano y la mejor calidad para quienes saben lo que quieren.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.2 }}
              className="pana-hero-ctas"
              style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}
            >
              <Link to="/catalogo" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(196,163,90,0.4), 0 12px 40px rgba(0,0,0,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    padding: '1.25rem 3rem',
                    background: GOLD_GRADIENT,
                    backgroundSize: '200% auto',
                    color: '#0D0D0D',
                    border: 'none',
                    borderRadius: '1px',
                    cursor: 'pointer',
                    transition: 'background-position 0.5s ease, box-shadow 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(196,163,90,0.2)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'right center'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'left center'; }}
                >
                  VER COLECCION
                </motion.button>
              </Link>
              <Link to="/catalogo?categoria=exclusivas" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.04, borderColor: 'rgba(196,163,90,0.8)', color: '#C4A35A', boxShadow: '0 0 35px rgba(196,163,90,0.12)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    padding: '1.25rem 3rem',
                    background: 'rgba(196,163,90,0.04)',
                    color: '#FAFAFA',
                    border: '1px solid rgba(196,163,90,0.3)',
                    borderRadius: '1px',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  EDICIONES LIMITADAS
                </motion.button>
              </Link>
            </motion.div>

            {/* Social proof stats — separated by thin gold lines */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0, duration: 0.8 }}
              className="pana-hero-stats"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0',
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(196,163,90,0.08)',
              }}
            >
              {[
                { value: '2K+', label: 'CLIENTES' },
                { value: '100%', label: 'ORIGINALES' },
                { value: '24/7', label: 'SOPORTE' },
              ].map((stat, idx) => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'center' }}>
                  {idx > 0 && (
                    <div style={{ width: '1px', height: '32px', background: 'rgba(196,163,90,0.12)', margin: '0 1.5rem' }} />
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      background: GOLD_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'block',
                      marginBottom: '0.3rem',
                    }}>
                      {stat.value}
                    </span>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      letterSpacing: '0.25em',
                      color: 'rgba(250,250,250,0.25)',
                      textTransform: 'uppercase',
                    }}>
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Floating product preview with dramatic glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, x: 120 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Large ambient glow behind everything */}
            <div
              style={{
                position: 'absolute',
                width: '130%',
                height: '130%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(196,163,90,0.08) 0%, rgba(196,163,90,0.02) 40%, transparent 65%)',
                filter: 'blur(60px)',
              }}
            />
            {/* Rotating ring glow behind image */}
            <div
              style={{
                position: 'absolute',
                width: '115%',
                height: '115%',
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, transparent, rgba(196,163,90,0.15), transparent, rgba(196,163,90,0.08), transparent)',
                animation: 'panaRotateGlow 10s linear infinite',
                filter: 'blur(35px)',
              }}
            />

            {/* Floating cap image */}
            <motion.div
              animate={{ y: [-10, 10, -10], rotate: [-1, 1, -1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'relative' }}
            >
              {/* Glass frame around image — more premium */}
              <div
                style={{
                  padding: '10px',
                  borderRadius: '20px',
                  background: 'rgba(26,26,46,0.4)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(196,163,90,0.18)',
                  boxShadow: '0 60px 120px rgba(0,0,0,0.55), 0 0 100px rgba(196,163,90,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <img
                  src={featuredProducts[0] ? getPrimaryImage(featuredProducts[0]) : HERO_IMAGES.main}
                  alt="Gorra premium PlexifyCaps"
                  style={{
                    width: '100%',
                    maxWidth: '420px',
                    height: 'auto',
                    borderRadius: '14px',
                    display: 'block',
                  }}
                />
              </div>

              {/* Price tag floating — premium glass */}
              {featuredProducts[0] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 2.0, type: 'spring', stiffness: 200, damping: 15 }}
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    background: 'rgba(13,13,20,0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(196,163,90,0.25)',
                    padding: '1rem 1.6rem',
                    borderRadius: '12px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 30px rgba(196,163,90,0.08)',
                  }}
                >
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.25em', color: 'rgba(196,163,90,0.7)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>
                    DESDE
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    background: GOLD_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {formatCOP(featuredProducts[0].basePrice)}
                  </span>
                </motion.div>
              )}

              {/* Floating "DESTACADO" badge top-left */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.3, type: 'spring' }}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '-12px',
                  background: GOLD_GRADIENT,
                  color: '#0D0D0D',
                  padding: '0.45rem 1rem',
                  borderRadius: '3px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  boxShadow: '0 6px 20px rgba(196,163,90,0.35)',
                }}
              >
                DESTACADO
              </motion.div>

              {/* Floating review stars badge - top right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '-16px',
                  background: 'rgba(13,13,20,0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(196,163,90,0.15)',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#C4A35A" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'rgba(250,250,250,0.5)', marginLeft: '4px' }}>
                  4.9
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator - minimal luxury */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="pana-scroll-indicator"
          style={{
            position: 'absolute',
            bottom: '3rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '0.6rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(82,82,82,0.7)',
            }}
          >
            SCROLL
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(180deg, #C4A35A, transparent)',
            }}
          />
        </motion.div>

        {/* Decorative corner accents */}
        <div className="pana-hero-corners" style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '2rem', left: '2rem', width: '30px', height: '30px', borderLeft: '1px solid rgba(196,163,90,0.15)', borderTop: '1px solid rgba(196,163,90,0.15)' }} />
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', width: '30px', height: '30px', borderRight: '1px solid rgba(196,163,90,0.15)', borderTop: '1px solid rgba(196,163,90,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', width: '30px', height: '30px', borderLeft: '1px solid rgba(196,163,90,0.15)', borderBottom: '1px solid rgba(196,163,90,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', width: '30px', height: '30px', borderRight: '1px solid rgba(196,163,90,0.15)', borderBottom: '1px solid rgba(196,163,90,0.15)' }} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: MARQUEE BAR - Infinite scrolling luxury strip
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          background: 'linear-gradient(90deg, #0D0D0D, rgba(196,163,90,0.08), rgba(196,163,90,0.12), rgba(196,163,90,0.08), #0D0D0D)',
          padding: '1rem 0',
          overflow: 'hidden',
          borderTop: '1px solid rgba(196,163,90,0.1)',
          borderBottom: '1px solid rgba(196,163,90,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            animation: 'panaMarquee 30s linear infinite',
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C4A35A',
                paddingRight: '4rem',
                flexShrink: 0,
                opacity: 0.7,
              }}
            >
              ENVIO GRATIS +$200.000 &nbsp;&bull;&nbsp; GORRAS 100% ORIGINALES &nbsp;&bull;&nbsp; PAGO SEGURO &nbsp;&bull;&nbsp; EDICIONES LIMITADAS &nbsp;&bull;&nbsp;
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: FEATURED PRODUCTS - "LO MAS BUSCADO"
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '8rem 2rem',
          background: '#0D0D0D',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background subtle texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.02,
            backgroundImage: NOISE_SVG,
            backgroundSize: '200px 200px',
            pointerEvents: 'none',
          }}
        />
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,163,90,0.04) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1300px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionHeading eyebrow="SELECCION PREMIUM" title="LO MAS BUSCADO" />

          {/* Products grid - 5 columns, compact */}
          <motion.div
            className="pana-featured-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1.25rem',
            }}
          >
            {featuredProducts.slice(0, 5).map((product) => {
              const primaryImg = getPrimaryImage(product);
              const totalStock = getTotalStock(product);
              const discount = getDiscountPercent(product);
              const isHovered = hoveredProduct === product.id;
              const productIsNew = isNew(product);
              const firstActiveVariant = product.variants.find(v => v.isActive && v.stock > 0);

              return (
                <motion.div
                  key={product.id}
                  variants={staggerItem}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: isHovered ? '1px solid rgba(196,163,90,0.4)' : '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: isHovered
                      ? '0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(196,163,90,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
                      : '0 4px 24px rgba(0,0,0,0.2)',
                    position: 'relative',
                    background: 'rgba(26,26,46,0.2)',
                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  }}
                >
                  {/* Image container */}
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '4 / 5',
                      overflow: 'hidden',
                      background: '#0A0A1A',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${primaryImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), filter 0.7s ease',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                        filter: isHovered ? 'brightness(0.8)' : 'brightness(0.95)',
                      }}
                    />

                    {/* Hover gradient overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: isHovered
                          ? 'linear-gradient(180deg, rgba(13,13,13,0.1) 0%, rgba(13,13,13,0.2) 40%, rgba(13,13,13,0.9) 100%)'
                          : 'linear-gradient(180deg, transparent 50%, rgba(13,13,13,0.3) 100%)',
                        transition: 'all 0.5s ease',
                      }}
                    />

                    {/* Badges - floating glass pills */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 2 }}>
                      {productIsNew && (
                        <span
                          style={{
                            background: GOLD_GRADIENT,
                            color: '#0D0D0D',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px',
                            fontFamily: "'Barlow Condensed', sans-serif",
                            boxShadow: '0 4px 12px rgba(196,163,90,0.3)',
                          }}
                        >
                          NUEVO
                        </span>
                      )}
                      {totalStock > 0 && totalStock < 5 && (
                        <span
                          style={{
                            ...GLASS_STRONG,
                            background: 'rgba(220,38,38,0.85)',
                            backdropFilter: 'blur(10px)',
                            color: '#FAFAFA',
                            fontSize: '0.55rem',
                            fontWeight: 800,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px',
                            fontFamily: "'Barlow Condensed', sans-serif",
                            border: '1px solid rgba(220,38,38,0.3)',
                            animation: 'panaPulse 2s ease-in-out infinite',
                          }}
                        >
                          ULTIMAS UNIDADES
                        </span>
                      )}
                    </div>

                    {discount && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          ...GLASS_STRONG,
                          background: 'rgba(220,38,38,0.8)',
                          backdropFilter: 'blur(10px)',
                          color: '#FAFAFA',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.4rem 0.7rem',
                          borderRadius: '6px',
                          fontFamily: "'JetBrains Mono', monospace",
                          border: 'none',
                          zIndex: 2,
                          boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
                        }}
                      >
                        -{discount}%
                      </span>
                    )}

                    {/* Hover actions - glass overlay at bottom */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                        transform: isHovered ? 'translateY(0)' : 'translateY(30px)',
                        opacity: isHovered ? 1 : 0,
                        transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                        zIndex: 3,
                      }}
                    >
                      {firstActiveVariant && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem(product, firstActiveVariant);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.85rem',
                            background: GOLD_GRADIENT,
                            backgroundSize: '200% auto',
                            color: '#0D0D0D',
                            border: 'none',
                            borderRadius: '4px',
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 20px rgba(196,163,90,0.25)',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'right center'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'left center'; }}
                        >
                          AGREGAR AL CARRITO
                        </button>
                      )}
                      <Link
                        to={`/producto/${product.slug}`}
                        style={{
                          textAlign: 'center',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.75rem',
                          color: 'rgba(250,250,250,0.8)',
                          textDecoration: 'none',
                          letterSpacing: '0.1em',
                          transition: 'color 0.3s ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C4A35A'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(250,250,250,0.8)'; }}
                      >
                        Ver Detalles &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Product info — compact */}
                  <Link to={`/producto/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '1rem 1rem 1.25rem' }}>
                      <span
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '0.55rem',
                          fontWeight: 600,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: '#C4A35A',
                          marginBottom: '0.35rem',
                          display: 'block',
                          opacity: 0.7,
                        }}
                      >
                        {product.category?.name || ''}
                      </span>
                      <h3
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#FAFAFA',
                          lineHeight: 1.3,
                          margin: '0 0 0.6rem',
                          transition: 'color 0.3s ease',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#C4A35A',
                          }}
                        >
                          {formatCOP(product.basePrice)}
                        </span>
                        {product.comparePrice && (
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '0.7rem',
                              color: '#525252',
                              textDecoration: 'line-through',
                            }}
                          >
                            {formatCOP(product.comparePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* View all CTA */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ textAlign: 'center', marginTop: '4.5rem' }}
          >
            <Link to="/catalogo" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04, borderColor: 'rgba(196,163,90,0.7)', boxShadow: '0 0 30px rgba(196,163,90,0.1)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  padding: '1.1rem 3.5rem',
                  background: 'transparent',
                  color: '#FAFAFA',
                  border: '1.5px solid rgba(196,163,90,0.25)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                VER TODO EL CATALOGO
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: CATEGORIES - Asymmetric luxury grid
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '8rem 2rem',
          background: 'linear-gradient(180deg, #0A0A0A 0%, #0D0D0D 30%, #0A0A0A 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow right side */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,163,90,0.03) 0%, transparent 60%)',
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1300px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionHeading eyebrow="EXPLORA NUESTRO MUNDO" title="EXPLORA POR CATEGORIA" />

          {/* Asymmetric grid: row1 = 1 large (2col) + 1 medium, row2 = 1 medium + 1 large (2col), etc. */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="pana-categories-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridAutoRows: 'minmax(260px, auto)',
              gap: '1.25rem',
            }}
          >
            {CATEGORIES.map((cat, idx) => {
              // First item large, then alternate: positions 0,3 are large (span 2 cols)
              const isLarge = idx === 0 || idx === 3;
              const categoryProductCount = PRODUCTS.filter(p => p.categoryId === cat.id && p.isActive).length;

              return (
                <motion.div
                  key={cat.slug}
                  variants={staggerItem}
                  style={{
                    gridColumn: isLarge ? 'span 2' : 'span 1',
                    minHeight: isLarge ? '380px' : '280px',
                  }}
                >
                  <Link
                    to={`/catalogo?categoria=${cat.slug}`}
                    style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                  >
                    <CategoryCard
                      name={cat.name}
                      description={cat.description}
                      imageUrl={cat.imageUrl}
                      productCount={categoryProductCount}
                      isLarge={isLarge}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: EXCLUSIVE BANNER - Pana Gold Edition
          ═══════════════════════════════════════════════════════════════ */}
      {goldProduct && (
        <section
          style={{
            padding: 0,
            background: '#0D0D0D',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated gradient border top */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 5%, rgba(196,163,90,0.6) 30%, #D4AF37 50%, rgba(196,163,90,0.6) 70%, transparent 95%)',
              backgroundSize: '200% 100%',
              animation: 'panaGradientBorder 4s ease-in-out infinite',
            }}
          />

          <div
            className="pana-exclusive-grid"
            style={{
              maxWidth: '1440px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              minHeight: '600px',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Left: Image with dramatic lighting */}
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'relative',
                height: '100%',
                minHeight: '550px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${getPrimaryImage(goldProduct)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Dramatic right-fade */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent 40%, #0D0D0D 100%)',
                }}
              />
              {/* Spotlight effect from top-left */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at 20% 20%, rgba(196,163,90,0.08) 0%, transparent 60%)',
                }}
              />
              {/* Bottom vignette */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 60%, rgba(13,13,13,0.6) 100%)',
                }}
              />
            </motion.div>

            {/* Right: Content with dramatic spacing */}
            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: '5rem 4rem', position: 'relative' }}
            >
              {/* Decorative corner accent */}
              <div style={{ position: 'absolute', top: '3rem', right: '3rem', width: '40px', height: '40px', borderRight: '1px solid rgba(196,163,90,0.2)', borderTop: '1px solid rgba(196,163,90,0.2)', pointerEvents: 'none' }} />

              {/* Limited edition badge - glass */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  ...GLASS,
                  border: '1px solid rgba(196,163,90,0.25)',
                  padding: '0.4rem 1.25rem',
                  borderRadius: '20px',
                  marginBottom: '2rem',
                  animation: 'panaBorderGlow 3s ease-in-out infinite',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#C4A35A',
                    boxShadow: '0 0 8px rgba(196,163,90,0.5)',
                    animation: 'panaPulse 2s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#C4A35A',
                  }}
                >
                  EDICION LIMITADA
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  lineHeight: 1.05,
                  color: '#FAFAFA',
                  marginBottom: '1.25rem',
                }}
              >
                {goldProduct.name}
              </h2>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  color: 'rgba(163,163,163,0.9)',
                  lineHeight: 1.8,
                  marginBottom: '2rem',
                  maxWidth: '420px',
                }}
              >
                {goldProduct.description.substring(0, 180)}...
              </p>

              {/* Stock urgency with glass background */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  marginBottom: '1.5rem',
                  background: 'rgba(220,38,38,0.08)',
                  border: '1px solid rgba(220,38,38,0.15)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#DC2626',
                    boxShadow: '0 0 10px rgba(220,38,38,0.5)',
                    animation: 'panaPulse 1.5s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#DC2626',
                  }}
                >
                  Solo {goldTotalStock} unidades disponibles
                </span>
              </div>

              {/* Countdown - glass cards */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                  { val: countdown.h, label: 'HRS' },
                  { val: countdown.m, label: 'MIN' },
                  { val: countdown.s, label: 'SEG' },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    style={{
                      textAlign: 'center',
                      ...GLASS,
                      border: '1px solid rgba(196,163,90,0.15)',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      minWidth: '72px',
                      animation: unit.label === 'SEG' ? 'panaCountdownPulse 1s ease-in-out infinite' : undefined,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: '#C4A35A',
                        display: 'block',
                        lineHeight: 1.2,
                      }}
                    >
                      {String(unit.val).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '0.55rem',
                        fontWeight: 600,
                        letterSpacing: '0.25em',
                        color: '#525252',
                      }}
                    >
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price with visual emphasis */}
              <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    background: GOLD_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {formatCOP(goldProduct.basePrice)}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    color: '#525252',
                    textTransform: 'uppercase',
                  }}
                >
                  COP
                </span>
              </div>

              <Link to={`/producto/${goldProduct.slug}`} style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(196,163,90,0.35), 0 12px 40px rgba(0,0,0,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    padding: '1.2rem 3.5rem',
                    background: GOLD_GRADIENT,
                    backgroundSize: '200% auto',
                    color: '#0D0D0D',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    boxShadow: '0 4px 25px rgba(196,163,90,0.2)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'right center'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'left center'; }}
                >
                  COMPRAR AHORA
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Animated gradient border bottom */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 5%, rgba(196,163,90,0.6) 30%, #D4AF37 50%, rgba(196,163,90,0.6) 70%, transparent 95%)',
              backgroundSize: '200% 100%',
              animation: 'panaGradientBorder 4s ease-in-out infinite',
            }}
          />
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: TRUST BADGES - Glass cards with glow
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '7rem 2rem',
          background: '#0D0D0D',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.02,
            backgroundImage: NOISE_SVG,
            backgroundSize: '200px 200px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="pana-trust-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
            }}
          >
            {[
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16,8 20,8 23,11 23,16 16,16 16,8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                ),
                title: 'ENVIO SEGURO',
                description: 'Entregas a todo Colombia en 3-5 dias habiles',
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: 'PAGO PROTEGIDO',
                description: 'Transacciones seguras con encriptacion SSL',
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                ),
                title: '100% ORIGINALES',
                description: 'Gorras autenticas con garantia de marca',
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                ),
                title: 'ATENCION 24/7',
                description: 'Soporte por WhatsApp cuando lo necesites',
              },
            ].map((badge) => (
              <motion.div
                key={badge.title}
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  borderRadius: '12px',
                  ...GLASS,
                  border: '1px solid rgba(255,255,255,0.04)',
                  transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(196,163,90,0.2)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.3), 0 0 30px rgba(196,163,90,0.05)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* Icon container with subtle gold ring */}
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(196,163,90,0.12), rgba(196,163,90,0.04))',
                    border: '1px solid rgba(196,163,90,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: '#C4A35A',
                  }}
                >
                  {badge.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#FAFAFA',
                    margin: '0 0 0.65rem',
                  }}
                >
                  {badge.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.8rem',
                    color: '#737373',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {badge.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7: NEWSLETTER - Elegant centered luxury
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '7rem 2rem',
          background: 'linear-gradient(180deg, #0D0D0D 0%, #12110E 30%, #1A170F 50%, #12110E 70%, #0D0D0D 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative concentric circles */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            border: '1px solid rgba(196,163,90,0.04)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            border: '1px solid rgba(196,163,90,0.06)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: '1px solid rgba(196,163,90,0.08)',
            pointerEvents: 'none',
          }}
        />

        {/* Ambient glow center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,163,90,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        {/* Noise */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: NOISE_SVG,
            backgroundSize: '200px 200px',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            maxWidth: '620px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Gold diamond icon */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: GOLD_GRADIENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              transform: 'rotate(45deg)',
              boxShadow: '0 8px 30px rgba(196,163,90,0.2)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#FAFAFA',
              marginBottom: '1rem',
              lineHeight: 1.05,
            }}
          >
            UNETE AL CLUB PANA
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '50px', height: '2px', background: GOLD_GRADIENT, borderRadius: '1px' }} />
          </div>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1rem',
              color: 'rgba(163,163,163,0.9)',
              lineHeight: 1.8,
              marginBottom: '3rem',
            }}
          >
            Se el primero en enterarte de nuevos lanzamientos y ofertas exclusivas.
            Acceso anticipado a ediciones limitadas.
          </p>

          {emailSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{
                padding: '2rem',
                ...GLASS,
                border: '1px solid rgba(196,163,90,0.25)',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 30px rgba(196,163,90,0.05)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', display: 'block' }}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: '#C4A35A', fontWeight: 600, margin: 0, letterSpacing: '0.02em' }}>
                Bienvenido al club. Revisa tu correo.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="pana-newsletter-form"
              style={{
                display: 'flex',
                gap: 0,
                maxWidth: '520px',
                margin: '0 auto',
                borderRadius: '8px',
                overflow: 'hidden',
                ...GLASS,
                border: '1.5px solid rgba(196,163,90,0.15)',
                transition: 'all 0.4s ease',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <input
                type="email"
                placeholder="Tu correo electronico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '1.1rem 1.5rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#FAFAFA',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  outline: 'none',
                  letterSpacing: '0.02em',
                }}
                onFocus={(e) => {
                  const form = e.currentTarget.closest('form');
                  if (form) {
                    form.style.borderColor = 'rgba(196,163,90,0.5)';
                    form.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2), 0 0 20px rgba(196,163,90,0.08)';
                  }
                }}
                onBlur={(e) => {
                  const form = e.currentTarget.closest('form');
                  if (form) {
                    form.style.borderColor = 'rgba(196,163,90,0.15)';
                    form.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                  }
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '1.1rem 2.25rem',
                  background: GOLD_GRADIENT,
                  backgroundSize: '200% auto',
                  color: '#0D0D0D',
                  border: 'none',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'right center'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'left center'; }}
              >
                SUSCRIBIRME
              </button>
            </form>
          )}

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.7rem',
              color: '#525252',
              marginTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              letterSpacing: '0.03em',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            Unete a +2,000 coleccionistas
          </p>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8: INSTAGRAM FEED - Asymmetric masonry layout
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '7rem 2rem 8rem',
          background: '#0D0D0D',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle ambient glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,163,90,0.03) 0%, transparent 60%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1300px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionHeading eyebrow="LIFESTYLE" title="SIGUENOS @PLEXIFYCAPS" />
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: '#737373',
              textAlign: 'center',
              margin: '-3.5rem 0 4rem',
            }}
          >
            Comparte tu estilo y aparece en nuestra pagina
          </motion.p>

          {/* Asymmetric masonry: items 0 & 3 are tall, rest are square */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="pana-instagram-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: '1fr 1fr',
              gap: '0.85rem',
              maxHeight: '700px',
            }}
          >
            {HERO_IMAGES.models.map((img, idx) => {
              // Items at index 0 and 3 span 2 rows for asymmetric layout
              const isTall = idx === 0 || idx === 3;
              return (
                <div
                  key={idx}
                  style={{
                    gridRow: isTall ? 'span 2' : 'span 1',
                  }}
                >
                  <InstagramCard imageUrl={img} delay={idx * 0.1} isTall={isTall} />
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </>
  );
};

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

// ── Category Card - Glass morphism on hover ─────────────────────────
interface CategoryCardProps {
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
  isLarge: boolean;
}

function CategoryCard({ name, description, imageUrl, productCount, isLarge }: CategoryCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: hovered ? '1px solid rgba(196,163,90,0.4)' : '1px solid rgba(255,255,255,0.04)',
        transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        cursor: 'pointer',
        boxShadow: hovered ? '0 30px 80px rgba(0,0,0,0.4), 0 0 30px rgba(196,163,90,0.06)' : '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: hovered ? 'scale(1.12)' : 'scale(1)',
        }}
      />

      {/* Gradient overlay - darker on hover */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hovered
            ? 'linear-gradient(180deg, rgba(13,13,13,0.2) 0%, rgba(13,13,13,0.5) 50%, rgba(13,13,13,0.9) 100%)'
            : 'linear-gradient(180deg, rgba(13,13,13,0.15) 0%, rgba(13,13,13,0.35) 50%, rgba(13,13,13,0.75) 100%)',
          transition: 'all 0.5s ease',
        }}
      />

      {/* Glassmorphism overlay on hover */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: hovered ? 'blur(2px)' : 'blur(0px)',
          WebkitBackdropFilter: hovered ? 'blur(2px)' : 'blur(0px)',
          transition: 'all 0.5s ease',
        }}
      />

      {/* Category counter badge top-right */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(26,26,46,0.5)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '0.35rem 0.85rem',
          borderRadius: '20px',
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.4s ease',
        }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          fontWeight: 600,
          color: '#FAFAFA',
        }}>
          {productCount} items
        </span>
      </div>

      {/* Content at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: isLarge ? '2.5rem' : '1.5rem',
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            width: hovered ? '40px' : '24px',
            height: '2px',
            background: GOLD_GRADIENT,
            marginBottom: '0.75rem',
            transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            borderRadius: '1px',
          }}
        />

        <h3
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: isLarge ? 'clamp(1.75rem, 3vw, 2.75rem)' : 'clamp(1.2rem, 2vw, 1.6rem)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#FAFAFA',
            margin: 0,
            transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            transform: hovered ? 'translateY(-10px)' : 'translateY(0)',
          }}
        >
          {name}
        </h3>
        <div
          style={{
            overflow: 'hidden',
            maxHeight: hovered ? '80px' : '0',
            opacity: hovered ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              color: 'rgba(163,163,163,0.9)',
              margin: '0.4rem 0 0',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: '#C4A35A',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginTop: '0.5rem',
            }}
          >
            EXPLORAR &rarr;
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Instagram Card - Asymmetric with overlay ────────────────────────
interface InstagramCardProps {
  imageUrl: string;
  delay: number;
  isTall?: boolean;
}

function InstagramCard({ imageUrl, isTall }: InstagramCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={staggerItem}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: isTall ? '100%' : '200px',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: hovered ? '1px solid rgba(196,163,90,0.3)' : '1px solid rgba(255,255,255,0.03)',
        transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.4), 0 0 20px rgba(196,163,90,0.05)' : 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      {/* Hover overlay - glassmorphism */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hovered ? 'rgba(13,13,13,0.5)' : 'rgba(0,0,0,0)',
          backdropFilter: hovered ? 'blur(3px)' : 'blur(0px)',
          WebkitBackdropFilter: hovered ? 'blur(3px)' : 'blur(0px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(10px)',
            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Instagram icon */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>
        <span
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.05s',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: '#C4A35A',
            textTransform: 'uppercase',
          }}
        >
          @PLEXIFYCAPS
        </span>
      </div>

      {/* Bottom gradient always visible */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, transparent, rgba(13,13,13,0.3))',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}

// ── Responsive styles injected via style tag ────────────────────────
const HOME_RESPONSIVE_STYLE_ID = 'pana-home-responsive';
if (typeof document !== 'undefined' && !document.getElementById(HOME_RESPONSIVE_STYLE_ID)) {
  const rs = document.createElement('style');
  rs.id = HOME_RESPONSIVE_STYLE_ID;
  rs.textContent = `
    /* Hero grid: 2 cols -> 1 col on tablet */
    @media (max-width: 1024px) {
      .pana-hero-grid {
        grid-template-columns: 1fr !important;
        gap: 3rem !important;
        padding: 9rem 2rem 3rem !important;
        text-align: center !important;
      }
      .pana-hero-grid > div:first-child {
        order: 1;
      }
      .pana-hero-grid > div:last-child {
        order: 0;
        max-width: 340px;
        margin: 0 auto;
      }
      .pana-hero-stats {
        justify-content: center !important;
      }
      .pana-hero-eyebrow {
        justify-content: center !important;
      }
      .pana-hero-ctas {
        justify-content: center !important;
      }
      .pana-scroll-indicator {
        display: none !important;
      }
    }
    @media (max-width: 640px) {
      .pana-hero-grid {
        padding: 8rem 1.25rem 2rem !important;
      }
    }

    /* Featured products: 5 cols -> 3 cols -> 2 cols */
    @media (max-width: 1100px) {
      .pana-featured-grid {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 1rem !important;
      }
    }
    @media (max-width: 700px) {
      .pana-featured-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 0.75rem !important;
      }
    }

    /* Categories: 3 cols asymmetric -> 2 cols -> 1 col */
    @media (max-width: 900px) {
      .pana-categories-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .pana-categories-grid > * {
        grid-column: span 1 !important;
        min-height: 260px !important;
      }
    }
    @media (max-width: 560px) {
      .pana-categories-grid {
        grid-template-columns: 1fr !important;
      }
      .pana-categories-grid > * {
        min-height: 220px !important;
      }
    }

    /* Trust badges: 4 cols -> 2 cols -> 1 col */
    @media (max-width: 900px) {
      .pana-trust-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }
    @media (max-width: 560px) {
      .pana-trust-grid {
        grid-template-columns: 1fr !important;
        gap: 1rem !important;
      }
    }

    /* Exclusive banner: 2 cols -> 1 col */
    @media (max-width: 900px) {
      .pana-exclusive-grid {
        grid-template-columns: 1fr !important;
      }
      .pana-exclusive-grid > div:first-child {
        min-height: 350px !important;
      }
      .pana-exclusive-grid > div:last-child {
        padding: 3rem 2rem !important;
      }
    }

    /* Instagram feed: 4 cols -> 2 cols */
    @media (max-width: 768px) {
      .pana-instagram-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        max-height: none !important;
      }
      .pana-instagram-grid > * {
        grid-row: span 1 !important;
        min-height: 200px !important;
      }
    }
    @media (max-width: 480px) {
      .pana-instagram-grid {
        grid-template-columns: 1fr !important;
      }
    }

    /* Newsletter form responsive */
    @media (max-width: 560px) {
      .pana-newsletter-form {
        flex-direction: column !important;
        border-radius: 8px !important;
      }
      .pana-newsletter-form input {
        border-radius: 8px 8px 0 0 !important;
      }
      .pana-newsletter-form button {
        border-radius: 0 0 8px 8px !important;
        width: 100% !important;
      }
    }

    /* Scroll indicator: hide on mobile */
    @media (max-width: 768px) {
      .pana-scroll-indicator {
        display: none !important;
      }
      .pana-hero-corners {
        display: none !important;
      }
    }

    /* Homepage input placeholder */
    .pana-newsletter-form input::placeholder {
      color: rgba(250, 250, 250, 0.25);
    }
  `;
  document.head.appendChild(rs);
}

export default HomePage;
