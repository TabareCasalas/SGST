import React from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthContext } from './AuthContextDef';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  // Wrapper para mantener la compatibilidad con la interfaz esperada
  const loginWrapper = async (email: string) => {
    return auth.login(email);
  };

  const contextValue = {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login: loginWrapper,
    logout: auth.logout,
    checkPermission: auth.checkPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 