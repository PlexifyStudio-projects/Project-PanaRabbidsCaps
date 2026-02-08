/**
 * Environment configuration.
 * Values are read from Vite environment variables (import.meta.env)
 * with sensible defaults for local development.
 */

export const ENV = {
  /** Base URL for API requests */
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',

  /** Wompi public key for payment processing */
  WOMPI_PUBLIC_KEY: import.meta.env.VITE_WOMPI_PUBLIC_KEY || '',

  /** Wompi sandbox mode */
  WOMPI_SANDBOX: import.meta.env.VITE_WOMPI_SANDBOX === 'true' || import.meta.env.DEV,

  /** WhatsApp contact number (override) */
  WHATSAPP_NUMBER: import.meta.env.VITE_WHATSAPP_NUMBER || '573151573329',

  /** Application name */
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Pana Rabbids',

  /** Whether we are in development mode */
  IS_DEV: import.meta.env.DEV,

  /** Whether we are in production mode */
  IS_PROD: import.meta.env.PROD,
} as const;
