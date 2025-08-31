import React, { useState, useRef } from 'react';

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface DocumentUploadProps {
  documents: Document[];
  onUpload: (files: File[]) => void;
  onDelete: (documentId: string) => void;
  onStatusChange: (documentId: string, status: 'approved' | 'rejected') => void;
  maxFiles?: number;
  maxSize?: number; // en MB
  acceptedTypes?: string[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onUpload,
  onDelete,
  onStatusChange,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      validateAndUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      validateAndUpload(files);
    }
  };

  const validateAndUpload = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Verificar tamaño
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name} es demasiado grande (máximo ${maxSize}MB)`);
        return;
      }

      // Verificar tipo
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        errors.push(`${file.name} no es un tipo de archivo válido`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('Errores de validación:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de subida */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <p className="text-lg font-medium text-gray-700">
            Arrastra archivos aquí o
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            selecciona archivos
          </button>
          <p className="text-sm text-gray-500">
            Tipos permitidos: {acceptedTypes.join(', ')} | Máximo: {maxSize}MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Lista de documentos */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Documentos ({documents.length})
          </h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
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
                        onClick={() => onStatusChange(doc.id, 'approved')}
                        className="text-green-600 hover:text-green-800 text-sm"
                        title="Aprobar"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => onStatusChange(doc.id, 'rejected')}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Rechazar"
                      >
                        ❌
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => onDelete(doc.id)}
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
  );
};

export default DocumentUpload; 