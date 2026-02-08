// ── Public Routes ───────────────────────────────────────────────────
export const PUBLIC_ROUTES = {
  HOME: '/',
  CATALOG: '/catalogo',
  CATALOG_CATEGORY: '/catalogo/:categorySlug',
  PRODUCT_DETAIL: '/producto/:slug',
  CART: '/carrito',
  CHECKOUT: '/checkout',
  CONFIRMATION: '/confirmacion/:referenceCode',
  TRACKING: '/rastreo',
  TRACKING_DETAIL: '/rastreo/:referenceCode',
  ABOUT: '/nosotros',
  CONTACT: '/contacto',
  REGISTER: '/registro',
  CUSTOMER_LOGIN: '/login',
  PROFILE: '/mi-cuenta',
  PROFILE_ORDERS: '/mi-cuenta/pedidos',
  PROFILE_WISHLIST: '/mi-cuenta/favoritos',
  SIZE_GUIDE: '/guia-de-tallas',
  SHIPPING: '/envios-y-devoluciones',
  FAQ: '/preguntas-frecuentes',
  TERMS: '/terminos-y-condiciones',
  PRIVACY: '/politica-de-privacidad',
} as const;

// ── Admin Routes ────────────────────────────────────────────────────
export const ADMIN_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/admin',
  PRODUCTS: '/admin/productos',
  PRODUCT_CREATE: '/admin/productos/nuevo',
  PRODUCT_EDIT: '/admin/productos/:id/editar',
  ORDERS: '/admin/pedidos',
  ORDER_DETAIL: '/admin/pedidos/:id',
  STOCK: '/admin/inventario',
  SETTINGS: '/admin/configuracion',
  CUSTOMERS: '/admin/clientes',
  CUSTOMER_DETAIL: '/admin/clientes/:id',
} as const;

export type PublicRoutePath = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES];
export type AdminRoutePath = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];

// ── Route Helpers ───────────────────────────────────────────────────

export function productDetailPath(slug: string): string {
  return `/producto/${slug}`;
}

export function catalogCategoryPath(categorySlug: string): string {
  return `/catalogo/${categorySlug}`;
}

export function confirmationPath(referenceCode: string): string {
  return `/confirmacion/${referenceCode}`;
}

export function trackingDetailPath(referenceCode: string): string {
  return `/rastreo/${referenceCode}`;
}

export function adminProductEditPath(id: number): string {
  return `/admin/productos/${id}/editar`;
}

export function adminOrderDetailPath(id: number): string {
  return `/admin/pedidos/${id}`;
}

export function adminCustomerDetailPath(id: string): string {
  return `/admin/clientes/${id}`;
}

// ── Category definitions for navigation ─────────────────────
export const CATEGORIES = [
  { slug: 'mlb', label: 'MLB', description: 'Gorras de las Grandes Ligas' },
  { slug: 'nfl', label: 'NFL', description: 'Gorras de la Liga Nacional de Futbol Americano' },
  { slug: 'nba', label: 'NBA', description: 'Gorras de la Asociacion Nacional de Baloncesto' },
  { slug: 'streetwear', label: 'Streetwear', description: 'Gorras estilo urbano' },
  { slug: 'vintage', label: 'Vintage', description: 'Gorras estilo retro y clasicas' },
  { slug: 'exclusivas', label: 'Exclusivas', description: 'Ediciones limitadas y exclusivas' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
