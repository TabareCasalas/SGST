import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateTramiteRequest, UpdateTramiteRequest } from '../types';

const prisma = new PrismaClient();

// Obtener todos los trámites
export const getTramites = async (req: Request, res: Response): Promise<void> => {
  try {
    const tramites = await prisma.tramite.findMany({
      include: {
        consultante: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre: true,
                correo: true,
                telefono: true
              }
            }
          }
        },
        grupo: {
          select: {
            id_grupo: true,
            nombre: true
          }
        },
        adjuntos: true,
        casoTurnos: {
          include: {
            turno: {
              include: {
                administrativo: {
                  include: {
                    usuario: {
                      select: {
                        nombre: true,
                        telefono: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        notificaciones: true,
        estudianteTramites: {
          include: {
            estudiante: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    correo: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        fecha_inicio: 'desc'
      }
    });

    res.json({
      success: true,
      data: tramites
    });
  } catch (error) {
    console.error('Error fetching tramites:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener un trámite por ID
export const getTramiteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const id_tramite = parseInt(id);
    
    const tramite = await prisma.tramite.findUnique({
      where: { id_tramite },
      include: {
        consultante: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre: true,
                correo: true,
                telefono: true,
                ci: true,
                domicilio: true
              }
            }
          }
        },
        grupo: {
          select: {
            id_grupo: true,
            nombre: true
          }
        },
        adjuntos: true,
        casoTurnos: {
          include: {
            turno: {
              include: {
                administrativo: {
                  include: {
                    usuario: {
                      select: {
                        nombre: true,
                        telefono: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        notificaciones: {
          include: {
            usuarioNotificaciones: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    correo: true
                  }
                }
              }
            }
          }
        },
        estudianteTramites: {
          include: {
            estudiante: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    correo: true
                  }
                }
              }
            }
          }
        },
        auditorias: {
          include: {
            usuario: {
              select: {
                nombre: true,
                correo: true
              }
            }
          },
          orderBy: {
            fecha: 'desc'
          }
        }
      }
    });

    if (!tramite) {
      res.status(404).json({
        success: false,
        error: 'Trámite no encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: tramite
    });
  } catch (error) {
    console.error('Error fetching tramite:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Crear un nuevo trámite
export const createTramite = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 CreateTramite - Request body:', req.body);
    const { id_consultante, id_grupo, num_carpeta, observaciones }: CreateTramiteRequest = req.body;
    console.log('🔍 CreateTramite - Parsed data:', { id_consultante, id_grupo, num_carpeta, observaciones });

    // Validar datos requeridos
    if (!id_consultante || !id_grupo || !num_carpeta) {
      res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos'
      });
      return;
    }

    // Verificar que el consultante existe
    const consultante = await prisma.consultante.findUnique({
      where: { id_consultante }
    });

    if (!consultante) {
      res.status(404).json({
        success: false,
        error: 'Consultante no encontrado'
      });
      return;
    }

    // Verificar que el grupo existe
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo }
    });

    if (!grupo) {
      res.status(404).json({
        success: false,
        error: 'Grupo no encontrado'
      });
      return;
    }

    // Verificar que el número de carpeta no esté en uso
    const existingCarpeta = await prisma.tramite.findFirst({
      where: { num_carpeta }
    });

    if (existingCarpeta) {
      res.status(400).json({
        success: false,
        error: 'El número de carpeta ya está en uso'
      });
      return;
    }

    const tramite = await prisma.tramite.create({
      data: {
        id_consultante,
        id_grupo,
        num_carpeta,
        observaciones,
        estado: 'pendiente'
      },
      include: {
        consultante: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre: true,
                correo: true,
                telefono: true
              }
            }
          }
        },
        grupo: {
          select: {
            id_grupo: true,
            nombre: true
          }
        }
      }
    });

    // Crear auditoría
    const userId = (req as any).user?.id_usuario || 12; // Usar ID del usuario autenticado o admin por defecto
    console.log('🔍 Creating audit with user ID:', userId);
    await prisma.auditoria.create({
      data: {
        id_usuario: userId,
        id_tramite: tramite.id_tramite,
        accion: 'Creación de trámite',
        fecha: new Date()
      }
    });

    res.status(201).json({
      success: true,
      data: tramite,
      message: 'Trámite creado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error creating tramite:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar un trámite
export const updateTramite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const id_tramite = parseInt(id);
    const { estado, observaciones, fecha_cierre, motivo_cierre }: UpdateTramiteRequest = req.body;

    // Verificar que el trámite existe
    const existingTramite = await prisma.tramite.findUnique({
      where: { id_tramite }
    });

    if (!existingTramite) {
      res.status(404).json({
        success: false,
        error: 'Trámite no encontrado'
      });
      return;
    }

    const tramite = await prisma.tramite.update({
      where: { id_tramite },
      data: {
        ...(estado && { estado }),
        ...(observaciones && { observaciones }),
        ...(fecha_cierre && { fecha_cierre: new Date(fecha_cierre) }),
        ...(motivo_cierre && { motivo_cierre })
      },
      include: {
        consultante: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre: true,
                correo: true,
                telefono: true
              }
            }
          }
        },
        grupo: {
          select: {
            id_grupo: true,
            nombre: true
          }
        },
        adjuntos: true
      }
    });

    // Crear auditoría
    await prisma.auditoria.create({
      data: {
        id_usuario: 1, // TODO: Implementar middleware de auth
        id_tramite: tramite.id_tramite,
        accion: `Actualización de trámite: ${estado || 'modificación'}`,
        fecha: new Date()
      }
    });

    res.json({
      success: true,
      data: tramite,
      message: 'Trámite actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating tramite:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar un trámite
export const deleteTramite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const id_tramite = parseInt(id);

    // Verificar que el trámite existe
    const existingTramite = await prisma.tramite.findUnique({
      where: { id_tramite }
    });

    if (!existingTramite) {
      res.status(404).json({
        success: false,
        error: 'Trámite no encontrado'
      });
      return;
    }

    await prisma.tramite.delete({
      where: { id_tramite }
    });

    // Crear auditoría
    await prisma.auditoria.create({
      data: {
        id_usuario: 1, // TODO: Implementar middleware de auth
        accion: 'Eliminación de trámite',
        fecha: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Trámite eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting tramite:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener grupos
export const getGrupos = async (req: Request, res: Response): Promise<void> => {
  try {
    const grupos = await prisma.grupo.findMany({
      include: {
        estudiantes: {
          include: {
            usuario: {
              select: {
                nombre: true,
                correo: true
              }
            }
          }
        },
        grupoDocentes: {
          include: {
            docente: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    correo: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json({
      success: true,
      data: grupos
    });
  } catch (error) {
    console.error('Error fetching grupos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener consultantes
export const getConsultantes = async (req: Request, res: Response): Promise<void> => {
  try {
    const consultantes = await prisma.consultante.findMany({
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            correo: true,
            telefono: true,
            ci: true,
            domicilio: true
          }
        },
        tramites: {
          select: {
            id_tramite: true,
            num_carpeta: true,
            estado: true,
            fecha_inicio: true
          },
          orderBy: {
            fecha_inicio: 'desc'
          }
        }
      },
      orderBy: {
        usuario: {
          nombre: 'asc'
        }
      }
    });

    res.json({
      success: true,
      data: consultantes
    });
  } catch (error) {
    console.error('Error fetching consultantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};