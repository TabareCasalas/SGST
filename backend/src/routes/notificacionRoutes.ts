import express from 'express';
import { notificacionController } from '../controllers/notificacionController';

const router = express.Router();

// GET /api/notificaciones
router.get('/', notificacionController.getAll);

// PATCH /api/notificaciones/:id/leer
router.patch('/:id/leer', notificacionController.markAsRead);

export default router;

