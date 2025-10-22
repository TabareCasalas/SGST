import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extender la interfaz Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id_usuario: number;
        correo: string;
        roles: string[];
      };
    }
  }
}

// Middleware de autenticación
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Auth middleware - Token present:', !!token);
    console.log('Auth middleware - JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
      return;
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    console.log('Auth middleware - Token decoded:', decoded);
    
    // Verificar que el usuario existe y está activo
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.id_usuario },
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!usuario || usuario.estado !== 'activo') {
      res.status(401).json({
        success: false,
        error: 'Usuario no válido o inactivo'
      });
      return;
    }

    // Agregar información del usuario a la request
    req.user = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      roles: usuario.usuarioRoles.map(ur => ur.rol.nombre)
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const hasRequiredRole = req.user.roles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      });
      return;
    }

    next();
  };
};

// Middleware para verificar permisos específicos
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Mapeo de roles a permisos
    const rolePermissions: Record<string, string[]> = {
      'Administrador': [
        'tramites.create', 'tramites.read', 'tramites.update', 'tramites.delete',
        'usuarios.manage', 'reportes.generate', 'sistema.config', 'auditoria.view'
      ],
      'Consultor': [
        'tramites.create', 'tramites.read', 'tramites.update',
        'adjuntos.upload', 'adjuntos.download', 'notificaciones.send'
      ],
      'Docente': [
        'tramites.read', 'tramites.update',
        'adjuntos.upload', 'adjuntos.download'
      ],
      'Estudiante': [
        'tramites.read',
        'adjuntos.upload'
      ],
      'Administrativo': [
        'tramites.read', 'tramites.update',
        'turnos.manage', 'notificaciones.send'
      ]
    };

    const hasPermission = req.user.roles.some(role => 
      rolePermissions[role]?.includes(permission)
    );
    
    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      });
      return;
    }

    next();
  };
};
