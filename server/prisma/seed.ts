import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete all existing users first
  console.log('🗑️  Deleting all existing users...');
  await prisma.user.deleteMany({});
  
  // Create the single superadmin user
  const superAdminPassword = await hash('password123', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin.msc@gmail.com',
      password: superAdminPassword,
      name: 'مدير النظام',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📝 Created superadmin user:');
  console.log(`   - Name: ${superAdmin.name}`);
  console.log(`   - Email: ${superAdmin.email}`);
  console.log(`   - Password: password123`);
  console.log(`   - Role: ${superAdmin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 