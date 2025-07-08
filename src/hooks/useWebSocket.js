import { useState, useEffect, useCallback, useRef } from 'react';

export const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectDelay = 5000;

  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Create new WebSocket connection with auth token
      const ws = new WebSocket(`${url}?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        // Reset reconnect timeout on successful connection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        // Attempt to reconnect unless explicitly closed
        if (!ws.closeIntentionally) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, Math.min(1000 + Math.random() * 4000, maxReconnectDelay));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError(err.message);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.closeIntentionally = true;
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const addMessageListener = useCallback((callback) => {
    if (wsRef.current) {
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    sendMessage,
    addMessageListener,
    connect,
    disconnect
  };
}; 