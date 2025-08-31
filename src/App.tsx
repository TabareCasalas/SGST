import React, { useState, useEffect } from 'react';
import './App.css';

// Componente de prueba simple
const TestApp: React.FC<{ 
  onShowTramiteForm?: () => void;
  onShowUsuarioForm?: () => void;
  onAddTramite?: (tramite: any) => void;
  onDeleteTramite?: (id: string) => void;
  tramites?: any[];
}> = ({ onShowTramiteForm, onShowUsuarioForm, onAddTramite, onDeleteTramite, tramites: globalTramites }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showTramiteForm, setShowTramiteForm] = useState(false);
  const [showUsuarioForm, setShowUsuarioForm] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  
  // Hooks personalizados - versión simplificada
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const showSuccess = (title: string, message: string) => {
    console.log('Success:', title, message);
  };
  
  const showError = (title: string, message: string) => {
    console.log('Error:', title, message);
  };
  
  const showInfo = (title: string, message: string) => {
    console.log('Info:', title, message);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  const [tramites, setTramites] = useState(globalTramites || [
    { id: 'TR-001', type: 'Certificación', applicant: 'Juan Pérez', status: 'pendiente', description: 'Certificación de documentos académicos' },
    { id: 'TR-002', type: 'Apostilla', applicant: 'María García', status: 'en_proceso', description: 'Apostilla de título universitario' },
    { id: 'TR-003', type: 'Protocolización', applicant: 'Carlos López', status: 'completado', description: 'Protocolización de contrato' },
    { id: 'TR-004', type: 'Certificación', applicant: 'Ana Rodríguez', status: 'rechazado', description: 'Certificación de documentos personales' },
  ]);
  const [usuarios, setUsuarios] = useState([
    { id: 1, name: 'Juan Pérez', email: 'juan@test.com', role: 'estudiante', phone: '123-456-7890' },
    { id: 2, name: 'María García', email: 'maria@test.com', role: 'docente', phone: '234-567-8901' },
    { id: 3, name: 'Carlos López', email: 'carlos@test.com', role: 'consultante', phone: '345-678-9012' },
    { id: 4, name: 'Ana Rodríguez', email: 'ana@test.com', role: 'administrador', phone: '456-789-0123' },
  ]);

  // Debugging useEffect
  useEffect(() => {
    console.log('showUsuarioForm cambió a:', showUsuarioForm);
  }, [showUsuarioForm]);


  const handleLogin = () => {
    // Simulación de login - en un caso real esto sería una llamada a la API
    if (loginData.email && loginData.password) {
      // Simular diferentes roles basados en el email
      let role = 'estudiante';
      if (loginData.email.includes('admin')) role = 'administrador';
      else if (loginData.email.includes('docente')) role = 'docente';
      else if (loginData.email.includes('consultante')) role = 'consultante';

      setUser({
        name: loginData.email.split('@')[0],
        email: loginData.email,
        role: role
      });
      setIsAuthenticated(true);
      setShowLogin(false);
      setLoginData({ email: '', password: '' });
      showSuccess('Inicio de sesión exitoso', `Bienvenido, ${loginData.email.split('@')[0]}!`);
    } else {
      showError('Error de autenticación', 'Por favor, ingresa email y contraseña válidos.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentScreen('home');
    setShowLogin(false);
    setShowTramiteForm(false);
    setShowUsuarioForm(false);
    setShowReportGenerator(false);
    setShowDocumentUpload(false);
    setLoginData({ email: '', password: '' });
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleAddTramite = (newTramite: any) => {
    const id = `TR-${String(tramites.length + 1).padStart(3, '0')}`;
    const tramiteWithId = { ...newTramite, id, status: 'pendiente' };
    if (onAddTramite) {
      onAddTramite(tramiteWithId);
    } else {
      setTramites([...tramites, tramiteWithId]);
    }
    setShowTramiteForm(false);
  };

  const handleAddUsuario = (newUsuario: any) => {
    // Validar que el email no esté duplicado
    const emailExists = usuarios.some(user => user.email.toLowerCase() === newUsuario.email.toLowerCase());
    if (emailExists) {
      showError('Error al crear usuario', 'El email ya está registrado en el sistema');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUsuario.email)) {
      showError('Error de validación', 'Por favor, ingresa un email válido');
      return;
    }

    // Validar que el nombre tenga al menos 2 palabras
    const nameWords = newUsuario.name.trim().split(' ').filter(word => word.length > 0);
    if (nameWords.length < 2) {
      showError('Error de validación', 'Por favor, ingresa nombre y apellido');
      return;
    }

    // Generar ID único
    const id = Math.max(...usuarios.map(u => u.id), 0) + 1;
    
    // Crear el nuevo usuario
    const newUser = {
      ...newUsuario,
      id,
      createdAt: new Date().toISOString(),
      status: 'activo'
    };

    // Agregar a la lista
    setUsuarios([...usuarios, newUser]);
    setShowUsuarioForm(false);
    
    // Mostrar notificación de éxito
    showSuccess('Usuario creado exitosamente', `Se ha creado el usuario ${newUsuario.name} con rol ${newUsuario.role}`);
  };

  const handleCancelTramiteForm = () => {
    setShowTramiteForm(false);
  };

  const handleCancelUsuarioForm = () => {
    setShowUsuarioForm(false);
  };

  const handleDeleteTramite = (id: string) => {
    if (onDeleteTramite) {
      onDeleteTramite(id);
    } else {
      setTramites(tramites.filter(t => t.id !== id));
    }
  };

  const handleDeleteUsuario = (id: number) => {
    setUsuarios(usuarios.filter(u => u.id !== id));
  };

  // Componente de formulario para trámites
  const TramiteForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      type: '',
      applicant: '',
      description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.type && formData.applicant && formData.description) {
        onSubmit(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Trámite
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar tipo</option>
            <option value="Certificación">Certificación</option>
            <option value="Apostilla">Apostilla</option>
            <option value="Protocolización">Protocolización</option>
            <option value="Autenticación">Autenticación</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Solicitante
          </label>
          <input
            type="text"
            value={formData.applicant}
            onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del solicitante"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción del trámite"
            rows={3}
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Crear Trámite
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  };

  // Componente de formulario para usuarios
  const UsuarioForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      role: ''
    });

    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (field: string, value: string) => {
      const newErrors = { ...errors };
      
      switch (field) {
        case 'name':
          if (!value.trim()) {
            newErrors.name = 'El nombre es requerido';
          } else if (value.trim().split(' ').filter((word: string) => word.length > 0).length < 2) {
            newErrors.name = 'Ingresa nombre y apellido';
          } else {
            delete newErrors.name;
          }
          break;
          
        case 'email':
          if (!value.trim()) {
            newErrors.email = 'El email es requerido';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.email = 'Ingresa un email válido';
          } else {
            delete newErrors.email;
          }
          break;
          
        case 'role':
          if (!value) {
            newErrors.role = 'Selecciona un rol';
          } else {
            delete newErrors.role;
          }
          break;
      }
      
      setErrors(newErrors);
    };

    const handleFieldChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      validateField(field, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validar todos los campos
      validateField('name', formData.name);
      validateField('email', formData.email);
      validateField('role', formData.role);
      
      // Verificar si hay errores
      if (Object.keys(errors).length > 0 || !formData.name || !formData.email || !formData.role) {
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error al crear usuario:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="Nombre y apellido"
            required
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="usuario@ejemplo.com"
            required
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123-456-7890"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol *
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleFieldChange('role', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.role ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Seleccionar rol</option>
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
            <option value="consultante">Consultante</option>
            <option value="administrador">Administrador</option>
          </select>
          {errors.role && (
            <p className="text-red-600 text-sm mt-1">{errors.role}</p>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="flex-1 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {isSubmitting ? 'Creando...' : 'Crear Usuario'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  };

  // Componente para la pantalla de inicio
  const HomeScreen = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-lg border bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          🔐 Autenticado
        </h3>
        <p className="text-blue-700 mb-4">
          Has iniciado sesión correctamente
        </p>
        <div className="text-sm text-blue-600">
          Email: {user?.email}
        </div>
      </div>

      <div className="p-6 rounded-lg border bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          📋 Gestión de Trámites
        </h3>
        <p className="text-green-700 mb-4">
          Administra y supervisa trámites notariales
        </p>
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleNavigate('tramites')}
        >
          Ver Trámites
        </button>
      </div>

      <div className="p-6 rounded-lg border bg-purple-50 border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">
          👥 Gestión de Usuarios
        </h3>
        <p className="text-purple-700 mb-4">
          Administra usuarios y permisos del sistema
        </p>
        {user?.role === 'administrador' ? (
          <button 
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => handleNavigate('usuarios')}
          >
            Gestionar Usuarios
          </button>
        ) : (
          <p className="text-purple-600 text-sm">Solo administradores</p>
        )}
      </div>
    </div>
  );

  // Componente para el panel de administración
  const AdminScreen = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Panel de Administración</h2>
        <p className="text-blue-700 mb-4">
          Acceso completo al sistema con todas las funcionalidades de gestión.
        </p>
        
        {/* Estadísticas con tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-75">Total Usuarios</p>
                <p className="text-3xl font-bold mt-2">{usuarios.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-75">Trámites Activos</p>
                <p className="text-3xl font-bold mt-2">{tramites.filter(t => t.status === 'pendiente' || t.status === 'en_proceso').length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-75">Documentos</p>
                <p className="text-3xl font-bold mt-2">1,234</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-75">Completados</p>
                <p className="text-3xl font-bold mt-2">{tramites.filter(t => t.status === 'completado').length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">⚙️ Configuración</h3>
            <p className="text-gray-600 text-sm">Sistema operativo</p>
            <p className="text-gray-600 text-sm">Permisos configurados</p>
            <p className="text-gray-600 text-sm">Backup automático</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">🔔 Notificaciones</h3>
            <p className="text-gray-600 text-sm">5 nuevas solicitudes</p>
            <p className="text-gray-600 text-sm">2 documentos pendientes</p>
            <p className="text-gray-600 text-sm">1 alerta del sistema</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Reportes</h3>
            <p className="text-gray-600 text-sm">Reportes disponibles</p>
            <p className="text-gray-600 text-sm">Generar estadísticas</p>
            <p className="text-gray-600 text-sm">Exportar datos</p>
            <button 
              onClick={() => setShowReportGenerator(true)}
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
            >
              Generar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente para la lista de usuarios
  const UsuariosScreen = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600 mt-1">Total de usuarios: {usuarios.length}</p>
        </div>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
          onClick={() => {
            console.log('Botón Nuevo Usuario clickeado');
            if (onShowUsuarioForm) {
              onShowUsuarioForm();
            }
            console.log('onShowUsuarioForm llamado');
          }}
        >
          <span>+</span>
          <span>Nuevo Usuario</span>
        </button>
      </div>
      
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <span className="text-blue-600 text-lg">👥</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Total</p>
              <p className="text-2xl font-bold text-blue-600">{usuarios.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <span className="text-green-600 text-lg">🎓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Estudiantes</p>
              <p className="text-2xl font-bold text-green-600">{usuarios.filter(u => u.role === 'estudiante').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
              <span className="text-purple-600 text-lg">👨‍🏫</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Docentes</p>
              <p className="text-2xl font-bold text-purple-600">{usuarios.filter(u => u.role === 'docente').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full">
              <span className="text-red-600 text-lg">⚙️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-900">Administradores</p>
              <p className="text-2xl font-bold text-red-600">{usuarios.filter(u => u.role === 'administrador').length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700">
            <div>Nombre</div>
            <div>Email</div>
            <div>Teléfono</div>
            <div>Rol</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>
        </div>
        <div className="divide-y">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="px-6 py-4 grid grid-cols-6 gap-4 items-center hover:bg-gray-50">
              <div className="font-medium">{usuario.name}</div>
              <div className="text-gray-600">{usuario.email}</div>
              <div className="text-gray-600">{usuario.phone || '-'}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  usuario.role === 'administrador' ? 'bg-red-100 text-red-800' :
                  usuario.role === 'docente' ? 'bg-blue-100 text-blue-800' :
                  usuario.role === 'consultante' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {usuario.role}
                </span>
              </div>
              <div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {usuario.status || 'activo'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => showInfo('Funcionalidad en desarrollo', 'La edición de usuarios estará disponible pronto')}
                >
                  Editar
                </button>
                <button 
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${usuario.name}?`)) {
                      handleDeleteUsuario(usuario.id);
                      showSuccess('Usuario eliminado', `${usuario.name} ha sido eliminado del sistema`);
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Componente para la lista de trámites
  const TramitesScreen = () => {
    // Usar trámites globales si están disponibles, sino usar los locales
    const tramitesToShow = globalTramites || tramites;
    
    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Trámites</h2>
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            if (onShowTramiteForm) {
              onShowTramiteForm();
            } else {
              setShowTramiteForm(true);
            }
          }}
        >
          + Nuevo Trámite
        </button>
      </div>
      
      {/* Búsqueda y filtros - temporalmente comentado */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Búsqueda
            </label>
            <input
              type="text"
              placeholder="Buscar trámites..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los tipos</option>
              <option value="Certificación">Certificación</option>
              <option value="Apostilla">Apostilla</option>
              <option value="Protocolización">Protocolización</option>
              <option value="Autenticación">Autenticación</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700">
            <div>ID</div>
            <div>Tipo</div>
            <div>Solicitante</div>
            <div>Descripción</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>
        </div>
        <div className="divide-y">
          {tramitesToShow.map((tramite) => (
            <div key={tramite.id} className="px-6 py-4 grid grid-cols-6 gap-4 items-center">
              <div className="font-medium">{tramite.id}</div>
              <div className="text-gray-600">{tramite.type}</div>
              <div className="text-gray-600">{tramite.applicant}</div>
              <div className="text-gray-600 text-sm truncate" title={tramite.description}>
                {tramite.description}
              </div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tramite.status === 'completado' ? 'bg-green-100 text-green-800' :
                  tramite.status === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                  tramite.status === 'rechazado' ? 'bg-red-100 text-red-800' :
                  tramite.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tramite.status || 'pendiente'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Ver</button>
                <button className="text-green-600 hover:text-green-800 text-sm">Editar</button>
                <button 
                  className="text-red-600 hover:text-red-800 text-sm"
                  onClick={() => handleDeleteTramite(tramite.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  };

  // Si está autenticado, mostrar dashboard
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Barra de navegación */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                  onClick={() => handleNavigate('home')}
                >
                  SGST
                </h1>
                <div className="flex space-x-4">
                  <button
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentScreen === 'home' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => handleNavigate('home')}
                  >
                    Inicio
                  </button>
                  {user.role === 'administrador' && (
                    <>
                      <button
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentScreen === 'admin' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        onClick={() => handleNavigate('admin')}
                      >
                        Panel Admin
                      </button>
                      <button
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentScreen === 'usuarios' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        onClick={() => handleNavigate('usuarios')}
                      >
                        Usuarios
                      </button>
                    </>
                  )}
                  <button
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentScreen === 'tramites' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => handleNavigate('tramites')}
                  >
                    Trámites
                  </button>
                  {user.role === 'administrador' && (
                    <>
                      <button
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => setShowReportGenerator(true)}
                      >
                        📊 Reportes
                      </button>
                      <button
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => setShowDocumentUpload(true)}
                      >
                        📁 Documentos
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.name} ({user.role})
                </span>
                <button 
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Renderizado condicional basado en la pantalla actual */}
            {currentScreen === 'home' && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {user.name}!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Rol: {user.role}
                  </p>
                </div>
                <HomeScreen />
              </>
            )}

            {currentScreen === 'admin' && user?.role === 'administrador' && (
              <AdminScreen />
            )}

            {currentScreen === 'usuarios' && user?.role === 'administrador' && (
              <UsuariosScreen />
            )}

            {currentScreen === 'tramites' && (
              <TramitesScreen />
            )}
          </div>
        </div>
        
        {/* Contenedor de notificaciones - temporalmente comentado */}
        {/* <NotificationContainer 
          notifications={notifications}
          onRemoveNotification={removeNotification}
        /> */}

      {/* Modal de Generador de Reportes */}
      {showReportGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">📊 Generador de Reportes</h2>
              <button 
                onClick={() => setShowReportGenerator(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-gray-600 mb-6">
                El generador de reportes estará disponible próximamente. 
                Podrás generar reportes de trámites, usuarios y estadísticas.
              </p>
              <button
                onClick={() => setShowReportGenerator(false)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Subida de Documentos */}
      {showDocumentUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">📁 Gestión de Documentos</h2>
              <button 
                onClick={() => setShowDocumentUpload(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-gray-600 mb-6">
                La gestión de documentos estará disponible próximamente. 
                Podrás subir, gestionar y aprobar documentos de trámites.
              </p>
              <button
                onClick={() => setShowDocumentUpload(false)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sistema de Gestión Notarial
          </h1>
          <p className="text-gray-600 mb-6">
            Sistema de gestión notarial para la Facultad de Derecho
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🔐 Autenticación
              </h3>
              <p className="text-blue-700 mb-4">
                Sistema de login con diferentes roles de usuario
              </p>
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowLogin(true)}
              >
                Iniciar Sesión
              </button>
            </div>

            <div className="p-6 rounded-lg border bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                📋 Gestión de Trámites
              </h3>
              <p className="text-green-700 mb-4">
                Administración completa de trámites notariales
              </p>
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Ver Trámites
              </button>
            </div>

            <div className="p-6 rounded-lg border bg-purple-50 border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                👥 Gestión de Usuarios
              </h3>
              <p className="text-purple-700 mb-4">
                Administración de usuarios y permisos
              </p>
              <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                Gestionar Usuarios
              </button>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">
              ✅ Estado del Sistema
            </h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Tailwind CSS funcionando correctamente</p>
              <p>• React y TypeScript configurados</p>
              <p>• Vite ejecutándose en modo desarrollo</p>
              <p>• Listo para implementar funcionalidades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Login */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Iniciar Sesión</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleLogin}
                className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p className="font-semibold mb-2">Emails de prueba:</p>
              <ul className="space-y-1">
                <li>• admin@test.com (Administrador)</li>
                <li>• docente@test.com (Docente)</li>
                <li>• consultante@test.com (Consultante)</li>
                <li>• estudiante@test.com (Estudiante)</li>
              </ul>
            </div>
          </div>
        </div>
      )}



      {/* Modal de Generador de Reportes */}
      {showReportGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">📊 Generador de Reportes</h2>
              <button 
                onClick={() => setShowReportGenerator(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-gray-600 mb-6">
                El generador de reportes estará disponible próximamente. 
                Podrás generar reportes de trámites, usuarios y estadísticas.
              </p>
              <button
                onClick={() => setShowReportGenerator(false)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Subida de Documentos */}
      {showDocumentUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">📁 Gestión de Documentos</h2>
              <button 
                onClick={() => setShowDocumentUpload(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-gray-600 mb-6">
                La gestión de documentos estará disponible próximamente. 
                Podrás subir, gestionar y aprobar documentos de trámites.
              </p>
              <button
                onClick={() => setShowDocumentUpload(false)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}


      </div>
    );
  };

// Componente raíz
function App() {
  const [globalShowTramiteForm, setGlobalShowTramiteForm] = useState(false);
  const [globalShowUsuarioForm, setGlobalShowUsuarioForm] = useState(false);
  const [globalFormData, setGlobalFormData] = useState({
    type: '',
    applicant: '',
    description: '',
    priority: ''
  });
  const [globalTramites, setGlobalTramites] = useState([
    { id: 'TR-001', type: 'Certificación', applicant: 'Juan Pérez', status: 'pendiente', description: 'Certificación de documentos académicos' },
    { id: 'TR-002', type: 'Apostilla', applicant: 'María García', status: 'en_proceso', description: 'Apostilla de título universitario' },
    { id: 'TR-003', type: 'Protocolización', applicant: 'Carlos López', status: 'completado', description: 'Protocolización de contrato' },
    { id: 'TR-004', type: 'Certificación', applicant: 'Ana Rodríguez', status: 'rechazado', description: 'Certificación de documentos personales' },
  ]);

  const handleGlobalAddTramite = (newTramite: any) => {
    const id = `TR-${String(globalTramites.length + 1).padStart(3, '0')}`;
    const tramiteWithId = { 
      ...newTramite, 
      id, 
      status: 'pendiente' 
    };
    setGlobalTramites([...globalTramites, tramiteWithId]);
    setGlobalShowTramiteForm(false);
  };

  const handleGlobalDeleteTramite = (id: string) => {
    setGlobalTramites(globalTramites.filter(t => t.id !== id));
  };

  return (
    <>
      <TestApp 
        onShowTramiteForm={() => setGlobalShowTramiteForm(true)}
        onShowUsuarioForm={() => setGlobalShowUsuarioForm(true)}
        onAddTramite={handleGlobalAddTramite}
        onDeleteTramite={handleGlobalDeleteTramite}
        tramites={globalTramites}
      />
      
      {/* Modal de Usuario Global */}
      {globalShowUsuarioForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">👤 Nuevo Usuario</h2>
              <button 
                onClick={() => setGlobalShowUsuarioForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // Aquí iría la lógica para crear el usuario
              alert('Usuario creado exitosamente');
              setGlobalShowUsuarioForm(false);
            }}>
              <div className="space-y-4">
                {/* Nombre Completo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="consultante">Consultante</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Repite la contraseña"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setGlobalShowUsuarioForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de trámite global */}
      {globalShowTramiteForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              color: 'black',
              padding: '30px',
              borderRadius: '8px',
              minWidth: '500px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Nuevo Trámite</h2>
              <button 
                onClick={() => setGlobalShowTramiteForm(false)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleGlobalAddTramite(globalFormData);
              setGlobalFormData({ type: '', applicant: '', description: '', priority: '' });
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tipo de Trámite:
                </label>
                <select 
                  value={globalFormData.type}
                  onChange={(e) => setGlobalFormData({...globalFormData, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                  required
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="certificacion">Certificación</option>
                  <option value="apostilla">Apostilla</option>
                  <option value="protocolizacion">Protocolización</option>
                  <option value="legalizacion">Legalización</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Solicitante:
                </label>
                <input 
                  type="text"
                  value={globalFormData.applicant}
                  onChange={(e) => setGlobalFormData({...globalFormData, applicant: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                  placeholder="Nombre completo del solicitante"
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Descripción:
                </label>
                <textarea 
                  value={globalFormData.description}
                  onChange={(e) => setGlobalFormData({...globalFormData, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '16px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="Descripción detallada del trámite"
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Prioridad:
                </label>
                <select 
                  value={globalFormData.priority}
                  onChange={(e) => setGlobalFormData({...globalFormData, priority: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                  required
                >
                  <option value="">Seleccionar prioridad...</option>
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setGlobalShowTramiteForm(false)}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Crear Trámite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </>
  );
}

export default App;
