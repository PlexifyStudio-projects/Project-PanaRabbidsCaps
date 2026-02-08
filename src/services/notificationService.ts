import type { Order } from '../types/order';
import type { OrderStatus } from '../types/order';
import { NotificationType } from '../types/notification';
import type { NotificationRecord } from '../types/notification';
import { loadStoreSettings } from '../data/settingsService';
import {
  sendEmail,
  buildOrderConfirmationEmail,
  buildOwnerOrderNotification,
  buildOrderStatusEmail,
  buildStockAlertEmail,
} from './emailService';
import {
  sendWhatsApp,
  buildOrderPlacedWhatsApp,
  buildOrderStatusWhatsApp,
  buildStockAlertWhatsApp,
  getOwnerPhone,
} from './whatsappNotificationService';
import {
  getSubscriptionsForVariant,
  markNotified,
} from '../data/stockAlertService';
import { PRODUCTS } from '../data/mockProducts';

const LOG_KEY = 'pana_notification_log';

export function notifyOrderPlaced(order: Order): void {
  const settings = loadStoreSettings();

  // Email to customer
  const customerEmail = buildOrderConfirmationEmail(order);
  sendEmail({
    to: order.customerEmail,
    subject: customerEmail.subject,
    body: customerEmail.body,
    type: NotificationType.ORDER_PLACED_CUSTOMER,
    metadata: { orderId: order.id, referenceCode: order.referenceCode },
  });

  // Email to owner
  const ownerEmail = buildOwnerOrderNotification(order);
  sendEmail({
    to: settings.email,
    subject: ownerEmail.subject,
    body: ownerEmail.body,
    type: NotificationType.ORDER_PLACED_OWNER,
    metadata: { orderId: order.id, referenceCode: order.referenceCode },
  });

  // WhatsApp to owner
  const ownerWA = buildOrderPlacedWhatsApp(order);
  sendWhatsApp({
    to: getOwnerPhone(),
    message: ownerWA,
    type: NotificationType.ORDER_PLACED_OWNER,
    metadata: { orderId: order.id, referenceCode: order.referenceCode },
  });
}

export function notifyOrderStatusChanged(order: Order, newStatus: OrderStatus): void {
  // Email to customer
  const statusEmail = buildOrderStatusEmail(order, newStatus);
  sendEmail({
    to: order.customerEmail,
    subject: statusEmail.subject,
    body: statusEmail.body,
    type: NotificationType.ORDER_STATUS_CHANGED,
    metadata: { orderId: order.id, newStatus },
  });

  // WhatsApp to customer (if phone available)
  if (order.customerPhone) {
    const statusWA = buildOrderStatusWhatsApp(order, newStatus);
    sendWhatsApp({
      to: order.customerPhone,
      message: statusWA,
      type: NotificationType.ORDER_STATUS_CHANGED,
      metadata: { orderId: order.id, newStatus },
    });
  }
}

export function notifyStockRestored(variantId: number): void {
  const subscriptions = getSubscriptionsForVariant(variantId);
  if (subscriptions.length === 0) return;

  // Find the product for the subscription info
  const product = PRODUCTS.find((p) =>
    p.variants.some((v) => v.id === variantId)
  );

  for (const sub of subscriptions) {
    // Email
    if (product) {
      const stockEmail = buildStockAlertEmail(sub, product);
      sendEmail({
        to: sub.email,
        subject: stockEmail.subject,
        body: stockEmail.body,
        type: NotificationType.STOCK_BACK_IN_STOCK,
        metadata: { variantId, productId: sub.productId, subscriptionId: sub.id },
      });
    }

    // WhatsApp (if phone available)
    if (sub.phone) {
      const stockWA = buildStockAlertWhatsApp(sub);
      sendWhatsApp({
        to: sub.phone,
        message: stockWA,
        type: NotificationType.STOCK_BACK_IN_STOCK,
        metadata: { variantId, productId: sub.productId, subscriptionId: sub.id },
      });
    }

    markNotified(sub.id);
  }
}

export function getNotificationLog(): NotificationRecord[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
