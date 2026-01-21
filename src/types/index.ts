export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  collaborators: Collaborator[];
  shareLink?: string;
  isPublic: boolean;
}

export interface Collaborator {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'editor' | 'viewer';
  addedAt: string;
}

export interface ActivityLog {
  id: string;
  noteId: string;
  noteTitle: string;
  userId: string;
  userName: string;
  action: 'created' | 'updated' | 'deleted' | 'shared' | 'viewed' | 'collaborator_added' | 'collaborator_removed';
  details?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WebSocketMessage {
  type: 'note_update' | 'cursor_position' | 'user_joined' | 'user_left' | 'typing' | 'collaborator_added' | 'collaborator_removed';
  noteId: string;
  userId: string;
  userName: string;
  payload: unknown;
  timestamp: string;
}

export interface NoteUpdate {
  content: string;
  title: string;
  version: number;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  position: number;
  color: string;
}
