import { INotificationRepository } from "@/domain/repositories/NotificationRepository";

export class MarkAllNotificationsAsReadUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute() {
    return this.repository.markAllAsRead();
  }
}
