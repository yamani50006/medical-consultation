import { ApiResponse } from "@/core/network/api-types";
import { BaseApiService } from "@/core/network/BaseApiService";
import { api } from "@/core/network/httpClient";
import { NotificationDto } from "@/data/dtos/notification.dto";

export class NotificationService extends BaseApiService {
  constructor() {
    super(api);
  }

  list(params?: Record<string, unknown>) {
    return this.get<ApiResponse<NotificationDto[]>>("/notifications", { params });
  }
}

