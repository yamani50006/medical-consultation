import { INotificationRepository } from "@/domain/repositories/NotificationRepository";

export class ListNotificationsUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(params?: Record<string, unknown>) {
    return this.repository.list(params);
  }
}

