import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ENV } from '../config/env';

const AUTH_TOKEN_KEY = 'pana_rabbids_auth_token';

/**
 * Axios instance pre-configured for the Pana Rabbids API.
 */
const api: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request Interceptor ─────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ── Response Interceptor ────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      // Unauthorized - clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        // Only redirect if we are on an admin page
        if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Log server errors in development
      if (ENV.IS_DEV && status >= 500) {
        console.error('[API Error]', status, error.response.data);
      }
    } else if (error.request) {
      // Network error - no response received
      if (ENV.IS_DEV) {
        console.error('[Network Error] No response received:', error.message);
      }
    }

    return Promise.reject(error);
  }
);

export { AUTH_TOKEN_KEY };
export default api;
