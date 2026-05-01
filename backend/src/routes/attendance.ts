import express from 'express';
import { prisma } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Sign In
router.post('/signin', authenticate, async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: {
        user_id: req.user!.id,
        date: { gte: today }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already signed in today' });
    }

    const attendance = await prisma.attendance.create({
      data: { user_id: req.user!.id }
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign Out
router.post('/signout', authenticate, async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: {
        user_id: req.user!.id,
        date: { gte: today }
      }
    });

    if (!existing) {
      return res.status(400).json({ error: 'Not signed in today' });
    }
    if (existing.signOut) {
      return res.status(400).json({ error: 'Already signed out' });
    }

    const attendance = await prisma.attendance.update({
      where: { id: existing.id },
      data: { signOut: new Date() }
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Attendance
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === 'admin') {
      const allAttendance = await prisma.attendance.findMany({ include: { user: true }, orderBy: { date: 'desc' } });
      res.json(allAttendance);
    } else {
      const myAttendance = await prisma.attendance.findMany({ where: { user_id: req.user!.id }, orderBy: { date: 'desc' } });
      res.json(myAttendance);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
