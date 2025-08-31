// Tipos de roles de usuario
export type UserRole = 'consultante' | 'estudiante' | 'docente' | 'administrador';

// Tipos de permisos
export type Permission = 
  | 'tramites.create'
  | 'tramites.read'
  | 'tramites.update'
  | 'tramites.delete'
  | 'documentos.upload'
  | 'documentos.download'
  | 'usuarios.manage'
  | 'reportes.generate'
  | 'sistema.config';

// Interfaz de usuario
export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  profile?: UserProfile;
}

// Perfil de usuario
export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  address?: string;
  documentNumber?: string;
  documentType?: 'dni' | 'pasaporte' | 'ce';
  academicInfo?: AcademicInfo;
  preferences?: UserPreferences;
}

// Información académica (para estudiantes y docentes)
export interface AcademicInfo {
  studentId?: string;
  faculty?: string;
  career?: string;
  year?: number;
  semester?: number;
  academicStatus?: 'activo' | 'inactivo' | 'graduado';
}

// Preferencias del usuario
export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: 'es' | 'en';
  theme: 'light' | 'dark';
}

// Estado de autenticación
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token?: string;
}

// Credenciales de login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Respuesta de login
export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Registro de usuario
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  lastName: string;
  role: UserRole;
  documentNumber?: string;
  documentType?: 'dni' | 'pasaporte' | 'ce';
} 