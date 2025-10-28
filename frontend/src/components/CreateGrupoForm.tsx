import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './CreateGrupoForm.css';

interface Usuario {
  id_usuario: number;
  nombre: string;
  ci: string;
  rol: string;
  activo?: boolean;
}

interface Props {
  onSuccess?: () => void;
}

export function CreateGrupoForm({ onSuccess }: Props) {
  const [docentes, setDocentes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    responsable_id: '',
    asistentes_ids: [] as string[],
  });

  useEffect(() => {
    loadDocentes();
  }, []);

  const loadDocentes = async () => {
    try {
      // Cargar todos los usuarios y filtrar por roles de docente
      const allUsers = await ApiService.getUsuarios();
      const docenteRoles = ['docente', 'docente_responsable', 'docente_asistente'];
      const docentesList = allUsers.filter((u: Usuario) => 
        docenteRoles.includes(u.rol) && u.activo !== false
      );
      setDocentes(docentesList);
    } catch (err) {
      console.error('Error cargando docentes:', err);
      showToast('Error al cargar docentes', 'error');
    }
  };

  const handleAsistenteToggle = (id: string) => {
    const newAsistentes = formData.asistentes_ids.includes(id)
      ? formData.asistentes_ids.filter(aid => aid !== id)
      : [...formData.asistentes_ids, id];
    
    setFormData({ ...formData, asistentes_ids: newAsistentes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.asistentes_ids.length < 2) {
      showToast('Debe seleccionar al menos 2 docentes asistentes', 'error');
      return;
    }

    if (formData.asistentes_ids.includes(formData.responsable_id)) {
      showToast('El responsable no puede ser asistente también', 'error');
      return;
    }

    setLoading(true);

    try {
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        responsable_id: parseInt(formData.responsable_id),
        asistentes_ids: formData.asistentes_ids.map(id => parseInt(id)),
      };

      await ApiService.createGrupo(data);
      showToast('Grupo creado exitosamente', 'success');
      
      // Reset form
      setFormData({
        nombre: '',
        descripcion: '',
        responsable_id: '',
        asistentes_ids: [],
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const docentesDisponiblesAsistentes = docentes.filter(
    d => d.id_usuario.toString() !== formData.responsable_id
  );

  return (
    <div className="create-grupo-container">
      <h2>👥 Crear Nuevo Grupo</h2>
      <p className="info-text">
        Un grupo debe tener 1 docente responsable y al menos 2 docentes asistentes
      </p>

      <form onSubmit={handleSubmit} className="grupo-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre del Grupo *</label>
          <input
            id="nombre"
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            disabled={loading}
            placeholder="Ej: Grupo 1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            disabled={loading}
            rows={3}
            placeholder="Descripción del grupo..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="responsable">Docente Responsable *</label>
          <select
            id="responsable"
            value={formData.responsable_id}
            onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
            required
            disabled={loading}
          >
            <option value="">Seleccionar docente responsable</option>
            {docentes.map((d) => (
              <option key={d.id_usuario} value={d.id_usuario}>
                {d.nombre} - CI: {d.ci}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Docentes Asistentes * (mínimo 2)</label>
          <div className="asistentes-list">
            {docentesDisponiblesAsistentes.length === 0 ? (
              <p className="no-docentes">
                {formData.responsable_id 
                  ? 'No hay más docentes disponibles como asistentes' 
                  : 'Seleccione primero un responsable'}
              </p>
            ) : (
              docentesDisponiblesAsistentes.map((d) => (
                <div key={d.id_usuario} className="asistente-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.asistentes_ids.includes(d.id_usuario.toString())}
                      onChange={() => handleAsistenteToggle(d.id_usuario.toString())}
                      disabled={loading}
                    />
                    <span>{d.nombre} - CI: {d.ci}</span>
                  </label>
                </div>
              ))
            )}
          </div>
          <p className="selection-count">
            Seleccionados: {formData.asistentes_ids.length} 
            {formData.asistentes_ids.length < 2 && ' (mínimo 2)'}
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading || formData.asistentes_ids.length < 2} 
          className="submit-btn"
        >
          {loading ? 'Creando...' : '👥 Crear Grupo'}
        </button>
      </form>
    </div>
  );
}

