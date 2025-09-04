import { Router } from 'express';
import {
  getTramites,
  getTramiteById,
  createTramite,
  updateTramite,
  deleteTramite
} from '../controllers/tramiteController';

const router = Router();

// Rutas para trámites
router.get('/', getTramites);
router.get('/:id', getTramiteById);
router.post('/', createTramite);
router.put('/:id', updateTramite);
router.delete('/:id', deleteTramite);

export default router;
