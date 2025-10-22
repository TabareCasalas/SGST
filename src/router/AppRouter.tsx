import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import LoginForm from '../components/Auth/LoginForm';
import Dashboard from '../screens/Dashboard';
import Tramites from '../screens/Tramites';
import Usuarios from '../screens/Usuarios';
import type { ReactNode } from 'react';

// Componente para rutas protegidas
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente principal del router
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de login */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
            <Route
              path="/tramites"
              element={
                <ProtectedRoute>
                  <Tramites />
                </ProtectedRoute>
              }
            />
        
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;