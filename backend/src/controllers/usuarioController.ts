import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditoriaService } from '../utils/auditoriaService';
import * as XLSX from 'xlsx';

const SALT_ROUNDS = 10;

export const usuarioController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { rol, activo, search } = req.query;
      
      const where: any = {};
      
      if (rol) where.rol = rol;
      if (activo !== undefined) where.activo = activo === 'true';
      if (search) {
        where.OR = [
          { nombre: { contains: search as string, mode: 'insensitive' } },
          { ci: { contains: search as string, mode: 'insensitive' } },
          { correo: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const usuarios = await prisma.usuario.findMany({
        where,
        include: {
          consultantes: {
            include: {
              tramites: {
                take: 5,
                orderBy: { fecha_inicio: 'desc' },
              },
            },
          },
          grupos_participa: {
            include: {
              grupo: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      // Registrar auditoría
      const userId = req.user?.id;
      if (userId) {
        const filtros: string[] = [];
        if (rol) filtros.push(`rol: ${rol}`);
        if (activo !== undefined) filtros.push(`activo: ${activo}`);
        if (search) filtros.push(`búsqueda: ${search}`);
        
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'usuario',
          id_entidad: undefined,
          accion: 'listar',
          detalles: `Listado de usuarios consultado${filtros.length > 0 ? `. Filtros: ${filtros.join(', ')}` : ''}`,
        });
      }

      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: parseInt(id) },
        include: {
          consultantes: {
            include: {
              tramites: {
                include: {
                  grupo: true,
                },
                orderBy: { fecha_inicio: 'desc' },
              },
            },
          },
          grupos_participa: {
            include: {
              grupo: true,
            },
          },
          auditorias: {
            take: 10,
            orderBy: { created_at: 'desc' },
          },
        },
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Registrar auditoría
      const userId = req.user?.id;
      if (userId) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'usuario',
          id_entidad: usuario.id_usuario,
          accion: 'consultar',
          detalles: `Usuario consultado: ${usuario.nombre} (${usuario.rol})`,
        });
      }

      res.json(usuario);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { nombre, ci, domicilio, telefono, correo, password, rol, semestre, id_grupo, nivel_acceso } = req.body;

      if (!nombre || !ci || !domicilio || !telefono || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos básicos son requeridos (incluyendo contraseña)' });
      }

      // Validar longitud mínima de contraseña
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      // Validate role - using the new unified roles
      const validRoles = [
        'estudiante', 
        'docente', 
        'consultante', 
        'administrador'
      ];
      if (rol && !validRoles.includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      // If role is administrador, validate nivel_acceso
      if (rol === 'administrador') {
        if (!nivel_acceso || ![1, 3].includes(parseInt(nivel_acceso))) {
          return res.status(400).json({ error: 'nivel_acceso es requerido para administradores y debe ser 1 (Administrativo) o 3 (Sistema)' });
        }
      }

      // If role is estudiante, validate semester
      if (rol === 'estudiante' && !semestre) {
        return res.status(400).json({ error: 'El semestre es requerido para estudiantes' });
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const usuario = await prisma.usuario.create({
        data: {
          nombre,
          ci,
          domicilio,
          telefono,
          correo,
          password: hashedPassword,
          rol: rol || 'estudiante',
          nivel_acceso: rol === 'administrador' ? parseInt(nivel_acceso) : null,
          semestre: semestre || null,
          activo: true,
        },
        include: {
          grupos_participa: {
            include: {
              grupo: true,
            },
          },
        },
      });

      // If id_grupo is provided (for estudiantes), add them to the group
      if (id_grupo && rol === 'estudiante') {
        await prisma.usuarioGrupo.create({
          data: {
            id_usuario: usuario.id_usuario,
            id_grupo: parseInt(id_grupo),
            rol_en_grupo: 'estudiante',
          },
        });
      }

      // Log audit
      const userId = (req as any).user?.id;
      if (userId) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'usuario',
          id_entidad: usuario.id_usuario,
          accion: 'crear',
          detalles: `Usuario creado: ${usuario.nombre} (${usuario.rol})`,
        });
      }

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
      const { nombre, ci, domicilio, telefono, correo, rol, semestre, nivel_acceso } = req.body;

      // Get current user to compare changes
      const currentUser = await prisma.usuario.findUnique({
        where: { id_usuario: parseInt(id) },
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Validate role - using the new unified roles
      const validRoles = [
        'estudiante', 
        'docente', 
        'consultante', 
        'administrador'
      ];
      if (rol && !validRoles.includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      // If role is administrador, validate nivel_acceso
      if (rol === 'administrador') {
        if (nivel_acceso !== undefined && nivel_acceso !== null && ![1, 3].includes(parseInt(nivel_acceso))) {
          return res.status(400).json({ error: 'nivel_acceso debe ser 1 (Administrativo) o 3 (Sistema) para administradores' });
        }
      }

      // Track changes for audit
      const changes: string[] = [];
      if (nombre && nombre !== currentUser.nombre) changes.push(`nombre: ${currentUser.nombre} → ${nombre}`);
      if (ci && ci !== currentUser.ci) changes.push(`ci: ${currentUser.ci} → ${ci}`);
      if (correo && correo !== currentUser.correo) changes.push(`correo: ${currentUser.correo} → ${correo}`);
      if (rol && rol !== currentUser.rol) changes.push(`rol: ${currentUser.rol} → ${rol}`);
      if (semestre && semestre !== currentUser.semestre) changes.push(`semestre: ${currentUser.semestre} → ${semestre}`);
      if (nivel_acceso !== undefined && nivel_acceso !== null && parseInt(nivel_acceso) !== currentUser.nivel_acceso) {
        changes.push(`nivel_acceso: ${currentUser.nivel_acceso || 'null'} → ${nivel_acceso}`);
      }

      const usuario = await prisma.usuario.update({
        where: { id_usuario: parseInt(id) },
        data: {
          nombre,
          ci,
          domicilio,
          telefono,
          correo,
          rol,
          nivel_acceso: rol === 'administrador' && nivel_acceso !== undefined && nivel_acceso !== null 
            ? parseInt(nivel_acceso) 
            : rol === 'administrador' 
              ? currentUser.nivel_acceso 
              : null,
          semestre,
        },
        include: {
          grupos_participa: {
            include: {
              grupo: true,
            },
          },
        },
      });

      // Log audit
      const userId = (req as any).user?.id;
      if (userId) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'usuario',
          id_entidad: usuario.id_usuario,
          accion: 'modificar',
          detalles: `Cambios: ${changes.join(', ')}`,
        });
      }

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

  async deactivate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: parseInt(id) },
        include: {
          consultantes: {
            include: {
              tramites: {
                where: {
                  estado: {
                    notIn: ['cerrado', 'finalizado'],
                  },
                },
              },
            },
          },
        },
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Check if user has active cases
      const hasActiveCases = usuario.consultantes.some(
        consultante => consultante.tramites.length > 0
      );

      if (hasActiveCases) {
        return res.status(400).json({
          error: 'No se puede desactivar el usuario porque tiene trámites activos',
          tramitesActivos: usuario.consultantes.flatMap(c => c.tramites),
        });
      }

      const usuarioDesactivado = await prisma.usuario.update({
        where: { id_usuario: parseInt(id) },
        data: {
          activo: false,
        },
        include: {
          grupos_participa: {
            include: {
              grupo: true,
            },
          },
        },
      });

      // Log audit
      const userId = (req as any).user?.id;
      if (userId) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'usuario',
          id_entidad: usuario.id_usuario,
          accion: 'desactivar',
          detalles: `Usuario desactivado: ${usuario.nombre}`,
        });
      }

      res.json(usuarioDesactivado);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async activate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.update({
        where: { id_usuario: parseInt(id) },
        data: {
          activo: true,
        },
        include: {
          grupos_participa: {
            include: {
              grupo: true,
            },
          },
        },
      });

      // Log audit
      const userId = (req as any).user?.id;
      if (userId) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'usuario',
          id_entidad: usuario.id_usuario,
          accion: 'activar',
          detalles: `Usuario activado: ${usuario.nombre}`,
        });
      }

      res.json(usuario);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async getAuditoria(req: Request, res: Response) {
    try {
      const { tipo_entidad, id_entidad, accion } = req.query;

      const where: any = {};
      if (tipo_entidad) where.tipo_entidad = tipo_entidad;
      if (id_entidad) where.id_entidad = parseInt(id_entidad as string);
      if (accion) where.accion = accion;

      const auditorias = await prisma.auditoria.findMany({
        where,
        include: {
          usuario: true,
        },
        orderBy: { created_at: 'desc' },
        take: 100,
      });

      res.json(auditorias);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async importFromExcel(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
      }

      // Leer el archivo Excel
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: 'El archivo Excel está vacío o no tiene datos válidos' });
      }

      // Validar columnas requeridas
      const requiredColumns = ['nombre', 'ci', 'domicilio', 'telefono', 'correo', 'rol'];
      const firstRow = data[0] as any;
      const columns = Object.keys(firstRow).map((key) => key.toLowerCase().trim());
      
      const missingColumns = requiredColumns.filter(
        (col) => !columns.includes(col.toLowerCase())
      );

      if (missingColumns.length > 0) {
        return res.status(400).json({
          error: `Faltan columnas requeridas: ${missingColumns.join(', ')}`,
          columnasRequeridas: requiredColumns,
          columnasEncontradas: columns,
        });
      }

      const results = {
        total: data.length,
        exitosos: 0,
        errores: 0,
        detalles: [] as Array<{ fila: number; usuario: string; estado: string; error?: string }>,
      };

      const validRoles = ['estudiante', 'docente', 'consultante', 'administrador'];
      const defaultPassword = 'Usuario123'; // Contraseña por defecto para usuarios importados

      // Procesar cada fila
      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        const fila = i + 2; // +2 porque la fila 1 es el encabezado y el índice empieza en 0

        try {
          // Normalizar nombres de columnas (case-insensitive)
          const getValue = (key: string) => {
            const foundKey = Object.keys(row).find(
              (k) => k.toLowerCase().trim() === key.toLowerCase()
            );
            return foundKey ? row[foundKey] : null;
          };

          const nombre = getValue('nombre')?.toString().trim();
          const ci = getValue('ci')?.toString().trim();
          const domicilio = getValue('domicilio')?.toString().trim();
          const telefono = getValue('telefono')?.toString().trim();
          const correo = getValue('correo')?.toString().trim().toLowerCase();
          const rol = getValue('rol')?.toString().trim().toLowerCase();
          const semestre = getValue('semestre')?.toString().trim() || null;
          const nivel_acceso = getValue('nivel_acceso')?.toString().trim() || null;
          const password = getValue('password')?.toString().trim() || defaultPassword;

          // Validaciones
          if (!nombre || !ci || !domicilio || !telefono || !correo || !rol) {
            results.errores++;
            results.detalles.push({
              fila,
              usuario: nombre || 'Sin nombre',
              estado: 'error',
              error: 'Faltan campos requeridos',
            });
            continue;
          }

          if (!validRoles.includes(rol)) {
            results.errores++;
            results.detalles.push({
              fila,
              usuario: nombre,
              estado: 'error',
              error: `Rol inválido: ${rol}. Roles válidos: ${validRoles.join(', ')}`,
            });
            continue;
          }

          if (rol === 'administrador') {
            const nivel = nivel_acceso ? parseInt(nivel_acceso) : null;
            if (!nivel || ![1, 3].includes(nivel)) {
              results.errores++;
              results.detalles.push({
                fila,
                usuario: nombre,
                estado: 'error',
                error: 'nivel_acceso es requerido para administradores y debe ser 1 o 3',
              });
              continue;
            }
          }

          if (rol === 'estudiante' && !semestre) {
            results.errores++;
            results.detalles.push({
              fila,
              usuario: nombre,
              estado: 'error',
              error: 'El semestre es requerido para estudiantes',
            });
            continue;
          }

          // Verificar si el usuario ya existe
          const usuarioExistente = await prisma.usuario.findFirst({
            where: {
              OR: [{ ci }, { correo }],
            },
          });

          if (usuarioExistente) {
            results.errores++;
            results.detalles.push({
              fila,
              usuario: nombre,
              estado: 'error',
              error: `Usuario ya existe (CI: ${ci} o correo: ${correo})`,
            });
            continue;
          }

          // Hashear la contraseña
          const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

          // Crear el usuario
          const usuario = await prisma.usuario.create({
            data: {
              nombre,
              ci,
              domicilio,
              telefono,
              correo,
              password: hashedPassword,
              rol,
              nivel_acceso: rol === 'administrador' && nivel_acceso ? parseInt(nivel_acceso) : null,
              semestre: semestre || null,
              activo: true,
            },
          });

          results.exitosos++;
          results.detalles.push({
            fila,
            usuario: nombre,
            estado: 'exitoso',
          });

          // Registrar auditoría
          const userId = req.user?.id;
          if (userId) {
            await AuditoriaService.crearDesdeRequest(req, {
              id_usuario: userId,
              tipo_entidad: 'usuario',
              id_entidad: usuario.id_usuario,
              accion: 'crear',
              detalles: `Usuario creado desde importación Excel: ${usuario.nombre} (${usuario.rol})`,
            });
          }
        } catch (error: any) {
          results.errores++;
          results.detalles.push({
            fila,
            usuario: (row as any).nombre || 'Sin nombre',
            estado: 'error',
            error: error.message || 'Error desconocido',
          });
        }
      }

      // Registrar auditoría de la importación
      const userId = req.user?.id;
      if (userId) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'usuario',
          id_entidad: undefined,
          accion: 'importar',
          detalles: `Importación de usuarios desde Excel: ${results.exitosos} exitosos, ${results.errores} errores de ${results.total} total`,
        });
      }

      res.json({
        message: `Importación completada: ${results.exitosos} usuarios creados exitosamente, ${results.errores} errores`,
        ...results,
      });
    } catch (error: any) {
      console.error('Error al importar usuarios desde Excel:', error);
      res.status(500).json({ error: error.message || 'Error al procesar el archivo Excel' });
    }
  },
};
