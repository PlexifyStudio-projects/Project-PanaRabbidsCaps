export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate an email address.
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El correo electrónico es obligatorio';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'El correo electrónico no es válido';
  return null;
}

/**
 * Validate a Colombian phone number.
 * Accepts formats: 3001234567, +573001234567, 573001234567
 */
export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'El número de teléfono es obligatorio';
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^(\+?57)?3\d{9}$/;
  if (!phoneRegex.test(cleaned)) return 'El número de teléfono no es válido (ej: 3001234567)';
  return null;
}

/**
 * Validate a name field (customer name).
 */
export function validateName(name: string): string | null {
  if (!name.trim()) return 'El nombre es obligatorio';
  if (name.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
  if (name.trim().length > 100) return 'El nombre no puede exceder 100 caracteres';
  const nameRegex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ\s\-'.]+$/;
  if (!nameRegex.test(name.trim())) return 'El nombre contiene caracteres no válidos';
  return null;
}

/**
 * Validate a shipping address.
 */
export function validateAddress(address: string): string | null {
  if (!address.trim()) return 'La dirección es obligatoria';
  if (address.trim().length < 10) return 'La dirección debe tener al menos 10 caracteres';
  if (address.trim().length > 200) return 'La dirección no puede exceder 200 caracteres';
  return null;
}

/**
 * Validate a required select field.
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} es obligatorio`;
  return null;
}

/**
 * Validate all checkout form fields at once.
 */
export function validateCheckoutForm(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDepartment: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const nameError = validateName(data.customerName);
  if (nameError) errors.customerName = nameError;

  const emailError = validateEmail(data.customerEmail);
  if (emailError) errors.customerEmail = emailError;

  const phoneError = validatePhone(data.customerPhone);
  if (phoneError) errors.customerPhone = phoneError;

  const addressError = validateAddress(data.shippingAddress);
  if (addressError) errors.shippingAddress = addressError;

  const departmentError = validateRequired(data.shippingDepartment, 'El departamento');
  if (departmentError) errors.shippingDepartment = departmentError;

  const cityError = validateRequired(data.shippingCity, 'La ciudad');
  if (cityError) errors.shippingCity = cityError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
