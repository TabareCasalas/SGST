import type { UserRole, Permission } from '../types/auth';

// Definición de roles
export const ROLES: Record<UserRole, string> = {
  consultante: 'Consultante',
  estudiante: 'Estudiante',
  docente: 'Docente',
  administrador: 'Administrador',
};

// Descripción de roles
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  consultante: 'Usuario que puede crear y gestionar trámites notariales',
  estudiante: 'Estudiante de la facultad con acceso a trámites académicos',
  docente: 'Docente con permisos para revisar expedientes estudiantiles',
  administrador: 'Administrador del sistema con acceso completo',
};

// Permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  consultante: [
    'tramites.create',
    'tramites.read',
    'tramites.update',
    'documentos.upload',
    'documentos.download',
  ],
  estudiante: [
    'tramites.create',
    'tramites.read',
    'tramites.update',
    'documentos.upload',
    'documentos.download',
  ],
  docente: [
    'tramites.create',
    'tramites.read',
    'tramites.update',
    'tramites.delete',
    'documentos.upload',
    'documentos.download',
    'reportes.generate',
  ],
  administrador: [
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
};

// Permisos disponibles
export const PERMISSIONS: Record<Permission, string> = {
  'tramites.create': 'Crear trámites',
  'tramites.read': 'Ver trámites',
  'tramites.update': 'Editar trámites',
  'tramites.delete': 'Eliminar trámites',
  'documentos.upload': 'Subir documentos',
  'documentos.download': 'Descargar documentos',
  'usuarios.manage': 'Gestionar usuarios',
  'reportes.generate': 'Generar reportes',
  'sistema.config': 'Configurar sistema',
};

// Función helper para verificar permisos
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(permission);
};

// Función helper para verificar múltiples permisos
export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Función helper para verificar todos los permisos
export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
}; 