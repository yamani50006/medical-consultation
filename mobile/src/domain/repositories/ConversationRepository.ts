import { ConversationEntity } from "@/domain/entities/Conversation";

export interface IConversationRepository {
  list(params?: Record<string, unknown>): Promise<ConversationEntity[]>;
}

