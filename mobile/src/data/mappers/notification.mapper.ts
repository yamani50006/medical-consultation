import { NotificationDto } from "@/data/dtos/notification.dto";
import { NotificationEntity } from "@/domain/entities/Notification";

export const mapNotificationDtoToEntity = (dto: NotificationDto): NotificationEntity => ({
  id: dto.id,
  type: dto.type,
  title: dto.title,
  message: dto.message,
  isRead: dto.isRead,
  createdAt: dto.createdAt,
  conversationId: dto.conversationId,
  entityId: dto.entityId
});

