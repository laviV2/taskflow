import express from 'express';
import { prisma } from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let projects;
    if (req.user?.role === 'admin') {
      projects = await prisma.project.findMany({
        include: { members: { include: { user: true } }, tasks: true }
      });
    } else {
      projects = await prisma.project.findMany({
        where: { members: { some: { user_id: req.user?.id } } },
        include: { members: { include: { user: true } }, tasks: true }
      });
    }
    const projectsWithProgress = projects.map(p => {
      const total = p.tasks.length;
      const done = p.tasks.filter((t: any) => t.status?.toLowerCase() === 'done').length;
      let progress = total > 0 ? Math.round((done / total) * 100) : 0;
      
      // Override for closed projects
      if (p.status?.toLowerCase() === 'closed' || p.status?.toLowerCase() === 'completed') {
        progress = 100;
      }
      
      console.log(`Project: ${p.name}, Total: ${total}, Done: ${done}, Progress: ${progress}%`);
      return { ...p, progress };
    });
    res.json(projectsWithProgress);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id as string },
      include: {
        members: { include: { user: true } },
        tasks: { include: { assignee: true, comments: true } }
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const total = project.tasks.length;
    const done = project.tasks.filter((t: any) => t.status === 'Done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    res.json({ ...project, progress });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { name, description, color, due_date, members } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        due_date: due_date ? new Date(due_date) : null,
        owner_id: req.user!.id,
      }
    });

    if (members && members.length > 0) {
      await prisma.projectMember.createMany({
        data: members.map((user_id: string) => ({
          project_id: project.id,
          user_id
        }))
      });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description, color, due_date } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: { name, description, color, due_date: due_date ? new Date(due_date) : null }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/members', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { user_id } = req.body;
  try {
    const member = await prisma.projectMember.create({
      data: { project_id: req.params.id as string, user_id },
      include: { user: true }
    });
    res.json(member);
  } catch (error) {
    res.status(400).json({ error: 'User already in project or invalid ID' });
  }
});

router.delete('/:id/members/:userId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    await prisma.projectMember.deleteMany({
      where: { project_id: req.params.id as string, user_id: req.params.userId as string }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
