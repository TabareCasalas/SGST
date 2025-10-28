import { useEffect, useState } from 'react';
import './NotificationBanner.css';

interface Notification {
  id_notificacion: number;
  id_tramite: number;
  tipo_notificacion: string;
  mensaje: string;
  created_at: string;
  enviado: boolean;
}

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Recargar notificaciones cada 10 segundos
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notificaciones');
      if (response.ok) {
        const data = await response.json();
        // Mostrar todas las notificaciones, no filtrar por enviado
        setNotifications(data);
        setShow(data.length > 0);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:3001/api/notificaciones/${id}/leer`, {
        method: 'PATCH',
      });
      loadNotifications();
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  if (!show || notifications.length === 0) return null;

  return (
    <div className="notification-banner">
      {notifications.map(notification => (
        <div 
          key={notification.id_notificacion} 
          className={`notification-card ${notification.tipo_notificacion}`}
        >
          <div className="notification-content">
            <div className="notification-icon">
              {notification.tipo_notificacion === 'aprobacion' ? '✅' : '❌'}
            </div>
            <div className="notification-text">
              <strong>Trámite #{notification.id_tramite}</strong>
              <p>{notification.mensaje}</p>
              <small>{new Date(notification.created_at).toLocaleString()}</small>
            </div>
          </div>
          <button 
            className="notification-close"
            onClick={() => markAsRead(notification.id_notificacion)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

