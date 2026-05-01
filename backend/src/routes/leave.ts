import express from 'express';
import { prisma } from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply for leave
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { reason, startDate, endDate } = req.body;
  try {
    const leave = await prisma.leave.create({
      data: {
        user_id: req.user!.id,
        reason,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      }
    });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leaves
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === 'admin') {
      const leaves = await prisma.leave.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
      res.json(leaves);
    } else {
      const leaves = await prisma.leave.findMany({ where: { user_id: req.user!.id }, orderBy: { createdAt: 'desc' } });
      res.json(leaves);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/Reject leave
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { status } = req.body; // 'Approved' or 'Rejected'
  try {
    const leave = await prisma.leave.update({
      where: { id: req.params.id as string },
      data: { status }
    });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
