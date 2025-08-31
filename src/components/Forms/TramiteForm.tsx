import React, { useState } from 'react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { TramiteType, TramitePriority, CreateTramiteData } from '../../types/tramites';
import { TRAMITE_TYPES, TRAMITE_PRIORITIES } from '../../constants/status';

interface TramiteFormProps {
  onSubmit: (data: CreateTramiteData) => void;
  onCancel: () => void;
  initialData?: Partial<CreateTramiteData>;
  isLoading?: boolean;
}

const TramiteForm: React.FC<TramiteFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateTramiteData>({
    type: initialData?.type || 'certificacion',
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'normal',
    requirements: initialData?.requirements || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Trámite
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de trámite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Trámite *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(TRAMITE_TYPES).map(([key, type]) => (
                <option key={key} value={key}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {TRAMITE_TYPES[formData.type].description}
            </p>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad *
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(TRAMITE_PRIORITIES).map(([key, priority]) => (
                <option key={key} value={key}>
                  {priority.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {TRAMITE_PRIORITIES[formData.priority].description}
            </p>
          </div>
        </div>

        {/* Título */}
        <div className="mt-4">
          <Input
            type="text"
            name="title"
            label="Título del Trámite"
            placeholder="Ej: Certificación de título universitario"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
          />
        </div>

        {/* Descripción */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Describe detalladamente el trámite que necesitas realizar..."
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Mínimo 10 caracteres
          </p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Información Importante
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Tiempo estimado:</strong> {TRAMITE_TYPES[formData.type].estimatedTime}</p>
          <p><strong>Requisitos:</strong></p>
          <ul className="list-disc list-inside ml-2">
            {TRAMITE_TYPES[formData.type].requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creando...' : 'Crear Trámite'}
        </Button>
      </div>
    </form>
  );
};

export default TramiteForm; 