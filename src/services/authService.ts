// Tipos para las respuestas del API
export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    usuario: {
      id_usuario: number;
      nombre: string;
      ci: string;
      domicilio: string;
      telefono: string;
      fecha_alta: string;
      estado: string;
      correo: string;
      fecha_ult_login?: string;
    };
    roles: Array<{
      id_rol: number;
      nombre: string;
    }>;
  };
  error?: string;
}

export interface User {
  id_usuario: number;
  nombre: string;
  ci: string;
  domicilio: string;
  telefono: string;
  fecha_alta: string;
  estado: string;
  correo: string;
  fecha_ult_login?: string;
  roles?: Array<{
    id_rol: number;
    nombre: string;
  }>;
}

import { config } from '../config/env';

// Configuración base del API
const API_BASE_URL = config.API_URL;

// Función helper para hacer requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Agregar token si existe
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Servicios de autenticación
export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiRequest<LoginResponse>('/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.success && response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión al servidor',
      };
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRoles');
  },

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  // Verificar token
  async verifyToken(): Promise<User | null> {
    try {
      const response = await apiRequest<{ success: boolean; data: User }>('/users/me');
      return response.data;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiRequest<{ success: boolean; data: User }>('/users/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
}; 