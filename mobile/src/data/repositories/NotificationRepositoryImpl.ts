import { NotificationService } from "@/data/datasources/NotificationRemoteDataSource";
import { mapNotificationDtoToEntity } from "@/data/mappers/notification.mapper";
import { INotificationRepository } from "@/domain/repositories/NotificationRepository";

export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(private readonly service = new NotificationService()) {}

  async list(params?: Record<string, unknown>) {
    const response = await this.service.list(params);
    return response.data.data.map(mapNotificationDtoToEntity);
  }
}

