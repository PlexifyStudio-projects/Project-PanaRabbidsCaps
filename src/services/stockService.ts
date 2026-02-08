import api from './api';
import type { ProductVariant } from '../types/product';
import type { ApiResponse } from '../types/api';

export interface StockUpdate {
  variantId: number;
  quantityChange: number;
  reason: string;
}

export interface StockEntry {
  id: number;
  variantId: number;
  variantName: string;
  productName: string;
  sku: string;
  quantityAvailable: number;
  quantityReserved: number;
  lastUpdated: string;
}

// ── Admin endpoints ─────────────────────────────────────────────────

/**
 * Get all stock entries for the inventory view (admin).
 */
export async function getStockList(): Promise<StockEntry[]> {
  const response = await api.get<ApiResponse<StockEntry[]>>('/admin/stock');
  return response.data.data;
}

/**
 * Update stock quantity for a specific variant (admin).
 */
export async function updateStock(update: StockUpdate): Promise<ProductVariant> {
  const response = await api.patch<ApiResponse<ProductVariant>>(
    `/admin/stock/${update.variantId}`,
    {
      quantityChange: update.quantityChange,
      reason: update.reason,
    }
  );
  return response.data.data;
}

/**
 * Bulk update stock for multiple variants (admin).
 */
export async function bulkUpdateStock(updates: StockUpdate[]): Promise<void> {
  await api.post('/admin/stock/bulk', { updates });
}

/**
 * Get stock history / audit log for a variant (admin).
 */
export async function getStockHistory(variantId: number): Promise<
  {
    id: number;
    variantId: number;
    quantityChange: number;
    reason: string;
    createdAt: string;
  }[]
> {
  const response = await api.get<
    ApiResponse<
      {
        id: number;
        variantId: number;
        quantityChange: number;
        reason: string;
        createdAt: string;
      }[]
    >
  >(`/admin/stock/${variantId}/history`);
  return response.data.data;
}

/**
 * Get low-stock alerts (variants below threshold) (admin).
 */
export async function getLowStockAlerts(
  threshold: number = 3
): Promise<StockEntry[]> {
  const response = await api.get<ApiResponse<StockEntry[]>>('/admin/stock/low', {
    params: { threshold },
  });
  return response.data.data;
}
