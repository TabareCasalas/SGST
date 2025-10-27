import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import type { Consultante, Grupo } from '../types/tramite';
import './CreateTramiteForm.css';

interface Props {
  onSuccess?: () => void;
}

export function CreateTramiteForm({ onSuccess }: Props) {
  const [consultantes, setConsultantes] = useState<Consultante[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    id_consultante: '',
    id_grupo: '',
    num_carpeta: '',
    observaciones: '',
  });

  useEffect(() => {
    loadConsultantes();
    loadGrupos();
  }, []);

  const loadConsultantes = async () => {
    try {
      const data = await ApiService.getConsultantes();
      setConsultantes(data);
    } catch (err) {
      console.error('Error cargando consultantes:', err);
    }
  };

  const loadGrupos = async () => {
    try {
      const data = await ApiService.getGrupos();
      setGrupos(data);
    } catch (err) {
      console.error('Error cargando grupos:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const data = {
        id_consultante: parseInt(formData.id_consultante),
        id_grupo: parseInt(formData.id_grupo),
        num_carpeta: parseInt(formData.num_carpeta),
        observaciones: formData.observaciones || undefined,
      };

      await ApiService.createTramite(data);
      setSuccess('Trámite creado exitosamente. Se ha iniciado el proceso en Camunda.');
      
      // Reset form
      setFormData({
        id_consultante: '',
        id_grupo: '',
        num_carpeta: '',
        observaciones: '',
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear trámite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-tramite-container">
      <h2>➕ Crear Nuevo Trámite</h2>

      <form onSubmit={handleSubmit} className="tramite-form">
        <div className="form-group">
          <label htmlFor="consultante">Consultante *</label>
          <select
            id="consultante"
            value={formData.id_consultante}
            onChange={(e) => setFormData({ ...formData, id_consultante: e.target.value })}
            required
            disabled={loading}
          >
            <option value="">Seleccionar consultante</option>
            {consultantes.map((c) => (
              <option key={c.id_consultante} value={c.id_consultante}>
                {c.usuario?.nombre || `Consultante #${c.id_consultante}`} - CI: {c.usuario?.ci}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="grupo">Grupo *</label>
          <select
            id="grupo"
            value={formData.id_grupo}
            onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
            required
            disabled={loading}
          >
            <option value="">Seleccionar grupo</option>
            {grupos.map((g) => (
              <option key={g.id_grupo} value={g.id_grupo}>
                {g.nombre} - {g.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="num_carpeta">Número de Carpeta *</label>
          <input
            id="num_carpeta"
            type="number"
            value={formData.num_carpeta}
            onChange={(e) => setFormData({ ...formData, num_carpeta: e.target.value })}
            required
            disabled={loading}
            placeholder="Ej: 12345"
          />
        </div>

        <div className="form-group">
          <label htmlFor="observaciones">Observaciones</label>
          <textarea
            id="observaciones"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            disabled={loading}
            rows={3}
            placeholder="Observaciones adicionales..."
          />
        </div>

        {error && <div className="alert alert-error">❌ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creando...' : '📝 Crear Trámite'}
        </button>
      </form>
    </div>
  );
}

