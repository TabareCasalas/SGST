import { Router } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { getTramites, createTramite, updateTramite, deleteTramite, getConsultantes, getGrupos } from '../controllers/tramiteController';

const router = Router();

// Rutas protegidas para trámites
router.get('/', authenticateToken, requirePermission('tramites.read'), getTramites);
router.post('/', authenticateToken, requirePermission('tramites.create'), createTramite);
router.put('/:id', authenticateToken, requirePermission('tramites.update'), updateTramite);
router.delete('/:id', authenticateToken, requirePermission('tramites.delete'), deleteTramite);
// router.get('/stats', authenticateToken, requirePermission('tramites.read'), getTramiteStats);

// Rutas para obtener datos para formularios
router.get('/consultantes', authenticateToken, requirePermission('tramites.read'), getConsultantes);
router.get('/grupos', authenticateToken, requirePermission('tramites.read'), getGrupos);

export default router;