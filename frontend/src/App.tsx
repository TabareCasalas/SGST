import { useState } from 'react';
import './App.css';
import { TramitesList } from './components/TramitesList';
import { CreateTramiteForm } from './components/CreateTramiteForm';
import { NotificationBanner } from './components/NotificationBanner';

function App() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1); // Force refresh of list
  };

  return (
    <div className="app">
      <NotificationBanner />
      <header className="app-header">
        <h1>🔐 SGST - Sistema de Gestión de Trámites</h1>
        <p>Sistema integral para gestión de trámites notariales</p>
      </header>

      <nav className="app-nav">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`nav-btn ${showCreateForm ? 'active' : ''}`}
        >
          {showCreateForm ? '👁️ Ver Trámites' : '➕ Crear Trámite'}
        </button>
      </nav>

      <main className="app-main">
        {showCreateForm ? (
          <CreateTramiteForm onSuccess={handleFormSuccess} />
        ) : (
          <TramitesList key={refreshKey} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          📡 Backend: <a href="http://localhost:3001" target="_blank">http://localhost:3001</a> | 
          🎯 Orchestrator: <a href="http://localhost:3002" target="_blank">http://localhost:3002</a> | 
          ⚙️ Camunda: <a href="http://localhost:8081" target="_blank">http://localhost:8081</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
