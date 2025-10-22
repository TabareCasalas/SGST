import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthContext();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: '🏠',
      description: 'Resumen del sistema'
    },
        {
          name: 'Trámites',
          path: '/tramites',
          icon: '📋',
          description: 'Gestión de trámites'
        },
    {
      name: 'Usuarios',
      path: '/usuarios',
      icon: '👥',
      description: 'Gestión de usuarios'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen">
      {/* Logo y título */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">SG</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">SGST</h1>
            <p className="text-xs text-gray-500">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {user?.nombre?.charAt(0)}
            </span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.nombre}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.correo}
            </p>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <div className="flex-1">
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botón de logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="text-lg mr-3">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
