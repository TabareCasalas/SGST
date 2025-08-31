import React, { useState } from 'react';

export interface ReportData {
  id: string;
  title: string;
  description: string;
  type: 'tramites' | 'usuarios' | 'estadisticas';
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    start: string;
    end: string;
  };
  filters?: {
    status?: string;
    type?: string;
    role?: string;
  };
}

interface ReportGeneratorProps {
  onGenerateReport: (reportData: ReportData) => void;
  isLoading?: boolean;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  onGenerateReport,
  isLoading = false
}) => {
  const [reportData, setReportData] = useState<ReportData>({
    id: '',
    title: '',
    description: '',
    type: 'tramites',
    format: 'pdf',
    dateRange: {
      start: '',
      end: ''
    },
    filters: {}
  });

  const handleInputChange = (field: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportData.title && reportData.dateRange.start && reportData.dateRange.end) {
      onGenerateReport({
        ...reportData,
        id: `REP-${Date.now()}`
      });
    }
  };

  const getReportTypeOptions = () => {
    switch (reportData.type) {
      case 'tramites':
        return [
          { value: 'pendiente', label: 'Pendientes' },
          { value: 'en_proceso', label: 'En Proceso' },
          { value: 'completado', label: 'Completados' },
          { value: 'rechazado', label: 'Rechazados' }
        ];
      case 'usuarios':
        return [
          { value: 'estudiante', label: 'Estudiantes' },
          { value: 'docente', label: 'Docentes' },
          { value: 'consultante', label: 'Consultantes' },
          { value: 'administrador', label: 'Administradores' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Generador de Reportes
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título del Reporte
            </label>
            <input
              type="text"
              value={reportData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Reporte de Trámites - Enero 2024"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <select
              value={reportData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tramites">Trámites</option>
              <option value="usuarios">Usuarios</option>
              <option value="estadisticas">Estadísticas</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={reportData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Descripción del reporte..."
          />
        </div>

        {/* Rango de fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={reportData.dateRange.start}
              onChange={(e) => handleInputChange('dateRange', JSON.stringify({
                ...reportData.dateRange,
                start: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={reportData.dateRange.end}
              onChange={(e) => handleInputChange('dateRange', JSON.stringify({
                ...reportData.dateRange,
                end: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formato
            </label>
            <select
              value={reportData.format}
              onChange={(e) => handleInputChange('format', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        {/* Filtros */}
        {reportData.type !== 'estadisticas' && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Filtros Adicionales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado/Rol
                </label>
                <select
                  value={reportData.filters?.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {getReportTypeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {reportData.type === 'tramites' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Trámite
                  </label>
                  <select
                    value={reportData.filters?.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Certificación">Certificación</option>
                    <option value="Apostilla">Apostilla</option>
                    <option value="Protocolización">Protocolización</option>
                    <option value="Autenticación">Autenticación</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setReportData({
              id: '',
              title: '',
              description: '',
              type: 'tramites',
              format: 'pdf',
              dateRange: { start: '', end: '' },
              filters: {}
            })}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isLoading || !reportData.title || !reportData.dateRange.start || !reportData.dateRange.end}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerator; 