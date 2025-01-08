import { log, error } from '@/utils/logger';

export function createWebSocket(url: string, protocols?: string | string[]): WebSocket {
  let ws: WebSocket;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  function connect() {
    ws = new WebSocket(url, protocols);
    
    ws.onopen = () => {
      log('WebSocket connected:', url);
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };
    
    ws.onclose = (event) => {
      log('WebSocket closed:', url, 'Code:', event.code, 'Reason:', event.reason);
      attemptReconnect();
    };
    
    ws.onerror = (event) => {
      error('WebSocket error:', url, event);
      // The error event doesn't provide much information, so we'll log what we can
      if (event instanceof ErrorEvent) {
        error('Error message:', event.message);
      }
    };

    return ws;
  }

  function attemptReconnect() {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
      setTimeout(() => {
        connect();
      }, reconnectDelay);
    } else {
      error('Max reconnection attempts reached. Please check your connection and try again later.');
    }
  }

  return connect();
}

