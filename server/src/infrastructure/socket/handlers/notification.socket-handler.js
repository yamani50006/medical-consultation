import { SOCKET_EVENTS } from "../../../core/constants/socket-events.js";
import NotificationsService from "../../../modules/notifications/notifications.service.js";

const notificationsService = new NotificationsService();

function toSocketErrorPayload(error) {
  return {
    success: false,
    message: error?.message || "Socket operation failed"
  };
}

export function registerNotificationSocketHandlers(socket) {
  socket.on(SOCKET_EVENTS.notification.markRead, async (payload = {}, acknowledge = () => {}) => {
    try {
      const notification = await notificationsService.markAsRead(
        socket.data.user.userId,
        payload.notificationId
      );

      acknowledge({
        success: true,
        data: notification
      });
    } catch (error) {
      acknowledge(toSocketErrorPayload(error));
    }
  });
}
