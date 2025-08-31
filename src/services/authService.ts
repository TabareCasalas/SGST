// Tipos para las respuestas del API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Configuración base del API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.success && response.token) {
        localStorage.setItem('authToken', response.token);
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
  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
    }
  },

  // Verificar token
  async verifyToken(): Promise<User | null> {
    try {
      const response = await apiRequest<{ user: User }>('/auth/verify');
      return response.user;
    } catch (error) {
      localStorage.removeItem('authToken');
      return null;
    }
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiRequest<{ user: User }>('/auth/me');
      return response.user;
    } catch (error) {
      return null;
    }
  },
}; 