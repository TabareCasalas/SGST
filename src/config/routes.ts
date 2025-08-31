// Configuración de rutas de la aplicación
export const ROUTES = {
  // Rutas públicas
  PUBLIC: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  
  // Rutas privadas
  PRIVATE: {
    HOME: '/',
    DASHBOARD: '/dashboard',
    USERS: '/users',
    REPORTS: '/reports',
    SETTINGS: '/settings',
    PROFILE: '/profile',
  },
  
  // Rutas de administración
  ADMIN: {
    ADMIN_DASHBOARD: '/admin',
    USER_MANAGEMENT: '/admin/users',
    SYSTEM_SETTINGS: '/admin/settings',
    LOGS: '/admin/logs',
  },
} as const;

// Tipos para las rutas
export type PublicRoute = typeof ROUTES.PUBLIC[keyof typeof ROUTES.PUBLIC];
export type PrivateRoute = typeof ROUTES.PRIVATE[keyof typeof ROUTES.PRIVATE];
export type AdminRoute = typeof ROUTES.ADMIN[keyof typeof ROUTES.ADMIN];

// Configuración de navegación
export const NAVIGATION = {
  MAIN: [
    {
      label: 'Inicio',
      path: ROUTES.PRIVATE.HOME,
      icon: 'home',
    },
    {
      label: 'Dashboard',
      path: ROUTES.PRIVATE.DASHBOARD,
      icon: 'dashboard',
    },
    {
      label: 'Usuarios',
      path: ROUTES.PRIVATE.USERS,
      icon: 'users',
    },
    {
      label: 'Reportes',
      path: ROUTES.PRIVATE.REPORTS,
      icon: 'reports',
    },
  ],
  
  ADMIN: [
    {
      label: 'Panel de Administración',
      path: ROUTES.ADMIN.ADMIN_DASHBOARD,
      icon: 'admin',
    },
    {
      label: 'Gestión de Usuarios',
      path: ROUTES.ADMIN.USER_MANAGEMENT,
      icon: 'user-management',
    },
    {
      label: 'Configuración del Sistema',
      path: ROUTES.ADMIN.SYSTEM_SETTINGS,
      icon: 'settings',
    },
    {
      label: 'Logs',
      path: ROUTES.ADMIN.LOGS,
      icon: 'logs',
    },
  ],
  
  USER: [
    {
      label: 'Perfil',
      path: ROUTES.PRIVATE.PROFILE,
      icon: 'profile',
    },
    {
      label: 'Configuración',
      path: ROUTES.PRIVATE.SETTINGS,
      icon: 'settings',
    },
  ],
} as const;

// Función helper para construir URLs con parámetros
export const buildUrl = (basePath: string, params?: Record<string, string>): string => {
  if (!params) return basePath;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value);
  });
  
  return `${basePath}?${searchParams.toString()}`;
};

// Función helper para verificar si una ruta es pública
export const isPublicRoute = (path: string): boolean => {
  return Object.values(ROUTES.PUBLIC).includes(path as PublicRoute);
};

// Función helper para verificar si una ruta es de administración
export const isAdminRoute = (path: string): boolean => {
  return Object.values(ROUTES.ADMIN).includes(path as AdminRoute);
}; 