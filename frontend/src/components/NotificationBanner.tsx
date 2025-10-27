import { useEffect, useState } from 'react';
import './NotificationBanner.css';

interface Notification {
  id: number;
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
        const unread = data.filter((n: Notification) => !n.enviado);
        setNotifications(unread);
        setShow(unread.length > 0);
      }
    } catch (error) {
      // Silenciar errores si el endpoint no existe aún
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
          key={notification.id} 
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
            onClick={() => markAsRead(notification.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

