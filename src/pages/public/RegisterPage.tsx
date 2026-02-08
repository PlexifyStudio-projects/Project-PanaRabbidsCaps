import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { COLOMBIAN_DEPARTMENTS, COLOMBIAN_CITIES } from '../../utils/constants';
import { SEOHead } from '../../components/common';

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useCustomerAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    department: '',
    city: '',
  });
  const [localError, setLocalError] = useState('');

  const cities = form.department ? COLOMBIAN_CITIES[form.department] || [] : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    clearError();
    setLocalError('');
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'department') next.city = '';
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setLocalError('Todos los campos marcados son obligatorios.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setLocalError('Ingresa un correo electrónico válido.');
      return;
    }
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setLocalError('Ingresa un número de teléfono válido (mínimo 10 dígitos).');
      return;
    }
    if (form.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setLocalError('La contraseña debe incluir al menos una mayúscula y un número.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: form.address,
        department: form.department,
        city: form.city,
      });
      navigate('/mi-cuenta');
    } catch {
      // error is set in context
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
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

  const displayError = localError || error;

  return (
    <>
    <SEOHead
      title="Crear Cuenta"
      description="Regístrate en Pana Rabbids y accede a gorras premium exclusivas. Envío gratis en Colombia."
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
          maxWidth: '520px',
          background: 'rgba(26, 26, 46, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          border: '1px solid rgba(196,163,90,0.14)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
          padding: '40px 36px',
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
          Crear Cuenta
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(250,250,250,0.5)',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
            marginBottom: '28px',
          }}
        >
          Únete a Pana Rabbids
        </p>

        {displayError && (
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
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Tu nombre"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Apellido *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Tu apellido"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Correo electrónico *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Teléfono *</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="300 123 4567"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <label style={labelStyle}>Contraseña *</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirmar *</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repetir contraseña"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Dirección</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Calle, número, barrio"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <label style={labelStyle}>Departamento</label>
              <select name="department" value={form.department} onChange={handleChange} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4A35A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
                <option value="" style={{ background: '#1A1A2E', color: '#FAFAFA' }}>Seleccionar</option>
                {COLOMBIAN_DEPARTMENTS.map((d) => (
                  <option key={d} value={d} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <select name="city" value={form.city} onChange={handleChange} disabled={!form.department} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4A35A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px', opacity: form.department ? 1 : 0.5 }}>
                <option value="" style={{ background: '#1A1A2E', color: '#FAFAFA' }}>Seleccionar</option>
                {cities.map((c) => (
                  <option key={c} value={c} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              marginTop: '28px',
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
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: 'rgba(250,250,250,0.5)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            style={{
              color: '#C4A35A',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
    </>
  );
};

export default RegisterPage;
