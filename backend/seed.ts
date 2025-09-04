import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sgst.com' },
    update: {},
    create: {
      email: 'admin@sgst.com',
      name: 'Administrador',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Crear usuario consultor de ejemplo
  const consultantUser = await prisma.user.upsert({
    where: { email: 'consultor@sgst.com' },
    update: {},
    create: {
      email: 'consultor@sgst.com',
      name: 'Consultor Notarial',
      role: 'CONSULTANT',
      isActive: true,
    },
  });

  // Crear algunos trámites de ejemplo
  const tramite1 = await prisma.tramite.create({
    data: {
      type: 'Certificación de Firma',
      title: 'Certificación de firma para documento legal',
      description: 'Certificación de firma para contrato de compraventa',
      status: 'PENDING',
      priority: 'NORMAL',
      applicant: 'Juan Pérez',
      userId: consultantUser.id,
    },
  });

  const tramite2 = await prisma.tramite.create({
    data: {
      type: 'Protocolización',
      title: 'Protocolización de testamento',
      description: 'Protocolización de testamento ológrafo',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      applicant: 'María González',
      userId: consultantUser.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user created:', adminUser.email);
  console.log('👤 Consultant user created:', consultantUser.email);
  console.log('📄 Sample tramites created:', tramite1.id, tramite2.id);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
