import type { Product, Category } from '../types/product';

const IMG = {
  // Hero & banners
  heroBanner: 'https://images.pexels.com/photos/171940/pexels-photo-171940.jpeg?cs=srgb&dl=pexels-hikaique-171940.jpg&fm=jpg',
  heroAlt: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXOpJrLKd-kjWkCVYHDfABF0WQM3k2O1x_mA&s',
  categoryBanner: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvPEJiU_a3ZidFCZZ4g2GhiHDx7xOgYrW6Tg&s',

  // Product images - caps
  cap1: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw7l-L2daQVOPJk2jRH0exJ3AfdICXYETGyw&s',
  cap2: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXOpJrLKd-kjWkCVYHDfABF0WQM3k2O1x_mA&s',
  cap3: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQArYAGiFdW4R2oMzS-1xevgKGXnggdb2pPeg&s',
  cap4: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHSgYdobFsa4VA5sZSceW9d-k3PAhFgBsnpw&s',
  cap5: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDC-uL5r-K46JfbluCKORBVYo9kOCfPZRAhg&s',
  cap6: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS58_HtjymYoXtO4oApEF11qi8rqKB2MF7zyw&s',
  cap7: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScFsn_NcRx-72O9QH8wB6EMYBN04VlRl9kqQ&s',
  cap8: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvPEJiU_a3ZidFCZZ4g2GhiHDx7xOgYrW6Tg&s',
  cap9: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPbvt22dtGoGBB8V5gWCCrxq10Hhqz02uIWg&s',
  cap10: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_L4FlYk_hjJw1A54ndC_bVyaUXuy7zzs5aQ&s',
  cap11: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9Xhx_x53-oz1bX6mIBCTcgzShid69Dt7BQA&s',
  cap12: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFzQB6gBI62TSo7ZCp6e2tKrAX-4YQBm2AaA&s',
  cap13: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnZDy2n8TcKPvmwCcxsJx5F0VoEGIEdBNb1w&s',
  cap14: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmXgf2DXPHlWe3WehZoGL2KbdMDaDlP23jlw&s',
  cap15: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZZJmGVswB9ErjyMocCJf0DFTjP_m_uEU3FQ&s',

  // Lifestyle / model shots
  model1: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw7l-L2daQVOPJk2jRH0exJ3AfdICXYETGyw&s',
  model2: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQArYAGiFdW4R2oMzS-1xevgKGXnggdb2pPeg&s',
  model3: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS58_HtjymYoXtO4oApEF11qi8rqKB2MF7zyw&s',
  model4: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPbvt22dtGoGBB8V5gWCCrxq10Hhqz02uIWg&s',

  // Category images
  catMLB: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw7l-L2daQVOPJk2jRH0exJ3AfdICXYETGyw&s',
  catNFL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDC-uL5r-K46JfbluCKORBVYo9kOCfPZRAhg&s',
  catNBA: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHSgYdobFsa4VA5sZSceW9d-k3PAhFgBsnpw&s',
  catStreet: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQArYAGiFdW4R2oMzS-1xevgKGXnggdb2pPeg&s',
  catVintage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnZDy2n8TcKPvmwCcxsJx5F0VoEGIEdBNb1w&s',
  catExclusive: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS58_HtjymYoXtO4oApEF11qi8rqKB2MF7zyw&s',

  // About/brand
  brandStory: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvPEJiU_a3ZidFCZZ4g2GhiHDx7xOgYrW6Tg&s',
  workshop: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_L4FlYk_hjJw1A54ndC_bVyaUXuy7zzs5aQ&s',
};

export const HERO_IMAGES = {
  main: IMG.heroBanner,
  alt: IMG.heroAlt,
  models: [IMG.model1, IMG.model2, IMG.model3, IMG.model4],
  brand: IMG.brandStory,
  workshop: IMG.workshop,
};

