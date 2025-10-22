import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { LoginCredentials } from '../../types/auth';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    correo: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        // Guardar datos del usuario en localStorage para el contexto
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
        localStorage.setItem('userRoles', JSON.stringify(response.data.roles));
        
        onLoginSuccess?.();
        navigate('/');
      } else {
        setError(response.error || 'Error en el login');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el backend esté ejecutándose.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema de Gestión de Trámites
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            SGST - Facultad de Derecho
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                required
                value={credentials.correo}
                onChange={handleInputChange}
                placeholder="admin@sgst.com"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="password123"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Credenciales de prueba:
            </p>
            <div className="text-xs text-gray-400 mt-1 space-y-1">
              <p>Admin: admin@sgst.com / password123</p>
              <p>Consultor: consultor@sgst.com / password123</p>
              <p>Estudiante: juan.perez@estudiante.com / password123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

