import express from 'express';
import { prisma } from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const team = await prisma.user.findMany({
      select: { 
        id: true, name: true, email: true, role: true, avatar_url: true, createdAt: true,
        assignedTasks: true 
      }
    });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/invite', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { email, role, name } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User exists' });

    // Dummy password for invited users
    const password = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: { email, role, name, password }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/role', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { role: req.body.role }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
