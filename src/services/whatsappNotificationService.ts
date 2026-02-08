import type { Order } from '../types/order';
import { NotificationType, NotificationChannel } from '../types/notification';
import type { NotificationRecord, StockSubscription } from '../types/notification';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { loadStoreSettings } from '../data/settingsService';
import type { OrderStatus } from '../types/order';

const LOG_KEY = 'pana_notification_log';

function getLog(): NotificationRecord[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function appendLog(record: NotificationRecord) {
  const log = getLog();
  log.push(record);
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function sendWhatsApp(payload: {
  to: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
}): NotificationRecord {
  const record: NotificationRecord = {
    id: generateId(),
    type: payload.type,
    channel: NotificationChannel.WHATSAPP,
    recipientPhone: payload.to,
    subject: 'WhatsApp',
    body: payload.message,
    metadata: payload.metadata,
    sentAt: new Date().toISOString(),
    status: 'sent',
  };

  appendLog(record);
  console.log(`[WHATSAPP] → ${payload.to}: ${payload.message.slice(0, 80)}...`);
  return record;
}

export function buildOrderPlacedWhatsApp(order: Order): string {
  return [
    `Nuevo pedido #${order.referenceCode}`,
    `Cliente: ${order.customerName}`,
    `Total: $${order.total.toLocaleString('es-CO')}`,
    `Artículos: ${order.items.length}`,
    `Pago: ${order.paymentMethod}`,
  ].join('\n');
}

export function buildOrderStatusWhatsApp(order: Order, newStatus: OrderStatus): string {
  const statusLabel = ORDER_STATUS_LABELS[newStatus] || newStatus;
  return [
    `Hola ${order.customerName},`,
    `Tu pedido #${order.referenceCode} ahora está: ${statusLabel}`,
    order.trackingCode ? `Rastreo: ${order.trackingCode}` : '',
    'PlexifyCaps',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildStockAlertWhatsApp(subscription: StockSubscription): string {
  return [
    `Hola! ${subscription.productName} (${subscription.variantLabel}) ya está disponible.`,
    'Corre antes de que se agote.',
    'PlexifyCaps',
  ].join('\n');
}

export function getOwnerPhone(): string {
  return loadStoreSettings().whatsapp;
}
