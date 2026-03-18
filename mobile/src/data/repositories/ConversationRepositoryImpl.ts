import { ChatService } from "@/data/datasources/ChatRemoteDataSource";
import { mapConversationDtoToEntity } from "@/data/mappers/chat.mapper";
import { IConversationRepository } from "@/domain/repositories/ConversationRepository";

export class ConversationRepositoryImpl implements IConversationRepository {
  constructor(private readonly service = new ChatService()) {}

  async list(params?: Record<string, unknown>) {
    const response = await this.service.listConversations(params);
    return response.data.data.map(mapConversationDtoToEntity);
  }
}

