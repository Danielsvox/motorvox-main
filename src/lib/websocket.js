import EventEmitter from 'events';
import { WS_BASE_URL } from '@/config/api';

class WebSocketClient extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.lastPingTime = null;
    this.pingInterval = null;
  }

  connect(token) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    console.log('Connecting to WebSocket...');

    try {
      this.ws = new WebSocket(`${WS_BASE_URL}/ws/messaging/?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');

        this.startPingInterval();
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected');

        this.clearPingInterval();

        this.attemptReconnect(token);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          if (data.type === 'pong') {
            this.lastPingTime = Date.now();
            return;
          }

          this.emit('message', data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      this.emit('error', error);
    }
  }

  startPingInterval() {
    this.clearPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  clearPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting to reconnect in ${timeout}ms...`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(token);
    }, timeout);
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
      throw new Error('WebSocket is not connected');
    }
  }

  disconnect() {
    this.clearPingInterval();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  startConversation(sellerId, carId) {
    this.send({
      type: 'start_conversation',
      seller_id: sellerId,
      car_id: carId
    });
  }

  sendTypingIndicator(conversationId, isTyping) {
    this.send({
      type: 'typing_status',
      conversation_id: conversationId,
      is_typing: isTyping
    });
  }

  markMessagesAsRead(conversationId, messageIds) {
    this.send({
      type: 'mark_read',
      conversation_id: conversationId,
      message_ids: messageIds
    });
  }
}

export const wsClient = new WebSocketClient(); 