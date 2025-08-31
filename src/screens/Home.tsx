import React from 'react';
import Button from '../components/UI/Button';
import { useAuthContext } from '../hooks/useAuthContext';
import { ROLES } from '../constants/roles';

interface HomeProps {
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (screen: string) => void;
}

const Home: React.FC<HomeProps> = ({ userName = 'Usuario', onLogout, onNavigate }) => {
  const { user } = useAuthContext();

  const getRoleBasedFeatures = () => {
    if (!user) return [];

    switch (user.role) {
      case 'administrador':
        return [
          {
            title: 'Panel de Administración',
            description: 'Acceso completo al sistema con todas las funcionalidades de gestión.',
            icon: '⚙️',
            color: 'bg-red-50 border-red-200',
            textColor: 'text-red-900',
            descColor: 'text-red-700',
                               action: 'Ir al Panel',
                   onClick: () => onNavigate?.('admin')
          },
          {
            title: 'Gestión de Usuarios',
            description: 'Administra usuarios, roles y permisos del sistema.',
            icon: '👥',
            color: 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-900',
            descColor: 'text-blue-700',
                               action: 'Gestionar Usuarios',
                   onClick: () => onNavigate?.('usuarios')
          },
          {
            title: 'Gestión de Trámites',
            description: 'Administra y supervisa todos los trámites del sistema.',
            icon: '📋',
            color: 'bg-green-50 border-green-200',
            textColor: 'text-green-900',
            descColor: 'text-green-700',
            action: 'Ver Trámites',
            onClick: () => onNavigate?.('tramites')
          },
          {
            title: 'Reportes y Estadísticas',
            description: 'Genera reportes personalizados y visualiza estadísticas.',
            icon: '📊',
            color: 'bg-purple-50 border-purple-200',
            textColor: 'text-purple-900',
            descColor: 'text-purple-700',
            action: 'Ver Reportes',
            onClick: () => onNavigate?.('reportes')
          },
          {
            title: 'Configuración del Sistema',
            description: 'Configura parámetros del sistema y permisos.',
            icon: '🔧',
            color: 'bg-gray-50 border-gray-200',
            textColor: 'text-gray-900',
            descColor: 'text-gray-700',
            action: 'Configurar',
            onClick: () => onNavigate?.('configuracion')
          }
        ];

      case 'docente':
        return [
          {
            title: 'Mis Trámites Asignados',
            description: 'Revisa y gestiona los trámites que tienes asignados.',
            icon: '📋',
            color: 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-900',
            descColor: 'text-blue-700',
            action: 'Ver Trámites',
            onClick: () => onNavigate?.('tramites')
          },
          {
            title: 'Gestión de Documentos',
            description: 'Revisa y valida documentos subidos por consultantes.',
            icon: '📄',
            color: 'bg-green-50 border-green-200',
            textColor: 'text-green-900',
            descColor: 'text-green-700',
            action: 'Gestionar Documentos',
            onClick: () => onNavigate?.('documentos')
          },
          {
            title: 'Reportes Académicos',
            description: 'Genera reportes sobre trámites académicos.',
            icon: '📊',
            color: 'bg-purple-50 border-purple-200',
            textColor: 'text-purple-900',
            descColor: 'text-purple-700',
            action: 'Ver Reportes',
            onClick: () => onNavigate?.('reportes')
          },
          {
            title: 'Comunicación',
            description: 'Comunícate con consultantes y estudiantes.',
            icon: '💬',
            color: 'bg-yellow-50 border-yellow-200',
            textColor: 'text-yellow-900',
            descColor: 'text-yellow-700',
            action: 'Ir a Chat',
            onClick: () => onNavigate?.('comunicacion')
          }
        ];

      case 'estudiante':
        return [
          {
            title: 'Mis Trámites',
            description: 'Gestiona tus trámites académicos y personales.',
            icon: '📋',
            color: 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-900',
            descColor: 'text-blue-700',
            action: 'Ver Mis Trámites',
            onClick: () => onNavigate?.('tramites')
          },
          {
            title: 'Subir Documentos',
            description: 'Sube documentos requeridos para tus trámites.',
            icon: '📄',
            color: 'bg-green-50 border-green-200',
            textColor: 'text-green-900',
            descColor: 'text-green-700',
            action: 'Subir Documentos',
            onClick: () => onNavigate?.('documentos')
          },
          {
            title: 'Solicitar Turnos',
            description: 'Solicita turnos con docentes para consultas.',
            icon: '📅',
            color: 'bg-purple-50 border-purple-200',
            textColor: 'text-purple-900',
            descColor: 'text-purple-700',
            action: 'Solicitar Turno',
            onClick: () => onNavigate?.('turnos')
          },
          {
            title: 'Comunicación',
            description: 'Comunícate con docentes y consultantes.',
            icon: '💬',
            color: 'bg-yellow-50 border-yellow-200',
            textColor: 'text-yellow-900',
            descColor: 'text-yellow-700',
            action: 'Ir a Chat',
            onClick: () => onNavigate?.('comunicacion')
          }
        ];

      case 'consultante':
        return [
          {
            title: 'Nuevo Trámite',
            description: 'Crea un nuevo trámite notarial.',
            icon: '➕',
            color: 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-900',
            descColor: 'text-blue-700',
            action: 'Crear Trámite',
            onClick: () => onNavigate?.('tramites')
          },
          {
            title: 'Mis Trámites',
            description: 'Consulta el estado de tus trámites.',
            icon: '📋',
            color: 'bg-green-50 border-green-200',
            textColor: 'text-green-900',
            descColor: 'text-green-700',
            action: 'Ver Mis Trámites',
            onClick: () => onNavigate?.('tramites')
          },
          {
            title: 'Subir Documentos',
            description: 'Sube documentos para tus trámites.',
            icon: '📄',
            color: 'bg-purple-50 border-purple-200',
            textColor: 'text-purple-900',
            descColor: 'text-purple-700',
            action: 'Subir Documentos',
            onClick: () => onNavigate?.('documentos')
          },
          {
            title: 'Solicitar Turno',
            description: 'Solicita un turno con estudiantes o docentes.',
            icon: '📅',
            color: 'bg-yellow-50 border-yellow-200',
            textColor: 'text-yellow-900',
            descColor: 'text-yellow-700',
            action: 'Solicitar Turno',
            onClick: () => onNavigate?.('turnos')
          },
          {
            title: 'Comunicación',
            description: 'Comunícate con operadores del sistema.',
            icon: '💬',
            color: 'bg-gray-50 border-gray-200',
            textColor: 'text-gray-900',
            descColor: 'text-gray-700',
            action: 'Ir a Chat',
            onClick: () => onNavigate?.('comunicacion')
          }
        ];

      default:
        return [];
    }
  };

  const features = getRoleBasedFeatures();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenido, {userName}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Rol: {ROLES[user?.role || 'consultante']}
              </p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Cerrar Sesión
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border ${feature.color} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={feature.onClick}
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{feature.icon}</span>
                  <h3 className={`text-lg font-semibold ${feature.textColor}`}>
                    {feature.title}
                  </h3>
                </div>
                <p className={`mb-4 ${feature.descColor}`}>
                  {feature.description}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    feature.onClick();
                  }}
                >
                  {feature.action}
                </Button>
              </div>
            ))}
          </div>

          {/* Información adicional según el rol */}
          {user?.role === 'consultante' && (
            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Información Importante
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Los trámites se procesan en orden de prioridad</p>
                <p>• Mantén tus documentos actualizados</p>
                <p>• Puedes hacer seguimiento del estado de tus trámites</p>
                <p>• Para consultas urgentes, solicita un turno</p>
              </div>
            </div>
          )}

          {user?.role === 'estudiante' && (
            <div className="mt-8 bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-green-900 mb-2">
                Información Académica
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>• Gestiona tus trámites académicos desde aquí</p>
                <p>• Sube documentos requeridos para tus materias</p>
                <p>• Solicita turnos con docentes para consultas</p>
                <p>• Mantén comunicación con tus profesores</p>
              </div>
            </div>
          )}

          {user?.role === 'docente' && (
            <div className="mt-8 bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-900 mb-2">
                Panel de Docente
              </h4>
              <div className="text-sm text-purple-800 space-y-1">
                <p>• Revisa los trámites asignados a ti</p>
                <p>• Valida documentos subidos por estudiantes</p>
                <p>• Genera reportes académicos</p>
                <p>• Mantén comunicación con estudiantes y consultantes</p>
              </div>
            </div>
          )}

          {user?.role === 'administrador' && (
            <div className="mt-8 bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="text-sm font-semibold text-red-900 mb-2">
                Panel de Administración
              </h4>
              <div className="text-sm text-red-800 space-y-1">
                <p>• Acceso completo al sistema</p>
                <p>• Gestiona usuarios y permisos</p>
                <p>• Supervisa todos los trámites</p>
                <p>• Genera reportes del sistema</p>
                <p>• Configura parámetros del sistema</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 