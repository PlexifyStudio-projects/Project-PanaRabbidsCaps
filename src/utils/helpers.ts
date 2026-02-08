/**
 * Generate a URL-friendly slug from text.
 * Example: generateSlug("New Era Yankees") => "new-era-yankees"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-')            // collapse consecutive hyphens
    .replace(/^-|-$/g, '');          // trim hyphens from edges
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Get a stock availability label and severity variant.
 */
export function getStockLabel(stock: number): {
  text: string;
  variant: 'danger' | 'warning' | 'success';
} {
  if (stock <= 0) return { text: 'Agotado', variant: 'danger' };
  if (stock <= 3) return { text: `¡Solo ${stock} disponible${stock > 1 ? 's' : ''}!`, variant: 'warning' };
  return { text: 'En stock', variant: 'success' };
}

/**
 * Calculate the discount percentage between a base price and compare price.
 * Returns a rounded integer (e.g., 25 for 25%).
 */
export function calculateDiscount(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Generate a unique reference code for orders.
 * Format: PAN-2026-XXXXX (5 random alphanumeric chars)
 */
export function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PAN-${year}-${code}`;
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Conditionally join class names (like clsx / classnames).
 * Accepts strings, undefined, null, false, and objects.
 *
 * Example: classNames('btn', isActive && 'btn--active', { 'btn--lg': isLarge })
 */
export function classNames(
  ...args: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Format a phone number as (XXX) XXX-XXXX.
 * Strips non-digits, removes leading country code 57 if present,
 * then formats the 10-digit number.
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // Remove leading country code 57 if the result is 12 digits
  const local = digits.length === 12 && digits.startsWith('57') ? digits.slice(2) : digits;
  if (local.length === 10) {
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  // Fallback: return original if not 10 digits
  return phone;
}

/**
 * Build a WhatsApp URL with pre-filled message.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Get the primary image URL from a product, or a fallback.
 */
export function getPrimaryImageUrl(
  images: { imageUrl: string; isPrimary: boolean; sortOrder: number }[],
  fallback = '/placeholder-cap.jpg'
): string {
  if (!images || images.length === 0) return fallback;
  const primary = images.find((img) => img.isPrimary);
  if (primary) return primary.imageUrl;
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted[0].imageUrl;
}
