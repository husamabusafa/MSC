import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a Super Admin user
  const superAdminPassword = await hash('superadmin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  // Create an Academic Admin user
  const academicAdminPassword = await hash('academicadmin123', 10);
  const academicAdmin = await prisma.user.upsert({
    where: { email: 'academicadmin@example.com' },
    update: {},
    create: {
      email: 'academicadmin@example.com',
      password: academicAdminPassword,
      name: 'Academic Admin',
      role: 'ACADEMIC_ADMIN',
      isActive: true,
    },
  });

  // Create a Library Admin user
  const libraryAdminPassword = await hash('libraryadmin123', 10);
  const libraryAdmin = await prisma.user.upsert({
    where: { email: 'libraryadmin@example.com' },
    update: {},
    create: {
      email: 'libraryadmin@example.com',
      password: libraryAdminPassword,
      name: 'Library Admin',
      role: 'LIBRARY_ADMIN',
      isActive: true,
    },
  });

  // Create a Store Admin user
  const storeAdminPassword = await hash('storeadmin123', 10);
  const storeAdmin = await prisma.user.upsert({
    where: { email: 'storeadmin@example.com' },
    update: {},
    create: {
      email: 'storeadmin@example.com',
      password: storeAdminPassword,
      name: 'Store Admin',
      role: 'STORE_ADMIN',
      isActive: true,
    },
  });

  // Create a test student user
  const studentPassword = await hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      password: studentPassword,
      name: 'Test Student',
      role: 'STUDENT',
      universityId: 'STU001',
      isActive: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📝 Created users:');
  console.log(`   - Super Admin: ${superAdmin.email} (password: superadmin123)`);
  console.log(`   - Academic Admin: ${academicAdmin.email} (password: academicadmin123)`);
  console.log(`   - Library Admin: ${libraryAdmin.email} (password: libraryadmin123)`);
  console.log(`   - Store Admin: ${storeAdmin.email} (password: storeadmin123)`);
  console.log(`   - Test Student: ${student.email} (password: student123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 