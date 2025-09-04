import React, { useState } from 'react';

interface TramiteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTramite: (data: any) => Promise<{ success: boolean; error?: string }>;
}

const TramiteFormModal: React.FC<TramiteFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateTramite 
}) => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    applicant: '',
    description: '',
    priority: 'NORMAL'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.type || !formData.title || !formData.applicant || !formData.description) {
      setError('Por favor, completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onCreateTramite({
        type: formData.type,
        title: formData.title,
        applicant: formData.applicant,
        description: formData.description,
        priority: formData.priority,
        userId: '1' // Usuario por defecto por ahora
      });

      if (result.success) {
        // Limpiar formulario
        setFormData({
          type: '',
          title: '',
          applicant: '',
          description: '',
          priority: 'NORMAL'
        });
        onClose();
      } else {
        setError(result.error || 'No se pudo crear el trámite');
      }
    } catch (error) {
      setError('Error inesperado al crear el trámite');
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
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título del Trámite *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título descriptivo del trámite"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descripción detallada del trámite"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
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
              <option value="LOW">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
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
