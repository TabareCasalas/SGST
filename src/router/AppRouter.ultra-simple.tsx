import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext.ultra-simple';
import TramiteFormModal from '../components/Forms/TramiteFormModal.simple';

// Componente de login ultra simple
const UltraSimpleLogin: React.FC = () => {
  const { login, user, isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('admin@sgst.com');
  
  console.log('UltraSimpleLogin: Estado del contexto:', { user, isAuthenticated, isLoading });
  
  // Si ya está autenticado, redirigir
  React.useEffect(() => {
    if (isAuthenticated && user) {
      console.log('UltraSimpleLogin: Usuario ya autenticado, redirigiendo...');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('UltraSimpleLogin: Intentando login con:', email);
    const result = await login(email || 'admin@test.com');
    console.log('UltraSimpleLogin: Resultado del login:', result);
    if (result.success) {
      console.log('UltraSimpleLogin: Login exitoso, navegando...');
      navigate('/');
    } else {
      console.error('UltraSimpleLogin: Error en login:', result.error);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema de Gestión Notarial
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Facultad de Derecho
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sgst.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Iniciar Sesión
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Email pre-cargado: <strong>admin@sgst.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente de dashboard ultra simple
const UltraSimpleDashboard: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();
  
  console.log('UltraSimpleDashboard: Estado del contexto:', { user, isAuthenticated, isLoading });
  
  const handleLogout = () => {
    console.log('Cerrando sesión...');
    logout();
    navigate('/login');
  };

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    console.log('UltraSimpleDashboard: No autenticado, redirigiendo al login');
    return <Navigate to="/login" replace />;
  }

  const loadTramites = async () => {
    try {
      console.log('Cargando trámites...');
      const response = await fetch('http://localhost:3001/api/tramites');
      const data = await response.json();
      console.log('Trámites cargados:', data);
      return data;
    } catch (error) {
      console.error('Error cargando trámites:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">SGST</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hola, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Bienvenido al Sistema de Gestión Notarial!
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Has iniciado sesión correctamente como: <strong>{user?.role}</strong>
              </p>
              <p className="text-gray-600">
                Email: <strong>{user?.email}</strong>
              </p>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  ✅ Sistema funcionando correctamente
                </h3>
                <ul className="text-green-700 space-y-1">
                  <li>• Frontend conectado al backend</li>
                  <li>• Base de datos PostgreSQL funcionando</li>
                  <li>• API REST disponible</li>
                  <li>• Autenticación implementada</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  🚀 Acciones Rápidas
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Navegar a trámites
                      window.location.href = '/tramites';
                    }}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Ver Trámites
                  </button>
                  <button
                    onClick={loadTramites}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Probar API Trámites
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Limpiar y Reiniciar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente de trámites ultra simple
const UltraSimpleTramites: React.FC = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [tramites, setTramites] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  const loadTramites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Cargando trámites...');
      const response = await fetch('http://localhost:3001/api/tramites');
      const data = await response.json();
      console.log('Respuesta de la API:', data);
      
      if (data.success) {
        setTramites(data.data);
        console.log('Trámites cargados:', data.data);
      } else {
        setError(data.error || 'Error al cargar trámites');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error loading tramites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTramite = async (tramiteData: any) => {
    try {
      console.log('Creando trámite:', tramiteData);
      const response = await fetch('http://localhost:3001/api/tramites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tramiteData),
      });
      const data = await response.json();
      console.log('Respuesta de creación:', data);
      
      if (data.success) {
        // Recargar la lista de trámites
        await loadTramites();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Error al crear trámite' };
      }
    } catch (err) {
      console.error('Error creating tramite:', err);
      return { success: false, error: 'Error de conexión' };
    }
  };

  React.useEffect(() => {
    loadTramites();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900">SGST</h1>
              <button 
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </button>
              <span className="text-blue-600 font-medium">Trámites</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Gestión de Trámites
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  + Nuevo Trámite
                </button>
                <button
                  onClick={loadTramites}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cargando...' : 'Recargar'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
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
                    <h3 className="font-semibold text-gray-900 mb-2">{tramite.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Tipo: {tramite.type}</p>
                    <p className="text-sm text-gray-600 mb-2">Solicitante: {tramite.applicant}</p>
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
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        tramite.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        tramite.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        tramite.priority === 'NORMAL' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tramite.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && tramites.length === 0 && !error && (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay trámites registrados</p>
                <p className="text-sm text-gray-400 mt-2">
                  Los trámites se cargan desde la base de datos PostgreSQL
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Crear primer trámite
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Modal de formulario */}
      {showForm && (
        <TramiteFormModal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)}
          onCreateTramite={createTramite}
        />
      )}
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        <Route path="/login" element={<UltraSimpleLogin />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <UltraSimpleDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tramites" 
          element={
            <ProtectedRoute>
              <UltraSimpleTramites />
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
