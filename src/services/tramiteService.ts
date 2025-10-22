import { API_BASE_URL } from '../config/env';
import type { Tramite, CreateTramiteRequest, UpdateTramiteRequest } from '../types/tramites';

const API_URL = `${API_BASE_URL}/tramites`;

export const tramiteService = {
  // Obtener todos los trámites
  async getAllTramites(): Promise<Tramite[]> {
    const token = localStorage.getItem('authToken');
    console.log('Token for tramites:', token ? 'Present' : 'Missing');
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Tramites API error:', response.status, response.statusText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  // Obtener estadísticas de trámites
  async getTramiteStats(): Promise<any> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  // Crear un nuevo trámite
  async createTramite(tramiteData: CreateTramiteRequest): Promise<Tramite> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tramiteData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  // Actualizar un trámite
  async updateTramite(id: number, tramiteData: UpdateTramiteRequest): Promise<Tramite> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tramiteData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  // Eliminar un trámite
  async deleteTramite(id: number): Promise<void> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
  }
};