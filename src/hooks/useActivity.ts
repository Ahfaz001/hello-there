import { useQuery } from '@tanstack/react-query';
import { ActivityLog } from '@/types';
import { API_ENDPOINTS, fetchWithAuth } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

export const useActivity = (limit = 20) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['activity', limit],
    queryFn: () => fetchWithAuth<{ activities: ActivityLog[] }>(`${API_ENDPOINTS.ACTIVITY}?limit=${limit}`, token!),
    enabled: !!token,
    select: (data) => data.activities,
  });
};

export const useNoteActivity = (noteId: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['activity', 'note', noteId],
    queryFn: () => fetchWithAuth<{ activities: ActivityLog[] }>(API_ENDPOINTS.NOTE_ACTIVITY(noteId), token!),
    enabled: !!token && !!noteId,
    select: (data) => data.activities,
  });
};
