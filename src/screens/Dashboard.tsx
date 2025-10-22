import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import StatsCard from '../components/UI/StatsCard';
import Sidebar from '../components/Layout/Sidebar';
import { useTramites } from '../hooks/useTramites';
import { useUsers } from '../hooks/useUsers';

const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  const { tramites, loading: tramitesLoading } = useTramites();
  const { users, loading: usersLoading } = useUsers();

  // Calcular estadísticas
  const stats = [
    {
      title: 'Trámites Totales',
      value: (Array.isArray(tramites) ? tramites.length : 0).toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: '📋'
    },
    {
      title: 'Trámites Pendientes',
      value: (Array.isArray(tramites) ? tramites.filter(t => t.estado === 'pendiente').length : 0).toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: '⏳'
    },
    {
      title: 'Trámites Completados',
      value: (Array.isArray(tramites) ? tramites.filter(t => t.estado === 'completado').length : 0).toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: '✅'
    },
    {
      title: 'Usuarios Totales',
      value: (users?.length || 0).toString(),
      change: '+3%',
      changeType: 'positive' as const,
      icon: '👥'
    }
  ];

  // Usuarios recientes (últimos 5)
  const recentUsers = (users || [])
    .sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())
    .slice(0, 5);

  // Trámites recientes (últimos 5)
  const recentTramites = Array.isArray(tramites) ? tramites
    .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime())
    .slice(0, 5) : [];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendiente':
        return 'bg-red-100 text-red-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (usersLoading || tramitesLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard SGST
            </h1>
            <p className="text-gray-600">Bienvenido, {user?.nombre}</p>
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Estadísticas */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Resumen del Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatsCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  changeType={stat.changeType}
                  icon={stat.icon}
                />
              ))}
            </div>
          </div>

              {/* Gráficos y tablas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Usuarios Recientes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Usuarios Recientes
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {recentUsers.map((usuario) => (
                    <div key={usuario.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {usuario.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {usuario.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                              {usuario.correo}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(usuario.fecha_registro).toLocaleDateString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          usuario.roles?.some(r => r.nombre === 'Administrador') 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {usuario.roles?.map(r => r.nombre).join(', ') || 'Usuario'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>

              {/* Trámites Recientes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Trámites Recientes
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {recentTramites.map((tramite) => (
                      <div key={tramite.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {tramite.num_carpeta}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Trámite #{tramite.num_carpeta}
                              </p>
                              <p className="text-sm text-gray-500">
                                {tramite.consultante?.usuario?.nombre || 'Sin consultante'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(tramite.fecha_inicio).toLocaleDateString()}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tramite.estado)}`}>
                            {tramite.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actividad Reciente */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Actividad Reciente
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Sistema iniciado</p>
                      <p className="text-xs text-gray-500">Hace unos momentos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Usuario autenticado</p>
                      <p className="text-xs text-gray-500">Hace unos momentos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Dashboard cargado</p>
                      <p className="text-xs text-gray-500">Hace unos momentos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span className="text-2xl mr-3">📋</span>
                <div className="text-left">
                  <p className="font-medium">Nuevo Trámite</p>
                  <p className="text-sm opacity-90">Crear trámite</p>
                </div>
              </button>
              <button className="flex items-center justify-center p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <span className="text-2xl mr-3">👥</span>
                <div className="text-left">
                  <p className="font-medium">Gestionar Usuarios</p>
                  <p className="text-sm opacity-90">Ver usuarios</p>
                </div>
              </button>
              <button className="flex items-center justify-center p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <span className="text-2xl mr-3">📊</span>
                <div className="text-left">
                  <p className="font-medium">Ver Reportes</p>
                  <p className="text-sm opacity-90">Generar reportes</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;