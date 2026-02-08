// ============================================================
// PlexifyCaps - Premium Announcement Bar
// Fixed at top, slides up on scroll to give header full stage
// Infinite scrolling marquee with SVG icons
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { loadStoreSettings } from '../../data/settingsService';
import { formatCOP } from '../../utils/formatCurrency';

const STYLE_ID = 'pana-announcement-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes panaMarqueeAnnounce {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;
  document.head.appendChild(style);
}

// ── SVG Icons (inline, lightweight) ──────────────────────────
const TruckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const StarBadgeIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ClockFastIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const FireIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-6.5 0 3.5 2 5.5 2 8.5a4 4 0 1 1-8 0c0-1.5.5-4 1.5-5" />
  </svg>
);

// ── Marquee messages builder (reads from settings) ──────────
function buildMarqueeItems(): { icon: React.FC; text: string }[] {
  const settings = loadStoreSettings();
  const threshold = Number(settings.freeShippingThreshold) || 200000;
  return [
    { icon: TruckIcon, text: `ENVIO GRATIS +${formatCOP(threshold)}` },
    { icon: ShieldIcon, text: 'PAGO 100% SEGURO' },
    { icon: StarBadgeIcon, text: '100% ORIGINALES' },
    { icon: ClockFastIcon, text: 'ENTREGA 3-5 DIAS' },
    { icon: CreditCardIcon, text: 'NEQUI \u2022 PSE \u2022 TARJETA' },
    { icon: FireIcon, text: 'EDICIONES LIMITADAS' },
  ];
}

const SEPARATOR = (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '3px',
      height: '3px',
      borderRadius: '50%',
      background: 'rgba(196, 163, 90, 0.45)',
      margin: '0 1.5rem',
      flexShrink: 0,
    }}
  />
);

/** Height of the bar in pixels — exported so Header/Layout can reference it */
export const ANNOUNCEMENT_BAR_HEIGHT = 28;

const AnnouncementBar = () => {
  const [isHidden, setIsHidden] = useState(false);
  const marqueeItems = useMemo(() => buildMarqueeItems(), []);

  useEffect(() => {
    const handleScroll = () => {
      setIsHidden(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Render items twice for seamless looping
  const items = [...marqueeItems, ...marqueeItems];

  return (
    <div
      className="announcement-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(90deg, #070707 0%, #0C0B06 50%, #070707 100%)',
        borderBottom: '1px solid rgba(196, 163, 90, 0.1)',
        zIndex: 1001,
        overflow: 'hidden',
        height: `${ANNOUNCEMENT_BAR_HEIGHT}px`,
        display: 'flex',
        alignItems: 'center',
        transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {/* Subtle gold shimmer line at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(196,163,90,0.15) 25%, rgba(196,163,90,0.25) 50%, rgba(196,163,90,0.15) 75%, transparent 100%)',
        }}
      />

      {/* Fade edges */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '60px',
          background: 'linear-gradient(90deg, #070707, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '60px',
          background: 'linear-gradient(270deg, #070707, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Scrolling marquee */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          animation: 'panaMarqueeAnnounce 35s linear infinite',
          willChange: 'transform',
        }}
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {i > 0 && SEPARATOR}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'rgba(196, 163, 90, 0.7)',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                <span style={{ display: 'inline-flex', opacity: 0.6 }}>
                  <Icon />
                </span>
                {item.text}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default AnnouncementBar;