export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'MLB',
    slug: 'mlb',
    description: 'Gorras oficiales de la Major League Baseball',
    imageUrl: IMG.catMLB,
    parentId: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 2,
    name: 'NFL',
    slug: 'nfl',
    description: 'Gorras oficiales de la National Football League',
    imageUrl: IMG.catNFL,
    parentId: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 3,
    name: 'NBA',
    slug: 'nba',
    description: 'Gorras oficiales de la National Basketball Association',
    imageUrl: IMG.catNBA,
    parentId: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 4,
    name: 'Streetwear',
    slug: 'streetwear',
    description: 'Estilo urbano sin límites',
    imageUrl: IMG.catStreet,
    parentId: null,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 5,
    name: 'Vintage',
    slug: 'vintage',
    description: 'Clásicos que nunca pasan de moda',
    imageUrl: IMG.catVintage,
    parentId: null,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 6,
    name: 'Exclusivas',
    slug: 'exclusivas',
    description: 'Ediciones limitadas solo en PlexifyCaps',
    imageUrl: IMG.catExclusive,
    parentId: null,
    isActive: true,
    sortOrder: 6,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    categoryId: 1,
    category: CATEGORIES[0],
    name: 'New York Yankees Classic Black',
    slug: 'ny-yankees-classic-black',
    description: 'La gorra más icónica del mundo. New Era 59FIFTY con el logo de los Yankees bordado en blanco sobre negro profundo. Ajuste perfecto, visera plana, tela de la más alta calidad. Un must-have para cualquier colección seria.',
    basePrice: 189000,
    comparePrice: 229000,
    isActive: true,
    isFeatured: true,
    skuPrefix: 'NYY-BLK',
    metaTitle: 'Gorra New York Yankees Negra | PlexifyCaps',
    metaDescription: 'Gorra oficial New York Yankees 59FIFTY negra. Envío gratis en PlexifyCaps.',
    images: [
      { id: 1, productId: 1, imageUrl: IMG.cap1, altText: 'NY Yankees negra frontal', sortOrder: 1, isPrimary: true },
      { id: 2, productId: 1, imageUrl: IMG.cap7, altText: 'NY Yankees negra lateral', sortOrder: 2, isPrimary: false },
      { id: 3, productId: 1, imageUrl: IMG.model1, altText: 'NY Yankees negra modelo', sortOrder: 3, isPrimary: false },
    ],
    variants: [
      { id: 1, productId: 1, name: '7 1/8 - Negro', sku: 'NYY-BLK-718', priceOverride: null, size: '7 1/8', color: 'Negro', colorHex: '#0D0D0D', isActive: true, stock: 8 },
      { id: 2, productId: 1, name: '7 1/4 - Negro', sku: 'NYY-BLK-714', priceOverride: null, size: '7 1/4', color: 'Negro', colorHex: '#0D0D0D', isActive: true, stock: 12 },
      { id: 3, productId: 1, name: '7 3/8 - Negro', sku: 'NYY-BLK-738', priceOverride: null, size: '7 3/8', color: 'Negro', colorHex: '#0D0D0D', isActive: true, stock: 3 },
      { id: 4, productId: 1, name: '7 1/2 - Negro', sku: 'NYY-BLK-712', priceOverride: null, size: '7 1/2', color: 'Negro', colorHex: '#0D0D0D', isActive: true, stock: 15 },
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 2,
    categoryId: 1,
    category: CATEGORIES[0],
    name: 'LA Dodgers Heritage Blue',
    slug: 'la-dodgers-heritage-blue',
    description: 'El azul Dodger que representa toda una cultura. New Era 59FIFTY con bordado frontal premium. La gorra que usaban las leyendas de Los Ángeles. Visera plana, ajuste fitted, calidad superior.',
    basePrice: 195000,
    comparePrice: null,
    isActive: true,
    isFeatured: true,
    skuPrefix: 'LAD-BLU',
    metaTitle: 'Gorra LA Dodgers Azul | PlexifyCaps',
    metaDescription: 'Gorra oficial LA Dodgers 59FIFTY azul. Estilo auténtico de Los Ángeles.',
    images: [
      { id: 4, productId: 2, imageUrl: IMG.cap2, altText: 'LA Dodgers azul frontal', sortOrder: 1, isPrimary: true },
      { id: 5, productId: 2, imageUrl: IMG.cap8, altText: 'LA Dodgers azul lateral', sortOrder: 2, isPrimary: false },
    ],
    variants: [
      { id: 5, productId: 2, name: '7 - Azul', sku: 'LAD-BLU-700', priceOverride: null, size: '7', color: 'Azul', colorHex: '#005A9C', isActive: true, stock: 6 },
      { id: 6, productId: 2, name: '7 1/4 - Azul', sku: 'LAD-BLU-714', priceOverride: null, size: '7 1/4', color: 'Azul', colorHex: '#005A9C', isActive: true, stock: 9 },
      { id: 7, productId: 2, name: '7 3/8 - Azul', sku: 'LAD-BLU-738', priceOverride: null, size: '7 3/8', color: 'Azul', colorHex: '#005A9C', isActive: true, stock: 2 },
    ],
    createdAt: '2026-01-16T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 3,
    categoryId: 4,
    category: CATEGORIES[3],
    name: 'Urban Phantom Snapback',
    slug: 'urban-phantom-snapback',
    description: 'Estilo urbano puro. Gorra snapback con diseño minimalista, bordado sutil y acabado premium. Para los que dominan la calle sin decir una palabra. Ajuste snapback universal.',
    basePrice: 145000,
    comparePrice: 175000,
    isActive: true,
    isFeatured: true,
    skuPrefix: 'URB-PH',
    metaTitle: 'Urban Phantom Snapback | PlexifyCaps',
    metaDescription: 'Gorra snapback urbana premium. Diseño minimalista streetwear.',
    images: [
      { id: 6, productId: 3, imageUrl: IMG.cap3, altText: 'Urban Phantom frontal', sortOrder: 1, isPrimary: true },
      { id: 7, productId: 3, imageUrl: IMG.cap9, altText: 'Urban Phantom lateral', sortOrder: 2, isPrimary: false },
      { id: 8, productId: 3, imageUrl: IMG.model2, altText: 'Urban Phantom modelo', sortOrder: 3, isPrimary: false },
    ],
    variants: [
      { id: 8, productId: 3, name: 'Snapback - Negro', sku: 'URB-PH-SNP-BLK', priceOverride: null, size: 'Snapback', color: 'Negro', colorHex: '#1A1A1A', isActive: true, stock: 20 },
      { id: 9, productId: 3, name: 'Snapback - Gris', sku: 'URB-PH-SNP-GRY', priceOverride: null, size: 'Snapback', color: 'Gris', colorHex: '#6B6B6B', isActive: true, stock: 14 },
    ],
    createdAt: '2026-01-17T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 4,
    categoryId: 3,
    category: CATEGORIES[2],
    name: 'Chicago Bulls Dynasty Red',
    slug: 'chicago-bulls-dynasty-red',
    description: 'El rojo que inspiró una dinastía. La gorra de los Chicago Bulls en el rojo clásico con el logo del toro bordado. New Era 9FIFTY ajustable. Representa la era dorada del basketball.',
    basePrice: 175000,
    comparePrice: null,
    isActive: true,
    isFeatured: true,
    skuPrefix: 'CHI-RED',
    metaTitle: 'Gorra Chicago Bulls Roja | PlexifyCaps',
    metaDescription: 'Gorra oficial Chicago Bulls roja. El legado de la dinastía.',
    images: [
      { id: 9, productId: 4, imageUrl: IMG.cap4, altText: 'Chicago Bulls roja frontal', sortOrder: 1, isPrimary: true },
      { id: 10, productId: 4, imageUrl: IMG.cap10, altText: 'Chicago Bulls roja lateral', sortOrder: 2, isPrimary: false },
    ],
    variants: [
      { id: 10, productId: 4, name: 'Adjustable - Rojo', sku: 'CHI-RED-ADJ', priceOverride: null, size: 'Adjustable', color: 'Rojo', colorHex: '#CE1141', isActive: true, stock: 7 },
      { id: 11, productId: 4, name: 'Adjustable - Negro', sku: 'CHI-BLK-ADJ', priceOverride: 185000, size: 'Adjustable', color: 'Negro', colorHex: '#0D0D0D', isActive: true, stock: 5 },
    ],
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 5,
    categoryId: 2,
    category: CATEGORIES[1],
    name: 'Raiders Legacy Silver & Black',
    slug: 'raiders-legacy-silver-black',
    description: 'Plata y negro. Los colores más intimidantes del fútbol americano. Gorra New Era 9FORTY de los Raiders con el shield bordado. Estilo agresivo para los que no se conforman.',
    basePrice: 165000,
    comparePrice: 199000,
    isActive: true,
    isFeatured: false,
    skuPrefix: 'RAI-SBK',
    metaTitle: 'Gorra Raiders Plata y Negro | PlexifyCaps',
    metaDescription: 'Gorra oficial Las Vegas Raiders. Silver & Black.',
    images: [
      { id: 11, productId: 5, imageUrl: IMG.cap5, altText: 'Raiders plata frontal', sortOrder: 1, isPrimary: true },
      { id: 12, productId: 5, imageUrl: IMG.cap11, altText: 'Raiders plata lateral', sortOrder: 2, isPrimary: false },
    ],
    variants: [
      { id: 12, productId: 5, name: 'Strapback - Negro/Plata', sku: 'RAI-SBK-STR', priceOverride: null, size: 'Strapback', color: 'Negro', colorHex: '#0D0D0D', isActive: true, stock: 11 },
    ],
    createdAt: '2026-01-19T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 6,
    categoryId: 6,
    category: CATEGORIES[5],
    name: 'Plexify Gold Edition Limited',
    slug: 'plexify-gold-edition-limited',
    description: 'EDICIÓN LIMITADA. Solo 50 unidades en el mundo. La gorra insignia de PlexifyCaps con bordado dorado premium, tela importada y acabado de lujo. Certificado de autenticidad incluido. Esta no es solo una gorra, es una declaración.',
    basePrice: 350000,
    comparePrice: null,
    isActive: true,
    isFeatured: true,
    skuPrefix: 'PAN-GLD',
    metaTitle: 'Plexify Gold Edition Limited | PlexifyCaps',
    metaDescription: 'Edición limitada PlexifyCaps Gold. Solo 50 unidades.',
    images: [
      { id: 13, productId: 6, imageUrl: IMG.cap6, altText: 'Plexify Gold frontal', sortOrder: 1, isPrimary: true },
      { id: 14, productId: 6, imageUrl: IMG.cap12, altText: 'Plexify Gold detalle', sortOrder: 2, isPrimary: false },
      { id: 15, productId: 6, imageUrl: IMG.model3, altText: 'Plexify Gold modelo', sortOrder: 3, isPrimary: false },
    ],
    variants: [
      { id: 13, productId: 6, name: '7 1/4 - Dorado/Negro', sku: 'PAN-GLD-714', priceOverride: null, size: '7 1/4', color: 'Dorado', colorHex: '#C4A35A', isActive: true, stock: 3 },
      { id: 14, productId: 6, name: '7 3/8 - Dorado/Negro', sku: 'PAN-GLD-738', priceOverride: null, size: '7 3/8', color: 'Dorado', colorHex: '#C4A35A', isActive: true, stock: 2 },
    ],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-07T10:00:00Z',
  },
  {
    id: 7,
    categoryId: 5,
    category: CATEGORIES[4],
    name: 'Retro Boston Celtics Fitted',
    slug: 'retro-boston-celtics-fitted',
    description: 'El verde Celtics de la vieja escuela. Gorra fitted con el trébol retro bordado. Tela premium vintage wash para ese look desgastado auténtico. Para los que respetan la historia.',
    basePrice: 159000,
    comparePrice: null,
    isActive: true,
    isFeatured: false,
    skuPrefix: 'BOS-GRN',
    metaTitle: 'Gorra Retro Boston Celtics | PlexifyCaps',
    metaDescription: 'Gorra vintage Boston Celtics fitted. Estilo retro premium.',
    images: [
      { id: 16, productId: 7, imageUrl: IMG.cap13, altText: 'Boston Celtics retro frontal', sortOrder: 1, isPrimary: true },
    ],
    variants: [
      { id: 15, productId: 7, name: '7 - Verde', sku: 'BOS-GRN-700', priceOverride: null, size: '7', color: 'Verde', colorHex: '#007A33', isActive: true, stock: 4 },
      { id: 16, productId: 7, name: '7 1/8 - Verde', sku: 'BOS-GRN-718', priceOverride: null, size: '7 1/8', color: 'Verde', colorHex: '#007A33', isActive: true, stock: 6 },
      { id: 17, productId: 7, name: '7 1/4 - Verde', sku: 'BOS-GRN-714', priceOverride: null, size: '7 1/4', color: 'Verde', colorHex: '#007A33', isActive: true, stock: 0 },
    ],
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 8,
    categoryId: 4,
    category: CATEGORIES[3],
    name: 'Midnight Stealth Trucker',
    slug: 'midnight-stealth-trucker',
    description: 'Sigiloso. Oscuro. Implacable. Trucker cap con malla transpirable, bordado tonal negro sobre negro. Para los que prefieren moverse en las sombras. Ajuste snapback con malla premium.',
    basePrice: 125000,
    comparePrice: 155000,
    isActive: true,
    isFeatured: false,
    skuPrefix: 'MID-STL',
    metaTitle: 'Midnight Stealth Trucker | PlexifyCaps',
    metaDescription: 'Gorra trucker negra total. Estilo stealth streetwear.',
    images: [
      { id: 17, productId: 8, imageUrl: IMG.cap14, altText: 'Midnight Stealth frontal', sortOrder: 1, isPrimary: true },
      { id: 18, productId: 8, imageUrl: IMG.cap15, altText: 'Midnight Stealth lateral', sortOrder: 2, isPrimary: false },
    ],
    variants: [
      { id: 18, productId: 8, name: 'Snapback - Negro', sku: 'MID-STL-SNP', priceOverride: null, size: 'Snapback', color: 'Negro', colorHex: '#0D0D0D', isActive: true, stock: 25 },
    ],
    createdAt: '2026-01-21T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 9,
    categoryId: 1,
    category: CATEGORIES[0],
    name: 'Boston Red Sox Navy Premium',
    slug: 'boston-red-sox-navy-premium',
    description: 'El azul marino de los Red Sox con la B icónica en rojo. New Era 59FIFTY con bordado de alta densidad. Una pieza de la historia del baseball americano en tu cabeza.',
    basePrice: 185000,
    comparePrice: null,
    isActive: true,
    isFeatured: false,
    skuPrefix: 'BRS-NVY',
    metaTitle: 'Gorra Boston Red Sox Navy | PlexifyCaps',
    metaDescription: 'Gorra oficial Boston Red Sox navy premium.',
    images: [
      { id: 19, productId: 9, imageUrl: IMG.cap7, altText: 'Red Sox navy frontal', sortOrder: 1, isPrimary: true },
    ],
    variants: [
      { id: 19, productId: 9, name: '7 1/8 - Navy', sku: 'BRS-NVY-718', priceOverride: null, size: '7 1/8', color: 'Navy', colorHex: '#0C2340', isActive: true, stock: 10 },
      { id: 20, productId: 9, name: '7 1/4 - Navy', sku: 'BRS-NVY-714', priceOverride: null, size: '7 1/4', color: 'Navy', colorHex: '#0C2340', isActive: true, stock: 8 },
    ],
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 10,
    categoryId: 3,
    category: CATEGORIES[2],
    name: 'Lakers Showtime Purple',
    slug: 'lakers-showtime-purple',
    description: 'Showtime baby. El púrpura de los Lakers con el logo clásico. Para los que viven por el espectáculo y el estilo. Ajuste snapback con visera plana.',
    basePrice: 175000,
    comparePrice: 210000,
    isActive: true,
    isFeatured: false,
    skuPrefix: 'LAL-PRP',
    metaTitle: 'Gorra Lakers Showtime Purple | PlexifyCaps',
    metaDescription: 'Gorra oficial LA Lakers púrpura. Showtime edition.',
    images: [
      { id: 20, productId: 10, imageUrl: IMG.cap8, altText: 'Lakers purple frontal', sortOrder: 1, isPrimary: true },
    ],
    variants: [
      { id: 21, productId: 10, name: 'Snapback - Púrpura', sku: 'LAL-PRP-SNP', priceOverride: null, size: 'Snapback', color: 'Púrpura', colorHex: '#552583', isActive: true, stock: 6 },
      { id: 22, productId: 10, name: 'Snapback - Amarillo', sku: 'LAL-YLW-SNP', priceOverride: 185000, size: 'Snapback', color: 'Amarillo', colorHex: '#FDB927', isActive: true, stock: 4 },
    ],
    createdAt: '2026-01-23T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 11,
    categoryId: 2,
    category: CATEGORIES[1],
    name: 'Cowboys Star Navy Fitted',
    slug: 'cowboys-star-navy-fitted',
    description: 'La estrella más famosa del deporte. Dallas Cowboys en navy profundo con la estrella plateada. Calidad New Era 59FIFTY. America\'s Team en tu cabeza.',
    basePrice: 179000,
    comparePrice: null,
    isActive: true,
    isFeatured: false,
    skuPrefix: 'DAL-NVY',
    metaTitle: 'Gorra Dallas Cowboys Navy | PlexifyCaps',
    metaDescription: 'Gorra oficial Dallas Cowboys navy fitted.',
    images: [
      { id: 21, productId: 11, imageUrl: IMG.cap9, altText: 'Cowboys navy frontal', sortOrder: 1, isPrimary: true },
    ],
    variants: [
      { id: 23, productId: 11, name: '7 1/4 - Navy', sku: 'DAL-NVY-714', priceOverride: null, size: '7 1/4', color: 'Navy', colorHex: '#041E42', isActive: true, stock: 9 },
      { id: 24, productId: 11, name: '7 3/8 - Navy', sku: 'DAL-NVY-738', priceOverride: null, size: '7 3/8', color: 'Navy', colorHex: '#041E42', isActive: true, stock: 7 },
    ],
    createdAt: '2026-01-24T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 12,
    categoryId: 6,
    category: CATEGORIES[5],
    name: 'PlexifyCaps OG Snapback',
    slug: 'plexifycaps-og-snapback',
    description: 'El OG. La primera gorra de PlexifyCaps. Logo bordado en dorado sobre negro mate. Snapback premium con broche metálico. Si no tienes esta, no eres del club.',
    basePrice: 159000,
    comparePrice: null,
    isActive: true,
    isFeatured: true,
    skuPrefix: 'PAN-OG',
    metaTitle: 'PlexifyCaps OG Snapback | PlexifyCaps',
    metaDescription: 'La gorra original de PlexifyCaps. OG Snapback negra y dorada.',
    images: [
      { id: 22, productId: 12, imageUrl: IMG.cap10, altText: 'PlexifyCaps OG frontal', sortOrder: 1, isPrimary: true },
      { id: 23, productId: 12, imageUrl: IMG.model4, altText: 'PlexifyCaps OG modelo', sortOrder: 2, isPrimary: false },
    ],
    variants: [
      { id: 25, productId: 12, name: 'Snapback - Negro/Dorado', sku: 'PAN-OG-SNP', priceOverride: null, size: 'Snapback', color: 'Negro', colorHex: '#0D0D0D', isActive: true, stock: 18 },
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-07T10:00:00Z',
  },
  {
    id: 13,
    categoryId: 5,
    category: CATEGORIES[4],
    name: 'Vintage NY Mets Washed',
    slug: 'vintage-ny-mets-washed',
    description: 'El vintage perfecto. NY Mets con lavado especial que le da ese look retro auténtico. Cada gorra envejece diferente. No hay dos iguales. Ajuste strapback con hebilla metálica.',
    basePrice: 149000,
    comparePrice: 179000,
    isActive: true,
    isFeatured: false,
    skuPrefix: 'NYM-WSH',
    metaTitle: 'Gorra Vintage NY Mets Washed | PlexifyCaps',
    metaDescription: 'Gorra vintage NY Mets con lavado especial.',
    images: [
      { id: 24, productId: 13, imageUrl: IMG.cap11, altText: 'NY Mets washed frontal', sortOrder: 1, isPrimary: true },
    ],
    variants: [
      { id: 26, productId: 13, name: 'Strapback - Naranja Washed', sku: 'NYM-WSH-STR', priceOverride: null, size: 'Strapback', color: 'Naranja', colorHex: '#FF5910', isActive: true, stock: 5 },
    ],
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 14,
    categoryId: 4,
    category: CATEGORIES[3],
    name: 'Shadow Chrome Dad Hat',
    slug: 'shadow-chrome-dad-hat',
    description: 'El dad hat elevado. Estructura suave, visera curva, bordado cromado reflectivo. Simple, limpio, devastador. Para los días que quieres estilo sin esfuerzo.',
    basePrice: 115000,
    comparePrice: null,
    isActive: true,
    isFeatured: false,
    skuPrefix: 'SHD-CHR',
    metaTitle: 'Shadow Chrome Dad Hat | PlexifyCaps',
    metaDescription: 'Dad hat con bordado cromado. Estilo sin esfuerzo.',
    images: [
      { id: 25, productId: 14, imageUrl: IMG.cap15, altText: 'Shadow Chrome frontal', sortOrder: 1, isPrimary: true },
    ],
    variants: [
      { id: 27, productId: 14, name: 'Strapback - Negro', sku: 'SHD-CHR-STR-BLK', priceOverride: null, size: 'Strapback', color: 'Negro', colorHex: '#1A1A1A', isActive: true, stock: 30 },
      { id: 28, productId: 14, name: 'Strapback - Blanco', sku: 'SHD-CHR-STR-WHT', priceOverride: null, size: 'Strapback', color: 'Blanco', colorHex: '#F5F5F5', isActive: true, stock: 22 },
      { id: 29, productId: 14, name: 'Strapback - Verde Oliva', sku: 'SHD-CHR-STR-OLV', priceOverride: 125000, size: 'Strapback', color: 'Verde Oliva', colorHex: '#556B2F', isActive: true, stock: 8 },
    ],
    createdAt: '2026-01-26T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 15,
    categoryId: 2,
    category: CATEGORIES[1],
    name: 'Chiefs Kingdom Red Snapback',
    slug: 'chiefs-kingdom-red-snapback',
    description: 'El reino de los Chiefs. Rojo intenso con el arrowhead bordado. La gorra del equipo campeón. Snapback premium con broche dorado. Corona tu reino.',
    basePrice: 169000,
    comparePrice: null,
    isActive: true,
    isFeatured: false,
    skuPrefix: 'KC-RED',
    metaTitle: 'Gorra Chiefs Kingdom Red | PlexifyCaps',
    metaDescription: 'Gorra Kansas City Chiefs roja snapback.',
    images: [
      { id: 26, productId: 15, imageUrl: IMG.cap12, altText: 'Chiefs red frontal', sortOrder: 1, isPrimary: true },
    ],
    variants: [
      { id: 30, productId: 15, name: 'Snapback - Rojo', sku: 'KC-RED-SNP', priceOverride: null, size: 'Snapback', color: 'Rojo', colorHex: '#E31837', isActive: true, stock: 13 },
    ],
    createdAt: '2026-01-27T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 16,
    categoryId: 6,
    category: CATEGORIES[5],
    name: 'PlexifyCaps Camo Limited',
    slug: 'plexifycaps-camo-limited',
    description: 'EDICIÓN LIMITADA. 100 unidades. Camuflaje digital con detalles dorados. La fusión perfecta entre street y militar. Logo PlexifyCaps bordado en 3D. No la vas a encontrar en ningún otro lado.',
    basePrice: 275000,
    comparePrice: 320000,
    isActive: true,
    isFeatured: true,
    skuPrefix: 'PAN-CMO',
    metaTitle: 'PlexifyCaps Camo Limited | PlexifyCaps',
    metaDescription: 'Edición limitada camuflaje digital PlexifyCaps. Solo 100 unidades.',
    images: [
      { id: 27, productId: 16, imageUrl: IMG.cap14, altText: 'PlexifyCaps Camo frontal', sortOrder: 1, isPrimary: true },
      { id: 28, productId: 16, imageUrl: IMG.cap13, altText: 'PlexifyCaps Camo detalle', sortOrder: 2, isPrimary: false },
    ],
    variants: [
      { id: 31, productId: 16, name: '7 1/4 - Camo', sku: 'PAN-CMO-714', priceOverride: null, size: '7 1/4', color: 'Camo', colorHex: '#4A5D23', isActive: true, stock: 1 },
      { id: 32, productId: 16, name: '7 3/8 - Camo', sku: 'PAN-CMO-738', priceOverride: null, size: '7 3/8', color: 'Camo', colorHex: '#4A5D23', isActive: true, stock: 3 },
    ],
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-07T10:00:00Z',
  },
];

// Helper functions
export const getFeaturedProducts = (): Product[] =>
  PRODUCTS.filter(p => p.isFeatured && p.isActive);

export const getProductsByCategory = (categorySlug: string): Product[] =>
  PRODUCTS.filter(p => p.category?.slug === categorySlug && p.isActive);

export const getProductBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find(p => p.slug === slug);

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase();
  return PRODUCTS.filter(p =>
    p.isActive && (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    )
  );
};

export const getRelatedProducts = (productId: number, limit = 4): Product[] => {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return [];
  return PRODUCTS
    .filter(p => p.id !== productId && p.categoryId === product.categoryId && p.isActive)
    .slice(0, limit);
};

export const getAllActiveProducts = (): Product[] =>
  PRODUCTS.filter(p => p.isActive);

export default PRODUCTS;
