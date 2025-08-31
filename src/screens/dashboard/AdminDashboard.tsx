import React, { useState } from 'react';
import Button from '../../components/UI/Button';
import { useAuthContext } from '../../hooks/useAuthContext';
import { ROLES } from '../../constants/roles';

const AdminDashboard: React.FC = () => {
  const { user, checkPermission } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalUsers: 156,
    activeTramites: 23,
    pendingDocuments: 8,
    completedToday: 5,
  };

  const recentActivity = [
    { id: 1, action: 'Nuevo trámite creado', user: 'Juan Pérez', time: '2 min ago', type: 'tramite' },
    { id: 2, action: 'Documento subido', user: 'María García', time: '5 min ago', type: 'documento' },
    { id: 3, action: 'Usuario registrado', user: 'Carlos López', time: '10 min ago', type: 'usuario' },
    { id: 4, action: 'Trámite completado', user: 'Ana Rodríguez', time: '15 min ago', type: 'tramite' },
  ];

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'users', label: 'Usuarios', icon: '👥' },
    { id: 'tramites', label: 'Trámites', icon: '📋' },
    { id: 'reports', label: 'Reportes', icon: '📈' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {user?.name} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {ROLES[user?.role || 'administrador']}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">👥</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Usuarios
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalUsers}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">📋</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Trámites Activos
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.activeTramites}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">📄</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Documentos Pendientes
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.pendingDocuments}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">✅</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Completados Hoy
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.completedToday}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Actividad Reciente
                </h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivity.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {activityIdx !== recentActivity.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                <span className="text-white text-sm font-medium">
                                  {activity.type === 'tramite' ? '📋' : 
                                   activity.type === 'documento' ? '📄' : '👤'}
                                </span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {activity.action} por{' '}
                                  <span className="font-medium text-gray-900">
                                    {activity.user}
                                  </span>
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time>{activity.time}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setActiveTab('users')}
                  >
                    Gestionar Usuarios
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setActiveTab('tramites')}
                  >
                    Ver Trámites
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setActiveTab('reports')}
                  >
                    Generar Reportes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Gestión de Usuarios
                </h3>
                <Button variant="primary">
                  Nuevo Usuario
                </Button>
              </div>
              <p className="text-gray-600">
                Aquí podrás gestionar todos los usuarios del sistema, incluyendo estudiantes, docentes, consultantes y administradores.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'tramites' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Gestión de Trámites
                </h3>
                <Button variant="primary">
                  Nuevo Trámite
                </Button>
              </div>
              <p className="text-gray-600">
                Administra todos los trámites del sistema, asigna operadores y supervisa el progreso.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Reportes y Estadísticas
              </h3>
              <p className="text-gray-600">
                Genera reportes personalizados por estado, fechas, operador y otros criterios.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Configuración del Sistema
              </h3>
              <p className="text-gray-600">
                Configura parámetros del sistema, roles, permisos y otras configuraciones avanzadas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 