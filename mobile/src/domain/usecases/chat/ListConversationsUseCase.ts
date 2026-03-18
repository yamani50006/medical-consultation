import { IConversationRepository } from "@/domain/repositories/ConversationRepository";

export class ListConversationsUseCase {
  constructor(private readonly repository: IConversationRepository) {}

  execute(params?: Record<string, unknown>) {
    return this.repository.list(params);
  }
}

