import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import './NotificationBanner.css';

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Cargar notificaciones no leídas
    loadNotifications();
    // Verificar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // Aquí puedes implementar la lógica para obtener notificaciones
      // Por ahora, dejamos vacío
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  if (notifications.length === 0 || !show) {
    return null;
  }

  return (
    <div className="notification-banner">
      <div className="notification-content">
        <span className="notification-icon">🔔</span>
        <span className="notification-text">
          Tienes {notifications.length} notificación{notifications.length > 1 ? 'es' : ''} nueva{notifications.length > 1 ? 's' : ''}
        </span>
        <button className="notification-close" onClick={() => setShow(false)}>
          ×
        </button>
      </div>
    </div>
  );
}











