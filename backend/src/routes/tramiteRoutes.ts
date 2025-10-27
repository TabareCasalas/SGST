import express from 'express';
import { tramiteController } from '../controllers/tramiteController';

const router = express.Router();

// Ruta: GET /api/tramites
router.get('/', tramiteController.getAll);

// Ruta: GET /api/tramites/stats
router.get('/stats', tramiteController.getStats);

// Ruta: GET /api/tramites/:id
router.get('/:id', tramiteController.getById);

// Ruta: POST /api/tramites
router.post('/', tramiteController.create);

// Ruta: PATCH /api/tramites/:id
router.patch('/:id', tramiteController.update);

// Ruta: DELETE /api/tramites/:id
router.delete('/:id', tramiteController.delete);

// Ruta: POST /api/tramites/notificar
router.post('/notificar', tramiteController.notificar);

// Ruta: POST /api/tramites/:id/completar-tarea (completar User Task)
router.post('/:id/completar-tarea', tramiteController.completarTarea);

export default router;


