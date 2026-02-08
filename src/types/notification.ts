export const NotificationType = {
  ORDER_PLACED_OWNER: 'ORDER_PLACED_OWNER',
  ORDER_PLACED_CUSTOMER: 'ORDER_PLACED_CUSTOMER',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  STOCK_BACK_IN_STOCK: 'STOCK_BACK_IN_STOCK',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationChannel = {
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipientEmail?: string;
  recipientPhone?: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
  sentAt: string;
  status: 'sent' | 'failed';
}

export interface StockSubscription {
  id: string;
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  email: string;
  phone?: string;
  customerId?: string;
  createdAt: string;
  notified: boolean;
  notifiedAt?: string;
}
