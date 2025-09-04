import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useAuthContext } from '../contexts/AuthContext.simple';

const Login: React.FC = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const result = await login(formData.email);
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ general: result.error || 'Error de autenticación' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema de Gestión Notarial
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Facultad de Derecho
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            
            <Input
              type="password"
              name="password"
              label="Contraseña"
              placeholder="Tu contraseña"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Usuarios de Prueba
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Administrador:</strong> admin@test.com</p>
              <p><strong>Docente:</strong> docente@test.com</p>
              <p><strong>Estudiante:</strong> estudiante@test.com</p>
              <p><strong>Consultante:</strong> consultante@test.com</p>
              <p className="text-xs mt-2">Cualquier contraseña de 6+ caracteres</p>
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
          >
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login; 