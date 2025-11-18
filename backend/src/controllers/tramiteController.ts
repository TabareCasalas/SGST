import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { iniciarProcesoEnCamunda, correlacionarMensajeEnCamunda } from '../services/orchestratorService';
import { normalizeText } from '../utils/normalizeText';
import { AuthRequest } from '../middleware/authMiddleware';
import { NotificacionService } from '../utils/notificacionService';
import { AuditoriaService } from '../utils/auditoriaService';

const ORCHESTRATOR_TOKEN = process.env.ORCHESTRATOR_TOKEN;

function isOrchestratorRequest(req: Request | AuthRequest): boolean {
  if (!ORCHESTRATOR_TOKEN) {
    return false;
  }

  const header = req.headers['x-orchestrator-token'];
  if (!header) {
    return false;
  }

  if (Array.isArray(header)) {
    return header.includes(ORCHESTRATOR_TOKEN);
  }

  return header === ORCHESTRATOR_TOKEN;
}

export const tramiteController = {
  // Obtener todos los trámites
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { estado, id_consultante, id_grupo, search } = req.query;

      const where: any = {};
      if (estado) where.estado = estado;
      if (id_consultante) where.id_consultante = parseInt(id_consultante as string);
      if (id_grupo) where.id_grupo = parseInt(id_grupo as string);

      // Búsqueda por texto en múltiples campos
      if (search && typeof search === 'string' && search.trim() !== '') {
        const searchTerm = search.trim();
        const normalizedSearch = normalizeText(searchTerm);
        
        where.OR = [
          // Buscar en número de carpeta (convertir a string para búsqueda)
          { num_carpeta: { contains: searchTerm, mode: 'insensitive' } },
          // Buscar en observaciones (con y sin tildes)
          { observaciones: { contains: searchTerm, mode: 'insensitive' } },
          { observaciones: { contains: normalizedSearch, mode: 'insensitive' } },
          // Buscar en motivo de cierre (con y sin tildes)
          { motivo_cierre: { contains: searchTerm, mode: 'insensitive' } },
          { motivo_cierre: { contains: normalizedSearch, mode: 'insensitive' } },
          // Buscar en estado
          { estado: { contains: searchTerm, mode: 'insensitive' } },
          // Buscar en nombre del consultante (con y sin tildes)
          {
            consultante: {
              usuario: {
                nombre: { contains: searchTerm, mode: 'insensitive' }
              }
            }
          },
          {
            consultante: {
              usuario: {
                nombre: { contains: normalizedSearch, mode: 'insensitive' }
              }
            }
          },
          // Buscar en CI del consultante
          {
            consultante: {
              usuario: {
                ci: { contains: searchTerm, mode: 'insensitive' }
              }
            }
          },
          // Buscar en nombre del grupo (con y sin tildes)
          {
            grupo: {
              nombre: { contains: searchTerm, mode: 'insensitive' }
            }
          },
          {
            grupo: {
              nombre: { contains: normalizedSearch, mode: 'insensitive' }
            }
          }
        ];
      }

      const tramites = await prisma.tramite.findMany({
        where,
        include: {
          consultante: {
            include: {
              usuario: true,
            },
          },
          grupo: true,
          hoja_ruta: {
            include: {
              usuario: {
                select: {
                  id_usuario: true,
                  nombre: true,
                  ci: true,
                },
              },
            },
            orderBy: {
              fecha_actuacion: 'desc',
            },
          },
          documentos: {
            include: {
              usuario: {
                select: {
                  id_usuario: true,
                  nombre: true,
                  ci: true,
                },
              },
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
        orderBy: {
          fecha_inicio: 'desc',
        },
      });

      // Registrar auditoría
      const userId = req.user?.id;
      if (userId) {
        const filtros: string[] = [];
        if (estado) filtros.push(`estado: ${estado}`);
        if (id_consultante) filtros.push(`consultante: ${id_consultante}`);
        if (id_grupo) filtros.push(`grupo: ${id_grupo}`);
        if (search) filtros.push(`búsqueda: ${search}`);
        
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'tramite',
          id_entidad: null,
          accion: 'listar',
          detalles: `Listado de trámites consultado${filtros.length > 0 ? `. Filtros: ${filtros.join(', ')}` : ''}`,
        });
      }

      res.json(tramites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un trámite por ID
  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const tramite = await prisma.tramite.findUnique({
        where: { id_tramite: parseInt(id) },
        include: {
          consultante: {
            include: {
              usuario: true,
            },
          },
          grupo: true,
          notificaciones: {
            orderBy: { created_at: 'desc' },
            take: 10,
          },
          hoja_ruta: {
            include: {
              usuario: {
                select: {
                  id_usuario: true,
                  nombre: true,
                  ci: true,
                },
              },
            },
            orderBy: {
              fecha_actuacion: 'desc',
            },
          },
          documentos: {
            include: {
              usuario: {
                select: {
                  id_usuario: true,
                  nombre: true,
                  ci: true,
                },
              },
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      if (!tramite) {
        return res.status(404).json({ error: 'Trámite no encontrado' });
      }

      // Registrar auditoría
      const userId = req.user?.id;
      if (userId) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'tramite',
          id_entidad: tramite.id_tramite,
          accion: 'consultar',
          detalles: `Trámite consultado: ${tramite.num_carpeta} (Estado: ${tramite.estado}, Consultante: ${tramite.consultante.usuario.nombre})`,
        });
      }

      res.json(tramite);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Crear un nuevo trámite
  async create(req: Request, res: Response) {
    try {
      const {
        id_consultante,
        id_grupo,
        num_carpeta,
        observaciones,
        process_instance_id: processInstanceId,
        estado_inicial: estadoInicialPayload,
      } = req.body;
      const user = (req as any).user; // Usuario autenticado del middleware
      const orchestratorCall = isOrchestratorRequest(req);

      if (!id_consultante || !id_grupo || !num_carpeta) {
        return res.status(400).json({
          error: 'id_consultante, id_grupo y num_carpeta son requeridos',
        });
      }

      const consultante = await prisma.consultante.findUnique({
        where: { id_consultante },
      });

      if (!consultante) {
        return res.status(404).json({ error: 'Consultante no encontrado' });
      }

      const grupo = await prisma.grupo.findUnique({
        where: { id_grupo },
      });

      if (!grupo) {
        return res.status(404).json({ error: 'Grupo no encontrado' });
      }

      // Evitar duplicados independientemente del origen
      const tramiteExistente = await prisma.tramite.findUnique({
        where: { num_carpeta },
      });

      if (tramiteExistente) {
        return res.status(409).json({ error: 'Ya existe un trámite con ese número de carpeta' });
      }

      if (orchestratorCall) {
        const estadoInicial = estadoInicialPayload || req.body.estado || 'en_tramite';

        const tramite = await prisma.tramite.create({
          data: {
            id_consultante,
            id_grupo,
            num_carpeta,
            observaciones: observaciones ?? null,
            estado: estadoInicial,
            process_instance_id: processInstanceId || null,
          },
          include: {
            consultante: {
              include: {
                usuario: true,
              },
            },
            grupo: true,
          },
        });

        console.log(`✅ [Camunda] Trámite persistido ${tramite.id_tramite} (${estadoInicial})`);
        return res.status(201).json(tramite);
      }

      const esAdmin = user?.rol === 'admin' || user?.rol === 'administrador';
      const estadoInicial = esAdmin ? 'pendiente' : 'en_tramite';
      const grupoNombre = `grupo_${grupo.nombre}`;
      const businessKey = `tramite:${num_carpeta}`;

      const processResult = await iniciarProcesoEnCamunda({
        processKey: 'procesoTramiteGrupos',
        messageName: 'inicio_tramite_grupo',
        businessKey,
        variables: {
          id_consultante,
          id_grupo,
          num_carpeta,
          observaciones: observaciones || '',
          grupoNombre,
          estadoInicial,
          creado_por: user?.id || null,
          rol_creador: user?.rol || null,
        },
      });

      console.log(
        `🚀 Proceso Camunda iniciado para trámite ${num_carpeta} (instanceId: ${processResult.instanceId})`
      );

      if (user?.id) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: user.id,
          tipo_entidad: 'tramite',
          id_entidad: null,
          accion: 'crear',
          detalles: `Solicitud de creación de trámite enviada a Camunda para carpeta ${num_carpeta}. Estado inicial propuesto: ${estadoInicial}`,
        });
      }

      return res.status(202).json({
        message: 'Proceso de creación de trámite iniciado en Camunda',
        processInstanceId: processResult.instanceId,
        businessKey: processResult.businessKey || businessKey,
        estadoSolicitado: estadoInicial,
      });
    } catch (error: any) {
      console.error('❌ Error al crear trámite:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar un trámite
  async update(req: AuthRequest, res: Response) {
    try {
      console.log(`📥 [TramiteController.update] Petición recibida:`, {
        id: req.params.id,
        body: req.body,
        method: req.method,
        path: req.path,
      });
      
      const { id } = req.params;
      const { estado, observaciones, fecha_cierre, motivo_cierre } = req.body;
      const orchestratorCall = isOrchestratorRequest(req);
      
      console.log(`🔍 [TramiteController.update] Es llamada del orchestrator: ${orchestratorCall}`);

      const estadosValidos = ['en_tramite', 'finalizado', 'pendiente', 'desistido'];
      if (estado !== undefined && !estadosValidos.includes(estado)) {
        return res.status(400).json({
          error: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`,
        });
      }

      if (!orchestratorCall) {
        if (estado === undefined) {
          return res.status(400).json({
            error: 'Debe proporcionar un estado para solicitar la actualización del trámite',
          });
        }

        const tramiteActual = await prisma.tramite.findUnique({
          where: { id_tramite: parseInt(id) },
        });

        if (!tramiteActual) {
          return res.status(404).json({ error: 'Trámite no encontrado' });
        }

        if (!tramiteActual.process_instance_id) {
          return res.status(400).json({
            error: 'Este trámite no tiene un proceso asociado en Camunda',
          });
        }

        const messageByEstado: Record<string, string> = {
          pendiente: 'to_pendiente',
          en_tramite: 'to_en_tramite',
          finalizado: 'to_finalizado',
          desistido: 'to_desistido',
        };

        const messageName = messageByEstado[estado];

        if (!messageName) {
          return res.status(400).json({
            error: `No existe un mensaje configurado en Camunda para el estado "${estado}"`,
          });
        }

        // Construir el businessKey que se usa como correlationKey en el BPMN
        // El formato es: "tramite:${num_carpeta}"
        const businessKey = `tramite:${tramiteActual.num_carpeta}`;

        console.log(`🔄 [TramiteController] Cambiando estado del trámite ${tramiteActual.id_tramite}:`);
        console.log(`   Estado actual: ${tramiteActual.estado}`);
        console.log(`   Estado solicitado: ${estado}`);
        console.log(`   ProcessInstanceId: ${tramiteActual.process_instance_id}`);
        console.log(`   BusinessKey (correlationKey): ${businessKey}`);
        console.log(`   MessageName: ${messageName}`);

        try {
          await correlacionarMensajeEnCamunda(
            tramiteActual.process_instance_id,
            messageName,
            {
              estado,
              observaciones: observaciones ?? null,
              fecha_cierre: fecha_cierre ?? null,
              motivo_cierre: motivo_cierre ?? null,
              userId: req.user?.id || null,
            },
            businessKey
          );
          console.log(`✅ [TramiteController] Mensaje enviado exitosamente a Camunda`);
        } catch (error: any) {
          console.error(`❌ [TramiteController] Error al enviar mensaje a Camunda:`, error.message);
          throw error;
        }

        if (req.user?.id) {
          await AuditoriaService.crearDesdeRequest(req, {
            id_usuario: req.user.id,
            tipo_entidad: 'tramite',
            id_entidad: tramiteActual.id_tramite,
            accion: 'modificar',
            detalles: `Solicitud de cambio de estado a "${estado}" enviada a Camunda`,
          });
        }

        return res.status(202).json({
          message: `Solicitud de cambio de estado enviada a Camunda (${messageName})`,
          processInstanceId: tramiteActual.process_instance_id,
          estadoSolicitado: estado,
        });
      }

      // Resto del flujo: llamado interno desde Camunda/orchestrator
      const tramiteActual = await prisma.tramite.findUnique({
        where: { id_tramite: parseInt(id) },
      });

      if (!tramiteActual) {
        return res.status(404).json({ error: 'Trámite no encontrado' });
      }

      const estadoActualNormalizado =
        tramiteActual.estado === 'iniciado' ? 'en_tramite' : tramiteActual.estado;

      if (estado !== undefined && estado !== estadoActualNormalizado && estado !== tramiteActual.estado) {
        const transicionesPermitidas: Record<string, string[]> = {
          pendiente: ['en_tramite', 'desistido'],
          en_tramite: ['finalizado', 'pendiente', 'desistido'],
          finalizado: ['en_tramite', 'desistido'],
          desistido: ['en_tramite'],
        };

        const estadosPermitidos = transicionesPermitidas[estadoActualNormalizado] || [];
        if (!estadosPermitidos.includes(estado)) {
          return res.status(400).json({
            error: `Transición no permitida. Desde "${tramiteActual.estado}" solo se puede cambiar a: ${estadosPermitidos.join(
              ', '
            )}`,
          });
        }
      }

      const updateData: Record<string, any> = {};
      if (estado !== undefined) {
        updateData.estado = estado;
      } else if (tramiteActual.estado === 'iniciado') {
        updateData.estado = 'en_tramite';
      }
      if (observaciones !== undefined) updateData.observaciones = observaciones;
      if (fecha_cierre !== undefined) updateData.fecha_cierre = new Date(fecha_cierre);
      if (motivo_cierre !== undefined) updateData.motivo_cierre = motivo_cierre;

      const tramiteAnterior = await prisma.tramite.findUnique({
        where: { id_tramite: parseInt(id) },
        include: {
          consultante: {
            include: { usuario: true },
          },
          grupo: {
            include: {
              miembros_grupo: {
                include: {
                  usuario: {
                    select: {
                      id_usuario: true,
                      nombre: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const tramite = await prisma.tramite.update({
        where: { id_tramite: parseInt(id) },
        data: updateData,
        include: {
          consultante: {
            include: {
              usuario: true,
            },
          },
          grupo: true,
        },
      });

      console.log(`✅ [Camunda] Trámite actualizado: ${tramite.id_tramite}`);

      const userId = req.user?.id;
      if (userId) {
        const cambios: string[] = [];
        if (estado !== undefined && estado !== tramiteAnterior?.estado) {
          cambios.push(`estado: ${tramiteAnterior?.estado} → ${estado}`);
        }
        if (observaciones !== undefined) {
          cambios.push('observaciones actualizadas');
        }
        if (fecha_cierre !== undefined) {
          cambios.push('fecha de cierre actualizada');
        }
        if (motivo_cierre !== undefined) {
          cambios.push('motivo de cierre actualizado');
        }

        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'tramite',
          id_entidad: tramite.id_tramite,
          accion: cambios.length > 0 ? 'modificar' : 'actualizar',
          detalles:
            cambios.length > 0 ? `Cambios: ${cambios.join(', ')}` : 'Trámite actualizado desde Camunda',
        });
      }

      if (estado !== undefined && estado !== tramiteAnterior?.estado && tramiteAnterior) {
        try {
          const usuarioCambio = await prisma.usuario.findUnique({
            where: { id_usuario: req.user?.id || 0 },
            select: { nombre: true },
          });

          const nombreUsuarioCambio = usuarioCambio?.nombre || 'Sistema Camunda';
          const estadoAnterior = tramiteAnterior.estado;
          const estadoNuevo = estado;
          const etiquetasEstado: Record<string, string> = {
            en_tramite: 'En trámite',
            finalizado: 'Finalizado',
            pendiente: 'Pendiente',
            desistido: 'Desistido',
            iniciado: 'En trámite',
          };

          const etiquetaAnterior = etiquetasEstado[estadoAnterior] || estadoAnterior;
          const etiquetaNueva = etiquetasEstado[estadoNuevo] || estadoNuevo;

          const idUsuariosGrupo = tramiteAnterior.grupo.miembros_grupo
            .map((mg) => mg.id_usuario)
            .filter((memberId) => memberId !== req.user?.id);

          const idUsuarioConsultante = tramiteAnterior.consultante.usuario.id_usuario;

          if (idUsuariosGrupo.length > 0) {
            await NotificacionService.crearMultiple(idUsuariosGrupo, {
              id_usuario_emisor: req.user?.id,
              titulo: 'Estado del trámite actualizado',
              mensaje: `${nombreUsuarioCambio} ha cambiado el estado del trámite ${tramite.num_carpeta} de "${etiquetaAnterior}" a "${etiquetaNueva}".${
                motivo_cierre ? ` Motivo: ${motivo_cierre}` : ''
              }`,
              tipo: estadoNuevo === 'finalizado' ? 'success' : estadoNuevo === 'desistido' ? 'warning' : 'info',
              tipo_entidad: 'tramite',
              id_entidad: tramite.id_tramite,
              id_tramite: tramite.id_tramite,
            });
          }

          if (idUsuarioConsultante !== req.user?.id) {
            await NotificacionService.crear({
              id_usuario: idUsuarioConsultante,
              id_usuario_emisor: req.user?.id,
              titulo: 'Estado de tu trámite actualizado',
              mensaje: `El estado de tu trámite ${tramite.num_carpeta} ha cambiado de "${etiquetaAnterior}" a "${etiquetaNueva}".${
                motivo_cierre ? ` Motivo: ${motivo_cierre}` : ''
              }`,
              tipo: estadoNuevo === 'finalizado' ? 'success' : estadoNuevo === 'desistido' ? 'warning' : 'info',
              tipo_entidad: 'tramite',
              id_entidad: tramite.id_tramite,
              id_tramite: tramite.id_tramite,
            });
          }

          console.log(`✅ Notificaciones enviadas por cambio de estado del trámite ${tramite.num_carpeta}`);
        } catch (notifError: any) {
          console.error('⚠️ Error al crear notificaciones (trámite actualizado desde Camunda):', notifError);
        }
      }

      res.json(tramite);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Trámite no encontrado' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Completar tarea manual (User Task) de Camunda
  async completarTarea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { aprobado, observaciones, decision } = req.body;

      // Obtener el trámite
      const tramite = await prisma.tramite.findUnique({
        where: { id_tramite: parseInt(id) },
        include: {
          consultante: { include: { usuario: true } },
          grupo: true,
        },
      });

      if (!tramite) {
        return res.status(404).json({ error: 'Trámite no encontrado' });
      }

      if (!tramite.process_instance_id) {
        return res.status(400).json({ error: 'Este trámite no tiene un proceso asociado en Camunda' });
      }

      // Preparar las variables para Camunda
      const variables: Record<string, any> = {
        aprobado: { value: aprobado, type: 'Boolean' },
        decision: { value: decision || (aprobado ? 'aprobado' : 'rechazado'), type: 'String' },
      };

      if (observaciones) {
        variables.observaciones = { value: observaciones, type: 'String' };
      }

      // Llamar al orchestrator para completar la tarea en Camunda
      const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://orchestrator:3002';
      const axios = require('axios');
      
      try {
        const response = await axios.post(
          `${orchestratorUrl}/api/procesos/${tramite.process_instance_id}/completar-tarea`,
          { variables }
        );

        // Actualizar el estado del trámite según la decisión (temporal hasta que el proceso finalice)
        const nuevoEstado = aprobado ? 'aprobado' : 'rechazado';
        await prisma.tramite.update({
          where: { id_tramite: parseInt(id) },
          data: {
            estado: nuevoEstado,
            observaciones: observaciones || tramite.observaciones,
          },
        });

        console.log(`✅ Tarea completada para trámite ${id}, decisión: ${decision}`);

        res.json({
          success: true,
          message: `Trámite ${aprobado ? 'aprobado' : 'rechazado'} exitosamente`,
          tramite: await prisma.tramite.findUnique({
            where: { id_tramite: parseInt(id) },
            include: { consultante: { include: { usuario: true } }, grupo: true },
          }),
        });
      } catch (error: any) {
        console.error('Error al completar tarea en Camunda:', error.message);
        res.status(500).json({
          error: 'Error al completar tarea en Camunda',
          details: error.response?.data || error.message,
        });
      }
    } catch (error: any) {
      console.error('❌ Error al completar tarea:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar trámite
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Obtener información del trámite antes de eliminarlo para la auditoría
      const tramite = await prisma.tramite.findUnique({
        where: { id_tramite: parseInt(id) },
        select: { num_carpeta: true },
      });

      // Por ahora, usamos hard delete
      // En producción, podrías implementar soft delete
      await prisma.tramite.delete({
        where: { id_tramite: parseInt(id) },
      });

      console.log(`🗑️  Trámite eliminado: ${id}`);

      // Registrar auditoría
      const userId = req.user?.id;
      if (userId) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: userId,
          tipo_entidad: 'tramite',
          id_entidad: parseInt(id),
          accion: 'eliminar',
          detalles: tramite ? `Trámite eliminado: ${tramite.num_carpeta}` : `Trámite eliminado (ID: ${id})`,
        });
      }

      res.json({ message: 'Trámite eliminado exitosamente' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Trámite no encontrado' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Enviar notificación
  async notificar(req: Request, res: Response) {
    try {
      const { id_tramite, tipo_notificacion, mensaje, destinatarios } = req.body;

      if (!id_tramite || !mensaje) {
        return res.status(400).json({
          error: 'id_tramite y mensaje son requeridos',
        });
      }

      // Verificar que el trámite existe y obtener el consultante
      const tramite = await prisma.tramite.findUnique({
        where: { id_tramite },
        include: {
          consultante: {
            include: {
              usuario: true,
            },
          },
        },
      });

      if (!tramite) {
        return res.status(404).json({ error: 'Trámite no encontrado' });
      }

      // Mapear tipo_notificacion a tipo y generar título
      const tipoNotif = tipo_notificacion || 'tramite_iniciado';
      let tipo: 'info' | 'success' | 'warning' | 'error' = 'info';
      let titulo = 'Notificación de trámite';

      switch (tipoNotif) {
        case 'tramite_iniciado':
          tipo = 'success';
          titulo = 'Trámite iniciado';
          break;
        case 'tramite_pendiente':
          tipo = 'warning';
          titulo = 'Trámite pendiente';
          break;
        case 'tramite_finalizado':
          tipo = 'success';
          titulo = 'Trámite finalizado';
          break;
        case 'tramite_desistido':
          tipo = 'info';
          titulo = 'Trámite desistido';
          break;
        case 'tramite_reanudado':
          tipo = 'success';
          titulo = 'Trámite reanudado';
          break;
        default:
          tipo = 'info';
          titulo = `Actualización de trámite: ${tipoNotif}`;
      }

      // Determinar destinatarios
      const usuariosDestinatarios: number[] = [];
      
      if (destinatarios && Array.isArray(destinatarios)) {
        // Si se especifican destinatarios explícitos, usarlos
        usuariosDestinatarios.push(...destinatarios);
      } else {
        // Por defecto, notificar al consultante del trámite
        if (tramite.consultante?.usuario?.id_usuario) {
          usuariosDestinatarios.push(tramite.consultante.usuario.id_usuario);
        }
      }

      if (usuariosDestinatarios.length === 0) {
        return res.status(400).json({
          error: 'No se pudo determinar el destinatario de la notificación',
        });
      }

      // Crear notificaciones para cada destinatario
      const notificaciones = [];
      for (const id_usuario of usuariosDestinatarios) {
        const notificacion = await prisma.notificacion.create({
          data: {
            id_usuario,
            id_usuario_emisor: null, // Notificación automática del sistema
            titulo,
            mensaje,
            tipo,
            tipo_entidad: 'tramite',
            id_entidad: id_tramite,
            id_tramite,
          },
        });
        notificaciones.push(notificacion);
      }

      console.log(`📧 Notificación enviada para trámite ${id_tramite} a ${notificaciones.length} destinatario(s)`);

      res.json({
        message: 'Notificación enviada exitosamente',
        notificaciones,
        count: notificaciones.length,
      });
    } catch (error: any) {
      console.error('Error al crear notificación:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Aprobar trámite pendiente (solo para administradores)
  async aprobarTramite(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const orchestratorCall = isOrchestratorRequest(req);

      if (!orchestratorCall) {
        if (user?.rol !== 'admin' && user?.rol !== 'administrador') {
          return res.status(403).json({ error: 'Solo los administradores pueden aprobar trámites' });
        }

        const tramite = await prisma.tramite.findUnique({
          where: { id_tramite: parseInt(id) },
        });

        if (!tramite) {
          return res.status(404).json({ error: 'Trámite no encontrado' });
        }

        if (tramite.estado !== 'pendiente') {
          return res.status(400).json({
            error: `Solo se pueden aprobar trámites pendientes. Estado actual: ${tramite.estado}`,
          });
        }

        if (!tramite.process_instance_id) {
          return res.status(400).json({
            error: 'Este trámite no tiene un proceso asociado en Camunda',
          });
        }

        // Construir el businessKey que se usa como correlationKey en el BPMN
        const businessKey = `tramite:${tramite.num_carpeta}`;

        await correlacionarMensajeEnCamunda(
          tramite.process_instance_id,
          'to_en_tramite',
          {
            estado: 'en_tramite',
            userId: user?.id || null,
            accion: 'aprobar_tramite',
          },
          businessKey
        );

        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: user?.id,
          tipo_entidad: 'tramite',
          id_entidad: tramite.id_tramite,
          accion: 'aprobar',
          detalles: `Solicitud de aprobación enviada a Camunda para el trámite ${tramite.num_carpeta}`,
        });

        return res.status(202).json({
          success: true,
          message: 'Solicitud de aprobación enviada a Camunda',
          processInstanceId: tramite.process_instance_id,
        });
      }

      // Llamado interno (Camunda): realizar actualización directa
      const tramite = await prisma.tramite.findUnique({
        where: { id_tramite: parseInt(id) },
        include: {
          consultante: { include: { usuario: true } },
          grupo: true,
        },
      });

      if (!tramite) {
        return res.status(404).json({ error: 'Trámite no encontrado' });
      }

      const tramiteActualizado = await prisma.tramite.update({
        where: { id_tramite: parseInt(id) },
        data: {
          estado: 'en_tramite',
        },
        include: {
          consultante: { include: { usuario: true } },
          grupo: true,
        },
      });

      console.log(`✅ [Camunda] Trámite ${id} aprobado`);

      if (user?.id) {
        await AuditoriaService.crearDesdeRequest(req, {
          id_usuario: user.id,
          tipo_entidad: 'tramite',
          id_entidad: tramiteActualizado.id_tramite,
          accion: 'aprobar',
          detalles: `Trámite ${tramiteActualizado.num_carpeta} aprobado desde Camunda`,
        });
      }

      res.json({
        success: true,
        message: 'Trámite aprobado exitosamente',
        tramite: tramiteActualizado,
      });
    } catch (error: any) {
      console.error('❌ Error al aprobar trámite:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estadísticas de trámites
  async getStats(req: Request, res: Response) {
    try {
      const [total, porEstado] = await Promise.all([
        prisma.tramite.count(),
        prisma.tramite.groupBy({
          by: ['estado'],
          _count: true,
        }),
      ]);

      const stats = {
        total,
        porEstado: porEstado.reduce((acc: any, curr: any) => {
          acc[curr.estado] = curr._count;
          return acc;
        }, {}),
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};


