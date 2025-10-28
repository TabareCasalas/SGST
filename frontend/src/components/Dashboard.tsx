import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { 
  FaFileAlt, FaUsers, FaUserTie, FaCheckCircle, FaClock, 
  FaChartLine, FaCalendarAlt, FaSync, FaClipboardList 
} from 'react-icons/fa';
import './Dashboard.css';

interface DashboardStats {
  totalTramites: number;
  tramitesActivos: number;
  tramitesFinalizados: number;
  tramitesPendientes: number;
  totalGrupos: number;
  gruposActivos: number;
  totalUsuarios: number;
  totalConsultantes: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTramites: 0,
    tramitesActivos: 0,
    tramitesFinalizados: 0,
    tramitesPendientes: 0,
    totalGrupos: 0,
    gruposActivos: 0,
    totalUsuarios: 0,
    totalConsultantes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh cada 60 segundos
    const interval = setInterval(() => {
      loadDashboardData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de trámites
      const tramites = await ApiService.getTramites();
      const totalTramites = tramites.length;
      const tramitesActivos = tramites.filter((t: any) => 
        !['cerrado', 'finalizado', 'desistido'].includes(t.estado)
      ).length;
      const tramitesFinalizados = tramites.filter((t: any) => 
        ['cerrado', 'finalizado'].includes(t.estado)
      ).length;
      const tramitesPendientes = tramites.filter((t: any) => 
        t.estado === 'en_revision'
      ).length;

      // Cargar datos de grupos
      const grupos = await ApiService.getGrupos();
      const totalGrupos = grupos.length;
      const gruposActivos = grupos.filter((g: any) => g.activo).length;

      // Cargar datos de usuarios
      const usuarios = await ApiService.getUsuarios();
      const totalUsuarios = usuarios.length;
      const totalConsultantes = usuarios.filter((u: any) => 
        u.rol === 'consultante'
      ).length;

      setStats({
        totalTramites,
        tramitesActivos,
        tramitesFinalizados,
        tramitesPendientes,
        totalGrupos,
        gruposActivos,
        totalUsuarios,
        totalConsultantes,
      });
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && stats.totalTramites === 0) {
    return (
      <div className="dashboard-container">
        <div className="loading-dashboard">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>📊 Panel de Control</h1>
          <p className="dashboard-subtitle">
            Resumen general del sistema
          </p>
        </div>
        <button 
          onClick={loadDashboardData} 
          className="refresh-btn"
          disabled={loading}
        >
          <FaSync className={loading ? 'spinning' : ''} /> Actualizar
        </button>
      </div>

      <div className="last-update">
        <FaCalendarAlt />
        Última actualización: {lastUpdate.toLocaleString('es-ES')}
      </div>

      {/* Sección: Trámites */}
      <div className="stats-section">
        <div className="section-title">
          <FaFileAlt className="section-icon" />
          <h2>Trámites</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon-wrapper">
              <FaFileAlt />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalTramites}</span>
              <span className="stat-label">Total de Trámites</span>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon-wrapper">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.tramitesActivos}</span>
              <span className="stat-label">En Proceso</span>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon-wrapper">
              <FaClock />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.tramitesPendientes}</span>
              <span className="stat-label">Pendientes de Revisión</span>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon-wrapper">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.tramitesFinalizados}</span>
              <span className="stat-label">Finalizados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Grupos de Trabajo */}
      <div className="stats-section">
        <div className="section-title">
          <FaUsers className="section-icon" />
          <h2>Grupos de Trabajo</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card accent">
            <div className="stat-icon-wrapper">
              <FaUsers />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalGrupos}</span>
              <span className="stat-label">Total de Grupos</span>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon-wrapper">
              <FaClipboardList />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.gruposActivos}</span>
              <span className="stat-label">Grupos Activos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Usuarios */}
      <div className="stats-section">
        <div className="section-title">
          <FaUserTie className="section-icon" />
          <h2>Usuarios</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card secondary">
            <div className="stat-icon-wrapper">
              <FaUsers />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalUsuarios}</span>
              <span className="stat-label">Total de Usuarios</span>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon-wrapper">
              <FaUserTie />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalConsultantes}</span>
              <span className="stat-label">Consultantes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores rápidos */}
      <div className="quick-indicators">
        <div className="indicator">
          <div className="indicator-label">Tasa de Completitud</div>
          <div className="indicator-value">
            {stats.totalTramites > 0 
              ? Math.round((stats.tramitesFinalizados / stats.totalTramites) * 100)
              : 0}%
          </div>
          <div className="indicator-bar">
            <div 
              className="indicator-fill success"
              style={{ 
                width: `${stats.totalTramites > 0 
                  ? (stats.tramitesFinalizados / stats.totalTramites) * 100 
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>

        <div className="indicator">
          <div className="indicator-label">Grupos Activos</div>
          <div className="indicator-value">
            {stats.totalGrupos > 0 
              ? Math.round((stats.gruposActivos / stats.totalGrupos) * 100)
              : 0}%
          </div>
          <div className="indicator-bar">
            <div 
              className="indicator-fill accent"
              style={{ 
                width: `${stats.totalGrupos > 0 
                  ? (stats.gruposActivos / stats.totalGrupos) * 100 
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

