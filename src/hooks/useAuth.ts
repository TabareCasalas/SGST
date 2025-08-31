import { useState, useEffect } from 'react';
import type { User, AuthState, Permission } from '../types/auth';
import { hasPermission } from '../constants/roles';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Simular verificación de token al cargar
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Aquí normalmente validarías el token con el backend
      // Por ahora simulamos un usuario administrador para pruebas
      const mockUser: User = {
        id: '1',
        email: 'admin@facultad.edu',
        name: 'Administrador',
        lastName: 'Sistema',
        role: 'administrador',
        permissions: [
          'tramites.create',
          'tramites.read',
          'tramites.update',
          'tramites.delete',
          'documentos.upload',
          'documentos.download',
          'usuarios.manage',
          'reportes.generate',
          'sistema.config',
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        token
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Aquí normalmente harías la llamada al API
      // Simulamos un delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular diferentes usuarios según el email
      let mockUser: User;
      
      if (email.includes('admin')) {
        mockUser = {
          id: '1',
          email,
          name: 'Administrador',
          lastName: 'Sistema',
          role: 'administrador',
          permissions: [
            'tramites.create',
            'tramites.read',
            'tramites.update',
            'tramites.delete',
            'documentos.upload',
            'documentos.download',
            'usuarios.manage',
            'reportes.generate',
            'sistema.config',
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else if (email.includes('docente')) {
        mockUser = {
          id: '2',
          email,
          name: 'Docente',
          lastName: 'Ejemplo',
          role: 'docente',
          permissions: [
            'tramites.create',
            'tramites.read',
            'tramites.update',
            'tramites.delete',
            'documentos.upload',
            'documentos.download',
            'reportes.generate',
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else if (email.includes('estudiante')) {
        mockUser = {
          id: '3',
          email,
          name: 'Estudiante',
          lastName: 'Ejemplo',
          role: 'estudiante',
          permissions: [
            'tramites.create',
            'tramites.read',
            'tramites.update',
            'documentos.upload',
            'documentos.download',
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        mockUser = {
          id: '4',
          email,
          name: 'Consultante',
          lastName: 'Ejemplo',
          role: 'consultante',
          permissions: [
            'tramites.create',
            'tramites.read',
            'tramites.update',
            'documentos.upload',
            'documentos.download',
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      
      const token = 'mock-token-' + Date.now();
      localStorage.setItem('authToken', token);
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        token
      });
      
      return { success: true };
    } catch {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Error de autenticación' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  // Función helper para verificar permisos
  const checkPermission = (permission: string): boolean => {
    if (!authState.user) return false;
    return hasPermission(authState.user.role, permission as Permission);
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
    checkPermission,
  };
}; 