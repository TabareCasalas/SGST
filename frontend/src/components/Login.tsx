import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export function Login() {
  const { login } = useAuth();
  const [ci, setCi] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(ci, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h1>SGST</h1>
          <p>Sistema de Gestión de Trámites</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="ci">
              <span className="label-icon">👤</span>
              Cédula de Identidad
            </label>
            <input
              id="ci"
              type="text"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              placeholder="12345678"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔑</span>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading || !ci || !password}
          >
            {isLoading ? (
              <>
                <span className="spinner-small"></span>
                Iniciando sesión...
              </>
            ) : (
              '🔓 Iniciar Sesión'
            )}
          </button>

          <div className="login-help">
            <p className="login-hint">
              <strong>Credenciales de prueba:</strong>
            </p>
            <ul className="credentials-list">
              <li><code>CI: 12345678</code> - Admin Sistema</li>
              <li><code>CI: 87654321</code> - Admin Docente</li>
              <li><code>CI: 11111111</code> - Docente Responsable</li>
              <li><code>CI: 55555555</code> - Estudiante</li>
            </ul>
            <p className="login-hint">
              <strong>Contraseña:</strong> <code>password123</code>
            </p>
          </div>
        </form>

        <footer className="login-footer">
          <p>© 2024 Clínica Notarial Universitaria</p>
        </footer>
      </div>
    </div>
  );
}

