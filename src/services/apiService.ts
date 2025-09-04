const API_BASE_URL = 'http://localhost:3001/api';

// Tipos para la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Tramite {
  id: string;
  type: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  applicant: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  documents?: any[];
}

export interface CreateTramiteData {
  type: string;
  title: string;
  description: string;
  priority: string;
  applicant: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Función helper para hacer requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
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

// Servicios para trámites
export const tramiteService = {
  // Obtener todos los trámites
  async getAll(): Promise<ApiResponse<Tramite[]>> {
    return apiRequest<Tramite[]>('/tramites');
  },

  // Obtener un trámite por ID
  async getById(id: string): Promise<ApiResponse<Tramite>> {
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
  async update(id: string, data: Partial<CreateTramiteData>): Promise<ApiResponse<Tramite>> {
    return apiRequest<Tramite>(`/tramites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar un trámite
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/tramites/${id}`, {
      method: 'DELETE',
    });
  },
};

// Servicios para usuarios
export const userService = {
  // Obtener todos los usuarios
  async getAll(): Promise<ApiResponse<User[]>> {
    return apiRequest<User[]>('/users');
  },

  // Obtener un usuario por ID
  async getById(id: string): Promise<ApiResponse<User>> {
    return apiRequest<User>(`/users/${id}`);
  },

  // Crear un nuevo usuario
  async create(data: { email: string; name: string; role: string }): Promise<ApiResponse<User>> {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar un usuario
  async update(id: string, data: Partial<{ email: string; name: string; role: string; isActive: boolean }>): Promise<ApiResponse<User>> {
    return apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar un usuario
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
