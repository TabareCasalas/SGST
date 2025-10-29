import { useState } from 'react';
import './App.css';
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
import { FaSignOutAlt, FaUser } from 'react-icons/fa';

type View = 'tramites' | 'crear_tramite' | 'usuarios' | 'crear_usuario' | 'grupos' | 'crear_grupo' | 'mis_tramites' | 'consultar_tramite';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  view: View;
  roles: string[];
}

function AppContent() {
  const { user, logout, isAuthenticated, hasRole, hasAccessLevel } = useAuth();
  const [currentView, setCurrentView] = useState<View>('tramites');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  // Si no está autenticado, mostrar login
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  // Menú adaptado según rol y nivel de acceso
  const menuItems: MenuItem[] = [];

  // Administradores
  if (hasRole('admin')) {
    // Todos los admins ven trámites
    menuItems.push({ id: 'tramites', icon: '📋', label: 'Trámites', view: 'tramites', roles: ['admin'] });
    
    // Solo Admin Docente (nivel 2) y Admin Sistema (nivel 3) pueden crear trámites
    if (hasAccessLevel(2)) {
      menuItems.push({ id: 'crear_tramite', icon: '➕', label: 'Crear Trámite', view: 'crear_tramite', roles: ['admin'] });
    }
    
    // Todos los admins pueden ver grupos
    menuItems.push({ id: 'grupos', icon: '👥', label: 'Grupos', view: 'grupos', roles: ['admin'] });
    
    // Solo Admin Docente (nivel 2) y Admin Sistema (nivel 3) pueden crear grupos
    if (hasAccessLevel(2)) {
      menuItems.push({ id: 'crear_grupo', icon: '➕', label: 'Crear Grupo', view: 'crear_grupo', roles: ['admin'] });
    }
    
    // Solo Admin Sistema (nivel 3) puede gestionar usuarios
    if (hasAccessLevel(3)) {
      menuItems.push({ id: 'usuarios', icon: '👤', label: 'Usuarios', view: 'usuarios', roles: ['admin'] });
      menuItems.push({ id: 'crear_usuario', icon: '✚', label: 'Crear Usuario', view: 'crear_usuario', roles: ['admin'] });
    }
  }
  
  // Docentes - ven trámites y grupos
  if (hasRole('docente')) {
    menuItems.push({ id: 'tramites', icon: '📋', label: 'Trámites', view: 'tramites', roles: ['docente'] });
    menuItems.push({ id: 'grupos', icon: '👥', label: 'Grupos', view: 'grupos', roles: ['docente'] });
  }
  
  // Estudiantes y Consultantes
  if (hasRole(['estudiante', 'consultante'])) {
    menuItems.push({ id: 'mis_tramites', icon: '📂', label: 'Mis Trámites', view: 'mis_tramites', roles: ['estudiante', 'consultante'] });
  }

  const filteredMenu = menuItems;

  return (
    <div className="app-container">
      <NotificationBanner />
      <ToastContainer />
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2>🔐 SGST</h2>
            <p>Sistema de Gestión</p>
          </div>
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Usuario actual */}
        {sidebarOpen && (
          <div className="sidebar-user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <strong>{user.nombre}</strong>
              <span className={`user-role role-${user.rol}`}>
                {getRoleLabel(user.rol, user.nivel_acceso)}
              </span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.view)}
              className={`nav-item ${currentView === item.view ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="sidebar-info">
              <p className="system-info">
                <strong>Notarial</strong>
                <span>Clínica Universitaria</span>
              </p>
            </div>
          )}
          <button onClick={logout} className="logout-btn" title="Cerrar sesión">
            <FaSignOutAlt />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>
              {currentView === 'tramites' && '📋 Gestión de Trámites'}
              {currentView === 'crear_tramite' && '➕ Crear Nuevo Trámite'}
              {currentView === 'usuarios' && '👥 Gestión de Usuarios'}
              {currentView === 'crear_usuario' && '👤 Registrar Usuario'}
              {currentView === 'mis_tramites' && '📂 Mis Trámites'}
              {currentView === 'consultar_tramite' && '🔍 Consultar Trámite'}
            </h1>
            <p className="header-subtitle">
              Sistema de Gestión de Trámites Notariales
            </p>
          </div>
        </header>

        <div className="content-area">
          {/* Vistas según rol */}
          {currentView === 'tramites' && (hasRole(['admin', 'docente'])) && (
            <TramitesList key={refreshKey} />
          )}
          {currentView === 'crear_tramite' && hasRole('admin') && hasAccessLevel(2) && (
            <CreateTramiteForm onSuccess={handleFormSuccess} />
          )}
          {currentView === 'grupos' && (hasRole(['admin', 'docente'])) && (
            <GruposList key={refreshKey} />
          )}
          {currentView === 'crear_grupo' && hasRole('admin') && hasAccessLevel(2) && (
            <CreateGrupoForm onSuccess={handleGrupoFormSuccess} />
          )}
          {currentView === 'usuarios' && hasRole('admin') && hasAccessLevel(3) && (
            <UsuariosList key={refreshKey} />
          )}
          {currentView === 'crear_usuario' && hasRole('admin') && hasAccessLevel(3) && (
            <CreateUsuarioForm onSuccess={handleUsuarioFormSuccess} />
          )}
          {currentView === 'mis_tramites' && hasRole(['estudiante', 'consultante']) && (
            <TramitesList key={refreshKey} />
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

function getRoleLabel(role: string, nivel_acceso?: number): string {
  if (role === 'admin') {
    switch (nivel_acceso) {
      case 3:
        return 'Admin. Sistema';
      case 2:
        return 'Admin. Docente';
      case 1:
        return 'Admin. Administrativo';
      default:
        return 'Administrador';
    }
  }
  
  const labels: { [key: string]: string } = {
    docente: 'Docente',
    estudiante: 'Estudiante',
    consultante: 'Consultante',
  };
  return labels[role] || role;
}

export default App;
