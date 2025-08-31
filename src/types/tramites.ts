// Tipos de trámites notariales
export type TramiteType = 
  | 'certificacion'
  | 'legalizacion'
  | 'protocolizacion'
  | 'testimonio'
  | 'poder'
  | 'contrato'
  | 'declaracion'
  | 'otro';

// Estados de trámites
export type TramiteStatus = 
  | 'pendiente'
  | 'en_revision'
  | 'aprobado'
  | 'rechazado'
  | 'completado'
  | 'cancelado';

// Prioridades de trámites
export type TramitePriority = 'baja' | 'normal' | 'alta' | 'urgente';

// Interfaz de trámite
export interface Tramite {
  id: string;
  type: TramiteType;
  title: string;
  description: string;
  status: TramiteStatus;
  priority: TramitePriority;
  userId: string;
  assignedTo?: string;
  documents: Document[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedCompletion?: string;
  requirements: Requirement[];
  fees?: Fee[];
}

// Requisitos del trámite
export interface Requirement {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  documentType?: string;
  completedAt?: string;
  completedBy?: string;
}

// Documento
export interface Document {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  version: number;
}

// Comentario en trámite
export interface Comment {
  id: string;
  tramiteId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isInternal: boolean;
}

// Tarifa
export interface Fee {
  id: string;
  name: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  paidAt?: string;
  paymentMethod?: string;
}

// Filtros para búsqueda de trámites
export interface TramiteFilters {
  type?: TramiteType;
  status?: TramiteStatus;
  priority?: TramitePriority;
  dateFrom?: string;
  dateTo?: string;
  assignedTo?: string;
  search?: string;
}

// Datos para crear trámite
export interface CreateTramiteData {
  type: TramiteType;
  title: string;
  description: string;
  priority: TramitePriority;
  requirements: Omit<Requirement, 'id' | 'isCompleted' | 'completedAt' | 'completedBy'>[];
}

// Datos para actualizar trámite
export interface UpdateTramiteData {
  title?: string;
  description?: string;
  status?: TramiteStatus;
  priority?: TramitePriority;
  assignedTo?: string;
  estimatedCompletion?: string;
}

// Estadísticas de trámites
export interface TramiteStats {
  total: number;
  byStatus: Record<TramiteStatus, number>;
  byType: Record<TramiteType, number>;
  byPriority: Record<TramitePriority, number>;
  averageCompletionTime: number;
  completionRate: number;
} 