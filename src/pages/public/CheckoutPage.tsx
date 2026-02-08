// ============================================================
// Pana Rabbids - CheckoutPage (Enhanced)
// Multi-step checkout with Wompi payment simulation,
// glassmorphism, step indicator, premium form inputs
// All inline styles - no external CSS dependencies
// ============================================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '../../components/common';
import { useCart } from '../../hooks/useCart';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { formatCOP } from '../../utils/formatCurrency';
import { COLOMBIAN_DEPARTMENTS, COLOMBIAN_CITIES } from '../../utils/constants';
import { validateCheckoutForm } from '../../utils/validators';
import { generateReferenceCode, getPrimaryImageUrl } from '../../utils/helpers';
import { notifyOrderPlaced } from '../../services/notificationService';
import { OrderStatus } from '../../types/order';
import type { Order } from '../../types/order';

// ── Types ────────────────────────────────────────────────────
interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingDepartment: string;
  shippingCity: string;
  postalCode: string;
  notes: string;
}

interface PaymentData {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

const initialFormData: FormData = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  shippingAddress: '',
  shippingDepartment: '',
  shippingCity: '',
  postalCode: '',
  notes: '',
};

const initialPaymentData: PaymentData = {
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvv: '',
};

// ── Glass card style ─────────────────────────────────────────
const glassCard: React.CSSProperties = {
  background: 'rgba(26, 26, 46, 0.65)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '16px',
  border: '1px solid rgba(196, 163, 90, 0.14)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
};

