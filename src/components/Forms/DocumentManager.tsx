import React, { useState } from 'react';
import { useAppNotifications } from '../../hooks/useAppNotifications';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface DocumentManagerProps {
  tramiteId: string;
  onClose: () => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ tramiteId, onClose }) => {
  const { showSuccess, showError } = useAppNotifications();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Verificar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} es demasiado grande (máximo 10MB)`);
        return;
      }

      // Verificar tipo
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        errors.push(`${file.name} no es un tipo de archivo válido`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      showError('Error de validación', errors.join('\n'));
    }

    if (validFiles.length > 0) {
      const newDocuments = validFiles.map(file => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'pending' as const
      }));

      setDocuments(prev => [...prev, ...newDocuments]);
      showSuccess('Documentos subidos', `Se subieron ${validFiles.length} documento(s) correctamente`);
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    showSuccess('Documento eliminado', 'El documento ha sido eliminado');
  };

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, status } : doc
    ));
    showSuccess('Estado actualizado', `El documento ha sido ${status === 'approved' ? 'aprobado' : 'rechazado'}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return 'Pendiente';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Gestión de Documentos - {tramiteId}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Área de carga */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Formatos permitidos: PDF, DOC, DOCX, JPG, PNG (máximo 10MB)
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Seleccionar Archivos
            </label>
          </div>

          {/* Lista de documentos */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Documentos ({documents.length})
              </h4>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.size)} • {doc.type}
                        </p>
                        <p className="text-xs text-gray-400">
                          Subido: {doc.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {getStatusText(doc.status)}
                      </span>
                      {doc.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleStatusChange(doc.id, 'approved')}
                            className="text-green-600 hover:text-green-800 text-sm"
                            title="Aprobar"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleStatusChange(doc.id, 'rejected')}
                            className="text-red-600 hover:text-red-800 text-sm"
                            title="Rechazar"
                          >
                            ❌
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;