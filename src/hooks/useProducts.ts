import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductFilters, Category } from '../types/product';
import type { PaginatedResponse } from '../types/api';
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getCategories,
  searchProducts,
} from '../services/productService';

interface UseProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  } | null;
}

interface UseProductsReturn extends UseProductsState {
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing a paginated list of products.
 */
export function useProducts(initialFilters?: ProductFilters): UseProductsReturn {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    isLoading: false,
    error: null,
    pagination: null,
  });
  const [currentFilters, setCurrentFilters] = useState<ProductFilters | undefined>(initialFilters);

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    setCurrentFilters(filters);

    try {
      const response: PaginatedResponse<Product> = await getProducts(filters);
      setState({
        products: response.data,
        isLoading: false,
        error: null,
        pagination: response.pagination,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los productos';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchProducts(currentFilters);
  }, [fetchProducts, currentFilters]);

  useEffect(() => {
    fetchProducts(initialFilters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    fetchProducts,
    refetch,
  };
}

// ── Single product hook ─────────────────────────────────────────────

interface UseProductDetailReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for fetching a single product by slug.
 */
export function useProductDetail(slug: string | undefined): UseProductDetailReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getProductBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar el producto');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, isLoading, error };
}

// ── Featured products hook ──────────────────────────────────────────

/**
 * Hook for fetching featured products.
 */
export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getFeaturedProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar productos destacados');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, isLoading, error };
}

// ── Categories hook ─────────────────────────────────────────────────

/**
 * Hook for fetching all categories.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar categorías');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, isLoading, error };
}

// ── Search hook ─────────────────────────────────────────────────────

/**
 * Hook for searching products with debounced query.
 */
export function useProductSearch(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    searchProducts(query)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error en la búsqueda');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return { results, isLoading, error };
}
