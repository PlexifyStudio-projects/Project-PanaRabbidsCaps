// ============================================================
// Pana Rabbids - Product Data Service
// Central data layer: localStorage overrides + mock defaults
// Admin changes images/data → persists → public pages see it
// ============================================================

import {
  PRODUCTS as MOCK_PRODUCTS,
  CATEGORIES as MOCK_CATEGORIES,
  HERO_IMAGES as MOCK_HERO_IMAGES,
} from './mockProducts';
import type { Product, Category, ProductImage, ProductVariant } from '../types/product';

// ── Storage keys ────────────────────────────────────────────
const PRODUCTS_KEY = 'pana_products';
const CATEGORIES_KEY = 'pana_categories';

// ── Types for overrides ─────────────────────────────────────
interface ProductOverride {
  images?: ProductImage[];
  name?: string;
  slug?: string;
  categoryId?: number;
  basePrice?: number;
  comparePrice?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  variants?: ProductVariant[];
  specs?: Record<string, string>;
}

interface CategoryOverride {
  imageUrl?: string;
  name?: string;
  description?: string;
}

type ProductOverrides = Record<number, ProductOverride>;
type CategoryOverrides = Record<number, CategoryOverride>;

// ── Load / Save helpers ─────────────────────────────────────

function loadProductOverrides(): ProductOverrides {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveProductOverrides(overrides: ProductOverrides) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(overrides));
}

function loadCategoryOverrides(): CategoryOverrides {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveCategoryOverrides(overrides: CategoryOverrides) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(overrides));
}

// ── Merge helpers ───────────────────────────────────────────

function mergeProduct(product: Product, override?: ProductOverride): Product {
  if (!override) return product;
  return {
    ...product,
    ...(override.name !== undefined && { name: override.name }),
    ...(override.slug !== undefined && { slug: override.slug }),
    ...(override.categoryId !== undefined && { categoryId: override.categoryId }),
    ...(override.basePrice !== undefined && { basePrice: override.basePrice }),
    ...(override.comparePrice !== undefined && { comparePrice: override.comparePrice }),
    ...(override.isActive !== undefined && { isActive: override.isActive }),
    ...(override.isFeatured !== undefined && { isFeatured: override.isFeatured }),
    ...(override.description !== undefined && { description: override.description }),
    ...(override.metaTitle !== undefined && { metaTitle: override.metaTitle }),
    ...(override.metaDescription !== undefined && { metaDescription: override.metaDescription }),
    ...(override.variants !== undefined && { variants: override.variants }),
    ...(override.images !== undefined && { images: override.images }),
    ...(override.specs !== undefined && { specs: override.specs }),
  };
}

function mergeCategory(cat: Category, override?: CategoryOverride): Category {
  if (!override) return cat;
  return {
    ...cat,
    ...(override.imageUrl !== undefined && { imageUrl: override.imageUrl }),
    ...(override.name !== undefined && { name: override.name }),
    ...(override.description !== undefined && { description: override.description }),
  };
}

// ── Public read API ─────────────────────────────────────────

/** Get all categories with overrides applied */
export function getCategories(): Category[] {
  const overrides = loadCategoryOverrides();
  return MOCK_CATEGORIES.map(c => mergeCategory(c, overrides[c.id]));
}

/** Get all products with overrides applied */
export function getProducts(): Product[] {
  const overrides = loadProductOverrides();
  const categories = getCategories();
  return MOCK_PRODUCTS.map(p => {
    const merged = mergeProduct(p, overrides[p.id]);
    const cat = categories.find(c => c.id === merged.categoryId);
    return { ...merged, category: cat || merged.category };
  });
}

/** Get hero images */
export function getHeroImages() {
  return MOCK_HERO_IMAGES;
}

/** Get featured products */
export function getFeaturedProducts(): Product[] {
  return getProducts().filter(p => p.isFeatured && p.isActive);
}

/** Get products by category slug */
export function getProductsByCategory(categorySlug: string): Product[] {
  return getProducts().filter(p => p.category?.slug === categorySlug && p.isActive);
}

/** Find single product by slug */
export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find(p => p.slug === slug);
}

/** Search products */
export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return getProducts().filter(p =>
    p.isActive && (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    )
  );
}

/** Get related products from same category */
export function getRelatedProducts(productId: number, limit = 4): Product[] {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  return products
    .filter(p => p.id !== productId && p.categoryId === product.categoryId && p.isActive)
    .slice(0, limit);
}

/** Get all active products */
export function getAllActiveProducts(): Product[] {
  return getProducts().filter(p => p.isActive);
}

// ── Admin mutation functions ────────────────────────────────

