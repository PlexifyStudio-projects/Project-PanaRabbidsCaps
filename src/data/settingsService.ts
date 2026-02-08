// ============================================================
// Pana Rabbids - Settings Service
// Shared settings reader for the whole site
// Reads from localStorage 'pana_settings', falls back to defaults
// ============================================================

const STORAGE_KEY = 'pana_settings';

export interface StoreSettings {
  storeName: string;
  whatsapp: string;
  email: string;
  freeShippingThreshold: string;
  shippingCost: string;
  wompiPublicKey: string;
  wompiPrivateKey: string;
  sandboxMode: boolean;
  schedule: string;
  location: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  twitter: string;
  productFooterNote: string;
}

const DEFAULTS: StoreSettings = {
  storeName: 'Pana Rabbids',
  whatsapp: '573151573329',
  email: 'info@panarabbids.com',
  freeShippingThreshold: '200000',
  shippingCost: '12000',
  wompiPublicKey: 'pub_prod_xxxxxxxxxxxxxxxxxx',
  wompiPrivateKey: 'prv_prod_xxxxxxxxxxxxxxxxxx',
  sandboxMode: true,
  schedule: 'Lun - Sab, 9:00 AM - 6:00 PM',
  location: 'Bucaramanga, Colombia',
  instagram: 'https://instagram.com/panarabbids',
  tiktok: 'https://tiktok.com/@panarabbids',
  facebook: 'https://facebook.com/panarabbids',
  twitter: 'https://x.com/panarabbids',
  productFooterNote: 'Todas nuestras gorras vienen con certificado de autenticidad y empaque premium. Calidad garantizada por Pana Rabbids.',
};

/** Load settings - usable from any component */
export function loadStoreSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...DEFAULTS, ...saved };
    }
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

/** Save settings */
export function saveStoreSettings(settings: StoreSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/** Get formatted WhatsApp number for display */
export function formatWhatsApp(raw: string): string {
  // Format 573001234567 → +57 300 123 4567
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) {
    return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.length === 10) {
    return `+57 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return raw;
}

/** Get WhatsApp link */
export function getWhatsAppLink(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

/** Get formatted free shipping threshold */
export function getFreeShippingThreshold(): number {
  const settings = loadStoreSettings();
  return Number(settings.freeShippingThreshold) || 200000;
}

/** Get formatted shipping cost */
export function getShippingCost(): number {
  const settings = loadStoreSettings();
  return Number(settings.shippingCost) || 12000;
}

export { DEFAULTS as SETTINGS_DEFAULTS };
