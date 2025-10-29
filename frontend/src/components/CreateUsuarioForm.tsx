import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './CreateUsuarioForm.css';

interface Grupo {
  id_grupo: number;
  nombre: string;
  descripcion?: string;
}

interface Props {
  onSuccess?: () => void;
}

export function CreateUsuarioForm({ onSuccess }: Props) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Form data
  const [formData, setFormData] = useState({
    nombre: '',
    ci: '',
    domicilio: '',
    telefono: '',
    correo: '',
    rol: 'estudiante',
    nivel_acceso: '',
    semestre: '',
    id_grupo: '',
  });

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      const data = await ApiService.getGrupos();
      setGrupos(data.filter((g: Grupo) => g.id_grupo));
    } catch (err) {
      console.error('Error cargando grupos:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {
        nombre: formData.nombre,
        ci: formData.ci,
        domicilio: formData.domicilio,
        telefono: formData.telefono,
        correo: formData.correo,
        rol: formData.rol,
      };

      // Agregar nivel_acceso si es administrador
      if (formData.rol === 'administrador' && formData.nivel_acceso) {
        data.nivel_acceso = parseInt(formData.nivel_acceso);
      }

      // Solo agregar semestre y grupo si es estudiante
      if (formData.rol === 'estudiante') {
        data.semestre = formData.semestre;
        data.id_grupo = parseInt(formData.id_grupo);
      }

      await ApiService.createUsuario(data);
      showToast('Usuario creado exitosamente', 'success');
      
      // Reset form
      setFormData({
        nombre: '',
        ci: '',
        domicilio: '',
        telefono: '',
        correo: '',
        rol: 'estudiante',
        nivel_acceso: '',
        semestre: '',
        id_grupo: '',
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-usuario-container">
      <h2>➕ Crear Nuevo Usuario</h2>

      <form onSubmit={handleSubmit} className="usuario-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo *</label>
            <input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              disabled={loading}
              placeholder="Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ci">Cédula de Identidad *</label>
            <input
              id="ci"
              type="text"
              value={formData.ci}
              onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
              required
              disabled={loading}
              placeholder="12345678"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico *</label>
            <input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              required
              disabled={loading}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              id="telefono"
              type="text"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
              disabled={loading}
              placeholder="0987654321"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="domicilio">Domicilio *</label>
          <input
            id="domicilio"
            type="text"
            value={formData.domicilio}
            onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
            required
            disabled={loading}
            placeholder="Calle, número, ciudad"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rol">Rol *</label>
          <select
            id="rol"
            value={formData.rol}
            onChange={(e) => setFormData({ ...formData, rol: e.target.value, semestre: '', id_grupo: '', nivel_acceso: '' })}
            required
            disabled={loading}
          >
            <option value="estudiante">👨‍🎓 Estudiante</option>
            <option value="docente">👨‍🏫 Docente</option>
            <option value="consultante">👤 Consultante</option>
            <option value="administrador">👨‍💼 Administrador</option>
          </select>
        </div>

        {formData.rol === 'administrador' && (
          <div className="form-group">
            <label htmlFor="nivel_acceso">Nivel de Acceso *</label>
            <select
              id="nivel_acceso"
              value={formData.nivel_acceso}
              onChange={(e) => setFormData({ ...formData, nivel_acceso: e.target.value })}
              required
              disabled={loading}
            >
              <option value="">Seleccionar nivel</option>
              <option value="3">Nivel 3 - Administrador del Sistema</option>
              <option value="2">Nivel 2 - Administrador Docente</option>
              <option value="1">Nivel 1 - Administrador Administrativo</option>
            </select>
          </div>
        )}

        {formData.rol === 'estudiante' && (
          <>
            <div className="form-group">
              <label htmlFor="semestre">Semestre *</label>
              <input
                id="semestre"
                type="text"
                value={formData.semestre}
                onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                required
                disabled={loading}
                placeholder="2024-1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_grupo">Grupo *</label>
              <select
                id="id_grupo"
                value={formData.id_grupo}
                onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
                required
                disabled={loading}
              >
                <option value="">Seleccionar grupo</option>
                {grupos.map((g) => (
                  <option key={g.id_grupo} value={g.id_grupo}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creando...' : '👤 Crear Usuario'}
        </button>
      </form>
    </div>
  );
}

