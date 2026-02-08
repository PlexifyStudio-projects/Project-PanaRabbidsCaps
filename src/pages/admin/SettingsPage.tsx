// ============================================================
// Pana Rabbids - Settings Page
// All settings persist to localStorage and reflect across the site
// ============================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCOP } from '../../utils/formatCurrency';
import { loadStoreSettings, saveStoreSettings, formatWhatsApp } from '../../data/settingsService';
import type { StoreSettings } from '../../data/settingsService';

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(loadStoreSettings);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateField = useCallback(<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    saveStoreSettings(settings);
    setSaving(false);
    setHasChanges(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', background: 'rgba(250,250,250,0.04)',
    border: '1px solid rgba(250,250,250,0.08)', borderRadius: 10, color: '#FAFAFA',
    fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' as const,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(250,250,250,0.6)',
    marginBottom: 6,
  };

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(250,250,250,0.03)', border: '1px solid rgba(250,250,250,0.06)',
    borderRadius: 14, padding: '22px 24px', marginBottom: 16,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 15, fontWeight: 700, color: '#C4A35A', marginBottom: 18,
  };

  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; };

  const maskedValue = (val: string, show: boolean) => show ? val : '\u2022'.repeat(Math.min(val.length, 20)) + '...';

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', margin: 0, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
          Ajustes
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(250,250,250,0.4)', margin: '4px 0 0' }}>
          Configura tu tienda - los cambios se reflejan en toda la pagina
        </p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 1000,
              background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(56,161,105,0.3)',
              borderRadius: 12, padding: '14px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>&#9989;</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>Cambios guardados - se reflejan en toda la pagina</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section: Mi Tienda */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Mi Tienda</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nombre de la tienda</label>
          <input type="text" value={settings.storeName} onChange={(e) => updateField('storeName', e.target.value)} onFocus={focusHandler} onBlur={blurHandler} style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input type="text" value={settings.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="573001234567" style={inputStyle} />
            {settings.whatsapp && (
              <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)', marginTop: 4 }}>{formatWhatsApp(settings.whatsapp)}</div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Email de contacto</label>
            <input type="email" value={settings.email} onChange={(e) => updateField('email', e.target.value)} onFocus={focusHandler} onBlur={blurHandler} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Horario de atencion</label>
            <input type="text" value={settings.schedule} onChange={(e) => updateField('schedule', e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="Lun - Sab, 9:00 AM - 6:00 PM" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ubicacion</label>
            <input type="text" value={settings.location} onChange={(e) => updateField('location', e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="Colombia" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Section: Redes Sociales */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Redes Sociales</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Instagram URL</label>
            <input type="text" value={settings.instagram} onChange={(e) => updateField('instagram', e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="https://instagram.com/..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>TikTok URL</label>
            <input type="text" value={settings.tiktok} onChange={(e) => updateField('tiktok', e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="https://tiktok.com/@..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Facebook URL</label>
            <input type="text" value={settings.facebook} onChange={(e) => updateField('facebook', e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="https://facebook.com/..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Twitter / X URL</label>
            <input type="text" value={settings.twitter} onChange={(e) => updateField('twitter', e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="https://x.com/..." style={inputStyle} />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(250,250,250,0.3)', marginTop: 12, lineHeight: 1.5, margin: '12px 0 0' }}>
          Estos links aparecen en el footer de tu tienda
        </p>
      </div>

      {/* Section: Envio */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Envio</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Envio gratis desde (COP)</label>
            <input
              type="number" value={settings.freeShippingThreshold} onChange={(e) => updateField('freeShippingThreshold', e.target.value)}
              onFocus={focusHandler} onBlur={blurHandler}
              style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }}
            />
            {settings.freeShippingThreshold && (
              <div style={{ fontSize: 12, color: '#C4A35A', marginTop: 4 }}>{formatCOP(Number(settings.freeShippingThreshold))}</div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Costo de envio (COP)</label>
            <input
              type="number" value={settings.shippingCost} onChange={(e) => updateField('shippingCost', e.target.value)}
              onFocus={focusHandler} onBlur={blurHandler}
              style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }}
            />
            {settings.shippingCost && (
              <div style={{ fontSize: 12, color: '#C4A35A', marginTop: 4 }}>{formatCOP(Number(settings.shippingCost))}</div>
            )}
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(250,250,250,0.3)', marginTop: 12, lineHeight: 1.5, margin: '12px 0 0' }}>
          Estos valores se usan en el checkout, en la barra de anuncios y en las paginas de producto
        </p>
      </div>

      {/* Section: Producto */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Pagina de Producto</div>
        <div>
          <label style={labelStyle}>Nota al pie (aparece debajo de la descripci&oacute;n)</label>
          <textarea
            value={settings.productFooterNote || 'Todas nuestras gorras vienen con certificado de autenticidad y empaque premium. Calidad garantizada por Pana Rabbids.'}
            onChange={(e) => updateField('productFooterNote', e.target.value)}
            onFocus={(e: any) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
            onBlur={(e: any) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 60, fontFamily: 'inherit' }}
          />
          <p style={{ fontSize: 12, color: 'rgba(250,250,250,0.3)', marginTop: 6, lineHeight: 1.5, margin: '6px 0 0' }}>
            Aparece debajo de la descripci&oacute;n de cada producto
          </p>
        </div>
      </div>

      {/* Section: Pagos */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Pagos (Wompi)</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Llave publica</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={maskedValue(settings.wompiPublicKey, showPublicKey)}
              onChange={(e) => { if (showPublicKey) updateField('wompiPublicKey', e.target.value); }}
              onFocus={focusHandler} onBlur={blurHandler}
              style={{ ...inputStyle, paddingRight: 70, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
            />
            <button type="button" onClick={() => setShowPublicKey(!showPublicKey)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(250,250,250,0.4)', cursor: 'pointer', fontSize: 12, padding: '4px 8px' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C4A35A'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.4)'; }}
            >
              {showPublicKey ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Llave privada</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={maskedValue(settings.wompiPrivateKey, showPrivateKey)}
              onChange={(e) => { if (showPrivateKey) updateField('wompiPrivateKey', e.target.value); }}
              onFocus={focusHandler} onBlur={blurHandler}
              style={{ ...inputStyle, paddingRight: 70, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
            />
            <button type="button" onClick={() => setShowPrivateKey(!showPrivateKey)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(250,250,250,0.4)', cursor: 'pointer', fontSize: 12, padding: '4px 8px' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C4A35A'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.4)'; }}
            >
              {showPrivateKey ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>
        {/* Sandbox Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
          <button onClick={() => updateField('sandboxMode', !settings.sandboxMode)}
            style={{ width: 48, height: 26, borderRadius: 13, border: 'none', padding: 0, background: settings.sandboxMode ? '#38A169' : 'rgba(250,250,250,0.12)', position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FAFAFA', position: 'absolute', top: 3, left: settings.sandboxMode ? 25 : 3, transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </button>
          <div>
            <div style={{ fontSize: 14, color: '#FAFAFA', fontWeight: 500 }}>Modo pruebas</div>
            <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)' }}>Las transacciones no son reales</div>
          </div>
        </div>
        {settings.sandboxMode && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: '#3B82F6', lineHeight: 1.5 }}>
              Modo pruebas activo. Usa la tarjeta 4242 4242 4242 4242 para probar.
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, paddingBottom: 40, marginTop: 8 }}>
        {hasChanges && (
          <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 500 }}>
            Tienes cambios sin guardar
          </span>
        )}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={!saving ? { scale: 1.02, boxShadow: '0 6px 24px rgba(196,163,90,0.25)' } : {}}
          whileTap={!saving ? { scale: 0.98 } : {}}
          style={{
            padding: '12px 36px',
            background: saving ? 'rgba(196,163,90,0.5)' : 'linear-gradient(135deg, #C4A35A, #D4B86A)',
            border: 'none', borderRadius: 10, color: '#0D0D0D', fontSize: 14, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: 1,
          }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </motion.button>
      </div>
    </div>
  );
}
