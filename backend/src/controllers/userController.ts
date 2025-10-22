import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateUsuarioRequest, LoginRequest, AuthResponse } from '../types';

const prisma = new PrismaClient();

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, password }: LoginRequest = req.body;

    if (!correo || !password) {
      res.status(400).json({
        success: false,
        error: 'Correo y contraseña son requeridos'
      });
      return;
    }

    // Buscar usuario por correo
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!usuario) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, usuario.hash_pass);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      res.status(401).json({
        success: false,
        error: 'Usuario inactivo'
      });
      return;
    }

    // Actualizar fecha de último login
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { fecha_ult_login: new Date() }
    });

    // Generar JWT
    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        roles: usuario.usuarioRoles.map(ur => ur.rol.nombre)
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    const response: AuthResponse = {
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        ci: usuario.ci,
        domicilio: usuario.domicilio,
        telefono: usuario.telefono,
        fecha_alta: usuario.fecha_alta,
        estado: usuario.estado,
        correo: usuario.correo,
        hash_pass: '', // No enviar hash
        fecha_ult_login: usuario.fecha_ult_login || undefined
      },
      roles: usuario.usuarioRoles.map(ur => ur.rol)
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        },
        consultante: true,
        estudiante: {
          include: {
            grupo: true
          }
        },
        docente: true,
        administrativo: true
      },
      orderBy: {
        fecha_alta: 'desc'
      }
    });

    // Remover hash_pass de la respuesta y transformar roles
    const usuariosSinPassword = usuarios.map(usuario => ({
      ...usuario,
      hash_pass: undefined,
      roles: usuario.usuarioRoles?.map(ur => ({
        id: ur.rol.id_rol,
        nombre: ur.rol.nombre
      })) || []
    }));

    res.json({
      success: true,
      data: usuariosSinPassword
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const id_usuario = parseInt(id);
    
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        },
        consultante: true,
        estudiante: {
          include: {
            grupo: true
          }
        },
        docente: true,
        administrativo: true
      }
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Remover hash_pass de la respuesta
    const { hash_pass, ...usuarioSinPassword } = usuario;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = hash_pass;

    res.json({
      success: true,
      data: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Crear un nuevo usuario
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, ci, domicilio, telefono, correo, password, roles }: CreateUsuarioRequest = req.body;

    // Validar datos requeridos
    if (!nombre || !ci || !domicilio || !telefono || !correo || !password || !roles) {
      res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos'
      });
      return;
    }

    // Verificar que el correo no esté en uso
    const existingUser = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'El correo ya está en uso'
      });
      return;
    }

    // Verificar que el CI no esté en uso
    const existingCI = await prisma.usuario.findUnique({
      where: { ci }
    });

    if (existingCI) {
      res.status(400).json({
        success: false,
        error: 'El CI ya está en uso'
      });
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        ci,
        domicilio,
        telefono,
        correo,
        hash_pass: hashedPassword,
        estado: 'activo'
      }
    });

    // Asignar roles - manejar tanto IDs como nombres de roles
    const roleIds = [];
    for (const role of roles) {
      let roleId;
      if (typeof role === 'number') {
        roleId = role;
      } else if (typeof role === 'string') {
        // Buscar el rol por nombre
        const foundRole = await prisma.rol.findFirst({
          where: { nombre: role }
        });
        if (!foundRole) {
          throw new Error(`Rol '${role}' no encontrado`);
        }
        roleId = foundRole.id_rol;
      } else {
        throw new Error('Formato de rol inválido');
      }
      roleIds.push(roleId);
    }

    await prisma.usuarioRol.createMany({
      data: roleIds.map(id_rol => ({
        id_usuario: usuario.id_usuario,
        id_rol
      }))
    });

    // Obtener usuario con roles
    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id_usuario: usuario.id_usuario },
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        }
      }
    });

    const { hash_pass, ...usuarioSinPassword } = usuarioCompleto!;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = hash_pass;

    // Transformar roles para el frontend
    const usuarioConRoles = {
      ...usuarioSinPassword,
      roles: usuarioSinPassword.usuarioRoles?.map(ur => ({
        id: ur.rol.id_rol,
        nombre: ur.rol.nombre
      })) || []
    };

    res.status(201).json({
      success: true,
      data: usuarioConRoles,
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar un usuario
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const id_usuario = parseInt(id);
    const { nombre, ci, domicilio, telefono, correo, estado } = req.body;

    // Verificar que el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id_usuario }
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Si se está cambiando el correo, verificar que no esté en uso
    if (correo && correo !== existingUser.correo) {
      const emailInUse = await prisma.usuario.findUnique({
        where: { correo }
      });

      if (emailInUse) {
        res.status(400).json({
          success: false,
          error: 'El correo ya está en uso'
        });
        return;
      }
    }

    // Si se está cambiando el CI, verificar que no esté en uso
    if (ci && ci !== existingUser.ci) {
      const ciInUse = await prisma.usuario.findUnique({
        where: { ci }
      });

      if (ciInUse) {
        res.status(400).json({
          success: false,
          error: 'El CI ya está en uso'
        });
        return;
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id_usuario },
      data: {
        ...(nombre && { nombre }),
        ...(ci && { ci }),
        ...(domicilio && { domicilio }),
        ...(telefono && { telefono }),
        ...(correo && { correo }),
        ...(estado && { estado })
      },
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        }
      }
    });

    const { hash_pass, ...usuarioSinPassword } = usuario;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = hash_pass;

    res.json({
      success: true,
      data: usuarioSinPassword,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar un usuario
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const id_usuario = parseInt(id);

    // Verificar que el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id_usuario }
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    await prisma.usuario.delete({
      where: { id_usuario }
    });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener roles disponibles
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.rol.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Verificar token y obtener usuario actual
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // El middleware de autenticación ya verificó el token
    // Solo necesitamos devolver la información del usuario
    const { id_usuario } = req.user!;

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        },
        consultante: true,
        estudiante: {
          include: {
            grupo: true
          }
        },
        docente: true,
        administrativo: true
      }
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Remover hash_pass de la respuesta
    const { hash_pass, ...usuarioSinPassword } = usuario;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = hash_pass;

    res.json({
      success: true,
      data: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};