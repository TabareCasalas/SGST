import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Sidebar from '../components/Layout/Sidebar';
import { useUsers } from '../hooks/useUsers';

const Usuarios: React.FC = () => {
  const { user } = useAuthContext();
  const { users, loading, error, createUser, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    ci: '',
    telefono: '',
    domicilio: '',
    password: '',
    roles: [] as string[]
  });

  const filteredUsers = (users || []).filter(usuario => {
    const matchesSearch = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.ci.includes(searchTerm);
    const matchesFilter = filterRole === 'todos' || 
                         usuario.roles?.some(role => role.nombre === filterRole) || false;
    return matchesSearch && matchesFilter;
  });

  const handleCreateUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        nombre: formData.nombre,
        correo: formData.correo,
        ci: formData.ci,
        telefono: formData.telefono,
        domicilio: formData.domicilio,
        password: formData.password,
        roles: formData.roles
      });
      
      setShowModal(false);
      setFormData({ 
        nombre: '', 
        correo: '', 
        ci: '', 
        telefono: '', 
        domicilio: '', 
        password: '', 
        roles: [] 
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
    }
  };

  const handleDeleteUsuario = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, role]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r !== role)
      }));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-red-100 text-red-800';
      case 'Moderador':
        return 'bg-yellow-100 text-yellow-800';
      case 'Usuario':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar usuarios</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reintentar
            </Button>
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
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filtros y búsqueda */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, correo o CI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos los roles</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Moderador">Moderador</option>
                    <option value="Usuario">Usuario</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterRole('todos');
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de Usuarios ({filteredUsers.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{usuario.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usuario.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usuario.correo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usuario.ci}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usuario.telefono}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {usuario.roles?.map((role, index) => (
                            <span 
                              key={index}
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role.nombre)}`}
                            >
                              {role.nombre}
                            </span>
                          )) || <span className="text-gray-500 text-xs">Sin roles</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(usuario.fecha_registro).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            Ver
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteUsuario(usuario.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal para nuevo usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nuevo Usuario
            </h3>
            <form onSubmit={handleCreateUsuario} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <Input
                  type="text"
                  placeholder="Nombre del usuario"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.correo}
                  onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula de Identidad
                </label>
                <Input
                  type="text"
                  placeholder="12345678"
                  value={formData.ci}
                  onChange={(e) => setFormData({...formData, ci: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  placeholder="555-0000"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domicilio
                </label>
                <Input
                  type="text"
                  placeholder="Dirección del usuario"
                  value={formData.domicilio}
                  onChange={(e) => setFormData({...formData, domicilio: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <Input
                  type="password"
                  placeholder="Contraseña del usuario"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles
                </label>
                <div className="space-y-2">
                  {['Administrador', 'Moderador', 'Usuario'].map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role)}
                        onChange={(e) => handleRoleChange(role, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Crear Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;