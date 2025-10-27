import express from 'express';
import { grupoController } from '../controllers/grupoController';

const router = express.Router();

// Ruta: GET /api/grupos
router.get('/', grupoController.getAll);

// Ruta: GET /api/grupos/:id
router.get('/:id', grupoController.getById);

// Ruta: POST /api/grupos
router.post('/', grupoController.create);

// Ruta: PATCH /api/grupos/:id
router.patch('/:id', grupoController.update);

export default router;


