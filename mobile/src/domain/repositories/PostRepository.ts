import { PostEntity } from "@/domain/entities/Post";

export interface IPostRepository {
  list(params?: Record<string, unknown>): Promise<PostEntity[]>;
}

