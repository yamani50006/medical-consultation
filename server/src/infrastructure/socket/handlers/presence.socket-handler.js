import { SOCKET_EVENTS } from "../../../core/constants/socket-events.js";
import { socketPresenceStatusSchema } from "../../../modules/presence/presence.validator.js";
import PresenceService from "../../../modules/presence/presence.service.js";
import { getUserSocketCount } from "../socketState.js";

const presenceService = new PresenceService();

function toSocketErrorPayload(error) {
  return {
    success: false,
    message: error?.message || "Socket operation failed"
  };
}

export function registerPresenceSocketHandlers(socket) {
  socket.on(SOCKET_EVENTS.presence.updateStatus, async (payload = {}, acknowledge = () => {}) => {
    try {
      const parsedPayload = socketPresenceStatusSchema.parse(payload);
      const presence = await presenceService.updateStatus(
        socket.data.user.userId,
        parsedPayload.status,
        getUserSocketCount(socket.data.user.userId)
      );

      acknowledge({
        success: true,
        data: presence
      });
    } catch (error) {
      acknowledge(toSocketErrorPayload(error));
    }
  });
}
