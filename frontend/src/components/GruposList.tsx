import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './GruposList.css';

interface UsuarioGrupo {
  id_usuario_grupo: number;
  rol_en_grupo: string;
  usuario: {
    id_usuario: number;
    nombre: string;
    ci: string;
    rol: string;
  };
}

interface Grupo {
  id_grupo: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  miembros_grupo?: UsuarioGrupo[];
  tramites?: any[];
}

export function GruposList() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getGrupos();
      setGrupos(data);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMiembrosByRol = (grupo: Grupo, rol: string) => {
    return grupo.miembros_grupo?.filter(m => m.rol_en_grupo === rol) || [];
  };

  if (loading) {
    return (
      <div className="grupos-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grupos-container">
      <div className="grupos-header">
        <h2>👥 Grupos de Trabajo</h2>
        <div className="stats">
          <div className="stat-card">
            <span className="stat-number">{grupos.length}</span>
            <span className="stat-label">Grupos totales</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{grupos.filter(g => g.activo).length}</span>
            <span className="stat-label">Grupos activos</span>
          </div>
        </div>
      </div>

      {grupos.length === 0 ? (
        <div className="no-grupos">
          <p>📭 No hay grupos registrados</p>
          <p className="hint">Crea un nuevo grupo para comenzar</p>
        </div>
      ) : (
        <div className="grupos-grid">
          {grupos.map((grupo) => {
            const responsables = getMiembrosByRol(grupo, 'responsable');
            const asistentes = getMiembrosByRol(grupo, 'asistente');
            const estudiantes = getMiembrosByRol(grupo, 'estudiante');

            return (
              <div 
                key={grupo.id_grupo} 
                className={`grupo-card ${!grupo.activo ? 'inactive' : ''}`}
                onClick={() => setSelectedGrupo(grupo)}
              >
                <div className="grupo-card-header">
                  <h3>{grupo.nombre}</h3>
                  <span className={`estado-badge ${grupo.activo ? 'activo' : 'inactivo'}`}>
                    {grupo.activo ? '✓ Activo' : '⏸ Inactivo'}
                  </span>
                </div>

                {grupo.descripcion && (
                  <p className="grupo-descripcion">{grupo.descripcion}</p>
                )}

                <div className="grupo-miembros">
                  <div className="miembro-seccion">
                    <h4>👨‍🏫 Responsable</h4>
                    {responsables.length > 0 ? (
                      responsables.map(r => (
                        <div key={r.id_usuario_grupo} className="miembro-item responsable">
                          {r.usuario.nombre}
                        </div>
                      ))
                    ) : (
                      <p className="no-miembros">Sin responsable</p>
                    )}
                  </div>

                  <div className="miembro-seccion">
                    <h4>👥 Asistentes ({asistentes.length})</h4>
                    {asistentes.length > 0 ? (
                      <div className="miembros-list">
                        {asistentes.slice(0, 3).map(a => (
                          <div key={a.id_usuario_grupo} className="miembro-item asistente">
                            {a.usuario.nombre}
                          </div>
                        ))}
                        {asistentes.length > 3 && (
                          <div className="miembro-item more">
                            +{asistentes.length - 3} más
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="no-miembros">Sin asistentes</p>
                    )}
                  </div>

                  {estudiantes.length > 0 && (
                    <div className="miembro-seccion">
                      <h4>👨‍🎓 Estudiantes ({estudiantes.length})</h4>
                      <div className="miembros-list">
                        {estudiantes.slice(0, 2).map(e => (
                          <div key={e.id_usuario_grupo} className="miembro-item estudiante">
                            {e.usuario.nombre}
                          </div>
                        ))}
                        {estudiantes.length > 2 && (
                          <div className="miembro-item more">
                            +{estudiantes.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grupo-stats">
                  <div className="stat-item">
                    <span className="stat-icon">📋</span>
                    <span>{grupo.tramites?.length || 0} trámites</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👤</span>
                    <span>{grupo.miembros_grupo?.length || 0} miembros</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedGrupo && (
        <div className="modal-overlay" onClick={() => setSelectedGrupo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedGrupo.nombre}</h2>
              <button className="close-btn" onClick={() => setSelectedGrupo(null)}>×</button>
            </div>
            
            <div className="modal-body">
              {selectedGrupo.descripcion && (
                <p className="descripcion">{selectedGrupo.descripcion}</p>
              )}

              <div className="detalle-miembros">
                <h3>👨‍🏫 Responsable</h3>
                {getMiembrosByRol(selectedGrupo, 'responsable').map(m => (
                  <div key={m.id_usuario_grupo} className="detalle-miembro">
                    <span className="nombre">{m.usuario.nombre}</span>
                    <span className="ci">CI: {m.usuario.ci}</span>
                  </div>
                ))}

                <h3>👥 Asistentes</h3>
                {getMiembrosByRol(selectedGrupo, 'asistente').map(m => (
                  <div key={m.id_usuario_grupo} className="detalle-miembro">
                    <span className="nombre">{m.usuario.nombre}</span>
                    <span className="ci">CI: {m.usuario.ci}</span>
                  </div>
                ))}

                {getMiembrosByRol(selectedGrupo, 'estudiante').length > 0 && (
                  <>
                    <h3>👨‍🎓 Estudiantes</h3>
                    {getMiembrosByRol(selectedGrupo, 'estudiante').map(m => (
                      <div key={m.id_usuario_grupo} className="detalle-miembro">
                        <span className="nombre">{m.usuario.nombre}</span>
                        <span className="ci">CI: {m.usuario.ci}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

