export function mapNotification(notification) {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    entityType: notification.entityType,
    entityId: notification.entityId,
    conversationId: notification.conversationId,
    messageId: notification.messageId,
    metadata: notification.metadata || null
  };
}