/** Update a product's primary image URL */
export function updateProductImage(productId: number, imageUrl: string) {
  const overrides = loadProductOverrides();
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const currentImages = overrides[productId]?.images
    ? [...overrides[productId].images!]
    : product.images.map(img => ({ ...img }));

  const primaryIndex = currentImages.findIndex(img => img.isPrimary);
  if (primaryIndex >= 0) {
    currentImages[primaryIndex] = { ...currentImages[primaryIndex], imageUrl };
  } else if (currentImages.length > 0) {
    currentImages[0] = { ...currentImages[0], imageUrl, isPrimary: true };
  } else {
    currentImages.push({
      id: Date.now(),
      productId,
      imageUrl,
      altText: product.name,
      sortOrder: 1,
      isPrimary: true,
    });
  }

  overrides[productId] = { ...overrides[productId], images: currentImages };
  saveProductOverrides(overrides);
}

/** Update a specific image in a product's gallery */
export function updateProductGalleryImage(productId: number, imageIndex: number, imageUrl: string) {
  const overrides = loadProductOverrides();
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const currentImages = overrides[productId]?.images
    ? [...overrides[productId].images!]
    : product.images.map(img => ({ ...img }));

  if (imageIndex >= 0 && imageIndex < currentImages.length) {
    currentImages[imageIndex] = { ...currentImages[imageIndex], imageUrl };
  }

  overrides[productId] = { ...overrides[productId], images: currentImages };
  saveProductOverrides(overrides);
}

/** Add a new image to a product's gallery */
export function addProductImage(productId: number, imageUrl: string) {
  const overrides = loadProductOverrides();
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const currentImages = overrides[productId]?.images
    ? [...overrides[productId].images!]
    : product.images.map(img => ({ ...img }));

  const maxSort = currentImages.reduce((max, img) => Math.max(max, img.sortOrder), 0);
  const isPrimary = currentImages.length === 0;

  currentImages.push({
    id: Date.now(),
    productId,
    imageUrl,
    altText: product.name,
    sortOrder: maxSort + 1,
    isPrimary,
  });

  overrides[productId] = { ...overrides[productId], images: currentImages };
  saveProductOverrides(overrides);
}

/** Remove an image from a product's gallery */
export function removeProductImage(productId: number, imageIndex: number) {
  const overrides = loadProductOverrides();
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const currentImages = overrides[productId]?.images
    ? [...overrides[productId].images!]
    : product.images.map(img => ({ ...img }));

  if (imageIndex >= 0 && imageIndex < currentImages.length) {
    const removed = currentImages.splice(imageIndex, 1);
    if (removed[0]?.isPrimary && currentImages.length > 0) {
      currentImages[0] = { ...currentImages[0], isPrimary: true };
    }
  }

  overrides[productId] = { ...overrides[productId], images: currentImages };
  saveProductOverrides(overrides);
}

/** Set which image is primary */
export function setPrimaryImage(productId: number, imageIndex: number) {
  const overrides = loadProductOverrides();
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const currentImages = (overrides[productId]?.images
    ? [...overrides[productId].images!]
    : product.images.map(img => ({ ...img }))
  ).map((img, i) => ({
    ...img,
    isPrimary: i === imageIndex,
  }));

  overrides[productId] = { ...overrides[productId], images: currentImages };
  saveProductOverrides(overrides);
}

/** Toggle product active state */
export function toggleProductActive(productId: number) {
  const overrides = loadProductOverrides();
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const currentActive = overrides[productId]?.isActive ?? product.isActive;
  overrides[productId] = { ...overrides[productId], isActive: !currentActive };
  saveProductOverrides(overrides);
}

/** Update category image */
export function updateCategoryImage(categoryId: number, imageUrl: string) {
  const overrides = loadCategoryOverrides();
  overrides[categoryId] = { ...overrides[categoryId], imageUrl };
  saveCategoryOverrides(overrides);
}

/** Update a product's full data (name, price, description, variants, etc.) */
export function updateProduct(productId: number, data: Partial<Omit<ProductOverride, 'images'>>) {
  const overrides = loadProductOverrides();
  overrides[productId] = { ...overrides[productId], ...data };
  saveProductOverrides(overrides);
}

/** Reset all product overrides */
export function resetAllProducts() {
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(CATEGORIES_KEY);
}

/** Reset a single product */
export function resetProduct(productId: number) {
  const overrides = loadProductOverrides();
  delete overrides[productId];
  saveProductOverrides(overrides);
}

// Re-exports for convenience
export const HERO_IMAGES = MOCK_HERO_IMAGES;
