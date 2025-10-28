import { useState } from 'react';
import './RechazoModal.css';

interface RechazoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (razon: string) => void;
}

export function RechazoModal({ isOpen, onClose, onConfirm }: RechazoModalProps) {
  const [razon, setRazon] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (razon.trim()) {
      onConfirm(razon);
      setRazon('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>❌ Rechazar Trámite</h3>
        <p>Por favor, indica la razón del rechazo:</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={razon}
            onChange={(e) => setRazon(e.target.value)}
            placeholder="Ej: Documentación incompleta, falta de requisitos, etc."
            className="razon-input"
            rows={4}
            required
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-rechazar-modal" disabled={!razon.trim()}>
              Confirmar Rechazo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

