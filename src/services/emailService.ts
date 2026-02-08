import type { Order } from '../types/order';
import { NotificationType, NotificationChannel } from '../types/notification';
import type { NotificationRecord, StockSubscription } from '../types/notification';
import type { Product } from '../types/product';
import { ORDER_STATUS_LABELS } from '../utils/constants';
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

export function sendEmail(payload: {
  to: string;
  subject: string;
  body: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
}): NotificationRecord {
  const record: NotificationRecord = {
    id: generateId(),
    type: payload.type,
    channel: NotificationChannel.EMAIL,
    recipientEmail: payload.to,
    subject: payload.subject,
    body: payload.body,
    metadata: payload.metadata,
    sentAt: new Date().toISOString(),
    status: 'sent',
  };

  appendLog(record);
  console.log(`[EMAIL] → ${payload.to}: ${payload.subject}`);
  return record;
}

export function buildOrderConfirmationEmail(order: Order): {
  subject: string;
  body: string;
} {
  const itemsHtml = order.items
    .map((i) => `${i.productName} (${i.variantName}) x${i.quantity} — $${i.totalPrice.toLocaleString('es-CO')}`)
    .join('\n');

  return {
    subject: `Confirmación de pedido #${order.referenceCode} - PlexifyCaps`,
    body: [
      `Hola ${order.customerName},`,
      '',
      `Tu pedido #${order.referenceCode} ha sido recibido.`,
      '',
      'Artículos:',
      itemsHtml,
      '',
      `Subtotal: $${order.subtotal.toLocaleString('es-CO')}`,
      `Envío: $${order.shippingCost.toLocaleString('es-CO')}`,
      `Total: $${order.total.toLocaleString('es-CO')}`,
      '',
      `Dirección: ${order.shippingAddress}, ${order.shippingCity}, ${order.shippingDepartment}`,
      '',
      'Te notificaremos cuando tu pedido cambie de estado.',
      '',
      'Gracias por tu compra,',
      'PlexifyCaps',
    ].join('\n'),
  };
}

export function buildOwnerOrderNotification(order: Order): {
  subject: string;
  body: string;
} {
  return {
    subject: `Nuevo pedido #${order.referenceCode} — $${order.total.toLocaleString('es-CO')}`,
    body: [
      `Nuevo pedido recibido:`,
      '',
      `Referencia: ${order.referenceCode}`,
      `Cliente: ${order.customerName} (${order.customerEmail})`,
      `Teléfono: ${order.customerPhone}`,
      `Total: $${order.total.toLocaleString('es-CO')}`,
      `Artículos: ${order.items.length}`,
      `Método de pago: ${order.paymentMethod}`,
      '',
      `Dirección: ${order.shippingAddress}, ${order.shippingCity}, ${order.shippingDepartment}`,
    ].join('\n'),
  };
}

export function buildOrderStatusEmail(
  order: Order,
  newStatus: OrderStatus
): { subject: string; body: string } {
  const statusLabel = ORDER_STATUS_LABELS[newStatus] || newStatus;
  return {
    subject: `Tu pedido #${order.referenceCode} — ${statusLabel}`,
    body: [
      `Hola ${order.customerName},`,
      '',
      `Tu pedido #${order.referenceCode} ha cambiado de estado a: ${statusLabel}`,
      '',
      order.trackingCode ? `Código de rastreo: ${order.trackingCode}` : '',
      '',
      'Puedes revisar el estado de tu pedido en nuestra página de rastreo.',
      '',
      'Gracias,',
      'PlexifyCaps',
    ]
      .filter(Boolean)
      .join('\n'),
  };
}

export function buildStockAlertEmail(
  subscription: StockSubscription,
  _product: Product
): { subject: string; body: string } {
  return {
    subject: `${subscription.productName} ya está disponible — PlexifyCaps`,
    body: [
      `Hola,`,
      '',
      `El producto que estabas esperando ya está disponible:`,
      '',
      `${subscription.productName} — ${subscription.variantLabel}`,
      '',
      'Corre antes de que se agote.',
      '',
      'PlexifyCaps',
    ].join('\n'),
  };
}
