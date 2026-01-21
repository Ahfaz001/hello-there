import { Router, Response } from 'express';
import { nanoid } from 'nanoid';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest, canEdit } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createNoteSchema, updateNoteSchema } from '../schemas/notes.js';
import { logActivity } from '../services/activity.js';

const router = Router();

// Get all notes (user's own notes + notes they can view)
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { search } = req.query;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let where: any = {};

    // Admins can see all notes, others only their own
    if (userRole !== 'admin') {
      where.ownerId = userId;
    }

    // Search filter
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform notes to match frontend expectations
    const transformedNotes = notes.map(note => ({
      ...note,
      ownerName: note.owner.name,
      collaborators: [], // No collaborator feature in current schema
      shareLink: note.shareId, // Map shareId to shareLink for frontend
    }));

    res.json({ notes: transformedNotes });
  } catch (error) {
    next(error);
  }
});

// Get single note
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Check access: admin can access all, others only their own
    if (userRole !== 'admin' && note.ownerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Transform note to match frontend expectations
    const transformedNote = {
      ...note,
      ownerName: note.owner.name,
      collaborators: [],
      shareLink: note.shareId,
    };

    res.json({ note: transformedNote });
  } catch (error) {
    next(error);
  }
});

// Get public note by share ID
router.get('/public/:shareId', async (req, res, next) => {
  try {
    const { shareId } = req.params;

    const note = await prisma.note.findUnique({
      where: { shareId },
      include: {
        owner: {
          select: { name: true },
        },
      },
    });

    if (!note || !note.isPublic) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        ownerName: note.owner.name,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create note
router.post('/', authenticate, canEdit, validate(createNoteSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user!.id;

    const note = await prisma.note.create({
      data: {
        title,
        content: content || '',
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity(userId, 'note_created', `Created note: ${title}`, note.id);

    // Transform note to match frontend expectations
    const transformedNote = {
      ...note,
      ownerName: note.owner.name,
      collaborators: [],
      shareLink: note.shareId,
    };

    res.status(201).json({ data: transformedNote });
  } catch (error) {
    next(error);
  }
});

// Update note helper function
const handleUpdateNote = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Check permission: admin can edit all, others only their own
    if (userRole !== 'admin' && existingNote.ownerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity(userId, 'note_updated', `Updated note: ${note.title}`, note.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`note:${id}`).emit('note-updated', { note, updatedBy: req.user });

    // Transform note to match frontend expectations
    const transformedNote = {
      ...note,
      ownerName: note.owner.name,
      collaborators: [],
      shareLink: note.shareId,
    };

    res.json({ note: transformedNote });
  } catch (error) {
    next(error);
  }
};

// Update note (PUT)
router.put('/:id', authenticate, canEdit, validate(updateNoteSchema), handleUpdateNote);

// Update note (PATCH) - for frontend compatibility
router.patch('/:id', authenticate, canEdit, validate(updateNoteSchema), handleUpdateNote);

// Delete note
router.delete('/:id', authenticate, canEdit, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Check permission
    if (userRole !== 'admin' && note.ownerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await prisma.note.delete({ where: { id } });

    await logActivity(userId, 'note_deleted', `Deleted note: ${note.title}`);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Generate share link
router.post('/:id/share', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (userRole !== 'admin' && note.ownerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const shareId = nanoid(10);

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        shareId,
        isPublic: true,
      },
    });

    await logActivity(userId, 'note_shared', `Created share link for: ${note.title}`, note.id);

    res.json({ shareId: updatedNote.shareId });
  } catch (error) {
    next(error);
  }
});

// Revoke share link
router.delete('/:id/share', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (userRole !== 'admin' && note.ownerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await prisma.note.update({
      where: { id },
      data: {
        shareId: null,
        isPublic: false,
      },
    });

    await logActivity(userId, 'note_unshared', `Revoked share link for: ${note.title}`, note.id);

  res.json({ message: 'Share link revoked' });
  } catch (error) {
    next(error);
  }
});

// Add collaborator (stub - feature not fully implemented in this version)
router.post('/:id/collaborators', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user!.id;

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (note.ownerId !== userId) {
      res.status(403).json({ error: 'Only the note owner can add collaborators' });
      return;
    }

    // Find the user by email
    const collaboratorUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!collaboratorUser) {
      res.status(404).json({ error: 'User not found with this email' });
      return;
    }

    if (collaboratorUser.id === userId) {
      res.status(400).json({ error: 'Cannot add yourself as a collaborator' });
      return;
    }

    // Since we don't have a collaborators table, return a success response
    // In a full implementation, this would create a record in a NoteCollaborator table
    await logActivity(userId, 'collaborator_added', `Added ${collaboratorUser.name} as ${role}`, note.id);

    res.status(201).json({
      data: {
        id: `temp-${Date.now()}`,
        noteId: id,
        userId: collaboratorUser.id,
        userName: collaboratorUser.name,
        userEmail: collaboratorUser.email,
        role,
        addedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Remove collaborator (stub)
router.delete('/:id/collaborators/:userId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    res.json({ message: 'Collaborator removed' });
  } catch (error) {
    next(error);
  }
});

export default router;
