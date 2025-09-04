import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Tipo de usuario simplificado
interface SimpleUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: SimpleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Verificando usuario guardado...');
    
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('sgst_user');
    console.log('AuthProvider: Usuario guardado:', savedUser);
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('AuthProvider: Usuario parseado:', parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('AuthProvider: Error parsing saved user:', error);
        localStorage.removeItem('sgst_user');
      }
    }
    
    // Simular carga inicial
    const timer = setTimeout(() => {
      console.log('AuthProvider: Carga inicial completada');
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('AuthProvider: Intentando login con:', email);
      
      // Crear usuario simplificado
      const simpleUser: SimpleUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'administrador' : 'estudiante'
      };
      
      console.log('AuthProvider: Usuario creado:', simpleUser);
      
      setUser(simpleUser);
      setIsAuthenticated(true);
      
      // Guardar usuario en localStorage
      localStorage.setItem('sgst_user', JSON.stringify(simpleUser));
      console.log('AuthProvider: Usuario guardado en localStorage');
      
      return { success: true };
    } catch (error) {
      console.error('AuthProvider: Error en login:', error);
      return { success: false, error: 'Error de login' };
    }
  };

  const logout = () => {
    console.log('AuthProvider: Cerrando sesión...');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sgst_user');
  };

  const checkPermission = (permission: string): boolean => {
    // Implementación simple
    return user?.role === 'administrador' || false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkPermission
  };

  console.log('AuthProvider: Estado actual:', { user, isAuthenticated, isLoading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
