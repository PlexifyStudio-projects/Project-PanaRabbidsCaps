import type {
  CustomerUser,
  CustomerLoginCredentials,
  CustomerRegistrationData,
  CustomerProfileUpdate,
} from '../types/customer';
import type { Order } from '../types/order';

const CUSTOMERS_KEY = 'pana_customers';
const TOKEN_KEY = 'pana_customer_token';
const USER_KEY = 'pana_customer_user';
const ORDERS_KEY = 'pana_orders';

function getCustomers(): CustomerUser[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomers(customers: CustomerUser[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function generateId(): string {
  return `cust_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
}

export async function register(data: CustomerRegistrationData): Promise<CustomerUser> {
  await new Promise((r) => setTimeout(r, 400));

  const customers = getCustomers();
  const exists = customers.some((c) => c.email.toLowerCase() === data.email.toLowerCase());
  if (exists) {
    throw new Error('Ya existe una cuenta con este correo electrónico.');
  }

  const newCustomer: CustomerUser = {
    id: generateId(),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    address: data.address.trim(),
    department: data.department,
    city: data.city,
    passwordHash: btoa(data.password),
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  customers.push(newCustomer);
  saveCustomers(customers);

  // Auto-login
  localStorage.setItem(TOKEN_KEY, generateToken());
  localStorage.setItem(USER_KEY, JSON.stringify(newCustomer));

  return newCustomer;
}

export async function login(credentials: CustomerLoginCredentials): Promise<CustomerUser> {
  await new Promise((r) => setTimeout(r, 400));

  const customers = getCustomers();
  const customer = customers.find(
    (c) => c.email.toLowerCase() === credentials.email.toLowerCase().trim()
  );

  if (!customer || customer.passwordHash !== btoa(credentials.password)) {
    throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
  }

  if (!customer.isActive) {
    throw new Error('Tu cuenta ha sido desactivada. Contacta soporte.');
  }

  localStorage.setItem(TOKEN_KEY, generateToken());
  localStorage.setItem(USER_KEY, JSON.stringify(customer));

  return customer;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentCustomer(): CustomerUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as CustomerUser;
  } catch {
    return null;
  }
}

export function isCustomerAuthenticated(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY) && localStorage.getItem(USER_KEY));
}

export async function updateProfile(
  id: string,
  data: CustomerProfileUpdate
): Promise<CustomerUser> {
  await new Promise((r) => setTimeout(r, 300));

  const customers = getCustomers();
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Usuario no encontrado.');
  }

  const updated: CustomerUser = { ...customers[index], ...data };
  customers[index] = updated;
  saveCustomers(customers);

  // Update session
  localStorage.setItem(USER_KEY, JSON.stringify(updated));

  return updated;
}

export function getCustomerOrders(email: string): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const orders: Order[] = JSON.parse(raw);
    return orders
      .filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}
