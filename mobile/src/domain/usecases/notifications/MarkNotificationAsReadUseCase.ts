import { INotificationRepository } from "@/domain/repositories/NotificationRepository";

export class MarkNotificationAsReadUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(id: string) {
    return this.repository.markAsRead(id);
  }
}
