import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const notificacionController = {
  // Obtener todas las notificaciones
  async getAll(req: Request, res: Response) {
    try {
      const notificaciones = await prisma.notificacion.findMany({
        orderBy: { created_at: 'desc' },
        take: 10,
      });

      res.json(notificaciones);
    } catch (error: any) {
      console.error('❌ Error al obtener notificaciones:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Marcar notificación como leída
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Simplemente eliminar la notificación al marcar como leída
      await prisma.notificacion.delete({
        where: { id_notificacion: parseInt(id) },
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Error al marcar notificación:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

