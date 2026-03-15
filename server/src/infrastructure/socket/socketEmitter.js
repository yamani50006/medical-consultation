import { SOCKET_ROOMS } from "../../core/constants/socket-events.js";

let ioInstance = null;

export function setSocketServer(io) {
  ioInstance = io;
}

export function getSocketServer() {
  return ioInstance;
}

export function emitToUser(userId, eventName, payload) {
  if (!ioInstance || !userId) {
    return;
  }

  ioInstance.to(SOCKET_ROOMS.user(userId)).emit(eventName, payload);
}

export function emitToConversation(conversationId, eventName, payload) {
  if (!ioInstance || !conversationId) {
    return;
  }

  ioInstance.to(SOCKET_ROOMS.conversation(conversationId)).emit(eventName, payload);
}

export function emitToAllUsers(eventName, payload) {
  ioInstance?.emit(eventName, payload);
}
