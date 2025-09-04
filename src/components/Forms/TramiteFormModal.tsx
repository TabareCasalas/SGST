import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useAppNotifications } from '../../hooks/useAppNotifications';

interface TramiteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TramiteFormModal: React.FC<TramiteFormModalProps> = ({ isOpen, onClose }) => {
  const { addTramite } = useAppStore();
  const { showSuccess, showError } = useAppNotifications();
  
  const [formData, setFormData] = useState({
    type: '',
    applicant: '',
    description: '',
    priority: 'normal'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.applicant || !formData.description) {
      showError('Error de validación', 'Por favor, completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addTramite({
        type: formData.type,
        applicant: formData.applicant,
        description: formData.description,
        priority: formData.priority
      });
      
      showSuccess('Trámite creado', `Se ha creado el trámite ${formData.type} para ${formData.applicant}`);
      
      // Limpiar formulario
      setFormData({
        type: '',
        applicant: '',
        description: '',
        priority: 'normal'
      });
      
      onClose();
    } catch (error) {
      showError('Error', 'No se pudo crear el trámite. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Crear Nuevo Trámite
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Trámite *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Certificación">Certificación</option>
              <option value="Apostilla">Apostilla</option>
              <option value="Protocolización">Protocolización</option>
              <option value="Legalización">Legalización</option>
            </select>
          </div>

          <div>
            <label htmlFor="applicant" className="block text-sm font-medium text-gray-700 mb-1">
              Solicitante *
            </label>
            <input
              type="text"
              id="applicant"
              name="applicant"
              value={formData.applicant}
              onChange={handleChange}
              placeholder="Nombre completo del solicitante"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="baja">Baja</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción detallada del trámite"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear Trámite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TramiteFormModal;