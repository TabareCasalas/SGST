import { Router } from 'express';
import {
  login,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  verifyToken
} from '../controllers/userController';
import { authenticateToken, requireRole, requirePermission } from '../middleware/auth';

const router = Router();

// Rutas para autenticación (públicas)
router.post('/login', login);

// Rutas protegidas para usuarios
router.get('/me', authenticateToken, verifyToken);
router.get('/', authenticateToken, requirePermission('usuarios.manage'), getUsers);
router.get('/roles', authenticateToken, getRoles);
router.get('/:id', authenticateToken, getUserById);
router.post('/', authenticateToken, requirePermission('usuarios.manage'), createUser);
router.put('/:id', authenticateToken, requirePermission('usuarios.manage'), updateUser);
router.delete('/:id', authenticateToken, requirePermission('usuarios.manage'), deleteUser);

export default router;