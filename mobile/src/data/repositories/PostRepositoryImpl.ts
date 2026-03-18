import { PostService } from "@/data/datasources/PostRemoteDataSource";
import { mapPostDtoToEntity } from "@/data/mappers/post.mapper";
import { IPostRepository } from "@/domain/repositories/PostRepository";

export class PostRepositoryImpl implements IPostRepository {
  constructor(private readonly service = new PostService()) {}

  async list(params?: Record<string, unknown>) {
    const response = await this.service.list(params);
    return response.data.data.map(mapPostDtoToEntity);
  }
}

