import { Server } from "socket.io";
import { SOCKET_EVENTS, SOCKET_ROOMS } from "../../core/constants/socket-events.js";
import PresenceService from "../../modules/presence/presence.service.js";
import { registerChatSocketHandlers } from "./handlers/chat.socket-handler.js";
import { registerNotificationSocketHandlers } from "./handlers/notification.socket-handler.js";
import { registerPresenceSocketHandlers } from "./handlers/presence.socket-handler.js";
import { setSocketServer } from "./socketEmitter.js";
import { socketAuthMiddleware } from "./socketAuth.middleware.js";
import { registerUserSocket, unregisterUserSocket } from "./socketState.js";

const presenceService = new PresenceService();

export async function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  setSocketServer(io);
  try {
    await presenceService.resetAllOffline();
  } catch (error) {
    console.warn("Presence reset skipped during socket bootstrap.", error?.message || error);
  }

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    const { userId } = socket.data.user;
    const socketCount = registerUserSocket(userId, socket.id);

    socket.join(SOCKET_ROOMS.user(userId));
    const presence = await presenceService.handleUserConnected(userId, socketCount);

    socket.emit(SOCKET_EVENTS.connectionReady, {
      success: true,
      data: {
        userId,
        presence
      }
    });

    registerChatSocketHandlers(socket);
    registerNotificationSocketHandlers(socket);
    registerPresenceSocketHandlers(socket);

    socket.on("disconnect", async () => {
      const remainingSockets = unregisterUserSocket(userId, socket.id);
      await presenceService.handleUserDisconnected(userId, remainingSockets);
    });
  });

  return io;
}
