import type { Tramite } from '../types/tramite';
import './TareaCard.css';

interface Props {
  tramite: Tramite;
  onCompletar: (tramiteId: number, aprobado: boolean) => void;
}

export function TareaCard({ tramite, onCompletar }: Props) {
  if (tramite.estado !== 'en_revision') {
    return null; // Solo mostrar si está en revisión
  }

  return (
    <div className="tarea-card">
      <div className="tarea-header">
        <h3>🔄 Tarea Pendiente</h3>
        <span className="badge-en-revision">En Revisión</span>
      </div>
      
      <div className="tarea-body">
        <p><strong>Trámite #{tramite.num_carpeta}</strong></p>
        {tramite.consultante?.usuario && (
          <p>Consultante: {tramite.consultante.usuario.nombre}</p>
        )}
        {tramite.grupo && (
          <p>Grupo: {tramite.grupo.nombre}</p>
        )}
        <p>Fecha inicio: {new Date(tramite.fecha_inicio).toLocaleString()}</p>
      </div>

      <div className="tarea-actions">
        <button 
          onClick={() => onCompletar(tramite.id_tramite, true)} 
          className="btn-aprobar"
        >
          ✅ Aprobar
        </button>
        <button 
          onClick={() => onCompletar(tramite.id_tramite, false)} 
          className="btn-rechazar"
        >
          ❌ Rechazar
        </button>
      </div>
    </div>
  );
}

