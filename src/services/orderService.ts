import api from './api';
import type { Order, CreateOrderData, TrackingEvent, OrderFilters } from '../types/order';
import type { OrderStatus } from '../types/order';
import type { ApiResponse, PaginatedResponse } from '../types/api';

// ── Public endpoints ────────────────────────────────────────────────

/**
 * Create a new order from the checkout flow.
 */
export async function createOrder(data: CreateOrderData): Promise<Order> {
  const response = await api.post<ApiResponse<Order>>('/orders', data);
  return response.data.data;
}

/**
 * Get order details and tracking by reference code (public).
 */
export async function getOrderTracking(referenceCode: string): Promise<Order> {
  const response = await api.get<ApiResponse<Order>>(`/orders/track/${referenceCode}`);
  return response.data.data;
}

/**
 * Get tracking events timeline for an order (public).
 */
export async function getTrackingEvents(referenceCode: string): Promise<TrackingEvent[]> {
  const response = await api.get<ApiResponse<TrackingEvent[]>>(
    `/orders/track/${referenceCode}/events`
  );
  return response.data.data;
}

// ── Admin endpoints ─────────────────────────────────────────────────

/**
 * Get a paginated list of all orders (admin).
 */
export async function getOrders(
  filters?: OrderFilters
): Promise<PaginatedResponse<Order>> {
  const response = await api.get<PaginatedResponse<Order>>('/admin/orders', {
    params: filters,
  });
  return response.data;
}

/**
 * Get a single order by its ID (admin).
 */
export async function getOrderById(id: number): Promise<Order> {
  const response = await api.get<ApiResponse<Order>>(`/admin/orders/${id}`);
  return response.data.data;
}

/**
 * Update the status of an order (admin).
 */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  notes?: string
): Promise<Order> {
  const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, {
    status,
    notes,
  });
  return response.data.data;
}

/**
 * Update the tracking code for a shipped order (admin).
 */
export async function updateTrackingCode(
  id: number,
  trackingCode: string
): Promise<Order> {
  const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${id}/tracking`, {
    trackingCode,
  });
  return response.data.data;
}
