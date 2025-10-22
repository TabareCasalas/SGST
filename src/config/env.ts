// Configuración de entorno
export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SGST - Sistema de Gestión de Trámites',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
};

// Exportar API_BASE_URL para compatibilidad
export const API_BASE_URL = config.API_URL;