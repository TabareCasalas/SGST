const API_URL = 'http://localhost:3001/api';

export class ApiService {
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

  static async getUsuarios() {
    const response = await fetch(`${API_URL}/usuarios`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  }

  static async createUsuario(data: any) {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear usuario');
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

