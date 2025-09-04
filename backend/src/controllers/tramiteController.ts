import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los trámites
export const getTramites = async (req: Request, res: Response): Promise<void> => {
  try {
    const tramites = await prisma.tramite.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        documents: true
      },
      orderBy: {
        createdAt: 'desc'
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
    
    const tramite = await prisma.tramite.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        documents: true
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
    const { type, title, description, priority, applicant, userId } = req.body;

    // Validar datos requeridos
    if (!type || !title || !description || !applicant || !userId) {
      res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos'
      });
      return;
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    const tramite = await prisma.tramite.create({
      data: {
        type,
        title,
        description,
        priority: priority || 'NORMAL',
        applicant,
        userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: tramite,
      message: 'Trámite creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating tramite:', error);
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
    const { type, title, description, priority, applicant, status } = req.body;

    // Verificar que el trámite existe
    const existingTramite = await prisma.tramite.findUnique({
      where: { id }
    });

    if (!existingTramite) {
      res.status(404).json({
        success: false,
        error: 'Trámite no encontrado'
      });
      return;
    }

    const tramite = await prisma.tramite.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(description && { description }),
        ...(priority && { priority }),
        ...(applicant && { applicant }),
        ...(status && { status })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        documents: true
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

    // Verificar que el trámite existe
    const existingTramite = await prisma.tramite.findUnique({
      where: { id }
    });

    if (!existingTramite) {
      res.status(404).json({
        success: false,
        error: 'Trámite no encontrado'
      });
      return;
    }

    await prisma.tramite.delete({
      where: { id }
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
