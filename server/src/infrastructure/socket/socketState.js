const userSocketMap = new Map();

export function registerUserSocket(userId, socketId) {
  const currentSockets = userSocketMap.get(userId) || new Set();
  currentSockets.add(socketId);
  userSocketMap.set(userId, currentSockets);
  return currentSockets.size;
}

export function unregisterUserSocket(userId, socketId) {
  const currentSockets = userSocketMap.get(userId);

  if (!currentSockets) {
    return 0;
  }

  currentSockets.delete(socketId);

  if (currentSockets.size === 0) {
    userSocketMap.delete(userId);
    return 0;
  }

  userSocketMap.set(userId, currentSockets);
  return currentSockets.size;
}

export function getUserSocketCount(userId) {
  return userSocketMap.get(userId)?.size || 0;
}

export function isUserOnline(userId) {
  return getUserSocketCount(userId) > 0;
}
