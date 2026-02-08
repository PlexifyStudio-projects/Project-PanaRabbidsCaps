export interface CustomerUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  department: string;
  city: string;
  passwordHash: string;
  createdAt: string;
  isActive: boolean;
}

export interface CustomerLoginCredentials {
  email: string;
  password: string;
}

export interface CustomerRegistrationData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  department: string;
  city: string;
  password: string;
}

export interface CustomerProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  department?: string;
  city?: string;
}
