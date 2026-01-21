const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hello-there-production-4348.up.railway.app/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://hello-there-production-4348.up.railway.app';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  
  // Notes
  NOTES: `${API_BASE_URL}/notes`,
  NOTE: (id: string) => `${API_BASE_URL}/notes/${id}`,
  NOTE_SHARE: (id: string) => `${API_BASE_URL}/notes/${id}/share`,
  NOTE_COLLABORATORS: (id: string) => `${API_BASE_URL}/notes/${id}/collaborators`,
  NOTE_COLLABORATOR: (noteId: string, userId: string) => `${API_BASE_URL}/notes/${noteId}/collaborators/${userId}`,
  PUBLIC_NOTE: (shareId: string) => `${API_BASE_URL}/notes/public/${shareId}`,
  
  // Search
  SEARCH: `${API_BASE_URL}/search`,
  
  // Activity
  ACTIVITY: `${API_BASE_URL}/activity`,
  NOTE_ACTIVITY: (noteId: string) => `${API_BASE_URL}/activity/note/${noteId}`,
  
  // Admin
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_USER: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
};

export const WS_ENDPOINT = WS_URL;

export const getAuthHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const fetchWithAuth = async <T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = (error as any)?.message || (error as any)?.error || 'Request failed';
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
};
