import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const consultanteController = {
  async getAll(req: Request, res: Response) {
    try {
      const consultantes = await prisma.consultante.findMany({
        include: {
          usuario: true,
          tramites: {
            take: 5,
            orderBy: { fecha_inicio: 'desc' },
          },
        },
      });
      res.json(consultantes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const consultante = await prisma.consultante.findUnique({
        where: { id_consultante: parseInt(id) },
        include: {
          usuario: true,
          tramites: {
            include: {
              grupo: true,
            },
            orderBy: { fecha_inicio: 'desc' },
          },
        },
      });

      if (!consultante) {
        return res.status(404).json({ error: 'Consultante no encontrado' });
      }

      res.json(consultante);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { id_usuario, est_civil, nro_padron } = req.body;

      if (!id_usuario || !est_civil || !nro_padron) {
        return res.status(400).json({
          error: 'id_usuario, est_civil y nro_padron son requeridos',
        });
      }

      // Verificar que el usuario existe
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario },
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar que no existe un consultante con ese nro_padron
      const consultanteExistente = await prisma.consultante.findUnique({
        where: { nro_padron },
      });

      if (consultanteExistente) {
        return res.status(409).json({ error: 'Ya existe un consultante con ese número de padrón' });
      }

      const consultante = await prisma.consultante.create({
        data: {
          id_usuario,
          est_civil,
          nro_padron,
        },
        include: {
          usuario: true,
        },
      });

      res.status(201).json(consultante);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe un consultante con esos datos' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { est_civil, nro_padron } = req.body;

      const updateData: any = {};
      if (est_civil !== undefined) updateData.est_civil = est_civil;
      if (nro_padron !== undefined) updateData.nro_padron = nro_padron;

      const consultante = await prisma.consultante.update({
        where: { id_consultante: parseInt(id) },
        data: updateData,
        include: {
          usuario: true,
        },
      });

      res.json(consultante);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Consultante no encontrado' });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe un consultante con ese número de padrón' });
      }
      res.status(500).json({ error: error.message });
    }
  },
};


