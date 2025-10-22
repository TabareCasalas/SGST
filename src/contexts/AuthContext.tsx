import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, LoginCredentials, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const isAuthenticated = !!user && !!token;

  // Verificar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      const storedUser = localStorage.getItem('user');
      const storedRoles = localStorage.getItem('userRoles');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          const userData = JSON.parse(storedUser);
          const rolesData = storedRoles ? JSON.parse(storedRoles) : [];
          setUser({ ...userData, roles: rolesData });
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Limpiar datos corruptos
          authService.logout();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        // Mapear los campos del backend a nuestros tipos
        const userData = {
          ...response.data.usuario,
          id: response.data.usuario.id_usuario,
          fecha_registro: response.data.usuario.fecha_alta
        };
        setUser(userData);
        setToken(response.data.token);
        
        // Almacenar datos en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRoles', JSON.stringify(response.data.roles));
        
        console.log('Login successful, token stored:', response.data.token ? 'Yes' : 'No');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const checkPermission = (permission: string): boolean => {
    if (!user || !user.roles) return false;
    
    // Mapeo de roles a permisos
    const rolePermissions: Record<string, string[]> = {
      'Administrador': [
        'tramites.create', 'tramites.read', 'tramites.update', 'tramites.delete',
        'usuarios.manage', 'reportes.generate', 'sistema.config', 'auditoria.view'
      ],
      'Consultor': [
        'tramites.create', 'tramites.read', 'tramites.update',
        'adjuntos.upload', 'adjuntos.download', 'notificaciones.send'
      ],
      'Docente': [
        'tramites.read', 'tramites.update',
        'adjuntos.upload', 'adjuntos.download'
      ],
      'Estudiante': [
        'tramites.read',
        'adjuntos.upload'
      ],
      'Administrativo': [
        'tramites.read', 'tramites.update',
        'turnos.manage', 'notificaciones.send'
      ]
    };

    return user.roles.some(role => 
      rolePermissions[role.nombre]?.includes(permission)
    );
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    token: token || undefined,
    login,
    logout,
    checkPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};