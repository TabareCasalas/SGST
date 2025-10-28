import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { FaUser, FaGraduationCap, FaChalkboardTeacher, FaUserTie, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaUserCheck, FaUserTimes, FaChevronDown, FaChevronUp, FaUsers } from 'react-icons/fa';
import './UsuariosList.css';

interface Usuario {
  id_usuario: number;
  nombre: string;
  ci: string;
  domicilio: string;
  telefono: string;
  correo: string;
  rol: string;
  activo: boolean;
  semestre?: string;
  id_grupo?: number;
  grupo?: {
    nombre: string;
  };
  created_at: string;
  updated_at: string;
}

export function UsuariosList() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState({
    rol: '',
    activo: '',
    search: '',
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadUsuarios();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadUsuarios, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filters.rol) filterParams.rol = filters.rol;
      if (filters.activo !== '') filterParams.activo = filters.activo === 'true';
      if (filters.search) filterParams.search = filters.search;
      
      const data = await ApiService.getUsuarios(filterParams);
      setUsuarios(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDeactivate = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de desactivar a ${nombre}?`)) return;
    
    try {
      await ApiService.deactivateUsuario(id);
      await loadUsuarios();
      showToast('Usuario desactivado exitosamente', 'success');
    } catch (err: any) {
      showToast(`Error al desactivar: ${err.message}`, 'error');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await ApiService.activateUsuario(id);
      await loadUsuarios();
      showToast('Usuario activado exitosamente', 'success');
    } catch (err: any) {
      showToast(`Error al activar: ${err.message}`, 'error');
    }
  };

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'administrador': return <FaUserTie />;
      case 'docente': return <FaChalkboardTeacher />;
      case 'estudiante': return <FaGraduationCap />;
      case 'consultante': return <FaUser />;
      default: return <FaUser />;
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'administrador': return 'admin';
      case 'docente': return 'docente';
      case 'estudiante': return 'estudiante';
      case 'consultante': return 'consultante';
      default: return 'default';
    }
  };

  if (loading && usuarios.length === 0) return <div className="loading">Cargando usuarios...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const activeUsers = usuarios.filter(u => u.activo).length;
  const inactiveUsers = usuarios.filter(u => !u.activo).length;

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h2>👥 Gestión de Usuarios</h2>
        <div className="header-actions">
          <button onClick={loadUsuarios} className="refresh-btn" title="Actualizar">
            <FaUsers /> Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="usuarios-stats">
        <div className="stat-item">
          <FaUsers className="stat-icon" />
          <div>
            <span className="stat-value">{usuarios.length}</span>
            <span className="stat-label">Total Usuarios</span>
          </div>
        </div>
        <div className="stat-item stat-active">
          <FaUserCheck className="stat-icon" />
          <div>
            <span className="stat-value">{activeUsers}</span>
            <span className="stat-label">Activos</span>
          </div>
        </div>
        <div className="stat-item stat-inactive">
          <FaUserTimes className="stat-icon" />
          <div>
            <span className="stat-value">{inactiveUsers}</span>
            <span className="stat-label">Inactivos</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtro-item filtro-search">
          <input
            type="text"
            placeholder="Buscar por nombre, CI o correo..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="filter-input"
          />
        </div>
        <div className="filtro-item">
          <select
            value={filters.rol}
            onChange={(e) => setFilters({ ...filters, rol: e.target.value })}
            className="filter-select"
          >
            <option value="">Todos los Roles</option>
            <option value="estudiante">👨‍🎓 Estudiante</option>
            <option value="docente">👨‍🏫 Docente</option>
            <option value="consultante">👤 Consultante</option>
            <option value="administrador">👨‍💼 Administrador</option>
          </select>
        </div>
        <div className="filtro-item">
          <select
            value={filters.activo}
            onChange={(e) => setFilters({ ...filters, activo: e.target.value })}
            className="filter-select"
          >
            <option value="">Todos los Estados</option>
            <option value="true">✅ Activos</option>
            <option value="false">❌ Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {usuarios.length === 0 ? (
        <div className="empty-state">
          <p>No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>CI</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <>
                  <tr 
                    key={usuario.id_usuario} 
                    className={`table-row ${!usuario.activo ? 'inactive-row' : ''}`}
                    onClick={() => toggleRow(usuario.id_usuario)}
                  >
                    <td className="expand-icon">
                      {expandedRows.has(usuario.id_usuario) ? <FaChevronUp /> : <FaChevronDown />}
                    </td>
                    <td className="user-name">
                      {getRolIcon(usuario.rol)}
                      <span>{usuario.nombre}</span>
                    </td>
                    <td>
                      <span className={`rol-badge rol-${getRolColor(usuario.rol)}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td>{usuario.ci}</td>
                    <td>
                      {usuario.activo ? (
                        <span className="status-badge status-active">
                          <FaUserCheck /> Activo
                        </span>
                      ) : (
                        <span className="status-badge status-inactive">
                          <FaUserTimes /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="action-buttons">
                      {usuario.activo ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivate(usuario.id_usuario, usuario.nombre);
                          }}
                          className="action-btn deactivate-btn"
                          title="Desactivar usuario"
                        >
                          <FaUserTimes />
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivate(usuario.id_usuario);
                          }}
                          className="action-btn activate-btn"
                          title="Activar usuario"
                        >
                          <FaUserCheck />
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRows.has(usuario.id_usuario) && (
                    <tr className="expanded-content">
                      <td colSpan={6}>
                        <div className="details-grid">
                          <div className="detail-item">
                            <FaEnvelope className="detail-icon" />
                            <div>
                              <strong>Correo:</strong>
                              <p>{usuario.correo}</p>
                            </div>
                          </div>
                          <div className="detail-item">
                            <FaPhone className="detail-icon" />
                            <div>
                              <strong>Teléfono:</strong>
                              <p>{usuario.telefono}</p>
                            </div>
                          </div>
                          <div className="detail-item">
                            <FaMapMarkerAlt className="detail-icon" />
                            <div>
                              <strong>Domicilio:</strong>
                              <p>{usuario.domicilio}</p>
                            </div>
                          </div>
                          {usuario.semestre && (
                            <div className="detail-item">
                              <FaCalendarAlt className="detail-icon" />
                              <div>
                                <strong>Semestre:</strong>
                                <p>{usuario.semestre}</p>
                              </div>
                            </div>
                          )}
                          {usuario.grupo && (
                            <div className="detail-item">
                              <FaBuilding className="detail-icon" />
                              <div>
                                <strong>Grupo:</strong>
                                <p>{usuario.grupo.nombre}</p>
                              </div>
                            </div>
                          )}
                          <div className="detail-item">
                            <FaCalendarAlt className="detail-icon" />
                            <div>
                              <strong>Fecha de Registro:</strong>
                              <p>{new Date(usuario.created_at).toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</p>
                              </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
