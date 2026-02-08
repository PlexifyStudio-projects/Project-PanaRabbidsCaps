import type { StockSubscription } from '../types/notification';

const STORAGE_KEY = 'pana_stock_subscriptions';

function getAll(): StockSubscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(subs: StockSubscription[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
}

function generateId(): string {
  return `stocksub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function subscribe(data: {
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  email: string;
  phone?: string;
  customerId?: string;
}): StockSubscription {
  const subs = getAll();

  // Deduplicate: same variant + same email
  const existing = subs.find(
    (s) =>
      s.variantId === data.variantId &&
      s.email.toLowerCase() === data.email.toLowerCase() &&
      !s.notified
  );
  if (existing) return existing;

  const newSub: StockSubscription = {
    id: generateId(),
    variantId: data.variantId,
    productId: data.productId,
    productName: data.productName,
    variantLabel: data.variantLabel,
    email: data.email.toLowerCase().trim(),
    phone: data.phone?.trim(),
    customerId: data.customerId,
    createdAt: new Date().toISOString(),
    notified: false,
  };

  subs.push(newSub);
  saveAll(subs);
  return newSub;
}

export function getSubscriptionsForVariant(variantId: number): StockSubscription[] {
  return getAll().filter((s) => s.variantId === variantId && !s.notified);
}

export function isSubscribed(variantId: number, email: string): boolean {
  return getAll().some(
    (s) =>
      s.variantId === variantId &&
      s.email.toLowerCase() === email.toLowerCase() &&
      !s.notified
  );
}

export function markNotified(id: string): void {
  const subs = getAll();
  const index = subs.findIndex((s) => s.id === id);
  if (index !== -1) {
    subs[index] = {
      ...subs[index],
      notified: true,
      notifiedAt: new Date().toISOString(),
    };
    saveAll(subs);
  }
}

export function unsubscribe(id: string): void {
  const subs = getAll().filter((s) => s.id !== id);
  saveAll(subs);
}
