import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes
  await prisma.estudianteTramite.deleteMany();
  await prisma.usuarioNotificacion.deleteMany();
  await prisma.casoTurno.deleteMany();
  await prisma.auditoria.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.adjunto.deleteMany();
  await prisma.tramite.deleteMany();
  await prisma.turno.deleteMany();
  await prisma.grupoDocente.deleteMany();
  await prisma.grupoEstudiante.deleteMany();
  await prisma.estudianteTramite.deleteMany();
  await prisma.estudiante.deleteMany();
  await prisma.docente.deleteMany();
  await prisma.administrativo.deleteMany();
  await prisma.consultante.deleteMany();
  await prisma.usuarioRol.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany();
  await prisma.grupo.deleteMany();

  // Crear roles
  const adminRol = await prisma.rol.create({
    data: {
      nombre: 'Administrador'
    }
  });

  const consultorRol = await prisma.rol.create({
    data: {
      nombre: 'Consultor'
    }
  });

  const estudianteRol = await prisma.rol.create({
    data: {
      nombre: 'Estudiante'
    }
  });

  const docenteRol = await prisma.rol.create({
    data: {
      nombre: 'Docente'
    }
  });

  const administrativoRol = await prisma.rol.create({
    data: {
      nombre: 'Administrativo'
    }
  });

  // Crear grupos
  const grupo1 = await prisma.grupo.create({
    data: {
      nombre: 'Grupo A - Sistemas'
    }
  });

  const grupo2 = await prisma.grupo.create({
    data: {
      nombre: 'Grupo B - Ingeniería'
    }
  });

  // Hash de contraseñas
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Crear usuarios
  const adminUser = await prisma.usuario.create({
    data: {
      nombre: 'Administrador SGST',
      ci: '12345678',
      domicilio: 'Av. Principal 123',
      telefono: '0987654321',
      correo: 'admin@sgst.com',
      hash_pass: hashedPassword,
      estado: 'activo'
    }
  });

  const consultorUser = await prisma.usuario.create({
    data: {
      nombre: 'Consultor Principal',
      ci: '87654321',
      domicilio: 'Calle Secundaria 456',
      telefono: '0912345678',
      correo: 'consultor@sgst.com',
      hash_pass: hashedPassword,
      estado: 'activo'
    }
  });

  const estudianteUser = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      ci: '11223344',
      domicilio: 'Barrio Centro 789',
      telefono: '0998765432',
      correo: 'juan.perez@estudiante.com',
      hash_pass: hashedPassword,
      estado: 'activo'
    }
  });

  const docenteUser = await prisma.usuario.create({
    data: {
      nombre: 'Dr. María González',
      ci: '55667788',
      domicilio: 'Zona Norte 321',
      telefono: '0976543210',
      correo: 'maria.gonzalez@docente.com',
      hash_pass: hashedPassword,
      estado: 'activo'
    }
  });

  const administrativoUser = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Rodríguez',
      ci: '99887766',
      domicilio: 'Sur Este 654',
      telefono: '0954321098',
      correo: 'carlos.rodriguez@admin.com',
      hash_pass: hashedPassword,
      estado: 'activo'
    }
  });

  // Asignar roles a usuarios
  await prisma.usuarioRol.createMany({
    data: [
      { id_usuario: adminUser.id_usuario, id_rol: adminRol.id_rol },
      { id_usuario: consultorUser.id_usuario, id_rol: consultorRol.id_rol },
      { id_usuario: estudianteUser.id_usuario, id_rol: estudianteRol.id_rol },
      { id_usuario: docenteUser.id_usuario, id_rol: docenteRol.id_rol },
      { id_usuario: administrativoUser.id_usuario, id_rol: administrativoRol.id_rol }
    ]
  });

  // Crear consultante
  const consultante = await prisma.consultante.create({
    data: {
      id_usuario: consultorUser.id_usuario,
      est_civil: 'Soltero',
      nro_padron: 1001
    }
  });

  // Crear estudiante
  const estudiante = await prisma.estudiante.create({
    data: {
      id_usuario: estudianteUser.id_usuario,
      semestre: 6,
      id_grupo: grupo1.id_grupo
    }
  });

  // Crear docente
  const docente = await prisma.docente.create({
    data: {
      id_usuario: docenteUser.id_usuario,
      tipo_docente: 'titular'
    }
  });

  // Crear administrativo
  const administrativo = await prisma.administrativo.create({
    data: {
      id_usuario: administrativoUser.id_usuario,
      tipo_funcionario: 'agendador',
      nivel: 1
    }
  });

  // Asignar estudiante al grupo
  await prisma.grupoEstudiante.create({
    data: {
      id_grupo: grupo1.id_grupo,
      id_estudiante: estudiante.id_estudiante
    }
  });

  // Asignar docente al grupo
  await prisma.grupoDocente.create({
    data: {
      id_grupo: grupo1.id_grupo,
      id_docente: docente.id_docente,
      rol_docente: 'coordinador'
    }
  });

  // Crear trámites de ejemplo
  const tramite1 = await prisma.tramite.create({
    data: {
      id_consultante: consultante.id_consultante,
      id_grupo: grupo1.id_grupo,
      num_carpeta: 2024001,
      estado: 'pendiente',
      observaciones: 'Trámite de inscripción para el semestre actual',
      motivo_cierre: null
    }
  });

  const tramite2 = await prisma.tramite.create({
    data: {
      id_consultante: consultante.id_consultante,
      id_grupo: grupo2.id_grupo,
      num_carpeta: 2024002,
      estado: 'en_proceso',
      observaciones: 'Consulta sobre requisitos de graduación',
      motivo_cierre: null
    }
  });

  // Crear adjuntos
  await prisma.adjunto.create({
    data: {
      id_tramite: tramite1.id_tramite,
      nombre_archivo: 'documento_identidad.pdf',
      ruta: '/uploads/documento_identidad.pdf'
    }
  });

  await prisma.adjunto.create({
    data: {
      id_tramite: tramite2.id_tramite,
      nombre_archivo: 'certificado_estudios.pdf',
      ruta: '/uploads/certificado_estudios.pdf'
    }
  });

  // Crear turnos
  const turno1 = await prisma.turno.create({
    data: {
      fecha_hora: new Date('2024-10-20T10:00:00Z'),
      id_admin: administrativo.id_administrativo
    }
  });

  const turno2 = await prisma.turno.create({
    data: {
      fecha_hora: new Date('2024-10-21T14:30:00Z'),
      id_admin: administrativo.id_administrativo
    }
  });

  // Asignar trámites a turnos
  await prisma.casoTurno.createMany({
    data: [
      { id_tramite: tramite1.id_tramite, id_turno: turno1.id_turno },
      { id_tramite: tramite2.id_tramite, id_turno: turno2.id_turno }
    ]
  });

  // Crear notificaciones
  const notificacion1 = await prisma.notificacion.create({
    data: {
      id_tramite: tramite1.id_tramite,
      mensaje: 'Su trámite ha sido recibido y está en proceso de revisión.',
      fecha_envio: new Date()
    }
  });

  const notificacion2 = await prisma.notificacion.create({
    data: {
      id_tramite: tramite2.id_tramite,
      mensaje: 'Se requiere documentación adicional para continuar con su trámite.',
      fecha_envio: new Date()
    }
  });

  // Asignar notificaciones a usuarios
  await prisma.usuarioNotificacion.createMany({
    data: [
      { id_usuario: consultorUser.id_usuario, id_notificacion: notificacion1.id_notificacion, estado: 'pendiente' },
      { id_usuario: consultorUser.id_usuario, id_notificacion: notificacion2.id_notificacion, estado: 'leída' }
    ]
  });

  // Crear auditorías
  await prisma.auditoria.createMany({
    data: [
      {
        id_usuario: adminUser.id_usuario,
        id_tramite: tramite1.id_tramite,
        accion: 'Creación de trámite',
        fecha: new Date()
      },
      {
        id_usuario: adminUser.id_usuario,
        id_tramite: tramite2.id_tramite,
        accion: 'Actualización de estado',
        fecha: new Date()
      },
      {
        id_usuario: administrativoUser.id_usuario,
        accion: 'Asignación de turno',
        fecha: new Date()
      }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user created: admin@sgst.com');
  console.log('👤 Consultant user created: consultor@sgst.com');
  console.log('👤 Student user created: juan.perez@estudiante.com');
  console.log('👤 Teacher user created: maria.gonzalez@docente.com');
  console.log('👤 Administrative user created: carlos.rodriguez@admin.com');
  console.log('📄 Sample tramites created:', tramite1.id_tramite, tramite2.id_tramite);
  console.log('📚 Groups created: Grupo A - Sistemas, Grupo B - Ingeniería');
  console.log('🔔 Notifications created: 2');
  console.log('📋 Audit logs created: 3');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });