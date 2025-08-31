import { TramiteStatus, TramiteType, TramitePriority } from '../types/tramites';

// Estados de trámites con colores y descripciones
export const TRAMITE_STATUS: Record<TramiteStatus, {
  label: string;
  color: string;
  description: string;
}> = {
  pendiente: {
    label: 'Pendiente',
    color: 'yellow',
    description: 'Trámite creado, esperando revisión inicial',
  },
  en_revision: {
    label: 'En Revisión',
    color: 'blue',
    description: 'Trámite siendo revisado por personal autorizado',
  },
  aprobado: {
    label: 'Aprobado',
    color: 'green',
    description: 'Trámite aprobado, listo para procesamiento',
  },
  rechazado: {
    label: 'Rechazado',
    color: 'red',
    description: 'Trámite rechazado, requiere correcciones',
  },
  completado: {
    label: 'Completado',
    color: 'green',
    description: 'Trámite finalizado exitosamente',
  },
  cancelado: {
    label: 'Cancelado',
    color: 'gray',
    description: 'Trámite cancelado por el usuario o administrador',
  },
};

// Tipos de trámites con descripciones
export const TRAMITE_TYPES: Record<TramiteType, {
  label: string;
  description: string;
  estimatedTime: string;
  requirements: string[];
}> = {
  certificacion: {
    label: 'Certificación',
    description: 'Certificación de documentos y firmas',
    estimatedTime: '2-3 días hábiles',
    requirements: ['Documento original', 'Identificación', 'Formulario de solicitud'],
  },
  legalizacion: {
    label: 'Legalización',
    description: 'Legalización de documentos para uso internacional',
    estimatedTime: '3-5 días hábiles',
    requirements: ['Documento apostillado', 'Traducción oficial', 'Formulario de solicitud'],
  },
  protocolizacion: {
    label: 'Protocolización',
    description: 'Protocolización de contratos y documentos privados',
    estimatedTime: '5-7 días hábiles',
    requirements: ['Documento original', 'Identificación', 'Testigos', 'Formulario de solicitud'],
  },
  testimonio: {
    label: 'Testimonio',
    description: 'Testimonio de declaraciones y actos',
    estimatedTime: '1-2 días hábiles',
    requirements: ['Identificación', 'Formulario de solicitud', 'Documentos de respaldo'],
  },
  poder: {
    label: 'Poder',
    description: 'Otorgamiento de poderes notariales',
    estimatedTime: '2-3 días hábiles',
    requirements: ['Identificación', 'Formulario de solicitud', 'Documentos de respaldo'],
  },
  contrato: {
    label: 'Contrato',
    description: 'Autenticación de contratos privados',
    estimatedTime: '3-4 días hábiles',
    requirements: ['Contrato original', 'Identificación', 'Testigos', 'Formulario de solicitud'],
  },
  declaracion: {
    label: 'Declaración',
    description: 'Declaraciones juradas y manifestaciones',
    estimatedTime: '1-2 días hábiles',
    requirements: ['Identificación', 'Formulario de solicitud'],
  },
  otro: {
    label: 'Otro',
    description: 'Otros tipos de trámites notariales',
    estimatedTime: 'Variable',
    requirements: ['Documentos según el caso'],
  },
};

// Prioridades de trámites
export const TRAMITE_PRIORITIES: Record<TramitePriority, {
  label: string;
  color: string;
  description: string;
  multiplier: number;
}> = {
  baja: {
    label: 'Baja',
    color: 'gray',
    description: 'Sin urgencia especial',
    multiplier: 1.0,
  },
  normal: {
    label: 'Normal',
    color: 'blue',
    description: 'Prioridad estándar',
    multiplier: 1.0,
  },
  alta: {
    label: 'Alta',
    color: 'orange',
    description: 'Requiere atención prioritaria',
    multiplier: 0.7,
  },
  urgente: {
    label: 'Urgente',
    color: 'red',
    description: 'Máxima prioridad',
    multiplier: 0.5,
  },
};

// Estados de documentos
export const DOCUMENT_STATUS = {
  pending: {
    label: 'Pendiente',
    color: 'yellow',
    description: 'Documento subido, esperando verificación',
  },
  verified: {
    label: 'Verificado',
    color: 'green',
    description: 'Documento verificado y aprobado',
  },
  rejected: {
    label: 'Rechazado',
    color: 'red',
    description: 'Documento rechazado, requiere corrección',
  },
  expired: {
    label: 'Expirado',
    color: 'gray',
    description: 'Documento expirado, requiere renovación',
  },
} as const;

// Tipos de documentos aceptados
export const ACCEPTED_DOCUMENT_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg, .jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
} as const;

// Tamaño máximo de archivo (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes

// Función helper para obtener el color de un estado
export const getStatusColor = (status: TramiteStatus): string => {
  return TRAMITE_STATUS[status].color;
};

// Función helper para obtener la etiqueta de un estado
export const getStatusLabel = (status: TramiteStatus): string => {
  return TRAMITE_STATUS[status].label;
};

// Función helper para obtener la descripción de un estado
export const getStatusDescription = (status: TramiteStatus): string => {
  return TRAMITE_STATUS[status].description;
}; 