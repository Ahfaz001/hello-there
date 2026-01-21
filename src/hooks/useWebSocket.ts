import { useEffect, useRef, useCallback, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { WebSocketMessage } from '@/types';
import { WS_ENDPOINT } from '@/config/api';

interface UseWebSocketOptions {
  noteId: string;
  token: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface ConnectedUser {
  userId: string;
  userName: string;
  color: string;
}

export const useWebSocket = ({ noteId, token, onMessage, onConnect, onDisconnect }: UseWebSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  const stableColorForUser = useCallback((userId: string) => {
    // Deterministic HSL color from userId (no design tokens apply to arbitrary per-user colors)
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    const hue = hash % 360;
    return `hsl(${hue} 70% 45%)`;
  }, []);

  const connect = useCallback(() => {
    if (!noteId || !token) return;
    if (socketRef.current?.connected) return;

    // socket.io-client expects http(s) URL; normalize ws(s) URLs if provided
    const baseUrl = WS_ENDPOINT
      .replace(/^wss:\/\//i, 'https://')
      .replace(/^ws:\/\//i, 'http://');

    const socket = io(baseUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      onConnect?.();
      socket.emit('join-note', noteId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setConnectedUsers([]);
      onDisconnect?.();
    });

    socket.on('collaborators', (users: Array<{ userId: string; userName: string }>) => {
      setConnectedUsers(
        (users || []).map((u) => ({
          userId: u.userId,
          userName: u.userName,
          color: stableColorForUser(u.userId),
        }))
      );
    });

    socket.on('user-joined', (payload: any) => {
      const userId = payload?.userId ?? payload?.odl_userId;
      const userName = payload?.userName ?? payload?.odl_userName;
      if (!userId || !userName) return;
      setConnectedUsers((prev) => {
        if (prev.some((u) => u.userId === userId)) return prev;
        return [...prev, { userId, userName, color: stableColorForUser(userId) }];
      });
    });

    socket.on('user-left', (payload: any) => {
      const userId = payload?.userId ?? payload?.odl_userId;
      if (!userId) return;
      setConnectedUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    socket.on('note-updated', (data: any) => {
      const wsMessage: WebSocketMessage = {
        type: 'note_update',
        noteId: data?.noteId ?? noteId,
        userId: data?.updatedBy?.id ?? '',
        userName: data?.updatedBy?.name ?? '',
        payload: {
          title: data?.title ?? '',
          content: data?.content ?? '',
        },
        timestamp: new Date().toISOString(),
      };
      onMessage?.(wsMessage);
    });

    socket.on('collaborator-added', (data: any) => {
      const wsMessage: WebSocketMessage = {
        type: 'collaborator_added',
        noteId: data?.noteId ?? noteId,
        userId: data?.collaborator?.userId ?? '',
        userName: data?.collaborator?.userName ?? '',
        payload: data,
        timestamp: new Date().toISOString(),
      };
      onMessage?.(wsMessage);
    });

    socket.on('collaborator-removed', (data: any) => {
      const wsMessage: WebSocketMessage = {
        type: 'collaborator_removed',
        noteId: data?.noteId ?? noteId,
        userId: data?.userId ?? '',
        userName: '',
        payload: data,
        timestamp: new Date().toISOString(),
      };
      onMessage?.(wsMessage);
    });

    socket.on('connect_error', (err) => {
      // Common when token invalid or CORS misconfigured
      console.error('Realtime connection error:', err?.message || err);
    });
  }, [noteId, token, onMessage, onConnect, onDisconnect, stableColorForUser]);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('leave-note', noteId);
    socket.removeAllListeners();
    socket.disconnect();
    socketRef.current = null;
  }, [noteId]);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    if (message.type === 'note_update') {
      const payload = message.payload as { title?: string; content?: string };
      socket.emit('note-update', {
        noteId: message.noteId,
        title: payload?.title,
        content: payload?.content,
      });
      return;
    }

    if (message.type === 'cursor_position') {
      const payload = message.payload as { position: number };
      socket.emit('cursor-move', { noteId: message.noteId, position: payload?.position ?? 0 });
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    connectedUsers,
    sendMessage,
    disconnect,
  };
};
