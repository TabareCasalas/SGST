import React from 'react';
import Button from '../UI/Button';

interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onNavigate?: (screen: string) => void;
  currentScreen?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isAuthenticated = false, 
  onLogout,
  onNavigate,
  currentScreen
}) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => onNavigate?.('home')}
            >
              SGST
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">Bienvenido</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onLogout}
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm">
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 