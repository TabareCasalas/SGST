// Tipos actualizados para autenticación con la nueva base de datos

// Tipos de roles de usuario (actualizados)
export type UserRole = 'Administrador' | 'Consultor' | 'Estudiante' | 'Docente' | 'Administrativo';

// Tipos de permisos
export type Permission = 
  | 'tramites.create'
  | 'tramites.read'
  | 'tramites.update'
  | 'tramites.delete'
  | 'adjuntos.upload'
  | 'adjuntos.download'
  | 'usuarios.manage'
  | 'reportes.generate'
  | 'sistema.config'
  | 'turnos.manage'
  | 'notificaciones.send'
  | 'auditoria.view';

// Interfaz de usuario (actualizada)
export interface User {
  id: number;
  nombre: string;
  ci: string;
  domicilio: string;
  telefono: string;
  fecha_registro: string;
  estado: string;
  correo: string;
  fecha_ult_login?: string;
  roles?: Rol[];
  consultante?: Consultante;
  estudiante?: Estudiante;
  docente?: Docente;
  administrativo?: Administrativo;
}

// Interfaz de Rol
export interface Rol {
  id: number;
  nombre: string;
}

// Interfaz de Consultante
export interface Consultante {
  id_consultante: number;
  id_usuario: number;
  est_civil: string;
  nro_padron: number;
  usuario?: User;
}

// Interfaz de Estudiante
export interface Estudiante {
  id_estudiante: number;
  id_usuario: number;
  semestre: number;
  id_grupo: number;
  usuario?: User;
  grupo?: Grupo;
}

// Interfaz de Docente
export interface Docente {
  id_docente: number;
  id_usuario: number;
  tipo_docente: string;
  usuario?: User;
}

// Interfaz de Administrativo
export interface Administrativo {
  id_administrativo: number;
  id_usuario: number;
  tipo_funcionario: string;
  nivel: number;
  usuario?: User;
}

// Interfaz de Grupo
export interface Grupo {
  id_grupo: number;
  nombre: string;
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
  correo: string;
  password: string;
}

// Respuesta de login
export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    usuario: User;
    roles: Rol[];
  };
  error?: string;
}

// Registro de usuario
export interface RegisterData {
  nombre: string;
  ci: string;
  domicilio: string;
  telefono: string;
  correo: string;
  password: string;
  roles: number[];
}

// Crear usuario
export interface CreateUserRequest {
  nombre: string;
  ci: string;
  domicilio: string;
  telefono: string;
  correo: string;
  password: string;
  roles: string[];
}

// Respuesta de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para trámites
export interface Tramite {
  id: number;
  id_consultante: number;
  id_grupo: number;
  num_carpeta: number;
  fecha_inicio: string;
  estado: string;
  observaciones?: string;
  fecha_cierre?: string;
  motivo_cierre?: string;
  consultante?: {
    id_consultante: number;
    id_usuario: number;
    est_civil: string;
    nro_padron: number;
    usuario?: {
      id_usuario: number;
      nombre: string;
      ci: string;
      domicilio: string;
      telefono: string;
      correo: string;
    };
  };
  grupo?: {
    id_grupo: number;
    nombre: string;
  };
}

export interface CreateTramiteRequest {
  id_consultante: number;
  id_grupo: number;
  num_carpeta: number;
  observaciones?: string;
}

export interface UpdateTramiteRequest {
  estado?: string;
  observaciones?: string;
  fecha_cierre?: string;
  motivo_cierre?: string;
}

export interface TramiteStats {
  total: number;
  pendientes: number;
  en_proceso: number;
  completados: number;
  cancelados: number;
}