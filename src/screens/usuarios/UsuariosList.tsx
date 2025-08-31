import React, { useState } from 'react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import type { User, UserRole } from '../../types/auth';
import { ROLES, ROLE_DESCRIPTIONS } from '../../constants/roles';
import { useAuthContext } from '../../hooks/useAuthContext';

// Mock data para usuarios
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@facultad.edu',
    name: 'Administrador',
    lastName: 'Sistema',
    role: 'administrador',
    permissions: [
      'tramites.create',
      'tramites.read',
      'tramites.update',
      'tramites.delete',
      'documentos.upload',
      'documentos.download',
      'usuarios.manage',
      'reportes.generate',
      'sistema.config',
    ],
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-08T10:00:00Z',
    lastLogin: '2024-02-08T10:00:00Z',
  },
  {
    id: '2',
    email: 'docente@facultad.edu',
    name: 'María',
    lastName: 'García',
    role: 'docente',
    permissions: [
      'tramites.create',
      'tramites.read',
      'tramites.update',
      'tramites.delete',
      'documentos.upload',
      'documentos.download',
      'reportes.generate',
    ],
    isActive: true,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-02-07T16:45:00Z',
    lastLogin: '2024-02-07T16:45:00Z',
  },
  {
    id: '3',
    email: 'estudiante@facultad.edu',
    name: 'Carlos',
    lastName: 'López',
    role: 'estudiante',
    permissions: [
      'tramites.create',
      'tramites.read',
      'tramites.update',
      'documentos.upload',
      'documentos.download',
    ],
    isActive: true,
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-08T08:30:00Z',
    lastLogin: '2024-02-08T08:30:00Z',
  },
  {
    id: '4',
    email: 'consultante@test.com',
    name: 'Ana',
    lastName: 'Rodríguez',
    role: 'consultante',
    permissions: [
      'tramites.create',
      'tramites.read',
      'tramites.update',
      'documentos.upload',
      'documentos.download',
    ],
    isActive: false,
    createdAt: '2024-02-05T11:20:00Z',
    updatedAt: '2024-02-06T15:10:00Z',
    lastLogin: '2024-02-06T15:10:00Z',
  },
];

const UsuariosList: React.FC = () => {
  const { checkPermission } = useAuthContext();
  const [users, setUsers] = useState(mockUsers);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const filteredUsers = users.filter(user => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status && user.isActive !== (filters.status === 'active')) return false;
    if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !user.lastName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !user.email.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      administrador: 'bg-red-100 text-red-800',
      docente: 'bg-purple-100 text-purple-800',
      estudiante: 'bg-blue-100 text-blue-800',
      consultante: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]}`}>
        {ROLES[role]}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Activo' : 'Inactivo'}
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

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Usuarios
              </h1>
              <p className="text-sm text-gray-600">
                Administra usuarios, roles y permisos del sistema
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {checkPermission('usuarios.manage') && (
                <Button variant="primary">
                  Nuevo Usuario
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
                placeholder="Buscar usuarios..."
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
              {filteredUsers.length} usuarios encontrados
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los roles</option>
                  {Object.entries(ROLES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
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
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
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
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.name} {userItem.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userItem.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {getRoleBadge(userItem.role)}
                        <span className="text-xs text-gray-500">
                          {ROLE_DESCRIPTIONS[userItem.role]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(userItem.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.lastLogin ? formatDate(userItem.lastLogin) : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(userItem.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {checkPermission('usuarios.manage') && (
                          <>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleUserStatus(userItem.id)}
                            >
                              {userItem.isActive ? 'Desactivar' : 'Activar'}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
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

export default UsuariosList; 