// ── Component ────────────────────────────────────────────────
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalItems, subtotal, shippingCost, total, clearCart, updateQuantity, removeItem } = useCart();
  const { customer: loggedInCustomer } = useCustomerAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Pre-fill form when customer is logged in
  useEffect(() => {
    if (loggedInCustomer) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || `${loggedInCustomer.firstName} ${loggedInCustomer.lastName}`.trim(),
        customerEmail: prev.customerEmail || loggedInCustomer.email,
        customerPhone: prev.customerPhone || loggedInCustomer.phone,
        shippingAddress: prev.shippingAddress || loggedInCustomer.address,
        shippingDepartment: prev.shippingDepartment || loggedInCustomer.department,
        shippingCity: prev.shippingCity || loggedInCustomer.city,
      }));
    }
  }, [loggedInCustomer]);
  const [paymentData, setPaymentData] = useState<PaymentData>(initialPaymentData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const checkoutCompleteRef = useRef(false);

  // Redirect if cart empty (but NOT after successful checkout)
  useEffect(() => {
    if (items.length === 0 && !checkoutCompleteRef.current) {
      navigate('/carrito', { replace: true });
    }
  }, [items.length, navigate]);

  // Available cities based on department
  const availableCities = useMemo(() => {
    if (!formData.shippingDepartment) return [];
    return COLOMBIAN_CITIES[formData.shippingDepartment] || [];
  }, [formData.shippingDepartment]);

  // Reset city when department changes
  useEffect(() => {
    if (formData.shippingCity && !availableCities.includes(formData.shippingCity)) {
      setFormData((prev) => ({ ...prev, shippingCity: '' }));
    }
  }, [availableCities, formData.shippingCity]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const result = validateCheckoutForm(formData);
    if (result.errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: result.errors[field] }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Payment field handlers
  const handlePaymentChange = (field: keyof PaymentData, value: string) => {
    let processed = value;

    if (field === 'cardNumber') {
      processed = value.replace(/\D/g, '').slice(0, 16);
      processed = processed.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    if (field === 'expiry') {
      processed = value.replace(/\D/g, '').slice(0, 4);
      if (processed.length > 2) {
        processed = processed.slice(0, 2) + '/' + processed.slice(2);
      }
    }
    if (field === 'cvv') {
      processed = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentData((prev) => ({ ...prev, [field]: processed }));
    if (paymentErrors[field]) {
      setPaymentErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validatePayment = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    const cardNum = paymentData.cardNumber.replace(/\s/g, '');

    if (!cardNum) {
      errs.cardNumber = 'Numero de tarjeta requerido';
    } else if (cardNum.length !== 16) {
      errs.cardNumber = 'Debe tener 16 digitos';
    }

    if (!paymentData.cardName.trim()) {
      errs.cardName = 'Nombre en la tarjeta requerido';
    }

    if (!paymentData.expiry) {
      errs.expiry = 'Fecha de vencimiento requerida';
    } else {
      const parts = paymentData.expiry.split('/');
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        errs.expiry = 'Formato MM/AA';
      } else {
        const month = parseInt(parts[0], 10);
        if (month < 1 || month > 12) {
          errs.expiry = 'Mes invalido';
        }
      }
    }

    if (!paymentData.cvv) {
      errs.cvv = 'CVV requerido';
    } else if (paymentData.cvv.length < 3) {
      errs.cvv = 'CVV invalido';
    }

    setPaymentErrors(errs);
    return Object.keys(errs).length === 0;
  }, [paymentData]);

  // Step navigation
  const goToStep = (step: number) => {
    if (step === 2) {
      // Validate contact info
      const allTouched: Record<string, boolean> = {};
      ['customerName', 'customerEmail', 'customerPhone'].forEach((key) => {
        allTouched[key] = true;
      });
      setTouched((prev) => ({ ...prev, ...allTouched }));

      const result = validateCheckoutForm(formData);
      const contactErrors: Record<string, string> = {};
      ['customerName', 'customerEmail', 'customerPhone'].forEach((key) => {
        if (result.errors[key]) contactErrors[key] = result.errors[key];
      });

      if (Object.keys(contactErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...contactErrors }));
        return;
      }
    }

    if (step === 3) {
      // Validate all form data
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      const result = validateCheckoutForm(formData);
      if (!result.isValid) {
        setErrors(result.errors);
        // If contact errors, go back to step 1
        const hasContactErrors = ['customerName', 'customerEmail', 'customerPhone'].some(
          (k) => result.errors[k]
        );
        if (hasContactErrors) {
          setCurrentStep(1);
          return;
        }
        return;
      }
    }

    setCurrentStep(step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate payment
    if (!validatePayment()) return;

    setIsSubmitting(true);

    // Simulate Wompi payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const refCode = generateReferenceCode();

    // Save order data for confirmation page
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });

    const orderData = {
      ref: refCode,
      items: items.map(item => ({
        name: item.product.name,
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
        price: item.variant.priceOverride ?? item.product.basePrice,
        image: item.product.images.find(img => img.isPrimary)?.imageUrl || item.product.images[0]?.imageUrl || '',
      })),
      subtotal,
      shippingCost,
      total,
      customer: {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
      },
      shipping: {
        address: formData.shippingAddress,
        city: formData.shippingCity,
        department: formData.shippingDepartment,
      },
      date: dateStr,
      status: 'PENDING_PAYMENT',
      statusHistory: [
        { status: 'PENDING_PAYMENT', date: dateStr, time: timeStr, description: 'Pedido recibido. Pendiente de confirmación de pago.' },
      ],
    };
    localStorage.setItem('pana_last_order', JSON.stringify(orderData));

    // Save to orders list
    try {
      const raw = localStorage.getItem('pana_orders') || '[]';
      const orders = JSON.parse(raw);
      orders.unshift(orderData);
      localStorage.setItem('pana_orders', JSON.stringify(orders));
    } catch { /* ignore */ }

    // Send notifications (fire-and-forget)
    try {
      const notificationOrder: Order = {
        id: Date.now(),
        referenceCode: refCode,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingDepartment: formData.shippingDepartment,
        subtotal,
        shippingCost,
        total,
        status: OrderStatus.PENDING_PAYMENT,
        paymentMethod: 'Wompi',
        trackingCode: null,
        notes: formData.notes || null,
        items: items.map((item, i) => ({
          id: i + 1,
          orderId: Date.now(),
          variantId: item.variant.id,
          productName: item.product.name,
          variantName: `${item.variant.color} / ${item.variant.size}`,
          quantity: item.quantity,
          unitPrice: item.variant.priceOverride ?? item.product.basePrice,
          totalPrice: (item.variant.priceOverride ?? item.product.basePrice) * item.quantity,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      notifyOrderPlaced(notificationOrder);
    } catch { /* notification failures should not block checkout */ }

    checkoutCompleteRef.current = true;
    clearCart();
    navigate(`/confirmacion?ref=${refCode}`);
  };

  const inputStyle = (field: string, isPayment = false): React.CSSProperties => {
    const isFocused = focusedField === field;
    const errMap = isPayment ? paymentErrors : errors;
    const touchedField = isPayment ? true : touched[field];
    const val = isPayment
      ? paymentData[field as keyof PaymentData]
      : formData[field as keyof FormData];
    const hasError = touchedField && errMap[field];
    const isValid = touchedField && !errMap[field] && val;

    return {
      width: '100%',
      padding: '14px 16px',
      background: isFocused ? 'rgba(26, 26, 46, 0.9)' : '#1A1A2E',
      border: `1px solid ${
        hasError
          ? '#E53E3E'
          : isFocused
          ? '#C4A35A'
          : isValid
          ? 'rgba(56, 161, 105, 0.4)'
          : 'rgba(196, 163, 90, 0.15)'
      }`,
      borderRadius: '8px',
      color: '#FAFAFA',
      fontFamily: "'Inter', sans-serif",
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      boxSizing: 'border-box' as const,
      boxShadow: isFocused
        ? '0 0 0 3px rgba(196, 163, 90, 0.12), 0 4px 20px rgba(0,0,0,0.2)'
        : 'none',
    };
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    color: 'rgba(250, 250, 250, 0.6)',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  };

  const errorStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: '#E53E3E',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const steps = [
    { num: 1, label: 'Informacion', icon: 'user' },
    { num: 2, label: 'Envio', icon: 'truck' },
    { num: 3, label: 'Pago', icon: 'card' },
  ];

  if (items.length === 0) return null;

  return (
    <>
      <SEOHead
        title="Checkout"
        description="Completa tu pedido en Pana Rabbids. Envio a toda Colombia."
      />

      <div
        style={{
          minHeight: '100vh',
          background: '#0D0D0D',
          paddingTop: '40px',
          paddingBottom: '80px',
          position: 'relative',
        }}
      >
        {/* Subtle ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(196, 163, 90, 0.03) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '40px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #C4A35A 0%, #E8D5A3 50%, #C4A35A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              margin: '0 0 36px 0',
              textAlign: 'center',
            }}
          >
            CHECKOUT
          </motion.h1>

          {/* ── Step Indicator ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0',
              marginBottom: '48px',
            }}
          >
            {steps.map((step, idx) => (
              <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: step.num <= currentStep ? 'pointer' : 'default',
                    opacity: step.num <= currentStep ? 1 : 0.5,
                  }}
                  onClick={() => {
                    if (step.num < currentStep) {
                      setCurrentStep(step.num);
                    }
                  }}
                  whileHover={step.num <= currentStep ? { scale: 1.05 } : {}}
                >
                  <motion.div
                    animate={{
                      background: currentStep >= step.num ? '#C4A35A' : 'rgba(250, 250, 250, 0.08)',
                      borderColor: currentStep >= step.num ? '#C4A35A' : 'rgba(250, 250, 250, 0.15)',
                      scale: currentStep === step.num ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      color: currentStep >= step.num ? '#0D0D0D' : 'rgba(250, 250, 250, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 700,
                      border: '2px solid',
                      boxShadow: currentStep === step.num ? '0 0 20px rgba(196, 163, 90, 0.3)' : 'none',
                    }}
                  >
                    {currentStep > step.num ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      step.num
                    )}
                  </motion.div>
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      color: currentStep >= step.num ? '#C4A35A' : 'rgba(250, 250, 250, 0.35)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {step.label}
                  </span>
                </motion.div>
                {idx < steps.length - 1 && (
                  <motion.div
                    animate={{
                      background: currentStep > step.num
                        ? '#C4A35A'
                        : 'rgba(250, 250, 250, 0.1)',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: '60px',
                      height: '2px',
                      margin: '0 16px',
                      borderRadius: '1px',
                    }}
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* ── Two Column Layout ─────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: '40px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {/* Left - Form (60%) */}
            <div style={{ flex: '1 1 55%', minWidth: '320px' }}>
              <AnimatePresence mode="wait">
                {/* ── Step 1: Contact Information ── */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div
                      style={{
                        ...glassCard,
                        padding: '32px',
                        marginBottom: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(196, 163, 90, 0.1)',
                            border: '1px solid rgba(196, 163, 90, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <h2
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: '20px',
                            fontWeight: 800,
                            color: '#C4A35A',
                            letterSpacing: '2.5px',
                            textTransform: 'uppercase',
                            margin: 0,
                          }}
                        >
                          INFORMACION DE CONTACTO
                        </h2>
                      </div>

                      {/* Full Name */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Nombre completo *</label>
                        <input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) => handleChange('customerName', e.target.value)}
                          onBlur={() => {
                            handleBlur('customerName');
                            setFocusedField(null);
                          }}
                          onFocus={() => setFocusedField('customerName')}
                          placeholder="Juan Carlos Perez"
                          style={inputStyle('customerName')}
                        />
                        {touched.customerName && errors.customerName && (
                          <motion.span
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={errorStyle}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {errors.customerName}
                          </motion.span>
                        )}
                      </div>

                      {/* Email */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Correo electronico *</label>
                        <input
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => handleChange('customerEmail', e.target.value)}
                          onBlur={() => {
                            handleBlur('customerEmail');
                            setFocusedField(null);
                          }}
                          onFocus={() => setFocusedField('customerEmail')}
                          placeholder="juan@ejemplo.com"
                          style={inputStyle('customerEmail')}
                        />
                        {touched.customerEmail && errors.customerEmail && (
                          <motion.span
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={errorStyle}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {errors.customerEmail}
                          </motion.span>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label style={labelStyle}>Telefono *</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div
                            style={{
                              padding: '14px 12px',
                              background: 'rgba(196, 163, 90, 0.08)',
                              border: '1px solid rgba(196, 163, 90, 0.15)',
                              borderRadius: '8px',
                              color: 'rgba(250, 250, 250, 0.5)',
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '14px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            +57
                          </div>
                          <input
                            type="tel"
                            value={formData.customerPhone}
                            onChange={(e) => handleChange('customerPhone', e.target.value)}
                            onBlur={() => {
                              handleBlur('customerPhone');
                              setFocusedField(null);
                            }}
                            onFocus={() => setFocusedField('customerPhone')}
                            placeholder="3001234567"
                            style={inputStyle('customerPhone')}
                          />
                        </div>
                        {touched.customerPhone && errors.customerPhone && (
                          <motion.span
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={errorStyle}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {errors.customerPhone}
                          </motion.span>
                        )}
                      </div>
                    </div>

                    {/* Next step button */}
                    <motion.button
                      type="button"
                      onClick={() => goToStep(2)}
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)',
                        color: '#0D0D0D',
                        border: 'none',
                        borderRadius: '8px',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '15px',
                        fontWeight: 800,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(196, 163, 90, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                      }}
                    >
                      CONTINUAR A ENVIO
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </motion.button>
                  </motion.div>
                )}

                {/* ── Step 2: Shipping Address ── */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div
                      style={{
                        ...glassCard,
                        padding: '32px',
                        marginBottom: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(196, 163, 90, 0.1)',
                            border: '1px solid rgba(196, 163, 90, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                          </svg>
                        </div>
                        <h2
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: '20px',
                            fontWeight: 800,
                            color: '#C4A35A',
                            letterSpacing: '2.5px',
                            textTransform: 'uppercase',
                            margin: 0,
                          }}
                        >
                          DIRECCION DE ENVIO
                        </h2>
                      </div>

                      {/* Address */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Direccion completa *</label>
                        <input
                          type="text"
                          value={formData.shippingAddress}
                          onChange={(e) => handleChange('shippingAddress', e.target.value)}
                          onBlur={() => {
                            handleBlur('shippingAddress');
                            setFocusedField(null);
                          }}
                          onFocus={() => setFocusedField('shippingAddress')}
                          placeholder="Calle 123 #45-67, Barrio, Conjunto..."
                          style={inputStyle('shippingAddress')}
                        />
                        {touched.shippingAddress && errors.shippingAddress && (
                          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={errorStyle}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {errors.shippingAddress}
                          </motion.span>
                        )}
                      </div>

                      {/* Department & City */}
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <div style={{ flex: '1 1 48%', minWidth: '200px' }}>
                          <label style={labelStyle}>Departamento *</label>
                          <select
                            value={formData.shippingDepartment}
                            onChange={(e) => handleChange('shippingDepartment', e.target.value)}
                            onBlur={() => {
                              handleBlur('shippingDepartment');
                              setFocusedField(null);
                            }}
                            onFocus={() => setFocusedField('shippingDepartment')}
                            style={{
                              ...inputStyle('shippingDepartment'),
                              appearance: 'none',
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4A35A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 16px center',
                              paddingRight: '40px',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="" style={{ background: '#1A1A2E', color: '#FAFAFA' }}>
                              Seleccionar departamento
                            </option>
                            {COLOMBIAN_DEPARTMENTS.map((dept) => (
                              <option key={dept} value={dept} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>
                                {dept}
                              </option>
                            ))}
                          </select>
                          {touched.shippingDepartment && errors.shippingDepartment && (
                            <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={errorStyle}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                              {errors.shippingDepartment}
                            </motion.span>
                          )}
                        </div>

                        <div style={{ flex: '1 1 48%', minWidth: '200px' }}>
                          <label style={labelStyle}>Ciudad *</label>
                          <select
                            value={formData.shippingCity}
                            onChange={(e) => handleChange('shippingCity', e.target.value)}
                            onBlur={() => {
                              handleBlur('shippingCity');
                              setFocusedField(null);
                            }}
                            onFocus={() => setFocusedField('shippingCity')}
                            disabled={!formData.shippingDepartment}
                            style={{
                              ...inputStyle('shippingCity'),
                              appearance: 'none',
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4A35A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 16px center',
                              paddingRight: '40px',
                              cursor: formData.shippingDepartment ? 'pointer' : 'not-allowed',
                              opacity: formData.shippingDepartment ? 1 : 0.5,
                            }}
                          >
                            <option value="" style={{ background: '#1A1A2E', color: '#FAFAFA' }}>
                              {formData.shippingDepartment ? 'Seleccionar ciudad' : 'Primero selecciona departamento'}
                            </option>
                            {availableCities.map((city) => (
                              <option key={city} value={city} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>
                                {city}
                              </option>
                            ))}
                          </select>
                          {touched.shippingCity && errors.shippingCity && (
                            <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={errorStyle}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                              {errors.shippingCity}
                            </motion.span>
                          )}
                        </div>
                      </div>

                      {/* Postal Code */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Codigo postal (opcional)</label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => handleChange('postalCode', e.target.value)}
                          onFocus={() => setFocusedField('postalCode')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="110111"
                          style={{ ...inputStyle('postalCode'), maxWidth: '200px' }}
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label style={labelStyle}>Instrucciones adicionales (opcional)</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          onFocus={() => setFocusedField('notes')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Indicaciones especiales para la entrega..."
                          rows={3}
                          style={{
                            ...inputStyle('notes'),
                            resize: 'vertical',
                            minHeight: '80px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Navigation buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <motion.button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          flex: '0 0 auto',
                          padding: '16px 28px',
                          background: 'transparent',
                          color: '#C4A35A',
                          border: '1px solid rgba(196, 163, 90, 0.3)',
                          borderRadius: '8px',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '14px',
                          fontWeight: 700,
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        ATRAS
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => goToStep(3)}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          flex: 1,
                          padding: '16px',
                          background: 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)',
                          color: '#0D0D0D',
                          border: 'none',
                          borderRadius: '8px',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '15px',
                          fontWeight: 800,
                          letterSpacing: '3px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          boxShadow: '0 4px 20px rgba(196, 163, 90, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                        }}
                      >
                        CONTINUAR A PAGO
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: Payment (Wompi simulation) ── */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div
                      style={{
                        ...glassCard,
                        padding: '32px',
                        marginBottom: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Simulated badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          padding: '4px 12px',
                          background: 'rgba(196, 163, 90, 0.1)',
                          border: '1px solid rgba(196, 163, 90, 0.2)',
                          borderRadius: '20px',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '10px',
                          color: '#C4A35A',
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                        }}
                      >
                        MODO SIMULACION
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(196, 163, 90, 0.1)',
                            border: '1px solid rgba(196, 163, 90, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                          </svg>
                        </div>
                        <div>
                          <h2
                            style={{
                              fontFamily: "'Barlow Condensed', sans-serif",
                              fontSize: '20px',
                              fontWeight: 800,
                              color: '#C4A35A',
                              letterSpacing: '2.5px',
                              textTransform: 'uppercase',
                              margin: 0,
                            }}
                          >
                            PAGO CON TARJETA
                          </h2>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '11px',
                              color: 'rgba(250, 250, 250, 0.4)',
                              margin: '2px 0 0 0',
                            }}
                          >
                            Procesado por Wompi (simulacion local)
                          </p>
                        </div>
                      </div>

                      {/* Test card hint */}
                      <div
                        style={{
                          padding: '12px 16px',
                          background: 'rgba(59, 130, 246, 0.06)',
                          border: '1px solid rgba(59, 130, 246, 0.15)',
                          borderRadius: '8px',
                          marginBottom: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '12px',
                            color: '#3B82F6',
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          Tarjeta de prueba:{' '}
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                            4242 4242 4242 4242
                          </span>
                        </p>
                      </div>

                      {/* Card Number */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Numero de tarjeta *</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={paymentData.cardNumber}
                            onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                            onFocus={() => setFocusedField('cardNumber')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="4242 4242 4242 4242"
                            style={{
                              ...inputStyle('cardNumber', true),
                              fontFamily: "'JetBrains Mono', monospace",
                              letterSpacing: '2px',
                              paddingRight: '60px',
                            }}
                          />
                          {/* Card brand indicator */}
                          <div
                            style={{
                              position: 'absolute',
                              right: '14px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {paymentData.cardNumber.startsWith('4') && (
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#1A73E8', fontWeight: 700 }}>VISA</span>
                            )}
                            {paymentData.cardNumber.startsWith('5') && (
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#EB001B', fontWeight: 700 }}>MC</span>
                            )}
                          </div>
                        </div>
                        {paymentErrors.cardNumber && (
                          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={errorStyle}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {paymentErrors.cardNumber}
                          </motion.span>
                        )}
                      </div>

                      {/* Card Name */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Nombre en la tarjeta *</label>
                        <input
                          type="text"
                          value={paymentData.cardName}
                          onChange={(e) => handlePaymentChange('cardName', e.target.value.toUpperCase())}
                          onFocus={() => setFocusedField('cardName')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="JUAN CARLOS PEREZ"
                          style={{
                            ...inputStyle('cardName', true),
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                          }}
                        />
                        {paymentErrors.cardName && (
                          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={errorStyle}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {paymentErrors.cardName}
                          </motion.span>
                        )}
                      </div>

                      {/* Expiry & CVV row */}
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Vencimiento *</label>
                          <input
                            type="text"
                            value={paymentData.expiry}
                            onChange={(e) => handlePaymentChange('expiry', e.target.value)}
                            onFocus={() => setFocusedField('expiry')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="MM/AA"
                            style={{
                              ...inputStyle('expiry', true),
                              fontFamily: "'JetBrains Mono', monospace",
                              letterSpacing: '2px',
                              textAlign: 'center',
                            }}
                          />
                          {paymentErrors.expiry && (
                            <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={errorStyle}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                              {paymentErrors.expiry}
                            </motion.span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>CVV *</label>
                          <input
                            type="password"
                            value={paymentData.cvv}
                            onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                            onFocus={() => setFocusedField('cvv')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="***"
                            style={{
                              ...inputStyle('cvv', true),
                              fontFamily: "'JetBrains Mono', monospace",
                              letterSpacing: '4px',
                              textAlign: 'center',
                            }}
                          />
                          {paymentErrors.cvv && (
                            <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={errorStyle}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                              {paymentErrors.cvv}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Navigation buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <motion.button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          flex: '0 0 auto',
                          padding: '16px 28px',
                          background: 'transparent',
                          color: '#C4A35A',
                          border: '1px solid rgba(196, 163, 90, 0.3)',
                          borderRadius: '8px',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '14px',
                          fontWeight: 700,
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        ATRAS
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={!isSubmitting ? { scale: 1.01, y: -2 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                        style={{
                          flex: 1,
                          padding: '16px',
                          background: isSubmitting
                            ? 'rgba(196, 163, 90, 0.5)'
                            : 'linear-gradient(135deg, #C4A35A 0%, #D4B76A 100%)',
                          color: '#0D0D0D',
                          border: 'none',
                          borderRadius: '8px',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '15px',
                          fontWeight: 800,
                          letterSpacing: '3px',
                          textTransform: 'uppercase',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          boxShadow: isSubmitting ? 'none' : '0 4px 20px rgba(196, 163, 90, 0.2)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {isSubmitting ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span className="checkout-spinner" />
                            PROCESANDO PAGO...
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            PAGAR {formatCOP(total)}
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Right - Order Summary (40%) glass morphism ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                flex: '0 0 38%',
                minWidth: '300px',
                position: 'sticky',
                top: '100px',
              }}
            >
              <div
                style={{
                  ...glassCard,
                  padding: '32px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Gold accent top border */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)',
                  }}
                />

                <h2
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#FAFAFA',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    margin: '0 0 24px 0',
                  }}
                >
                  TU PEDIDO
                </h2>

                {/* Items list - editable */}
                <div style={{ marginBottom: '20px' }}>
                  {items.map((item) => {
                    const price = item.variant.priceOverride ?? item.product.basePrice;
                    const imageUrl = getPrimaryImageUrl(item.product.images);
                    return (
                      <div
                        key={item.variant.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          marginBottom: '14px',
                          paddingBottom: '14px',
                          borderBottom: '1px solid rgba(250, 250, 250, 0.06)',
                        }}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            style={{
                              width: '52px',
                              height: '52px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid rgba(196, 163, 90, 0.1)',
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontFamily: "'Barlow Condensed', sans-serif",
                              fontSize: '13px',
                              fontWeight: 700,
                              color: '#FAFAFA',
                              margin: 0,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.product.name}
                          </p>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '11px',
                              color: 'rgba(250, 250, 250, 0.4)',
                              margin: '2px 0 0 0',
                            }}
                          >
                            {item.variant.size} / {item.variant.color}
                          </p>
                          {/* Quantity controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                            <button
                              onClick={() => {
                                if (item.quantity <= 1) { removeItem(item.variant.id); }
                                else { updateQuantity(item.variant.id, item.quantity - 1); }
                              }}
                              style={{
                                width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(250,250,250,0.1)',
                                background: 'rgba(250,250,250,0.04)', color: 'rgba(250,250,250,0.6)',
                                fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', padding: 0,
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,163,90,0.3)'; (e.currentTarget as HTMLElement).style.color = '#C4A35A'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(250,250,250,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.6)'; }}
                            >
                              {item.quantity <= 1 ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                              ) : '−'}
                            </button>
                            <span style={{
                              fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                              fontWeight: 700, color: '#FAFAFA', minWidth: 18, textAlign: 'center',
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variant.id, Math.min(item.quantity + 1, item.variant.stock))}
                              disabled={item.quantity >= item.variant.stock}
                              style={{
                                width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(250,250,250,0.1)',
                                background: 'rgba(250,250,250,0.04)', color: item.quantity >= item.variant.stock ? 'rgba(250,250,250,0.15)' : 'rgba(250,250,250,0.6)',
                                fontSize: 14, fontWeight: 600, cursor: item.quantity >= item.variant.stock ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => { if (item.quantity < item.variant.stock) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,163,90,0.3)'; (e.currentTarget as HTMLElement).style.color = '#C4A35A'; } }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(250,250,250,0.1)'; (e.currentTarget as HTMLElement).style.color = item.quantity >= item.variant.stock ? 'rgba(250,250,250,0.15)' : 'rgba(250,250,250,0.6)'; }}
                            >
                              +
                            </button>
                            {/* Remove button */}
                            <button
                              onClick={() => removeItem(item.variant.id)}
                              style={{
                                marginLeft: 'auto', background: 'none', border: 'none',
                                color: 'rgba(250,250,250,0.25)', cursor: 'pointer', padding: '2px',
                                display: 'flex', alignItems: 'center', transition: 'color 0.2s',
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.25)'; }}
                              title="Eliminar producto"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#FAFAFA',
                            flexShrink: 0,
                          }}
                        >
                          {formatCOP(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(196, 163, 90, 0.2), transparent)',
                    marginBottom: '16px',
                  }}
                />

                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250, 250, 250, 0.6)' }}>
                    Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>
                    {formatCOP(subtotal)}
                  </span>
                </div>

                {/* Shipping */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(250, 250, 250, 0.6)' }}>
                    Envio
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 600,
                      color: shippingCost === 0 ? '#38A169' : '#FAFAFA',
                    }}
                  >
                    {shippingCost === 0 ? 'GRATIS' : formatCOP(shippingCost)}
                  </span>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(196, 163, 90, 0.3), transparent)',
                    marginBottom: '16px',
                  }}
                />

                {/* Total */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#FAFAFA',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Total
                  </span>
                  <motion.span
                    key={total}
                    initial={{ scale: 0.9, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '24px',
                      fontWeight: 800,
                      color: '#C4A35A',
                    }}
                  >
                    {formatCOP(total)}
                  </motion.span>
                </div>

                {/* Security badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    background: 'rgba(56, 161, 105, 0.06)',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 161, 105, 0.12)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      color: '#38A169',
                      fontWeight: 600,
                    }}
                  >
                    Pago 100% seguro
                  </span>
                </div>

                {/* Back to cart */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Link
                    to="/carrito"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '13px',
                      color: 'rgba(250, 250, 250, 0.5)',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#C4A35A';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(250, 250, 250, 0.5)';
                    }}
                  >
                    Volver al carrito
                  </Link>
                </div>

                {/* Payment methods with icons */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                    }}
                  >
                    {['Visa', 'Mastercard', 'PSE', 'Nequi'].map((method) => (
                      <div
                        key={method}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '9px',
                          color: 'rgba(250,250,250,0.45)',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}>
                          {method}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '9px',
                    color: 'rgba(250,250,250,0.25)',
                    letterSpacing: '0.5px',
                  }}>
                    Pagos procesados por Wompi
                  </span>
                </div>
              </div>
            </motion.div>
          </form>
        </div>
      </div>

      {/* Spinner animation + responsive */}
      <style>{`
        @keyframes checkoutSpin {
          to { transform: rotate(360deg); }
        }
        .checkout-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(13, 13, 13, 0.3);
          border-top-color: #0D0D0D;
          border-radius: 50%;
          animation: checkoutSpin 0.6s linear infinite;
        }
        /* ── Responsive checkout ── */
        @media (max-width: 900px) {
          form > div {
            flex-direction: column !important;
          }
          form > div > div:first-child {
            flex: 1 1 100% !important;
            min-width: 100% !important;
          }
          form > div > div:last-child {
            flex: 1 1 100% !important;
            min-width: 100% !important;
            position: static !important;
          }
        }
        @media (max-width: 560px) {
          form > div > div > div {
            padding: 20px !important;
          }
        }
        /* ── Input placeholder ── */
        input::placeholder {
          color: rgba(250,250,250,0.25) !important;
        }
      `}</style>
    </>
  );
};

export default CheckoutPage;
