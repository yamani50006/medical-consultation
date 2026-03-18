import { ApiResponse } from "@/core/network/api-types";
import { BaseApiService } from "@/core/network/BaseApiService";
import { api } from "@/core/network/httpClient";
import { PostDto } from "@/data/dtos/post.dto";

export class PostService extends BaseApiService {
  constructor() {
    super(api);
  }

  list(params?: Record<string, unknown>) {
    return this.get<ApiResponse<PostDto[]>>("/posts", { params });
  }
}

