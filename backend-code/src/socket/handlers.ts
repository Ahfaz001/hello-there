import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
  userRole?: string;
}

// Track active collaborators per note
const noteCollaborators = new Map<string, Set<{ socketId: string; userId: string; userName: string }>>();

export function setupSocketHandlers(io: Server): void {
  // Middleware to authenticate socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret'
      ) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, role: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userName = user.name;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userName} (${socket.id})`);

    // Join a note room for collaboration
    socket.on('join-note', async (noteId: string) => {
      try {
        // Verify user has access to the note (owner, collaborator, or admin)
        const note = await prisma.note.findFirst({
          where: {
            id: noteId,
            ...(socket.userRole === 'admin'
              ? {}
              : {
                  OR: [
                    { ownerId: socket.userId! },
                    { collaborators: { some: { userId: socket.userId! } } },
                  ],
                }),
          },
          select: { id: true },
        });

        if (!note) {
          socket.emit('error', { message: 'Note not found' });
          return;
        }

        // Join the room
        socket.join(`note:${noteId}`);

        // Track collaborator
        if (!noteCollaborators.has(noteId)) {
          noteCollaborators.set(noteId, new Set());
        }

        // Remove old entry for same user if exists
        const existingCollabs = noteCollaborators.get(noteId)!;
        existingCollabs.forEach((c) => {
          if (c.userId === socket.userId) {
            existingCollabs.delete(c);
          }
        });

        noteCollaborators.get(noteId)!.add({ socketId: socket.id, userId: socket.userId!, userName: socket.userName! });

        // Notify others in the room
        socket.to(`note:${noteId}`).emit('user-joined', {
          userId: socket.userId,
          userName: socket.userName,
        });

        // Send current collaborators to the joining user
        const collaborators = Array.from(noteCollaborators.get(noteId)!).map((c) => ({ userId: c.userId, userName: c.userName }));

        socket.emit('collaborators', collaborators);

        console.log(`${socket.userName} joined note:${noteId}`);
      } catch (error) {
        console.error('Error joining note:', error);
        socket.emit('error', { message: 'Failed to join note' });
      }
    });

    // Leave a note room
    socket.on('leave-note', (noteId: string) => {
      socket.leave(`note:${noteId}`);

      // Remove from collaborators
      const collabs = noteCollaborators.get(noteId);
      if (collabs) {
        collabs.forEach((c) => {
          if (c.socketId === socket.id) {
            collabs.delete(c);
          }
        });

        if (collabs.size === 0) {
          noteCollaborators.delete(noteId);
        }
      }

      // Notify others
      socket.to(`note:${noteId}`).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName,
      });

      console.log(`${socket.userName} left note:${noteId}`);
    });

    // Handle real-time note updates
    socket.on('note-update', async (data: { noteId: string; content?: string; title?: string }) => {
      try {
        const { noteId, content, title } = data;

        // Verify access and update
        const note = await prisma.note.findUnique({
          where: { id: noteId },
        });

        if (!note) {
          socket.emit('error', { message: 'Note not found' });
          return;
        }

        // Update the note
        const updatedNote = await prisma.note.update({
          where: { id: noteId },
          data: {
            ...(content !== undefined && { content }),
            ...(title !== undefined && { title }),
          },
        });

        // Broadcast to all other users in the room
        socket.to(`note:${noteId}`).emit('note-updated', {
          noteId,
          content: updatedNote.content,
          title: updatedNote.title,
          updatedBy: {
            id: socket.userId,
            name: socket.userName,
          },
        });
      } catch (error) {
        console.error('Error updating note:', error);
        socket.emit('error', { message: 'Failed to update note' });
      }
    });

    // Handle cursor position for collaborative editing
    socket.on('cursor-move', (data: { noteId: string; position: number }) => {
      socket.to(`note:${data.noteId}`).emit('cursor-updated', {
        userId: socket.userId,
        userName: socket.userName,
        position: data.position,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userName}`);

      // Remove from all note collaborator lists
      noteCollaborators.forEach((collabs, noteId) => {
        collabs.forEach((c) => {
          if (c.socketId === socket.id) {
            collabs.delete(c);

            // Notify others
            io.to(`note:${noteId}`).emit('user-left', {
              userId: socket.userId,
              userName: socket.userName,
            });
          }
        });

        if (collabs.size === 0) {
          noteCollaborators.delete(noteId);
        }
      });
    });
  });
}
