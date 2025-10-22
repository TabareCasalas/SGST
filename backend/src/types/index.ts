// Tipos para la nueva base de datos SGST

export interface Usuario {
  id_usuario: number;
  nombre: string;
  ci: string;
  domicilio: string;
  telefono: string;
  fecha_alta: Date;
  estado: string;
  correo: string;
  hash_pass: string;
  fecha_ult_login?: Date;
}

export interface Rol {
  id_rol: number;
  nombre: string;
}

export interface UsuarioRol {
  id_usuario: number;
  id_rol: number;
}

export interface Consultante {
  id_consultante: number;
  id_usuario: number;
  est_civil: string;
  nro_padron: number;
}

export interface Estudiante {
  id_estudiante: number;
  id_usuario: number;
  semestre: number;
  id_grupo: number;
}

export interface Docente {
  id_docente: number;
  id_usuario: number;
  tipo_docente: string;
}

export interface Administrativo {
  id_administrativo: number;
  id_usuario: number;
  tipo_funcionario: string;
  nivel: number;
}

export interface Grupo {
  id_grupo: number;
  nombre: string;
}

export interface GrupoEstudiante {
  id_grupo: number;
  id_estudiante: number;
}

export interface GrupoDocente {
  id_grupo: number;
  id_docente: number;
  rol_docente: string;
}

export interface Tramite {
  id_tramite: number;
  id_consultante: number;
  id_grupo: number;
  num_carpeta: number;
  fecha_inicio: Date;
  estado: string;
  observaciones?: string;
  fecha_cierre?: Date;
  motivo_cierre?: string;
}

export interface Adjunto {
  id_adjunto: number;
  id_tramite: number;
  nombre_archivo: string;
  ruta: string;
}

export interface Turno {
  id_turno: number;
  fecha_hora: Date;
  id_admin: number;
}

export interface CasoTurno {
  id_tramite: number;
  id_turno: number;
}

export interface Notificacion {
  id_notificacion: number;
  id_tramite: number;
  mensaje: string;
  fecha_envio: Date;
}

export interface UsuarioNotificacion {
  id_usuario: number;
  id_notificacion: number;
  estado: string;
}

export interface Auditoria {
  id_auditoria: number;
  id_usuario: number;
  id_tramite?: number;
  accion: string;
  fecha: Date;
}

export interface EstudianteTramite {
  id_estudiante: number;
  id_tramite: number;
}

// Tipos para requests/responses
export interface CreateUsuarioRequest {
  nombre: string;
  ci: string;
  domicilio: string;
  telefono: string;
  correo: string;
  password: string;
  roles: (number | string)[];
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
  fecha_cierre?: Date;
  motivo_cierre?: string;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
  roles: Rol[];
}

// Enums
export enum EstadoTramite {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
  RECHAZADO = 'rechazado',
  CANCELADO = 'cancelado'
}

export enum EstadoNotificacion {
  PENDIENTE = 'pendiente',
  LEIDA = 'leída'
}

export enum TipoDocente {
  TITULAR = 'titular',
  ASISTENTE = 'asistente'
}

export enum TipoFuncionario {
  AGENDADOR = 'agendador',
  CONSULTA = 'consulta'
}

