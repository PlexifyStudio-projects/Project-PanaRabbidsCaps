import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { useAuth } from '../../hooks/useAuth';
import { SEOHead } from '../../components/common';

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: customerLogin, isLoading: customerLoading, error: customerError, clearError: clearCustomerError } = useCustomerAuth();
  const { login: adminLogin, clearError: clearAdminError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/mi-cuenta';

  const isLoading = loading || customerLoading;
  const error = localError || customerError;

  const clearError = () => {
    setLocalError('');
    clearCustomerError();
    clearAdminError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      setLocalError('Ingresa tu correo y contraseña.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);

    // Try admin login first
    try {
      await adminLogin({ email, password });
      setLoading(false);
      navigate('/admin', { replace: true });
      return;
    } catch {
      clearAdminError();
      // Not admin, try customer login
    }

    // Try customer login
    try {
      await customerLogin({ email, password });
      setLoading(false);
      navigate(from, { replace: true });
    } catch {
      setLoading(false);
      // error set in customer context
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(196,163,90,0.2)',
    borderRadius: '8px',
    color: '#FAFAFA',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: `all 0.3s ${EASE}`,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    color: 'rgba(250,250,250,0.6)',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
  };

  return (
    <>
    <SEOHead
      title="Iniciar Sesión"
      description="Inicia sesión en tu cuenta PlexifyCaps para ver tus pedidos, favoritos y más."
    />
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(26, 26, 46, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          border: '1px solid rgba(196,163,90,0.14)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
          padding: '44px 36px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: '28px',
            color: '#C4A35A',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          Iniciar Sesión
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(250,250,250,0.5)',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
            marginBottom: '32px',
          }}
        >
          Accede a tu cuenta PlexifyCaps
        </p>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '13px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              placeholder="tu@correo.com"
              style={inputStyle}
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              placeholder="Tu contraseña"
              style={inputStyle}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading ? 'rgba(196,163,90,0.4)' : '#C4A35A',
              color: '#0D0D0D',
              border: 'none',
              borderRadius: '8px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: `all 0.3s ${EASE}`,
            }}
          >
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '13px',
            color: 'rgba(250,250,250,0.5)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            style={{
              color: '#C4A35A',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Regístrate
          </Link>
        </p>
      </motion.div>
    </div>
    </>
  );
};

export default CustomerLoginPage;
