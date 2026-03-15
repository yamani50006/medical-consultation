export const SOCKET_EVENTS = {
  connectionReady: "connection:ready",
  chat: {
    joinConversation: "chat:join_conversation",
    leaveConversation: "chat:leave_conversation",
    sendMessage: "chat:send_message",
    markSeen: "chat:mark_seen",
    newMessage: "chat:new_message",
    messageDelivered: "chat:message_delivered",
    messageSeen: "chat:message_seen"
  },
  conversation: {
    updated: "conversation:updated"
  },
  notification: {
    new: "notification:new",
    updated: "notification:updated",
    markRead: "notification:mark_read"
  },
  presence: {
    updateStatus: "presence:update_status",
    changed: "presence:changed"
  }
};
