import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'admin' | 'docente' | 'estudiante' | 'consultante';

export interface AuthUser {
  id_usuario: number;
  nombre: string;
  ci: string;
  correo: string;
  rol: UserRole;
  nivel_acceso?: number; // 1=admin_administrativo, 2=admin_docente, 3=admin_sistema
  activo: boolean;
  semestre?: string;
  id_grupo?: number;
  grupo?: {
    nombre: string;
  };
  grupos_participa?: Array<{
    id_grupo: number;
    rol_en_grupo: string;
    grupo: {
      id_grupo: number;
      nombre: string;
    };
  }>;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (ci: string, password?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasAccessLevel: (minLevel: number) => boolean;
  isAdminSistema: () => boolean;
  isAdminDocente: () => boolean;
  isAdminAdministrativo: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (ci: string, _password?: string) => {
    try {
      // Por ahora, simulamos login con CI
      // TODO: Implementar autenticación real con backend
      const response = await fetch(`http://localhost:3001/api/usuarios?search=${ci}`);
      if (!response.ok) throw new Error('Error al buscar usuario');
      
      const usuarios = await response.json();
      const foundUser = usuarios.find((u: any) => u.ci === ci);
      
      if (!foundUser) {
        throw new Error('Usuario no encontrado');
      }

      if (!foundUser.activo) {
        throw new Error('Usuario inactivo');
      }

      // Mapear rol del usuario
      const authUser: AuthUser = {
        id_usuario: foundUser.id_usuario,
        nombre: foundUser.nombre,
        ci: foundUser.ci,
        correo: foundUser.correo,
        rol: mapRolToUserRole(foundUser.rol),
        nivel_acceso: foundUser.nivel_acceso || undefined,
        activo: foundUser.activo,
        semestre: foundUser.semestre,
        id_grupo: foundUser.id_grupo,
        grupo: foundUser.grupo,
        grupos_participa: foundUser.grupos_participa || [],
      };

      setUser(authUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(authUser));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.rol);
  };

  const hasAccessLevel = (minLevel: number): boolean => {
    if (!user || user.rol !== 'admin') return false;
    return (user.nivel_acceso || 0) >= minLevel;
  };

  const isAdminSistema = (): boolean => {
    return user?.rol === 'admin' && user?.nivel_acceso === 3;
  };

  const isAdminDocente = (): boolean => {
    return user?.rol === 'admin' && user?.nivel_acceso === 2;
  };

  const isAdminAdministrativo = (): boolean => {
    return user?.rol === 'admin' && user?.nivel_acceso === 1;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      hasRole, 
      hasAccessLevel,
      isAdminSistema,
      isAdminDocente,
      isAdminAdministrativo
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper para mapear roles del backend a roles de la app
function mapRolToUserRole(rol: string): UserRole {
  switch (rol) {
    case 'administrador':
      return 'admin';
    case 'docente':
      return 'docente';
    case 'estudiante':
      return 'estudiante';
    case 'consultante':
      return 'consultante';
    default:
      return 'consultante';
  }
}
