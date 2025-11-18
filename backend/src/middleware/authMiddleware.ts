import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    ci: string;
    rol: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Verificar si es una petición del orchestrator
    const ORCHESTRATOR_TOKEN = process.env.ORCHESTRATOR_TOKEN;
    const orchestratorToken = req.headers['x-orchestrator-token'];
    
    // Debug logging
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AuthMiddleware] ORCHESTRATOR_TOKEN configurado:', !!ORCHESTRATOR_TOKEN);
      console.log('[AuthMiddleware] Header x-orchestrator-token recibido:', !!orchestratorToken);
      console.log('[AuthMiddleware] Valor del header:', orchestratorToken);
      console.log('[AuthMiddleware] Valor esperado:', ORCHESTRATOR_TOKEN);
    }
    
    if (ORCHESTRATOR_TOKEN && orchestratorToken) {
      // Verificar que el token del orchestrator coincida
      const tokenMatches = Array.isArray(orchestratorToken) 
        ? orchestratorToken.includes(ORCHESTRATOR_TOKEN)
        : orchestratorToken === ORCHESTRATOR_TOKEN;
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AuthMiddleware] Token coincide:', tokenMatches);
      }
      
      if (tokenMatches) {
        // Es una petición del orchestrator, permitir sin autenticación JWT
        if (process.env.NODE_ENV !== 'production') {
          console.log('[AuthMiddleware] ✅ Petición del orchestrator autorizada');
        }
        return next();
      }
    }

    // Si no es del orchestrator, verificar autenticación JWT normal
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; ci: string; rol: string };
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar autenticación' });
  }
};







