import { prisma } from '../lib/prisma.js';

export async function logActivity(
  userId: string,
  action: string,
  details?: string,
  noteId?: string
): Promise<void> {
  try {
    await prisma.activity.create({
      data: {
        userId,
        action,
        details,
        noteId,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - activity logging should not break the main flow
  }
}
