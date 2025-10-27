import express from 'express';
import { consultanteController } from '../controllers/consultanteController';

const router = express.Router();

// Ruta: GET /api/consultantes
router.get('/', consultanteController.getAll);

// Ruta: GET /api/consultantes/:id
router.get('/:id', consultanteController.getById);

// Ruta: POST /api/consultantes
router.post('/', consultanteController.create);

// Ruta: PATCH /api/consultantes/:id
router.patch('/:id', consultanteController.update);

export default router;


