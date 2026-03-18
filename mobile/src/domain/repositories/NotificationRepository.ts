import { NotificationEntity } from "@/domain/entities/Notification";

export interface INotificationRepository {
  list(params?: Record<string, unknown>): Promise<NotificationEntity[]>;
}

