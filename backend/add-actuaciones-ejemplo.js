const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Buscando grupo "pepepepep"...');
    
    // Buscar el grupo
    const grupo = await prisma.grupo.findFirst({
      where: {
        nombre: {
          contains: 'pepepepep',
          mode: 'insensitive',
        },
      },
      include: {
        tramites: {
          include: {
            hoja_ruta: true,
          },
        },
        miembros_grupo: {
          where: {
            rol_en_grupo: 'estudiante',
          },
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!grupo) {
      console.log('❌ No se encontró el grupo "pepepepep"');
      return;
    }

    console.log(`✅ Grupo encontrado: ${grupo.nombre} (ID: ${grupo.id_grupo})`);

    // Ver si hay trámites
    if (!grupo.tramites || grupo.tramites.length === 0) {
      console.log('❌ No hay trámites en este grupo');
      return;
    }

    // Obtener estudiantes del grupo
    if (!grupo.miembros_grupo || grupo.miembros_grupo.length === 0) {
      console.log('❌ No hay estudiantes en este grupo');
      return;
    }

    const estudiante = grupo.miembros_grupo[0];
    console.log(`👤 Estudiante seleccionado: ${estudiante.usuario.nombre} (ID: ${estudiante.id_usuario})`);

    // Seleccionar el primer trámite
    const tramite = grupo.tramites[0];
    console.log(`📋 Trámite seleccionado: Carpeta #${tramite.num_carpeta} (ID: ${tramite.id_tramite})`);
    console.log(`📊 Actuaciones actuales: ${tramite.hoja_ruta?.length || 0}`);

    // Crear actuaciones de ejemplo
    const actuacionesEjemplo = [
      {
        id_tramite: tramite.id_tramite,
        id_usuario: estudiante.id_usuario,
        fecha_actuacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
        descripcion: 'Realizada visita inicial al consultante. Se obtuvo información sobre el caso y se explicaron los procedimientos a seguir.',
      },
      {
        id_tramite: tramite.id_tramite,
        id_usuario: estudiante.id_usuario,
        fecha_actuacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
        descripcion: 'Recopilación de documentación requerida. Se solicitó al consultante copia de cédula de identidad y comprobantes de domicilio.',
      },
      {
        id_tramite: tramite.id_tramite,
        id_usuario: estudiante.id_usuario,
        fecha_actuacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
        descripcion: 'Revisión de documentos presentados. Se verificó la validez y completitud de la documentación recibida.',
      },
      {
        id_tramite: tramite.id_tramite,
        id_usuario: estudiante.id_usuario,
        fecha_actuacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Ayer
        descripcion: 'Elaboración del informe preliminar. Se redactó el documento con los hallazgos iniciales del caso.',
      },
      {
        id_tramite: tramite.id_tramite,
        id_usuario: estudiante.id_usuario,
        fecha_actuacion: new Date(), // Hoy
        descripcion: 'Segunda entrevista con el consultante. Se profundizó en los aspectos específicos del caso y se aclararon dudas.',
      },
    ];

    console.log('\n📝 Agregando actuaciones de ejemplo...');
    
    for (const actuacion of actuacionesEjemplo) {
      const creada = await prisma.hojaRuta.create({
        data: actuacion,
        include: {
          usuario: {
            select: {
              nombre: true,
              ci: true,
            },
          },
        },
      });

      console.log(`✅ Actuación agregada: ${new Date(creada.fecha_actuacion).toLocaleDateString('es-ES')} - ${creada.descripcion.substring(0, 50)}...`);
    }

    console.log(`\n✨ Se agregaron ${actuacionesEjemplo.length} actuaciones al trámite Carpeta #${tramite.num_carpeta}`);
    
    // Mostrar resumen
    const actuacionesTotales = await prisma.hojaRuta.findMany({
      where: { id_tramite: tramite.id_tramite },
      orderBy: { fecha_actuacion: 'desc' },
    });
    
    console.log(`\n📊 Total de actuaciones en el trámite: ${actuacionesTotales.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();











