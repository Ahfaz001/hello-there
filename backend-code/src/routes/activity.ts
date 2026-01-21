import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get activity logs
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { limit = '50', offset = '0' } = req.query;

    const take = Math.min(parseInt(limit as string) || 50, 100);
    const skip = parseInt(offset as string) || 0;

    // Admins see all activity, others see only their own
    const where = userRole === 'admin' ? {} : { userId };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          note: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.activity.count({ where }),
    ]);

    res.json({
      activities: activities.map((a) => ({
        id: a.id,
        action: a.action,
        details: a.details,
        noteId: a.noteId,
        noteTitle: a.note?.title,
        userId: a.userId,
        userName: a.user.name,
        createdAt: a.createdAt,
      })),
      total,
      hasMore: skip + take < total,
    });
  } catch (error) {
    next(error);
  }
});

// Get activity for a specific note
router.get('/note/:noteId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user has access to the note
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (userRole !== 'admin' && note.ownerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const activities = await prisma.activity.findMany({
      where: { noteId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      activities: activities.map((a) => ({
        id: a.id,
        action: a.action,
        details: a.details,
        noteId: a.noteId,
        userId: a.userId,
        userName: a.user.name,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
