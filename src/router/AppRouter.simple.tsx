import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext.simple';
import NotificationSystem from '../components/UI/NotificationSystem';
import { useAppNotifications } from '../hooks/useAppNotifications';
import TramiteFormModal from '../components/Forms/TramiteFormModal';
import { useTramites } from '../hooks/useTramites';

// Componente de prueba simple
const TestHome: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuthContext();
  const navigate = useNavigate();
  const { showInfo, showError } = useAppNotifications();
  
  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Cargando...</h2>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No estás autenticado</h2>
        <p>Redirigiendo al login...</p>
      </div>
    );
  }
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                SGST
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Bienvenido, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de información del usuario */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Usuario
            </h2>
            <div className="space-y-2">
              <p><span className="font-medium">Nombre:</span> {user?.name} {user?.lastName}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Rol:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'administrador' ? 'bg-red-100 text-red-800' :
                  user?.role === 'docente' ? 'bg-blue-100 text-blue-800' :
                  user?.role === 'estudiante' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user?.role}
                </span>
              </p>
              <p><span className="font-medium">Estado:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </p>
            </div>
          </div>

          {/* Card de funcionalidades */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Funcionalidades Disponibles
            </h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span>Autenticación funcionando</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span>Navegación con React Router</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span>Estado persistente</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span>Logout funcional</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span>API Backend conectada</span>
              </div>
            </div>
          </div>

          {/* Card de acciones rápidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  navigate('/tramites');
                  showInfo('Navegación', 'Redirigiendo a la gestión de trámites');
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Trámites
              </button>
              {user?.role === 'administrador' && (
                <button 
                  onClick={() => {
                    navigate('/usuarios');
                    showInfo('Navegación', 'Redirigiendo a la gestión de usuarios');
                  }}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Gestionar Usuarios
                </button>
              )}
              <button 
                onClick={() => showError('Error de prueba', 'Esta es una notificación de error de prueba')}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Probar Notificación
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente de login simple
const TestLogin: React.FC = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('admin@sgst.com');
  
  const handleLogin = async () => {
    const result = await login(email || 'admin@test.com');
    if (result.success) {
      navigate('/');
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
        
        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sgst.com"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Puedes usar cualquier email para hacer login
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente para rutas protegidas
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente de trámites con API real
const TestTramites: React.FC = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const { tramites, isLoading, error, createTramite, deleteTramite } = useTramites();
  const { showSuccess, showError } = useAppNotifications();
  const [showForm, setShowForm] = React.useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteTramite = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este trámite?')) {
      const result = await deleteTramite(id);
      if (result.success) {
        showSuccess('Trámite eliminado', 'El trámite ha sido eliminado correctamente');
      } else {
        showError('Error', result.error || 'No se pudo eliminar el trámite');
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-gray-900">
                SGST
              </h1>
              <button 
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </button>
              <span className="text-blue-600 font-medium">Trámites</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Gestión de Trámites
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isLoading ? 'Cargando...' : `${tramites.length} trámites en total`}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nuevo Trámite
            </button>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando trámites...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tramites.map((tramite) => (
                <div key={tramite.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{tramite.title}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleDeleteTramite(tramite.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Eliminar trámite"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tramite.type}</p>
                  <p className="text-xs text-gray-500 mb-2">Solicitante: {tramite.applicant}</p>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{tramite.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      tramite.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      tramite.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      tramite.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tramite.status}
                    </span>
                    {tramite.priority && (
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        tramite.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        tramite.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        tramite.priority === 'NORMAL' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tramite.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && tramites.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay trámites registrados</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear primer trámite
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* Modal de formulario */}
      <TramiteFormModal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
      />
    </div>
  );
};

// Componente de usuarios simple
const TestUsuarios: React.FC = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-gray-900">
                SGST
              </h1>
              <button 
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </button>
              <span className="text-blue-600 font-medium">Usuarios</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Gestión de Usuarios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">Juan Pérez</h3>
              <p className="text-sm text-gray-600">juan@test.com</p>
              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Estudiante
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">María García</h3>
              <p className="text-sm text-gray-600">maria@test.com</p>
              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Docente
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">Carlos López</h3>
              <p className="text-sm text-gray-600">carlos@test.com</p>
              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Consultante
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente principal del router
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de login */}
        <Route path="/login" element={<TestLogin />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <TestHome />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tramites" 
          element={
            <ProtectedRoute>
              <TestTramites />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute>
              <TestUsuarios />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Sistema de notificaciones global */}
      <NotificationSystem />
    </BrowserRouter>
  );
};

export default AppRouter;
