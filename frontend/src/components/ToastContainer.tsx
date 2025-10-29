import { useToast } from '../contexts/ToastContext';
import './ToastContainer.css';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-icon">{getToastIcon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}


