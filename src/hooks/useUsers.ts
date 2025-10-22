import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { User, CreateUserRequest } from '../types/auth';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers();
      setUsers(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserRequest) => {
    try {
      setError(null);
      const newUser = await userService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUser = async (id: number, userData: Partial<CreateUserRequest>) => {
    try {
      setError(null);
      const updatedUser = await userService.updateUser(id, userData);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setError(null);
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
};