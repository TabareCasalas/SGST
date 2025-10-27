import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos de prueba...');

  // Crear grupos
  const grupo1 = await prisma.grupo.create({
    data: {
      nombre: 'Trámites Notariales',
      descripcion: 'Trámites relacionados con notarías y documentos notariales',
      activo: true,
    },
  });

  const grupo2 = await prisma.grupo.create({
    data: {
      nombre: 'Trámites Administrativos',
      descripcion: 'Trámites administrativos y gestiones públicas',
      activo: true,
    },
  });

  const grupo3 = await prisma.grupo.create({
    data: {
      nombre: 'Consultas Legales',
      descripcion: 'Consultas y asesoría legal',
      activo: true,
    },
  });

  console.log('✅ Grupos creados');

  // Crear usuarios
  const usuario1 = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      ci: '1234567',
      domicilio: 'Av. Principal 123',
      telefono: '70012345',
      correo: 'juan.perez@email.com',
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      nombre: 'María González',
      ci: '2345678',
      domicilio: 'Calle Mayor 456',
      telefono: '70023456',
      correo: 'maria.gonzalez@email.com',
    },
  });

  const usuario3 = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Rodríguez',
      ci: '3456789',
      domicilio: 'Paseo del Prado 789',
      telefono: '70034567',
      correo: 'carlos.rodriguez@email.com',
    },
  });

  const usuario4 = await prisma.usuario.create({
    data: {
      nombre: 'Ana Martínez',
      ci: '4567890',
      domicilio: 'Plaza Central 321',
      telefono: '70045678',
      correo: 'ana.martinez@email.com',
    },
  });

  console.log('✅ Usuarios creados');

  // Crear consultantes
  const consultante1 = await prisma.consultante.create({
    data: {
      id_usuario: usuario1.id_usuario,
      est_civil: 'Casado',
      nro_padron: 10001,
    },
  });

  const consultante2 = await prisma.consultante.create({
    data: {
      id_usuario: usuario2.id_usuario,
      est_civil: 'Soltero',
      nro_padron: 10002,
    },
  });

  const consultante3 = await prisma.consultante.create({
    data: {
      id_usuario: usuario3.id_usuario,
      est_civil: 'Casado',
      nro_padron: 10003,
    },
  });

  const consultante4 = await prisma.consultante.create({
    data: {
      id_usuario: usuario4.id_usuario,
      est_civil: 'Divorciado',
      nro_padron: 10004,
    },
  });

  console.log('✅ Consultantes creados');

  // Crear algunos trámites de ejemplo
  const tramite1 = await prisma.tramite.create({
    data: {
      id_consultante: consultante1.id_consultante,
      id_grupo: grupo1.id_grupo,
      num_carpeta: 10001,
      estado: 'iniciado',
      observaciones: 'Trámite de ejemplo 1',
    },
  });

  const tramite2 = await prisma.tramite.create({
    data: {
      id_consultante: consultante2.id_consultante,
      id_grupo: grupo2.id_grupo,
      num_carpeta: 10002,
      estado: 'en_revision',
      observaciones: 'Trámite de ejemplo 2',
    },
  });

  console.log('✅ Trámites de ejemplo creados');
  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

