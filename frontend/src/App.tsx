import { useState } from 'react';
import './App.css';
import { Dashboard } from './components/Dashboard';
import { TramitesList } from './components/TramitesList';
import { CreateTramiteForm } from './components/CreateTramiteForm';
import { UsuariosList } from './components/UsuariosList';
import { CreateUsuarioForm } from './components/CreateUsuarioForm';
import { GruposList } from './components/GruposList';
import { CreateGrupoForm } from './components/CreateGrupoForm';
import { Login } from './components/Login';
import { NotificationBanner } from './components/NotificationBanner';
import { ToastContainer } from './components/ToastContainer';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type View = 'inicio' | 'tramites' | 'crear_tramite' | 'usuarios' | 'crear_usuario' | 'grupos' | 'crear_grupo';

function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('inicio');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(['inicio', 'tramites', 'usuarios']) // Por defecto, todos los módulos expandidos
  );

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner-large"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, mostrar Login
  if (!user) {
    return <Login />;
  }

  const handleFormSuccess = () => {
    setCurrentView('tramites');
    setRefreshKey(prev => prev + 1);
  };

  const handleUsuarioFormSuccess = () => {
    setCurrentView('usuarios');
    setRefreshKey(prev => prev + 1);
  };

  const handleGrupoFormSuccess = () => {
    setCurrentView('grupos');
    setRefreshKey(prev => prev + 1);
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (expandedModules.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const menuModules = [
    {
      id: 'inicio',
      title: 'Inicio',
      icon: '🏠',
      items: [
        { id: 'dashboard', icon: '📊', label: 'Panel de Control', view: 'inicio' as View },
      ]
    },
    {
      id: 'tramites',
      title: 'Gestión de Trámites',
      icon: '📋',
      items: [
        { id: 'tramites', icon: '📄', label: 'Ver Trámites', view: 'tramites' as View },
        { id: 'crear_tramite', icon: '➕', label: 'Crear Trámite', view: 'crear_tramite' as View },
      ]
    },
    {
      id: 'usuarios',
      title: 'Gestión de Usuarios',
      icon: '👥',
      items: [
        { id: 'grupos', icon: '👥', label: 'Grupos de Trabajo', view: 'grupos' as View },
        { id: 'crear_grupo', icon: '➕', label: 'Crear Grupo', view: 'crear_grupo' as View },
        { id: 'usuarios', icon: '👤', label: 'Ver Usuarios', view: 'usuarios' as View },
        { id: 'crear_usuario', icon: '👤', label: 'Registrar Usuario', view: 'crear_usuario' as View },
      ]
    }
  ];

  return (
    <div className="app-container">
      <NotificationBanner />
      <ToastContainer />
        
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2>🔐 SGST</h2>
            <p>{user?.nombre}</p>
            <span className="user-role">{user?.rol.replace('_', ' ')}</span>
          </div>
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuModules.map((module) => (
              <div key={module.id} className="nav-module">
                <button 
                  className={`module-header ${expandedModules.has(module.id) ? 'expanded' : ''}`}
                  onClick={() => sidebarOpen && toggleModule(module.id)}
                  disabled={!sidebarOpen}
                >
                  <span className="module-icon">{module.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="module-title">{module.title}</span>
                      <span className="module-chevron">
                        {expandedModules.has(module.id) ? '▼' : '▶'}
                      </span>
                    </>
                  )}
                </button>
                <div className={`module-items ${expandedModules.has(module.id) ? 'show' : 'hide'}`}>
                  {module.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.view)}
                      className={`nav-item ${currentView === item.view ? 'active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {sidebarOpen && <span className="nav-label">{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            {sidebarOpen && (
              <>
                <div className="sidebar-info">
                  <p className="system-info">
                    <strong>Notarial</strong>
                    <span>Clínica Universitaria</span>
                  </p>
                </div>
                <button className="logout-btn" onClick={logout}>
                  🚪 Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="top-header">
            <div className="header-title">
              <h1>
                {currentView === 'inicio' && '🏠 Inicio'}
                {currentView === 'tramites' && '📋 Gestión de Trámites'}
                {currentView === 'crear_tramite' && '➕ Crear Nuevo Trámite'}
                {currentView === 'grupos' && '👥 Gestión de Grupos'}
                {currentView === 'crear_grupo' && '➕ Crear Nuevo Grupo'}
                {currentView === 'usuarios' && '👤 Gestión de Usuarios'}
                {currentView === 'crear_usuario' && '👤 Registrar Usuario'}
              </h1>
              <p className="header-subtitle">
                Sistema de Gestión de Trámites Notariales
              </p>
            </div>
          </header>

          <div className="content-area">
            {currentView === 'inicio' && (
              <Dashboard key={refreshKey} />
            )}
            {currentView === 'crear_tramite' && (
              <CreateTramiteForm onSuccess={handleFormSuccess} />
            )}
            {currentView === 'tramites' && (
              <TramitesList key={refreshKey} />
            )}
            {currentView === 'crear_grupo' && (
              <CreateGrupoForm onSuccess={handleGrupoFormSuccess} />
            )}
            {currentView === 'grupos' && (
              <GruposList key={refreshKey} />
            )}
            {currentView === 'crear_usuario' && (
              <CreateUsuarioForm onSuccess={handleUsuarioFormSuccess} />
            )}
            {currentView === 'usuarios' && (
              <UsuariosList key={refreshKey} />
            )}
          </div>

          <footer className="main-footer">
            <div className="footer-links">
              <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
                📡 Backend API
              </a>
              <a href="http://localhost:3002" target="_blank" rel="noopener noreferrer">
                🎯 Orchestrator
              </a>
              <a href="http://localhost:8081" target="_blank" rel="noopener noreferrer">
                ⚙️ Camunda BPM
              </a>
              <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
                🗄️ PgAdmin
              </a>
            </div>
            <p className="footer-copyright">
              © 2024 Clínica Notarial - Sistema de Gestión de Trámites
            </p>
          </footer>
        </main>
      </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
