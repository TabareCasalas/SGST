import express from 'express';
import multer from 'multer';
import { usuarioController } from '../controllers/usuarioController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Configurar multer para importación de Excel (solo en memoria)
const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xls, .xlsx)'));
    }
  },
});

// Ruta: GET /api/usuarios
router.get('/', usuarioController.getAll);

// Ruta: GET /api/usuarios/auditoria
router.get('/auditoria', usuarioController.getAuditoria);

// Ruta: POST /api/usuarios/importar
router.post('/importar', excelUpload.single('archivo'), usuarioController.importFromExcel);

// Ruta: GET /api/usuarios/:id
router.get('/:id', usuarioController.getById);

// Ruta: POST /api/usuarios
router.post('/', usuarioController.create);

// Ruta: PATCH /api/usuarios/:id
router.patch('/:id', usuarioController.update);

// Ruta: POST /api/usuarios/:id/activar
router.post('/:id/activar', usuarioController.activate);

// Ruta: POST /api/usuarios/:id/desactivar
router.post('/:id/desactivar', usuarioController.deactivate);

export default router;









