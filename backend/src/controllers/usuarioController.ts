import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const usuarioController = {
  async getAll(req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        include: {
          consultantes: true,
        },
      });
      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: parseInt(id) },
        include: {
          consultantes: {
            include: {
              tramites: {
                take: 5,
                orderBy: { fecha_inicio: 'desc' },
              },
            },
          },
        },
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { nombre, ci, domicilio, telefono, correo } = req.body;

      if (!nombre || !ci || !domicilio || !telefono || !correo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      const usuario = await prisma.usuario.create({
        data: {
          nombre,
          ci,
          domicilio,
          telefono,
          correo,
        },
      });

      res.status(201).json(usuario);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe un usuario con ese CI o correo' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nombre, ci, domicilio, telefono, correo } = req.body;

      const usuario = await prisma.usuario.update({
        where: { id_usuario: parseInt(id) },
        data: {
          nombre,
          ci,
          domicilio,
          telefono,
          correo,
        },
      });

      res.json(usuario);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe un usuario con ese CI o correo' });
      }
      res.status(500).json({ error: error.message });
    }
  },
};


