import { useState } from 'react';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './ImportUsuariosModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ImportResult {
  total: number;
  exitosos: number;
  errores: number;
  detalles: Array<{
    fila: number;
    usuario: string;
    estado: string;
    error?: string;
  }>;
}

export function ImportUsuariosModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar que sea un archivo Excel
      const validExtensions = ['.xls', '.xlsx'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        showToast('Por favor selecciona un archivo Excel (.xls o .xlsx)', 'error');
        return;
      }

      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast('Por favor selecciona un archivo', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await ApiService.importUsuariosFromExcel(file);
      setResult(response);
      
      if (response.exitosos > 0) {
        showToast(
          `Importación completada: ${response.exitosos} usuarios creados exitosamente`,
          'success'
        );
      }
      
      if (response.errores > 0) {
        showToast(
          `Importación completada con ${response.errores} error(es). Revisa los detalles.`,
          'warning'
        );
      }

      if (onSuccess && response.exitosos > 0) {
        onSuccess();
      }
    } catch (error: any) {
      showToast('Error al importar usuarios: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="import-usuarios-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Importar Usuarios desde Excel</h2>
          <button className="close-btn" onClick={handleClose} title="Cerrar">
            ×
          </button>
        </div>
        <div className="modal-content">
          {/* Instrucciones */}
          <div className="import-instructions">
            <h3>Formato del Archivo Excel</h3>
            <p>El archivo Excel debe tener las siguientes columnas en la primera fila:</p>
            
            <div className="columns-list">
              <div className="column-item">
                <strong>Columnas Requeridas:</strong>
                <ul>
                  <li><code>nombre</code> - Nombre completo del usuario</li>
                  <li><code>ci</code> - Cédula de identidad (único)</li>
                  <li><code>domicilio</code> - Dirección del usuario</li>
                  <li><code>telefono</code> - Número de teléfono</li>
                  <li><code>correo</code> - Correo electrónico (único)</li>
                  <li><code>rol</code> - Rol del usuario: <code>estudiante</code>, <code>docente</code>, <code>consultante</code> o <code>administrador</code></li>
                </ul>
              </div>
              
              <div className="column-item">
                <strong>Columnas Opcionales:</strong>
                <ul>
                  <li><code>semestre</code> - Semestre (requerido si rol es <code>estudiante</code>)</li>
                  <li><code>nivel_acceso</code> - Nivel de acceso: <code>1</code> (Administrativo) o <code>3</code> (Sistema). Requerido si rol es <code>administrador</code></li>
                  <li><code>password</code> - Contraseña (si no se proporciona, se usará <code>Usuario123</code> por defecto)</li>
                </ul>
              </div>
            </div>

            <div className="example-section">
              <strong>Ejemplo de formato:</strong>
              <div className="example-table">
                <table>
                  <thead>
                    <tr>
                      <th>nombre</th>
                      <th>ci</th>
                      <th>domicilio</th>
                      <th>telefono</th>
                      <th>correo</th>
                      <th>rol</th>
                      <th>semestre</th>
                      <th>nivel_acceso</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Juan Pérez</td>
                      <td>12345678</td>
                      <td>Av. Principal 123</td>
                      <td>099123456</td>
                      <td>juan@example.com</td>
                      <td>estudiante</td>
                      <td>2024-1</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>María García</td>
                      <td>87654321</td>
                      <td>Calle Secundaria 456</td>
                      <td>098765432</td>
                      <td>maria@example.com</td>
                      <td>docente</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Admin Sistema</td>
                      <td>11111111</td>
                      <td>Dirección Admin</td>
                      <td>097111111</td>
                      <td>admin@example.com</td>
                      <td>administrador</td>
                      <td></td>
                      <td>3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="notes-section">
              <strong>Notas importantes:</strong>
              <ul>
                <li>La primera fila debe contener los nombres de las columnas</li>
                <li>Los nombres de las columnas no son case-sensitive (pueden estar en mayúsculas o minúsculas)</li>
                <li>Los roles válidos son: <code>estudiante</code>, <code>docente</code>, <code>consultante</code>, <code>administrador</code></li>
                <li>Si el rol es <code>estudiante</code>, el campo <code>semestre</code> es obligatorio</li>
                <li>Si el rol es <code>administrador</code>, el campo <code>nivel_acceso</code> es obligatorio (1 o 3)</li>
                <li>No se pueden importar usuarios con CI o correo que ya existan en el sistema</li>
                <li>Si no se proporciona contraseña, se usará <code>Usuario123</code> por defecto</li>
              </ul>
            </div>
          </div>

          {/* Selector de archivo */}
          <div className="file-selector">
            <label htmlFor="excel-file" className="file-label">
              Seleccionar archivo Excel
            </label>
            <input
              id="excel-file"
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              disabled={loading}
            />
            {file && (
              <div className="file-info">
                <span>Archivo seleccionado: {file.name}</span>
                <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}
          </div>

          {/* Resultados */}
          {result && (
            <div className="import-results">
              <h3>Resultados de la Importación</h3>
              <div className="results-summary">
                <div className="summary-item success">
                  <strong>Exitosos:</strong> {result.exitosos}
                </div>
                <div className="summary-item error">
                  <strong>Errores:</strong> {result.errores}
                </div>
                <div className="summary-item total">
                  <strong>Total:</strong> {result.total}
                </div>
              </div>

              {result.errores > 0 && (
                <div className="errors-list">
                  <h4>Detalles de Errores:</h4>
                  <div className="errors-scroll">
                    {result.detalles
                      .filter((d) => d.estado === 'error')
                      .map((detalle, index) => (
                        <div key={index} className="error-item">
                          <strong>Fila {detalle.fila}:</strong> {detalle.usuario} - {detalle.error}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {result.exitosos > 0 && (
                <div className="success-list">
                  <h4>Usuarios Creados Exitosamente:</h4>
                  <div className="success-scroll">
                    {result.detalles
                      .filter((d) => d.estado === 'exitoso')
                      .map((detalle, index) => (
                        <div key={index} className="success-item">
                          <strong>Fila {detalle.fila}:</strong> {detalle.usuario}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="btn-primary"
              disabled={!file || loading}
            >
              {loading ? 'Importando...' : 'Importar Usuarios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

