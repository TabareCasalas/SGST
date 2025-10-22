import { API_BASE_URL } from '../config/env';
import type { User, CreateUserRequest } from '../types/auth';

const API_URL = `${API_BASE_URL}/users`;

export const userService = {
  // Obtener todos los usuarios
  async getAllUsers(): Promise<User[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  // Obtener estadísticas de usuarios
  async getUserStats(): Promise<any> {
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

  // Crear un nuevo usuario
  async createUser(userData: CreateUserRequest): Promise<User> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  // Actualizar un usuario
  async updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<User> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  // Eliminar un usuario
  async deleteUser(id: number): Promise<void> {
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
  },

  // Obtener roles disponibles
  async getRoles(): Promise<any[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/roles`, {
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
  }
};