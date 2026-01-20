import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, ApiResponse, Collaborator } from '@/types';
import { API_ENDPOINTS, fetchWithAuth } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

export const useNotes = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['notes'],
    queryFn: () => fetchWithAuth<{ notes: Note[] }>(API_ENDPOINTS.NOTES, token!),
    enabled: !!token,
    select: (data) => data.notes,
  });
};

export const useNote = (noteId: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['notes', noteId],
    queryFn: () => fetchWithAuth<{ note: Note }>(API_ENDPOINTS.NOTE(noteId), token!),
    enabled: !!token && !!noteId,
    select: (data) => data.note,
  });
};

export const usePublicNote = (shareId: string) => {
  return useQuery({
    queryKey: ['public-note', shareId],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.PUBLIC_NOTE(shareId));
      if (!response.ok) throw new Error('Note not found');
      return response.json() as Promise<{ note: Note }>;
    },
    enabled: !!shareId,
    select: (data) => data.note,
  });
};

export const useCreateNote = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      fetchWithAuth<ApiResponse<Note>>(API_ENDPOINTS.NOTES, token!, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

export const useUpdateNote = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: { title?: string; content?: string } }) =>
      fetchWithAuth<ApiResponse<Note>>(API_ENDPOINTS.NOTE(noteId), token!, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', noteId] });
    },
  });
};

export const useDeleteNote = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) =>
      fetchWithAuth<ApiResponse<void>>(API_ENDPOINTS.NOTE(noteId), token!, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

export const useShareNote = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, isPublic }: { noteId: string; isPublic: boolean }) =>
      fetchWithAuth<ApiResponse<{ shareLink: string }>>(API_ENDPOINTS.NOTE_SHARE(noteId), token!, {
        method: 'POST',
        body: JSON.stringify({ isPublic }),
      }),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: ['notes', noteId] });
    },
  });
};

export const useAddCollaborator = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, email, role }: { noteId: string; email: string; role: 'editor' | 'viewer' }) =>
      fetchWithAuth<ApiResponse<Collaborator>>(API_ENDPOINTS.NOTE_COLLABORATORS(noteId), token!, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      }),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: ['notes', noteId] });
    },
  });
};

export const useRemoveCollaborator = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, userId }: { noteId: string; userId: string }) =>
      fetchWithAuth<ApiResponse<void>>(API_ENDPOINTS.NOTE_COLLABORATOR(noteId, userId), token!, {
        method: 'DELETE',
      }),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: ['notes', noteId] });
    },
  });
};

export const useSearchNotes = (query: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchWithAuth<{ notes: Note[] }>(`${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`, token!),
    enabled: !!token && query.length >= 2,
    select: (data) => data.notes,
  });
};
