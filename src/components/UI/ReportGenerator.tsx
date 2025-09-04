import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useAppNotifications } from '../../hooks/useAppNotifications';

interface ReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ isOpen, onClose }) => {
  const { tramites, usuarios } = useAppStore();
  const { showSuccess, showError } = useAppNotifications();
  const [reportType, setReportType] = useState('tramites');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let reportData = '';
      
      if (reportType === 'tramites') {
        reportData = generateTramitesReport();
      } else if (reportType === 'usuarios') {
        reportData = generateUsuariosReport();
      } else if (reportType === 'estadisticas') {
        reportData = generateEstadisticasReport();
      }
      
      // Simular descarga
      const blob = new Blob([reportData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Reporte generado', 'El reporte se ha descargado correctamente');
      onClose();
    } catch (error) {
      showError('Error', 'No se pudo generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTramitesReport = () => {
    const report = [
      'REPORTE DE TRÁMITES',
      '==================',
      `Fecha de generación: ${new Date().toLocaleString()}`,
      `Total de trámites: ${tramites.length}`,
      '',
      'DETALLE DE TRÁMITES:',
      '-------------------'
    ];
    
    tramites.forEach(tramite => {
      report.push(`ID: ${tramite.id}`);
      report.push(`Tipo: ${tramite.type}`);
      report.push(`Solicitante: ${tramite.applicant}`);
      report.push(`Estado: ${tramite.status}`);
      report.push(`Prioridad: ${tramite.priority || 'No especificada'}`);
      report.push(`Descripción: ${tramite.description}`);
      report.push('---');
    });
    
    return report.join('\n');
  };

  const generateUsuariosReport = () => {
    const report = [
      'REPORTE DE USUARIOS',
      '===================',
      `Fecha de generación: ${new Date().toLocaleString()}`,
      `Total de usuarios: ${usuarios.length}`,
      '',
      'DETALLE DE USUARIOS:',
      '--------------------'
    ];
    
    usuarios.forEach(usuario => {
      report.push(`ID: ${usuario.id}`);
      report.push(`Nombre: ${usuario.name}`);
      report.push(`Email: ${usuario.email}`);
      report.push(`Rol: ${usuario.role}`);
      report.push(`Estado: ${usuario.isActive ? 'Activo' : 'Inactivo'}`);
      report.push('---');
    });
    
    return report.join('\n');
  };

  const generateEstadisticasReport = () => {
    const tramitesPorEstado = tramites.reduce((acc, tramite) => {
      acc[tramite.status] = (acc[tramite.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const usuariosPorRol = usuarios.reduce((acc, usuario) => {
      acc[usuario.role] = (acc[usuario.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const report = [
      'REPORTE DE ESTADÍSTICAS',
      '========================',
      `Fecha de generación: ${new Date().toLocaleString()}`,
      '',
      'ESTADÍSTICAS DE TRÁMITES:',
      '-------------------------',
      `Total de trámites: ${tramites.length}`,
      ...Object.entries(tramitesPorEstado).map(([estado, cantidad]) => 
        `${estado}: ${cantidad}`
      ),
      '',
      'ESTADÍSTICAS DE USUARIOS:',
      '-------------------------',
      `Total de usuarios: ${usuarios.length}`,
      ...Object.entries(usuariosPorRol).map(([rol, cantidad]) => 
        `${rol}: ${cantidad}`
      ),
      '',
      'RESUMEN:',
      '--------',
      `Usuarios activos: ${usuarios.filter(u => u.isActive).length}`,
      `Trámites pendientes: ${tramitesPorEstado.pendiente || 0}`,
      `Trámites completados: ${tramitesPorEstado.completado || 0}`
    ];
    
    return report.join('\n');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Generar Reporte
          </h3>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="tramites">Reporte de Trámites</option>
              <option value="usuarios">Reporte de Usuarios</option>
              <option value="estadisticas">Reporte de Estadísticas</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Información del reporte:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {reportType === 'tramites' && (
                <>
                  <li>• Lista completa de trámites</li>
                  <li>• Estado y prioridad de cada trámite</li>
                  <li>• Información del solicitante</li>
                </>
              )}
              {reportType === 'usuarios' && (
                <>
                  <li>• Lista completa de usuarios</li>
                  <li>• Roles y estado de cada usuario</li>
                  <li>• Información de contacto</li>
                </>
              )}
              {reportType === 'estadisticas' && (
                <>
                  <li>• Estadísticas generales del sistema</li>
                  <li>• Distribución por estados y roles</li>
                  <li>• Resumen ejecutivo</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isGenerating}
          >
            Cancelar
          </button>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;