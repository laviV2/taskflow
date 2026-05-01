import express from 'express';
import { prisma } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const where = req.user?.role === 'admin' ? {} : { assignee_id: req.user?.id };
    const tasks = await prisma.task.findMany({
      where,
      include: { project: true, assignee: true }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { title, description, status, priority, project_id, assignee_id, due_date } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        project_id,
        assignee_id,
        creator_id: req.user!.id,
        due_date: due_date ? new Date(due_date) : null,
      }
    });
    res.json(task);
  } catch (error: any) {
    console.error('Task Creation Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const { title, description, status, priority, assignee_id, due_date } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: {
        title, description, status, priority, assignee_id,
        due_date: due_date ? new Date(due_date) : null,
      }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id as string } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    if (req.user?.role !== 'admin' && task.creator_id !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.task.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { task_id: req.params.id as string },
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/comments', authenticate, async (req: AuthRequest, res) => {
  const { content } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        task_id: req.params.id as string,
        user_id: req.user!.id
      },
      include: { user: true }
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
