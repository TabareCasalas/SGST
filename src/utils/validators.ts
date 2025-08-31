// Validadores de formularios
export const validators = {
  // Validar email
  email: (value: string): string | null => {
    if (!value) {
      return 'El email es requerido';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'El email no es válido';
    }
    
    return null;
  },

  // Validar contraseña
  password: (value: string, minLength: number = 6): string | null => {
    if (!value) {
      return 'La contraseña es requerida';
    }
    
    if (value.length < minLength) {
      return `La contraseña debe tener al menos ${minLength} caracteres`;
    }
    
    return null;
  },

  // Validar contraseña fuerte
  strongPassword: (value: string): string | null => {
    if (!value) {
      return 'La contraseña es requerida';
    }
    
    if (value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (!/(?=.*[a-z])/.test(value)) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    
    if (!/(?=.*\d)/.test(value)) {
      return 'La contraseña debe contener al menos un número';
    }
    
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      return 'La contraseña debe contener al menos un carácter especial (@$!%*?&)';
    }
    
    return null;
  },

  // Validar campo requerido
  required: (value: string, fieldName: string = 'Este campo'): string | null => {
    if (!value || value.trim() === '') {
      return `${fieldName} es requerido`;
    }
    
    return null;
  },

  // Validar longitud mínima
  minLength: (value: string, minLength: number, fieldName: string = 'Este campo'): string | null => {
    if (value.length < minLength) {
      return `${fieldName} debe tener al menos ${minLength} caracteres`;
    }
    
    return null;
  },

  // Validar longitud máxima
  maxLength: (value: string, maxLength: number, fieldName: string = 'Este campo'): string | null => {
    if (value.length > maxLength) {
      return `${fieldName} debe tener máximo ${maxLength} caracteres`;
    }
    
    return null;
  },

  // Validar número
  number: (value: string): string | null => {
    if (value && isNaN(Number(value))) {
      return 'Debe ser un número válido';
    }
    
    return null;
  },

  // Validar teléfono
  phone: (value: string): string | null => {
    if (!value) {
      return null; // Teléfono es opcional
    }
    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'El teléfono no es válido';
    }
    
    return null;
  },

  // Validar URL
  url: (value: string): string | null => {
    if (!value) {
      return null; // URL es opcional
    }
    
    try {
      new URL(value);
      return null;
    } catch {
      return 'La URL no es válida';
    }
  },
};

// Función helper para validar múltiples campos
export const validateForm = (
  data: Record<string, string>,
  rules: Record<string, (value: string) => string | null>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field] || '';
    const error = rules[field](value);
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
}; 