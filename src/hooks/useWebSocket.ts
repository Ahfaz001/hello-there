import { useEffect, useRef, useCallback, useState } from 'react';
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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_ENDPOINT}?token=${token}&noteId=${noteId}`);

    ws.onopen = () => {
      setIsConnected(true);
      onConnect?.();
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'user_joined') {
          const payload = message.payload as ConnectedUser;
          setConnectedUsers(prev => {
            if (prev.some(u => u.userId === payload.userId)) return prev;
            return [...prev, payload];
          });
        } else if (message.type === 'user_left') {
          const payload = message.payload as { userId: string };
          setConnectedUsers(prev => prev.filter(u => u.userId !== payload.userId));
        }
        
        onMessage?.(message);
      } catch (error) {
        // Handle Socket.io-style events from backend (collaborator-added, collaborator-removed, note-updated)
        try {
          const data = JSON.parse(event.data);
          // Convert backend Socket.io events to WebSocketMessage format
          if (data.collaborator || data.userId) {
            const eventType = data.collaborator ? 'collaborator_added' : 'collaborator_removed';
            const wsMessage: WebSocketMessage = {
              type: eventType,
              noteId: data.noteId || noteId,
              userId: data.collaborator?.userId || data.userId || '',
              userName: data.collaborator?.userName || '',
              payload: data,
              timestamp: new Date().toISOString(),
            };
            onMessage?.(wsMessage);
          }
        } catch {
          console.error('Failed to parse WebSocket message:', error);
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConnectedUsers([]);
      onDisconnect?.();
      
      // Attempt reconnection
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, [noteId, token, onMessage, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
      }));
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
