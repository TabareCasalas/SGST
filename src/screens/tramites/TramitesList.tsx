import React, { useState } from 'react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { TramiteType, TramiteStatus, TramitePriority } from '../../types/tramites';
import { TRAMITE_TYPES, TRAMITE_STATUS, TRAMITE_PRIORITIES } from '../../constants/status';
import { useAuthContext } from '../../hooks/useAuthContext';

// Mock data para trámites
const mockTramites = [
  {
    id: '1',
    type: 'certificacion' as TramiteType,
    title: 'Certificación de título universitario',
    status: 'pendiente' as TramiteStatus,
    priority: 'normal' as TramitePriority,
    userId: 'user1',
    assignedTo: 'docente1',
    createdAt: '2024-02-08T10:00:00Z',
    updatedAt: '2024-02-08T10:00:00Z',
    documents: [],
    comments: [],
    requirements: [],
  },
  {
    id: '2',
    type: 'legalizacion' as TramiteType,
    title: 'Legalización de documentos para uso internacional',
    status: 'en_revision' as TramiteStatus,
    priority: 'alta' as TramitePriority,
    userId: 'user2',
    assignedTo: 'docente2',
    createdAt: '2024-02-07T15:30:00Z',
    updatedAt: '2024-02-08T09:15:00Z',
    documents: [],
    comments: [],
    requirements: [],
  },
  {
    id: '3',
    type: 'protocolizacion' as TramiteType,
    title: 'Protocolización de contrato de compraventa',
    status: 'aprobado' as TramiteStatus,
    priority: 'urgente' as TramitePriority,
    userId: 'user3',
    assignedTo: 'docente1',
    createdAt: '2024-02-06T08:45:00Z',
    updatedAt: '2024-02-08T11:20:00Z',
    documents: [],
    comments: [],
    requirements: [],
  },
];

const TramitesList: React.FC = () => {
  const { user, checkPermission } = useAuthContext();
  const [tramites, setTramites] = useState(mockTramites);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const filteredTramites = tramites.filter(tramite => {
    if (filters.type && tramite.type !== filters.type) return false;
    if (filters.status && tramite.status !== filters.status) return false;
    if (filters.priority && tramite.priority !== filters.priority) return false;
    if (filters.search && !tramite.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: TramiteStatus) => {
    const statusConfig = TRAMITE_STATUS[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
        {statusConfig.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: TramitePriority) => {
    const priorityConfig = TRAMITE_PRIORITIES[priority];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${priorityConfig.color}-100 text-${priorityConfig.color}-800`}>
        {priorityConfig.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Trámites
              </h1>
              <p className="text-sm text-gray-600">
                Administra y supervisa todos los trámites del sistema
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {checkPermission('tramites.create') && (
                <Button variant="primary">
                  Nuevo Trámite
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Buscar trámites..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-64"
              />
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              {filteredTramites.length} trámites encontrados
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Trámite
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(TRAMITE_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(TRAMITE_STATUS).map(([key, status]) => (
                    <option key={key} value={key}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las prioridades</option>
                  {Object.entries(TRAMITE_PRIORITIES).map(([key, priority]) => (
                    <option key={key} value={key}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trámite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTramites.map((tramite) => (
                  <tr key={tramite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tramite.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {tramite.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {TRAMITE_TYPES[tramite.type].label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tramite.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(tramite.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tramite.assignedTo || 'Sin asignar'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(tramite.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {checkPermission('tramites.read') && (
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        )}
                        {checkPermission('tramites.update') && (
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        )}
                        {checkPermission('tramites.delete') && (
                          <Button variant="outline" size="sm">
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTramites.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron trámites</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Intenta ajustar los filtros de búsqueda.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TramitesList; 