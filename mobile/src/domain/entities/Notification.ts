export type NotificationEntity = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  conversationId?: string | null;
  entityId?: string | null;
  entityType?: string | null;
};
