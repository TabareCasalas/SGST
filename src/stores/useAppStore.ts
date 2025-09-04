import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Tipos para el store
export interface Tramite {
  id: string;
  type: string;
  applicant: string;
  status: string;
  description: string;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

// Estado del store
interface AppState {
  // Estado de UI
  currentScreen: string;
  showTramiteForm: boolean;
  showUsuarioForm: boolean;
  showReportGenerator: boolean;
  showDocumentUpload: boolean;
  
  // Datos
  tramites: Tramite[];
  usuarios: Usuario[];
  notifications: Notification[];
  
  // Acciones de UI
  setCurrentScreen: (screen: string) => void;
  setShowTramiteForm: (show: boolean) => void;
  setShowUsuarioForm: (show: boolean) => void;
  setShowReportGenerator: (show: boolean) => void;
  setShowDocumentUpload: (show: boolean) => void;
  
  // Acciones de datos
  addTramite: (tramite: Omit<Tramite, 'id'>) => void;
  updateTramite: (id: string, updates: Partial<Tramite>) => void;
  deleteTramite: (id: string) => void;
  
  addUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  updateUsuario: (id: number, updates: Partial<Usuario>) => void;
  deleteUsuario: (id: number) => void;
  
  // Acciones de notificaciones
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Store principal
export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      currentScreen: 'home',
      showTramiteForm: false,
      showUsuarioForm: false,
      showReportGenerator: false,
      showDocumentUpload: false,
      
      // Datos iniciales
      tramites: [
        { 
          id: 'TR-001', 
          type: 'Certificación', 
          applicant: 'Juan Pérez', 
          status: 'pendiente', 
          description: 'Certificación de documentos académicos',
          priority: 'normal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'TR-002', 
          type: 'Apostilla', 
          applicant: 'María García', 
          status: 'en_proceso', 
          description: 'Apostilla de título universitario',
          priority: 'alta',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'TR-003', 
          type: 'Protocolización', 
          applicant: 'Carlos López', 
          status: 'completado', 
          description: 'Protocolización de contrato',
          priority: 'urgente',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'TR-004', 
          type: 'Certificación', 
          applicant: 'Ana Rodríguez', 
          status: 'rechazado', 
          description: 'Certificación de documentos personales',
          priority: 'normal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
      ],
      
      usuarios: [
        { 
          id: 1, 
          name: 'Juan Pérez', 
          email: 'juan@test.com', 
          role: 'estudiante', 
          phone: '123-456-7890',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 2, 
          name: 'María García', 
          email: 'maria@test.com', 
          role: 'docente', 
          phone: '234-567-8901',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 3, 
          name: 'Carlos López', 
          email: 'carlos@test.com', 
          role: 'consultante', 
          phone: '345-678-9012',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 4, 
          name: 'Ana Rodríguez', 
          email: 'ana@test.com', 
          role: 'administrador', 
          phone: '456-789-0123',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
      ],
      
      notifications: [],
      
      // Acciones de UI
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setShowTramiteForm: (show) => set({ showTramiteForm: show }),
      setShowUsuarioForm: (show) => set({ showUsuarioForm: show }),
      setShowReportGenerator: (show) => set({ showReportGenerator: show }),
      setShowDocumentUpload: (show) => set({ showDocumentUpload: show }),
      
      // Acciones de trámites
      addTramite: (tramiteData) => {
        const newTramite: Tramite = {
          ...tramiteData,
          id: `TR-${String(get().tramites.length + 1).padStart(3, '0')}`,
          status: 'pendiente',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({ 
          tramites: [...state.tramites, newTramite] 
        }));
      },
      
      updateTramite: (id, updates) => {
        set((state) => ({
          tramites: state.tramites.map((tramite) =>
            tramite.id === id
              ? { ...tramite, ...updates, updatedAt: new Date().toISOString() }
              : tramite
          )
        }));
      },
      
      deleteTramite: (id) => {
        set((state) => ({
          tramites: state.tramites.filter((tramite) => tramite.id !== id)
        }));
      },
      
      // Acciones de usuarios
      addUsuario: (usuarioData) => {
        const newUsuario: Usuario = {
          ...usuarioData,
          id: Math.max(...get().usuarios.map(u => u.id), 0) + 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({ 
          usuarios: [...state.usuarios, newUsuario] 
        }));
      },
      
      updateUsuario: (id, updates) => {
        set((state) => ({
          usuarios: state.usuarios.map((usuario) =>
            usuario.id === id
              ? { ...usuario, ...updates, updatedAt: new Date().toISOString() }
              : usuario
          )
        }));
      },
      
      deleteUsuario: (id) => {
        set((state) => ({
          usuarios: state.usuarios.filter((usuario) => usuario.id !== id)
        }));
      },
      
      // Acciones de notificaciones
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        set((state) => ({ 
          notifications: [...state.notifications, newNotification] 
        }));
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((notification) => notification.id !== id)
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'app-store', // nombre para devtools
    }
  )
);