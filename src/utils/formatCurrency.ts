/**
 * Format a number as Colombian Pesos (COP).
 * Example: formatCOP(150000) => "$150.000 COP"
 */
export function formatCOP(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${formatted} COP`;
}

/**
 * Format a number as Colombian Pesos with currency suffix (alias).
 * Example: formatCOPFull(150000) => "$150.000 COP"
 */
export function formatCOPFull(amount: number): string {
  return formatCOP(amount);
}

/**
 * Parse a COP-formatted string back to a number.
 * Example: parseCOP("$150.000") => 150000
 * Example: parseCOP("$150.000 COP") => 150000
 */
export function parseCOP(formatted: string): number {
  const cleaned = formatted
    .replace('COP', '')
    .replace('$', '')
    .replace(/\./g, '')
    .trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}
