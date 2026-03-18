import { IPostRepository } from "@/domain/repositories/PostRepository";

export class ListPostsUseCase {
  constructor(private readonly repository: IPostRepository) {}

  execute(params?: Record<string, unknown>) {
    return this.repository.list(params);
  }
}

