import api from './api';
import type { Product, Category, ProductFilters } from '../types/product';
import type { ApiResponse, PaginatedResponse } from '../types/api';

// ── Public endpoints ────────────────────────────────────────────────

/**
 * Get a paginated list of products with optional filters.
 */
export async function getProducts(
  filters?: ProductFilters
): Promise<PaginatedResponse<Product>> {
  const response = await api.get<PaginatedResponse<Product>>('/products', {
    params: filters,
  });
  return response.data;
}

/**
 * Get a single product by its URL slug.
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await api.get<ApiResponse<Product>>(`/products/slug/${slug}`);
  return response.data.data;
}

/**
 * Get a single product by its ID.
 */
export async function getProductById(id: number): Promise<Product> {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data.data;
}

/**
 * Get featured products for the homepage.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const response = await api.get<ApiResponse<Product[]>>('/products/featured');
  return response.data.data;
}

/**
 * Get all active categories.
 */
export async function getCategories(): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>('/categories');
  return response.data.data;
}

/**
 * Search products by query text.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const response = await api.get<ApiResponse<Product[]>>('/products/search', {
    params: { q: query },
  });
  return response.data.data;
}

// ── Admin endpoints ─────────────────────────────────────────────────

/**
 * Create a new product (admin).
 */
export async function createProduct(
  data: Omit<Product, 'id' | 'slug' | 'images' | 'variants' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  const response = await api.post<ApiResponse<Product>>('/admin/products', data);
  return response.data.data;
}

/**
 * Update an existing product (admin).
 */
export async function updateProduct(
  id: number,
  data: Partial<Product>
): Promise<Product> {
  const response = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
  return response.data.data;
}

/**
 * Delete a product (admin). Soft delete on backend.
 */
export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/admin/products/${id}`);
}

/**
 * Upload images for a product (admin).
 */
export async function uploadProductImages(
  productId: number,
  files: File[]
): Promise<{ imageUrl: string; id: number }[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post<ApiResponse<{ imageUrl: string; id: number }[]>>(
    `/admin/products/${productId}/images`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data.data;
}

/**
 * Delete a product image (admin).
 */
export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<void> {
  await api.delete(`/admin/products/${productId}/images/${imageId}`);
}
