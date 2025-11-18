import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando o creando grupo "pepepepep"...');
  
  // Buscar o crear el grupo
  let grupo = await prisma.grupo.findFirst({
    where: { nombre: 'pepepepep' },
  });

  if (!grupo) {
    console.log('📝 Grupo no existe, creándolo...');
    
    // Buscar un docente para asignar como responsable
    const docente = await prisma.usuario.findFirst({
      where: { rol: 'docente', activo: true },
    });

    if (!docente) {
      throw new Error('No se encontró ningún docente activo. Crea al menos un docente primero.');
    }

    grupo = await prisma.grupo.create({
      data: {
        nombre: 'pepepepep',
        descripcion: 'Grupo de prueba para fichas',
        activo: true,
        miembros_grupo: {
          create: [
            {
              id_usuario: docente.id_usuario,
              rol_en_grupo: 'responsable',
            },
          ],
        },
      },
    });
    console.log(`✅ Grupo creado: ${grupo.nombre} (ID: ${grupo.id_grupo})`);
  } else {
    console.log(`✅ Grupo encontrado: ${grupo.nombre} (ID: ${grupo.id_grupo})`);
  }

  // Obtener consultantes y docentes
  const consultantes = await prisma.consultante.findMany({
    take: 5,
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

  console.log(`📝 Creando fichas asignadas al grupo "${grupo.nombre}"...`);

  const temas = [
    'Consulta sobre trámite de documentación',
    'Asesoramiento legal en materia laboral',
    'Solicitud de ayuda social',
    'Consulta sobre derechos ciudadanos',
    'Asesoramiento en trámites administrativos',
  ];

  const fichasCreadas = [];

  for (let i = 0; i < 5; i++) {
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
          estado: 'asignada', // Estado asignada para que esté asignada al grupo
          observaciones: `Ficha de prueba ${i + 1} asignada al grupo ${grupo.nombre}`,
        },
      });

      fichasCreadas.push(ficha);
      console.log(`✅ Ficha ${i + 1} creada: ${ficha.numero_consulta} - ${ficha.tema_consulta}`);
    } catch (error: any) {
      console.error(`❌ Error al crear ficha ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Proceso completado. ${fichasCreadas.length} fichas creadas asignadas al grupo "${grupo.nombre}"`);
  console.log(`📊 Resumen:`);
  console.log(`   - Grupo: ${grupo.nombre} (ID: ${grupo.id_grupo})`);
  console.log(`   - Fichas creadas: ${fichasCreadas.length}`);
  fichasCreadas.forEach((ficha, index) => {
    console.log(`   ${index + 1}. ${ficha.numero_consulta} - ${ficha.tema_consulta} (Estado: ${ficha.estado})`);
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




