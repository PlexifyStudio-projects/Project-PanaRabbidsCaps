import { OrderStatus } from '../types/order';

// ── Shipping & Pricing ──────────────────────────────────────────────
export const FREE_SHIPPING_THRESHOLD = 200_000; // COP
export const SHIPPING_COST = 12_000; // COP

// ── Contact & Brand ─────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '573151573329';
export const COMPANY_NAME = 'Pana Rabbids';
export const COMPANY_EMAIL = 'info@panarabbids.com';

// ── Cap Sizes ───────────────────────────────────────────────────────
export const SIZES: string[] = [
  '6 7/8',
  '7',
  '7 1/8',
  '7 1/4',
  '7 3/8',
  '7 1/2',
  '7 5/8',
  '7 3/4',
  'Adjustable',
  'Snapback',
  'Strapback',
];

// ── Category Presets ────────────────────────────────────────────────
export const CATEGORY_PRESETS = [
  { name: 'MLB', slug: 'mlb', description: 'Gorras oficiales de la Major League Baseball' },
  { name: 'NFL', slug: 'nfl', description: 'Gorras oficiales de la National Football League' },
  { name: 'NBA', slug: 'nba', description: 'Gorras oficiales de la National Basketball Association' },
  { name: 'Streetwear', slug: 'streetwear', description: 'Gorras de estilo urbano y streetwear' },
  { name: 'Vintage', slug: 'vintage', description: 'Gorras con diseños retro y vintage' },
  { name: 'Exclusivas', slug: 'exclusivas', description: 'Gorras de edición limitada y exclusivas' },
] as const;

// ── Order Status Labels (Spanish) ───────────────────────────────────
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'Pendiente de pago',
  [OrderStatus.CONFIRMED]: 'Confirmado',
  [OrderStatus.PREPARING]: 'En preparación',
  [OrderStatus.SHIPPED]: 'Enviado',
  [OrderStatus.IN_TRANSIT]: 'En tránsito',
  [OrderStatus.DELIVERED]: 'Entregado',
  [OrderStatus.CANCELLED]: 'Cancelado',
  [OrderStatus.RETURNED]: 'Devuelto',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: '#f59e0b',
  [OrderStatus.CONFIRMED]: '#3b82f6',
  [OrderStatus.PREPARING]: '#8b5cf6',
  [OrderStatus.SHIPPED]: '#6366f1',
  [OrderStatus.IN_TRANSIT]: '#0ea5e9',
  [OrderStatus.DELIVERED]: '#22c55e',
  [OrderStatus.CANCELLED]: '#ef4444',
  [OrderStatus.RETURNED]: '#6b7280',
};

// ── Colombian Departments ───────────────────────────────────────────
export const COLOMBIAN_DEPARTMENTS: string[] = [
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés y Providencia',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
];

// ── Colombian Cities by Department (main cities) ────────────────────
export const COLOMBIAN_CITIES: Record<string, string[]> = {
  'Amazonas': ['Leticia'],
  'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro', 'Apartadó', 'Turbo', 'Caucasia'],
  'Arauca': ['Arauca', 'Saravena', 'Tame'],
  'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia'],
  'Bogotá D.C.': ['Bogotá'],
  'Bolívar': ['Cartagena', 'Magangué', 'Turbaco', 'El Carmen de Bolívar'],
  'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa'],
  'Caldas': ['Manizales', 'Villamaría', 'La Dorada', 'Chinchiná'],
  'Caquetá': ['Florencia', 'San Vicente del Caguán'],
  'Casanare': ['Yopal', 'Aguazul', 'Villanueva'],
  'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada'],
  'Cesar': ['Valledupar', 'Aguachica', 'Bosconia'],
  'Chocó': ['Quibdó', 'Istmina'],
  'Córdoba': ['Montería', 'Cereté', 'Lorica', 'Sahagún'],
  'Cundinamarca': ['Soacha', 'Zipaquirá', 'Facatativá', 'Chía', 'Girardot', 'Fusagasugá', 'Mosquera', 'Madrid'],
  'Guainía': ['Inírida'],
  'Guaviare': ['San José del Guaviare'],
  'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata'],
  'La Guajira': ['Riohacha', 'Maicao', 'Uribia'],
  'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación'],
  'Meta': ['Villavicencio', 'Acacías', 'Granada'],
  'Nariño': ['Pasto', 'Tumaco', 'Ipiales'],
  'Norte de Santander': ['Cúcuta', 'Ocaña', 'Pamplona', 'Los Patios', 'Villa del Rosario'],
  'Putumayo': ['Mocoa', 'Puerto Asís'],
  'Quindío': ['Armenia', 'Calarcá', 'La Tebaida', 'Montenegro'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
  'San Andrés y Providencia': ['San Andrés', 'Providencia'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil'],
  'Sucre': ['Sincelejo', 'Corozal', 'San Marcos'],
  'Tolima': ['Ibagué', 'Espinal', 'Melgar', 'Honda'],
  'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Buga', 'Cartago', 'Yumbo', 'Jamundí'],
  'Vaupés': ['Mitú'],
  'Vichada': ['Puerto Carreño'],
};

// ── Payment Methods ─────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { id: 'wompi', name: 'Tarjeta de crédito/débito (Wompi)', icon: 'credit-card' },
  { id: 'nequi', name: 'Nequi', icon: 'smartphone' },
  { id: 'bancolombia', name: 'Bancolombia', icon: 'building' },
  { id: 'efecty', name: 'Efecty', icon: 'banknotes' },
  { id: 'whatsapp', name: 'Acordar por WhatsApp', icon: 'message-circle' },
] as const;
