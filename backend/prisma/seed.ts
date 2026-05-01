import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password,
      role: 'admin',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@taskflow.com',
      password,
      role: 'member',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@taskflow.com',
      password,
      role: 'member',
    },
  });

  // Create Project
  const project = await prisma.project.create({
    data: {
      name: 'TaskFlow Launch',
      description: 'Main project for the system rollout and team onboarding.',
      color: '#6366F1',
      owner_id: admin.id,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  // Assign Members to Project
  await prisma.projectMember.createMany({
    data: [
      { project_id: project.id, user_id: admin.id, role: 'admin' },
      { project_id: project.id, user_id: member1.id, role: 'member' },
      { project_id: project.id, user_id: member2.id, role: 'member' },
    ],
  });

  // Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Design UI Components',
        description: 'Create professional components using Tailwind and Lucide.',
        status: 'Done',
        priority: 'High',
        project_id: project.id,
        assignee_id: member1.id,
        creator_id: admin.id,
      },
      {
        title: 'Implement Auth System',
        description: 'Secure JWT authentication with cookie support.',
        status: 'In Progress',
        priority: 'Critical',
        project_id: project.id,
        assignee_id: member2.id,
        creator_id: admin.id,
      },
      {
        title: 'Setup Database Schema',
        description: 'Define relational models for team and task tracking.',
        status: 'To Do',
        priority: 'Medium',
        project_id: project.id,
        assignee_id: admin.id,
        creator_id: admin.id,
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
