import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando grupo "pepepepep"...');
  
  // Buscar el grupo
  const grupo = await prisma.grupo.findFirst({
    where: { nombre: 'pepepepep' },
  });

  if (!grupo) {
    throw new Error('Grupo "pepepepep" no encontrado. Ejecuta primero el script crearFichasGrupo.ts');
  }

  console.log(`✅ Grupo encontrado: ${grupo.nombre} (ID: ${grupo.id_grupo})`);

  // Obtener consultantes y docentes
  const consultantes = await prisma.consultante.findMany({
    take: 10,
  });

  const docentes = await prisma.usuario.findMany({
    where: { rol: 'docente', activo: true },
    take: 3,
  });

  if (consultantes.length === 0) {
    throw new Error('No se encontraron consultantes. Crea al menos un consultante primero.');
  }

  if (docentes.length === 0) {
    throw new Error('No se encontraron docentes. Crea al menos un docente primero.');
  }

  console.log(`📋 Encontrados ${consultantes.length} consultantes y ${docentes.length} docentes`);

  // Obtener el último número de consulta del año actual
  const añoActual = new Date().getFullYear();
  const ultimaFicha = await prisma.ficha.findFirst({
    where: {
      numero_consulta: {
        contains: `/${añoActual}`,
      },
    },
    orderBy: {
      numero_consulta: 'desc',
    },
  });

  let siguienteNumero = 1;
  if (ultimaFicha) {
    const partes = ultimaFicha.numero_consulta.split('/');
    siguienteNumero = parseInt(partes[0]) + 1;
  }

  console.log(`📝 Creando fichas en estado "standby" (listas para iniciar trámites)...`);

  const temas = [
    'Consulta sobre trámite de documentación',
    'Asesoramiento legal en materia laboral',
    'Solicitud de ayuda social',
    'Consulta sobre derechos ciudadanos',
    'Asesoramiento en trámites administrativos',
    'Solicitud de certificado de residencia',
    'Consulta sobre pensión alimenticia',
    'Asesoramiento en materia de vivienda',
    'Solicitud de ayuda económica',
    'Consulta sobre trámites de identidad',
  ];

  const fichasCreadas = [];

  for (let i = 0; i < 10; i++) {
    const consultante = consultantes[i % consultantes.length];
    const docente = docentes[i % docentes.length];
    const tema = temas[i % temas.length];
    const numeroConsulta = `${String(siguienteNumero + i).padStart(2, '0')}/${añoActual}`;

    // Fecha de cita: días aleatorios en el futuro (1-30 días)
    const diasFuturo = Math.floor(Math.random() * 30) + 1;
    const fechaCita = new Date();
    fechaCita.setDate(fechaCita.getDate() + diasFuturo);
    fechaCita.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // Entre 9:00 y 17:00

    const horaCita = `${String(fechaCita.getHours()).padStart(2, '0')}:${String(fechaCita.getMinutes()).padStart(2, '0')}`;

    try {
      const ficha = await prisma.ficha.create({
        data: {
          id_consultante: consultante.id_consultante,
          id_docente: docente.id_usuario,
          id_grupo: grupo.id_grupo,
          tema_consulta: tema,
          numero_consulta: numeroConsulta,
          fecha_cita: fechaCita,
          hora_cita: horaCita,
          estado: 'standby', // Estado standby para que estén listas para iniciar trámites
          observaciones: `Ficha ${i + 1} lista para iniciar trámite - Grupo ${grupo.nombre}`,
        },
      });

      fichasCreadas.push(ficha);
      console.log(`✅ Ficha ${i + 1} creada: ${ficha.numero_consulta} - ${ficha.tema_consulta} (Estado: ${ficha.estado})`);
    } catch (error: any) {
      console.error(`❌ Error al crear ficha ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Proceso completado. ${fichasCreadas.length} fichas creadas en estado "standby"`);
  console.log(`📊 Resumen:`);
  console.log(`   - Grupo: ${grupo.nombre} (ID: ${grupo.id_grupo})`);
  console.log(`   - Fichas creadas: ${fichasCreadas.length}`);
  console.log(`   - Estado: standby (listas para iniciar trámites)`);
  fichasCreadas.forEach((ficha, index) => {
    console.log(`   ${index + 1}. ${ficha.numero_consulta} - ${ficha.tema_consulta}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






