import express from 'express';
import { usuarioController } from '../controllers/usuarioController';

const router = express.Router();

// Ruta: GET /api/usuarios
router.get('/', usuarioController.getAll);

// Ruta: GET /api/usuarios/:id
router.get('/:id', usuarioController.getById);

// Ruta: POST /api/usuarios
router.post('/', usuarioController.create);

// Ruta: PATCH /api/usuarios/:id
router.patch('/:id', usuarioController.update);

export default router;


