import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const grupoController = {
  async getAll(req: Request, res: Response) {
    try {
      const grupos = await prisma.grupo.findMany({
        include: {
          tramites: {
            take: 5,
            orderBy: { fecha_inicio: 'desc' },
          },
        },
      });
      res.json(grupos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const grupo = await prisma.grupo.findUnique({
        where: { id_grupo: parseInt(id) },
        include: {
          tramites: {
            include: {
              consultante: {
                include: {
                  usuario: true,
                },
              },
            },
            orderBy: { fecha_inicio: 'desc' },
          },
        },
      });

      if (!grupo) {
        return res.status(404).json({ error: 'Grupo no encontrado' });
      }

      res.json(grupo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { nombre, descripcion, activo } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const grupo = await prisma.grupo.create({
        data: {
          nombre,
          descripcion,
          activo: activo !== undefined ? activo : true,
        },
      });

      res.status(201).json(grupo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;

      const grupo = await prisma.grupo.update({
        where: { id_grupo: parseInt(id) },
        data: {
          nombre,
          descripcion,
          activo,
        },
      });

      res.json(grupo);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Grupo no encontrado' });
      }
      res.status(500).json({ error: error.message });
    }
  },
};


