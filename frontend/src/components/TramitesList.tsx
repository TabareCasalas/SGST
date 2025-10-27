import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import type { Tramite } from '../types/tramite';
import { TareaCard } from './TareaCard';
import './TramitesList.css';

export function TramitesList() {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTareas, setShowTareas] = useState(false);

  useEffect(() => {
    loadTramites();
  }, []);

  const loadTramites = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTramites();
      setTramites(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este trámite?')) return;
    
    try {
      await ApiService.deleteTramite(id);
      await loadTramites();
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleCompletarTarea = async (id: number, aprobado: boolean) => {
    try {
      await ApiService.completarTarea(id, aprobado);
      await loadTramites(); // Recargar para ver cambios
      alert(`Trámite ${aprobado ? 'aprobado' : 'rechazado'} exitosamente`);
    } catch (err: any) {
      alert('Error al completar tarea: ' + err.message);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'iniciado': return 'blue';
      case 'en_revision': return 'orange';
      case 'aprobado': return 'green';
      case 'rechazado': return 'red';
      case 'finalizado': return 'gray';
      default: return 'blue';
    }
  };

  if (loading) return <div className="loading">Cargando trámites...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Filtrar trámites en revisión (tareas pendientes)
  const tareasPendientes = tramites.filter(t => t.estado === 'en_revision');

  return (
    <div className="tramites-container">
      <div className="tramites-header">
        <h2>📋 Lista de Trámites</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {tareasPendientes.length > 0 && (
            <button 
              onClick={() => setShowTareas(!showTareas)} 
              className={`nav-toggle ${showTareas ? 'active' : ''}`}
            >
              {showTareas ? '📋 Ver Todos' : `🔔 Tareas (${tareasPendientes.length})`}
            </button>
          )}
          <button onClick={loadTramites} className="refresh-btn">🔄 Actualizar</button>
        </div>
      </div>

      {/* Mostrar tareas pendientes si está activo */}
      {showTareas && tareasPendientes.length > 0 && (
        <div className="tareas-pendientes">
          <h3>🔄 Tareas Pendientes de Revisión</h3>
          {tareasPendientes.map((tramite) => (
            <TareaCard 
              key={tramite.id_tramite} 
              tramite={tramite} 
              onCompletar={handleCompletarTarea}
            />
          ))}
        </div>
      )}

      {tramites.length === 0 ? (
        <div className="empty-state">
          <p>No hay trámites registrados</p>
        </div>
      ) : (
        <div className="tramites-grid">
          {tramites.map((tramite) => (
            <div key={tramite.id_tramite} className="tramite-card">
              <div className="tramite-header">
                <h3>Trámite #{tramite.num_carpeta}</h3>
                <span className={`estado-badge estado-${getEstadoColor(tramite.estado)}`}>
                  {tramite.estado}
                </span>
              </div>

              <div className="tramite-body">
                <p><strong>ID:</strong> {tramite.id_tramite}</p>
                {tramite.consultante?.usuario && (
                  <p><strong>Consultante:</strong> {tramite.consultante.usuario.nombre}</p>
                )}
                {tramite.grupo && (
                  <p><strong>Grupo:</strong> {tramite.grupo.nombre}</p>
                )}
                {tramite.observaciones && (
                  <p><strong>Observaciones:</strong> {tramite.observaciones}</p>
                )}
                <p><strong>Fecha inicio:</strong> {new Date(tramite.fecha_inicio).toLocaleDateString()}</p>
                {tramite.process_instance_id && (
                  <p className="process-id">
                    <strong>Proceso Camunda:</strong> {tramite.process_instance_id.slice(0, 20)}...
                  </p>
                )}
              </div>

              <div className="tramite-actions">
                <button onClick={() => handleDelete(tramite.id_tramite)} className="delete-btn">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

