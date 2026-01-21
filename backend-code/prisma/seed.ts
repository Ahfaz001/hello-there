import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@collabnotes.com' },
    update: {},
    create: {
      email: 'admin@collabnotes.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 10);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@collabnotes.com' },
    update: {},
    create: {
      email: 'editor@collabnotes.com',
      password: editorPassword,
      name: 'Editor User',
      role: 'editor',
    },
  });

  // Create viewer user
  const viewerPassword = await bcrypt.hash('viewer123', 10);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@collabnotes.com' },
    update: {},
    create: {
      email: 'viewer@collabnotes.com',
      password: viewerPassword,
      name: 'Viewer User',
      role: 'viewer',
    },
  });

  // Create sample notes
  await prisma.note.createMany({
    data: [
      {
        title: 'Welcome to CollabNotes',
        content: 'This is your first collaborative note. Start editing to see real-time collaboration in action!',
        ownerId: admin.id,
      },
      {
        title: 'Project Ideas',
        content: '1. Build a task manager\n2. Create a team dashboard\n3. Design a new feature',
        ownerId: editor.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully!');
  console.log('Test accounts:');
  console.log('  Admin: admin@collabnotes.com / admin123');
  console.log('  Editor: editor@collabnotes.com / editor123');
  console.log('  Viewer: viewer@collabnotes.com / viewer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
