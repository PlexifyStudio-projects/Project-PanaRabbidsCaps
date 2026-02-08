import { ENV } from '../config/env';
import api from './api';
import type { ApiResponse } from '../types/api';

// ── Wompi Payment Types ─────────────────────────────────────────────

export interface WompiTransaction {
  id: string;
  reference: string;
  amountInCents: number;
  currency: 'COP';
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  paymentMethodType: string;
  redirectUrl: string;
}

export interface CreatePaymentData {
  orderId: number;
  referenceCode: string;
  amountInCents: number;
  customerEmail: string;
  customerName: string;
  redirectUrl: string;
}

export interface PaymentResult {
  transactionId: string;
  status: WompiTransaction['status'];
  reference: string;
}

// ── Payment Service ─────────────────────────────────────────────────

/**
 * Create a Wompi payment session.
 * This calls our backend which creates the transaction with Wompi.
 * Placeholder implementation until backend and Wompi are integrated.
 */
export async function createPayment(data: CreatePaymentData): Promise<WompiTransaction> {
  const response = await api.post<ApiResponse<WompiTransaction>>('/payments/create', data);
  return response.data.data;
}

/**
 * Verify the status of a Wompi transaction.
 * Called after the user returns from the payment gateway.
 */
export async function verifyPayment(transactionId: string): Promise<PaymentResult> {
  const response = await api.get<ApiResponse<PaymentResult>>(
    `/payments/verify/${transactionId}`
  );
  return response.data.data;
}

/**
 * Get the Wompi widget configuration for the checkout page.
 * Returns the public key and environment settings.
 */
export function getWompiConfig() {
  return {
    publicKey: ENV.WOMPI_PUBLIC_KEY,
    currency: 'COP' as const,
    sandbox: ENV.WOMPI_SANDBOX,
    widgetUrl: ENV.WOMPI_SANDBOX
      ? 'https://sandbox.wompi.co/v1'
      : 'https://production.wompi.co/v1',
  };
}

/**
 * Convert COP amount to cents for Wompi (multiply by 100).
 */
export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents back to COP amount.
 */
export function centsToAmount(cents: number): number {
  return cents / 100;
}
