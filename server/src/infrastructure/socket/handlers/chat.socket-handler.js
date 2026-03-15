import { SOCKET_EVENTS, SOCKET_ROOMS } from "../../../core/constants/socket-events.js";
import ChatService from "../../../modules/chat/chat.service.js";

const chatService = new ChatService();

function toSocketErrorPayload(error) {
  return {
    success: false,
    message: error?.message || "Socket operation failed"
  };
}

export function registerChatSocketHandlers(socket) {
  socket.on(SOCKET_EVENTS.chat.joinConversation, async (payload = {}, acknowledge = () => {}) => {
    try {
      const conversation = await chatService.joinConversation(
        socket.data.user.userId,
        payload.conversationId
      );

      socket.join(SOCKET_ROOMS.conversation(conversation.id));

      acknowledge({
        success: true,
        data: conversation
      });
    } catch (error) {
      acknowledge(toSocketErrorPayload(error));
    }
  });

  socket.on(SOCKET_EVENTS.chat.leaveConversation, (payload = {}, acknowledge = () => {}) => {
    if (payload.conversationId) {
      socket.leave(SOCKET_ROOMS.conversation(payload.conversationId));
    }

    acknowledge({
      success: true
    });
  });

  socket.on(SOCKET_EVENTS.chat.sendMessage, async (payload = {}, acknowledge = () => {}) => {
    try {
      const message = await chatService.sendMessage(
        socket.data.user.userId,
        payload.conversationId,
        payload
      );

      acknowledge({
        success: true,
        data: message
      });
    } catch (error) {
      acknowledge(toSocketErrorPayload(error));
    }
  });

  socket.on(SOCKET_EVENTS.chat.markSeen, async (payload = {}, acknowledge = () => {}) => {
    try {
      const result = await chatService.markMessageSeen(socket.data.user.userId, payload.messageId);
      acknowledge({
        success: true,
        data: result
      });
    } catch (error) {
      acknowledge(toSocketErrorPayload(error));
    }
  });
}
