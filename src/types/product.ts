export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  sku: string;
  priceOverride: number | null;
  size: string;
  color: string;
  colorHex: string;
  isActive: boolean;
  stock: number;
}

export interface Product {
  id: number;
  categoryId: number;
  category?: Category;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  comparePrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  skuPrefix: string;
  metaTitle: string;
  metaDescription: string;
  images: ProductImage[];
  variants: ProductVariant[];
  specs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  categoryId?: number;
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  page?: number;
  perPage?: number;
}
