import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { logActivity } from '../services/activity.js';

const router = Router();

// All admin routes require admin role
router.use(authenticate, requireRole('admin'));

// Get all users
router.get('/users', async (req: AuthRequest, res: Response, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
        notesCount: u._count.notes,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Update user role - helper function
const handleUpdateRole = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user!.id;

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    // Prevent self-demotion
    if (id === adminId) {
      res.status(400).json({ error: 'Cannot change your own role' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    await logActivity(adminId, 'user_role_changed', `Changed ${user.name}'s role to ${role}`);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update user role (PUT)
router.put('/users/:id/role', handleUpdateRole);

// Update user (PATCH) - for frontend compatibility
router.patch('/users/:id', handleUpdateRole);

// Delete user
router.delete('/users/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    // Prevent self-deletion
    if (id === adminId) {
      res.status(400).json({ error: 'Cannot delete yourself' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    await logActivity(adminId, 'user_deleted', `Deleted user: ${user.name}`);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all notes (admin)
router.get('/notes', async (req: AuthRequest, res: Response, next) => {
  try {
    const notes = await prisma.note.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      notes: notes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        ownerId: note.ownerId,
        ownerName: note.owner.name,
        ownerEmail: note.owner.email,
        isPublic: note.isPublic,
        shareLink: note.shareId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        collaborators: note.collaborators.map((c) => ({
          id: c.id,
          userId: c.user.id,
          userName: c.user.name,
          userEmail: c.user.email,
          role: c.role,
          addedAt: c.createdAt.toISOString(),
        })),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Delete any note (admin)
router.delete('/notes/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    const note = await prisma.note.findUnique({
      where: { id },
      select: { title: true, owner: { select: { name: true } } },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    await prisma.note.delete({ where: { id } });

    await logActivity(adminId, 'note_deleted', `Deleted note: ${note.title} (owner: ${note.owner.name})`);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get admin stats
router.get('/stats', async (req: AuthRequest, res: Response, next) => {
  try {
    const [totalUsers, totalNotes, recentActivity] = await Promise.all([
      prisma.user.count(),
      prisma.note.count(),
      prisma.activity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    res.json({
      totalUsers,
      totalNotes,
      recentActivity,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
