import { io } from "socket.io-client";
import { API_ORIGIN } from "../../api/axios";
import { SOCKET_EVENTS } from "./socket-events";

class SocketClient {
  constructor() {
    this.socket = null;
    this.currentToken = null;
  }

  connect(token) {
    if (!token) {
      return null;
    }

    if (this.socket && this.currentToken === token) {
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    this.disconnect();
    this.currentToken = token;
    this.socket = io(API_ORIGIN, {
      autoConnect: false,
      auth: {
        token
      },
      transports: ["websocket", "polling"]
    });
    this.socket.connect();
    return this.socket;
  }

  disconnect() {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.currentToken = null;
  }

  isConnected() {
    return Boolean(this.socket?.connected);
  }

  on(event, handler) {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on(event, handler);
    return () => {
      this.socket?.off(event, handler);
    };
  }

  async emitWithAck(event, payload, timeout = 8000) {
    if (!this.socket?.connected) {
      return null;
    }

    return new Promise((resolve, reject) => {
      this.socket.timeout(timeout).emit(event, payload, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(response);
      });
    });
  }

  joinConversation(conversationId) {
    return this.emitWithAck(SOCKET_EVENTS.chat.joinConversation, {
      conversationId
    });
  }

  leaveConversation(conversationId) {
    return this.emitWithAck(SOCKET_EVENTS.chat.leaveConversation, {
      conversationId
    });
  }

  sendMessage(payload) {
    return this.emitWithAck(SOCKET_EVENTS.chat.sendMessage, payload);
  }

  markMessageSeen(messageId) {
    return this.emitWithAck(SOCKET_EVENTS.chat.markSeen, {
      messageId
    });
  }

  markNotificationRead(notificationId) {
    return this.emitWithAck(SOCKET_EVENTS.notification.markRead, {
      notificationId
    });
  }
}

export default new SocketClient();
