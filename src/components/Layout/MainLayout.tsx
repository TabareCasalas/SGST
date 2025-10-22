import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext.simple';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../UI/NotificationContainer';
import Navbar from './Navbar';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuthContext();
  const { notifications, removeNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar 
        user={user}
        currentPath={location.pathname}
        onLogout={handleLogout}
        // onNavigate={handleNavigate} // Comentado para evitar error
      />
      
      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      {/* Notificaciones */}
      <NotificationContainer 
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
    </div>
  );
};

export default MainLayout;