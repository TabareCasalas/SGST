// Configuración de variables de entorno
export const ENV = {
  // Configuración del API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  
  // Configuración de la aplicación
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SGST',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Configuración de autenticación
  AUTH_TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken',
  AUTH_REFRESH_TOKEN_KEY: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'refreshToken',
  
  // Configuración de desarrollo
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Configuración de características
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // Configuración de servicios externos
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
} as const;

// Función helper para validar configuración requerida
export const validateEnv = (): void => {
  const requiredVars = [
    'VITE_API_URL',
  ];
  
  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn(
      'Missing required environment variables:',
      missingVars.join(', ')
    );
  }
};

// Función helper para obtener configuración específica por entorno
export const getConfigByEnv = () => {
  if (ENV.IS_PRODUCTION) {
    return {
      apiUrl: ENV.API_URL,
      enableDebug: false,
      enableAnalytics: ENV.ENABLE_ANALYTICS,
    };
  }
  
  if (ENV.IS_DEVELOPMENT) {
    return {
      apiUrl: ENV.API_URL,
      enableDebug: ENV.ENABLE_DEBUG,
      enableAnalytics: false,
    };
  }
  
  // Configuración por defecto
  return {
    apiUrl: ENV.API_URL,
    enableDebug: true,
    enableAnalytics: false,
  };
};

// Exportar configuración validada
export const config = getConfigByEnv(); 