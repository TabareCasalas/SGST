import { 
  Tramite, 
  CreateTramiteData, 
  UpdateTramiteData, 
  Usuario, 
  Grupo, 
  Consultante,
  LoginCredentials,
  LoginResponse,
  ApiResponse,
  AuthResponse
} from '../types/tramites';

const API_BASE_URL = 'http://localhost:3000/api';

// Función helper para hacer requests con autenticación
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Servicios para autenticación
export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Error en el login',
        };
      }

      // Guardar token en localStorage
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Login Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem('token');
  },

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  },
};

// Servicios para trámites
export const tramiteService = {
  // Obtener todos los trámites
  async getAll(): Promise<ApiResponse<Tramite[]>> {
    return apiRequest<Tramite[]>('/tramites');
  },

  // Obtener un trámite por ID
  async getById(id: number): Promise<ApiResponse<Tramite>> {
    return apiRequest<Tramite>(`/tramites/${id}`);
  },

  // Crear un nuevo trámite
  async create(data: CreateTramiteData): Promise<ApiResponse<Tramite>> {
    return apiRequest<Tramite>('/tramites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar un trámite
  async update(id: number, data: UpdateTramiteData): Promise<ApiResponse<Tramite>> {
    return apiRequest<Tramite>(`/tramites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar un trámite
  async delete(id: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/tramites/${id}`, {
      method: 'DELETE',
    });
  },
};

// Servicios para usuarios
export const userService = {
  // Obtener todos los usuarios
  async getAll(): Promise<ApiResponse<Usuario[]>> {
    return apiRequest<Usuario[]>('/users');
  },

  // Obtener un usuario por ID
  async getById(id: number): Promise<ApiResponse<Usuario>> {
    return apiRequest<Usuario>(`/users/${id}`);
  },

  // Crear un nuevo usuario
  async create(data: {
    nombre: string;
    ci: string;
    domicilio: string;
    telefono: string;
    correo: string;
    password: string;
    roles: number[];
  }): Promise<ApiResponse<Usuario>> {
    return apiRequest<Usuario>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar un usuario
  async update(id: number, data: Partial<{
    nombre: string;
    ci: string;
    domicilio: string;
    telefono: string;
    correo: string;
    estado: string;
  }>): Promise<ApiResponse<Usuario>> {
    return apiRequest<Usuario>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar un usuario
  async delete(id: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener roles
  async getRoles(): Promise<ApiResponse<any[]>> {
    return apiRequest<any[]>('/users/roles');
  },
};

// Servicios para grupos
export const grupoService = {
  // Obtener todos los grupos
  async getAll(): Promise<ApiResponse<Grupo[]>> {
    return apiRequest<Grupo[]>('/tramites/grupos');
  },
};

// Servicios para consultantes
export const consultanteService = {
  // Obtener todos los consultantes
  async getAll(): Promise<ApiResponse<Consultante[]>> {
    return apiRequest<Consultante[]>('/tramites/consultantes');
  },
};