import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: "ADMIN",
      isActive: true,
    },
  });

  // Create test student user
  const studentPassword = await hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      password: studentPassword,
      name: 'Test Student',
      role: "STUDENT",
      universityId: '12345',
      isActive: true,
    },
  });

  // Create pre-registered students
  const preRegisteredStudents = [
    {
      fullName: 'John Doe',
      universityId: '10001',
      isUsed: false,
    },
    {
      fullName: 'Jane Smith',
      universityId: '10002',
      isUsed: false,
    },
    {
      fullName: 'Bob Johnson',
      universityId: '10003',
      isUsed: false,
    },
  ];

  for (const preStudent of preRegisteredStudents) {
    await prisma.preRegisteredStudent.upsert({
      where: { universityId: preStudent.universityId },
      update: {},
      create: preStudent,
    });
  }

  // Create a test level
  const level = await prisma.level.upsert({
    where: { order: 1 },
    update: {},
    create: {
      name: 'Level 1',
      description: 'First level courses',
      order: 1,
      isVisible: true,
    },
  });

  // Create a test course
  const course = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      name: 'Introduction to Programming',
      description: 'Basic programming concepts',
      levelId: level.id,
      isVisible: true,
    },
  });

  // Create GPA subjects
  const gpaSubjects = [
    {
      yearName: 'First Year',
      subjectName: 'Mathematics 1',
      creditHours: 3,
      order: 1,
    },
    {
      yearName: 'First Year',
      subjectName: 'Physics 1',
      creditHours: 3,
      order: 2,
    },
    {
      yearName: 'First Year',
      subjectName: 'Computer Science 1',
      creditHours: 4,
      order: 3,
    },
  ];

  for (const subject of gpaSubjects) {
    await prisma.gpaSubject.upsert({
      where: { order: subject.order },
      update: {},
      create: subject,
    });
  }

  // Create product category
  const category = await prisma.productCategory.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: {
      id: 'cat-1',
      name: 'Books',
      description: 'Educational books',
      isVisible: true,
    },
  });

  // Create a test product
  await prisma.product.upsert({
    where: { slug: 'programming-textbook' },
    update: {},
    create: {
      name: 'Programming Textbook',
      slug: 'programming-textbook',
      description: 'Complete guide to programming',
      price: 29.99,
      categoryId: category.id,
      isVisible: true,
      isSpecialOffer: false,
    },
  });

  // Create a test book
  await prisma.book.upsert({
    where: { slug: 'introduction-to-algorithms' },
    update: {},
    create: {
      title: 'Introduction to Algorithms',
      slug: 'introduction-to-algorithms',
      author: 'Thomas H. Cormen',
      description: 'Comprehensive textbook on algorithms',
      totalCopies: 5,
      availableCopies: 5,
      isVisible: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log(`Admin user: ${admin.email}`);
  console.log(`Student user: ${student.email}`);
  console.log(`Pre-registered students: ${preRegisteredStudents.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 