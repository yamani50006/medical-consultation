import { ApiResponse } from "@/core/network/api-types";
import { BaseApiService } from "@/core/network/BaseApiService";
import { api } from "@/core/network/httpClient";
import { ConversationDto } from "@/data/dtos/chat.dto";

export class ChatService extends BaseApiService {
  constructor() {
    super(api);
  }

  listConversations(params?: Record<string, unknown>) {
    return this.get<ApiResponse<ConversationDto[]>>("/conversations", { params });
  }
}

