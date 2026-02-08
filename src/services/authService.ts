import type { AdminUser, LoginCredentials } from '../types/user';
import { AUTH_TOKEN_KEY } from './api';

// ── Local credentials (temporary until backend is ready) ────────────
const LOCAL_ADMIN_EMAIL = 'admin@plexifycaps.com';
const LOCAL_ADMIN_PASSWORD = 'Admin1!';

const ADMIN_USER_KEY = 'plexify_caps_admin_user';

// Mock admin user returned on successful local login
const MOCK_ADMIN_USER: AdminUser = {
  id: 1,
  username: 'admin',
  email: 'admin@plexifycaps.com',
  isActive: true,
  lastLogin: new Date().toISOString(),
};

// Mock JWT token (not a real JWT, just a placeholder)
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MOCK_PLEXIFY_CAPS_ADMIN_TOKEN';

/**
 * Authenticate with username and password.
 * Currently uses hardcoded local credentials.
 * Will be replaced with actual API call when backend is ready.
 */
export async function login(credentials: LoginCredentials): Promise<AdminUser> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (
    credentials.email === LOCAL_ADMIN_EMAIL &&
    credentials.password === LOCAL_ADMIN_PASSWORD
  ) {
    const user: AdminUser = {
      ...MOCK_ADMIN_USER,
      lastLogin: new Date().toISOString(),
    };

    // Store token and user in localStorage
    localStorage.setItem(AUTH_TOKEN_KEY, MOCK_TOKEN);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));

    return user;
  }

  throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.');
}

/**
 * Log out the current admin user.
 */
export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

/**
 * Get the currently authenticated admin user from localStorage.
 * Returns null if no user is stored or token is missing.
 */
export function getCurrentUser(): AdminUser | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;

  const userJson = localStorage.getItem(ADMIN_USER_KEY);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as AdminUser;
  } catch {
    return null;
  }
}

/**
 * Check whether an admin session exists.
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const user = localStorage.getItem(ADMIN_USER_KEY);
  return Boolean(token && user);
}
