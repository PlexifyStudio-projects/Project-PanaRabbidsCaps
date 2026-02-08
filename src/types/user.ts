export interface AdminUser {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  lastLogin: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
