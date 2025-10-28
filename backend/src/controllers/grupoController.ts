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
          miembros_grupo: {
            include: {
              usuario: true,
            },
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
          miembros_grupo: {
            include: {
              usuario: true,
            },
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
      const { nombre, descripcion, activo, responsable_id, asistentes_ids } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      // Validar que existe un responsable
      if (!responsable_id) {
        return res.status(400).json({ error: 'Un responsable es requerido' });
      }

      // Validar que existe al menos 2 asistentes
      if (!asistentes_ids || asistentes_ids.length < 2) {
        return res.status(400).json({ error: 'Se requieren al menos 2 asistentes' });
      }

      const grupo = await prisma.grupo.create({
        data: {
          nombre,
          descripcion,
          activo: activo !== undefined ? activo : true,
          miembros_grupo: {
            createMany: {
              data: [
                { id_usuario: responsable_id, rol_en_grupo: 'responsable' },
                ...asistentes_ids.map((asistente_id: number) => ({
                  id_usuario: asistente_id,
                  rol_en_grupo: 'asistente',
                })),
              ],
            },
          },
        },
        include: {
          miembros_grupo: {
            include: {
              usuario: true,
            },
          },
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
        include: {
          miembros_grupo: {
            include: {
              usuario: true,
            },
          },
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

  async addMiembro(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { id_usuario, rol_en_grupo } = req.body;

      if (!id_usuario || !rol_en_grupo) {
        return res.status(400).json({ error: 'id_usuario y rol_en_grupo son requeridos' });
      }

      // Validar que el rol sea válido
      const rolesValidos = ['responsable', 'asistente', 'estudiante'];
      if (!rolesValidos.includes(rol_en_grupo)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      // Verificar que no haya más de un responsable
      if (rol_en_grupo === 'responsable') {
        const responsableExistente = await prisma.usuarioGrupo.findFirst({
          where: {
            id_grupo: parseInt(id),
            rol_en_grupo: 'responsable',
          },
        });

        if (responsableExistente) {
          return res.status(400).json({ error: 'Ya existe un responsable en este grupo' });
        }
      }

      const miembro = await prisma.usuarioGrupo.create({
        data: {
          id_grupo: parseInt(id),
          id_usuario,
          rol_en_grupo,
        },
        include: {
          usuario: true,
          grupo: true,
        },
      });

      res.status(201).json(miembro);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'El usuario ya pertenece a este grupo' });
      }
      res.status(500).json({ error: error.message });
    }
  },
};


