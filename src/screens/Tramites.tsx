import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Sidebar from '../components/Layout/Sidebar';
import { useTramites } from '../hooks/useTramites';
import type { CreateTramiteRequest } from '../types/auth';

const Tramites: React.FC = () => {
  const { user } = useAuthContext();
  const { tramites, loading, error, createTramite, deleteTramite } = useTramites();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id_consultante: '',
    id_grupo: '',
    num_carpeta: '',
    observaciones: ''
  });
  const [consultantes, setConsultantes] = useState<Array<{id_consultante: number, usuario?: {nombre: string, correo: string}}>>([]);
  const [grupos, setGrupos] = useState<Array<{id_grupo: number, nombre: string}>>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Cargar opciones para el formulario
  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Cargar consultantes
      const consultantesResponse = await fetch('http://localhost:3001/api/tramites/consultantes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (consultantesResponse.ok) {
        const consultantesData = await consultantesResponse.json();
        setConsultantes(consultantesData.data || consultantesData);
      }

      // Cargar grupos
      const gruposResponse = await fetch('http://localhost:3001/api/tramites/grupos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (gruposResponse.ok) {
        const gruposData = await gruposResponse.json();
        setGrupos(gruposData.data || gruposData);
      }
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const filteredTramites = (tramites || []).filter(tramite => {
    const matchesSearch = tramite.num_carpeta.toString().includes(searchTerm) ||
                         tramite.consultante?.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tramite.grupo?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'todos' || tramite.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateTramite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('🔍 Frontend - Form data:', formData);
      const tramiteData = {
        id_consultante: parseInt(formData.id_consultante),
        id_grupo: parseInt(formData.id_grupo),
        num_carpeta: parseInt(formData.num_carpeta),
        observaciones: formData.observaciones
      };
      console.log('🔍 Frontend - Parsed data:', tramiteData);
      await createTramite(tramiteData);
      
      setShowModal(false);
      setFormData({ 
        id_consultante: '', 
        id_grupo: '', 
        num_carpeta: '', 
        observaciones: '' 
      });
    } catch (error) {
      console.error('Error al crear trámite:', error);
    }
  };

  const handleDeleteTramite = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este trámite?')) {
      try {
        await deleteTramite(id);
      } catch (error) {
        console.error('Error al eliminar trámite:', error);
      }
    }
  };

  // Cargar opciones cuando se abre el modal
  useEffect(() => {
    if (showModal) {
      loadOptions();
    }
  }, [showModal]);

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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando trámites...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar trámites</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Trámites
            </h1>
            <p className="text-gray-600">
              Administra los trámites del sistema
            </p>
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filtros y búsqueda */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por número de carpeta, consultante o grupo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Nuevo Trámite
            </Button>
          </div>

          {/* Tabla de trámites */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número de Carpeta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consultante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grupo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Inicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTramites.map((tramite) => (
                    <tr key={tramite.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{tramite.num_carpeta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tramite.consultante?.usuario?.nombre || 'Sin consultante'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tramite.grupo?.nombre || 'Sin grupo'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tramite.estado)}`}>
                          {tramite.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(tramite.fecha_inicio).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteTramite(tramite.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal para crear trámite */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nuevo Trámite
              </h3>
              {loadingOptions && (
                <div className="mb-4 text-sm text-gray-600">
                  Cargando opciones...
                </div>
              )}
              <form onSubmit={handleCreateTramite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Consultante
                  </label>
                  <select
                    value={formData.id_consultante}
                    onChange={(e) => setFormData({ ...formData, id_consultante: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingOptions}
                  >
                    <option value="">Seleccionar consultante...</option>
                    {consultantes.map((consultante) => (
                      <option key={consultante.id_consultante} value={consultante.id_consultante}>
                        {consultante.usuario?.nombre} - {consultante.usuario?.correo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Grupo
                  </label>
                  <select
                    value={formData.id_grupo}
                    onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingOptions}
                  >
                    <option value="">Seleccionar grupo...</option>
                    {grupos.map((grupo) => (
                      <option key={grupo.id_grupo} value={grupo.id_grupo}>
                        {grupo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Carpeta
                  </label>
                  <Input
                    type="number"
                    value={formData.num_carpeta}
                    onChange={(e) => setFormData({ ...formData, num_carpeta: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Crear Trámite
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tramites;
