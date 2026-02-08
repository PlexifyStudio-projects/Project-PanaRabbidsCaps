// ============================================================
// Pana Rabbids - NotFoundPage (404)
// Premium 404 page with featured products
// All inline styles - no external CSS dependencies
// ============================================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '../../components/common';
import { getFeaturedProducts } from '../../data/productDataService';
import { ProductCard } from '../../components/products';

const NotFoundPage = () => {
  const featured = getFeaturedProducts().slice(0, 4);

  return (
    <>
      <SEOHead
        title="404 - Pagina No Encontrada"
        description="La pagina que buscas no existe. Vuelve al inicio de Pana Rabbids."
      />

      <div
        style={{
          minHeight: '100vh',
          background: '#0D0D0D',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 404 Hero */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px 60px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -60%)',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(196, 163, 90, 0.04) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Large 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: 'relative', marginBottom: '8px' }}
          >
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '180px',
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: '2px rgba(196, 163, 90, 0.15)',
                lineHeight: 0.85,
                display: 'block',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              404
            </span>
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '180px',
                fontWeight: 900,
                background: 'linear-gradient(180deg, #C4A35A 0%, rgba(196, 163, 90, 0.3) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 0.85,
                display: 'block',
                textAlign: 'center',
                userSelect: 'none',
                filter: 'blur(0px)',
              }}
            >
              404
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '28px',
              fontWeight: 800,
              color: '#FAFAFA',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              margin: '0 0 12px 0',
              textAlign: 'center',
            }}
          >
            PAGINA NO ENCONTRADA
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              color: 'rgba(250, 250, 250, 0.5)',
              margin: '0 0 32px 0',
              textAlign: 'center',
              maxWidth: '450px',
              lineHeight: 1.6,
            }}
          >
            Lo sentimos, la pagina que buscas no existe o ha sido movida. Pero tenemos muchas gorras esperandote.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link
              to="/"
              style={{
                display: 'inline-block',
                background: '#C4A35A',
                color: '#0D0D0D',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '16px 48px',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#D4B76A';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(196, 163, 90, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#C4A35A';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              VOLVER AL INICIO
            </Link>
          </motion.div>
        </div>

        {/* Featured Products */}
        {featured.length > 0 && (
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px 80px 20px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Divider */}
            <div
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(196, 163, 90, 0.15), transparent)',
                marginBottom: '48px',
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center', marginBottom: '40px' }}
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
                MIENTRAS TANTO
              </span>
              <h2
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#FAFAFA',
                  letterSpacing: '2px',
                  margin: '12px 0 0 0',
                }}
              >
                QUIZAS TE INTERESE...
              </h2>
            </motion.div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '24px',
              }}
            >
              {featured.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotFoundPage;
