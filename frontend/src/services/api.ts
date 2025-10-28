const API_URL = 'http://localhost:3001/api';

export class ApiService {
  // Helper para obtener headers con token
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // ============== AUTENTICACIÓN ==============

  static async login(ci: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ci, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }
    
    return response.json();
  }

  static async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cerrar sesión');
    }
    
    return response.json();
  }

  static async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener usuario actual');
    }
    
    return response.json();
  }

  static async refreshToken(refreshToken: string) {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Error al renovar token');
    }
    
    return response.json();
  }

  // ============== TRÁMITES ==============
  
  static async getTramites(filters?: { estado?: string; id_consultante?: number; id_grupo?: number }) {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.id_consultante) params.append('id_consultante', filters.id_consultante.toString());
    if (filters?.id_grupo) params.append('id_grupo', filters.id_grupo.toString());
    
    const url = `${API_URL}/tramites${params.toString() ? '?' + params : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener trámites');
    return response.json();
  }

  static async getTramiteById(id: number) {
    const response = await fetch(`${API_URL}/tramites/${id}`);
    if (!response.ok) throw new Error('Error al obtener trámite');
    return response.json();
  }

  static async createTramite(data: any) {
    const response = await fetch(`${API_URL}/tramites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear trámite');
    }
    return response.json();
  }

  static async updateTramite(id: number, data: any) {
    const response = await fetch(`${API_URL}/tramites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar trámite');
    return response.json();
  }

  static async deleteTramite(id: number) {
    const response = await fetch(`${API_URL}/tramites/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar trámite');
    return response.json();
  }

  // ============== USUARIOS ==============

  static async getUsuarios(filters?: { rol?: string; activo?: boolean; grupo?: number; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.rol) params.append('rol', filters.rol);
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.grupo) params.append('grupo', filters.grupo.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const url = `${API_URL}/usuarios${params.toString() ? '?' + params : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  }

  static async getUsuarioById(id: number) {
    const response = await fetch(`${API_URL}/usuarios/${id}`);
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
  }

  static async createUsuario(data: any) {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear usuario');
    }
    return response.json();
  }

  static async updateUsuario(id: number, data: any) {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar usuario');
    }
    return response.json();
  }

  static async deactivateUsuario(id: number) {
    const response = await fetch(`${API_URL}/usuarios/${id}/desactivar`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al desactivar usuario');
    }
    return response.json();
  }

  static async activateUsuario(id: number) {
    const response = await fetch(`${API_URL}/usuarios/${id}/activar`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al activar usuario');
    }
    return response.json();
  }

  static async getAuditoria(filters?: { tipo_entidad?: string; id_entidad?: number; accion?: string }) {
    const params = new URLSearchParams();
    if (filters?.tipo_entidad) params.append('tipo_entidad', filters.tipo_entidad);
    if (filters?.id_entidad) params.append('id_entidad', filters.id_entidad.toString());
    if (filters?.accion) params.append('accion', filters.accion);
    
    const url = `${API_URL}/usuarios/auditoria${params.toString() ? '?' + params : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener auditoría');
    return response.json();
  }

  // ============== CONSULTANTES ==============

  static async getConsultantes() {
    const response = await fetch(`${API_URL}/consultantes`);
    if (!response.ok) throw new Error('Error al obtener consultantes');
    return response.json();
  }

  static async createConsultante(data: any) {
    const response = await fetch(`${API_URL}/consultantes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear consultante');
    return response.json();
  }

  // ============== GRUPOS ==============

  static async getGrupos() {
    const response = await fetch(`${API_URL}/grupos`);
    if (!response.ok) throw new Error('Error al obtener grupos');
    return response.json();
  }

  static async getGrupoById(id: number) {
    const response = await fetch(`${API_URL}/grupos/${id}`);
    if (!response.ok) throw new Error('Error al obtener grupo');
    return response.json();
  }

  static async createGrupo(data: {
    nombre: string;
    descripcion?: string;
    responsable_id: number;
    asistentes_ids: number[];
  }) {
    const response = await fetch(`${API_URL}/grupos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear grupo');
    }
    return response.json();
  }

  static async updateGrupo(id: number, data: any) {
    const response = await fetch(`${API_URL}/grupos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar grupo');
    }
    return response.json();
  }

  static async addMiembroGrupo(id: number, data: {
    id_usuario: number;
    rol_en_grupo: 'responsable' | 'asistente' | 'estudiante';
  }) {
    const response = await fetch(`${API_URL}/grupos/${id}/miembros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al agregar miembro');
    }
    return response.json();
  }

  // ============== TAREAS CAMUNDA ==============

  /**
   * Completa una tarea manual (User Task) en Camunda
   * Esto actualiza el estado del trámite según la decisión (aprobado/rechazado)
   */
  static async completarTarea(tramiteId: number, aprobado: boolean, observaciones?: string) {
    const response = await fetch(`${API_URL}/tramites/${tramiteId}/completar-tarea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        aprobado, 
        observaciones,
        decision: aprobado ? 'aprobado' : 'rechazado'
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al completar tarea');
    }
    return response.json();
  }

  /**
   * Obtiene las tareas pendientes para el usuario actual
   */
  static async getTareasPendientes() {
    const response = await fetch(`${API_URL}/tareas/pendientes`);
    if (!response.ok) throw new Error('Error al obtener tareas pendientes');
    return response.json();
  }

  /**
   * Obtiene información de la instancia de proceso en Camunda
   */
  static async getProcesoCamunda(processInstanceId: string) {
    const response = await fetch(`${API_URL}/procesos/${processInstanceId}`);
    if (!response.ok) throw new Error('Error al obtener información del proceso');
    return response.json();
  }
}

