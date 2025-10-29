import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import './Login.css';

export function Login() {
  const [ci, setCi] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(ci, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <h1>🔐 SGST</h1>
            <p>Sistema de Gestión de Trámites</p>
          </div>
          <h2>Clínica Notarial</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="ci">
              <FaUser className="label-icon" />
              Cédula de Identidad
            </label>
            <input
              id="ci"
              type="text"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              placeholder="Ingrese su CI"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="label-icon" />
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              disabled={loading}
            />
            <small className="form-hint">
              Por ahora, solo ingrese su CI para acceder
            </small>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>Iniciando sesión...</>
            ) : (
              <>
                <FaSignInAlt /> Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Sistema de Gestión de Trámites Notariales</p>
          <small>© 2024 Clínica Notarial Universitaria</small>
        </div>
      </div>
    </div>
  );
}
