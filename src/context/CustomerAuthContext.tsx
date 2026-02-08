import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  CustomerUser,
  CustomerLoginCredentials,
  CustomerRegistrationData,
  CustomerProfileUpdate,
} from '../types/customer';
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentCustomer,
  updateProfile as authUpdateProfile,
} from '../services/customerAuthService';

export interface CustomerAuthContextValue {
  customer: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: CustomerLoginCredentials) => Promise<void>;
  register: (data: CustomerRegistrationData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: CustomerProfileUpdate) => Promise<void>;
  clearError: () => void;
}

export const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

interface CustomerAuthProviderProps {
  children: ReactNode;
}

export function CustomerAuthProvider({ children }: CustomerAuthProviderProps) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getCurrentCustomer();
    if (existing) {
      setCustomer(existing);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: CustomerLoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authLogin(credentials);
      setCustomer(user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: CustomerRegistrationData) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authRegister(data);
      setCustomer(user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al registrarse.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setCustomer(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(
    async (data: CustomerProfileUpdate) => {
      if (!customer) return;
      setError(null);
      try {
        const updated = await authUpdateProfile(customer.id, data);
        setCustomer(updated);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al actualizar perfil.';
        setError(message);
        throw err;
      }
    },
    [customer]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: CustomerAuthContextValue = {
    customer,
    isAuthenticated: Boolean(customer),
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}
