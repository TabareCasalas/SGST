import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../UI/Button';
import type { User } from '../../types/auth';

interface NavbarProps {
  user: User | null;
  currentPath: string;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user,
  currentPath,
  onLogout,
  onNavigate
}) => {
  const isAuthenticated = !!user;
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              to="/"
              className="text-xl font-bold text-gray-900 hover:text-blue-600"
            >
              SGST
            </Link>
          </div>
          
          {/* Navegación para usuarios autenticados */}
          {isAuthenticated && (
            <div className="flex items-center space-x-6">
              <Link 
                to="/tramites"
                className={`text-sm font-medium transition-colors ${
                  currentPath === '/tramites' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Trámites
              </Link>
              
              {user?.role === 'administrador' && (
                <>
                  <Link 
                    to="/usuarios"
                    className={`text-sm font-medium transition-colors ${
                      currentPath === '/usuarios' 
                        ? 'text-blue-600' 
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Usuarios
                  </Link>
                  <Link 
                    to="/admin"
                    className={`text-sm font-medium transition-colors ${
                      currentPath === '/admin' 
                        ? 'text-blue-600' 
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Admin
                  </Link>
                </>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">
                  Bienvenido, {user?.name}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onLogout}
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 